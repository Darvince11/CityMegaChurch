import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import net from 'node:net';
import EmbeddedPostgres from 'embedded-postgres';

const root = fileURLToPath(new URL('../', import.meta.url));
const apiRequire = createRequire(path.join(root, 'apps/api/package.json'));
const dbRequire = createRequire(path.join(root, 'packages/database/package.json'));
const { Pool } = dbRequire('pg');
const dotenv = apiRequire('dotenv');
const apiEnvPath = path.join(root, 'apps/api/.env');
if (!fs.existsSync(apiEnvPath)) {
  fs.writeFileSync(apiEnvPath, [
    'NODE_ENV=development',
    'DATABASE_URL=postgresql://church:church@localhost:5432/church_platform',
    `SESSION_SECRET=${randomBytes(32).toString('hex')}`,
    'COOKIE_SECURE=false',
  ].join('\n'));
}
dotenv.config({ path: apiEnvPath });
const databaseUrl = new URL(process.env.DATABASE_URL);
if (!['localhost', '127.0.0.1', '[::1]'].includes(databaseUrl.hostname)) {
  throw new Error('Preview only supports a local database. Set DATABASE_URL to localhost.');
}
const pnpmCli = process.env.PNPM_CLI || process.env.npm_execpath;
if (!pnpmCli) throw new Error('Start with pnpm preview, or set PNPM_CLI to pnpm.cjs.');
const children = [];
async function freePort(start) {
  for (let port = start; port < start + 20; port++) {
    const inUse = await new Promise((resolve) => {
      const socket = net.createConnection({ port, host: '127.0.0.1' });
      socket.setTimeout(1000);
      socket.once('connect', () => { socket.destroy(); resolve(true); });
      socket.once('error', () => { socket.destroy(); resolve(false); });
      socket.once('timeout', () => { socket.destroy(); resolve(true); });
    });
    if (inUse) continue;
    const available = await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.once('error', (error) => error.code === 'EADDRINUSE' ? resolve(false) : reject(error));
      server.listen({ port, host: '0.0.0.0', exclusive: true }, () => server.close(() => resolve(true)));
    });
    if (available) return port;
  }
  throw new Error(`No free local preview port near ${start}`);
}
let postgres;
let stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  if (postgres) await postgres.stop();
  process.exit(code);
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());

function run(args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [pnpmCli, ...args], {
      cwd: root, stdio: 'inherit', windowsHide: true,
      env: { ...process.env, NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1', ...extraEnv },
    });
    children.push(child);
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`pnpm ${args.join(' ')} failed (${code})`)));
  });
}

try {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 2000 });
  let connected = false;
  try { await pool.query('SELECT 1'); connected = true; } catch { /* Start the local cluster below. */ }
  finally { await pool.end(); }
  if (!connected) {
    const databaseDir = path.join(root, '.tmp/pgdata');
    postgres = new EmbeddedPostgres({
      databaseDir, persistent: true,
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      port: Number(databaseUrl.port || 5432),
      postgresFlags: ['-h', '127.0.0.1'],
    });
    if (!fs.existsSync(path.join(databaseDir, 'PG_VERSION'))) await postgres.initialise();
    await postgres.start();
    const client = postgres.getPgClient('postgres', '127.0.0.1');
    await client.connect();
    const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    await client.end();
    if (!result.rowCount) await postgres.createDatabase(databaseName);
  }
  const apiPort = await freePort(Number(process.env.PREVIEW_API_PORT || 4000));
  const webPort = await freePort(Number(process.env.PREVIEW_WEB_PORT || 3000));
  const publicApiUrl = `http://127.0.0.1:${apiPort}`;
  await run(['exec', 'turbo', 'run', 'build', '--filter=@cdp/api']);
  await run(['db:migrate']);
  if (process.env.PREVIEW_SEED === 'true') {
    try { await run(['db:seed']); } catch (error) { console.warn('Seed skipped; existing preview data will be used.', error.message); }
  }
  const api = spawn(process.execPath, ['dist/main.js'], {
    cwd: path.join(root, 'apps/api'), stdio: 'inherit', windowsHide: true,
    env: { ...process.env, NODE_ENV: 'development', API_PORT: String(apiPort), CORS_ORIGINS: `http://localhost:${webPort},http://127.0.0.1:${webPort}` },
  });
  children.push(api);
  api.once('error', (error) => { console.error(error); void stop(1); });
  api.once('exit', (code) => { if (!stopping) void stop(code || 1); });
  const web = spawn(process.execPath, [path.join(root, 'apps/web/node_modules/next/dist/bin/next'), 'dev', '--turbopack', '--hostname', '127.0.0.1', '--port', String(webPort)], {
    cwd: path.join(root, 'apps/web'), stdio: 'inherit', windowsHide: true,
    env: { ...process.env, NODE_ENV: 'development', NEXT_DIST_DIR: '.next-fast', NEXT_PUBLIC_API_URL: publicApiUrl, NEXT_TELEMETRY_DISABLED: '1' },
  });
  children.push(web);
  web.once('error', (error) => { console.error(error); void stop(1); });
  web.once('exit', (code) => { if (!stopping) void stop(code || 1); });
  console.log(`Preview services are launching on http://localhost:${webPort}...`);
  const readyUrl = `http://127.0.0.1:${webPort}/`;
  for (let attempt = 0; attempt < 90; attempt++) {
    try {
      const response = await fetch(readyUrl);
      if (response.ok) {
        console.log(`Preview ready at http://localhost:${webPort}. Admin login: superadmin@church.test / Test@1234`);
        break;
      }
    } catch { /* Services are still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
} catch (error) {
  console.error(error);
  await stop(1);
}
