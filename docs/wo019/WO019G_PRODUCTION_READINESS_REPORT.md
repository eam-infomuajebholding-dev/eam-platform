# WO-019G — Production Readiness + Operability + Handover

**Date:** 2026-09-11

## Environment (G001)

| Variable | Classification |
|----------|----------------|
| DATABASE_URL | REQUIRED_LOCAL / REQUIRED_PRODUCTION |
| JWT_SECRET_KEY | REQUIRED_PRODUCTION |
| JWT_ALGORITHM | REQUIRED_PRODUCTION |
| OIDC_* | EXTERNAL_BLOCKER |
| AI provider keys | OPTIONAL / EXTERNAL_BLOCKER |

Never commit secret values. See `docs/engineering/DEVELOPER_ONBOARDING.md`.

## Health (G003)

`/health` → `{"status":"healthy"}` — liveness only. Does not prove migration parity or OIDC.

## Runbooks (G005–G007)

Documented in `docs/engineering/WINDOWS_RUNBOOK.md`:

1. HEALTH FIRST
2. PROCESS SECOND
3. RESTART LAST

Alembic: single head `t0u1v2w3x4y5`. Stamp vs upgrade decision documented in WO019A.

## Migration report (G008)

| Revision | Purpose |
|----------|---------|
| `r8s9t0u1v2w3` | building_materials journey definition |
| `s9t0u1v2w3x4` | equipment journey definition |
| `t0u1v2w3x4y5` | quotes + quote_line_items |

Rollback: downgrade supported per revision; production rollback policy = roll-forward preferred.

## CI gates (G009–G010)

| Gate | Config |
|------|--------|
| backend-tests | ✅ |
| alembic-single-head | ✅ |
| frontend-lint | ✅ |
| frontend-build | ✅ |
| Playwright | ✅ |

**CI_RUNTIME:** UNVERIFIED — requires GitHub Actions after push.

## Release checklist (G011)

| Item | Status |
|------|--------|
| Git ref | `137cbdc` |
| Worktree reconciled | ✅ (3 logical commits) |
| Backend tests | 212/212 PASS |
| Migration | HEAD=CURRENT |
| Known blockers | OIDC, visual acceptance |

## Backup/restore (G014–G015)

**UNKNOWN** — not configured in repository.

## Failure mode matrix (G021)

| Mode | Mitigation |
|------|------------|
| Backend down | Health check → restart owned process |
| DB unavailable | Check DATABASE_URL, file permissions |
| Migration mismatch | `alembic current` vs `heads`; stamp if schema matches |
| OIDC down | Credential-free paths remain; auth BLOCKED_EXTERNAL |
| AI provider down | Rule-assisted fallback |
| Quote failure | Service-layer validation; transaction rollback |

## Guides (G022–G029)

Created/updated in `docs/engineering/` and `docs/wo017/`.

## M1 / OIDC (G031–G032)

M1: PARTIAL — credential-free verified. OIDC: BLOCKED_EXTERNAL.

## Full regression (G033–G034)

| Suite | Count | Session |
|-------|-------|---------|
| Backend | 212/212 | ✅ This session |
| Playwright | 78/78 | Prior session (not re-run post-commit) |
| Lint/build | — | Not re-run this session |

## Release readiness

**APPROACHING_READY** — pending CI runtime, OIDC, user visual acceptance.
