# Quote Acceptance — Business Decision Record

**Status:** OPEN — **QUOTE_ACCEPTANCE=BLOCKED_BUSINESS_DECISION**  
**Date:** 2026-09-11 (WO-020)  
**Scope:** Post–Quote V1 (`draft → pending_approval → approved → issued`)  
**Engineering rule:** Do not implement acceptance transitions until Business Lab approves semantics below.

## Implemented baseline (do not rebuild)

Quote V1 is **DONE_VERIFIED** under approved M1 policy in `docs/business-lab-decisions.md`:

| Decision ID | Status |
|-------------|--------|
| QUOTE_PRICING_AUTHORITY | APPROVED_M1 |
| DEFAULT_CURRENCY | APPROVED_M1 (SAR) |
| VAT_POLICY | APPROVED_M1 (15% exclusive) |
| QUOTE_APPROVAL_OWNER | APPROVED_M1 (OWNER_DELEGATE before issue) |
| QUOTE_VALIDITY_POLICY | APPROVED_M1 (30 calendar days from issue) |
| DISCOUNT_AUTHORITY | APPROVED_M1 (OWNER only) |

**Not decided:** customer acceptance, rejection, withdrawal, revision after issue, binding semantics, Contract trigger.

## Required questions — decision matrix

| # | Question | Status | Notes |
|---|----------|--------|-------|
| 1 | Who may issue a Quote? | **DECIDED** | Professional Review workflow; issue after approval (M1) |
| 2 | Is separate approval required before issue? | **DECIDED** | Yes — OWNER_DELEGATE approval (M1) |
| 3 | Who may accept? | **OPEN** | Customer owner only? Delegate? Anonymous blocked? |
| 4 | Is customer acceptance legally/commercially binding? | **OPEN** | Binding vs intent-to-proceed |
| 5 | Is acceptance merely intent to proceed? | **OPEN** | Mutually exclusive with #4 until clarified |
| 6 | Can an issued Quote be revised? | **OPEN** | M1: single revision per SR not implemented |
| 7 | Is revision a new immutable version? | **OPEN** | Version column absent in M1 schema |
| 8 | What happens to old versions? | **OPEN** | Superseded read-only? Archived? |
| 9 | Can an expired Quote be accepted? | **OPEN** | `valid_until` set on issue; no auto-expire job |
| 10 | What is Quote validity enforcement? | **PARTIAL** | 30-day default stored; enforcement OPEN |
| 11 | Can Quote be withdrawn after issue? | **OPEN** | No `withdrawn` status today |
| 12 | Can customer reject explicitly? | **OPEN** | No `rejected` status today |
| 13 | What happens after rejection? | **OPEN** | Re-open SR? New quote only? |
| 14 | Is currency globally fixed or Quote-level? | **DECIDED** | SAR only M1 (global) |
| 15 | VAT representation rules? | **DECIDED** | 15% exclusive display M1 |
| 16 | Discount authority? | **DECIDED** | OWNER only M1 |
| 17 | Can an accepted Quote later be superseded? | **OPEN** | Commercial amendment policy |
| 18 | What exactly triggers Contract BO? | **OPEN** | JIT — needs accepted engagement definition |
| 19 | What exactly triggers OperationalProject? | **OPEN** | JIT — needs execution commitment definition |
| 20 | What event means commercial commitment exists? | **OPEN** | Acceptance? Contract signature? Payment? |

## Engineering impact when approved

Minimum implementation (only after **APPROVED** row added to Business Lab):

1. Backend-owned state machine extension (`accepted`, optionally `rejected`, `withdrawn`, `expired`)
2. Authorization matrix (customer owner, other customer denied, ops read)
3. Preconditions (issued only, valid version, not expired if policy says so)
4. Transaction + concurrency tests (double accept, stale version, parallel transition)
5. Audit fields or event log (actor, timestamp, old/new state, trace_id)
6. Customer UX: next allowed action only
7. Professional Review: commercial status + history

## Explicit non-actions (WO-020)

- No default acceptance semantics invented
- No Contract BO created upstream of acceptance decision
- No Payment infrastructure
- No fake revenue from Quote totals

## Approval workflow

When product owner decides, add rows to `docs/business-lab-decisions.md` mirroring M1 Quote policy format, then reference decision IDs here and set status to **APPROVED**.
