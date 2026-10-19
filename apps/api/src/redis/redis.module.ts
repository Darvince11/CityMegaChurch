import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS = 'REDIS_PROVIDER';

/**
 * Exposes a lazily-connected ioredis client. Sessions are validated against
 * PostgreSQL (source of truth); Redis is reserved for rate limiting and cache
 * in later phases.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: ['ENV'],
      useFactory: (env: { REDIS_URL: string; REDIS_PREFIX: string }): Redis => {
        const client = new Redis(env.REDIS_URL, {
          keyPrefix: `${env.REDIS_PREFIX}:`,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        });
        client.on('error', () => {
          // Non-fatal; dependabots degrade gracefully rather than crash.
        });
        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}