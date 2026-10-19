#!/usr/bin/env pwsh
# Development setup script — runs embedded Postgres, migrations, seeds, and starts apps.
# No Docker required.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "=== Step 1: Install deps ===" -ForegroundColor Cyan
pnpm install

Write-Host "=== Step 2: Ensure @embedded-postgres/windows-x64 is installed ===" -ForegroundColor Cyan
# The optional dep may not have been installed by pnpm strict mode
$win64Path = Join-Path $root "node_modules\@embedded-postgres\windows-x64"
if (-not (Test-Path $win64Path)) {
    Write-Host "Installing @embedded-postgres/windows-x64 explicitly..."
    pnpm add -D -w @embedded-postgres/windows-x64@18.4.0-beta.17
} else {
    Write-Host "Binary package already present."
}

Write-Host "=== Step 3: Start embedded PostgreSQL ===" -ForegroundColor Cyan
# Use a simple node script to start embedded postgres
$pgScript = @'
import EmbeddedPostgres from 'embedded-postgres';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve('..');
const dataDir = path.join(root, '.postgres');

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'church',
  password: 'church',
  port: 5432,
  persistent: true,
  onLog: (msg) => console.log(msg),
  onError: (msg) => console.error(msg),
});

// Check if already initialised
const initialised = fs.existsSync(path.join(dataDir, 'postgresql.conf'));
if (!initialised) {
  console.log('Initialising embedded PostgreSQL...');
  await pg.initialise();
}

console.log('Starting embedded PostgreSQL...');
await pg.start();

console.log('Creating database "church_platform" if not exists...');
try {
  await pg.createDatabase('church_platform');
  console.log('Database ready.');
} catch (e) {
  console.log('Database may already exist:', e.message);
}

console.log('Embedded PostgreSQL is running on port 5432');
console.log('Press Ctrl+C to stop.');

// Keep alive
process.on('SIGINT', async () => {
  await pg.stop();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await pg.stop();
  process.exit(0);
});
await new Promise(() => {}); // Keep alive forever
'@

$pgScriptPath = Join-Path $root "scripts\start-pg.mjs"
Set-Content -Path $pgScriptPath -Value $pgScript -Encoding UTF8

# Start embedded postgres in background
$pgProcess = Start-Process -FilePath "node" -ArgumentList "scripts/start-pg.mjs" -WorkingDirectory $root -PassThru -NoNewWindow -RedirectStandardOutput "$root\.postgres.log" -RedirectStandardError "$root\.postgres-err.log"
$pgProcess.Id | Out-File -FilePath (Join-Path $root ".pg.pid") -Encoding ascii

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxWait = 30
$ready = $false
for ($i = 0; $i -lt $maxWait; $i++) {
    Start-Sleep -Seconds 1
    $log = Get-Content "$root\.postgres.log" -ErrorAction SilentlyContinue
    if ($log -match "running on port 5432|Embedded PostgreSQL is running") {
        $ready = $true
        break
    }
    # Check if process died
    if ($pgProcess.HasExited) {
        Write-Host "PostgreSQL process exited unexpectedly!" -ForegroundColor Red
        Get-Content "$root\.postgres-err.log" -ErrorAction SilentlyContinue
        exit 1
    }
}
if (-not $ready) {
    Write-Host "Warning: Could not confirm PostgreSQL is ready after ${maxWait}s. Continuing anyway..." -ForegroundColor Yellow
}

Write-Host "=== Step 4: Build packages ===" -ForegroundColor Cyan
pnpm --filter @cdp/shared build
pnpm --filter @cdp/database build

Write-Host "=== Step 5: Generate migrations ===" -ForegroundColor Cyan
pnpm db:generate

Write-Host "=== Step 6: Run migrations ===" -ForegroundColor Cyan
pnpm db:migrate

Write-Host "=== Step 7: Seed dev data ===" -ForegroundColor Cyan
pnpm db:seed

Write-Host "=== Step 8: Start API + Web ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  API:  http://localhost:4000/api/v1" -ForegroundColor Green
Write-Host "  Docs: http://localhost:4000/docs" -ForegroundColor Green
Write-Host "  Web:  http://localhost:3000" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Login: admin@church.com / Test@1234" -ForegroundColor Yellow
Write-Host ""

# Run both apps
pnpm dev
