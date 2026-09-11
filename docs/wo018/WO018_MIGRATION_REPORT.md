# WO-018 Migration Report — Quote BO

**Date:** 2026-09-11  
**Alembic head:** `t0u1v2w3x4y5`

## Scope

M1 Quote business object per approved Business Lab policy:

- Professional Review creates draft from **qualified** Service Request only
- Human-entered line items (SAR)
- 15% VAT exclusive (server-computed)
- Workflow: `draft → pending_approval → approved → issued`
- OWNER_DELEGATE approval before issue (`get_owner_user`)
- 30-day validity from issue date
- Customer read-only view for **issued** quotes only

## Database

| Table | Purpose |
|-------|---------|
| `quotes` | Quote header — FK `service_request_id` (unique), totals, status, validity |
| `quote_line_items` | Human-entered line items |

Migration: `alembic/versions/t0u1v2w3x4y5_add_quotes.py`

## API

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/operations/service-requests/{id}/quotes` | admin |
| GET | `/api/v1/operations/service-requests/{id}/quote` | admin |
| POST | `/api/v1/operations/quotes/{id}/line-items` | admin |
| DELETE | `/api/v1/operations/quotes/{id}/line-items/{item_id}` | admin |
| POST | `/api/v1/operations/quotes/{id}/submit` | admin |
| POST | `/api/v1/operations/quotes/{id}/approve` | owner |
| POST | `/api/v1/operations/quotes/{id}/issue` | owner |
| GET | `/api/v1/service-requests/{id}/quote` | customer (issued only) |

## Frontend

- `QuoteProposalPanel` on qualified SR in Professional Review
- `CustomerQuoteView` on customer SR detail when quote issued

## Out of scope (M1)

- Customer accept/reject
- Discounts, PDF, email
- Contract / Payment integration

## Verification

```bash
cd app/backend && python -m pytest tests/test_quotes.py tests/test_operations_quotes.py -q
cd app/frontend && npm run build
```
