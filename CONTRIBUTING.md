# Contributing to Church Digital Platform

Thank you for contributing. This document defines how work flows through the project. Read `README.md` and `docs/PLAN.md` first — **the plan is the contract**.

---

## Code of Conduct

Be respectful, constructive and servant-hearted. This project serves a church community; every contributor maintains a professional, inclusive tone in issues, PRs and comments.

---

## How the Work Is Organized

- Development is split into **15 phases** (see `docs/PLAN.md`).
- A phase is only "done" when the **phase verification gate** passes:
  1. Linting passes with zero errors.
  2. Type checking passes.
  3. Automated tests pass.
  4. Database migrations run cleanly.
  5. RBAC permissions verified per endpoint.
  6. API endpoints verified per contract (see `docs/API.md`).
  7. Frontend integration verified.
- **Do not begin the next phase while the current phase is broken.**

---

## Branching & Commit Flow

```
main                ← always deployable, protected
 ├─ feat/phases/1   ← one branch per phase (or per PR-sized slice)
 ├─ fix/...
 └─ docs/...
```

### Suggested commit prefixes

| Prefix | Use for |
|---|---|
| `feat(module)` | New capability, e.g. `feat(camps): room capacity guard` |
| `fix(module)` | Bug fix |
| `docs(scope)` | Documentation only |
| `chore(scope)` | Tooling, deps, config |
| `test(module)` | Tests only |
| `refactor(module)` | No behavior change |
| `perf(module)` | Performance |
| `security(module)` | Security fixes (highest priority) |

---

## Pull Request Checklist

Before opening a PR, confirm:

- [ ] Feature matches the plan for the current phase.
- [ ] No business logic inside controllers or React components.
- [ ] Database changes are delivered as a **Drizzle migration** (never hand-SQL on production).
- [ ] New endpoints use DTO/schema validation and are covered in `docs/API.md`.
- [ ] New permissions are registered in the permissions table and documented in `docs/RBAC.md`.
- [ ] No hardcoded church content. Operational data comes from the database.
- [ ] No cards/credit payment paths anywhere.
- [ ] Sensitive routes are permission-checked **server-side** (not just hidden in the UI).
- [ ] Tests cover the critical path (auth, RBAC, payments, capacity).
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` all pass locally.
- [ ] `.env.example` updated if new environment variables were introduced.
- [ ] No secrets, credentials or tokens committed.

---

## Definition of Done

A task is done when:

1. Code implemented to specification.
2. Verified by the phase gate above.
3. Documentation updated (API, DB, RBAC, env).
4. UI has all four states: **loading, empty, error, success** (and permission-denied where relevant).
5. Mobile-first check done (touch targets, stress the first-timer + camp + MoMo flows).
6. Accessibility sanity check (semantic HTML, labels, keyboard, focus, contrast).
7. Audio/video/image uploads validated by type, size and MIME.

---

## Security Reporting

Report security vulnerabilities privately to the repository maintainers — **do not open a public issue**. Include:

- Affected route/module.
- Reproduction steps.
- Impact analysis.

Priority handling: webhook forgery, payment tampering, IDOR, privilege escalation, auth bypass.

---

## Environment & Tooling

- Node.js ≥ 20, pnpm ≥ 9.
- Formatting: Prettier. Linting: ESLint (shared config in `packages/eslint-config`).
- Never commit generated files (`dist/`, `.next/`, `coverage/`), `.env` files, or lockfile churn outside the intended package.

---

## Code Review Expectations

- Reviewers verify security claims by reading the code, not trusting comments.
- Permission checks must live in the backend guard/endpoint layer.
- Payment flows must be reviewed against `docs/PAYMENTS.md` and `docs/WEBHOOKS.md`.
- Two approvals required for anything touching **auth, RBAC, payments or finance reporting**.