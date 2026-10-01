# EAM Business Object Trigger Register

**Reconciled 2026-10-01** — Contract / OperationalProject implemented on quote acceptance (`d1e2f3a4b5c7`).  
JIT policy: do not prebuild BOs without lifecycle/reuse evidence.

| BO | State | Consumers | Trigger reason | Decision |
|----|-------|-----------|----------------|----------|
| Service Request | IMPLEMENTED | All journeys, Workspace, Professional Review | Formal submitted request | Canonical SR authority |
| Document | NO_TRIGGER | Journey intake metadata | No upload lifecycle / reuse yet | Keep in journey + SR snapshot |
| Property | TRIGGER_EMERGING | Real Estate Development | User asset context in RED | **Defer** — JSON snapshot sufficient |
| Land | TRIGGER_EMERGING | Real Estate Development | Same as Property | **Defer** — merge with Property review later |
| Organization | NO_TRIGGER | — | Not required | — |
| Supplier | BLOCKED | Materials, Equipment, Factories | Marketplace upstream | CMS ≠ supplier authority |
| Opportunity | DEFERRED_JIT | Investment | Preliminary interest only — no Opportunity BO yet | SR snapshot sufficient |
| Quote | IMPLEMENTED | Commercial lifecycle | WO-018 draft→issued; customer accept | `docs/wo018/WO018_MIGRATION_REPORT.md` |
| Contract | IMPLEMENTED | Post-accept | `commercial_contracts` electronic record | Customer `POST …/quote/accept` |
| OperationalProject | IMPLEMENTED | All accepted quotes | `operational_projects` opened on accept | Ops `GET …/commercial-engagement` |
| ProcurementOrder (أمر شراء) | IMPLEMENTED | Building materials SR | Invoice v2 + partner fulfillment | `services/procurement_orders.py` |
| Order (generic marketplace) | NOT_YET_REQUIRED | Marketplace future | — | — |
| Payment | PARTIAL | Commercial | Stripe when env configured | `quote_payments.py` |
| Asset | TRIGGER_EMERGING | Smart Maintenance | Facility/asset naming in snapshots | **Defer** — audit semantic duplication first |
| Facility | TRIGGER_EMERGING | Facility Management | Same | **Defer** |
| WorkOrder | NOT_YET_REQUIRED | Maintenance future | — | — |
| Inspection / Snag / Handover / Warranty | NOT_YET_REQUIRED | Delivery journey | Field ops beyond intake | — |
| Deliverable | NOT_YET_REQUIRED | PM future | — | — |
| Notification | DEFERRED_JIT | RFI/status | No notification platform policy | — |

**WO-015 action:** Development journey reviewed Property/Land — **TRIGGER_EMERGING**, not TRIGGER_REACHED. No new BO implemented.
