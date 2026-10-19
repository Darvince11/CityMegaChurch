import { Module, type Provider } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CampContentModule } from './camp-content/camp-content.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SecurityGuard } from './common/guards/security.guard';

const globalGuards: Provider[] = [
  AuthGuard,
  PermissionsGuard,
  { provide: APP_GUARD, useClass: AuthGuard },
  { provide: APP_GUARD, useClass: PermissionsGuard },
  { provide: APP_GUARD, useClass: SecurityGuard },
];

@Module({
  imports: [ConfigModule, DatabaseModule, RedisModule, HealthModule, AuthModule, CampContentModule],
  providers: [...globalGuards, { provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
