# Deploying City Mega Church to Vercel

This repository is a monorepo containing a Next.js website and a NestJS API. Import the same Git repository into **two Vercel projects**.

## 1. Create the API project

1. In Vercel, select **Add New → Project** and import the Git repository.
2. Name the project `city-mega-church-api`.
3. Set **Root Directory** to `apps/api`.
4. Leave the commands from `apps/api/vercel.json` in place.
5. Enable **Include source files outside of the Root Directory** if the setting is shown.
6. Add the environment variables below to Production and Preview.

```text
NODE_ENV=production
APP_NAME=City Mega Church
APP_URL=https://YOUR-WEB-DOMAIN
WEB_URL=https://YOUR-WEB-DOMAIN
API_URL=https://YOUR-API-PROJECT.vercel.app
DATABASE_URL=YOUR-MANAGED-POSTGRES-CONNECTION-STRING
DATABASE_POOL_MAX=5
DATABASE_SSL=true
SESSION_SECRET=GENERATE-A-RANDOM-64-CHARACTER-OR-LONGER-SECRET
COOKIE_NAME=cdp_session
COOKIE_SECURE=true
SESSION_TTL_HOURS=168
TRUST_PROXY_HOPS=1
CORS_ORIGINS=https://YOUR-WEB-DOMAIN
RATE_LIMIT_GLOBAL_LIMIT=300
RATE_LIMIT_GLOBAL_WINDOW_MS=60000
RATE_LIMIT_AUTH_LIMIT=10
RATE_LIMIT_AUTH_WINDOW_MS=60000
PASSWORD_MEMORY_COST=65536
PASSWORD_TIME_COST=3
PASSWORD_PARALLELISM=1
REDIS_URL=YOUR-REDIS-CONNECTION-STRING
REDIS_PREFIX=cdp
LOG_LEVEL=info
LOG_FORMAT=json
SEED_STRICT=true
SUPERADMIN_EMAIL=YOUR-ADMIN-EMAIL
SUPERADMIN_PASSWORD=YOUR-UNIQUE-12-CHARACTER-OR-LONGER-PASSWORD
```

Use a managed PostgreSQL database that accepts connections from Vercel, such as Neon, Supabase, or a Vercel Marketplace Postgres integration. The API build applies database migrations and creates the super administrator if it does not exist. It never creates sample members or website content.

After the first successful login, change the administrator password in the profile screen.

## 2. Create the web project

1. Import the same Git repository again.
2. Name the project `city-mega-church-web`.
3. Set **Root Directory** to `apps/web`.
4. Choose the **Next.js** framework preset.
5. Enable **Include source files outside of the Root Directory** if the setting is shown.
6. Add these environment variables to Production and Preview:

```text
NEXT_PUBLIC_API_URL=https://YOUR-API-PROJECT.vercel.app
NEXT_PUBLIC_SITE_URL=https://YOUR-WEB-DOMAIN
NEXT_PUBLIC_APP_NAME=City Mega Church
NEXT_PUBLIC_CHURCH_NAME=City Mega Church
NEXT_PUBLIC_CHURCH_EMAIL=YOUR-PUBLIC-EMAIL
NEXT_PUBLIC_CHURCH_PHONE=YOUR-PUBLIC-PHONE
NEXT_PUBLIC_CHURCH_LOCATION=YOUR-CHURCH-LOCATION
NEXT_PUBLIC_CHURCH_SERVICE_TIMES=Sunday 8:00 AM and 11:00 AM; Thursday 7:00 PM
```

The web project proxies `/api/*` to the API project. Visitors therefore use one public website origin and secure session cookies continue to work.

## 3. Connect the production domain

Add the public domain to the web project. Then update `APP_URL`, `WEB_URL`, and `CORS_ORIGINS` on the API project and `NEXT_PUBLIC_SITE_URL` on the web project to the final HTTPS domain. Redeploy both projects after changing environment variables.

The API can remain on its generated `vercel.app` address, or you can assign a subdomain such as `api.example.org` and update `NEXT_PUBLIC_API_URL` accordingly.

## 4. Git deployment behavior

Vercel deploys both projects whenever their affected files change. The production branch, normally `main`, publishes to the production domains. Other branches receive preview deployments.

For authenticated API testing on a preview web deployment, add that preview web URL to the API project's `CORS_ORIGINS` list and redeploy the API preview. Keep the production web domain in the list as well, separated by commas.

## 5. Final checks

- Open `/api/v1/health` on the API domain.
- Open the web domain and sign in with the configured super-admin credentials.
- Change the initial administrator password.
- Create the first camp and accommodation options in the admin portal.
- Confirm announcements, sermons, gallery uploads, and camp bookings persist after a redeployment.
- Configure a custom domain, DNS, deployment protection, logs, and firewall rules in Vercel as required.

Secrets belong in Vercel Environment Variables. Never commit `.env`, `.env.local`, database URLs, session secrets, or production passwords.
