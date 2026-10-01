# Partner platform — global integration practices

EAM partner layer follows common marketplace B2B2C patterns (attribution, scoped API keys, signed webhooks, partner portal RBAC).

## Lifecycle

| Stage | Status | Capabilities |
|-------|--------|--------------|
| CRM / outreach | `prospect` | Registered in Command Center only |
| Pilot | `onboarding` | Deep links + portal/API testing |
| Production | `active` | Live customer traffic |
| Paused | `suspended` | Links rejected |

## Attribution

- Query params: `?partner=SLUG&outlet=CODE`
- Stored on journey context → service request (`partner_org_id`, `partner_outlet_id`, `source_channel`)
- Assignment: `pending_partner` → partner **accept** / **decline**

## Partner portal (humans)

- URL: `/partner` (login required + `partner_memberships` row)
- Accept/decline orders assigned to the org
- Update delivery shipments (carrier + tracking required when marking **dispatched**)

Ops invite: `POST /api/v1/operations/partners/{id}/members` `{ "user_email", "role" }`

Roles: `owner`, `manager`, `agent`

## Integration API (machines)

Base: `/api/v1/partner-integration`

Auth: header `X-API-Key: eam_pk_live_...` or `Authorization: Bearer eam_pk_live_...`

Scopes:

- `orders:read` — list/get orders
- `orders:write` — (reserved; use portal respond or future endpoints)

Example:

```http
GET /api/v1/partner-integration/orders?assignment_status=pending_partner
X-API-Key: eam_pk_live_...
```

Keys are shown **once** on creation (Command Center → partner → API keys).

## Webhooks (event-driven)

Subscribe via ops: `POST /api/v1/operations/partners/{id}/webhooks`

Events:

- `service_request.created`
- `service_request.partner_accepted`
- `service_request.partner_declined`
- `delivery.status_changed`

Verification (HMAC-SHA256):

```
signature = HMAC-SHA256(secret, f"{timestamp}." + raw_body)
```

Headers: `X-EAM-Signature`, `X-EAM-Timestamp`, `X-EAM-Event`

Deliveries logged in `partner_webhook_deliveries`. Failed HTTP deliveries retry up to **3** attempts with backoff (0.4s, 1s, 2s). Ops: `GET /api/v1/operations/partners/{id}/webhook-deliveries`. Dead-letter replay UI: future enhancement.

## Operations filters

`GET /api/v1/operations/service-requests?partner_org_id=&partner_assignment_status=`

## Migrations

```bash
cd app/backend && alembic upgrade head
```

Head revision: `d1e2f3a4b5c7`

## Procurement orders

Partner accept/decline updates `procurement_orders.status` for building-materials SRs. Ops: `GET /api/v1/operations/procurement-orders`.

## Delivery logistics

- Partner: `GET/POST /api/v1/partner/delivery-shipments` (status transitions)
- Integration: `GET /api/v1/partner-integration/shipments`
- Ops: `GET /api/v1/operations/logistics/shipments` (filters: `partner_org_id`, `service_request_id`, `status`)
- UI: partner portal shipment form; ops list at `/operations/service-requests` (fulfillment panel + SR detail timeline)

See `docs/engineering/LOGISTICS_LAYER.md`.

## Roadmap (not in this release)

- Webhook retries + dead-letter queue
- Partner catalog / SKU sync
- OAuth 2.0 client credentials (in addition to API keys)
- Self-service partner signup with KYC

See also: [PARTNER_OUTREACH.md](./PARTNER_OUTREACH.md)
