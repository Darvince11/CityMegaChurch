# Environment & Configuration

All configuration is injected via environment variables. `.env.example` is the canonical template at repo root; real `.env` files are gitignored.

> **Secrets are never committed.** Every secret below is a placeholder; real values live in CI secrets / managed secret store.

---

## 1. Variable Reference

### Application
| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | yes | `development` | `development` / `test` / `production` |
| `APP_NAME` | no | `Church Digital Platform` | Display name |
| `API_URL` | yes | — | Public API base (web consumes) |
| `WEB_URL` | yes | — | Public web base |
| `API_PORT` | no | `4000` | API listen port |
| `APP_URL` | no | `http://localhost:3000` | Canonical app URL |

### Database (PostgreSQL)
| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | yes | — | `postgresql://user:pass@host:5432/db` |
| `DATABASE_POOL_MAX` | no | `20` | Connection pool size |
| `DATABASE_SSL` | no | `false` | `true` in production |

### Redis
| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_URL` | yes | — | `redis[s]://host:6379` |
| `REDIS_PREFIX` | no | `cdp` | Namespace for keys/queues |

### Authentication
| Variable | Required | Default | Description |
|---|---|---|---|
| `SESSION_SECRET` | yes | — | ≥32 random bytes (cookie signing) |
| `COOKIE_NAME` | no | `cdp_session` | Cookie name |
| `COOKIE_SECURE` | no | `false` | `true` on HTTPS prod |
| `SESSION_TTL_HOURS` | no | `168` | Session lifetime |
| `PASSWORD_MEMORY_COST` / `TIME_COST` / `PARALLELISM` | no | 65536 / 3 / 1 | Argon2id parameters |

### Paystack
| Variable | Required | Default | Description |
|---|---|---|---|
| `PAYSTACK_PUBLIC_KEY` | yes | — | `pk_test_…` (web) |
| `PAYSTACK_SECRET_KEY` | yes | — | `sk_test_…` (API, webhook verify) |
| `PAYSTACK_CURRENCY` | no | `GHS` | Display + init currency |
| `PAYSTACK_WEBHOOK_SECRET` | yes | — | HMAC key for x-paystack-signature |

### Object storage (R2 / S3-compatible)
| Variable | Required | Default | Description |
|---|---|---|---|
| `R2_ACCOUNT_ID` | yes | — | Cloudflare account id |
| `R2_ACCESS_KEY_ID` | yes | — | |
| `R2_SECRET_ACCESS_KEY` | yes | — | |
| `R2_BUCKET` | yes | — | e.g. `church-media` |
| `R2_ENDPOINT` | yes | — | `https://<account>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_BASE_URL` | no | — | CDN/base URL for object URLs |
| `UPLOAD_ALLOWED_MIME` | no | image/jpeg,png,webp,gif; audio/mpeg,audio/mp4; video/mp4 | Upload allowlist |
| `UPLOAD_MAX_SIZE_BYTES` | no | 52428800 (50MB) | File size cap |

### Email
| Variable | Required | Default | Description |
|---|---|---|---|
| `EMAIL_PROVIDER` | no | `resend` | provider adapter |
| `RESEND_API_KEY` | yes (if provider=resend) | — | |
| `EMAIL_FROM` / `EMAIL_FROM_NAME` | yes | — | Sender identity |

### Monitoring
| Variable | Required | Default | Description |
|---|---|---|---|
| `SENTRY_DSN` | yes (prod) | — | Error monitoring DSN |
| `LOG_LEVEL` | no | `info` | `debug`/`info`/`warn`/`error` |
| `LOG_FORMAT` | no | `pretty` | `pretty` (dev) / `json` (prod) |

### Rate limiting
| Variable | Required | Default | Description |
|---|---|---|---|
| `RATE_LIMIT_GLOBAL_LIMIT` | no | 300 | per window |
| `RATE_LIMIT_GLOBAL_WINDOW_MS` | no | 60000 | |
| `RATE_LIMIT_AUTH_LIMIT` | no | 10 | auth endpoints |
| `RATE_LIMIT_AUTH_WINDOW_MS` | no | 60000 | |

### CORS
| Variable | Required | Default | Description |
|---|---|---|---|
| `CORS_ORIGINS` | yes | — | Comma-separated allowed origins |

### 2FA
| Variable | Required | Default | Description |
|---|---|---|---|
| `TWO_FACTOR_APP_NAME` | no | `ChurchDigitalPlatform` | TOTP app label |
| `OTP_ISSUER` | no | `Church Digital Platform` | TOTP issuer |

### Web (Next.js) — `apps/web/.env.local`
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base for client calls |
| `NEXT_PUBLIC_SITE_URL` | canonical site URL (SEO) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | display-only key (server still verifies) |

---

## 2. Environment Files Layout

```
apps/api/.env          # server-side (never committed)
apps/web/.env.local    # web-side (never committed)
.env.example           # committed template (root)
```

---

## 3. Configuration Validation

- On API boot, Zod validates the full env object; invalid/missing required vars abort startup with a clear message (no secrets in the message).
- CI runs a config dry-run to catch missing vars early.
- Rotation playbook: secret rotation order — deploy new value → update provider → verify → revoke old.