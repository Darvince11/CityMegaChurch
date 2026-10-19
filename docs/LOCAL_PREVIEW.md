# Local preview

Run `pnpm preview`, or on Windows run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-preview.ps1
```

Dependencies must already be installed (`pnpm install`). The launcher builds the shared packages and API, reuses a local PostgreSQL database or starts the bundled PostgreSQL server, applies migrations, and seeds development accounts. It only accepts a local database URL. Existing data is preserved, and the development role catalog is refreshed.

Open the URL printed by the launcher (normally http://localhost:3000). If the default ports are occupied, it uses the next available ports. Leave the launcher running; Ctrl+C stops the preview processes. A database that was already running remains running.

Administrator login: `superadmin@church.test` / `Test@1234`. No sample members or content are seeded; create them through the application.

Available pages: home, about, registration, login, and a small account view with logout. Registration creates a real local account. Church content, events, giving, camps, and full admin/member portals remain planned features. Redis is optional for this foundation preview; health reports it as down when unavailable.

Verification:

```powershell
pnpm lint
pnpm typecheck
pnpm test
node scripts/smoke-preview.mjs
```

If the preview uses a different port, set `PREVIEW_URL` to its printed URL before running the smoke script. The smoke script creates one local test member, checks duplicate-account handling, and revokes its session.

The preview does not enable the planned production controls such as 2FA or Redis-backed rate limiting.
