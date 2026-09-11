"""Owner Command Center API — admin-scoped executive read model."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from schemas.operations_dashboard import (
    CommandCenterOverviewResponse,
    CommandSearchResponse,
    EvidenceResponse,
    ExecutiveBriefResponse,
)
from services.command_center_search import search_command_center
from services.executive_ai import ExecutiveAIService
from services.operations_dashboard import OperationsDashboardService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/operations/command-center", tags=["operations"])


@router.get("/overview", response_model=CommandCenterOverviewResponse)
async def get_command_center_overview(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_admin_user),
) -> CommandCenterOverviewResponse:
    """Aggregate platform metrics for Owner Command Center (read model only)."""
    logger.info("Command center overview requested by admin user hash prefix")
    service = OperationsDashboardService(db)
    return await service.get_overview()


@router.get("/executive-brief", response_model=ExecutiveBriefResponse)
async def get_executive_brief(
    question: str | None = Query(default=None, max_length=500),
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_admin_user),
) -> ExecutiveBriefResponse:
    """Executive brief: rule-assisted baseline augmented via AI Core when available."""
    service = OperationsDashboardService(db)
    overview = await service.get_overview()
    rule_brief = service.build_executive_brief(overview)
    ai_service = ExecutiveAIService()
    return await ai_service.enhance_brief(overview, rule_brief, question)


@router.get("/evidence/{metric_id}", response_model=EvidenceResponse)
async def get_metric_evidence(
    metric_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_admin_user),
) -> EvidenceResponse:
    """Metric lineage lite for Evidence Drawer."""
    service = OperationsDashboardService(db)
    evidence = await service.get_metric_evidence(metric_id)
    if evidence is None:
        raise HTTPException(status_code=404, detail="Metric evidence not found")
    return evidence


@router.get("/search", response_model=CommandSearchResponse)
async def command_center_search(
    q: str = Query(default="", max_length=300),
    current_user: UserResponse = Depends(get_admin_user),
) -> CommandSearchResponse:
    """Deterministic Command Center search/navigation."""
    return search_command_center(q)
