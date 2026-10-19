import { Global, Module, Inject, type OnApplicationShutdown, type Provider } from '@nestjs/common';
import { createDbHandle, type Database, type DatabaseHandle } from '@cdp/database';

export const DATABASE = 'DATABASE_PROVIDER';
export const DATABASE_HANDLE = 'DATABASE_HANDLE';

const handleProvider: Provider = {
  provide: DATABASE_HANDLE,
  inject: ['ENV'],
  useFactory: (env: { DATABASE_URL: string; DATABASE_POOL_MAX: number; DATABASE_SSL: boolean }): DatabaseHandle => {
    return createDbHandle(env.DATABASE_URL, {
      max: env.DATABASE_POOL_MAX,
      ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
    });
  },
};

/**
 * Global database module. Exposes the Drizzle `Database` instance and a pool
 * handle that can be closed cleanly on shutdown.
 */
@Global()
@Module({
  providers: [
    handleProvider,
    {
      provide: DATABASE,
      inject: [DATABASE_HANDLE],
      useFactory: (handle: DatabaseHandle): Database => handle.db,
    },
  ],
  exports: [DATABASE, DATABASE_HANDLE],
})
export class DatabaseModule implements OnApplicationShutdown {
  @Inject(DATABASE_HANDLE)
  private readonly handle!: DatabaseHandle;

  async onApplicationShutdown(): Promise<void> {
    await this.handle.pool.end();
  }
}

export { type Database };
