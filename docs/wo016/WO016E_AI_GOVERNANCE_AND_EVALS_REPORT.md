# WO-016E — AI Core Enterprise Governance + Evals + Tool Safety

**Date:** 2026-09-11

## E01 — Single AI Path

```
UI → AI Core → structured output → actionExecutor → Tool Gateway → Tool Policy → Business Service/JOS
```

Verified: one `actionExecutor.ts`; no journey-local executors.

## E02 — Bypass Audit

| Pattern | Finding |
|---------|---------|
| Direct frontend LLM | Not found in production paths |
| Legacy AI Hub bypass | AI Hub transport only; state via AI Core |
| Direct JOS from AI | Blocked — Tool Gateway required |

## E03–E06 — AI Hub, Structured Output, Prompt Registry

- Structured actions: `START_JOURNEY`, `REQUEST_HUMAN_HANDOFF`
- Prompt Registry: `services/ai/prompt_registry.py`
- Versioning: consequential prompts only

## E07–E13 — Tool Registry, Policy, Gateway, Audit

- Registry: `services/ai/tool_registry.py`
- Policy: `services/ai/tool_policy.py` — model never grants permission
- Gateway: `routers/ai_tools.py`
- Tests: `test_tool_policy.py`, `test_ai_prompt_injection.py`

## E14 — Action Executor

Single frontend boundary: `features/ai-workspace/actionExecutor.ts`

## E15–E17 — Eval Suite

| Pack | Location |
|------|----------|
| Intent golden set | `tests/ai_eval/intent_golden_set.py` |
| Journey routing | Per-journey positive + collision in golden set |
| Safety (Development) | Validators forbid ROI/zoning fabrication |
| Prompt injection | `test_ai_prompt_injection.py` |

## E18 — Executive AI Output

Classifications in executive brief schema: facts, recommendations, limitations.

## E25 — Live Provider

`EXECUTIVE_AI_LIVE_PROVIDER_ACCEPTANCE=UNVERIFIED_ENV_DEPENDENT`

## E26 — Fallback

RULE_ASSISTED operational — verified.

## E29 — AI Asset Inventory

| Asset | Path |
|-------|------|
| AI Core | `services/ai_core.py` |
| Intent router | `services/ai/intent_router.py` |
| Tool registry | `services/ai/tool_registry.py` |
| Tool policy | `services/ai/tool_policy.py` |
| Prompt registry | `services/ai/prompt_registry.py` |
| Evals | `tests/ai_eval/` |
| Frontend executor | `actionExecutor.ts` |

## E30 — AI Risk Register (summary)

| Capability | Risk | Mitigation |
|------------|------|------------|
| Journey start via AI | Wrong journey | Intent golden set + confirmation |
| Tool execution | Unauthorized mutation | Tool Policy + Gateway |
| Executive analysis | False causality | RULE_ASSISTED + limitation strings |
| Development brief | Fabricated feasibility | Validator disclaimers |

## E20, E27 — RAG, Digital Employee

**DEFERRED_JIT** — no vector DB, no agent swarm.
