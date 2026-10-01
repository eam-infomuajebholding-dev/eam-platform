# Dev-only SQLite backup — does not touch production.
# Usage: from app/backend: .\scripts\backup_dev_db.ps1

$ErrorActionPreference = 'Stop'
$backendRoot = Split-Path -Parent $PSScriptRoot
$dbPath = Join-Path $backendRoot 'eam.db'

if (-not (Test-Path $dbPath)) {
    Write-Error "Database not found: $dbPath"
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupPath = Join-Path $backendRoot "eam.db.bak-$stamp"
Copy-Item -Path $dbPath -Destination $backupPath
Write-Host "Backup written: $backupPath"
