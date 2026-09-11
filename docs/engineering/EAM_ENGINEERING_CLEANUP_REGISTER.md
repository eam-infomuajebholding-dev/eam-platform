# EAM Engineering Cleanup Register

**Updated:** 2026-09-11 (WO-016A)

| ID | Category | Location | Notes | Status |
|----|----------|----------|-------|--------|
| CLN-001 | DUPLICATE_POSSIBLE | `src/api/settings.ts` raw fetch vs `lib/api` | CMS settings path | OPEN |
| CLN-002 | DUPLICATE_POSSIBLE | Multiple log files in frontend root | `pw-*.txt`, `build-log.txt` | UNKNOWN_ORIGIN — do not delete |
| CLN-003 | SHARED_OVERUSED | `IntakeSnapshotSummary.tsx` | Per-journey branches growing | MONITOR — not generic renderer yet |
| CLN-004 | NAMING_INCONSISTENCY | Sector # vs journey numbering | Docs use both | DOCUMENTED in registers |
| CLN-005 | DO_NOT_TOUCH | `jos.py` central switch | High blast radius | DO_NOT_TOUCH without journey WO |
| CLN-006 | DEAD_CODE_CONFIRMED | — | None confirmed this session | — |
| CLN-007 | RESPONSIBILITY_VIOLATION | — | None P0 found | — |
| CLN-008 | UNUSED_DEPENDENCY_CANDIDATE | — | Not audited (no blind removal) | UNKNOWN |

**Cleanup readiness:** APPROACHING_READY — await commit of WO-017/018 before dead-code pass.
