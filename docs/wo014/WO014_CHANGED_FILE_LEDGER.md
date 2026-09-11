# WO-014 Changed File Ledger

| Path | Stream | Domain | Change Type | Reason | Authority | Tests |
|------|--------|--------|-------------|--------|-----------|-------|
| `app/backend/services/executive_ai.py` | B | Command Center / AI | CREATE | Executive AI via AI Core with degraded fallback | AI Core | `test_command_center_wo014.py` |
| `app/backend/services/command_center_metrics.py` | C | Metrics | CREATE | Metric dictionary single source for evidence | Read model | `test_command_center_wo014.py` |
| `app/backend/services/command_center_search.py` | C | Search | CREATE | Deterministic Command Search | Read model | `test_command_center_wo014.py` |
| `app/backend/services/ai/prompt_registry.py` | B | AI | EXTEND | `executive.brief` prompt | Prompt Registry | prompt inventory |
| `app/backend/services/ai_core.py` | B | AI | EXTEND | `generate_executive_analysis` | AI Core | degraded path |
| `app/backend/routers/operations_dashboard.py` | A/C | Command Center | EXTEND | executive-brief, evidence, search endpoints | Admin auth | dashboard tests |
| `app/backend/schemas/operations_dashboard.py` | A/C | Command Center | EXTEND | Evidence, Search, Executive schemas | Read model | schema tests |
| `app/backend/services/government_services_validators.py` | D | JOS | CREATE | Journey #06 validators + First Value | JOS | `test_government_services_journey.py` |
| `app/backend/services/jos_seed.py` | D | JOS | EXTEND | GOVERNMENT_SERVICES_WORKFLOW, UPSERT | JOS | migration + journey tests |
| `app/backend/alembic/versions/o5p6q7r8s9t0_*` | D | DB | CREATE | GS journey definition migration | Alembic | `test_jos_migration_definitions.py` |
| `app/frontend/src/features/command-center/components/EvidenceDrawer.tsx` | C | UI | CREATE | Evidence Drawer V1 | Display only | command-center E2E |
| `app/frontend/src/features/command-center/components/CommandSearchBar.tsx` | C | UI | CREATE | Command Search UI | Display only | command-center E2E |
| `app/frontend/src/pages/OwnerCommandCenter.tsx` | A/C | UI | EXTEND | Wire search + evidence | Composition | command-center E2E |
| `app/frontend/src/features/journeys/government-services/*` | D | Journey | CREATE | GS vertical slice frontend | JOS UI | `government-services.spec.ts` |
| `app/frontend/e2e/m1-auth-smoke.spec.ts` | H | Tests | FIX | BV resume + OIDC BLOCKED_EXTERNAL skip | — | M1 smoke |
| `app/frontend/e2e/m1-browser.spec.ts` | H | Tests | FIX | Full 15-step BV, workspace scoping, Flow C dedicated route | — | M1 browser |
| `app/frontend/e2e/homepage-full-page.spec.ts` | H | Tests | FIX | Wait for scrollHeight > viewport | — | homepage scroll |
| `app/frontend/e2e/project-management.spec.ts` | H | Tests | FIX | Timeline step heading assertion | — | PM E2E |
| `app/frontend/e2e/government-services.spec.ts` | D/H | Tests | ADD/FIX | GS anonymous E2E | JOS | GS spec |
| `app/backend/tests/ai_eval/intent_golden_set.py` | F | AI | EXTEND | GS intent cases | Intent router | intent eval |

**Migration impact:** `o5p6q7r8s9t0` adds `government_services` journey definition only (non-destructive).

**Git commit capability:** BLOCKED_GIT_IDENTITY — logical groups prepared in Section Q of final report.
