# Database Design

**Database:** PostgreSQL 16+ (managed, connection-pooled)
**ORM:** Drizzle ORM (schema-first TS) + Drizzle Kit migrations (append-only)
**Principles:** normalized tables, explicit PKs/FKs/uniques, check constraints for controlled values, status fields as text with CHECK constraints (not enums) for migration flexibility, soft deletes where applicable, `created_at`/`updated_at` on every table.

---

## 1. Conventions

- **IDs:** `uuid` primary keys (`gen_random_uuid()`), referenced as `<table>_id`.
- **Timestamps:** `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()` (maintnained by trigger or ORM hook).
- **Soft delete:** `deleted_at timestamptz` on domain tables where historical retention matters (events, camps, giving categories, sermons). Hard delete only for transient data (first-timer submissions are never hard-deleted; audit holds the truth).
- **Monetary values:** `integer` in **Ghana pesewas** (minor units) — never floats.
- **Phone numbers:** normalized `text` with CHECK regex; stored with country code.
- **Statuses:** `text` + `CHECK (status IN (...))` so new values ship via migration without DDL enum churn.
- **Every admin mutation** is also written to `audit_logs` (out of transaction scope concerns handled by module).

---

## 2. Entity Relationship Overview

```
users 1─1 profiles
users N─M roles (user_roles)         roles N─M permissions (role_permissions)
members 1─1 users (optional)
members N─1 groups, N─M fellowships (fellowship_members)
groups N─1 group_leader (users)
locations 1─N services/events/camps
camps 1─N camp_accommodations, camp_transport_options, camp_registrations
camp_registrations N─1 accommodation_id, N─1 transport_id
payments 1─N donations / camp_registrations (via payment_id)
first_timers 1─N first_timer_followups
```

Full DDL lives in `packages/database/migrations` via Drizzle Kit. The reference schema below is the contract.

---

## 3. Core Identity & Security

### users
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| email | text | null unique |
| phone | text | null unique, CHECK phone regex |
| email_verified_at | timestamptz | |
| phone_verified_at | timestamptz | |
| password_hash | text | not null (Argon2id) |
| two_factor_enabled | boolean | default false |
| two_factor_secret | text | null (encrypted) |
| status | text | CHECK: active, disabled, pending_verification |
| last_login_at | timestamptz | |
| created_at / updated_at | timestamptz | |

*At least one of email/phone required per user (CHECK).*

### sessions
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users, index |
| token_hash | text | unique (hash of opaque session token) |
| ip_address | text | |
| user_agent | text | |
| expires_at | timestamptz | |
| revoked_at | timestamptz | null |
| created_at | timestamptz | |

### permissions
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| key | text | unique (e.g. `events.create`) |
| module | text | not null, indexed |
| description | text | |
| created_at | timestamptz | |

### roles
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | unique (e.g. `Event Manager`) |
| slug | text | unique (e.g. `event-manager`) |
| is_system | boolean | default false (system roles protected) |
| description | text | |
| created_at / updated_at | timestamptz | |

### user_roles
| column | type | constraints |
|---|---|---|
| user_id | uuid | FK users |
| role_id | uuid | FK roles |
| PK (user_id, role_id) | | |

### role_permissions
| column | type | constraints |
|---|---|---|
| role_id | uuid | FK roles |
| permission_id | uuid | FK permissions |
| PK (role_id, permission_id) | | |

### church_positions
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | unique (Pastor, Group Leader, Secretary, Fellowship Leader, Member) |
| slug | text | unique |
| hierarchy_level | int | unique check: 1=Pastor … 5=Member |
| description | text | |

### profiles / members
| column | type | constraints |
|---|---|---|
| id | uuid | PK (joined 1:1, one row per user) |
| user_id | uuid | FK users, unique |
| full_name | text | not null |
| full_name = head-of-household note: family members tracked as separate member rows |
| profile_photo_url | text | |
| group_id | uuid | FK groups (null) |
| church_position_id | uuid | FK church_positions (null) |
| membership_status | text | CHECK: prospect, active, inactive |
| member_number | text | unique (sequential, generated) |
| emergency_contact_name / phone | text | null |
| created_at / updated_at | timestamptz | |

