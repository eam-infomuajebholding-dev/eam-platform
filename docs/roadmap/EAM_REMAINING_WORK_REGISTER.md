# EAM Remaining Work Register

**Canonical roadmap register** — reconciled through WO-021 (2026-09-12).  
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
| Acceptance | BLOCKED_BUSINESS_DECISION — owner pack: `docs/commercial/QUOTE_ACCEPTANCE_OWNER_DECISION_PACK.md` |
| Contract | BLOCKED_UPSTREAM |
| Payment | BLOCKED_BUSINESS_DECISION |
| OperationalProject | BLOCKED_UPSTREAM |

## Platform

| Item | Status |
|------|--------|
| OIDC production | BLOCKED_EXTERNAL |
| M1 full acceptance | PARTIAL |
| USER_VISUAL_ACCEPTANCE | APPROVED_BY_USER (light homepage, 2026-09-12) |
| CI config | DONE_VERIFIED |
| CI runtime | VERIFIED @ 7a62c4f; **current HEAD needs re-run** after WO-021 ci.yml change |
| E2E auth determinism | DONE (`docs/engineering/E2E_TEST_AUTH.md`) |
| Backup/restore | NOT_CONFIGURED (`docs/engineering/BACKUP_RESTORE_READINESS.md`) |
| OIDC | BLOCKED_EXTERNAL — `OIDC_CLIENT_SECRET` absent |
| Alembic head alignment | DONE_VERIFIED (`t0u1v2w3x4y5`) |
| Git logical commits (WO-017/018/019) | DONE_VERIFIED |

## Command Center (JIT deferred)

Evidence V2 expansion, Watchlist, Decision Journal, Command Palette, Since My Last Visit → **DEFERRED_JIT**  
Foundation (overview, pulse, search, decision inbox surfacing) → **DONE_VERIFIED / PARTIAL**

## Engineering docs

Developer onboarding, runbooks, engineer guides → **DONE** (`docs/engineering/`)

## Cleanup

| Item | Status |
|------|--------|
| CLEANUP_READINESS | APPROACHING_READY |
| Final cleanup WO | NOT_YET_REQUIRED |

## NEXT_READY_NOW

1. Business Lab: Quote acceptance decisions (20 questions in decision record)
2. USER_VISUAL_ACCEPTANCE (owner review, 1586×992 evidence)
3. OIDC external prerequisites for M1 16/16 closure

## NEXT_BLOCKED

- **EXTERNAL:** OIDC
- **BUSINESS:** Quote acceptance, Payment policy
- **UPSTREAM:** Investment, Factories, Delivery, Contract, OperationalProject

Mirror: `docs/wo015/EAM_REMAINING_WORK_REGISTER.md` (keep in sync on commit).
