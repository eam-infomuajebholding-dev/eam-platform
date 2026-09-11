# AI Tool Gateway Architecture

## Flow

```
AI Core → structured actions[] → Tool Gateway → Tool Policy → Business Service → Result
```

- **Tool Registry** — metadata only (schemas, risk, owner).
- **Tool Policy** — authorization, confirmation gate, input validation.
- **Tool Gateway** — orchestration; calls JOS / ServiceRequest services.
- **Business Services** — authoritative execution.

## Runtime endpoint

`POST /api/v1/ai/tools/execute`

## Initial safe tools

- `journey.start` (confirmation required)
- `journey.resume`
- `journey.read_state`
- `service_request.read_current_user` (auth required)
- `service_request.read_detail` (auth required)

## Forbidden paths

- LLM → SQLAlchemy direct mutation
- Tool Registry → arbitrary JOS context writes
- Authorization from LLM-supplied user_id

## Audit

Structured logs via `record_tool_audit` — no secrets or unnecessary PII.

## Frontend action executor (WO-009)

Single canonical executor: `app/frontend/src/features/ai-workspace/actionExecutor.ts`

- `START_JOURNEY` → Tool Gateway (JOS fallback only if gateway unavailable)
- `REQUEST_HUMAN_HANDOFF` when runtime tool exists
- Safe Arabic messages for denial codes; no raw stack traces
- `trace_id` forwarded from AI Core where supported
