# REST API Reference

**Base URL:** `/api/v1` (production: `https://api.church.example/api/v1`)
**Content-Type:** `application/json`
**Auth:** session cookie (`HttpOnly`) for web; `Authorization: Bearer <token>` available for machine clients (scoped).

---

## 1. Conventions

### Pagination
All list endpoints accept and return:
```
?page=1&pageSize=20&sort=created_at&order=desc
```
Response envelope:
```json
{ "data": [...], "meta": { "page": 1, "pageSize": 20, "total": 57, "totalPages": 3 } }
```
`pageSize` max 100.

### Errors
```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Registration is currently full.",
             "details": [{ "field": "email", "message": "Invalid email" }] } }
```
Humane messages — never stack traces, SQL, paths or secrets. HTTP status mapping below.

| Status | Codes |
|---|---|
| 400 | `VALIDATION_FAILED`, `BAD_REQUEST` |
| 401 | `UNAUTHENTICATED`, `SESSION_EXPIRED` |
| 403 | `FORBIDDEN` (never leaks whether resource exists) |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` (duplicate, capacity) |
| 422 | `UNPROCESSABLE_ENTITY` (e.g. payment already processed) |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL_ERROR` (generic) |

### Filtering
Query params per resource, e.g. `?status=published&start_date_gte=2026-01-01`. Dashboard/filter params documented per module in its generated OpenAPI schema (NestJS Swagger).

---

## 2. Public Endpoints (no auth)

| Method | Path | Description |
|---|---|---|
| GET | `/public/locations/current` | Current church location |
| GET | `/public/services` | Enabled services for the week |
| GET | `/public/events` | Published upcoming events (+ recurrence filter) |
| GET | `/public/events/:slug` | Event detail (published) |
| GET | `/public/camps` | Camps open/upcoming |
| GET | `/public/camps/:slug` | Camp detail (+ public accommodation/transport, prices) |
| GET | `/public/fellowships` | Active fellowships |
| GET | `/public/sermons` | Published sermons (search, category) |
| GET | `/public/sermons/:slug` | Sermon detail |
| GET | `/public/leaders` | Leadership list |
| GET | `/public/history` | Church history timeline |
| GET | `/public/giving-categories` | Active giving categories |
| GET | `/public/church-info` | Church name, mission, vision, contact, social links |
| GET | `/public/announcements` | Currently active announcements |
| POST | `/first-timers` | First-timer submission (mobile QR form) |
| POST | `/auth/register` | Create account + member profile |
| POST | `/auth/login` | Login (password + optional 2FA) |
| POST | `/auth/forgot-password` | Request reset |
| POST | `/auth/reset-password` | Reset with token |

---

## 3. Admin & Member Endpoints (auth required)

### Auth & Profile
| Method | Path | Permission | Notes |
|---|---|---|---|
| POST | `/auth/logout` | — | revoke session |
| GET | `/auth/me` | — | current user + permissions + roles |
| PATCH | `/me/profile` | — | own profile |
| PATCH | `/me/password` | — | change own password |
| POST | `/me/2fa/enable` / `disable` / `verify` | — | TOTP |

### Members
| Method | Path | Permission |
|---|---|---|
| GET | `/members` | `members.read` |
| GET | `/members/:id` | `members.read` |
| POST | `/members` | `members.create` |
| PATCH | `/members/:id` | `members.update` |
| DELETE | `/members/:id` | `members.delete` |

### Locations
| Method | Path | Permission |
|---|---|---|
| GET | `/locations` | `locations.read` |
| POST | `/locations` | `locations.create` |
| PATCH | `/locations/:id` | `locations.update` |
| DELETE | `/locations/:id` | `locations.delete` |
| POST | `/locations/:id/set-current` | `locations.set_current` |
| POST | `/locations/:id/activate` / `deactivate` | `locations.update` |

### Services
`GET/POST/PATCH/DELETE /services` → `services.read` / `services.create` / `services.update` / `services.delete`; `POST /services/:id/enable` | `/disable` → `services.update`.

### Leadership & History
`GET/POST/PATCH/DELETE /leadership` (write: `leadership.manage`); `GET/POST/PATCH/DELETE /history` (write: `history.manage`).

### Events
| Method | Path | Permission |
|---|---|---|
| GET | `/events` | `events.read` |
| GET | `/events/:id` | `events.read` |
| POST | `/events` | `events.create` |
| PATCH | `/events/:id` | `events.update` |
| DELETE | `/events/:id` | `events.delete` |
| POST | `/events/:id/publish` / `unpublish` / `cancel` / `archive` | `events.update` |
| GET | `/events/:id/registrations` | `events.read` |
| POST | `/events/:occurrenceId/register` | public-or-member |

