"""Stripe configuration probes — no side effects."""

from __future__ import annotations

from core.config import settings


def is_stripe_configured() -> bool:
    try:
        return bool(settings.stripe_secret_key)
    except AttributeError:
        return False


def is_stripe_webhook_configured() -> bool:
    try:
        return bool(settings.stripe_webhook_secret)
    except AttributeError:
        return False


def stripe_mode() -> str:
    """Return test | live | unset without exposing key material."""
    try:
        key = settings.stripe_secret_key
    except AttributeError:
        return "unset"
    if not key:
        return "unset"
    if key.startswith(("sk_live_", "rk_live_")):
        return "live"
    if key.startswith(("sk_test_", "rk_test_")):
        return "test"
    return "unset"


def is_checkout_ready() -> bool:
    """Reliable completion needs both API key and webhook secret."""
    return is_stripe_configured() and is_stripe_webhook_configured()


def is_frontend_url_configured() -> bool:
    for attr in ("frontend_url", "vite_frontend_url"):
        try:
            if getattr(settings, attr):
                return True
        except AttributeError:
            continue
    return False


def get_payment_config() -> dict:
    return {
        "payments_enabled": is_stripe_configured(),
        "webhook_configured": is_stripe_webhook_configured(),
        "checkout_ready": is_checkout_ready(),
        "mode": stripe_mode(),
        "currency": "SAR",
        "frontend_url_configured": is_frontend_url_configured(),
    }
