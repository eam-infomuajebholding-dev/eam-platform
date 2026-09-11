# WO-016 Changed File Ledger

Reconciled against repository truth **2026-09-11**.  
Includes WO-016/017/018 uncommitted work on branch `feature/frontend-wo001-hero`.

## Classification key

| Tag | Meaning |
|-----|---------|
| PRE_EXISTING_DIRTY | Modified before this WO continuation session |
| WO016_CREATED | New file from Marketing journey (WO-016 scope) |
| WO017_CREATED | New file from Materials + Equipment (WO-017) |
| WO018_CREATED | New file from Quote BO (WO-018) |
| WO016_MODIFIED | Modified in WO-016/017/018 convergence |
| UNKNOWN_ORIGIN | Log/temp artifacts — do not delete |

## Modified (WO016_MODIFIED / convergence)

| File | Classification |
|------|----------------|
| `app/backend/routers/service_requests.py` | WO018_MODIFIED |
| `app/backend/services/operations_dashboard.py` | WO016_MODIFIED |
| `app/backend/services/executive_ai.py` | WO016_MODIFIED |
| `app/backend/services/service_requests.py` | WO017_MODIFIED |
| `app/backend/services/jos.py` | WO017_MODIFIED |
| `app/backend/services/jos_seed.py` | WO017_MODIFIED |
| `app/backend/services/command_center_search.py` | WO017_MODIFIED |
| `app/backend/services/ai/intent_router.py` | WO017_MODIFIED |
| `app/backend/services/ai_core_intents.py` | WO017_MODIFIED |
| `app/backend/schemas/ai_intent.py` | WO017_MODIFIED |
| `app/backend/tests/test_jos_migration_definitions.py` | WO018_MODIFIED |
| `app/backend/tests/test_operations_dashboard.py` | WO018_MODIFIED |
| `app/backend/tests/ai_eval/intent_golden_set.py` | WO017_MODIFIED |
| `app/frontend/src/App.tsx` | WO017_MODIFIED |
| `app/frontend/src/pages/ProfessionalReview.tsx` | WO018_MODIFIED |
| `app/frontend/src/pages/ServiceRequestDetail.tsx` | WO018_MODIFIED |
| `app/frontend/src/pages/SectorPage.tsx` | WO017_MODIFIED |
| `app/frontend/src/components/sections/Hero/HeroChat.tsx` | WO017_MODIFIED |
| `app/frontend/src/components/serviceRequests/IntakeSnapshotSummary.tsx` | WO017_MODIFIED |
| `app/frontend/src/features/ai-workspace/WorkspaceContext.tsx` | WO017_MODIFIED |
| `app/frontend/src/features/service-requests/operationalStages.ts` | WO017_MODIFIED |
| `docs/business-lab-decisions.md` | WO018_MODIFIED |
| `docs/commercial-architecture.md` | WO016_MODIFIED |
| `docs/wo015/EAM_REMAINING_WORK_REGISTER.md` | WO017_MODIFIED |
| `docs/wo015/EAM_BUSINESS_OBJECT_TRIGGER_REGISTER.md` | WO016_MODIFIED |

## Created — WO-017 (Materials + Equipment)

| Path | Notes |
|------|-------|
| `app/backend/services/building_materials_validators.py` | Journey #10 sector |
| `app/backend/services/equipment_validators.py` | Journey #11 sector |
| `app/backend/alembic/versions/r8s9t0u1v2w3_add_building_materials_journey_definition.py` | |
| `app/backend/alembic/versions/s9t0u1v2w3x4_add_equipment_journey_definition.py` | |
| `app/backend/tests/test_building_materials_journey.py` | |
| `app/backend/tests/test_equipment_journey.py` | |
| `app/backend/tests/helpers/building_materials_flow.py` | |
| `app/backend/tests/helpers/equipment_flow.py` | |
| `app/frontend/src/features/journeys/building-materials/` | 5 files |
| `app/frontend/src/features/journeys/equipment/` | 5 files |
| `app/frontend/e2e/building-materials.spec.ts` | |
| `app/frontend/e2e/equipment.spec.ts` | |
| `docs/wo017/` | Migration report + engineer guide |

## Created — WO-018 (Quote BO)

| Path | Notes |
|------|-------|
| `app/backend/models/quotes.py` | Quote + line items |
| `app/backend/services/quotes.py` | Single authority |
| `app/backend/schemas/quotes.py` | |
| `app/backend/routers/operations_quotes.py` | Ops API |
| `app/backend/alembic/versions/t0u1v2w3x4y5_add_quotes.py` | |
| `app/backend/tests/test_quotes.py` | |
| `app/backend/tests/test_operations_quotes.py` | |
| `app/frontend/src/features/operations/api/quotesClient.ts` | |
| `app/frontend/src/features/operations/components/QuoteProposalPanel.tsx` | |
| `app/frontend/src/features/service-requests/components/CustomerQuoteView.tsx` | |
| `docs/wo018/WO018_MIGRATION_REPORT.md` | |

## UNKNOWN_ORIGIN (do not delete)

| Path | Notes |
|------|-------|
| `app/frontend/build-log.txt` | Build artifact |
| `app/frontend/lint-log.txt` | Lint artifact |
| `app/frontend/pw-*.txt` | Playwright logs |
| `app/frontend/screenshots/` | Visual evidence |
| `app/frontend/test-screenshots/` | Test artifacts |

## Commit groups (when authorized)

1. `wo016-marketing` — if not already in c7b1b7b commits
2. `wo017-materials-equipment` — backend + migration + tests
3. `wo017-materials-equipment-frontend` — frontend + E2E
4. `wo018-quote-bo` — Quote backend + frontend + docs
5. `docs-registers-wo016` — registers + commercial architecture
