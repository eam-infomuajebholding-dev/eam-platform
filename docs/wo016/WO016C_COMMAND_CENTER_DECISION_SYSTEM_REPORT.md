# WO-016C — Owner Command Center Decision-First Evolution

**Date:** 2026-09-11

## C01 — Owner Model

Command Center **reads** authoritative backends. It does **not** own JOS, SR, auth, CMS, AI state, or commercial write authority.

Verified: `COMMAND_CENTER_BUSINESS_AUTHORITY_COUNT=0`

## C02 — Information Architecture

Current V1 uses sections in `OwnerCommandCenter.tsx` (overview, pulse, attention). Full 7-zone normalization (قيادة/أعمال/عمليات...) is **PARTIAL** — documented target, not full restructure in WO-016C (no redesign mandate executed).

## C03 — Main Canvas

Backend `build_executive_brief()` answers: what changed, what matters, decisions needed, watch next — **RULE_ASSISTED**.

## C04 — Since My Last Visit

**DEFERRED_JIT** — no owner visit log persistence.

## C05 — Decision Inbox

`DecisionInboxPanel.tsx` surfaces DECISION severity items from `operations_dashboard._attention_items()`.

Current legitimate items:
- USER_VISUAL_ACCEPTANCE (homepage)
- OIDC BLOCKED_EXTERNAL (WATCH)

Quote blocker **removed** — Quote BO LIVE (WO-018).

## C06–C08 — Severity & Truth States

Implemented in schemas: `AttentionSeverity`, `TruthState`. Finance uses `NOT_AVAILABLE` — never zero-as-unknown.

## C07 — Evidence Drawer V2

**PARTIAL / DEFERRED_JIT** — V1 PASS; V2 expansion (scorecard/risk/commercial) not implemented.

## C09–C13 — Scorecard, Pulse, What Changed

Backend `OperationsDashboardService.get_overview()` provides:
- Strategic scorecard items
- Financial pulse (NOT_AVAILABLE for cash/revenue)
- Commercial funnel (**Quote stage = LIVE** post WO-018)
- What changed deltas

## C14–C17 — Watchlist, Journal, Palette

**DEFERRED_JIT** — no stable owner visit identity / persistence trigger.

## C18–C22 — Executive AI

Single path: CC → read model → `build_executive_brief` / optional AI Core enhancement.

Fallback: **RULE_ASSISTED** when provider unavailable.

## C23 — Finance

`NOT_AVAILABLE` for cash/revenue. No SR-volume-as-revenue.

## C24 — Commercial Funnel Truth

Implemented lifecycle endpoint: **qualified** + **Quote BO (draft→issued)**.

Contract/Payment/OperationalProject: **NOT_YET_OPERATIONAL**.

## C29 — Control Assurance

Cross-customer isolation: TEST_VERIFIED. OIDC: NOT_VERIFIED (external).

## C34 — Tests

`test_operations_dashboard.py` — overview, brief, auth. CC E2E: `command-center.spec.ts`, `command-center-visual.spec.ts`.

## Recommendation

Next CC increment: Evidence Drawer V2 for scorecard/risk cards — JIT after commit stability.
