# Seed data

The database seed contains only application authorization configuration and one administrator account. It is idempotent and can be run repeatedly with `pnpm db:seed`.

## System configuration

The seed synchronizes the permission catalog, system roles, role-permission bindings, and church-position lookup values required by registration and authorization. These records configure application behavior and are not website content.

## Seeded account

| Email | Password | Role |
|---|---|---|
| `superadmin@church.test` | `Test@1234` | Super Administrator |

No member accounts, camps, accommodation options, bookings, announcements, sermons, service updates, gallery photos, or audit records are seeded. Members register through the website, and administrators create church content through the admin portal.

Production seeding requires `SEED_STRICT=true`. Change the initial administrator password immediately after the first production login.
