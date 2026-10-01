# Run after you fill OIDC / Stripe / FRONTEND_URL in app\.env
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== Alembic migrate ==="
python -m alembic upgrade head

Write-Host "=== Readiness (core) ==="
python scripts/verify_platform_readiness.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "=== Readiness (full — OIDC + Stripe) ==="
python scripts/verify_platform_readiness.py --full
$full = $LASTEXITCODE

Write-Host "=== Stripe env (if keys present) ==="
python scripts/verify_stripe_env.py 2>$null

Write-Host "=== Quick tests ==="
python -m pytest tests/test_platform_readiness.py tests/test_auth_entrypoints.py tests/test_fulfillment_partner_sync.py -q

if ($full -ne 0) {
    Write-Host "Note: --full failed until OIDC + Stripe checkout are configured (expected before you provide secrets)."
}

Write-Host "Done. Start backend: python -m uvicorn main:app --reload"
