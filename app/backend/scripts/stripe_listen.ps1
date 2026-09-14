# Forward Stripe webhooks to local FastAPI (run backend on :8000 first).
# After start, copy the printed "whsec_…" into app/.env as STRIPE_WEBHOOK_SECRET.

$ErrorActionPreference = "Stop"
$forwardUrl = "http://localhost:8000/api/v1/payments/webhook"
$events = @(
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "charge.dispute.created"
) -join ","

Write-Host "Forwarding Stripe events to $forwardUrl"
Write-Host "Events: $events"
Write-Host ""
Write-Host "Copy the webhook signing secret (whsec_...) into app/.env -> STRIPE_WEBHOOK_SECRET"
Write-Host ""

$stripe = Get-Command stripe -ErrorAction SilentlyContinue
if (-not $stripe) {
    Write-Host "Stripe CLI not in PATH — using npx @stripe/cli" -ForegroundColor Yellow
    npx --yes @stripe/cli listen --forward-to $forwardUrl --events $events
} else {
    stripe listen --forward-to $forwardUrl --events $events
}
