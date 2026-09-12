# EAM Remaining Work Register (WO-015 reconciliation)

Deduplicated across Phase 2 / Master-008 / Delta-009 / WO-012–021. Status vocabulary only as listed.

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
| #10 Building Materials (`building_materials`) | DONE_VERIFIED | WO-017 full vertical slice |
| #11 Equipment (`equipment`) | DONE_VERIFIED | WO-017 full vertical slice |
| #03 Investment | BLOCKED_UPSTREAM | Two-sided model, Opportunity BO, regulatory decisions |
| #12 Factories & Suppliers | BLOCKED_UPSTREAM | Supplier authority / marketplace semantics |
| #16 Delivery & Owner Services | BLOCKED_UPSTREAM | OperationalProject lifecycle absent |

**REAL_JOURNEY_COUNT = 13** (complete vertical slices only).

## Commercial lifecycle

| Item | Status |
|------|--------|
| Service Request (submit → review → qualify) | DONE_VERIFIED |
| Quote / Proposal | DONE_VERIFIED (WO-018 — draft → issued lifecycle) |
| Acceptance | BLOCKED_BUSINESS_DECISION — owner pack in `docs/commercial/QUOTE_ACCEPTANCE_OWNER_DECISION_PACK.md` |
| Contract | BLOCKED_UPSTREAM |
| Payment | BLOCKED_BUSINESS_DECISION |
| OperationalProject | BLOCKED_UPSTREAM |
| Marketplace (operational) | NOT_YET_REQUIRED |

## Auth & M1

| Item | Status |
|------|--------|
| OIDC production acceptance | BLOCKED_EXTERNAL |
| M1 (16-point) | PARTIAL (credential-free paths verified) |
| Git commit capability | DONE_VERIFIED (logical commits through WO-019, pushed) |

## Command Center & decision intelligence

| Item | Status |
|------|--------|
| Command Center V1 (overview, pulse, search) | DONE_VERIFIED |
| Evidence Drawer V1 | DONE_VERIFIED |
| Executive AI (rule-assisted / degraded) | DONE_VERIFIED |
| Executive AI live provider acceptance | UNVERIFIED_ENV_DEPENDENT |
| Evidence Drawer V2 (lineage fields) | PARTIAL (contributing count, data quality WO-021) |
| Decision Inbox (Quote surfacing in UI) | DONE_VERIFIED |
| Watchlist | DEFERRED_JIT |
| Decision Journal | DEFERRED_JIT |
| Command Palette (Ctrl+K) | DEFERRED_JIT |
| Since My Last Visit | DEFERRED_JIT |

## Engineering & operability

| Item | Status |
|------|--------|
| CI configuration | DONE_VERIFIED |
| CI runtime verification | VERIFIED @ 7a62c4f; WO-021 HEAD needs re-run |
| E2E auth determinism | DONE (`docs/engineering/E2E_TEST_AUTH.md`) |
| Backup/restore | NOT_CONFIGURED |
| OIDC | BLOCKED_EXTERNAL (`OIDC_CLIENT_SECRET` absent) |
| Migration report (formal) | DONE_VERIFIED (`docs/wo017/WO017_MIGRATION_REPORT.md`) |
| Developer onboarding guide | DONE_VERIFIED (`docs/engineering/DEVELOPER_ONBOARDING.md`) |
| Journey engineer guide | DONE_VERIFIED (`docs/wo017/JOURNEY_ENGINEER_GUIDE.md`) |
| Repository-wide cleanup WO | NOT_YET_REQUIRED (APPROACHING_READY) |
| Backup/restore tested | UNKNOWN |
| USER_VISUAL_ACCEPTANCE (homepage) | AWAITING_USER |

## Business objects (JIT)

| BO | Status |
|----|--------|
| Quote | IMPLEMENTED |
| Opportunity | NO_TRIGGER |
| Supplier | NO_TRIGGER |
| Contract | BLOCKED_UPSTREAM |
| OperationalProject | BLOCKED_UPSTREAM |
| Payment | BLOCKED_BUSINESS_DECISION |

Canonical mirror: `docs/roadmap/EAM_REMAINING_WORK_REGISTER.md`
