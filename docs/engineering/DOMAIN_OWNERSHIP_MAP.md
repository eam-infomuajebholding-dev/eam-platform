# EAM Domain Ownership Map

| Domain | Purpose | Authority module(s) | Forbidden responsibilities |
|--------|---------|---------------------|---------------------------|
| Auth | Identity, JWT, roles | `dependencies/auth.py` | Business state, SR transitions |
| JOS | Journey lifecycle | `services/jos.py` | Commercial pricing, CMS |
| Service Request | Formal submitted requests | `services/service_requests.py` | Journey step validation |
| Quote | Proposal draft → issued | `services/quotes.py` | SR status changes, AI pricing |
| Workspace | Customer journey continuity | `WorkspaceContext.tsx`, JOS client | SR creation authority |
| Professional Review | Ops queue, qualify | `operations_service_requests.py` | Quote approval bypass |
| AI Core | Intent, routing, responses | `ai_core.py`, `intent_router.py` | Direct state mutation |
| Tool Gateway | Governed AI actions | `routers/ai_tools.py` | Permission grants |
| CMS | Editorial/marketing content | CMS API + pages | Operational project truth |
| Command Center | Owner read model | `operations_dashboard.py` | Business writes, metric invention |
| Journeys (UI) | Intake UX per sector | `features/journeys/*` | Transition authority |
| Commercial | Lifecycle documentation | docs + Quote service | Payment/Contract (not started) |
| Shared UI | Layout, components | `components/` | Business rules |

Each domain has a single write authority for its state (see AUTHORITY_MAP.md).
