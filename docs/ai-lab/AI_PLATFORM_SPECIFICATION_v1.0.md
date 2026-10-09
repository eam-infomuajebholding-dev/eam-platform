# EAM AI Platform Specification v1.0

**Status:** ADOPTED  
**Date:** 2026-10-07  
**Baseline:** `AI_IMPLEMENTATION_BASELINE_2026-10-07.md`  
**First work order:** `WO001_AI_CORE_AND_CONTEXT_FOUNDATION.md`

This specification records the frozen AI Lab decision and turns it into a work-order sequence. It does not open a new architecture discussion.

The authority split in `docs/engineering/ADR-GLOBAL-EAM-COPILOT.md` stays in force: the model proposes, JOS and business services own state. Where that ADR says “Global EAM Copilot”, this specification’s official name is **EAM AI**. Copilot is the legacy client label.

## Target

```text
EAM AI Core
    ├── AI Gateway
    ├── Context Engine
    ├── Memory
    ├── Knowledge / RAG
    ├── Prompt Registry
    ├── Policy / Guardrails
    ├── Tool / Capability Registry
    └── Observability
            │
            ▼
   Journey Operating System
            │
     ┌──────┼────────┐
     ▼      ▼        ▼
 Engineering  PMC   Customer
 Workspace  Workspace Workspace
```

Home HeroChat is the first workspace client. It is not deleted.

## Invariants

1. The model does not own journey state, service requests, quotes, contracts, or payments.
2. Mutations go through the Tool Gateway and Tool Policy. The model does not grant permission.
3. Identity, role, and permissions are resolved on the server. A client hint or model field is never authorization.
4. Route context is presentation. JOS context is the active journey. Disagreement is explicit.
5. When the provider is absent, the traditional interface and rule-assisted paths still work.
6. Retrieved knowledge, when it exists, is cited. Uncited company facts do not become policy.
7. M1 does not wait on digital employees, predictive models, dynamic pricing, or autonomous partner assignment.

## Component map (current file → target role)

| Target part | Now | Later work order |
|-------------|-----|------------------|
| Workspace client | `WorkspaceContext`, `HeroChat`, `GlobalAssistantDock` | Stays; binds to the core contract in WO-001 |
| AI Core | `AICoreService.handle_turn` | Remains the single entry; responsibilities peel off, the class is not rewritten first |
| AI Gateway | `AIHubService` OpenAI-compatible client, called from several methods | Provider-agnostic gateway after the core contract exists |
| Context Engine | `conversation_history` + optional `journey_snapshot` | WO-001 |
| Memory | Last 20 messages on the HTTP body | Persistent, permission-scoped store |
| Knowledge / RAG | Static lines inside the copilot system prompt | Cited retrieval over trusted EAM knowledge |
| Prompt Registry | `prompt_registry.py` (three prompts) | Stays the owner of production prompts |
| Policy | Deny-list in the system prompt; tool policy on six tools | Guardrails that can block before the model, still not a second authority |
| Tool registry | Six tools in `tool_registry.py` | Capability registry; the six tools remain the first entries |
| Observability | `eam.ai.trace`, `ai_tool_audit` | Usage, cost, quality, latency, audit, distributed rate limit |
| JOS | `journey.start`, `resume`, `read_state` | Full journey execution, starting with Build Villa guided flow |
| PMC workspace | Site-edit copilot while edit mode is on | Admin AI workspace with the traditional editor as fallback |
| Human handoff | `human_handoff.request` returns `queued` | Durable queue, assignment, follow-up |

## Work-order register

WO-001 through WO-009 are implemented for M1 as of 2026-10-07. Exclusions below stay out. Handoff assignment remains a human follow-up on the queued record; it is not autonomous partner assignment.

| ID | Title | Adopted item | Status |
|----|-------|--------------|--------|
| WO-001 | AI Core & Context Foundation | Unify the core contract; Context Engine | **IMPLEMENTED** |
| WO-002 | Intent → Capability → Journey | Replace the seven-intent classifier ceiling with routing across the 16-journey catalog | **IMPLEMENTED** |
| WO-003 | Guided Journey M1 — Build Villa | Turn `ASSISTANT_GUIDED_JOURNEY_ENABLED` into a real conversational journey on the existing villa runtime | **IMPLEMENTED** |
| WO-004 | Persistent Conversation | Leave the page and return; memory governed by the WO-001 context | **IMPLEMENTED** |
| WO-005 | Knowledge / RAG | Trusted EAM knowledge with citations, replacing hardcoded company facts | **IMPLEMENTED** |
| WO-006 | Tool / Capability Registry | Registry as the extension point; the six tools are the seed, not the ceiling | **IMPLEMENTED** |
| WO-007 | Durable Human Handoff | Persist, assign, and follow the handoff the ADR already describes | **IMPLEMENTED** |
| WO-008 | PMC AI Workspace | Admin workspace; traditional editor remains the fallback | **IMPLEMENTED** |
| WO-009 | Evaluation, Observability, Distributed Limits | Usage, cost, quality, latency, audit, and a limiter that survives more than one process | **IMPLEMENTED** |

WO-009 is the production gate for AI Core. It is last on purpose. It is not permission to skip the trace that WO-001 already extends.

## M1 exclusions

These are recorded so they are not pulled into an early work order:

- Advanced digital employees
- Predictive AI and anomaly models
- Dynamic pricing
- Autonomous partner assignment
- A forced rename from Copilot to EAM AI in the interface
- Image, video, and audio product surfaces (AIHub stays available to authenticated API callers; it is not the M1 gap)

## Definition of the platform

EAM AI is a context-aware business execution layer bound to JOS. A conversational answer is one capability of that layer. The largest gap on 2026-10-07 is that the code still stops at the answer.
