# EAM Commercial Architecture (WO-008)

## Canonical lifecycle

DISCOVER → UNDERSTAND → QUALIFY → FIRST_VALUE → SERVICE_REQUEST → PROFESSIONAL_REVIEW → PROPOSAL → ACCEPTANCE → CONTRACT → PAYMENT → OPERATIONAL_PROJECT → EXECUTION → DELIVERY → AFTER_SALES

## Implemented in WO-008

| Stage | Status |
|-------|--------|
| SERVICE_REQUEST (submitted) | **V1** — created from completed BV/EC journeys |
| PROFESSIONAL_REVIEW | **V1** — admin operations API + UI |
| SR lifecycle states | submitted, under_review, awaiting_information, qualified |
| Transition authority | `ServiceRequestService.transition_status()` |
| Transition history | `ServiceRequestStatusTransition` |
| Customer workspace continuity | status labels, activity timeline, RFI response |
| Customer360 read model | `GET /api/v1/customer/workspace` |
| Tool Gateway runtime | `POST /api/v1/ai/tools/execute` |
| Structured AI action consumer | HeroChat START_JOURNEY via Tool Gateway |

## Blocked / deferred

| Stage | Status | Reason |
|-------|--------|--------|
| PROPOSAL / Quote | **BLOCKED_BUSINESS_DECISION** | pricing authority, VAT, approval rules not approved |
| CONTRACT | **DEFERRED_BY_DESIGN** | no accepted proposal + legal templates |
| PAYMENT | **NOT STARTED** | out of WO scope |
| OPERATIONAL_PROJECT | **DOCUMENTED TRIGGER ONLY** | requires accepted proposal or signed contract |

## Quote readiness audit

| Truth | Classification |
|-------|----------------|
| Qualified SR | AVAILABLE |
| Customer identity | AVAILABLE |
| Scope (frozen intake snapshot) | AVAILABLE |
| Professional reviewer (transition actor) | AVAILABLE |
| Pricing source / authority | MISSING_BUSINESS_DECISION |
| Currency policy | MISSING_BUSINESS_DECISION |
| VAT treatment | MISSING_LEGAL_DECISION |
| Proposal validity rules | MISSING_BUSINESS_DECISION |
| Commercial approver | MISSING_BUSINESS_DECISION |
| Terms source | MISSING_LEGAL_DECISION |

**Decision:** `QUOTE = BLOCKED_BUSINESS_DECISION`

## Operational project trigger (future)

Service Request completion or journey completion **does not** create OperationalProject.

Candidate trigger: **accepted proposal** or **signed contract** with approved internal commercial gate.

## Third journey recommendation

**#09 Contracting** — Contracting Readiness Brief; reuses shared journey shell, SR lifecycle, professional review, and document patterns from BV/EC.

## Invariants

- AI does not own commercial state
- UI does not own business state
- Single SR transition authority
- Frozen intake snapshot is immutable
