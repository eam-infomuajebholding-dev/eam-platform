# Journey #05 — Real Estate Valuation V1

**Slug:** `real-estate-valuation`  
**Route:** `/journeys/real-estate-valuation`  
**First Value:** VALUATION READINESS BRIEF (PRELIMINARY, RULE_ASSISTED)

## Purpose

Help customers assess readiness for professional real estate valuation. Not a certified valuation report, final price, legal approval, or guaranteed financial outcome.

## Workflow (JOS)

`valuation_purpose` → `asset_type` → `asset_location` → `asset_description` → `ownership_context` → `document_readiness` → `inspection_readiness` → `timeline_context` → `engagement_goal` → `summary_review` → `readiness_brief` → `scope_confirm` → `submit_confirm` → `intake_complete`

## Backend authority

- Validators: `services/valuation_validators.py`
- Brief assembly: `assemble_valuation_readiness_brief()`
- Intake draft: `assemble_valuation_intake_draft()`
- SR type: `real_estate_valuation_intake`, reference prefix `RV`

## Entry points

- Sector page `/sectors/real-estate-valuation`
- HeroChat intent (Arabic/mixed) → `START_JOURNEY` via Tool Gateway
- Direct journey route

## Professional review

Submitted SR enters existing Professional Review queue with `journey_type = real_estate_valuation`. Operations UI shows Valuation Readiness Brief via `IntakeSnapshotSummary`.

## Document BO

V1 captures document **metadata only** (deed/title/plans availability flags). Durable upload remains deferred — `DOCUMENT_BO = NOT_YET_JUSTIFIED`.
