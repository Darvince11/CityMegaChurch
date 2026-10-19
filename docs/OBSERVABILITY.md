# Observability & Monitoring

## 1. Structured Logging

**Format:** JSON lines in production (`LOG_FORMAT=json`), pretty in dev.

Every log record includes:

```json
{
  "ts": "2026-09-12T10:00:00.000Z",
  "level": "info",
  "module": "payments",
  "requestId": "f1a2b3…",
  "event": "payment.webhook.received",
  "message": "Webhook processed",
  "fields": { "paymentId": "…", "status": "successful" }
}
```

- Loggers instantiated per module with contextual bindings.
- Request middleware assigns `requestId` (echoed as `X-Request-Id`).
- **Never log:** passwords, tokens, secrets, raw payment credentials, full card/account data (n/a — MoMo only), internal DB credentials.

---

## 2. Error Monitoring (Sentry)

- **Sentry DSN** from `SENTRY_DSN`; enabled in production.
- Capture: unhandled exceptions, `5xx` responses, webhook verification failures, payment reconciliation anomalies, critical camp-capacity violations.
- Release tagging: image tag/revision → deploy correlation.
- Alerts: 
  - Webhook signature failures (possible forgery attempts).
  - Payment amount mismatch.
  - Camp overbooking guard trips (should never happen).
  - Spike of `500`s.

---

## 3. Health Endpoints

| Endpoint | Checks |
|---|---|
| `GET /health` | overall (db + redis + worker liveness) |
| `GET /health/db` | `SELECT 1` / pool health |
| `GET /health/redis` | `PING` |
| `GET /health/ready` | readiness for load balancer (all dependencies) |

Response shape for `/health`:
```json
{ "status": "ok" | "degraded", "checks": { "db": "up", "redis": "up" } }
```
- 200 when healthy, 503 when degraded — integrates with orchestration health gates.
- Public path (no auth), minimal payload, no internals.

---

## 4. Metrics

Minimal but meaningful metrics (exposed via `/metrics` if a collector is present):

- HTTP: request count by route/status, latency histogram (p50/p95/p99), error rate.
- Payments: initiated vs successful vs failed vs timed_out counts; webhook processing latency + failure count.
- Queue: BullMQ job counts by queue/status (active, delayed, failed).
- DB: pool active/idle, slow-query count.

Dashboards (e.g. Grafana) are optional; **alerting rules** in the runbook:
- Error rate > 1% over 5 min → notify on-call.
- Payment success rate dip > 3% vs baseline → notify finance + tech.
- Queue failed jobs > 5 backlog → notify responsible module.

---

## 5. Audit Observability (separate from app logs)

`audit_logs` are business audit (who did what) — persisted in Postgres, viewer-gated by `audit.read`. App logs are operational. Both correlate via `requestId`/entity ids.

---

## 6. Alerting & On-Call Playbook (recovery)

| Alert | Severity | Action |
|---|---|---|
| API down / 503s | P1 | Check container health, logs; redeploy previous image if regression |
| Webhook signature failures spike | P1 | Verify PAYSTACK secret rotation state; check for replay attacks |
| Payment amount mismatch | P1 | Suspend affected transaction; finance review; Paystack dashboard verification |
| DB degraded / disk | P1 | Managed DB ops; failover; restore-from-backup as last resort |
| Queue backlog | P2 | Inspect worker; retry jobs |
| TLS/cert expiry | P2 | Renew via Cloudflare |
| Backup job failure | P1 | Re-run, verify next snapshot (docs/BACKUPS.md) |

---

## 7. Instrumentation Hooks

- NestJS interceptors add timing + requestId per request.
- BullMQ worker events emitted to logger + optional metrics.
- Redis cache hits/misses logged at debug for tuning.
- Sentry breadcrumbs attach domain context (module, entity) without secrets.