import { createApplication } from './create-app';

async function bootstrap(): Promise<void> {
  const { app, env } = await createApplication();
  await app.listen(env.API_PORT, '0.0.0.0');
  console.log(`${env.APP_NAME} API listening on http://localhost:${env.API_PORT}/api/v1`);
}

void bootstrap();