*Decided: no sensitive personal data (no ID numbers, no health data) beyond what supports church operations.*
---

## 4. Church Content & Operations

### locations
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | not null (e.g. "Grace Auditorium") |
| venue_name | text | null |
| area | text | null |
| address | text | null |
| ghana_post_digital_address | text | null |
| landmark | text | null |
| latitude / longitude | double precision | null |
| google_maps_url | text | null |
| description | text | null |
| is_active | boolean | default true |
| is_current | boolean | default false (CHECK: at most one current via partial unique index) |
| created_at / updated_at | timestamptz | |

Partial unique index: `CREATE UNIQUE INDEX one_current_location ON locations (is_current) WHERE is_current = true;`

### services (church services)
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | not null (e.g. "First Service") |
| day | text | CHECK: sunday, monday, …, saturday |
| start_time | time | not null |
| end_time | time | null |
| location_id | uuid | FK locations (null) |
| description | text | |
| enabled | boolean | default true |
| display_order | int | default 0 |

### church_history
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| year | int | not null |
| date | date | null |
| title | text | not null |
| description | text | |
| image_url | text | |
| display_order | int | default 0 |

### leaders
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | not null |
| photo_url | text | |
| position | text | not null (church position label, e.g. "Senior Pastor") |
| short_bio | text | |
| display_order | int | default 0 |
| active | boolean | default true |

### settings (church information)
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| key | text | unique (e.g. `church.name`, `contact.phone`, `social.instagram`) |
| value | jsonb | not null |
| updated_by | uuid | FK users |
| updated_at | timestamptz | |

---

## 5. Groups & Fellowships

### groups
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | not null unique |
| description | text | |
| leader_id | uuid | FK users (null) |
| meeting_details | text | |
| location_id | uuid | FK locations (null) |
| is_active | boolean | default true |

### group_members
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| group_id | uuid | FK groups |
| member_id | uuid | FK members |
| joined_at | timestamptz | default now |
| UNIQUE (group_id, member_id) | | |

### fellowships
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | not null unique |
| description | text | |
| leader_id | uuid | FK users (null) |
| meeting_day | text | null |
| meeting_time | time | null |
| location | text | null |
| image_url | text | |
| status | text | CHECK: active, archived |

### fellowship_members
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| fellowship_id | uuid | FK fellowships |
| member_id | uuid | FK members |
| status | text | CHECK: pending, approved, left |
| UNIQUE (fellowship_id, member_id) | | |

---

## 6. Events

### events
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| title | text | not null |
---

## 7. Camps, Accommodation & Transport

### camps
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | not null |
| slug | text | not null unique |
| theme | text | |
| description | text | |
| hero_image_url | text | |
| start_date | date | not null |
| end_date | date | not null (CHECK end_date >= start_date) |
| registration_deadline | timestamptz | null |
| location_id | uuid | FK locations (null) |
| maximum_capacity | int | not null CHECK > 0 |
| registration_fee | int | not null default 0 (pesewas) |
| registration_status | text | CHECK: not_started, open, almost_full, full, closed |
| created_at / updated_at | timestamptz | |

### camp_accommodations
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| camp_id | uuid | FK camps, index |
| name | text | not null (Shared Room, Dormitory, Own Accommodation, …) |
| description | text | |
| price | int | not null default 0 (pesewas) |
| capacity | int | not null CHECK > 0 |
| spaces_remaining | int | not null (CHECK >= 0) — guarded in transactions |
| enabled | boolean | default true |
| sort_order | int | default 0 |