### Camps
| Method | Path | Permission |
|---|---|---|
| GET | `/camps` | `camp.read` |
| GET | `/camps/:id` | `camp.read` |
| POST | `/camps` | `camp.create` |
| PATCH | `/camps/:id` | `camp.update` |
| DELETE | `/camps/:id` | `camp.delete` |
| POST | `/camps/:id/status` | `camp.update` (open/close registration) |
| GET | `/camps/:id/registrations` | `camp.registration.read` |
| POST | `/camps/:id/register` | member/guest public |
| GET | `/camps/:id/accommodations` | `camp.read` (admin) / public prices |
| POST | `/accommodations` | `camp.accommodation.create` |
| PATCH | `/accommodations/:id` | `camp.accommodation.update` |
| DELETE | `/accommodations/:id` | `camp.accommodation.delete` |
| POST | `/transport-options` | `camp.transport.create` |
| PATCH | `/transport-options/:id` | `camp.transport.update` |
| DELETE | `/transport-options/:id` | `camp.transport.delete` |
| POST | `/camps/:id/checkin/:registrationId` | `camp.checkin.manage` |
### Giving
| Method | Path | Permission |
|---|---|---|
| GET | `/giving/transactions` | `giving.read` (finance scope) |
| GET | `/giving/transactions/mine` | self |
| GET | `/giving/summary` | `giving.report` |
| POST | `/giving/initiate` | member or guest — initiates MoMo, returns txn reference |
| GET | `/giving-categories` | public (active) / `giving_categories.manage` (admin all) |
| POST | `/giving-categories` | `giving_categories.manage` |
| PATCH | `/giving-categories/:id` | `giving_categories.manage` |
| DELETE | `/giving-categories/:id` | `giving_categories.manage` |
| POST | `/giving-categories/reorder` | `giving_categories.manage` |

### Payments (shared engine)
| Method | Path | Notes |
|---|---|---|
| POST | `/payments/momo` | Body: `{ payment_for, camp_registration_id? / giving_category_id?, amount, momo_network, phone }`. Validates amount server-side, creates `payments` row, returns internal reference + instructions |
| GET | `/payments/:reference` | status lookup (polling) |
| POST | `/payments/:reference/cancel` | user cancels pending |

### Webhooks (public, signed)
| Method | Path | Notes |
|---|---|---|
| POST | `/webhooks/paystack` | Verify `x-paystack-signature` (HMAC-SHA512, raw body), handle `charge.success` events, idempotent by reference + event id, respond `200` fast |

### First Timers
| Method | Path | Permission |
|---|---|---|
| GET | `/first-timers` | `first_timers.read` (filters: status, date range, service) |
| GET | `/first-timers/:id` | `first_timers.read` |
| POST | `/first-timers` | public (QR form) |
| POST | `/first-timers/:id/assign` | `first_timers.assign` |
| POST | `/first-timers/:id/followup` | `first_timers.followup` (creates history row) |
| PATCH | `/first-timers/:id` | `first_timers.update` |
| GET | `/first-timers/:id/followups` | `first_timers.read` |

### Groups & Fellowships
| Method | Path | Permission |
|---|---|---|
| GET | `/groups` | `groups.read` |
| POST | `/groups` | `groups.create` |
| PATCH | `/groups/:id` | `groups.update` (leader scoped or granted) |
| DELETE | `/groups/:id` | `groups.delete` |
| POST | `/groups/:id/members` | `groups.update` |
| DELETE | `/groups/:id/members/:memberId` | `groups.update` |
| GET | `/fellowships` | public active; admin: `fellowships.manage` |
| POST | `/fellowships` | `fellowships.manage` |
| PATCH | `/fellowships/:id` | `fellowships.manage` |
| DELETE | `/fellowships/:id` | `fellowships.manage` |
| POST | `/fellowships/:id/join` | member self-service |
| PATCH | `/fellowships/:id/members/:memberId` | `fellowships.manage` (approve/remove) |

