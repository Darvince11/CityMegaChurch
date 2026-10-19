import 'dotenv/config';
import { z } from 'zod';

/** Parses `true`/`false` strings; missing input falls back to `defaultValue`. */
function booleanFromString(defaultValue: boolean): z.ZodType<boolean, z.ZodTypeDef, string | undefined> {
  return z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((value) => (value === undefined ? defaultValue : value === 'true'));
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  APP_NAME: z.string().default('Church Digital Platform'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4000'),
  WEB_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).default(20),
  DATABASE_SSL: booleanFromString(false),

  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  REDIS_PREFIX: z.string().default('cdp'),

  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  COOKIE_NAME: z.string().default('cdp_session'),
  COOKIE_SECURE: booleanFromString(false),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).default(168),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),

  PASSWORD_MEMORY_COST: z.coerce.number().int().min(19_456).default(65536),
  PASSWORD_TIME_COST: z.coerce.number().int().min(2).default(3),
  PASSWORD_PARALLELISM: z.coerce.number().int().min(1).max(4).default(1),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT: z.enum(['pretty', 'json']).default('pretty'),

  RATE_LIMIT_GLOBAL_LIMIT: z.coerce.number().int().min(10).default(300),
  RATE_LIMIT_GLOBAL_WINDOW_MS: z.coerce.number().int().min(1_000).default(60_000),
  RATE_LIMIT_AUTH_LIMIT: z.coerce.number().int().min(3).default(10),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().int().min(1_000).default(60_000),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  if (parsed.data.NODE_ENV === 'production' && !parsed.data.COOKIE_SECURE) throw new Error('COOKIE_SECURE must be true in production');
  if (parsed.data.NODE_ENV === 'production' && parsed.data.SESSION_SECRET.length < 64) throw new Error('SESSION_SECRET must be at least 64 characters in production');
  return parsed.data;
}
