# EAM Business Object Trigger Register

JIT policy: do not prebuild BOs without lifecycle/reuse evidence.

| BO | State | Consumers | Trigger reason | Decision |
|----|-------|-----------|----------------|----------|
| Service Request | IMPLEMENTED | All journeys, Workspace, Professional Review | Formal submitted request | Canonical SR authority |
| Document | NO_TRIGGER | Journey intake metadata | No upload lifecycle / reuse yet | Keep in journey + SR snapshot |
| Property | TRIGGER_EMERGING | Real Estate Development | User asset context in RED | **Defer** — JSON snapshot sufficient |
| Land | TRIGGER_EMERGING | Real Estate Development | Same as Property | **Defer** — merge with Property review later |
| Organization | NO_TRIGGER | — | Not required | — |
| Supplier | BLOCKED | Materials, Equipment, Factories | Marketplace upstream | CMS ≠ supplier authority |
| Opportunity | BLOCKED | Investment | Two-sided investment model | — |
| Quote | BLOCKED | Commercial lifecycle | Business Lab decisions open | See `docs/business-lab-decisions.md` |
| Contract | BLOCKED | Post-quote | Upstream | — |
| OperationalProject | BLOCKED | Delivery/Owner, PM execution | Distinct from CMS Project | — |
| Order | NOT_YET_REQUIRED | Marketplace future | — | — |
| Payment | BLOCKED | Commercial | Provider + tax decisions | — |
| Asset | TRIGGER_EMERGING | Smart Maintenance | Facility/asset naming in snapshots | **Defer** — audit semantic duplication first |
| Facility | TRIGGER_EMERGING | Facility Management | Same | **Defer** |
| WorkOrder | NOT_YET_REQUIRED | Maintenance future | — | — |
| Inspection / Snag / Handover / Warranty | NOT_YET_REQUIRED | Delivery journey | OperationalProject absent | — |
| Deliverable | NOT_YET_REQUIRED | PM future | — | — |
| Notification | DEFERRED_JIT | RFI/status | No notification platform policy | — |

**WO-015 action:** Development journey reviewed Property/Land — **TRIGGER_EMERGING**, not TRIGGER_REACHED. No new BO implemented.
