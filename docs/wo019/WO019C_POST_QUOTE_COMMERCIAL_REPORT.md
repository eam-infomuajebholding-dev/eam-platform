# WO-019C — Post-Quote Commercial Lifecycle

**Date:** 2026-09-11

## Quote V1 contract (C001) — verified capabilities

| Capability | Status |
|------------|--------|
| Creation from qualified SR | ✅ Implemented |
| Line items (human-entered) | ✅ |
| Versioning | ❌ Single revision only (M1) |
| Status workflow | ✅ `draft → pending_approval → approved → issued` |
| Approval | ✅ OWNER_DELEGATE (`get_owner_user`) |
| Customer visibility | ✅ Issued quotes only (`GET /api/v1/service-requests/{id}/quote`) |
| Customer acceptance | ❌ **BUSINESS_DECISION_REQUIRED** |
| Expiry | ✅ 30-day validity from issue (server-set) |
| Audit | ✅ Timestamps + actor fields on model |
| Authorization | ✅ Admin ops routes; customer issued-only; IDOR tests in `test_quotes.py` |

## Immutability (C002)

Issued quotes are read-only via customer endpoint. Revisions after issue require new Quote BO version — **not implemented in M1**.

## Authorization tested (C003)

- Authorized operator: full ops lifecycle
- Customer owner: issued quote read
- Other customer: 404/403
- Direct ID manipulation: rejected

## Quote → Acceptance (C004)

**BUSINESS_DECISION_REQUIRED.** M1 explicitly excludes customer accept/reject. No `quote_accepted` event emitted.

## Commercial decision register (C005)

| Decision | Status |
|----------|--------|
| Who may issue | OWNER after approval — decided (Business Lab M1) |
| Who may approve | OWNER_DELEGATE — decided |
| Who may accept | **UNDECIDED** |
| Revision after issue | **UNDECIDED** |
| Expiry | 30 days — decided |
| Withdrawal | Not implemented |
| Discount | Not implemented |
| VAT | 15% exclusive SAR — decided |
| Currency | SAR — decided |
| Binding/non-binding | **UNDECIDED** (issued ≠ accepted) |

## Proposal vs Quote (C006)

Quote contains line-item commercial data. Separate Proposal narrative object — **future**. No duplication.

## Contract trigger (C007–C008)

Contract = `READY_JIT` only after explicit accepted commercial commitment. **Not triggered** — acceptance absent.

## Payment gate (C009)

**BLOCKED_BUSINESS_DECISION** — no payment provider, invoice, or reconciliation policy.

## OperationalProject trigger (C010)

**BLOCKED_UPSTREAM** — no accepted/contracted engagement.

## Commercial events (C011) — implemented only

| Event | Emitted |
|-------|---------|
| quote_created | Implicit (draft create) |
| quote_issued | On issue transition |
| quote_accepted | ❌ |
| contract_created | ❌ |
| operational_project_created | ❌ |

## Views (C012–C014)

- **Customer:** issued quote, status, version (single), next action = await business decision on acceptance
- **Operations:** QuoteProposalPanel on qualified SRs; funnel stage `quote` = LIVE
- **Command Center:** commercial funnel updated; no ghost contract/payment stages marked LIVE

## Transaction safety (C016–C017)

Quote service uses DB session commits per operation. Concurrency tests in `test_quotes.py` cover invalid transitions. Double-issue/accept not applicable until acceptance exists.

## Audit (C018)

Model tracks `created_by_user_id`, `approved_by_user_id`, timestamps. Full audit event stream — partial (no separate audit table for quotes).

## Document generation (C019)

Structured DB is authority. No PDF generation in M1.
