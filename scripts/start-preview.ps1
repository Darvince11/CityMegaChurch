$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
    $nodePath = $nodeCommand.Source
} else {
    $candidates = @(
        (Join-Path $env:ProgramFiles 'nodejs/node.exe'),
        (Join-Path $env:APPDATA 'TRAE SOLO/ModularData/ai-agent/vm/tools/node/node.exe')
    )
    $nodePath = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}
if (-not $nodePath) { throw 'Install Node.js 20 or later, then rerun this script.' }
$env:PATH = (Split-Path -Parent $nodePath) + [IO.Path]::PathSeparator + $env:PATH
$pnpmCliPath = Join-Path $env:APPDATA 'npm/node_modules/pnpm/bin/pnpm.cjs'
if (Test-Path -LiteralPath $pnpmCliPath) {
    $env:PNPM_CLI = $pnpmCliPath
    & $nodePath (Join-Path $PSScriptRoot 'preview.mjs')
} else {
    pnpm preview
}
exit $LASTEXITCODE
