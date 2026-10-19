# Development Setup & Workflow

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 LTS | `nvm use` / `fnm use` |
| pnpm | ≥ 9 | Corepack enabled (`corepack enable`) |
| Docker Desktop | latest | Postgres + Redis locally; optional for full stack |
| Git | ≥ 2.30 | |

Optional (API-first):
- **Paystack test mode** (dashboard: test keys).
- **ngrok / Cloudflare Tunnel** (webhook forwarding to localhost).

---

## 2. First-Time Setup

```bash
git clone <repo-url> church-digital-platform
cd church-digital-platform
corepack enable
pnpm install

# infrastructure
docker compose -f infra/docker/docker-compose.dev.yml up -d   # Postgres + Redis

# config
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# Fill in local values (see docs/ENVIRONMENT.md)

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

## 3. Daily Commands

| Command | What it does |
|---|---|
| `pnpm dev` | API + web in watch mode |
| `pnpm lint` | ESLint across monorepo |
| `pnpm typecheck` | TypeScript project references (full monorepo) |
| `pnpm test` | Vitest unit + integration (API) |
| `pnpm db:migrate` | Drizzle Kit migrate (dev DB) |
| `pnpm db:seed` | Idempotent seed |
| `pnpm db:studio` | Drizzle Studio (visual DB browser) |
| `pnpm db:generate` | Generate migration from schema changes |
| `pnpm build` | Production build (web + api) |
| `pnpm test:e2e` | Playwright against local dev (web e2e) |

---

## 4. Monorepo Structure

| Path | Tech | Notes |
|---|---|---|
| `apps/web` | Next.js | Public site + portals |
| `apps/api` | NestJS + Fastify | Modular monolith API |
| `packages/database` | Drizzle | Schema, migrations, seeds |
| `packages/shared` | Zod + TS | DTOs/types shared by both apps |
| `packages/eslint-config` | ESLint | Shared config |

Changes to `packages/*` require rebuild/restart of consumers (Turborepo handles this).

---

## 5. API Development (NestJS)

```bash
cd apps/api
pnpm dev
```

### Adding a new module
1. Create `src/modules/<name>/module.ts`, `controller.ts`, `service.ts`, `dto.ts`.
2. Register the module in `src/app.module.ts`.
3. Add schema to `packages/database/src/schema` if new tables.
4. Run `pnpm db:generate` then `pnpm db:migrate`.
5. Seed via `packages/database/seed/`.
6. Write integration test against a test DB (see docs/TESTING.md).
7. Document endpoints in `docs/API.md`.
8. Document permissions in `docs/RBAC.md` if new protected actions.

### Error handling
Use the centralized filter (`AllExceptionsFilter`) — never `try/catch` with manual HTTP responses. Domain errors map via `DomainError → HttpException` in the filter.

---

## 6. Frontend Development (Next.js)

```bash
cd apps/web
pnpm dev
```

### Routes
- `(public)/` → SSG/ISR (use Next.js static generation or `revalidate = short`).
- `(member)/member/*` and `(admin)/admin/*` → client components + TanStack Query hooks.
- New public page: add `page.tsx` under the route folder; export `generateMetadata` for SEO.

### Components
- UI primitives live in `components/ui/` (shadcn/ui managed).
- Feature components per domain live in `components/features/<module>/`.
- Reuse: if a component is used ≥3 times, promote it to `components/shared/`.

### Data hooks
- Create per-domain hooks in `hooks/<module>.ts`.
- Use `queryKey` namespaced by module + action.
- Always add `refetchOnWindowFocus: false` for public lists; use `invalidateQueries` on mutations.

---

## 7. Webhook Local Development

1. Start the API (`pnpm dev`).
2. Run `ngrok http 4000` → copy the HTTPS URL.
3. Paste into Paystack dashboard webhook settings.
4. Alternatively, craft the fixture `test/fixtures/paystack-charge-success.json` and call the webhook endpoint directly in an integration test.

---

## 8. Version Control Workflow

### Branch naming
```
feat/<phase>-<scope>
fix/<scope>
docs/<scope>
chore/<scope>
```

### Commit messages
```
feat(payments): add MoMo payment initiation endpoint

- Create payments ledger and reference generator
- Initialize Paystack transaction with channels: ["mobile_money"]
- Validate amount server-side from canonical prices
- Add unit + integration tests for success/failure paths
```

### Pull request flow
1. Create branch from `main`.
2. Implement, lint, typecheck, test.
3. Open PR; CI runs full pipeline.
4. Review against docs/RBAC.md, docs/PAYMENTS.md, docs/SECURITY.md checklist.
5. Merge after approval + green CI.
6. Staging auto-deploys (or manual tag for production).

---

## 9. Phase Work Protocol

1. Start Phase N: create `feat/phase-N-<scope>` branch.
2. Write/update relevant `docs/` files (API, DATABASE, RBAC, DESIGN as needed).
3. Implement backend first, then frontend integration.
4. Write tests for the phase.
5. Run the **phase verification gate** (see docs/PLAN.md §Phase Verification Gate).
6. Fix any failure before starting Phase N+1.
7. Open PR against `main` — CI validates full gate.
8. After merge, tag the phase completion (`v0.1.0-phase-1` style).

---

## 10. IDE Recommendations

- **VS Code** with: ESLint, Prettier, Tailwind CSS IntelliSense, GitLens.
- `tsconfig.base.json` shared; individual `tsconfig.json` in apps.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `pnpm db:migrate` fails | DB URL wrong or DB not running | Check `apps/api/.env`, confirm Postgres up via Docker |
| Auth cookie not set in browser | `COOKIE_SECURE=true` on localhost | Set `false` locally |
| Webhook 401 | `PAYSTACK_WEBHOOK_SECRET` differs from Paystack dashboard | Rotate both, deploy |
| `NEXT_PUBLIC_` vars missing in browser | Not in `.env.local` or not prefixed correctly | Rebuild web after adding |
| Rate limit hit | Too many calls from same IP | Use test keys that bypass, or wait window |