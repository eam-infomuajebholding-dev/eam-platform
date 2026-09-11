# EAM Remaining Work Register (WO-015 reconciliation)

Deduplicated across Phase 2 / Master-008 / Delta-009 / WO-012–015. Status vocabulary only as listed.

## Product — Journeys (16-sector program)

| Item | Status | Notes |
|------|--------|-------|
| #01 Real Estate Development (`real_estate_development`) | DONE_VERIFIED | WO-015 full vertical slice |
| #04 Build Villa | DONE_VERIFIED | WO-014 baseline |
| #05 Real Estate Valuation | DONE_VERIFIED | WO-014 baseline |
| #06 Government Services | DONE_VERIFIED | HeroChat E2E gap closed WO-015 |
| #07 Project Management | DONE_VERIFIED | WO-014 baseline |
| #08 Engineering Consulting | DONE_VERIFIED | WO-014 baseline |
| #09 Contracting | DONE_VERIFIED | WO-014 baseline |
| #13 Smart Maintenance | DONE_VERIFIED | WO-014 baseline |
| #14 Facility Management | DONE_VERIFIED | WO-014 baseline |
| #15 Furnishing | DONE_VERIFIED | WO-014 baseline |
| #02 Real Estate Marketing (`real_estate_marketing`) | DONE_VERIFIED | WO-016 full vertical slice |
| #10 Building Materials | READY_WITH_SMALL_EXTENSION | Snapshot-only procurement brief feasible |
| #11 Equipment | READY_WITH_SMALL_EXTENSION | Snapshot-only equipment brief feasible |
| #03 Investment | BLOCKED_UPSTREAM | Two-sided model, Opportunity BO, regulatory decisions |
| #12 Factories & Suppliers | BLOCKED_UPSTREAM | Supplier authority / marketplace semantics |
| #16 Delivery & Owner Services | BLOCKED_UPSTREAM | OperationalProject lifecycle absent |

**REAL_JOURNEY_COUNT = 11** (complete vertical slices only).

## Commercial lifecycle

| Item | Status |
|------|--------|
| Service Request (submit → review → qualify) | DONE_VERIFIED |
| Quote / Proposal | BLOCKED_BUSINESS_DECISION |
| Contract | BLOCKED_UPSTREAM |
| Payment | BLOCKED_UPSTREAM |
| OperationalProject | BLOCKED_UPSTREAM |
| Marketplace (operational) | NOT_YET_REQUIRED |

## Auth & M1

| Item | Status |
|------|--------|
| OIDC production acceptance | BLOCKED_EXTERNAL |
| M1 (16-point) | PARTIAL (credential-free paths verified) |
| Git commit capability | BLOCKED_GIT_IDENTITY |

## Command Center & decision intelligence

| Item | Status |
|------|--------|
| Command Center V1 (overview, pulse, search) | DONE_VERIFIED |
| Evidence Drawer V1 | DONE_VERIFIED |
| Executive AI (rule-assisted / degraded) | DONE_VERIFIED |
| Executive AI live provider acceptance | UNVERIFIED_ENV_DEPENDENT |
| Evidence Drawer V2 (scorecard/risk/commercial expansion) | DEFERRED_JIT |
| Decision Inbox (Quote surfacing in UI) | READY_WITH_SMALL_EXTENSION |
| Watchlist | DEFERRED_JIT |
| Decision Journal | DEFERRED_JIT |
| Command Palette (Ctrl+K) | DEFERRED_JIT |
| Since My Last Visit | DEFERRED_JIT |

## Engineering & operability

| Item | Status |
|------|--------|
| CI configuration | DONE_VERIFIED |
| CI runtime verification | UNVERIFIED |
| Migration report (formal) | READY_WITH_SMALL_EXTENSION |
| Developer onboarding guide | PARTIAL (see PROJECT_HANDOVER.md) |
| Journey engineer guide | READY_WITH_SMALL_EXTENSION |
| Repository-wide cleanup WO | NOT_YET_REQUIRED |
| Backup/restore tested | UNKNOWN |
| USER_VISUAL_ACCEPTANCE (homepage) | AWAITING_USER |

## Business objects (JIT)

| BO | Trigger state | Notes |
|----|---------------|-------|
| Property / Land | TRIGGER_EMERGING | Development journey; JSON snapshot sufficient for now |
| Asset / Facility | TRIGGER_EMERGING | SM + FM journeys; no durable BO yet |
| Document | NO_TRIGGER | Metadata in snapshots only |
| Supplier | BLOCKED | Marketplace upstream |
| Opportunity | BLOCKED | Investment upstream |
| Quote | BLOCKED | Business decisions |
| OperationalProject | BLOCKED | Upstream commercial |

## Next READY_NOW (priority)

1. Journey #11 — Real Estate Marketing (if regression budget allows)
2. Decision Inbox — surface Quote blockers from `docs/business-lab-decisions.md`
3. Formal migration report + journey engineer guide
4. OIDC closure when external credentials available
5. Git identity configuration for logical commits
