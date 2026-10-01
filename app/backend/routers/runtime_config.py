"""Runtime frontend configuration — local/test adapter for /api/config."""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from core.public_api_base import resolve_public_api_base_url

router = APIRouter(tags=["runtime-config"])


def _build_frontend_config(headers) -> dict[str, str]:
    return {"API_BASE_URL": resolve_public_api_base_url(headers)}


@router.get("/api/config")
def get_runtime_config(request: Request):
    """Return sanitized frontend runtime config (matches Lambda contract shape)."""
    return JSONResponse(
        content=_build_frontend_config(request.headers),
        headers={
            "Cache-Control": "public, max-age=300",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
        },
    )
