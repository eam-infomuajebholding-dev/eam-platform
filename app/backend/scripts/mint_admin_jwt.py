"""Emit a short-lived admin JWT for local E2E/visual evidence (stdout only)."""

from __future__ import annotations

import sys

from core.config import load_project_env

load_project_env()

from core.auth import create_access_token  # noqa: E402

token = create_access_token(
    {"sub": "admin-1", "email": "admin@example.com", "name": "Admin", "role": "admin"},
    expires_minutes=60,
)
sys.stdout.write(token)
