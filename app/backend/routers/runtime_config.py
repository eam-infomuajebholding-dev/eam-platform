"""Runtime frontend configuration — local/test adapter for /api/config."""

import os

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from core.config import settings

router = APIRouter(tags=["runtime-config"])


def _build_frontend_config() -> dict[str, str]:
    api_base = os.environ.get("VITE_API_BASE_URL") or f"http://127.0.0.1:{settings.port}"
    return {"API_BASE_URL": api_base.rstrip("/")}


@router.get("/api/config")
def get_runtime_config():
    """Return sanitized frontend runtime config (matches Lambda contract shape)."""
    return JSONResponse(
        content=_build_frontend_config(),
        headers={
            "Cache-Control": "public, max-age=300",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
        },
    )
