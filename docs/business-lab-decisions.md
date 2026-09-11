# EAM Business Lab — Decision Register

Status as of WO-009. Values are **not** assigned by engineering; business authority required.

| Decision ID | Status | Owner | Decision needed | Impact | Blocking dependencies |
|-------------|--------|-------|-----------------|---------|------------------------|
| QUOTE_PRICING_AUTHORITY | BLOCKED_BUSINESS_DECISION | Business Lab | Who sets list/service prices | Quote BO, Proposal line items | Commercial model approval |
| DEFAULT_CURRENCY | BLOCKED_BUSINESS_DECISION | Business Lab | SAR-only vs multi-currency | Quote, Payment, invoices | Finance policy |
| VAT_POLICY | BLOCKED_BUSINESS_DECISION | Business Lab | VAT rate, inclusive/exclusive display | Quote totals, invoices | Tax/legal guidance |
| QUOTE_APPROVAL_OWNER | BLOCKED_BUSINESS_DECISION | Business Lab | Who approves issued quotes | Quote workflow, audit | RBAC / ops roles |
| QUOTE_VALIDITY_POLICY | BLOCKED_BUSINESS_DECISION | Business Lab | Default validity period | Customer proposal UX | Commercial policy |
| DISCOUNT_AUTHORITY | BLOCKED_BUSINESS_DECISION | Business Lab | Who may discount and limits | Quote immutability rules | Finance + sales policy |

## Quote

**QUOTE = BLOCKED_BUSINESS_DECISION** until pricing authority, currency, VAT, and approval owner are resolved.

Engineering must not invent prices, VAT, or approval rules.

## Contract

**DEFERRED_BY_DESIGN** until accepted Proposal/commercial engagement exists.

## Payment

**BLOCKED_DEPENDENCY / BUSINESS_DECISION** — no payment integration in WO-009.
