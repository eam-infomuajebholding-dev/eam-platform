# EAM Testing Guide

## Pyramid

1. **Unit/service** — validators, QuoteService, SR transitions (fast)
2. **API integration** — httpx ASGI against `main.app`
3. **E2E** — Playwright for credential-free journeys, homepage, CC auth

## During implementation (WO-016A rule)

Focused tests only. Example:

```powershell
python -m pytest tests/test_real_estate_development_journey.py -q
```

## After convergence

```powershell
python -m pytest -q
npm run lint
npm run build
npx playwright test
```

## Smoke packs

- Health + homepage + one journey + Professional Review auth + CC auth

## Flake policy

No retry masking. Fix root cause.

## Record actual counts

Do not assume 195/212 or 72/78 — run and record.
