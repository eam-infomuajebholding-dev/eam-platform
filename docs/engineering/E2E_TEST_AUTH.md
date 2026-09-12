# EAM E2E Test Authentication

Deterministic admin JWT for Playwright visual and integration tests against a **running** local backend.

## Rule

The token minted in E2E must use the **same** `JWT_SECRET_KEY` as the running uvicorn process.

## Resolution order

1. `E2E_JWT_SECRET_KEY` (explicit test override)
2. `JWT_SECRET_KEY` (process environment)
3. `app/.env` → `JWT_SECRET_KEY`
4. `app/backend/.env` → `JWT_SECRET_KEY`
5. Fallback: `e2e-local-jwt-secret` (only if no file/env — start backend with this secret)

## Minting

```powershell
# From app/backend (uses app/.env by default)
python scripts/mint_admin_jwt.py
```

Playwright helper: `app/frontend/e2e/helpers/testAuth.ts`

Visual specs call `assertBackendAcceptsAdminToken()` before navigation — fails fast with a clear message if secrets diverge.

## Start backend for visual E2E

```powershell
Set-Location C:\Projects\eam-platform\app\backend
# Ensure JWT_SECRET_KEY in app/.env matches what E2E resolves
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## CI

GitHub Actions sets `JWT_SECRET_KEY=ci-test-jwt-secret` for both backend and E2E jobs.

## Security

- Never commit secrets.
- Test minting does not weaken production auth.
- `ProtectedAdminRoute` and `/api/v1/auth/me` remain authoritative.
