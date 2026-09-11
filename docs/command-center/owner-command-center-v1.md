# Owner Command Center V1 — لوحة القيادة

## Route

- `/command-center`
- Protected by `ProtectedAdminRoute` (V1 maps admin JWT role → OWNER authority)

## Architecture

- **Read model only** — `OperationsDashboardService` aggregates from existing authorities
- `COMMAND_CENTER_BUSINESS_AUTHORITY_COUNT = 0`
- No mock production metrics; truth states for unavailable financial data

## API

- `GET /api/v1/operations/command-center/overview`
- `GET /api/v1/operations/command-center/executive-brief` (RULE_ASSISTED FACT layer)

## Data sources

- `service_requests` — status/journey counts, recent list
- `journey_instances` — active/completed by journey type
- `contact_messages` / `consultations` — lead counts
- Business Lab blockers — attention items (Quote, OIDC, visual approval)

## WO-013 additions

- Strategic scorecard (journeys target 16, commercial blockers)
- Operating pulse (multi-domain truth states)
- What changed (7-day SR comparison)
- Risk center + control assurance
- Commercial funnel stages
- Mobile executive brief (emergency view)

## Not yet

- Executive AI via AI Core (RULE_ASSISTED brief only)
- Evidence drawer drill-down UI
- Global command search
- Owner watchlist persistence
- Quick Suggestions CMS control (DEFERRED)
