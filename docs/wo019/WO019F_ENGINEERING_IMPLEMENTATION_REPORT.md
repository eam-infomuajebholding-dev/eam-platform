# WO-019F — Engineering Implementation Pass

**Date:** 2026-09-11

## Registers read (01)

Used existing: `AUTHORITY_MAP.md`, `DOMAIN_OWNERSHIP_MAP.md`, `CAPABILITY_CATALOG.md`, `DATABASE_INVARIANTS.md`, `EAM_ENGINEERING_CLEANUP_REGISTER.md`, `ARCHITECTURE_DRIFT_REGISTER.md`.

## Implemented fixes (bounded)

| ID | Priority | Fix |
|----|----------|-----|
| CLN-009 | P0 CI | Removed invalid `pnpm-workspace.yaml` breaking `pnpm install --frozen-lockfile` |
| CLN-010 | P0 CI | Added `tests/conftest.py` — CI DATABASE_URL + app bootstrap for HTTP tests |
| CI-001 | P0 CI | Added `DATABASE_URL=sqlite:///./ci_test.db` to `.github/workflows/ci.yml` |
| TEST-001 | P1 | `test_operations_quotes.py` autouse env fixture for DATABASE_URL |

## Not changed (by design)

- No mass file moves
- No dead code removal (none CONFIRMED)
- No generic repository layer
- `jos.py` central switch untouched (CLN-005)
- `IntakeSnapshotSummary.tsx` per-journey branches monitored (CLN-003)

## Authority duplication (04)

Verified single paths: JOS=1, AUTH=1, AI_CORE=1, SR=1, Quote service=1.

## DB invariants (17–18)

Quote: unique `service_request_id`, status transition guards in service + tests.

## Test evidence

| Run | Env | Result |
|-----|-----|--------|
| Full backend | CI-like (`ci_test.db` + conftest) | **212/212 PASS** |
| Quote focused | Same | 19/19 PASS |

## Scorecard (38)

| Dimension | Score |
|-----------|-------|
| DOMAIN_ORGANIZATION | PARTIAL |
| AUTHORITY_CLARITY | PASS |
| RESPONSIBILITY_CLARITY | PARTIAL |
| DUPLICATION | PARTIAL |
| DATA_INTEGRITY | PASS |
| AUTHORIZATION | PASS |
| TESTABILITY | PASS |
| OPERABILITY | PARTIAL |
| DOCUMENTATION | PARTIAL |
| BUS_FACTOR | PARTIAL |

**Cleanup readiness:** APPROACHING_READY (not READY for destructive cleanup pass).
