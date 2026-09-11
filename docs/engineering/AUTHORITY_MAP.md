# EAM Authority Map

> Canonical copy for engineering docs. Source lineage: `docs/wo015/EAM_AUTHORITY_MAP.md` + WO-016A verification.

| Concept | Authority | Primary modules | Forbidden elsewhere |
|---------|-----------|-----------------|---------------------|
| Identity / session | Auth | `dependencies/auth.py`, JWT | UI must not grant business permissions |
| Journey state | JOS | `services/jos.py`, `jos_seed.py` | AI, UI, CC |
| Formal customer request | Service Request | `services/service_requests.py` | Per-journey SR tables |
| Quote / Proposal | Quote | `services/quotes.py` (WO-018) | No UI-side pricing authority |
| Editorial content | CMS | CMS services | CMS Project ≠ OperationalProject |
| AI orchestration | AI Core | `ai_core.py`, `ai_core_intents.py` | No frontend LLM |
| Governed AI mutations | Tool Gateway + Policy | `routers/ai_tools.py`, `tool_policy.py` | Direct AI DB writes |
| Sector metadata (16) | Sector registry | `src/data/sectors.ts` | Duplicate sector arrays |
| CC metrics | Backend read model | `operations_dashboard.py` | Frontend calculation |
| CC business writes | **None** | — | Read/control plane only |
| Prompts (production) | Prompt Registry | `ai/prompt_registry.py` | Scattered prompt strings |
| Tools | Tool Registry | `ai/tool_registry.py` | Ad-hoc tools |
| Schema | Alembic | `alembic/versions/` | Single chain, one head |

## Verified counts (2026-09-11)

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
