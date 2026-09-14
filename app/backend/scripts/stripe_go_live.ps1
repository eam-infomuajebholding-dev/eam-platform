# Stripe go-live helper (test mode) — raises ops readiness ~55% -> ~75%
# Usage:
#   .\scripts\stripe_go_live.ps1 -SecretKey sk_test_... -WebhookSecret whsec_...
# Or run without params for guided steps.

param(
    [string]$SecretKey,
    [string]$WebhookSecret
)

$ErrorActionPreference = "Stop"
$Backend = Split-Path -Parent $PSScriptRoot
Set-Location $Backend

Write-Host "=== EAM Stripe Go-Live (test mode) ===" -ForegroundColor Cyan

if ($SecretKey -and $WebhookSecret) {
    python scripts/configure_stripe_env.py --secret-key $SecretKey --webhook-secret $WebhookSecret
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

python scripts/verify_stripe_env.py
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Provide keys once you have them:" -ForegroundColor Yellow
    Write-Host "  sk_test_...  -> https://dashboard.stripe.com/test/apikeys"
    Write-Host "  whsec_...    -> run .\scripts\stripe_listen.ps1 in another terminal"
    Write-Host ""
    Write-Host "Then re-run:" -ForegroundColor Yellow
    Write-Host "  .\scripts\stripe_go_live.ps1 -SecretKey sk_test_... -WebhookSecret whsec_..."
    exit 1
}

Write-Host ""
Write-Host "Stripe env OK. Next terminals:" -ForegroundColor Green
Write-Host "  T1: uvicorn main:app --reload --port 8000"
Write-Host "  T2: .\scripts\stripe_listen.ps1"
Write-Host "  T3: python scripts/stripe_payment_smoke.py"
Write-Host ""
Write-Host "Browser E2E (frontend):" -ForegroundColor Green
Write-Host '  $env:E2E_STRIPE="1"'
Write-Host '  $env:E2E_STRIPE_CHECKOUT_URL="<checkout_url from smoke>"'
Write-Host "  pnpm e2e:payment:stripe"
