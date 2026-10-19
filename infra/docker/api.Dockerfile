# NestJS API — multi-stage, non-root, production-optimized
# Docs reference: docs/DEPLOYMENT.md §2

# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/database/package.json packages/database/
COPY packages/eslint-config/package.json packages/eslint-config/
RUN pnpm install --frozen-lockfile --filter @cdp/api...
COPY . .
RUN pnpm exec turbo run build --filter=@cdp/api && pnpm --filter @cdp/api --prod deploy /out

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
USER node
WORKDIR /app
COPY --from=build /out .
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
