# Master Execution Plan

This is the canonical work breakdown for the Church Digital Platform. Every phase ends with a **verification gate**; a phase is not complete until its gate is green. Do not begin the next phase while the current phase is broken.

---

## Phase Verification Gate (applies to every phase)

1. **Lint** — `pnpm lint` (zero errors).
2. **Type check** — `pnpm typecheck` (zero errors).
3. **Tests** — `pnpm test` (unit + integration for the phase).
4. **Migrations** — `pnpm db:migrate` runs cleanly; new schema documented in `docs/DATABASE.md`.
5. **Permissions** — every new/protected endpoint verified against `docs/RBAC.md`; unauthorized calls return `403`.
6. **API** — endpoints match the contract in `docs/API.md`.
7. **Frontend integration** — pages consume the real API, all UI states present (loading, empty, error, success).
8. Fix any failure **before** moving on.

---

## Phase 1 — Project Setup, Architecture, Database, Design System, Auth Foundation

- Monorepo scaffold: `apps/web` (Next.js + Tailwind + shadcn/ui) and `apps/api` (NestJS + Fastify + Drizzle).
- Shared packages: `database` (schema/migrations/seeds), `shared` (DTOs/types), `eslint-config`.
- Docker Compose for local Postgres + Redis; `.env.example` wired.
- Drizzle schema for **core foundation tables only** (users, profiles, permissions, roles, user_roles, role_permissions) — remaining tables ship with their phase.
- Base migration + empty seed harness.
- Design tokens implemented from `docs/DESIGN.md` (wine palette, typography, spacing).
- Auth foundation: register, login, logout, session management (HttpOnly cookies), Argon2 hashing, auth controller + guards.
- Health endpoints (`/health` incl. DB + Redis).

## Phase 2 — RBAC, Users, Roles, Permissions, Church Positions

- Full `users` administration (create, edit, activate/deactivate, reset password).
- `roles` CRUD + seed of default roles (Super Administrator, Pastor, Group Leader, Secretary, Fellowship Leader, Member, First-Timers Team, Finance Officer, Camp Manager, Event Manager, Media Administrator, Content Manager).
- `permissions` table + registration of the full permission catalog from `docs/RBAC.md`.
- Role ⇄ permission assignment; user ⇄ role assignment.
- **Church positions** table (Pastor → Group Leader → Secretary → Fellowship Leader → Member) — strictly separate from system roles.
- `RequirePermissions` guard used by all subsequent phases.

## Phase 3 — Church Information, Locations, Services, History, Leadership

- `settings`/church-info: name, mission, vision, description, contact info, social links.
- `locations`: CRUD, activate/deactivate, **set current**, public "Current Location" read path.
- `services`: CRUD, enable/disable, change times, assign locations, display order.
- `church_history`: timeline entries (year, title, description, image, order).
- `leaders`: profiles (name, photo, position, bio, order, active).
- `media`: object-storage upload service (R2), MIME/size validation.

## Phase 4 — Public Website

- Layout: Navbar, Footer (deep wine), mobile menu, SEO metadata per route.
- Pages: Home, About, History, Leadership, Services, Events list, Camp, Fellowships, Sermons, Give, First-Timer form, Contact, Login, Register.
- Homepage sections: Hero ("Welcome Home"), current service times, current location, weekly programs, upcoming events, upcoming camp, first-timer invitation, latest sermons, giving CTA, fellowships, contact/location map.
- SSG/ISR for public pages; cache current location/service times/events in Redis with invalidation.

## Phase 5 — Events & Registrations

- `events` CRUD with recurrence engine (one-time, weekly, monthly, custom).
- Publish / unpublish / cancel / archive lifecycle.
- Public events list with filters (upcoming, past, recurrence) + search.
- Event detail page with registration (optional per event).
- `event_registrations` + capacity handling.

## Phase 6 — First-Timer QR System

- Mobile-first `/first-timer` page (single short form; service options from DB).
- `first_timers` creation + status lifecycle (New → Assigned → Contacted → Follow-Up Required → Joined Fellowship → Became Member).
- First-Timers Team dashboard with new-record alerts.
- Assignment (`assigned_to`) and **follow-up history** (`first_timer_followups`).
- QR code displayed at church entrance pointing to `/first-timer`.

## Phase 7 — Groups & Fellowships

- `groups` CRUD, leader assignment, membership management, group-leader scoped access.
- `fellowships` CRUD, leader, meeting day/time/location, members request/join.
- Public fellowships page; member portal join flow.
## Phase 8 — Camp Management