*`spaces_remaining` is atomically decremented with `UPDATE ... SET spaces_remaining = spaces_remaining - 1 WHERE id = ? AND spaces_remaining > 0 RETURNING` — no overbooking.*

### camp_transport_options
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| camp_id | uuid | FK camps, index |
| name | text | not null |
| pickup_location | text | |
| departure_time | time | |
| price | int | not null default 0 |
| capacity | int | null CHECK > 0 (null = unlimited) |
| enabled | boolean | default true |

### camp_registrations
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| camp_id | uuid | FK camps, index |
| member_id | uuid | FK members (null) |
| full_name | text | not null |
| phone | text | not null |
| email | text | null |
| group_id | uuid | FK groups (null) |
| fellowship_id | uuid | FK fellowships (null) |
| emergency_contact_name / phone | text | null |
| accommodation_id | uuid | FK camp_accommodations (null) |
| transport_id | uuid | FK camp_transport_options (null) |
| total_amount | int | not null (pesewas) |
| registration_reference | text | unique (e.g. `CAMPR-2026-000123`) |
| qr_identifier | text | unique (random token embedded in QR) |
| registration_status | text | CHECK: draft, confirmed, waitlisted, cancelled |
| payment_status | text | CHECK: unpaid, pending, paid, refunded |
| check_in_time | timestamptz | null |
| checked_in_by | uuid | FK users (null) |
| created_at / updated_at | timestamptz | |

*Confirmation rule: confirmed registration requires `payment_status = paid` (or admin-marked free) plus capacity available at confirmation time. Waitlist: `registration_status = waitlisted` parked until a spot opens.*

### camp_checkins
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| camp_registration_id | uuid | FK camp_registrations, unique (one check-in per registration) |
| checked_in_by | uuid | FK users |
| device | text | (user agent / scanner device) |
| created_at | timestamptz | |

---

## 8. Payments & Giving

### payments
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| reference | text | unique (internal reference like `CDP_20260101_AbC123`) |
| paystack_reference | text | unique null (gateway txn reference) |
| payer_email | text | null |
| payer_phone | text | null |
| amount | int | not null (pesewas) |
| currency | text | not null default 'GHS' |
| channel | text | CHECK: momo (never card) |
| status | text | CHECK: pending, successful, failed, cancelled, timed_out |
| payment_for | text | CHECK: camp, event, giving |
| giving_category_id | uuid | FK giving_categories (null) |
| camp_registration_id | uuid | FK camp_registrations (null) |
| gateway_payload | jsonb | null (sanitized raw Paystack response, no secrets) |
| webhook_events | jsonb | default '[]' (idempotency log of event ids) |
| expires_at | timestamptz | (MoMo session window) |
| created_at / updated_at | timestamptz | |

**Webhook idempotency:** unique index on `paystack_reference` + lock row `FOR UPDATE` while transitioning; known/duplicate Paystack event ids appended to `webhook_events` and acknowledged without re-processing.

### giving_categories
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| name | text | not null unique (Tithe, Offering, Rhapsody, …) |
| description | text | |
| active | boolean | default true (index) |
| sort_order | int | default 0 |
| created_at / updated_at | timestamptz | |

### donations
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| payment_id | uuid | FK payments, unique |
| giving_category_id | uuid | FK giving_categories |
| member_id | uuid | FK members (null = guest) |
| donor_name / email | text | null (guest optional info) |
| amount | int | not null (pesewas) |
| created_at | timestamptz | index |

*Giving privacy: detailed records gated by `giving.read`, `giving.manage`, `giving.report`. Member-level access is self-scoped only.*
| slug | text | not null unique |
| description | text | |
| short_description | text | |
| image_url | text | |
| event_type | text | CHECK: service, program, outreach, conference, other |
| start_date | date | not null |
| end_date | date | null (CHECK end_date >= start_date) |
| start_time | time | null |
| end_time | time | null |
| location_id | uuid | FK locations (null) |
| registration_required | boolean | default false |
| registration_deadline | timestamptz | null |
| capacity | int | null (CHECK > 0) |
| recurrence_rule | jsonb | null (see below) |
| status | text | CHECK: draft, published, cancelled, archived |
| created_by | uuid | FK users |
| created_at / updated_at | timestamptz | |

