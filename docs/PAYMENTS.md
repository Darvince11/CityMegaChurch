# Payments — Paystack Mobile Money

## 1. Payment Policy

- **Mobile Money ONLY.** MTN MoMo, Telecel Cash, AT Money.
- **Cards are never shown, never sent to Paystack, never accepted.** Both frontend and backend enforce `channels: ["mobile_money"]`.
- Amounts are always recomputed/validated **server-side** from canonical prices (camp fee + accommodation + transport, or giving-category, or event fee).
- Payment success is only ever established by a **verified Paystack webhook** (or an explicit verified gateway query). Frontend reports are ignored.
- Every transaction leaves a complete audit trail (internal payment ledger + optional gateway payload).

---

## 2. Supported UI Options

| Network | Channel |
|---|---|
| MTN MoMo | `mobile_money` (MTN) |
| Telecel Cash | `mobile_money` (Telecel / ex-Vodafone) |
| AT Money | `mobile_money` (AT) |

The MoMo network selector is rendered server-side from a supported-network config (church can add/remove operators without deploys).

---

## 3. End-to-End Flow (Camp & Giving share the same engine)

```
[User] 1. Chooses amount + MoMo network + number (frontend UI panel)
             │
             ▼
[User → API] 2. POST /api/v1/payments/momo
             │     • validates permission/ownership
             │     • recomputes amount server-side (canonical prices)
             │     • validates MoMo phone format
             │     • creates payments row (status=pending, unique internal reference)
             │     • calls Paystack /transaction/initialize with
             │        amount, currency=GHS, channels=["mobile_money"],
             │        reference=internalReference, metadata
             │     • stores paystack reference + gateway response (sanitized)
             │
 [User] 3. Paystack provides MoMo instructions; user approves on phone
             │
             ▼
[Paystack → API] 4. Webhook POST /api/v1/webhooks/paystack (charge.success)
             │     • verify HMAC-SHA512 signature (raw body)
             │     • idempotency: event id + paystack reference
             │     • amount match vs payments.amount
             │     • status/event data validation
             │     • transaction in DB (FOR UPDATE), transition pending → successful
             │     • side effects: mark camp registration confirmed, create donation,
             │       queue confirmation email / notification / QR
             │
 [User → API] 5. Client polls GET /api/v1/payments/:reference until terminal
 (or confirmation page after webhook + email)
```

---

## 4. Server-Side Rules (non-negotiable)

1. **Never trust:** `amount`, `status`, or any "payment done" flag from the frontend.
2. **Internal reference** `CDP_<yyyymmddHHiiss>_<crypto12>` — guaranteed unique; also the Paystack merchant reference.
3. **Amount verification:** `payments.amount` (pesewas) must equal webhook `data.amount` exactly for the currency.
4. **Status verification:** only `charge.success` (and optional `charge.pending` informational) events transition state; `charge.failed` → failed.
5. **Idempotency:** unique constraint on `paystack_reference`; duplicate event IDs tracked in `payments.webhook_events`; a second webhook for an already-terminal transaction returns `200` without mutations.
6. **Order of writes:** all DB transitions inside a transaction with `SELECT ... FOR UPDATE` on the payment row; side effects (BullMQ) enqueued only after commit.
7. **Expiry:** MoMo pendings auto-timeout via reconciliation job; user can also cancel.
8. **Refunds** are manual + recorded, never automatic from webhooks.
---

## 5. Paystack Integration Details

| Item | Value |
|---|---|
| Endpoint | `https://api.paystack.co/transaction/initialize` |
| Webhook route | `POST /api/v1/webhooks/paystack` (raw body required) |
| Signature header | `x-paystack-signature` = HMAC-SHA512(raw body, `PAYSTACK_SECRET_KEY`) hex |
| Currency | `GHS` (minor units = pesewas) |
| Channels | `["mobile_money"]` only |
| Split/Subaccount | unused (church is single merchant) |

**Initialize request (API):**
```json
POST https://api.paystack.co/transaction/initialize
{
  "amount": 35000,
  "email": "payer@example.com",
  "currency": "GHS",
  "reference": "CDP_20261001_120000_kJx9F2mQaB1c",
  "channels": ["mobile_money"],
  "metadata": {
    "payment_for": "camp",
    "camp_registration_id": "...",
    "giving_category_id": null,
    "internal_reference": "CDP_20261001_120000_kJx9F2mQaB1c"
  }
}
```

---

## 6. Reconciliation & Failure Handling

- Pending payments older than the MoMo window → `timed_out`; camp draft registration kept for resume.
- Failed webhook processing: log + Sentry + limited retry queue before manual reconciliation via Paystack dashboard.
- Daily reconciliation job: query Paystack `/transaction/verify/:reference` for stale pendings and align status.
- Books never post revenue until webhook-verified success.

---

## 7. Giving-Specific Rules

- Guest giving allowed; optional `name`, `email`, `phone` captured for receipt.
- Active categories only; `donations.amount` revalidated server-side (any positive amount).
- Member giving auto-links to the member when authenticated; otherwise guest row.

---

## 8. Payment Test Matrix

| Case | Setup | Expected |
|---|---|---|
| Success | test webhook `charge.success` matching ref/amount | pending → successful; camp confirmed |
| Failed | `charge.failed` | pending → failed |
| Pending | `charge.pending` notification | stays pending |
| Duplicate webhook | same event id / paystack ref re-sent | no double processing (idempotent 200) |
| Forged webhook | wrong signature | 401, no mutation |
| Wrong amount | success webhook amount ≠ payments.amount | rejected, flagged, 200 to Paystack, error logged |
| Unknown reference | paystack ref not in DB | logged + 200 (idempotent ack) |
| Already processed | webhook for terminal payment | 200, no change |

Full matrices in docs/TESTING.md.