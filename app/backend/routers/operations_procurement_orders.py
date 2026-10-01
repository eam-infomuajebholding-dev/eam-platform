import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from schemas.procurement_orders import ProcurementOrderDetail, ProcurementOrderListResponse, ProcurementOrderSummary
from services.procurement_orders import ProcurementOrderService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/operations/procurement-orders", tags=["operations"])


@router.get("", response_model=ProcurementOrderListResponse)
async def list_procurement_orders(
    partner_org_id: int | None = None,
    service_request_id: int | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = ProcurementOrderService(db)
    items = await service.list_for_operations(
        partner_org_id=partner_org_id,
        service_request_id=service_request_id,
        status=status,
    )
    return ProcurementOrderListResponse(
        items=[ProcurementOrderSummary.model_validate(i) for i in items]
    )


@router.get("/{order_id}", response_model=ProcurementOrderDetail)
async def get_procurement_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = ProcurementOrderService(db)
    row = await service.get_by_id(order_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement order not found")
    return ProcurementOrderDetail.model_validate(row)