---

## 9. First Timers

### first_timers
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| full_name | text | not null |
| phone | text | not null (index) |
| email | text | null |
| area_of_residence | text | null |
| heard_about | text | null |
| service_id | uuid | FK services (null, index) |
| service_attended_label | text | null (snapshot for historical integrity) |
| wants_contact | boolean | default false |
| visit_date | date | not null (index) |
| status | text | CHECK: new, assigned, contacted, follow_up_required, joined_fellowship, became_member |
| assigned_to | uuid | FK users (null) |
| follow_up_date | date | null |
| notes | text | null |
| created_at / updated_at | timestamptz | |

### first_timer_followups
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| first_timer_id | uuid | FK first_timers, index |
| team_member_id | uuid | FK users |
| status | text | (status after this follow-up) |
| note | text | null |
| follow_up_date | date | not null |
| created_at | timestamptz | |

*Follow-up history is append-only; never overwriting a single note field.*

---

## 10. Sermons, Announcements, Media, Notifications

### sermons
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| title | text | not null |
| slug | text | not null unique |
| preacher | text | |
| date | date | index |
| scripture | text | |
| description | text | |
| category | text | |
| video_url | text | |
| audio_url | text | |
| thumbnail_url | text | |
| duration | int | null (seconds) |
| published | boolean | default false (index) |
| created_at / updated_at | timestamptz | |

### announcements
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| title | text | not null |
| message | text | not null |
| priority | text | CHECK: normal, important, urgent |
| start_date | date | not null |
| end_date | date | null |
| published | boolean | default true |
| created_at / updated_at | timestamptz | |

*Auto-expiry: query filters `published AND start_date <= today AND (end_date IS NULL OR end_date >= today)`. Cron/pruning job marks expired records for cleanliness.*

### media
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| key | text | not null unique (R2 object key) |
| url | text | not null |
| mime_type | text | not null |
| size_bytes | int | not null |
| width / height | int | null |
| alt_text | text | |
| uploaded_by | uuid | FK users |
| created_at | timestamptz | |

### notifications
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users, index |
| type | text | not null (camp_confirmation, event_reminder, first_timer_assignment, …) |
| title | text | not null |
| body | text | |
| data | jsonb | null |
| read_at | timestamptz | null |
| created_at | timestamptz | |

### notifications_outbox (channel delivery ledger)
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| notification_id | uuid | FK notifications |
| channel | text | CHECK: in_app, email, sms, whatsapp |
| status | text | CHECK: pending, sent, failed |
| sent_at | timestamptz | |
| error | text | null |

---

## 11. Audit Logs

### audit_logs
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| actor_user_id | uuid | FK users (null = system) |
| action | text | not null (created, updated, deleted, set_current, exported, …) |
| module | text | not null |
| entity_type | text | not null |
| entity_id | uuid | not null |
| old_values | jsonb | null (safe, no secrets/passwords) |
| new_values | jsonb | null |
| ip_address | text | null |
| user_agent | text | null |
| request_id | text | null |
| created_at | timestamptz | index |

*Never log passwords, tokens or sensitive payment credentials. `old/new_values` exclude `password_hash`, `two_factor_secret`.*
**recurrence_rule** `jsonb` shape:
```json
{ "freq": "weekly" | "monthly" | "custom",
  "interval": 1,
  "by_weekday": ["wednesday","thursday"],
  "count": null, "until": "2026-12-31" }
```
Occurrences are materialized into `event_occurrences` at write time (bounded; capped far future), so listing is index-friendly.

### event_occurrences
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK events, index |
| occurrence_date | date | not null |
| start_time | time | |
| end_time | time | |
| UNIQUE (event_id, occurrence_date) | | |

