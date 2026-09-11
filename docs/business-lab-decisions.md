# EAM Business Lab — Decision Register

Status as of **2026-09-11** — M1 Quote policy **APPROVED** by product owner.

Engineering must not invent prices beyond these rules; line items remain human-entered per SR.

| Decision ID | Status | Owner | Decision (approved) | Impact |
|-------------|--------|-------|---------------------|--------|
| QUOTE_PRICING_AUTHORITY | **APPROVED_M1** | Business Lab | **Professional Review** sets price per qualified Service Request after qualification. No AI pricing, no CMS list prices in M1. | Quote BO, proposal line items |
| DEFAULT_CURRENCY | **APPROVED_M1** | Business Lab | **SAR only** for M1 and M2. | Quote, Payment, invoices |
| VAT_POLICY | **APPROVED_M1** | Business Lab | **15% VAT, exclusive display** (amount + VAT shown separately). Legal confirmation recommended before production invoices. | Quote totals, invoices |
| QUOTE_APPROVAL_OWNER | **APPROVED_M1** | Business Lab | **OWNER_DELEGATE** must approve before customer-facing proposal is issued. | Quote workflow, audit |
| QUOTE_VALIDITY_POLICY | **APPROVED_M1** | Business Lab | **30 calendar days** default validity from issue date. | Customer proposal UX |
| DISCOUNT_AUTHORITY | **APPROVED_M1** | Business Lab | **OWNER only** in M1. No discounts without explicit owner action. | Quote immutability rules |

## Quote

**QUOTE = DONE_VERIFIED** (WO-018 implemented 2026-09-11).

Quote BO and proposal draft lifecycle implemented under these constraints. Engineering must not fabricate prices, VAT rates, or approval bypass.

## Contract

**DEFERRED_BY_DESIGN** until accepted Proposal/commercial engagement exists.

## Payment

**BLOCKED_DEPENDENCY** — no payment provider integration until Contract stage and finance provider selection.

## Approval record

| Field | Value |
|-------|-------|
| Approved by | Product owner |
| Approval date | 2026-09-11 |
| Scope | M1 minimum viable commercial policy |
| Unblocks | WO-018 Quote BO implementation |
