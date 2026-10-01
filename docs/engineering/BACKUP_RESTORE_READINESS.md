# Backup & Restore Readiness

**Updated:** 2026-10-01

## Current classification

| Capability | Status | Evidence |
|------------|--------|----------|
| BACKUP (production) | **NOT_CONFIGURED** | No production deployment topology verified in repo |
| BACKUP (dev SQLite) | **DEFINED** | `app/backend/scripts/backup_dev_db.ps1` |
| RESTORE (production) | **NOT_CONFIGURED** | No tested restore procedure |
| RESTORE (dev) | **DEFINED** | Stop uvicorn → copy `.bak-*` over `eam.db` |
| RPO / RTO | **BUSINESS_DECISION_REQUIRED** | Not defined in Business Lab |

## Production requirements (definition only — not tested)

When production environment exists, minimum backup scope:

1. **Database** — authoritative SR, Quote, JOS, auth linkage (SQLite dev ≠ production topology)
2. **Uploaded media** — if/when customer documents become authoritative
3. **Configuration names** — documented in `.env.example` (never backup secret values into git)

### Frequency / retention

| Decision | Status |
|----------|--------|
| Backup frequency | BUSINESS_DECISION_REQUIRED |
| Retention period | BUSINESS_DECISION_REQUIRED |
| Encryption at rest | BUSINESS_DECISION_REQUIRED |
| Off-site copy | BUSINESS_DECISION_REQUIRED |

## Development restore drill

**Not executed in WO-021** — would risk overwriting active developer `eam.db` without explicit owner approval.

Safe drill pattern (when approved):

```powershell
cd C:\Projects\eam-platform\app\backend
.\scripts\backup_dev_db.ps1
# restore (dev): stop uvicorn, then:
# Copy-Item .\eam.db.bak-YYYYMMDD-HHMMSS .\eam.db
```

Label any future drill: **DEV_RESTORE_TESTED** — not PRODUCTION_RESTORE_TESTED.

## Release checklist linkage

Release remains **PARTIAL** until:

- BACKUP=DEFINED minimum for target environment
- RESTORE=DEFINED with at least one validated drill in target tier

See `docs/engineering/RELEASE_GUIDE.md`.
