# WO-019E — Enterprise AI Core Hardening

**Date:** 2026-09-11

## Canonical path (E001)

```
UI → AI Core → structured action → actionExecutor → Tool Gateway → Tool Policy → Business Service/JOS
```

**Verified:** No second AI architecture introduced in WO-017/018.

## Bypass audit (E002)

| Pattern | Finding |
|---------|---------|
| Direct frontend provider calls | None found in journey additions |
| Journey-local tool execution | Uses canonical intent router |
| AI direct DB writes | None |
| AI direct JOS context writes | None |

## Prompt registry (E003–E004)

Consequential prompts in `services/ai/` and intent routing. Versioning applied to routing and tool-sensitive paths. Journey-specific prompts added for building_materials, equipment — follow existing pattern.

## Model routing (E005)

Single provider path with rule-assisted fallback. No speculative router framework.

## Structured output (E006)

Intent router validates action types. Malformed actions rejected.

## Eval matrix (E007–E008)

Golden set updated for 13 journeys including building_materials, equipment. Categories covered:

- Intent recognition (13+ journeys)
- Arabic/English phrasing
- start_journey, journey_guidance
- unsupported claim, unknown handling
- professional boundary, prompt injection

## Safety boundaries (E009–E013)

| Domain | Guard |
|--------|-------|
| Professional | No certified engineering/legal conclusions |
| Development | No fabricated zoning/ROI |
| Marketing | No invented lead/ROAS |
| Materials | No fabricated stock/price/certificate |
| Equipment | No fabricated availability/booking/price |

## Tool registry & policy (E014–E017)

Actual tools only. Policy: risk class + authorization + confirmation. Negative tests exist for auth bypass patterns in backend test suite.

## Executive AI (E018–E019)

Output labels: FACT, DERIVED_METRIC, POSSIBLE_DRIVER, RECOMMENDATION, UNKNOWN. Possible driver ≠ proven cause.

## Provider & fallback (E020–E021)

Without live provider config: UNVERIFIED_ENV_DEPENDENT. Rule-assisted fallback operational.

## RAG (E022–E023)

Not introduced — no concrete retrieval use case.

## Observability (E025)

Trace/latency where telemetry exists. Sensitive prompt logging avoided by default.

## AI inventory (E028)

| Item | Count |
|------|-------|
| JOS_SYSTEM | 1 |
| AI_CORE | 1 |
| TOOL_EXECUTION_PATH | 1 |
| Journey intents | 13+ |
| Eval corpus | Updated WO-017 |

## Risk register (E029)

Per capability: risk documented in `docs/wo016/WO016E_AI_GOVERNANCE_AND_EVALS_REPORT.md`. Digital Employee: DEFERRED_JIT.
