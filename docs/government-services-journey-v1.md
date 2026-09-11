# Government Services Journey (#06) — V1

**Journey type:** `government_services`  
**Route:** `/journeys/government-services`  
**SR prefix:** `GS-*`  
**Classification:** CREDENTIAL_FREE_ACCEPTANCE_PASS

## First Value

**PRELIMINARY GOVERNMENT TASK ROADMAP** (`task_roadmap_brief` step)

- Status: `PRELIMINARY`, assistance: `RULE_ASSISTED`
- Roadmap steps tagged: `USER_PROVIDED_FACT`, `GUIDANCE`, `REQUIREMENT_TO_VERIFY`
- Regulatory disclaimer: not a legal conclusion or eligibility guarantee

## Safety Rules

- Never claim definitive eligibility, final permit requirements, or guaranteed approval
- Classify statements: USER_PROVIDED / PLATFORM_CONFIRMED / GUIDANCE / REQUIREMENT_TO_VERIFY
- No fabricated government requirements

## Workflow (10 intake steps)

1. `service_category` → 2. `property_location` → 3. `property_type` → 4. `request_summary` → 5. `documents_status` → 6. `urgency_context` → 7. `summary_review` → 8. `task_roadmap_brief` → 9. `scope_confirm` → 10. `submit_confirm` → `intake_complete`

## Authorities

- State: JOS (`GOVERNMENT_SERVICES_WORKFLOW`)
- Validation: `government_services_validators.py`
- Formal request: Service Request Service (`government_services_intake`)
- AI intent: `classify_government_services_deterministic` in intent router
