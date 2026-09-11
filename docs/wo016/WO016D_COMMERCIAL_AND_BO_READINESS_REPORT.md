# WO-016D — Commercial Architecture + Business Object JIT Readiness

**Date:** 2026-09-11

## D01 — Commercial North Star

Full lifecycle documented in `docs/commercial-architecture.md`.

## D02 — Current Implemented Endpoint

```
DISCOVER → … → SERVICE_REQUEST → PROFESSIONAL_REVIEW → qualified → QUOTE (draft→issued)
```

**STOP before:** ACCEPTANCE, CONTRACT, PAYMENT, OPERATIONAL_PROJECT.

## D03–D04 — Service Request + Qualification

**IMPLEMENTED.** Human Professional Review authority. AI assists routing/narrative only.

## D05 — Quote Business Lab

`docs/business-lab-decisions.md` — all M1 decisions **DECIDED** (2026-09-11):

| Decision | Status |
|----------|--------|
| Pricing authority | Professional Review per SR |
| Currency | SAR |
| VAT | 15% exclusive |
| Approval | OWNER_DELEGATE |
| Validity | 30 days |
| Discounts | OWNER only (M1: not implemented in UI) |

## D06 — Quote Implementation

**QUOTE = DONE_VERIFIED** (WO-018)

Not BLOCKED_BUSINESS_DECISION — packet D06 superseded by repository truth.

## D07 — Proposal vs Quote

M1 uses single **Quote** BO with `reference_code` QT-{SR}. Customer-facing "proposal" = issued quote state.

## D08–D09 — Contract / Payment

**BLOCKED_UPSTREAM** — awaiting acceptance workflow + provider decisions.

## D10 — Operational Project

**BLOCKED** — trigger: accepted proposal or signed contract.

## D11 — CMS Project

Marketing showcase only. Not operational truth.

## D12 — Customer360

Read model: `GET /api/v1/customer/workspace` — IMPLEMENTED.

## D13–D17 — BO JIT States

| BO | State | Notes |
|----|-------|-------|
| Quote | **IMPLEMENTED** | WO-018 |
| Property/Land | TRIGGER_EMERGING | JSON snapshot sufficient |
| Asset/Facility | TRIGGER_EMERGING | SM+FM journeys |
| Document | NO_TRIGGER | Metadata in snapshots |
| Supplier | BLOCKED | Marketplace upstream |
| Opportunity | BLOCKED | Investment upstream |
| Contract | BLOCKED | Upstream acceptance |
| OperationalProject | BLOCKED | Upstream commercial |

## D18 — Register

Maintained: `docs/wo015/EAM_BUSINESS_OBJECT_TRIGGER_REGISTER.md` (update Quote → IMPLEMENTED on commit).

## D19–D21 — Investment / Marketplace / Delivery

**BLOCKED_UPSTREAM** — unchanged.

## Owner Decisions Still Required

- Contract legal templates
- Payment provider selection
- Production invoice legal confirm for VAT
