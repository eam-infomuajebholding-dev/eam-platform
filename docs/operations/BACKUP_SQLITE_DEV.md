# SQLite backup (development)

Production backup policy: `docs/engineering/BACKUP_RESTORE_READINESS.md` (business decisions pending).

## Safe dev backup (Windows)

```powershell
cd C:\Projects\eam-platform\app\backend
Copy-Item .\eam.db ".\eam.db.bak-$(Get-Date -Format yyyyMMdd-HHmmss)"
```

Stop uvicorn before restore:

```powershell
Copy-Item .\eam.db.bak-YYYYMMDD-HHMMSS .\eam.db
```

Postgres (Docker): use `pg_dump` against the `db` service — see `deploy/docker-compose.yml`.
