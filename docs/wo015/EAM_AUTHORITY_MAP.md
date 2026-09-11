# EAM Authority Map

Single sources of truth. Duplicate authorities are architecture defects (P0).

| Concept | Authority | Primary modules | Forbidden elsewhere |
|---------|-----------|-----------------|---------------------|
| Identity / session | Auth | `app/backend/services/auth*`, auth middleware | UI must not interpret identity as business authority |
| Journey state, transitions, resume | JOS | `app/backend/services/jos.py`, `jos_seed.py`, journey routers | AI, UI, Command Center must not own journey state |
| Formal submitted customer request | Service Request | `app/backend/services/service_requests.py` | No per-journey SR tables |
| Editorial / marketing content | CMS | CMS services + frontend CMS pages | CMS Project ≠ OperationalProject |
| AI orchestration (understand, classify, guide) | AI Core | `app/backend/services/ai_core.py`, `ai_core_intents.py` | No frontend direct LLM calls |
| Governed AI mutations | Tool Gateway + Tool Policy | `app/backend/routers/ai_tools.py`, tool registry/policy | No direct AI DB writes |
| Sector metadata (16 sectors) | Sector registry | `app/frontend/src/data/sectors.ts` (+ backend labels where mirrored) | No duplicate sector lists in journeys |
| Command Center metrics | Backend read model | `command_center_metrics.py`, `operations_dashboard.py` | Frontend calculates display only |
| Command Center business writes | **None** | — | CC is read/control plane only |
| Prompt text (production) | Prompt Registry | `app/backend/services/ai/prompt_registry.py` | No scattered production prompts |
| Tool definitions | Tool Registry | `app/backend/services/ai/tool_registry.py` | No ad-hoc tools |
| Alembic schema | Alembic (single head) | `app/backend/alembic/versions/` | One migration chain |

## Verified invariant counts (WO-015 closure)

```
JOS_SYSTEM_COUNT=1
AUTH_SYSTEM_COUNT=1
AI_CORE_COUNT=1
CMS_PERSISTENCE_SYSTEM_COUNT=1
SERVICE_REQUEST_AUTHORITY_COUNT=1
SECTOR_REGISTRY_COUNT=1
TOOL_EXECUTION_PATH_COUNT=1
EXECUTIVE_AI_PATH_COUNT=1
AI_STATE_OWNER=NO
UI_BUSINESS_STATE_OWNER=NO
COMMAND_CENTER_BUSINESS_AUTHORITY_COUNT=0
METRIC_CALCULATION_AUTHORITY=BACKEND_READ_MODEL
```
