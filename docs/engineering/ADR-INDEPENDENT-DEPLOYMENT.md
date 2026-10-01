# ADR: Independent Deployment (Decouple from ATOMS)

## Status

Accepted — 2026-09-14

## Context

EAM Platform was scaffolded on ATOMS/MGX. That stack controlled publishing (`*.pub.atoms.world`), build credits, and injected runtime plugins (`atoms()`, `@metagptx/web-sdk`). The backend already exposes first-class REST APIs; the frontend web-sdk was mostly a proxy.

## Decision

1. **Remove ATOMS frontend runtime dependencies**
   - Replace `@metagptx/web-sdk` with a native axios client in `app/frontend/src/lib/api.ts`.
   - Remove `@metagptx/vite-plugin-source-locator` and `atoms()` from Vite config.

2. **Deploy independently**
   - Use `deploy/docker-compose.yml`: nginx serves `dist/` and proxies `/api` to FastAPI.
   - Configure OIDC, Stripe, OSS, and PostgreSQL via `app/.env` (see `app/.env.example`).

3. **Keep backward-compatible auth headers**
   - Backend still accepts `mgx-external-domain` but standalone deploy relies on `X-Forwarded-Host` / `Host`.

## Consequences

- Builds and releases no longer depend on ATOMS credits or Publish.
- DNS for `eam.sa` can point to your VPS/load balancer instead of `*.pub.atoms.world`.
- OIDC issuer can remain `auth.atoms.dev` temporarily or migrate to any OIDC provider.
- CMS media URLs on `mgx-backend-cdn.metadl.com` remain valid until assets are migrated to your bucket/CDN.

## Migration checklist

- [x] Native API client (no web-sdk)
- [x] Vite build without ATOMS plugins
- [x] Docker compose for standalone run (+ PostgreSQL volume)
- [x] Oracle deploy guide: `deploy/ORACLE-DEPLOY.md`
- [ ] Point production DNS to independent host
- [ ] Provision PostgreSQL + OSS + Stripe webhook on production domain
- [ ] Optional: migrate OIDC off `auth.atoms.dev`
- [ ] Optional: remove `.mgx/`, `.atoms/` platform metadata
