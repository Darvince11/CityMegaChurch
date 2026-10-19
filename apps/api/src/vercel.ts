import type { IncomingMessage, ServerResponse } from 'node:http';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApplication } from './create-app';

let application: Promise<NestFastifyApplication> | undefined;

async function getApplication(): Promise<NestFastifyApplication> {
  application ??= createApplication().then(async ({ app }) => {
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
  });
  return application;
}

export async function vercelHandler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const app = await getApplication();
  app.getHttpAdapter().getInstance().server.emit('request', request, response);
}
