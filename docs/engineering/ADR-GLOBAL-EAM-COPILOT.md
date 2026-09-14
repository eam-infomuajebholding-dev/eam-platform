# ADR: Global EAM Copilot — Outcome-First Platform Architecture

**Status:** Accepted  
**Date:** 2026-09-13  
**Scope:** Platform-wide (frontend + AI Core + Tool Gateway + JOS + Business Services)

## Context

EAM unifies 13 sector journeys behind a shared journey core (`useSectorJourneyPage`, `JourneyStepPanelShell`, JOS APIs) and exposes a persistent global assistant (`GlobalAssistantDock`). Prior to this ADR, journey step state and advance logic were duplicated inside `WorkspaceContext` / `HeroChat`, violating single-source-of-truth and increasing maintenance cost.

## Decision

Adopt an **Outcome-first** platform model:

```text
GLOBAL EAM COPILOT
      ↓
Route / User / Journey / Request / Payment Context
      ↓
AI CORE
      ↓
Structured Action Proposal
      ↓
User Confirmation (when required)
      ↓
TOOL GATEWAY
      ↓
JOS / BUSINESS SERVICES
      ↓
Authoritative State
```

### Ownership rules (non-negotiable)

| Layer | Owns | Does not own |
|-------|------|--------------|
| **Global Copilot** | Conversation, intent, action proposals, UI shell | Journey business state, SR, quotes, payments |
| **Journey UI** | Structured input, validation UX, step presentation | Authoritative instance state (reads/writes via JOS) |
| **JOS** | Journey instances, steps, context, resume | Commercial objects |
| **Business Services** | Service requests, quotes, contracts, payments | Chat history |
| **Tool Gateway** | Policy, confirmation gates, audit, orchestration | Domain truth |

### Context split (critical)

```text
Route Context     = Presentation context (where the user is looking)
JOS Context       = Authoritative journey context (what is actually active)
```

When route and JOS disagree, the assistant must surface the conflict explicitly — e.g. user on `/journeys/equipment` but JOS reports active `contracting` journey.

### Golden rule

> Any journey state inside `WorkspaceContext` or any AI/UI context outside JOS is a candidate for removal or conversion to **derived/read-only** context. No big-bang deletion; audit first, migrate incrementally.

## UX model

Not chat-first. Not form-first. **Outcome-first.**

- **Chat** understands, guides, proposes actions.
- **Structured journeys** collect and validate high-fidelity intake.
- **JOS** governs state transitions.
- **Tool Gateway** governs mutations.
- **Human handoff** enters when value or decision risk rises.

### Context modes

| Mode | Use |
|------|-----|
| `GUIDE` | General discovery, sector comparison |
| `NAVIGATOR` | Active journey — resume, next step, revisit |
| `OPERATOR` | Workspace — requests, quotes, account continuity |
| `MINIMAL` | `/payment`, `/auth` — icon-only; no distraction |

### Hybrid journey dock (Phase 2+)

Reuse existing journey runtime — do **not** build a parallel panel system:

```text
Global Assistant
      ↓
Journey Action
      ↓
useSectorJourneyPage / Journey Runtime
      ↓
JourneyStepPanelShell
      ↓
Domain Fields
```

Same step UI whether rendered on `/journeys/...` or inside the dock.

### Human handoff (commercial path)

```text
AI Guidance → Qualified Need → Human Handoff Request
  → Professional Queue → Assigned Specialist → SLA
  → Service Request / Quote
```

Premium variants (priority, paid review, partner specialist) are future monetization surfaces — not a generic “contact us” button.

## Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **0 — Audit** | Inventory duplicate state; map consumers (`GLOBAL_COPILOT_MIGRATION_AUDIT.md`) |
| **1 — Conversation shell** | `WorkspaceContext` = messages, turns, action dispatch, minimal UI state only |
| **2 — AssistantRouteContext** | Unified derived context: route, sectorId, journeyInstanceId, serviceRequestId, locale, authState, quote/payment when present |
| **3 — Journey bridge** | Assistant uses same Journey APIs/hooks as journey pages |
| **4 — Resume / continue** | Proactive “paused at step N” via `journey.read_state` / JOS |
| **5 — Hybrid dock** | Embed `JourneyStepPanelShell` in assistant |
| **6 — Modes + minimal** | GUIDE / NAVIGATOR / OPERATOR / MINIMAL |
| **7 — Handoff + SLA** | Tool Gateway → SR + queue + SLA tracking |
| **8 — Funnel analytics** | intent → start → first value → submit → SR → quote → payment |
| **9 — Proactive nudges** | Only after reliable event data |

## Consequences

### Positive

- Single journey runtime for pages and assistant.
- Aligns with `docs/tool-gateway-architecture.md` and `docs/commercial-architecture.md`.
- Enables Partner Fulfillment without exposing network complexity to the customer.
- Reduces regression risk when adding sectors.

### Negative / cost

- Phase 1–3 require careful migration of `HeroChat` step panel wiring.
- Assistant must handle route/JOS conflict UX.
- Analytics and nudges depend on backend event instrumentation.

## Related documents

- `docs/tool-gateway-architecture.md`
- `docs/commercial-architecture.md`
- `docs/engineering/GLOBAL_COPILOT_MIGRATION_AUDIT.md`
- `docs/engineering/HOW_TO_ADD_A_JOURNEY.md`
- `docs/journey-shared-mechanics.md`

## Invariants

- AI does not own commercial or journey authoritative state.
- UI does not own business state.
- All mutations go through Tool Gateway (or JOS client with same contracts).
- Route context is never authoritative for active journey identity.
