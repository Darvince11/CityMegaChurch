import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import Redis from 'ioredis';
import type { DatabaseHandle } from '@cdp/database';
import { Public } from '../auth/decorators/public.decorator';
import { DATABASE_HANDLE } from '../database/database.module';
import { REDIS } from '../redis/redis.module';

interface HealthResponse {
  status: 'ok';
  uptime: number;
  timestamp: string;
  version: string;
}

interface DbHealthResponse extends HealthResponse {
  database: 'up' | 'down';
}

interface RedisHealthResponse extends HealthResponse {
  redis: 'up' | 'down';
  latencyMs: number | null;
}

/**
 * Liveness/readiness probe — web app and load balancers poll /health;
 * it must never require authentication (docs/API.md §3 Health).
 */
@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_HANDLE) private readonly handle: DatabaseHandle,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  @Public()
  @Get()
  async check(): Promise<DbHealthResponse & RedisHealthResponse> {
    let database: 'up' | 'down' = 'down';
    try {
      await this.handle.db.execute(sql`SELECT 1`);
      database = 'up';
    } catch {
      // report status but keep the endpoint responsive
    }

    let redis: 'up' | 'down' = 'down';
    let latencyMs: number | null = null;
    try {
      const start = Date.now();
      const pong = await this.redis.ping();
      if (pong === 'PONG') {
        redis = 'up';
        latencyMs = Date.now() - start;
      }
    } catch {
      // redis optional in early dev
    }

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      database,
      redis,
      latencyMs,
    };
  }

  @Public()
  @Get('db')
  async dbHealth(): Promise<DbHealthResponse> {
    try {
      await this.handle.db.execute(sql`SELECT 1`);
      return { ...this.base('ok'), database: 'up' as const };
    } catch {
      return { ...this.base('ok'), database: 'down' as const };
    }
  }

  @Public()
  @Get('redis')
  async redisHealth(): Promise<RedisHealthResponse> {
    try {
      const pong = await this.redis.ping();
      return { ...this.base('ok'), redis: pong === 'PONG' ? 'up' : 'down', latencyMs: null };
    } catch {
      return { ...this.base('ok'), redis: 'down', latencyMs: null };
    }
  }

  private base(status: 'ok'): HealthResponse {
    return {
      status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  }
}