- `camps` CRUD (name, slug, dates, deadline, location, capacity, fee, hero image, status).
- `camp_accommodations` (dynamic: name, price, capacity, spaces_remaining, enabled).
- `camp_transport_options` (name, pickup, departure, price, capacity, enabled).
- Multi-step registration (personal → accommodation → transport → review → payment → confirmation).
- Capacity rules: confirmed count vs camp capacity; accommodation capacity independent; statuses Available / Almost Full / Full / Registration Closed; optional waiting list.

## Phase 9 — Payments (Paystack MoMo) & Camp Confirmation

- `payments` ledger; initiates MoMo transaction server-side; internal unique reference.
- Paystack webhook with signature verification, reference check, amount check, status check, idempotency (see `docs/WEBHOOKS.md`).
- Camp registration status update on verified success; confirmation page with registration number, QR code, download.
- Payment audit history; duplicate suppression; timeout/cancel handling.
- MoMo UI: MTN MoMo, Telecel Cash, AT Money. **Never** cards.

## Phase 10 — Giving

- `giving_categories` (Tithe, Offering, Rhapsody + admin-editable), active/order/disable/delete.
- Guest + member giving using MoMo via Paystack (same webhook path).
- Strict financial privacy: only finance roles and explicitly authorized leadership see member-level giving.
- Giving history for the individual member (own record only).

## Phase 11 — Sermons, Announcements, Media

- `sermons` CRUD, publish/unpublish, search + categories, latest + related.
- Public sermon pages (video/audio playback, thumbnail, duration).
- `announcements` with priority (Normal/Important/Urgent), start/end date auto-expiry.
- Media gallery management.

## Phase 12 — Member Portal

- `/member/*` routes: dashboard, profile, events, registrations, camp, giving, fellowships, sermons, notifications.
- Dashboard: welcome, next service, current location, upcoming event, camp status, latest sermon, notifications, recent giving (own).
- Profile editing with validation.

## Phase 13 — Admin Dashboard, Reports, Audit Logs

- Admin dashboard KPIs + charts (member growth, first-timer trend, camp registrations, giving trends).
- Reports: first-timers by date/service/status, member growth, camp registrations/occupancy/payments, giving by category/date, event registrations, group/fellowship membership. Filtering + safe export.
- Audit log viewer + retention; every important admin action recorded.

## Phase 14 — Caching, Queues, Notifications, Performance

- Redis caching strategy with correct invalidation (current location, service times, upcoming events, giving categories, church info).
- BullMQ jobs: confirmation emails, notifications, QR generation, report generation.
- Notification architecture (in-app now; email now; SMS/WhatsApp later).
- Performance pass: index review, query profiling, page payload reduction, lazy loading.

## Phase 15 — Testing, Security Hardening, Deployment, Monitoring

- Full test suite pass (see `docs/TESTING.md`) incl. payment, RBAC, webhook idempotency.
- Security hardening review against `docs/SECURITY.md`.
- Production Docker images, Cloudflare deployment, managed Postgres, backups enabled.
- Sentry + structured logging verified; alerting rules defined.

---

## Phase Dependency Graph

```
1 ─► 2 ─► 3 ─► 4 ─► 5
              │
              ├─► 6 ─► 7
              │
              └─► 8 ─► 9 ─► 10 ─► 11 ─► 12
                                     │
   (1..12) ───────────────────────► 13 ─► 14 ─► 15
```

Phases 14 and 15 draft iterations occur continuously but official gates run as above.

---

## Cross-Cutting Requirements (every phase)

- Mobile-first: first-timer form, camp registration, MoMo payment, giving, events, location, member dashboard.
- Accessibility: semantic HTML, keyboard, visible focus, labels, contrast, alt text.
- UI states on every major page: loading / empty / error / success (+ permission denied).
- Audit logging for admin actions in the phase's modules.
- No hardcoded church content.
- Permissions enforced server-side.

---

## Milestone Checklist (Project Completion)

- [ ] All 15 phase gates green.
- [ ] Payment flow verified end-to-end in Paystack test mode (success, failed, pending, duplicate, forged, wrong amount, unknown ref).
- [ ] RBAC penetration checks pass (member hits `DELETE /api/events/:id` → 403).
- [ ] Production deploy steps documented and executed.
- [ ] Backup + restore drill performed once.
- [ ] Dashboard alerting proven (Sentry event, degraded DB health).