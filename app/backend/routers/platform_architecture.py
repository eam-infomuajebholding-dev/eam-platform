from fastapi import APIRouter

from schemas.platform_architecture import PlatformArchitectureResponse
from schemas.platform_readiness import PlatformReadinessResponse
from services.platform_architecture import get_platform_architecture
from services.platform_readiness import get_platform_readiness

router = APIRouter(prefix="/api/v1/platform", tags=["platform"])


@router.get("/architecture", response_model=PlatformArchitectureResponse)
async def platform_architecture():
    return PlatformArchitectureResponse.model_validate(get_platform_architecture())


@router.get("/readiness", response_model=PlatformReadinessResponse)
async def platform_readiness():
    """Go-live checklist — safe to expose (no secret values)."""
    return PlatformReadinessResponse.model_validate(get_platform_readiness())
