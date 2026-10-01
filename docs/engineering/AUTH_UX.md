# Authentication UX (login / register)

## Pattern

- **OIDC Authorization Code + PKCE** — backend owns the flow; SPA never stores IdP secrets.
- **Dedicated pages:** `/login`, `/register` with clear copy before redirect.
- **Full-page redirect** to `GET /api/v1/auth/login` or `/register` (no axios on login — expect HTTP 302).
- **App JWT** returned once via frontend `/auth/callback?token=…` then **stripped from the URL**; token in **sessionStorage** (migrated off localStorage).
- **returnTo** via `sessionStorage` + query `?returnTo=` on auth pages.

## Configuration

| Variable | Purpose |
|----------|---------|
| `FRONTEND_URL` | Post-login redirect target (prod: `https://eam.sa`) |
| `OIDC_*` | Issuer, client, secret, scope |
| `OIDC_SIGNUP_EXTRA_PARAMS` | Default `kc_action=register` (Keycloak). Auth0: `screen_hint=signup` |
| `OIDC_PROVIDER_LABEL` | Shown in UI |
| `LOCAL_PATCH` | Dev: API callback host matches Vite (localhost:3000) |

## API

- `GET /api/v1/auth/config` — public capabilities for UI
- `GET /api/v1/auth/login` — start sign-in
- `GET /api/v1/auth/register` — start sign-up at IdP

## Production checklist

1. Register redirect URI: `{API}/api/v1/auth/callback`
2. Set `FRONTEND_URL` and `OIDC_CLIENT_SECRET`
3. Register post-logout URI: `{FRONTEND_URL}/auth/logout-callback`

See also: [OIDC_BLOCKER_STATUS.md](./OIDC_BLOCKER_STATUS.md), [E2E_TEST_AUTH.md](./E2E_TEST_AUTH.md)
