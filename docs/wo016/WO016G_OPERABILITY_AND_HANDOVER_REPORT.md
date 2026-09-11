# WO-016G — Operability + Release + Handover + Production Readiness

**Date:** 2026-09-11

## G01–G02 — Developer Onboarding + Windows

Created: `docs/engineering/DEVELOPER_ONBOARDING.md`, `WINDOWS_RUNBOOK.md`

## G03–G07 — Runbooks

Backend: health-first reuse policy documented.  
Failure modes: port conflict, migration mismatch, OIDC unavailable, AI provider degraded — see WINDOWS_RUNBOOK.

## G08 — Health

`/health` proves process up. Does NOT prove migrations, OIDC, or AI provider.

## G10 — CI

- CI_CONFIGURATION: DONE_VERIFIED
- CI_RUNTIME: UNVERIFIED

## G11–G13 — Release

`docs/engineering/RELEASE_GUIDE.md` created. Rollback: code rollback supported; DB downgrade not guaranteed.

## G14–G15 — Backup/Restore

**UNKNOWN / NOT_CONFIGURED** — no fake RPO/RTO.

## G19 — Handover

Engineering memory now in:
- `docs/engineering/*`
- `docs/wo016/*`
- `docs/wo017/`, `docs/wo018/`
- Registers in `docs/wo015/`, `docs/roadmap/`

## G21–G26 — Engineer Guides

All created under `docs/engineering/`.

## G30 — M1

**PARTIAL** — credential-free paths verified; OIDC acceptance pending.

## G33 — Homepage

No redesign. E2E geometry tests protect structure. USER_VISUAL_ACCEPTANCE=AWAITING_USER.

## Production Readiness

| Layer | Status |
|-------|--------|
| PRODUCT_ACCEPTANCE | PASS |
| ENGINEERING_ACCEPTANCE | PASS (212/212, 78/78 prior full run) |
| PRODUCTION_READINESS | PARTIAL |
| VISUAL_ACCEPTANCE | AWAITING_USER |
