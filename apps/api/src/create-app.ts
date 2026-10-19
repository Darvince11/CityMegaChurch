import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { loadEnv, type Env } from './config/env';

export async function createApplication(): Promise<{ app: NestFastifyApplication; env: Env }> {
  const env = loadEnv();
  const adapter = new FastifyAdapter({ logger: false, bodyLimit: 1_000_000, trustProxy: env.TRUST_PROXY_HOPS || false });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { bufferLogs: true });
  await app.register(helmet, { contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false });
  await app.register(cookie, { secret: env.SESSION_SECRET });
  app.enableCors({ origin: env.CORS_ORIGINS, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] });
  app.setGlobalPrefix('api/v1');
  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder().setTitle(`${env.APP_NAME} API`).setDescription('REST API — docs/API.md').setVersion('1.0').addCookieAuth(env.COOKIE_NAME).build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  }
  return { app, env };
}
