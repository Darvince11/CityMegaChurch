# Testing Strategy

## 1. Test Stack

| Layer | Tool |
|---|---|
| Unit (API services/repositories) | **Vitest** |
| Integration (API + DB + Redis + HTTP) | **Vitest + Testcontainers** (Postgres/Redis) |
| Frontend components | **Vitest + Testing Library** |
| E2E (critical flows) | **Playwright** |
| Migration smoke | Drizzle Kit CLI in CI |
| Coverage thresholds | enforced per package (line ≥ 80% on critical modules) |

Test databases are disposable (dockerized Postgres per run), migrations applied programmatically, seeds optional per suite fixture.

---

## 2. Priority Order (per spec §68)

1. **Authentication** — register/login/logout/session/2FA/reset.
2. **RBAC** — permission matrix + scoping + privilege-escalation tests.
3. **Payments** — full webhook matrix.
4. **Camp capacity** — overbooking prevention (camp + accommodation + waitlist).
5. **Accommodation capacity** — atomic `spaces_remaining` guard.
6. **First-timer submission** — validation, dedupe guard, queue into team dashboard.
7. **Location switching** — current-location invariant + cache invalidation + public reflection.
8. **Event permissions** — RBAC on create/update/delete/publish.
9. **Giving permissions** — finance-scope enforcement.
10. **Webhook idempotency** — replays/concurrency.

---

## 3. Unit Tests (representative)

| Module | Cases |
|---|---|
| auth | hash/verify Argon2; token generation; session revocation on logout |
| rbac | effective permission union; role removal drops perms; scoped group checks |
| camps | capacity math; accommodation decrement rule; waitlist promotion; fee computation (fee + accommodation + transport) |
| payments | reference uniqueness; amount recomputation; status transitions; expiry task |
| events | recurrence generation (weekly/thu/wed, monthly, custom, bounded); cancel/archive transitions; capacity guard |
| giving | category active-only validation; amount rules |
| first-timers | status lifecycle; follow-up append-only history |
| locations | set-current uniqueness (single current) |

---

## 4. Integration Tests (API)

Boot the full NestJS app against test Postgres + Redis with Paystack stubbed via a mock HTTP server.

| Area | Test matrix |
|---|---|
| Auth | login throttle (>10/min → 429), wrong password, disabled user, 2FA required role, session cookie flags |
| RBAC | route × role matrix → 401/403/200 |
| Events | full CRUD lifecycle + permission-denied delete (member → 403) |
| First-timers | POST valid/invalid; duplicate phone within 24h flags; team list reflects status |
| Camps | register → capacity unit test → payment pending → webhook success → confirmed; second registration at capacity → "Registration is currently full." |
| Payments | docs/PAYMENTS.md §8 matrix, incl. concurrent duplicate webhooks |
| Giving | member self-scope vs finance scope vs denied role |
| Locations | set-current switch; public reading returns new current; cache invalidation |
| Audit | admin mutation creates audit row; no secrets in old/new values |

---

## 5. Payment Webhook Test Details

Fixture: single JSON file per event type (`charge.success`, `charge.failed`, `charge.pending`, `charge.abandoned`).

| Scenario | Steps | Expected |
|---|---|---|
| Successful payment | create payment pending, post signed success webhook | payment successful; camp confirmed; donation created; email job queued |
| Failed payment | signed failed webhook | payment failed |
| Pending | signed pending webhook | stays pending |
| Duplicate webhook | replay same event id | second run no-op |
| Forged webhook | bad signature header | 401 |
| Wrong amount | success with mutated amount | rejected + flagged; no transition |
| Unknown reference | success ref not in DB | logged; ack 200 |
| Already processed | success after success | no state change |
| Concurrent | two parallel webhooks | one transition, no double debit side effects |

---

## 6. E2E (Playwright) — critical journeys only

1. Public → home shows current location/service times; click event → detail.
2. First-timer QR flow: scan/serve `/first-timer`, submit, success screen; admin team sees record.
3. Member: login → register for camp → payment step (mocked Paystack sandbox) → confirmation + QR visible.
4. Admin: login → set current location → public home reflects it.
5. Guest: give via MoMo panel → success.
6. RBAC negative: member navigation everywhere admin links denied (UI + API double-check).

---

## 7. Frontend Component Tests

- Loading / empty / error / success states per major component.
- Form validation messages (accessibility-labeled).
- Keyboard navigation (focus order) on forms + nav.
- Mobile viewport rendering (first-timer, camp stepper, MoMo panel).

---

## 8. CI Integration

- CI runs: lint → typecheck → unit → integration (containers) → build both apps — always.
- Coverage report published on PR.
- Migration smoke: `db:migrate` against clean test DB + `db:diff` guard (no drift).
- `e2e` runs nightly + on PRs touching auth/payments/camps.

---

## 9. Test Fixtures & Utilities

- `test/factories/` — `createUser`, `createRole`, `createCamp`, `createPayment` helpers.
- `test/helpers/testDb.ts` — managed test DB lifecycle.
- `test/paystackServer.ts` — mock Paystack HTTP server (returns controllable responses).
- `test/seedFixtures.json` — roles/permissions/services/camp fixtures for suites.