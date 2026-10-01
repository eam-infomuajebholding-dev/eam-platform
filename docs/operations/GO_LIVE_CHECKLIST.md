# Go-live checklist — EAM

**Goal:** When you later paste OIDC / Stripe / production URLs into `app/.env`, the platform should work without code changes.

## 0. Readiness API (anytime)

```http
GET /api/v1/platform/readiness
```

Or locally:

```powershell
cd C:\Projects\eam-platform\app\backend
python scripts\verify_platform_readiness.py
python scripts\verify_platform_readiness.py --full   # after OIDC + Stripe filled
```

## 1. Always required (core)

| Variable | Action |
|----------|--------|
| `DATABASE_URL` | SQLite dev or Postgres prod (`deploy/docker-compose.yml`) |
| `JWT_SECRET_KEY` | Strong random — **not** `change-me` |
| Migrations | `python -m alembic upgrade head` (Docker entrypoint runs this) |

**Works without OIDC:** 13 credential-free journeys + ops (admin JWT) + partner layer.

## 2. When you provide OIDC (IdP)

Add to `app/.env`:

```env
OIDC_ISSUER_URL=https://your-idp/.well-known/openid-configuration
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=
OIDC_SCOPE=openid email profile
FRONTEND_URL=https://your-domain
```

Redirect URI at IdP: `{BACKEND}/api/v1/auth/callback`

Verify:

- `GET /api/v1/auth/config` → `oidc_configured: true`
- `/login` and `/register` on frontend

See `docs/engineering/AUTH_UX.md`, `docs/engineering/OIDC_BLOCKER_STATUS.md`.

## 3. When you provide Stripe (payments)

```env
STRIPE_SECRET_KEY=sk_live_...   # or sk_test_ for staging
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-domain
```

```powershell
python scripts\verify_stripe_env.py
# Stripe CLI: scripts/stripe_listen.ps1
```

Readiness: `payments.checkout_ready: true` on `/api/v1/platform/readiness`.

## 4. Partner B2B (optional day-one)

1. Command Center → Partners → create org → API key / webhook  
2. Deep link: `?partner=SLUG&outlet=CODE`  
3. Ops: `/operations/service-requests` fulfillment panel  

`docs/partners/PARTNER_PLATFORM.md`, `docs/engineering/FULFILLMENT_RUNBOOK.md`.

## 5. Docker production path

```powershell
cd C:\Projects\eam-platform\deploy
copy .env.production.example ..\app\.env
# edit app\.env
docker compose up -d --build
```

Backend runs **migrate then uvicorn** via `deploy/entrypoint.sh`.

## 6. Still business-blocked (not env)

- Quote acceptance → owner pack in `docs/commercial/QUOTE_ACCEPTANCE_OWNER_DECISION_PACK.md`
- Investment journey #03 → excluded until Opportunity BO
- Factories #12, Delivery #16 → upstream BOs

## 7. After env is complete

```powershell
cd app\backend
python -m alembic upgrade head
python scripts\verify_platform_readiness.py --full
python -m pytest -q
cd ..\frontend
pnpm run build
pnpm exec playwright test   # optional
```

CI: push branch and confirm pipeline green.
