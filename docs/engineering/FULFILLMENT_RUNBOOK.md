# Fulfillment runbook (PO + logistics)

**Scope:** `building_materials`, `equipment` — not investment (#03).

## Happy path

1. Customer completes journey → SR `submitted` + `procurement_invoice` in snapshot + **PO** row.
2. If deep link / partner attribution → `partner_assignment_status=pending_partner`.
3. Partner accepts in `/partner` or integration API → PO `partner_accepted` → **DeliveryShipment** `awaiting_dispatch`.
4. Partner marks **dispatched** (carrier + tracking required) → customer `delivery_logistics` snapshot + activity.
5. Ops monitors `/operations/service-requests` (fulfillment panel, filters) and Command Center attention items.

## Ops APIs

- `GET /api/v1/operations/procurement-orders?service_request_id=`
- `GET /api/v1/operations/logistics/shipments?service_request_id=`
- `POST /api/v1/operations/logistics/shipments/{id}/status` (force transitions)

## Migrations

```bash
cd app/backend && alembic upgrade head
```

Head: `c0d1e2f4a5b6`

## Tests

```bash
python -m pytest tests/test_logistics.py tests/test_fulfillment_partner_sync.py tests/test_equipment_journey.py tests/test_operations_fulfillment_api.py -q
```
