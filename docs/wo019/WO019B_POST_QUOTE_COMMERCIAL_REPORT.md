# WO-019B — Post-Quote Commercial Lifecycle

**Date:** 2026-09-11

## Quote V1 truth (01)

| State | Implemented |
|-------|-------------|
| draft | ✅ |
| pending_approval | ✅ |
| approved | ✅ |
| issued | ✅ |
| revised | ❌ (single revision M1) |
| accepted | ❌ |
| rejected | ❌ |
| expired | ⚠️ `valid_until` set on issue; no auto-expire job |
| withdrawn | ❌ |

## Authority (02)

Single authority: `services/quotes.py`. Frontend `quotesClient.ts` + panels are read/write UI only.

## Versioning (03)

Issued quotes immutable via customer API. Content changes require new Quote BO revision — **not implemented**.

## Authorization (04) — tested

| Actor | Result |
|-------|--------|
| Professional/admin ops | Full lifecycle |
| Customer owner | Issued quote read only |
| Other customer | 403/404 |
| Anonymous | 401 |
| Direct ID tampering | Rejected |

## Acceptance readiness (05–07)

**BLOCKED_BUSINESS_DECISION** — Business Lab M1 decided issue/approve/VAT/currency/expiry but **not**:

- who can accept
- binding vs non-binding semantics
- revision after acceptance
- withdrawal policy

No default acceptance implemented.

## Customer experience (08)

Shows: issued quote, reference, status, line items, totals, validity date.  
Missing: acceptance action, revision history.

## Operations experience (09)

Professional Review: `QuoteProposalPanel` on qualified SRs. Status history partial (model timestamps only).

## Audit (10)

Model fields: `created_by_user_id`, `approved_by_user_id`, `created_at`, `updated_at`, `issued_at`. No separate audit event table.

## Transaction / concurrency (11–12)

Service-layer commits per transition. Invalid transitions tested. Double-issue/accept N/A until acceptance exists.

## Contract (13–14)

**NOT READY_JIT** — no accepted quote. Contract remains BLOCKED_UPSTREAM.

## Payment (15)

**BLOCKED_BUSINESS_DECISION** — no provider/invoice/refund policy.

## OperationalProject (16–17)

**BLOCKED_UPSTREAM** — no accepted/contracted engagement.

## Customer360 (18)

Read-model aggregation only — no authoritative Customer360 table.

## Command Center funnel (19)

Stages LIVE: SR, qualification, quote. NOT_YET_OPERATIONAL: contract, payment. No phantom stages.

## Commercial events (20)

Implemented: quote create/issue transitions (implicit). Not emitted: `quote_accepted`, `contract_created`, `project_created`.
