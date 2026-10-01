# Logistics layer (delivery)

Authority: `services/logistics.py`

## Flow

1. Customer sets **delivery location** in building-materials journey (equipment uses **location** as delivery anchor).
2. **ProcurementOrder** created on SR submit.
3. Partner **accepts** → `DeliveryShipment` created (`awaiting_dispatch`), ref `SH-{PO ref}`.
4. Partner / API updates status → snapshot `delivery_logistics` on SR for customer UI.
5. Webhook `delivery.status_changed` to partner subscribers.

## Shipment statuses

`awaiting_dispatch` → `dispatched` → `in_transit` → `out_for_delivery` → `delivered`

Failure: `delivery_failed` · Cancel: `cancelled`

## API

| Audience | Endpoint |
|----------|----------|
| Customer | `delivery_logistics` in SR intake snapshot |
| Partner portal | `GET/POST /api/v1/partner/delivery-shipments` |
| Partner API | `POST /api/v1/partner-integration/shipments/{id}/status` (`orders:write`) |
| Operations | `GET/POST /api/v1/operations/logistics/shipments` (filter: `service_request_id`) |

Ops UI: `/operations/service-requests` — بطاقة PO، timeline الشحنة، انتقالات ops (`force`).

Partner dispatch: `tracking_number` required when partner marks `dispatched`.

Customer activity: `record_delivery_logistics_event` on key status changes.

Migration head: `d1e2f3a4b5c7`
