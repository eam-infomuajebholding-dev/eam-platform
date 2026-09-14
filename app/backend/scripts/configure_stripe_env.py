"""Write Stripe keys into app/.env (never prints secret values)."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
ENV_FILE = BACKEND.parent / ".env"

STRIPE_LINES = {
    "STRIPE_SECRET_KEY": r"^#?\s*STRIPE_SECRET_KEY=.*$",
    "STRIPE_WEBHOOK_SECRET": r"^#?\s*STRIPE_WEBHOOK_SECRET=.*$",
}


def _validate(name: str, value: str) -> None:
    if name == "STRIPE_SECRET_KEY" and not value.startswith(("sk_test_", "sk_live_", "rk_test_", "rk_live_")):
        raise SystemExit(f"{name} must start with sk_test_, sk_live_, rk_test_, or rk_live_")
    if name == "STRIPE_WEBHOOK_SECRET" and not value.startswith("whsec_"):
        raise SystemExit(f"{name} must start with whsec_")


def _upsert_env(content: str, name: str, value: str) -> str:
    line = f"{name}={value}"
    pattern = STRIPE_LINES[name]
    if re.search(pattern, content, flags=re.MULTILINE):
        return re.sub(pattern, line, content, count=1, flags=re.MULTILINE)
    stripe_block = content.find("# Stripe")
    if stripe_block >= 0:
        insert_at = content.find("\n", stripe_block)
        return content[: insert_at + 1] + line + "\n" + content[insert_at + 1 :]
    return content.rstrip() + "\n\n" + line + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Configure Stripe keys in app/.env")
    parser.add_argument("--secret-key", required=True, help="sk_test_... from Stripe Dashboard")
    parser.add_argument("--webhook-secret", required=True, help="whsec_... from stripe listen")
    args = parser.parse_args()

    secret = args.secret_key.strip()
    webhook = args.webhook_secret.strip()
    _validate("STRIPE_SECRET_KEY", secret)
    _validate("STRIPE_WEBHOOK_SECRET", webhook)

    if not ENV_FILE.exists():
        raise SystemExit(f"Missing env file: {ENV_FILE}")

    text = ENV_FILE.read_text(encoding="utf-8")
    text = _upsert_env(text, "STRIPE_SECRET_KEY", secret)
    text = _upsert_env(text, "STRIPE_WEBHOOK_SECRET", webhook)
    ENV_FILE.write_text(text, encoding="utf-8")

    print("STRIPE_ENV_CONFIGURED")
    print(f"  file: {ENV_FILE}")
    print("  STRIPE_SECRET_KEY: set")
    print("  STRIPE_WEBHOOK_SECRET: set")
    print("\nRun: python scripts/verify_stripe_env.py")


if __name__ == "__main__":
    main()
