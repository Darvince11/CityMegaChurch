# Church Digital Platform

> **Current implementation:** foundation preview with home/about pages, registration, login, and an account view with logout. The capabilities below describe the broader target platform; business modules and production hardening are still in development.
>
> **Preview locally:** run `pnpm preview`, or on Windows `powershell -ExecutionPolicy Bypass -File .\scripts\start-preview.ps1`. Open the URL printed by the launcher and sign in with `superadmin@church.test` / `Test@1234`. See [local preview instructions](docs/LOCAL_PREVIEW.md).

A complete, production-ready digital ecosystem for a modern church. This is **not** a brochure website — it is a modular monolith that unifies the public website, member portal, church administration portal, camp management, Mobile Money payments, first-timer follow-up, sermons, groups, fellowships and giving under one secure platform.

> **Every item of operational content is database-driven.** Nothing about the church's location, service times, weekly programs, events, camp pricing, accommodation or giving categories is hardcoded. Administrators control it all.

---

## Table of Contents

- [Highlights](#highlights)
- [Core Capabilities](#core-capabilities)
- [Technology Stack](#technology-stack)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Repository Layout](#repository-layout)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Business Rules](#business-rules)
- [Security & Compliance](#security--compliance)
- [Deployment](#deployment)
- [Maintenance & Operations](#maintenance--operations)
- [Status & Roadmap](#status--roadmap)

---

## Highlights

| Area | What it delivers |
|---|---|
| **Public website** | Multi-page SEO-friendly site: Home, About, History, Leadership, Services, Events, Camp, Fellowships, Sermons, Give, First-Timer form, Contact |
| **Member portal** | Dashboard, profile, events, registrations, camp, giving, fellowships, sermons, notifications |
| **Admin portal** | Full administration across 27+ management areas with a role-aware sidebar |
| **Camp management** | Multi-step registration (6 steps), dynamic accommodation & transport, capacity control, MoMo payment, QR check-in |
| **First-timer system** | Entrance QR → mobile-first form → First-Timers Team dashboard → assignment → follow-up history |
| **Giving** | Editable categories (Tithe, Offering, Rhapsody, …), Mobile Money only, strict financial privacy |
| **MoMo payments** | Paystack-backed MTN MoMo, Telecel Cash and AT Money — cards never exposed |
| **RBAC** | Position (church) vs Role (system) vs Permissions fully separated and permission-checked server-side |
| **Security** | Argon2 passwords, HttpOnly session cookies, 2FA for sensitive roles, audit logging, webhook signature verification, rate limiting |
| **Ops** | Docker, GitHub Actions CI/CD, Cloudflare, managed PostgreSQL, automated backups, Sentry, structured logs |

---

## Core Capabilities

1. Public church website — homepage, about, history, leadership, services, events, contact
2. Member portal — dashboard and self-service
3. Church administration portal — 27+ management modules
4. Event management — one-time, weekly, monthly and custom recurring events with registration
5. Camp registration & accommodation — dynamic options, transport, capacity guards, QR check-in
6. Mobile Money payments — Paystack MoMo (MTN MoMo, Telecel Cash, AT Money)
7. Giving & donations — editable categories, restricted financial access
8. First-timer QR registration & follow-up — with complete follow-up history
9. Church groups and fellowships — leaders manage their own scope
10. Sermon management — searchable library with audio/video media
11. Role-Based Access Control — user → roles → permissions
12. Audit logging — every important administrative action
13. Church location management — the church has **no permanent location**; admin sets the current one
14. Service management — service times fully database-driven
15. Notifications & reporting — in-app notifications plus filtered, exportable reports
---

## Technology Stack

### Frontend
| Layer | Choice |
|---|---|
| Framework | **Next.js** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Components | **shadcn/ui** + Radix primitives |
| Icons | **Lucide icons** |
| Data fetching | **TanStack Query** where interactive, RSC/SSG for public SEO pages |

### Backend
| Layer | Choice |
|---|---|
| Framework | **NestJS** with **Fastify adapter** |
| Language | **TypeScript** |
| API | **REST** (versioned) |

### Data & Infrastructure
| Layer | Choice |
|---|---|
| Database | **PostgreSQL** (managed, with connection pooling) |
| ORM | **Drizzle ORM** + migration toolkit |
| Cache | **Redis** (rate limiting, short-lived config cache, BullMQ queue) |
| Background jobs | **BullMQ** |
| File storage | **Cloudflare R2** (S3-compatible) |
| Payments | **Paystack** — Mobile Money only |
| Containers | **Docker** + Docker Compose |
| CI/CD | **GitHub Actions** |
| Edge/CDN | **Cloudflare** |
| Monitoring | Structured logs, **Sentry**, `/health` endpoints |

---

## Architecture at a Glance

The system is built as a **modular monolith**.

- One backend codebase with **clearly separated modules** (auth, members, events, camps, payments, …) so any module can later be extracted into its own service without rewrites.
- One Next.js frontend serving the public site, member portal and admin portal with route-level access control.
- PostgreSQL is the **single source of truth**. Redis caches only the hot, frequently-read public configuration and is invalidated on data changes.
- Payments flow strictly: **frontend initiates → backend initializes transaction server-side → Paystack webhook verifies → status updated**. Frontend payment status is never trusted.

```
Browser (Next.js, SSG/RSC for public, client for portals)
        │ HTTPS
        ▼
NestJS (Fastify) REST API ──► PostgreSQL (source of truth)
        │                      Redis (cache + queue)
        │                      Cloudflare R2 (media)
        ▼
Paystack Webhook (server-to-server, signature verified)
BullMQ Workers (emails, QR generation, notifications, reports)
```

Full detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Repository Layout

```
church-digital-platform/
├── apps/
│   ├── web/                  # Next.js frontend (public + member + admin)
│   └── api/                  # NestJS backend (modular monolith)
├── packages/
│   ├── database/             # Drizzle schema, migrations, seeds
│   ├── shared/               # Shared DTOs, types, validation
│   └── eslint-config/        # Shared lint configuration
├── infra/
│   ├── docker/               # Dockerfiles & compose files
│   └── terraform/            # (optional) IaC
├── .github/workflows/        # CI/CD pipelines
├── docs/                     # All architecture & ops documentation
└── .env.example
```
---

## Documentation

The `docs/` folder is the source of truth for every design decision:

| Document | Covers |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Modular-monolith design, frontend/API structure, caching, security posture |
| [`docs/PLAN.md`](docs/PLAN.md) | The 15-phase execution plan and its verification gate |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Tables, indexes, invariants and the migration policy |
| [`docs/API.md`](docs/API.md) | REST contract, conventions, endpoint → permission map |
| [`docs/RBAC.md`](docs/RBAC.md) | Position ≠ Role ≠ Permission, full permission catalog |
| [`docs/PAYMENTS.md`](docs/PAYMENTS.md) | Paystack Mobile Money engine and server-side rules |
| [`docs/WEBHOOKS.md`](docs/WEBHOOKS.md) | Signature verification, idempotency, event matrix |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Threat model, auth/session/2FA, hardening checklist |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Local setup, daily commands, adding a module |
| [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) | Every configuration variable in one place |
| [`docs/TESTING.md`](docs/TESTING.md) | Testing strategy, priorities, expected matrices |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Images, CI/CD, zero-downtime deploy, rollback |
| [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md) | Structured logs, Sentry, health endpoints, alerts |
| [`docs/BACKUPS.md`](docs/BACKUPS.md) | Backup/restore strategy, retention and drills |
| [`docs/SEED_DATA.md`](docs/SEED_DATA.md) | Default roles, permissions and reference data |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Design tokens (wine palette) and UI conventions |

---

## Quick Start

> Full setup walkthrough: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)

```bash
git clone <repo-url> church-digital-platform
cd church-digital-platform
corepack enable
pnpm install

# infrastructure
docker compose -f infra/docker/docker-compose.dev.yml up -d   # Postgres + Redis

# config (fill in local values, see docs/ENVIRONMENT.md)
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local

# database
pnpm db:migrate
pnpm db:seed

# run
pnpm dev
# web  → http://localhost:3000
# api  → http://localhost:4000
```

Health check:

```bash
curl http://localhost:4000/health
# { "status": "ok", "db": "up", "redis": "up" }
```
---

## Development Workflow

- Work is split into **15 phases** with a hard **verification gate** — a phase is only done when lint, types, tests, migrations, RBAC, API contract and frontend integration all pass ([`docs/PLAN.md`](docs/PLAN.md)).
- **Backend first, then frontend.** Every change ships with its docs updates (API, DATABASE, RBAC) and tests.
- Branching: `feat/phase-N-<scope>`, `fix/<scope>`, `docs/<scope>`; PRs target protected `main` with required CI.
- Code touching **auth, RBAC, payments or finance reporting** requires two approvals ([`CONTRIBUTING.md`](CONTRIBUTING.md)).
- Never start a new phase while the current one is broken.

| Command | Purpose |
|---|---|
| `pnpm dev` | API + web in watch mode |
| `pnpm lint` / `pnpm typecheck` | Static checks across the monorepo |
| `pnpm test` | Unit + integration tests (Vitest) |
| `pnpm test:e2e` | Playwright critical journeys |
| `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:generate` | Database workflow |
| `pnpm build` | Production build |

---

## Business Rules

- **No hardcoded church content.** Location, service times, programs, events, camp pricing, accommodation and giving categories are all database-driven and admin-editable.
- **The church has no permanent location** — exactly one "current location" is set by admins and reflected everywhere public.
- **Authorization runs on permissions only.** `if (user.role === "pastor")` is banned everywhere; access flows user → roles → permissions and is enforced server-side by the `RequirePermissions` guard, never by UI code.
- **Mobile Money only.** MTN MoMo, Telecel Cash and AT Money via Paystack. Cards are never accepted, never shown, never sent to the gateway.
- **Payment success is only ever established by a verified Paystack webhook.** Frontend status is never trusted; every amount is recomputed server-side from canonical prices.
- **Camp capacity is guarded atomically** — no overbooking, even under concurrent registrations.
- **Financial privacy is strict.** Only finance roles and explicitly granted leadership see member-level giving; members see only their own records.
---

## Security & Compliance

- **Argon2id** password hashing; **HttpOnly / Secure / SameSite** session cookies, hashed token storage, server-side revocation on logout.
- **2FA (TOTP) required** for Super Administrator, Pastor and Finance Officer roles.
- **RBAC** enforced by the `RequirePermissions` guard on every protected route, with row-ownership scoping for leaders and self-service.
- **Webhook security:** raw-body HMAC-SHA512 signature verification, IP allowlist, two-layer idempotency against duplicate and forged callbacks.
- **Rate limiting** at the Cloudflare edge and Redis-backed in the API (auth 10/min/IP, global 300/min).
- **Audit logging** on every administrative mutation; secrets, passwords and payment credentials never enter logs.
- **Upload safety:** MIME/size allowlist, generated object keys, non-executable storage domain.
- **Error responses** are centrally filtered — no stack traces, SQL or paths ever reach a client.

> Full threat model and the Phase 15 hardening checklist: [`docs/SECURITY.md`](docs/SECURITY.md)

---

## Deployment

| Topic | Summary |
|---|---|
| **Topology** | Cloudflare (DNS, CDN, WAF, TLS) → Next.js web + NestJS API containers; managed PostgreSQL and Redis on a private network; R2 for media |
| **Containers** | Multi-stage, non-root, production-optimized images (see `infra/docker/`) |
| **CI/CD** | GitHub Actions: lint → typecheck → tests → build → migration smoke → security audit + secret scan on every PR; zero-downtime rollout on `main`/tags |
| **Migrations** | Forward-only and additive; run as a deployment job before new containers start; drift check in CI |
| **Webhooks** | `https://api.<domain>/api/v1/webhooks/paystack`, secret shared with the Paystack dashboard |
| **Post-deploy** | `/health` gate, homepage smoke, login + one 403 check, test transaction |
| **Rollback** | Redeploy previous image (the app tolerates newer schema); data restore via documented procedures |

> Full runbook: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
---

## Maintenance & Operations

- **Backups:** nightly logical dumps (retention: 14 daily / 8 weekly / 6 monthly / 4 quarterly) plus managed snapshots/PITR; media versioned in R2; **monthly restore drill** — a backup is only proven after it has been restored once ([`docs/BACKUPS.md`](docs/BACKUPS.md)).
- **Monitoring:** JSON structured logs, Sentry error tracking, `/health` and `/health/ready` endpoints; alerting for webhook failures, payment amount mismatches, error-rate spikes and queue backlog ([`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md)).
- **Retention:** audit logs ≥ 24 months; payment records permanent; sessions 30 days; notifications 12 months — enforced by scheduled purge jobs.

---

## Status & Roadmap

**Status:** Documentation complete; implementation proceeds in the 15 ordered phases of [`docs/PLAN.md`](docs/PLAN.md).

| Phase | Scope |
|---|---|
| 1 | Project setup, monorepo, database, design system, auth foundation |
| 2 | RBAC — users, roles, permissions, church positions |
| 3 | Church info, locations, services, history, leadership, media |
| 4 | Public website (SSG/ISR, SEO) |
| 5 | Events & registrations |
| 6 | Camp management, accommodation, transport, QR check-in |
| 7 | First-timer QR intake & follow-up system |
| 8 | Mobile Money payments (Paystack) |
| 9 | Payments ops — webhooks, ledger, reconciliation |
| 10 | Giving & donations |
| 11 | Sermons, announcements, media gallery |
| 12 | Member portal |
| 13 | Admin dashboard, reports, audit logs |
| 14 | Caching, queues, notifications, performance |
| 15 | Testing, security hardening, deployment, monitoring |

Every phase ends with a **verification gate** — lint, types, tests, migrations, RBAC, API contract and frontend integration must all pass before the next phase begins.

---

Contributions are welcome — read [`CONTRIBUTING.md`](CONTRIBUTING.md) first.
