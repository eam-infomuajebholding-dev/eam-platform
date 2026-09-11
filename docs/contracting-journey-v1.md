# Journey #09 — Contracting V1

**Slug:** `contracting`  
**Route:** `/journeys/contracting`  
**First Value:** CONTRACTING READINESS BRIEF (PRELIMINARY, RULE_ASSISTED)

## Purpose

Help customers assess readiness and scope for contracting/procurement. Not a final tender, contractor award, certified BOQ, or guaranteed cost/schedule.

## Workflow (JOS)

`project_context` → `project_location` → `design_readiness` → `boq_readiness` → `site_readiness` → `scope_type` → `procurement_goal` → `timeline_context` → `budget_context` → `contractor_requirements` → `documents_context` → `summary_review` → `readiness_brief` → `scope_confirm` → `submit_confirm` → `intake_complete`

## Backend authority

- Validators: `services/contracting_validators.py`
- Brief assembly: `assemble_contracting_readiness_brief()`
- Intake draft: `assemble_contracting_intake_draft()`
- SR type: `contracting_intake`, reference prefix `CT`

## Entry points

- Sector page `/sectors/contracting`
- HeroChat intent (Arabic/mixed) → `START_JOURNEY` via Tool Gateway
- Direct journey route

## Professional review

Submitted SR enters existing Professional Review queue with `journey_type = contracting`. Operations UI shows Contracting Readiness Brief via `IntakeSnapshotSummary`.

## Document BO

V1 captures document **metadata only** (availability flags). Durable upload remains deferred — see Document BO reassessment in WO-009 report.
