# WO-019F — Enterprise Software Engineering Convergence

**Date:** 2026-09-11

## Domain ownership (F001–F003)

Canonical maps created in `docs/engineering/`:

- `DOMAIN_OWNERSHIP_MAP.md`
- `AUTHORITY_MAP.md`
- `CAPABILITY_CATALOG.md`

Each domain defines OWNS / DEPENDS_ON / EXPOSES / MUST_NOT_OWN.

## Duplication audit (F004–F006)

| Area | Status |
|------|--------|
| Journey registries | Bounded per journey folder — trend improving |
| API clients | Quote client isolated; pattern matches existing ops clients |
| Status enums | Backend authority; frontend mirrors for UX |
| Permission checks | Server-side final authority |

No mass collapse performed. Legitimate domain type differences preserved.

## Frontend boundary (F007)

Axios via existing API layer. Quote uses `quotesClient.ts` following ops pattern.

## Responsibility (F008–F010)

Pages compose. Quote business rules in `services/quotes.py`. No mega-hook services added.

## Backend services (F011)

`QuoteService` single authority for commercial quote lifecycle. No god-service expansion.

## DB invariants (F020)

Quote FK uniqueness on `service_request_id`. Status transition guards in service layer + tests.

## Transactions (F021)

Quote operations commit per service method. Multi-write transitions atomic within session.

## Authorization matrix (F031–F034)

Tested: ANONYMOUS, CUSTOMER_OWNER, OTHER_CUSTOMER, PROFESSIONAL_ADMIN, OWNER paths for quotes.

## File placement (F038)

| Journey | Region |
|---------|--------|
| building_materials | `features/journeys/building-materials/` |
| equipment | `features/journeys/equipment/` |
| quote | `features/operations/`, `models/quotes.py` |

## Journey scale test (F042)

WO-017 journeys follow WO-016 Marketing pattern — predictable file regions, bounded central edits (JOS seed, intent router, App routes).

## Test pyramid (F046–F048)

212 backend unit/integration. 78 Playwright E2E (prior run). Focused journey + quote tests added.

## Registers (F051–F053)

- `EAM_ENGINEERING_CLEANUP_REGISTER.md`
- `ARCHITECTURE_DRIFT_REGISTER.md`
- Cleanup readiness: **APPROACHING_READY** — not READY for destructive cleanup

## Software engineering scorecard (H018 preview)

| Dimension | Score |
|-----------|-------|
| DOMAIN_ORGANIZATION | PARTIAL |
| AUTHORITY_CLARITY | PASS |
| RESPONSIBILITY_CLARITY | PARTIAL |
| DUPLICATION | PARTIAL |
| TESTABILITY | PASS |
| DOCUMENTATION | PARTIAL → improving |
| BUS_FACTOR | PARTIAL |
