# Backups & Disaster Recovery

## 1. Backup Scope

| Asset | Method |
|---|---|
| PostgreSQL | Managed provider automated backups (PITR where available) + nightly logical dump to object storage |
| Redis | Configuration-only (cache/queues are disposable) — no backup required; BullMQ jobs re-enqueued on restart |
| Media (R2) | Versioning on bucket + periodic replication to a second region/bucket |
| `.env` / secrets | Copied to encrypted vault (never git) |
| Code | Git history (GitHub) |

---

## 2. Postgres Backup Strategy

### Automated nightly
- **Logical dump** (`pg_dump -Fc`) every night at 02:00 UTC → compressed → uploaded to encrypted object storage (separate from app bucket).
- **Retention:** 14 daily, 8 weekly, 6 monthly, 4 quarterly.
- Optional (recommended with managed provider): continuous WAL archiving / PITR for point-in-time recovery.

### Managed provider (recommended)
- Managed snapshots configured for daily retention ≥ 14 days.
- PITR window ≥ 7 days where the provider supports it.

### Monitoring
- Backup job health in Sentry on failure (P1 alert).
- Daily check that **today's snapshot exists and is non-empty**.
- **Monthly restore drill:** restore latest backup to a throwaway environment and run smoke queries (see §4).

---

## 3. Recovery Procedures

### Scenario A — Accidental data loss (recent)
1. Choose restore point: PITR to a timestamp (minute-granularity) or latest full snapshot.
2. Provision a scratch DB, restore backup.
3. Verify integrity queries:
   - row counts on `payments`, `camp_registrations`, `users`
   - invariant checks: single current location; capacity sums consistent
   - recent audit log presence matches expectations
4. Promote scratch DB to primary (maintenance window) or export affected rows.

### Scenario B — Schema/service failure
1. No restore needed — deploy previous image (app rollback tolerates newer schema per migrations policy).
2. If data corruption from app bug: restore to last good snapshot and re-apply replayable side-efffects (emails are re-queuable; payments ledger is source of truth, verify against Paystack dashboard).

### Scenario C — Regional outage
1. Failover DNS (Cloudflare) to secondary host.
2. Restore R2 media from replicated region/bucket.
3. Restore nearest PostgreSQL backup to secondary DB (or use provider-managed failover).

---

## 4. Restore Drill (monthly, automated where possible)

```
1. Restore latest backup into ephemeral "restore-check" database.
2. Run `scripts/verify-restore.sql`:
     - SELECT count(*) on critical tables (expect sane ranges)
     - CHECK no duplicate unique keys
     - CHECK at most one current location
     - CHECK payments.status distribution plausible
3. Boot the API against scratch DB on a no-traffic port; hit /health + one
   public endpoint + one login.
4. Report result; archive drill report.
```

A failed drill = P1 (backup is not proven until restored once).

---

## 5. Data Retention & Compliance

| Data | Retention |
|---|---|
| Audit logs | ≥ 24 months (viewer: `audit.read`); archive after |
| Payment records | Permanent (financial books) |
| First-timer records | Indefinite (ministry relationship); soft-delete available |
| Member data | Until member requests removal (with audit trail) |
| Session records | Cap 30 days via purge job |
| Notifications | 12 months |

Retention jobs are BullMQ-scheduled and logged.

---

## 6. Backup Chain & Ownership

- **Owner:** System Administrator (church).
- **Verification:** monthly drill results recorded in `docs/runbooks/backup-drills/`.
- **Secrets in backups:** encrypted at rest; backup encryption key rotated annually.