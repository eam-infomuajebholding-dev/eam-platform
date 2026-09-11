# Journey #07 — Project Management V1

**Slug:** `project-management`  
**Route:** `/journeys/project-management`  
**First Value:** PROJECT MANAGEMENT READINESS BRIEF (PRELIMINARY, RULE_ASSISTED)

## Purpose

Help customers establish an initial management baseline for a project and convert it into a qualified professional request. Not a certified PM plan, approved schedule, or guaranteed completion date.

## Workflow (JOS)

`project_type` → `project_stage` → `project_context` → `scope_clarity` → `timeline_context` → `budget_context` → `challenges_context` → `stakeholder_context` → `engagement_goal` → `summary_review` → `readiness_brief` → `scope_confirm` → `submit_confirm` → `intake_complete`

## Backend authority

- Validators: `services/project_management_validators.py`
- Brief assembly: `assemble_project_management_readiness_brief()`
- SR type: `project_management_intake`, reference prefix `PM`

## Document BO

NOT_YET_JUSTIFIED — metadata only, no durable upload lifecycle required in V1.
