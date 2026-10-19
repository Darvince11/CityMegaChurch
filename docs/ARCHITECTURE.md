# System Architecture

## 1. Architectural Style: Modular Monolith

The platform is a **modular monolith**. One deployable backend, one deployable frontend, with module boundaries explicit enough that any module could be extracted into a separate service later **without rewrites**.

**Explicitly out of scope (Phase 1):** Kafka, Kubernetes, service meshes, complex distributed infrastructure. These are only introduced if genuine scale requires them, and only after a written justification.

### Why a modular monolith

- One transaction boundary for payments + registrations (critical for capacity guards and idempotency).
- Simple local development and deployment.
- Fast iteration across the 15 phases.
- Module isolation (NestJS modules) preserves the extraction path.

---

## 2. High-Level System Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │                 Browsers                     │
                    │  Mobile / Desktop / QR scanner (phone)      │
                    └──────────────────────┬──────────────────────┘
                                           │ HTTPS + Cloudflare (CDN/WAF)
                    ┌──────────────────────▼──────────────────────┐
                    │            Next.js Frontend                 │
                    │  /            public site (SSG/ISR + RSC)   │
                    │  /member/*    member portal (client)         │
                    │  /admin/*     admin portal (client)          │
                    └──────────────────────┬──────────────────────┘
                                           │ REST (JSON) /v1
                    ┌──────────────────────▼──────────────────────┐
                    │        NestJS API (Fastify adapter)          │
                    │  Modular monolith: auth/users/rbac/events/   │
                    │  camps/payments/giving/first-timers/...      │
                    └───┬──────────────┬──────────────┬───────────┘
                        │              │              │
              ┌─────────▼───┐  ┌───────▼──────┐  ┌────▼────────────┐
              │  PostgreSQL  │  │    Redis     │  │ Cloudflare R2    │
              │  source of   │  │ cache+queue  │  │ media storage    │
              │  truth       │  │ (BullMQ)     │  │ (S3-compatible)  │
              └─────────────┘  └───────┬──────┘  └─────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │  Paystack (server-to-server) │
                        │  webhooks → /api/v1/webhooks │
                        │  /paystack  (signed)          │
                        └─────────────────────────────┘
```

---

## 3. Frontend Architecture

### Structure (`apps/web`)

```
apps/web/
├── app/                        # Next.js App Router
│   ├── (public)/               # public site routes (SSG/ISR)
│   │   ├── page.tsx            # /            Home
│   │   ├── about/              # /about
│   │   ├── history/            # /history
│   │   ├── leadership/         # /leadership
│   │   ├── services/           # /services
│   │   ├── events/             # /events, /events/[slug]
│   │   ├── camp/               # /camp, /camp/register, /camp/payment, /camp/confirmation
│   │   ├── fellowships/        # /fellowships
│   │   ├── sermons/            # /sermons, /sermons/[slug]
│   │   ├── give/               # /give
│   │   ├── first-timer/        # /first-timer (QR target, mobile-first)
│   │   ├── contact/            # /contact
│   │   ├── login/              # /login
│   │   └── register/           # /register
│   ├── (member)/               # authenticated member portal
│   │   └── member/             # dashboard, profile, events, registrations, camp, giving, fellowships, sermons, notifications
│   ├── (admin)/                # authenticated admin portal
│   │   └── admin/              # 27+ management modules
│   ├── api/                    # Next API routes ONLY as thin BFF proxy when needed
│   ├── layout.tsx
│   └── sitemap.ts              # sitemap.xml
├── components/                 # shadcn/ui + feature components
├── lib/                        # api client, auth helpers, SEO helpers
├── hooks/                      # TanStack Query hooks per domain
├── types/
└── styles/                     # Tailwind + design tokens
```

### Data-fetching policy

| Surface | Strategy |
|---|---|
| Public static content (about, history, leadership) | **SSG** (static generation) |
| Frequently-changing public data (current location, service times, upcoming events, camp) | **ISR** with short revalidation; Redis serves hot values with invalidation webhooks |
| Member/Admin portals | **Client components + TanStack Query** with mutation hooks |
| SEO-critical pages | Server-rendered with metadata (title, description, OG, canonical) |

### State layer
- TanStack Query for server state + cache invalidation.
- Zod validation shared with the backend via `packages/shared` (DTO types).
- Auth state is derived from the API's `GET /v1/auth/me` after HttpOnly cookie validation.
---

## 4. Backend Architecture

### Structure (`apps/api`)

```
apps/api/src/
├── common/                     # guards, decorators, interceptors, filters, pagination
│   ├── guards/                 # AuthGuard, RequirePermissionsGuard
│   ├── decorators/             # @CurrentUser, @Permissions, @Public
│   ├── interceptors/           # logging, response shaping, request-id
│   ├── filters/                # centralized error mapping (never leak internals)
│   └── dto/                    # Zod schemas + DTO base
├── config/                     # env validation (zod), TypedConfigService
├── database/                   # Drizzle client, pool, connection config
├── redis/                      # Redis client + cache service + invalidation helpers
├── jobs/                       # BullMQ queues + workers
├── auth/                       # register, login, logout, sessions, 2FA, password reset
├── users/
├── roles/                      # system roles
├── permissions/
├── church-positions/
├── members/
├── church/                     # church info/settings
├── locations/
├── services/                   # church services
├── leadership/
├── history/
├── groups/
├── fellowships/
├── events/
├── camps/
├── accommodation/
├── transport/
├── payments/                   # ledger, MoMo initiator, reference generator
├── webhooks/                   # Paystack webhook controller (signature verified)
├── giving/
├── first-timers/
├── sermons/
├── announcements/
├── notifications/
├── audit/
├── reports/
├── media/
├── health/                     # /health, /health/db, /health/redis
└── settings/
```

### Module pattern (each module is a NestJS module)

```
module/
├── module.ts           # @Module wiring
├── controller.ts       # routes + DTO validation + permission guards (no business logic)
├── service.ts          # business logic + DB access (single responsibility)
├── dto.ts              # Zod schemas validated at the edge
├── repository.ts       # Drizzle queries (optional where service is small)
└── test/               # unit + integration tests
```

**Rules:**
- Controllers = parse + validate + authorize + call service + return. No business logic.
- Services = business logic + data access. No HTTP concerns.
- Repository layer isolates every Drizzle query; no ad-hoc `db.select` inside services when shared.
- Magic strings/numbers live in `constants` or the DB (statuses). Never scattered.
- A module may only depend on another module through its public service interface (no cross-import of repositories).

---

## 5. Data Architecture

- **PostgreSQL = single source of truth** for all operational, membership and financial data.
- **Drizzle ORM** defines the schema in TS; Drizzle Kit generates migrations.
- **Redis** stores only:
  - Rate-limit counters
  - Short-lived cached public configuration (current location, service times, upcoming events, giving categories, church info)
  - BullMQ job queue
  - Transient "recent" analytics aggregations
- Invalidations: any write to the underlying entity triggers a cache-key delete (via service layer).
- **Cloudflare R2** holds media; DB stores object key, URL, MIME, size, metadata. Large binary blobs never enter PostgreSQL.

### Identity & session
- Session cookie (`HttpOnly`, `Secure`, `SameSite=Lax`) holding an opaque session id; sessions stored (hashed) in PostgreSQL with Redis TTL acceleration.
- Passwords: Argon2id.
- 2FA (TOTP) for sensitive roles — enforced at login when configured.

---

## 6. Payment Architecture

### Principles (see docs/PAYMENTS.md and docs/WEBHOOKS.md)
1. Amounts and references are always computed/validated **server-side**.
2. Frontend never reports success; only Paystack webhooks transition a payment to `success`.
3. Webhook signature verified with HMAC-SHA512 over the raw body using the Paystack secret.
4. Every transaction gets a unique internal reference (e.g. `CDP_<timestamp>_<random>`); idempotency via unique constraints + processing state machine.
5. Payment gateway state stored raw (sanitized) for audit/reconciliation.

### Payment state machine
```
pending ─► successful
pending ─► failed
pending ─► cancelled (user/timeout)
pending ─► timed_out (reconcile)
(any terminal state) → webhook for already-processed events is acknowledged & ignored (idempotent)
```

---

## 7. Background Processing (BullMQ)

Queued jobs (never critical to payment verification):
- Confirmation emails (camp, event, giving receipts)
- In-app notification delivery
- QR code generation
- Report generation
- Non-critical analytics aggregations

Payment webhook handling is **synchronous + transactional**; BullMQ is only used for side effects *after* the DB transaction commits.

---

## 8. Caching Strategy

| Key | TTL | Invalidated by |
|---|---|---|
| `config:current-location` | 5 min | location set-current / update / delete |
| `config:services` | 5 min | service create/update/delete/enable |
| `config:church-info` | 10 min | settings write |
| `config:giving-categories` | 10 min | category write |
| `events:upcoming` | 2 min | event write / occurrence generation |
| `camp:{slug}:public` | 2 min | camp/accommodation/transport write |
| `page:home` fragment | 1 min | any of the above |

Cache-aside pattern with explicit invalidation in the write path (same service transaction boundaries). No distributed invalidation needed — monolith process scope is sufficient; keys are namespaced for future multi-instance.

---

## 9. Security Architecture

- TLS everywhere (terminated at Cloudflare, origin HTTPS enforced).
- CORS restricted to WEB origins.
- Security headers (HSTS, X-Content-Type-Options, CSP where practical, Referrer-Policy, X-Frame-Options).
- Rate limiting at edge (Cloudflare) + API (Redis-backed throttler).
- RBAC enforced by `RequirePermissions` guard on every protected route — never by UI code.
- CSRF mitigated via SameSite cookies + origin checks on state-changing requests.
- Input validation: Zod DTOs on every route; DB-level check/unique constraints as backstop.
- Audit logging for all administrative mutations.

---

## 10. Scalability & Performance Direction

- Read traffic: ISR/SSG public pages → CDN; Redis hot config cache; PostgreSQL read replicas later.
- Write traffic: single primary PostgreSQL; connection pooling via PgBouncer (or managed pooler) in production.
- Vertical-first for the monolith (2 → 4 → 8 cores) before horizontal scaling.
- When horizontal scale is needed: stateless containers + shared Redis/Postgres/BullMQ make it trivial.
- Query discipline: pagination everywhere, indexes aligned to query patterns (docs/DATABASE.md), N+1 banned in code review.

---

## 11. Deployment Architecture (production)

```
Cloudflare (DNS + CDN + WAF + rate limiting)
   │
   ├── Next.js web     → Cloudflare (or VPS) container, behind HTTPS
   ├── NestJS API      → container(s), behind HTTPS, only WEB allowed via CORS
   │                        ├── PostgreSQL managed (private network)
   │                        ├── Redis managed (private network, TLS)
   │                        └── R2 object storage
   └── Webhooks        → Paystack → API /api/v1/webhooks/paystack (public, signed)
```

PostgreSQL and Redis are **not publicly exposed**. Workers/queues run in the same container process set.

See docs/DEPLOYMENT.md for the full runbook.
---

## 12. Versioning & Evolution

- API versioned at the URI: `/api/v1/...`.
- Drizzle migrations are append-only; forward-only upgrades with documented history.
- Feature-flagged releases for risky areas (new payment path).
- Module extraction path: when a module outgrows the monolith, its controller/service/repository move verbatim into a new NestJS service behind an internal API gateway.