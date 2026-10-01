"""Print platform readiness; exit 0 if core operational, 1 if blocked.

Usage:
  python scripts/verify_platform_readiness.py           # core (JWT + DB + alembic defs)
  python scripts/verify_platform_readiness.py --full    # also require OIDC + Stripe checkout
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from core.config import load_project_env  # noqa: E402

load_project_env()

from services.platform_readiness import get_platform_readiness  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true", help="Require OIDC + Stripe checkout")
    args = parser.parse_args()
    data = get_platform_readiness()

    print("OVERALL:", data["overall"])
    print("CORE_OPERATIONAL:", data["core_operational"])
    print("ALEMBIC:", data["alembic"])
    print("AUTH:", data["auth"])
    print("PAYMENTS:", data["payments"])

    if data["blockers"]:
        print("\nBLOCKERS:")
        for b in data["blockers"]:
            print(f"  - {b['id']}: {b['detail_ar']}")

    if data["pending_external"]:
        print("\nPENDING_EXTERNAL (fill app/.env when available):")
        for p in data["pending_external"]:
            keys = p.get("env_keys") or ""
            print(f"  - {p['id']}: {keys}")

    if not data["core_operational"]:
        return 1
    if args.full:
        if data["pending_external"]:
            print("\n--full: missing external integrations")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
