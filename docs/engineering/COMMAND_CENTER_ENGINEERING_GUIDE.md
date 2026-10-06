# Command Center Engineering Guide

## Model

Read-only leadership surface. Metrics computed in `operations_dashboard.py`.

## Adding a metric

1. Define in metric catalog (backend)
2. Compute in `OperationsDashboardService` — never in frontend
3. Assign `TruthState` honestly (NOT_AVAILABLE if no source)
4. Add evidence via `get_metric_evidence()` if decision-relevant
5. Test in `test_operations_dashboard.py`

## Truth states

Use: LIVE, STALE, PARTIAL, ESTIMATED, NOT_AVAILABLE, NOT_YET_OPERATIONAL, BLOCKED, UNKNOWN

**UNKNOWN ≠ 0**

## Executive AI

- Entry: `/api/v1/operations/command-center/executive-brief`
- Fallback: RULE_ASSISTED without provider
- No false causality in brief strings

## Authorization

All CC routes require admin/owner role. Test 403 for non-admin.

## Forbidden

- Frontend business logic for metrics
- CC-initiated SR/Quote/JOS mutations

## JIT V2 (designed, not yet implemented)

Watchlist, Decision Journal, Command Palette, Since My Last Visit, Evidence Drawer V2 — see  
`docs/command-center/COMMAND_CENTER_JIT_V2_DESIGN.md` (persistence in CC tables only; read model resolution unchanged).
