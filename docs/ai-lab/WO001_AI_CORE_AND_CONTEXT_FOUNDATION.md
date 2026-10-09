# AI Lab WO-001 — AI Core & Context Foundation

**Status:** IMPLEMENTED — 2026-10-07  
**Date:** 2026-10-07  
**Spec:** `AI_PLATFORM_SPECIFICATION_v1.0.md` v1.0  
**Baseline:** `AI_IMPLEMENTATION_BASELINE_2026-10-07.md`  
**Blocks:** WO-002 through WO-009  
**Does not authorize:** any other AI Lab work order

## Outcome

Every current AI entrypoint asks one core, and that core receives a server-built context before any model call. The context names who is speaking, on which surface, against which journey, and with which permissions. The client may hint. The server decides.

HeroChat, the Command Center brief, and the site-edit copilot stay. They become clients of this contract. `AICoreService` stays the entry. This work order peels context out of the ad hoc request fields. It does not split the class into gateway, memory, and RAG.

## Why this is first

The baseline generation can classify a sentence and call six tools. It cannot yet say, from trusted sources, who the actor is, which workspace they are in, which JOS journey is actually active, and what they are allowed to touch. Later routing, memory, retrieval, and handoff all read that context. Building them first would bake the gap in.

## In scope

### 1. Additive contract

Extend the workspace turn envelope. Keep contract `1.1.0` responses working for a client that sends only `message` and `conversation_history`.

Add a client hint object, not an authority object:

- `surface`: `home` | `journey` | `command_center` | `site_editor`
- `route`: path the user is looking at
- `locale`: `ar` | `en`
- `journey_instance_id`: optional integer the client believes is active

The response gains `contract_version` `1.2.0` when the new path is used, plus the `trace_id` already returned. Do not add a second public AI brain.

### 2. Context Engine

New server component, called by `AICoreService` and by `ExecutiveAIService` before a model call.

`AIContext` is built on the server:

| Field | Source | Rule |
|-------|--------|------|
| Actor | JWT when present, else `X-Anonymous-Session-Id` | Ignore any user id in the body |
| Role | Auth dependencies already used by the platform | Empty role for anonymous |
| Surface | Client hint, default `home` | Hint only |
| Route | Client hint | Presentation only |
| Locale | Client hint, default `ar` | Hint only |
| Journey | JOS, when an instance id is in play | Ownership checked like Tool Gateway |
| Business object | Service request id only if the caller owns it | Absent when unknown |
| Permissions | Server policy for this actor | Never copied from the client or the model |
| Conflict | Route sector versus JOS journey type | Set when they disagree; do not silently pick the route |

If the hinted journey exists and the actor does not own it, return `AI_CONTEXT_FORBIDDEN` and do not call the model.

Pass a non-secret summary into `eam.ai.trace`: surface, actor kind (`user` or `anonymous`), journey id, conflict flag. Do not log the system prompt, the permission list in full, or customer content beyond what the trace already avoids.

### 3. Bind the three existing clients

| Client | Change |
|--------|--------|
| `WorkspaceContext` / `aiCoreClient` | Send surface, route, locale, and journey instance id when the session has one |
| Command Center executive brief | Build the same `AIContext` for the authenticated owner before `generate_executive_analysis` |
| Site-edit copilot | Send `surface=site_editor` on the stream it already uses |

AIHub routes stay authenticated capability endpoints. Relocating them behind a provider gateway is not this work order.

### 4. Tests

- Anonymous turn: context actor is the anonymous session, model path still allowed.
- Authenticated turn: body-supplied user id does not change the actor.
- Foreign `journey_instance_id`: `AI_CONTEXT_FORBIDDEN`, provider client not called.
- Route/JOS mismatch: conflict flag set, journey authority remains JOS.
- Missing `APP_AI_*`: existing unavailable message and `RULE_ASSISTED` brief still return.
- Frontend flag `ASSISTANT_GUIDED_JOURNEY_ENABLED` remains `false`.

## Out of scope

- Replacing or renaming HeroChat / Copilot strings
- Enabling guided journey UI
- Expanding the seven-intent classifier to 16 journeys
- Persisting conversations
- Retrieval, embeddings, citations
- New tools or a capability catalog redesign
- A database queue for human handoff
- PMC workspace UI
- Distributed rate limiting, cost meters, eval harness expansion
- Digital employees, predictive models, dynamic pricing, autonomous partner assignment
- Moving business writes into the model

## Files expected to move

Backend:

- `app/backend/schemas/ai_core.py`
- `app/backend/schemas/ai_contract.py` (version note only if the literal version constant must move)
- `app/backend/services/ai_core.py`
- `app/backend/services/executive_ai.py`
- `app/backend/routers/ai_core.py`
- new context module under `app/backend/services/ai/`
- tests beside the existing AI tests

Frontend:

- `app/frontend/src/features/ai-workspace/aiCoreClient.ts`
- `app/frontend/src/features/ai-workspace/types.ts`
- `app/frontend/src/features/ai-workspace/WorkspaceContext.tsx`
- `app/frontend/src/features/ai-workspace/siteEditCopilot.ts` (hint only)
- Command Center brief client that calls the executive-brief API

## Acceptance

WO-001 is accepted when all of the following are true:

1. Home chat, site-edit chat, and the executive brief each pass through the Context Engine before a provider call.
2. A test proves a client cannot choose another user’s journey or another user’s id.
3. JOS remains the authority when the route and the active journey disagree.
4. Free-chat behavior and the guided-journey flag are unchanged.
5. No new table is required for this work order.
6. The model still cannot write JOS or commercial state except through the existing Tool Gateway.

## Execution note

Implement against the files above. Do not open a redesign of AI Core, and do not pull WO-002 scope into the same change.
