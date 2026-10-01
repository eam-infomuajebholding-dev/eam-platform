"""Resolve the public API base URL for frontend runtime config."""

from __future__ import annotations

import os
from typing import Mapping

from core.config import settings


def _header(headers: Mapping[str, str], name: str) -> str | None:
    target = name.lower()
    for key, value in headers.items():
        if key.lower() == target:
            text = str(value).strip()
            return text if text else None
    return None


def resolve_public_api_base_url(headers: Mapping[str, str] | None = None) -> str:
    """Prefer explicit env; otherwise same-origin from proxy/custom-domain headers."""
    env_val = os.environ.get("VITE_API_BASE_URL", "").strip()
    if env_val:
        return env_val.rstrip("/")

    if headers:
        host = (
            _header(headers, "mgx-external-domain")
            or _header(headers, "x-forwarded-host")
            or _header(headers, "host")
        )
        scheme = _header(headers, "x-forwarded-proto") or "https"
        if host:
            return f"{scheme}://{host}".rstrip("/")

    display_host = "127.0.0.1" if settings.host == "0.0.0.0" else settings.host
    return f"http://{display_host}:{settings.port}".rstrip("/")
