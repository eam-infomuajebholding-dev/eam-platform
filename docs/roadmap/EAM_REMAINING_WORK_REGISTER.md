# EAM Remaining Work Register

**Canonical roadmap register** — reconciled WO-012 through WO-016H (2026-09-11).  
Each item appears once. Supersedes duplicate entries in phase archives.

## Product — Journeys (16-sector)

| # | Sector | Status |
|---|--------|--------|
| 01 | Real Estate Development | DONE_VERIFIED |
| 02 | Real Estate Marketing | DONE_VERIFIED |
| 03 | Investment | BLOCKED_UPSTREAM |
| 04 | Build Villa | DONE_VERIFIED |
| 05 | Valuation | DONE_VERIFIED |
| 06 | Government Services | DONE_VERIFIED |
| 07 | Project Management | DONE_VERIFIED |
| 08 | Engineering Consulting | DONE_VERIFIED |
| 09 | Contracting | DONE_VERIFIED |
| 10 | Building Materials | DONE_VERIFIED |
| 11 | Equipment | DONE_VERIFIED |
| 12 | Factories & Suppliers | BLOCKED_UPSTREAM |
| 13 | Smart Maintenance | DONE_VERIFIED |
| 14 | Facility Management | DONE_VERIFIED |
| 15 | Furnishing | DONE_VERIFIED |
| 16 | Delivery & Owner Services | BLOCKED_UPSTREAM |

**REAL_JOURNEY_COUNT = 13**

## Commercial

| Stage | Status |
|-------|--------|
| Service Request → Review → Qualify | DONE_VERIFIED |
| Quote / Proposal | DONE_VERIFIED |
| Acceptance | NOT_YET_REQUIRED |
| Contract | BLOCKED_UPSTREAM |
| Payment | BLOCKED_UPSTREAM |
| OperationalProject | BLOCKED_UPSTREAM |

## Platform

| Item | Status |
|------|--------|
| OIDC production | BLOCKED_EXTERNAL |
| M1 full acceptance | PARTIAL |
| USER_VISUAL_ACCEPTANCE | AWAITING_USER |
| CI config | DONE_VERIFIED |
| CI runtime | UNVERIFIED |

## Command Center (JIT deferred)

Evidence V2, Watchlist, Decision Journal, Command Palette, Since My Last Visit → **DEFERRED_JIT**

## Engineering docs (WO-016G)

Developer onboarding, runbooks, engineer guides → **DONE** (`docs/engineering/`)

## NEXT_READY_NOW

1. `alembic upgrade head` on dev/staging
2. Commit WO-017 + WO-018 (57 dirty files)
3. CI runtime verification
4. USER_VISUAL_ACCEPTANCE
5. Quote acceptance workflow (post-M1)

## NEXT_BLOCKED

- **EXTERNAL:** OIDC
- **UPSTREAM:** Investment, Factories, Delivery, Contract, Payment, OpProject

Mirror: `docs/wo015/EAM_REMAINING_WORK_REGISTER.md` (keep in sync on commit).
