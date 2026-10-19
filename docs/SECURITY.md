# Security Hardening

## 1. Threat Model Highlights

| Threat | Mitigation |
|---|---|
| SQL injection | Drizzle parameterized queries only; no raw string interpolation |
| XSS | React/Next escaping by default; DOMPurify-safety for rich content (server-rendered sanitization); CSP header where practical |
| CSRF | SameSite=Lax/Strict cookies + Origin check on state-changing requests |
| Broken access control / IDOR | Permission guards + row-ownership scoping on every protected route |
| Brute force / credential stuffing | Redis-backed rate limiting (auth: 10/min/IP), Argon2 cost, lockout backoff |
| Mass assignment | Zod DTOs decouple input from entity; denylist/allowlist by schema |
| File upload abuse | R2; type+size+MIME validation; generated object keys; non-executable storage domain; no public write |
| Webhook forgery | HMAC-SHA512 signature + IP allowlist + raw-body handling |
| Duplicate payment callbacks | Unique reference + row lock + idempotent state machine (docs/WEBHOOKS.md) |
| Session fixation | Regenerate session id on login; fixed cookie attributes; hashed token storage |
| Privilege escalation | Server-side checks (never UI-only); role changes audit-logged; sensitive roles 2FA |
| Information leak | Central error filter; no stack/SQL/paths; generic 500; restricted finance/first-timer data |
| Secret exposure | Secrets only via env; `.env*` gitignored; `.env.example` only placeholders; CI secret scanning |

---

## 2. Authentication & Session Security

### Passwords (Argon2id)
- **Argon2id**, tuned (e.g. m=64 MiB, t=3, p=1) — config via env.
- No plaintext storage, no logging, hashes never returned by any API.
- Password rules: min 8 chars + breach-pattern avoidance; optional strength meter; forced reset on suspected compromise.

### Sessions
- Opaque session token stored **hashed** (`sha256`) in `sessions.token_hash`.
- Cookie: `HttpOnly`, `Secure` (production), `SameSite=Lax`, `Path=/`, short-lived + rolling refresh.
- Logout revokes server-side; password change revokes all other sessions.
- Session fixation safe (new id issued on login).

### 2FA (TOTP)
- Required login flow for users whose roles include Super Administrator, Pastor, Finance Officer.
- Recovery codes (single-use) issued at setup; re-enrollment on code exhaustion.

### Email/phone verification
- Email verification token (signed, short TTL, single-use) if email is primary.
- Phone verification via OTP (SMS/staged provider) when phone is primary.

---

## 3. API Security

- TLS only; strict transport security headers.
- CORS: single origin list (`CORS_ORIGINS`); no wildcard with credentials.
- Rate limiting: global + auth + first-timer + webhook tiers (Redis-backed).
- Body limits, JSON content-type enforcement, Zod validation on every route.
- Query params validated (pagination bounds, sort allowlist) to prevent abuse.
- CSRF: cookie SameSite + Origin/Referer check on mutations; CSRF tokens where SameSite is insufficient (rare).
- Request ID assigned and logged; responses echo `X-Request-Id` for support.

---

## 4. Authorization (see docs/RBAC.md)

- `RequirePermissions(...)` guard on every protected route.
- Effective permission set computed server-side per request (cached with session).
- Row scoping for leaders/self-service added in service layer.
- Never rely on UI visibility; verified by RBAC test matrix.

---

## 5. Financial Security

- Mobile Money only; card channels deny-listed at Paystack and UI.
- Webhooks signed + idempotent; amounts server-validated.
- Payment rows auditable; gateway payloads sanitized (no tokens/cards/keys stored).
- Finance data access restricted (`giving.*`, `camp.payments.read`).

---

## 6. Data Protection

- Personal data minimization (no unnecessary sensitive fields).
- DB backups encrypted at rest (managed provider); nightly + retention (docs/BACKUPS.md).
- `.env` never committed; secrets rotated via provider dashboards.
- Log sanitization: scrub phone numbers/emails in logs where avoidable; never passwords/tokens.

---

## 7. Hardening Checklist (used in Phase 15 review)

- [ ] Argon2id configured; bcrypt legacy payloads rejected.
- [ ] All user-facing routes behind guards; public routes explicit (`@Public`).
- [ ] Webhook endpoint raw-body + signature + allowlist.
- [ ] Rate limits enforced globally + per-sensitive-endpoint.
- [ ] Security headers on web (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP).
- [ ] CORS locked to WEB origins.
- [ ] Uploads: MIME/size validated, renamed keys, no HTML/SVG execution vectors.
- [ ] Audit logging on all admin mutations; no secrets in audit.
- [ ] 2FA enforced for sensitive roles.
- [ ] Error filter verified (no stack/SQL leaks in prod mode).
- [ ] Dependency audit (`pnpm audit`) in CI.
- [ ] Secret scan in CI (gitleaks or equivalent).
- [ ] No `.env*` or `dist/` artifacts in git.
- [ ] Pen tests: RBAC matrix + payment matrix green.