# WO-015 Changed File Ledger

Classification: **PRE_EXISTING_DIRTY** = in worktree before WO-015; **WO015_CREATED** / **WO015_MODIFIED** = touched for this work order; **UNKNOWN_ORIGIN** = not classified (do not delete).

| Path | State | Stream | Domain | Authority | Reason | Migration | Tests |
|------|-------|--------|--------|-----------|--------|-----------|-------|
| `app/backend/services/real_estate_development_validators.py` | WO015_CREATED | B | Journey #10 | JOS / validation | Validators + First Value snapshot assembly | No | `test_real_estate_development_journey.py` |
| `app/backend/services/jos_seed.py` | WO015_MODIFIED | B | JOS | JOS | `REAL_ESTATE_DEVELOPMENT_WORKFLOW` definition | Via migration | journey + migration tests |
| `app/backend/services/jos.py` | WO015_MODIFIED | B | JOS | JOS | RED journey integration, guards, events | No | RED journey tests |
| `app/backend/services/service_requests.py` | WO015_MODIFIED | B | SR | Service Request | `RD-` prefix + intake mapping | No | RED journey tests |
| `app/backend/services/ai_core_intents.py` | WO015_MODIFIED | D | AI | AI Core | M1 intent registration | No | intent golden set |
| `app/backend/services/ai/intent_router.py` | WO015_MODIFIED | D | AI | AI Core | Deterministic RED routing + collision guards | No | intent golden set + HeroChat E2E |
| `app/backend/schemas/ai_intent.py` | WO015_MODIFIED | D | AI | AI Core | Intent enum extension | No | intent tests |
| `app/backend/services/command_center_search.py` | WO015_MODIFIED | C | Command Center | Read model | Journey label for search | No | CC tests |
| `app/backend/services/operations_dashboard.py` | WO015_MODIFIED | C | Command Center | Read model | Journey label for dashboard | No | CC tests |
| `app/backend/alembic/versions/p6q7r8s9t0u1_add_real_estate_development_journey_definition.py` | WO015_CREATED | B | DB | Alembic | Journey definition seed | **Yes** | `test_jos_migration_definitions.py` |
| `app/backend/tests/test_real_estate_development_journey.py` | WO015_CREATED | F | Tests | — | Full RED backend acceptance | No | self |
| `app/backend/tests/helpers/real_estate_development_flow.py` | WO015_CREATED | F | Tests | — | Flow helper | No | RED tests |
| `app/backend/tests/ai_eval/intent_golden_set.py` | WO015_MODIFIED | F | AI eval | AI Core | RED + GS golden cases | No | intent eval |
| `app/backend/tests/test_jos_migration_definitions.py` | WO015_MODIFIED | F | Migrations | Alembic | Head → `p6q7r8s9t0u1` | No | self |
| `app/frontend/src/features/journeys/real-estate-development/*` | WO015_CREATED | B | Journey UI | Presentation | RED vertical slice UI | No | RED E2E |
| `app/frontend/src/features/journeys/core/PreliminaryBriefCard.tsx` | WO015_MODIFIED | B | Shared journey UI | Presentation | Brief fields for RED First Value | No | RED E2E |
| `app/frontend/src/App.tsx` | WO015_MODIFIED | B | Routing | Composition | `/journeys/real-estate-development` route | No | RED E2E |
| `app/frontend/src/components/sections/Hero/HeroChat.tsx` | WO015_MODIFIED | B | HeroChat | AI entry | RED journey start wiring | No | HeroChat E2E |
| `app/frontend/src/features/ai-workspace/WorkspaceContext.tsx` | WO015_MODIFIED | B | Workspace | Read/display | RED labels + resume | No | workspace tests |
| `app/frontend/src/components/serviceRequests/IntakeSnapshotSummary.tsx` | WO015_MODIFIED | B | Workspace | Read/display | RED snapshot rendering | No | snapshot tests |
| `app/frontend/src/features/service-requests/operationalStages.ts` | WO015_MODIFIED | B | SR display | Presentation | RED stage labels | No | — |
| `app/frontend/src/pages/SectorPage.tsx` | WO015_MODIFIED | B | Sector entry | Sector registry | CTA → RED journey | No | route E2E |
| `app/frontend/e2e/real-estate-development.spec.ts` | WO015_CREATED | F | E2E | — | Dedicated RED path | No | self |
| `app/frontend/e2e/herochat-intent.spec.ts` | WO015_MODIFIED | A/F | E2E | — | GS + RED HeroChat + collisions | No | self |
| `app/frontend/e2e/homepage-full-page.spec.ts` | WO015_MODIFIED | F | E2E | — | Flake fix: `waitForHomepageSections` in beforeEach | No | self |
| `docs/wo015/WO015_CONSOLIDATED_EXECUTION_REPORT.md` | WO015_CREATED | G | Docs | — | WO-015 handover | No | — |
| `docs/wo015/WO015_CHANGED_FILE_LEDGER.md` | WO015_CREATED | G | Docs | — | This ledger | No | — |

**Logical commit groups (Git identity blocked):**

1. `government-herochat-e2e` — `herochat-intent.spec.ts`
2. `real-estate-development-backend` — backend services, migration, backend tests
3. `real-estate-development-frontend` — journey feature + wiring
4. `real-estate-development-integration` — E2E specs
5. `engineering-hardening` — homepage E2E flake fix
6. `docs-handover-wo015` — `docs/wo015/*`

**Migration impact:** `p6q7r8s9t0u1` adds `real_estate_development` journey definition only (non-destructive, forward-safe).

**WO-016 additions:** Journey #11 marketing (backend `q7r8s9t0u1v2`, frontend `real-estate-marketing/`, E2E, HeroChat S24), Decision Inbox panel, intent router `عقاري` pattern fix.

**Git commit capability:** READY — logical commits applied 2026-09-11.
