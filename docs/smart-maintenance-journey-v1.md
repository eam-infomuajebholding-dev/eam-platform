# Journey #13 — Smart Maintenance V1

**Slug:** `smart-maintenance`  
**Route:** `/journeys/smart-maintenance`  
**First Value:** SMART MAINTENANCE READINESS BRIEF (PRELIMINARY, RULE_ASSISTED)

## Purpose

Help customers assess readiness for professional maintenance response and planning. Not a certified maintenance report, guaranteed repair timeline, spare-part availability, or operational SLA.

## Workflow (JOS)

`maintenance_category` → `asset_location` → `issue_description` → `severity_level` → `access_readiness` → `system_context` → `prior_service_context` → `engagement_goal` → `timeline_context` → `summary_review` → `readiness_brief` → `scope_confirm` → `submit_confirm` → `intake_complete`

## Backend authority

- Validators: `services/smart_maintenance_validators.py`
- Brief assembly: `assemble_maintenance_readiness_brief()`
- Intake draft: `assemble_smart_maintenance_intake_draft()`
- SR type: `smart_maintenance_intake`, reference prefix `SM`

## Entry points

- Sector page `/sectors/smart-maintenance`
- Maintenance services page CTA
- HeroChat intent (Arabic/mixed) → `START_JOURNEY` via Tool Gateway
- Direct journey route

## Professional review

Submitted SR enters existing Professional Review queue with `journey_type = smart_maintenance`. Operations UI shows Maintenance Readiness Brief via `IntakeSnapshotSummary`.

## Document BO

V1 does not require durable document upload lifecycle. `DOCUMENT_BO = NOT_YET_JUSTIFIED`.

## Limitations

- No guaranteed response time or technician availability
- No certified engineering deliverable from AI
- No marketplace/supplier matching in V1
