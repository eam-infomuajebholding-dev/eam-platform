# WO-019D — Owner Command Center Decision System V2

**Date:** 2026-09-11

## Current state vs V2 target

| Capability | Status |
|------------|--------|
| Priority by ACTION/DECISION/CRITICAL | PARTIAL — attention items exist, not fully re-sorted |
| Since my last visit | NOT_AVAILABLE — no persisted owner last-view |
| Leadership brief | PARTIAL — `OperationsDashboardService` briefing fields |
| Decision inbox | DONE — open decisions from real blockers (OIDC, visual acceptance) |
| Decision action contract | PARTIAL — items have title/evidence; options/risk not formalized |
| Evidence drawer V2 | DEFERRED_JIT |
| Metric dictionary | PARTIAL — backend-defined in dashboard service |
| Truth states | PARTIAL — LIVE/BLOCKED/NOT_YET_OPERATIONAL used |
| Strategic scorecard | PARTIAL — real values only; Quote now LIVE |
| Traceability chain | NOT_YET_OPERATIONAL |
| Portfolio/initiatives distinction | DOCUMENTED — CMS ≠ OperationalProject |
| Capacity view | NOT_AVAILABLE — no staffing data |
| Owner escalation load | PARTIAL — attention item counts |
| Watchlist | DEFERRED_JIT — owner identity not stable for persistence |
| Decision journal | DEFERRED_JIT |
| Command search | PARTIAL — `command_center_search.py` |
| Governed command | ENFORCED — no UI direct mutation |
| Unified timeline | PARTIAL — journey + commercial events aggregated |
| AI change timeline | NOT_YET_OPERATIONAL |
| Security executive view | PARTIAL — OIDC blocker surfaced |
| Finance | NOT_AVAILABLE — no authoritative financial source |
| Three speeds (10s/2m/deep) | PARTIAL — layout supports scan; deep drill limited |
| Mobile leadership brief | PARTIAL — responsive CSS exists |
| Performance | PARTIAL — no expensive repeated query audit this WO |

## Post-Quote updates (this session)

- Commercial funnel `quote` stage: BLOCKED → LIVE
- Quote pipeline metric: BLOCKED → LIVE
- Removed stale QUOTE business-decision blocker from executive AI context
- Journey labels added for building_materials, equipment

## Recommendations (next READY_NOW)

1. Evidence Drawer V2 for scorecard/commercial drill-down
2. Persisted owner last-view for "since my last visit"
3. Formal decision action contract (options + risk of delay)
4. Do not add ghost finance metrics from Quote totals
