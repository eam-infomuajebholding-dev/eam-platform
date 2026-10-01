# EAM Capability Catalog

Statuses: IMPLEMENTED | PARTIAL | BLOCKED | PLANNED_JIT

| Capability | Status | Evidence |
|------------|--------|----------|
| 13 real journeys (credential-free) | IMPLEMENTED | 13 vertical slices, E2E |
| HeroChat intent routing | IMPLEMENTED | `herochat-intent.spec.ts` |
| Service Request lifecycle | IMPLEMENTED | submitted → qualified |
| Professional Review ops UI | IMPLEMENTED | `/operations/service-requests` |
| Quote BO (draft → issued) | IMPLEMENTED | WO-018 |
| Customer workspace | IMPLEMENTED | `/my-requests`, Customer360 |
| Command Center V1 | IMPLEMENTED | `/command-center` |
| Evidence Drawer V1 | IMPLEMENTED | evidence endpoints |
| Executive AI rule-assisted | IMPLEMENTED | RULE_ASSISTED brief |
| Executive AI live provider | PARTIAL | UNVERIFIED_ENV_DEPENDENT |
| Auth entry UX (login/register, PKCE, token hygiene) | IMPLEMENTED | `/login`, `/register`, `docs/engineering/AUTH_UX.md` |
| OIDC production auth | PARTIAL | UX + config API ready; IdP/env BLOCKED_EXTERNAL for prod |
| Delivery logistics layer | IMPLEMENTED | Shipments, partner + ops APIs, `LOGISTICS_LAYER.md` |
| Quote acceptance + Contract record | IMPLEMENTED | accept API + commercial_contracts |
| Payment (Stripe) | PARTIAL | env-dependent checkout |
| OperationalProject | IMPLEMENTED | on quote acceptance |
| Investment journey | IMPLEMENTED | Preliminary interest (#03) |
| Platform architecture registry (16 sectors) | IMPLEMENTED | `GET /api/v1/platform/architecture` |
| Partner platform B2B | IMPLEMENTED | Portal, API keys, webhooks (3× retry) — `docs/partners/PARTNER_PLATFORM.md` |
| Journeys program (16 LIVE) | IMPLEMENTED | `docs/product/JOURNEYS_STATUS_REPORT.md` |
| Procurement order (building materials + equipment) | IMPLEMENTED | `procurement_orders` + ops API |
| Marketplace | PLANNED_JIT | NOT_YET_REQUIRED |
| Evidence Drawer V2 | PLANNED_JIT | DEFERRED |
| Watchlist / Decision Journal | PLANNED_JIT | DEFERRED |
| RAG / Vector DB | PLANNED_JIT | No use case |
| Digital Employee | PLANNED_JIT | DEFERRED |