### Sermons & Content
| Method | Path | Permission |
|---|---|---|
| GET | `/sermons` | public published; admin all: `sermons.update` |
| GET | `/sermons/:id` | public published; admin all |
| POST | `/sermons` | `sermons.create` |
| PATCH | `/sermons/:id` | `sermons.update` |
| DELETE | `/sermons/:id` | `sermons.delete` |
| POST | `/sermons/:id/publish` / `unpublish` | `sermons.update` |
| GET | `/announcements` | public active; admin all: `announcements.manage` |
| POST | `/announcements` | `announcements.manage` |
| PATCH | `/announcements/:id` | `announcements.manage` |
| DELETE | `/announcements/:id` | `announcements.manage` |

### Media
| Method | Path | Permission |
|---|---|---|
| POST | `/media` (multipart) | `media.upload` |
| GET | `/media` | `media.upload` or `media.delete` |
| DELETE | `/media/:id` | `media.delete` |

### Administration
| Method | Path | Permission |
|---|---|---|
| GET | `/users` | `users.manage` |
| POST | `/users` | `users.manage` |
| PATCH | `/users/:id` | `users.manage` |
| POST | `/users/:id/roles` | `users.manage` |
| DELETE | `/users/:id/roles/:roleId` | `users.manage` |
| POST | `/users/:id/reset-password` | `users.manage` |
| GET | `/roles` | `roles.manage` |
| POST | `/roles` | `roles.manage` |
| PATCH | `/roles/:id` | `roles.manage` (permission set) |
| DELETE | `/roles/:id` | `roles.manage` |
| GET | `/permissions` | `permissions.manage` |
| POST | `/permissions/sync` | `permissions.manage` (idempotent catalog sync) |
| GET | `/audit-logs` | `audit.read` |
| GET | `/reports/:name` | per-report permissions (`giving.report`, `camp.registration.read`, …) |
| GET | `/settings` | `settings.manage` (admin), public subset via `/public/church-info` |
| PATCH | `/settings` | `settings.manage` |

### Health
| Method | Path | Notes |
|---|---|---|
| GET | `/health` | overall (db + redis status) |
| GET | `/health/db` | DB ping |
| GET | `/health/redis` | Redis ping |
---

## 4. Camp Registration Flow (illustrative contract)

### STEP 1–4 Preview → creates a draft registration
```
POST /api/v1/camps/:id/register
{
  "fullName": "Ama Boateng",
  "phone": "+233241234567",
  "email": "ama@example.com",
  "memberId": null,
  "group": "Kumasi District",
  "accommodationId": "…",
  "transportId": "…"
}
```
→ `201 { registrationReference, totalAmount, registrationId, qrIdentifier }`, `registration_status: draft`.

### STEP 5 Payment
```
POST /api/v1/payments/momo
{
  "paymentFor": "camp",
  "campRegistrationId": "…",
  "amount": 35000,            // server validates against fee + accommodation + transport
  "momoNetwork": "mtn",       // mtn | telecel | at
  "phone": "+233241234567"
}
```
→ `201 { internalReference, status: "pending" }` — server calls Paystack `initialize` with `channels: ["mobile_money"]`.

### STEP 6 Confirmation (poll or after webhook)
```
GET /api/v1/payments/:reference  → { status: "successful" }
```
Then `GET /api/v1/camps/:slug/public/registration?ref=CAMPR-2026-000123` shows confirmation + QR (only after `paid`).

---

## 5. Rate Limiting

| Scope | Limit | Window |
|---|---|---|
| Global | 300 | 60 s |
| Auth (login/register/forgot) | 10 | 60 s |
| First-timer submit | 5 | 60 s (per IP) |
| Webhooks | none (signature-gated) | — |

Limits enforced at edge (Cloudflare) and in-app (Redis-backed throttler). On exceed: `429`.

---

## 6. Versioning & OpenAPI

- URI versioning (`/api/v1`); additive changes within v1; breaking changes bump to v2 with co-existence window.
- NestJS Swagger (`@nestjs/swagger`) generates OpenAPI at `/docs` (also in CI artifact).
- `packages/shared` exports Zod DTOs imported by both API (validation) and web (types).

---

## 7. Response Shape Policy

- List envelopes: `{ data, meta }`.
- Single resources: `{ data }`.
- Mutation resources: `{ data, message? }` (message for human feedback like `"Registration is currently full."`).
- Export endpoints (`/reports/*/export`): `application/csv` or `application/pdf` with `Content-Disposition` attachment; server-side generated, permission-gated.

---

## 8. Testing Notes for API

- Integration suite boots the API against a **test database** (dockerized Postgres) + test keys for Paystack (webhook fixtures).
- RBAC matrix tests: every protected route × representative roles (401/403/200 matrix).
- Idempotency tests replay the same webhook twice — one state transition only.