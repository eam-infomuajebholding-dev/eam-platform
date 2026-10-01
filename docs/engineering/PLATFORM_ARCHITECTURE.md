# Platform architecture registry

Canonical mapping of **all 16 EAM sectors** to the approved layer model:

**Business Capability → Journey → Workflow (JOS) → Business Services → Business Objects → Experience**

## API

```http
GET /api/v1/platform/architecture
```

Source of truth: `app/backend/services/platform_architecture.py`

Frontend sector registry (`app/frontend/src/data/sectors.ts`) must stay aligned on **slug + count (16)**.

## Journey coverage

| Status | Count | Sectors |
|--------|-------|---------|
| LIVE JOS | 16 | All 16 sectors |

## Procurement order (أمر شراء)

| Item | Detail |
|------|--------|
| Authority | `services/procurement_orders.py` |
| Table | `procurement_orders` |
| Trigger | SR created from `building_materials` journey with `procurement_invoice` in snapshot |
| Reference | `PO-{service_request.reference_code}` |
| Ops API | `GET /api/v1/operations/procurement-orders` |
| Partner sync | PO status follows `partner_assignment_status` on accept/decline |

## Logistics (delivery)

See [LOGISTICS_LAYER.md](./LOGISTICS_LAYER.md).

**Alembic head:** `d1e2f3a4b5c7` (16 journeys + commercial_contracts + operational_projects)

## Command Center

Section **Platform** includes the architecture table (owner read model).

See also: [DOMAIN_OWNERSHIP_MAP.md](./DOMAIN_OWNERSHIP_MAP.md), [CAPABILITY_CATALOG.md](./CAPABILITY_CATALOG.md)
