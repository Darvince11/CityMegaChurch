import { Module, Global } from '@nestjs/common';
import { loadEnv } from './env';

/**
 * Global configuration module. `Env` is the single validated environment
 * contract for the entire API (docs/ENVIRONMENT.md).
 */
@Global()
@Module({
  providers: [
    {
      provide: 'ENV',
      useFactory: () => loadEnv(),
    },
  ],
  exports: ['ENV'],
})
export class ConfigModule {}

export { loadEnv, type Env } from './env';
