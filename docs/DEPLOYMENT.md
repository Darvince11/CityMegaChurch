# Deployment

## 1. Target Topology

```
Cloudflare
  ├─ DNS (apex + www → web container/CDN)
  ├─ CDN/cache (static assets, ISR pages)
  ├─ WAF + rate limiting (public edge)
  └─ TLS termination (Full strict → origin)
        │
        ├── Web container   (Next.js standalone, HTTPS)
        ├── API container   (NestJS/Fastify, HTTPS)  ← CORS: web origin only
        └── Worker processes (BullMQ from the same image)
              │
              ├── Managed PostgreSQL (private VPC, TLS, encrypted, pooler)
              ├── Managed Redis (private VPC, TLS)
              └── Cloudflare R2 (media)
```

PostgreSQL and Redis are **never** publicly exposed. Only the API container receives inbound traffic.

---

## 2. Container Images

Both images are **multi-stage, non-root, production-optimized**.

### Backend (`infra/docker/api.Dockerfile`)
```
Stage 1 build:  node:22-bookworm-slim → pnpm → install --frozen-lockfile → build
Stage 2 runtime: node:22-bookworm-slim (distroless-style slim image)
  - copy dist + node_modules (prod)
  - create non-root user `node`
  - EXPOSE 4000
  - HEALTHCHECK wget /health
```

### Frontend (`infra/docker/web.Dockerfile`)
```
Stage 1 build:  node:22-bookworm-slim → pnpm → build (NEXT_OUTPUT=standalone)
Stage 2 runtime: gcr.io/distroless/nodejs non-root
  - copy .next/standalone + static + public
  - EXPOSE 3000
```

### Compose (production)
`infra/docker/docker-compose.prod.yml` — services: `api`, `web`, `worker`, (no postgres/redis exposed; they are managed external).

---

## 3. Environment Configuration

- All secrets via environment (managed secrets store / CI secrets). See docs/ENVIRONMENT.md.
- `NODE_ENV=production`, `COOKIE_SECURE=true`, strict CORS.
- Versioned env renders for deployments with known rollback.

---

## 4. CI/CD (GitHub Actions)

### Pull Requests (`.github/workflows/ci.yml`)
```
install → lint → typecheck → test (unit+integration) →
build frontend → build backend → db:migrate (test DB) → db:seed (test) →
security: audit + secret scan → artifact: openapi.json
```
Pipeline **fails** on any critical failure; required status checks on `main`.

### Production deploy (`.github/workflows/deploy.yml`)
Trigger: push to `main` (protected) after CI green, or tag `release/*`.
```
deploy:build-push (Docker images → registry)
deploy:migrate  (run drizzle migrate against prod DB — migration job, not app boot)
deploy:rollout  (zero-downtime container roll; health gate → promote)
post:verify     (GET /health on API+web; smoke test: public pages + login keyflows)
post:backup     (trigger manual snapshot post-deploy)
```

### Environments
- `dev` (PR previews) 
- `staging` (merge to main, mirrors prod config/test)
- `production` (tagged releases only)

---

## 5. Zero-Downtime Deployment

- Blue-green rolling update behind a load balancer / Docker stack.
- Migrations run **before** new containers start (backward-compatible migrations required).
- Health gate: new container marked healthy via `/health` before traffic is cut over.

---

## 6. Database Deployment Rules

- **Migrations are forward-only** and additive where possible.
- Never alter production schema by hand.
- Schema drift check in CI: `drizzle-kit` diff fails pipeline.
- Backups run automatically (docs/BACKUPS.md).

---

## 7. Webhook Configuration (Paystack dashboard)

- Webhook URL: `https://api.<domain>/api/v1/webhooks/paystack`
- Secret: rotate via `PAYSTACK_WEBHOOK_SECRET`; update dashboard key simultaneously.
- Recommended events enabled: `charge.success`, `charge.failed`, `charge.pending`, `charge.abandoned`.

---

## 8. Media & CDN

- Uploads go to R2 (private bucket); public reads via a signed/restricted base URL or Cloudflare Images CDN.
- All publicly served images opt-in through Next `<Image>` optimization or a known-safe CDN transform.
- Origin guarded: uploads only via API (`media.upload`), storage domain never allows direct public PUT.

---

## 9. Post-Deploy Verification

1. `GET /health` → `{ status: "ok", db: "up", redis: "up" }`.
2. Public homepage 200 + correct current location/service times.
3. Admin login + one RBAC-denied call returns 403.
4. Auth cookie flags (HttpOnly/Secure) verified.
5. Sentry receiving events; structured logs flowing.
6. Test transaction in Paystack test mode via stamp/staging.

---

## 10. Rollback

- **App rollback:** redeploy previous image tag; migrations cannot be rolled back — a rolled-back app must tolerate newer schema (keep migrations backward-compatible).
- **Data rollback:** restore latest backup via docs/BACKUPS.md (requires recovery window; communicated).
- Feature flags let risky paths (payments, exports) be disabled instantly without deploy.