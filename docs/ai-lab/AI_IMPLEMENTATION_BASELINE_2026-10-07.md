# AI Implementation Baseline — 2026-10-07

**Status:** ACCEPTED  
**Branch:** AI Lab  
**Authority:** Product owner acceptance of the code inventory on 2026-10-07  
**Supersedes:** planning narratives that are not present in the repository on this date

This document freezes what the code does. It is not a target architecture. The target is `AI_PLATFORM_SPECIFICATION_v1.0.md`. The first authorized execution step is `WO001_AI_CORE_AND_CONTEXT_FOUNDATION.md`.

## What the generation is

The running system is generation one:

```text
EAM Copilot
    → Intent Classifier (rules, then deepseek-v3.2 JSON)
    → six Tool Gateway tools
    → JOS / service requests
```

The frozen name for the target platform is **EAM AI**. **EAM Copilot** stays a legacy interface label until a later work order renames it. WO-001 does not rename it.

## Preserved invariant

Business logic is not inside the model. AI understands, proposes, and coordinates. JOS and business services keep state, execution, and authority. This matches `docs/engineering/ADR-GLOBAL-EAM-COPILOT.md` and `docs/engineering/AUTHORITY_MAP.md`. The upgrade path keeps this split.

## Accepted gap judgment

Judgment is against the adopted AI Lab decisions, not against code quality.

| Domain | In the repository | Adopted decision | Judgment |
|--------|-------------------|------------------|----------|
| One AI Core | Early nucleus (`AICoreService`) | Shared institutional core | Partial — sound base |
| Home AI Workspace | HeroChat / Copilot | Primary platform entry | Partial |
| Intent Detection | Rules + `deepseek-v3.2` | Intent → Capability → Journey | Partial |
| JOS Integration | Six limited tools | Full journey execution | Gap — M1 |
| Guided Journey | Flag exists and is `false` | Real conversational journey | Off |
| Context Engine | Last turns plus optional journey snapshot | User, role, platform, journey, permissions | Required |
| Shared Memory | Last 20 messages on the request | Permission-governed persistent memory | Required |
| RAG | Absent (`AI_RETRIEVAL_FAILED` is contract-only) | Knowledge retrieval with citations | Required |
| Tool Calling | Six-tool gateway | Expanded capability registry | Partial — sound nucleus |
| AI Employees | Absent | Institutional runtime | Later, not M1 |
| Provider Abstraction | One OpenAI-compatible endpoint | Provider-agnostic gateway | Started |
| Admin AI Workspace | Site-edit copilot in dev edit mode | PMC AI Workspace | Incomplete |
| Human Handoff | HTTP body `queued` only | Durable operational process | Required |
| AI Observability | `eam.ai.trace` and tool audit | Usage, cost, quality, latency, audit | Partial |
| Fallback | Unconfigured provider and rule-assisted brief | AI plus traditional interface | Sound base |

## Code anchors (do not treat as the target)

| Concern | Path |
|---------|------|
| Turn orchestration | `app/backend/services/ai_core.py` |
| Contract 1.1.0 | `app/backend/schemas/ai_contract.py` |
| Turn envelope | `app/backend/schemas/ai_core.py` (`WorkspaceTurnRequest`) |
| Prompts | `app/backend/services/ai/prompt_registry.py` |
| Intent | `app/backend/services/ai/intent_router.py` |
| Tools | `app/backend/services/ai/tool_registry.py` |
| Policy and audit | `app/backend/services/ai/tool_policy.py` |
| Media island | `app/backend/services/aihub.py` |
| Home client | `app/frontend/src/features/ai-workspace/WorkspaceContext.tsx` |
| Guided flag | `app/frontend/src/config/assistant.ts` (`ASSISTANT_GUIDED_JOURNEY_ENABLED = false`) |
| Executive brief | `app/backend/services/executive_ai.py` |

## Explicit non-rebuild

Do not replace this stack. HeroChat becomes the first AI Workspace client. `AICoreService` is split later into gateway, context, intent, and policy. `ai/tools` becomes the tool registry nucleus. AIHub becomes a multimodal capability behind the AI gateway in a later work order, not a second product brain.

## Next authorized step

**AI Lab WO-001 — AI Core & Context Foundation.**  
No other AI feature work order is authorized to start.
