import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AUTH_SERVICE, AuthService } from './auth.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [AuthController],
  providers: [{ provide: AUTH_SERVICE, useClass: AuthService }],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}