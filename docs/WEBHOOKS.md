# Paystack Webhook Handling

## 1. Overview

Paystack delivers server-to-server notifications for transaction events. The church platform exposes one endpoint:

```
POST /api/v1/webhooks/paystack
```

Webhooks are the **only** source that may transition a payment to `successful`. This endpoint must be fast, idempotent and never leak internals.

---

## 2. Security: Signature Verification (mandatory)

Every request must carry:

```
x-paystack-signature: <hex>
```

Verification algorithm (constant-time compare):

```
1. Read the RAW request body (exact bytes — no JSON re-parse).
2. computed = HMAC-SHA512(raw_body, PAYSTACK_SECRET_KEY)  → hex digest
3. Accept iff timingSafeEqual(computed, signed_header)
```

**Failures:** log (module=webhooks, reason=bad_signature, ip), return `401`. No business logic runs.

**Additional hardening:**
- IP allowlist (Paystack's published webhook IP ranges) as defense-in-depth (config flag).
- Dedicated rate limit (high, but bounded); no interaction with user rate limits.
- Body size cap (e.g. 256 KB).
- TLS mandatory (Cloudflare + origin HTTPS).

---

## 3. Idempotency & Duplicate Prevention

Two-layer protection:

### Layer 1 — Unique gateway reference
`payments.paystack_reference` has a **unique index**. The first webhook to touch a transaction creates/updates the linkage; a second webhook carrying the same reference finds the row and is processed through the state machine, which is a **no-op** if the target state is already terminal.

### Layer 2 — Event ID ledger
Each payment row keeps `webhook_events` (jsonb array). Webhook event IDs seen before are acknowledged without re-processing.

### Concurrency
The payment row is locked with `SELECT … FOR UPDATE` inside the processing transaction:

```
BEGIN;
SELECT * FROM payments WHERE paystack_reference = $ref FOR UPDATE;
IF row missing   → log unknown_reference, ack 200 (idempotent);
IF terminal      → append event_id, COMMIT, ack 200;
IF pending       → re-verify amount/status → transition → enqueue side effects → COMMIT → ack 200;
COMMIT;
```

A concurrent duplicate webhook blocks on the row lock until the first commits, then observes the terminal state and becomes a no-op.

---

## 4. Event Handling Matrix

| Event | Handling |
|---|---|
| `charge.success` | Verify `data.status == "success"`, `data.currency == GHS`, `data.amount == payments.amount`. If all good → `pending → successful`; run side effects (camp confirm, donation record, notifications). Amount mismatch → mark `flagged` (fields in payload JSON), log, Sentry alert, DO NOT transition, ack 200. |
| `charge.failed` | If pending → `failed`. ack 200. |
| `charge.pending` | Informational; leave `pending`; update gateway payload. ack 200. |
| `charge.abandoned` | Informational; if pending leave `pending` (reconciliation may still resolve). ack 200. |
| Unknown event type | Log + ack 200 (Paystack expects acknowledgement). |

---

## 5. Side Effects After Successful Payment

Enqueued **after** the DB transaction commits (never before):

1. Camp: `camp_registrations.registration_status = confirmed`, decrement accommodation spaces (`spaces_remaining` conditional update), enqueue:
   - confirmation email
   - in-app notification
   - QR code generation (if not already generated)
2. Giving: insert `donations` row (what the payment claims), enqueue receipt email.
3. Analytics counter increments (async).

---

## 6. Response Contract

- Always respond fast. Success/duplicate/ack-non-transitional → `200` with `{ "status": "ok" }`.
- Signature failure → `401`.
- Unexpected internal error → log + `500` (Paystack will retry with backoff; idempotency makes retries safe).
- **Never** 4xx a valid signed event for business validation failures (unknown ref, amount mismatch) — ack 200 to avoid noisy retries, but alert loudly internally.

---

## 7. Local Development & Testing

- Paystack test keys + webhook forwarding via a tunnel tool (e.g. ngrok / Cloudflare Tunnel / `stripe-style` local receiver).
- Webhook fixtures in `packages/database/seed`/test fixtures cover every row of the matrix above.
- `PAYSTACK_WEBHOOK_SECRET` must match the test dashboard secret.

Test checklist (docs/TESTING.md §payments): success, failed, pending, duplicate event id, duplicate payment ref, forged signature, wrong amount, unknown ref, already-processed, concurrent duplicates.