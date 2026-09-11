# WO-017 Migration Report

**Date:** 2026-09-11  
**Alembic chain:** `q7r8s9t0u1v2` → `r8s9t0u1v2w3` → `s9t0u1v2w3x4`  
**Head:** `s9t0u1v2w3x4`

## Migrations applied

| Revision | Journey | Impact |
|----------|---------|--------|
| `r8s9t0u1v2w3` | `building_materials` (#10) | Upserts `journey_definitions` row only — non-destructive |
| `s9t0u1v2w3x4` | `equipment` (#11) | Upserts `journey_definitions` row only — non-destructive |

## Rollback

Each migration `downgrade()` deletes the corresponding `journey_definitions` row by `journey_type`. No table schema changes.

## Verification

- `test_jos_migration_definitions.py` — single head `s9t0u1v2w3x4`
- Backend journey tests for BM/EQ full path → SR
- Playwright E2E anonymous paths

## REAL_JOURNEY_COUNT

**13** after WO-017 (was 11).
