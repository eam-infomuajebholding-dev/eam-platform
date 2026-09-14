"""Stripe go-live readiness check — never prints secret values."""

from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from core.config import PROJECT_ENV_FILE, load_project_env  # noqa: E402
from services.payment_config import get_payment_config, stripe_mode  # noqa: E402

load_project_env()

STRIPE_VARS = [
    ("STRIPE_SECRET_KEY", True),
    ("STRIPE_WEBHOOK_SECRET", True),
    ("FRONTEND_URL", True),
    ("STRIPE_SUCCESS_URL", False),
    ("STRIPE_CANCEL_URL", False),
    ("STRIPE_INVOICE_FOOTER", False),
]


def _status(name: str, required: bool) -> str:
    raw = os.environ.get(name, "").strip()
    if not raw or raw.startswith("sk_test_...") or raw.startswith("whsec_..."):
        return "MISSING" if required else "OPTIONAL_MISSING"
    if name == "STRIPE_SECRET_KEY" and not raw.startswith(("sk_test_", "sk_live_", "rk_test_", "rk_live_")):
        return "INVALID_FORMAT"
    if name == "STRIPE_WEBHOOK_SECRET" and not raw.startswith("whsec_"):
        return "INVALID_FORMAT"
    return "OK"


def _warn(name: str, message: str, warnings: list[str]) -> None:
    warnings.append(f"{name}: {message}")
    print(f"  WARN {name}: {message}")


def main() -> None:
    print("STRIPE_READINESS")
    print("ENV_FILE:", PROJECT_ENV_FILE if PROJECT_ENV_FILE.exists() else "MISSING")
    ok = True
    warnings: list[str] = []

    for name, required in STRIPE_VARS:
        status = _status(name, required)
        if status != "OK" and required:
            ok = False
        print(f"  {name}: {status}")

    config = get_payment_config()
    print(f"  STRIPE_MODE: {config['mode']}")
    print(f"  CHECKOUT_READY: {'yes' if config['checkout_ready'] else 'no'}")

    success_url = os.environ.get("STRIPE_SUCCESS_URL", "").strip()
    if success_url and "{CHECKOUT_SESSION_ID}" not in success_url:
        _warn("STRIPE_SUCCESS_URL", "should include {CHECKOUT_SESSION_ID} placeholder", warnings)

    cancel_url = os.environ.get("STRIPE_CANCEL_URL", "").strip()
    if cancel_url and "request_id=" not in cancel_url:
        _warn("STRIPE_CANCEL_URL", "should include request_id= for cancel page deep-link", warnings)

    mode = stripe_mode()
    app_env = os.environ.get("APP_ENV", os.environ.get("ENVIRONMENT", "development")).lower()
    if mode == "live" and app_env in {"development", "dev", "local", "test"}:
        _warn("STRIPE_SECRET_KEY", "live key detected in non-production environment", warnings)

    if config["payments_enabled"] and not config["webhook_configured"]:
        _warn("STRIPE_WEBHOOK_SECRET", "secret key set but webhook missing — unreliable completion", warnings)

    print("READY:", "yes" if ok else "no")
    if warnings:
        print("WARNINGS:", len(warnings))

    if not ok:
        print("\nNext steps:")
        print("  1. Dashboard > Developers > API keys > copy sk_test_... into STRIPE_SECRET_KEY")
        print("  2. Run: .\\scripts\\stripe_listen.ps1")
        print("     Copy whsec_... into STRIPE_WEBHOOK_SECRET in app/.env")
        print("  3. python scripts/stripe_payment_smoke.py")
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
