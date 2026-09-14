"""Owner Command Center API — admin-scoped executive read model."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import (
    get_command_center_owner,
    get_command_center_user,
    require_command_center_permission,
)
from schemas.auth import UserResponse
from schemas.operations_dashboard import (
    CommandCenterOverviewResponse,
    CommandSearchResponse,
    EvidenceResponse,
    ExecutiveBriefResponse,
)
from schemas.command_center_delegation import (
    CommandCenterDelegationCreate,
    CommandCenterDelegationResponse,
)
from services.command_center_delegations import grant_delegation, list_delegations, revoke_delegation
from services.command_center_search import search_command_center
from services.executive_ai import ExecutiveAIService
from services.operations_dashboard import OperationsDashboardService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/operations/command-center", tags=["operations"])


@router.get("/overview", response_model=CommandCenterOverviewResponse)
async def get_command_center_overview(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_command_center_user),
    _: object = Depends(require_command_center_permission("read")),
) -> CommandCenterOverviewResponse:
    """Aggregate platform metrics for Owner Command Center (read model only)."""
    logger.info("Command center overview requested by admin user hash prefix")
    service = OperationsDashboardService(db)
    return await service.get_overview()


@router.get("/executive-brief", response_model=ExecutiveBriefResponse)
async def get_executive_brief(
    question: str | None = Query(default=None, max_length=500),
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_command_center_user),
    _: object = Depends(require_command_center_permission("executive_brief")),
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
    current_user: UserResponse = Depends(get_command_center_user),
    _: object = Depends(require_command_center_permission("evidence")),
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
    current_user: UserResponse = Depends(get_command_center_user),
    _: object = Depends(require_command_center_permission("search")),
) -> CommandSearchResponse:
    """Deterministic Command Center search/navigation."""
    return search_command_center(q)


@router.get("/delegations", response_model=list[CommandCenterDelegationResponse])
async def get_command_center_delegations(
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_command_center_owner),
) -> list[CommandCenterDelegationResponse]:
    """List active owner-granted command center delegates."""
    return await list_delegations(db)


@router.post("/delegations", response_model=CommandCenterDelegationResponse, status_code=201)
async def create_command_center_delegation(
    payload: CommandCenterDelegationCreate,
    db: AsyncSession = Depends(get_db),
    owner: UserResponse = Depends(get_command_center_owner),
) -> CommandCenterDelegationResponse:
    """Grant command center access to a delegate (owner only)."""
    return await grant_delegation(db, owner, payload)


@router.delete("/delegations/{delegation_id}", status_code=204)
async def delete_command_center_delegation(
    delegation_id: int,
    db: AsyncSession = Depends(get_db),
    owner: UserResponse = Depends(get_command_center_owner),
) -> None:
    """Revoke a delegate's command center access (owner only)."""
    await revoke_delegation(db, owner, delegation_id)
