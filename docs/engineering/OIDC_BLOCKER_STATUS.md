# OIDC Production Blocker Status

**Updated:** 2026-09-12 (WO-021)  
**Never print secret values.**

## Verification command

```powershell
Set-Location C:\Projects\eam-platform\app\backend
python scripts/verify_m1_env.py
```

## Latest check (names / presence only)

| Variable | Status |
|----------|--------|
| OIDC_ISSUER_URL | PRESENT |
| OIDC_CLIENT_ID | PRESENT |
| OIDC_CLIENT_SECRET | **ABSENT** |
| OIDC_SCOPE | PRESENT |
| LOCAL_PATCH | PRESENT (dev localhost flow) |

## Classification

```
OIDC=BLOCKED_EXTERNAL
```

**Missing prerequisite:** `OIDC_CLIENT_SECRET` (and production callback URL registration with provider).

## M1 impact

M1 16-point acceptance **cannot close** until real OIDC login flow completes. Credential-free paths remain verified separately.

## Engineering rule

Do not create fake production auth. Do not bypass OIDC for production readiness claims.
