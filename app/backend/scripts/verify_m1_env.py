"""M1 env verification — reports PRESENT/ABSENT/INVALID only; never prints values."""
from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from core.config import PROJECT_ENV_FILE, load_project_env, settings  # noqa: E402

load_project_env()

REQUIRED = [
    "DATABASE_URL",
    "JWT_SECRET_KEY",
    "JWT_ALGORITHM",
    "JWT_EXPIRE_MINUTES",
    "OIDC_ISSUER_URL",
    "OIDC_CLIENT_ID",
    "OIDC_CLIENT_SECRET",
    "OIDC_SCOPE",
    "LOCAL_PATCH",
]


def classify(name: str) -> tuple[str, str]:
    raw = os.environ.get(name)
    if raw is None or raw.strip() == "":
        # check file-only presence (commented lines excluded by dotenv)
        return "ABSENT", "none"
    if name == "LOCAL_PATCH" and raw.strip().lower() not in ("true", "1", "yes"):
        return "INVALID", "process"
    if name == "JWT_EXPIRE_MINUTES":
        try:
            int(raw.strip())
        except ValueError:
            return "INVALID", "process"
    if name == "DATABASE_URL" and not raw.strip():
        return "INVALID", "process"
    return "PRESENT", "process"


def file_active_keys() -> set[str]:
    if not PROJECT_ENV_FILE.exists():
        return set()
    keys: set[str] = set()
    for line in PROJECT_ENV_FILE.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        keys.add(stripped.split("=", 1)[0].strip())
    return keys


def main() -> None:
    file_keys = file_active_keys()
    print("ENV_FILE:", "EXISTS" if PROJECT_ENV_FILE.exists() else "MISSING")
    print("ENV_FILE_PATH:", PROJECT_ENV_FILE)
    for name in REQUIRED:
        status, _ = classify(name)
        source = "none"
        if status == "PRESENT":
            in_file = name in file_keys
            in_proc = os.environ.get(name) is not None and os.environ.get(name, "").strip() != ""
            if in_file and in_proc:
                source = "file+process"
            elif in_proc:
                source = "process"
            elif in_file:
                source = "file"
        elif name in file_keys:
            source = "file-empty-or-unloaded"
        print(f"{name}: {status} (source={source})")


if __name__ == "__main__":
    main()
