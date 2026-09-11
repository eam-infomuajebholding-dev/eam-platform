# AI Engineering Guide

## Canonical path

UI → AI Core → structured actions → `actionExecutor` → Tool Gateway → Tool Policy → business service

## Adding a journey intent

1. `services/ai/intent_router.py` — deterministic + hint patterns
2. `services/ai_core_intents.py` — canonical journey_type mapping
3. `schemas/ai_intent.py` — allowed types
4. `tests/ai_eval/intent_golden_set.py` — positive + collision cases
5. Frontend: HeroChat already consumes Tool Gateway actions

## Adding a tool

1. Register in `services/ai/tool_registry.py`
2. Policy in `services/ai/tool_policy.py`
3. Execute via `routers/ai_tools.py`
4. Tests: authorization, injection, confirmation

## Prompts

Production prompts → `services/ai/prompt_registry.py`

## Boundaries

- LLM `user_id` is **never** authorization authority
- AI does not own journey or SR state
- No certified professional conclusions in AI output

## Evals

Run: `python -m pytest tests/ai_eval/ tests/test_tool_policy.py tests/test_ai_prompt_injection.py`

## Fallback

When provider unavailable: RULE_ASSISTED paths remain functional.