### event_registrations
| column | type | constraints |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK events, index |
| occurrence_id | uuid | FK event_occurrences (null for one-time) |
| member_id | uuid | FK members (null for guests) |
| full_name | text | not null |
| phone | text | not null |
| email | text | null |
| status | text | CHECK: pending, confirmed, cancelled, attended |
| created_at | timestamptz | |

*Capacity rule: count of `status IN ('pending','confirmed')` vs `events.capacity` — enforced inside a transaction with `FOR UPDATE` on the event row.*
---

## 12. Index Strategy

Indexes are aligned to real query patterns (not created blindly). Core set:

| Table | Index | Rationale |
|---|---|---|
| users | `email`, `phone` (unique) | login identity |
| sessions | `token_hash` (unique), `user_id` | session lookup |
| roles / permissions | unique `slug` / `key` | lookups |
| locations | partial unique on `(is_current) WHERE is_current` | "current location" invariant |
| services | `(enabled, day, display_order)` | public service list |
| events | `status`, `start_date`, `published` | upcoming/past lists, filters |
| events | `slug` (unique) | public detail by slug |
| event_occurrences | `(event_id, occurrence_date)` | recurrence materialization |
| event_registrations | `event_id`, `member_id`, `status` | capacity + member history |
| camps | `slug` (unique), `registration_status` | public + status queries |
| camp_registrations | `camp_id`, `member_id`, `payment_status`, `registration_reference` (unique), `qr_identifier` (unique) | capacity, member view, confirm, QR scan |
| camp_accommodations | `camp_id` | registration form |
| camp_transport_options | `camp_id` | registration form |
| payments | `reference` (unique), `paystack_reference` (unique), `status`, `created_at` | verification + ledger |
| giving_categories | `active` | public give form |
| donations | `created_at`, `member_id`, `giving_category_id` | reports, member history |
| first_timers | `phone`, `visit_date`, `service_id`, `status` | dashboard filters, dedupe check |
| first_timer_followups | `first_timer_id` | history timeline |
| sermons | `published`, `date`, `slug` (unique) | library + detail |
| announcements | `(published, start_date, end_date)` | active list |
| audit_logs | `created_at`, `(module, entity_id)` | audit viewer |

Additional composite indexes are added during Phase 14 profiling based on EXPLAIN analysis.

---

## 13. Data Integrity Rules (enforced in DB + service)

- **Capacity:** `camp_registrations` count (`confirmed`) vs `camps.maximum_capacity`; checked with the camp row locked (`SELECT ... FOR UPDATE`). Accommodation `spaces_remaining` decremented atomically with a conditional `UPDATE ... WHERE spaces_remaining > 0`.
- **Current location:** partial unique index guarantees at most one `is_current = true`.
- **Amounts:** stored in minor units (GHS pesewas); `CHECK (amount >= 0)`.
- **Phone format:** normalized `+233XXXXXXXXX`; CHECK regex `^\+[1-9]\d{7,14}$`.
- **Webhook idempotency:** unique `paystack_reference`; duplicate event-id suppression via `webhook_events` jsonb and row `FOR UPDATE`.
- **Money never floats:** casts/conversions happen only at DTO boundary for display.

---

## 14. Migrations & Seeding

- `packages/database/migrations/*` — Drizzle Kit migrations, append-only, forward-only.
- `packages/database/seed/*` — development seeds (see docs/SEED_DATA.md). Seeds are idempotent (upsert by unique keys).
- Never hand-edit production schemas.

---

## 15. Performance Guardrails

- Pagination required for list endpoints (`page`/`pageSize`, default 20, max 100).
- N+1 queries banned; enforce relation joins or `with` fetches.
- JSONB for flexible/settings data only; never for relational queryable data.
- Connection pooling via PgBouncer/managed pooler in production (`DATABASE_POOL_MAX`).