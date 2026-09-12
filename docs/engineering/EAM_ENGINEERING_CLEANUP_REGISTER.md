# EAM Engineering Cleanup Register

**Updated:** 2026-09-12 (WO-021)

| ID | Category | Location | Notes | Status |
|----|----------|----------|-------|--------|
| CLN-001 | DUPLICATE_POSSIBLE | `src/api/settings.ts` raw fetch vs `lib/api` | CMS settings path | OPEN |
| CLN-002 | DUPLICATE_POSSIBLE | Multiple log files in frontend root | `pw-*.txt`, `build-log.txt` | LOCAL_ONLY — `.gitignore` updated WO-019A |
| CLN-009 | MISPLACED_FILE | `app/frontend/pnpm-workspace.yaml` | Invalid `allowBuilds` placeholder broke CI install | **FIXED** — removed (single-package, no workspace) WO-019F |
| CLN-010 | CI_BLOCKER | Backend pytest on GitHub Actions | Missing `DATABASE_URL` + no test bootstrap | **FIXED** — `tests/conftest.py` + CI env WO-019F |
| CLN-003 | SHARED_OVERUSED | `IntakeSnapshotSummary.tsx` | Per-journey branches growing | MONITOR — not generic renderer yet |
| CLN-004 | NAMING_INCONSISTENCY | Sector # vs journey numbering | Docs use both | DOCUMENTED in registers |
| CLN-005 | DO_NOT_TOUCH | `jos.py` central switch | High blast radius | DO_NOT_TOUCH without journey WO |
| CLN-006 | DEAD_CODE_CONFIRMED | — | None confirmed this session | — |
| CLN-007 | RESPONSIBILITY_VIOLATION | — | None P0 found | — |
| CLN-008 | UNUSED_DEPENDENCY_CANDIDATE | — | Not audited (no blind removal) | UNKNOWN |

| CLN-011 | LOCAL_ENV | `pnpm-workspace.yaml` regenerated locally (pnpm 11) | **MITIGATED** — gitignored + `packageManager: pnpm@9.15.4` WO-021 |
| CLN-012 | TEST_ENV | `command-center-visual.spec.ts` | **MITIGATED** — `e2e/helpers/testAuth.ts` + preflight + E2E_TEST_AUTH.md WO-021 |
| CLN-013 | LEGACY_INACTIVE | `SolutionsSection.tsx` | Replaced by `HomePlatformsGridSection` (same heading, canonical 16 sectors) WO-021 final |
| CLN-014 | DUPLICATE_CONFIRMED | Post-hero sector cards vs registry | **FIXED** — carousel + grid both consume `SECTOR_DEFINITIONS` WO-021 final |
| CLN-015 | MISPLACED_FILE | Unverified stats in `HomeStatsRibbon` | **FIXED** — qualitative trust pillars only WO-021 final |

**Cleanup readiness:** APPROACHING_READY — WO-017/018 committed; dead-code pass deferred until READY.
