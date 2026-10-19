# Role-Based Access Control (RBAC)

## 1. Core Principle: Position ≠ Role ≠ Permission

The church hierarchy (Pastor → Group Leader → Secretary → Fellowship Leader → Members) is a **membership/organizational concept**. It must **never** be used alone to authorize system actions.

```
Church Position   →  descriptive (Secretary)      — organizational rank
System Role       →  functional (Event Manager)   — set of permissions assigned to a user
Permission        →  atomic capability (events.delete)
```

**Rule:** `if (user.role === "pastor")` is banned everywhere. All authorization flows through permissions:

```
User ──(user_roles)──► Role ──(role_permissions)──► Permission
```

---

## 2. Data Model

| Table | Purpose |
|---|---|
| `users` | System account (authenticated principal) |
| `roles` | Named bundles of permissions (system + custom) |
| `permissions` | Atomic capability catalog (key is the contract) |
| `user_roles` | N:M user → roles (a user can hold several roles) |
| `role_permissions` | N:M role → permissions |
| `church_positions` | Organizational rank only (Pastor → Member) |
| `members.profile` | Links a person to `church_positions`, groups, fellowships |

All lookups are **pre-computed per request**: the auth guard loads the user's permission key set and the `RequirePermissions` guard checks membership.

---

## 3. Permission Catalog (keys are the source of truth)

### Members
`members.read`, `members.create`, `members.update`, `members.delete`

### Events
`events.read`, `events.create`, `events.update`, `events.delete`

### Locations
`locations.read`, `locations.create`, `locations.update`, `locations.delete`, `locations.set_current`

### Services
`services.read`, `services.create`, `services.update`, `services.delete`

### Church content
`church.manage`, `history.manage`, `leadership.manage`

### Camps
`camp.read`, `camp.create`, `camp.update`, `camp.delete`
`camp.registration.read`, `camp.registration.manage`
`camp.accommodation.create`, `camp.accommodation.update`, `camp.accommodation.delete`
`camp.transport.create`, `camp.transport.update`, `camp.transport.delete`
`camp.checkin.manage`
`camp.payments.read`

### First Timers
`first_timers.read`, `first_timers.assign`, `first_timers.update`, `first_timers.followup`

### Sermons / Announcements / Media
`sermons.create`, `sermons.update`, `sermons.delete`
`announcements.manage`
`media.upload`, `media.delete`

### Groups & Fellowships
`groups.read`, `groups.create`, `groups.update`, `groups.delete`
`fellowships.read`, `fellowships.manage`

### Giving (strictly restricted)
`giving.read`, `giving.manage`, `giving.report`, `giving_categories.manage`

### Administration
---

## 4. Default System Roles (seed data — admin-editable)

| Role slug | Key permissions | Scope note |
|---|---|---|
| `super-admin` | All permissions | Full system; may manage roles/audit — not granted lightly; 2FA enforced |
| `pastor` | Broad delegation set: members.read, events.read/update, locations.set_current, sermons.*, reports.read_all, audit.read | Oversight; finance visibility only when explicitly granted |
| `group-leader` | members.read (own group), groups.update (own group), events.read | Scoped to assigned group(s) |
| `secretary` | events.create/update, members.create (registration desk), services.read | Operational |
| `fellowship-leader` | fellowships.update (own), members.read (own fellowship) | Scoped |
| `member` | events.read, camp.read, sermons.read, giving.read (self), fellowships.read | Portal self-service |
| `first-timers-team` | first_timers.read/assign/update/followup | **No** giving, no finance, no settings |
| `finance-officer` | giving.read, giving.report, giving.manage (refunds), camp.payments.read, reports.read_all | Financial records — nothing else by default |
| `camp-manager` | camp.* (create/update/delete, accommodation, transport, checkin, registrations) | Full camp scope |
| `event-manager` | events.* (create/update/delete), locations.read, event registrations | Event scope |
| `media-admin` | media.upload, media.delete, sermons.* | Media + sermon library |
| `content-manager` | announcements.manage, sermons.update, history.manage, leadership.manage, settings.manage (content keys) | Website content |

> These roles are **seed data**, not hardcoded logic. The system administrator can create additional custom roles and reassign permissions at runtime.

---

## 5. Permission-Privilege Truth Table for Sensitive Areas

### Giving / Finance
| Who | Sees what |
|---|---|
| Member | Own donation history only (`giving.read` self-scoped) |
| Fellowship Leader / Group Leader | **Nothing** unless explicitly granted `giving.read` |
| First-Timers Team | **Nothing** |
| Finance Officer | Aggregates + member-level records (`giving.report` / `giving.read`) |
| Super Admin / Pastor (if granted) | Reports; access is grant-based, not automatic |

### First Timers
| Who | Sees what |
|---|---|
| First-Timers Team | All records + assignments + follow-ups |
| Fellowship Leader | Scope via explicit `first_timers.read` only (rare) |
| Members / Group Leaders | **Nothing** |

### Camps
| Who | Sees what |
|---|---|
| Camp Manager | Camps, registrations, accommodation, transport, pricing, check-in, payments |
| Finance Officer | Camp payment records / revenue reports |
| Member | Own registration + public camp info |
`users.manage`, `roles.manage`, `permissions.manage`, `audit.read`, `settings.manage`, `reports.read_all`
---

## 6. Enforcement Points (never frontend-only)

1. **`RequirePermissions('events.delete')`** — NestJS guard attached to the controller route. Backend returns `403 Forbidden` on miss.
2. **Scoped authorization** in services — Group/Fellowship leaders additionally checked for ownership (`WHERE group_id = X AND leader_id = currentUser`).
3. **Row-level checks** for self-service (`member/camp/registration` ownership).

Verification tests (docs/TESTING.md):
- Member → `DELETE /api/v1/events/:id` → `403`.
- First-Timers Team → `GET /api/v1/giving/transactions` → `403`.
- Fellowship Leader → list members of another fellowship → `403`.
- Unauthenticated → protected routes → `401`.

---

## 7. Multi-Role Behavior

A user may hold multiple roles. Effective permission set = **union** of all role permissions. Example:

```
Akwasi: Church Position = Secretary
        System Roles     = Event Manager, First-Timers Team
        Permissions      = events.* ∪ first_timers.*
```

Removing a role instantly removes its permissions (no permission denormalization per user).

---

## 8. Admin Sidebar Mapping (role-aware)

The admin sidebar renders sections based on the user's **effective permissions**, e.g.:
- **GIVING** section visible only if any `giving.*` permission is present.
- **ADMINISTRATION** (Users, Roles, Permissions, Audit, Settings) only for `users.manage`, `roles.manage`, `permissions.manage`, `audit.read`, `settings.manage`.

Hiding UI is UX; the protective boundary is the server guard.

---

## 9. Sensitive-Role 2FA Policy

Roles flagged `requires_2fa = true`:
- Super Administrator
- Pastor
- Finance Officer

User-level `two_factor_enabled` gates login for users holding a flagged role.

---

## 10. Custom Roles

Admins with `roles.manage` + `permissions.manage` can:
- Create roles, name them, assign/revoke any catalog permission.
- System roles (`is_system = true`) cannot be deleted; permission sets adjustable only by a Super Administrator.
- Immutable `key`/`slug` assigned only at creation.

---

## 11. Permission-to-Phase Mapping

Permission groups ship in the phase where the module ships (Phase 2 seeds the full catalog; Phase 13 adds `reports.read_all` + audit). No permission is referenced before it exists in the catalog — CI validates permission keys against the catalog.