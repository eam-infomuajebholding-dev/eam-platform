# EAM Release Guide

## Pre-release checklist

- [ ] Backend full pytest PASS (record count)
- [ ] Frontend lint PASS
- [ ] Production build PASS
- [ ] Alembic heads=1, current=head on target env
- [ ] Playwright full PASS (record count)
- [ ] Smoke: health, homepage, one journey
- [ ] Secret audit (no .env in commit)
- [ ] Known blockers documented

## CI distinction

- `CI_CONFIGURATION_VERIFIED` — workflow files exist
- `CI_RUNTIME_VERIFIED` — requires `gh workflow run` evidence

## Migration

```powershell
python -m alembic upgrade head
```

Document rollback limitations — DB downgrade not guaranteed.

## Release manifest (future)

Git ref, migration head, features, limitations, external blockers (OIDC).

## Production readiness

Independent from product acceptance. Likely PARTIAL until OIDC + visual acceptance + CI runtime.
