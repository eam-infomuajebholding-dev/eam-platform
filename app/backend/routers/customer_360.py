from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from schemas.customer_360 import Customer360Response
from services.customer_360 import Customer360Service

router = APIRouter(prefix="/api/v1/customer", tags=["customer"])


@router.get("/workspace", response_model=Customer360Response)
async def get_customer_workspace(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    service = Customer360Service(db)
    return await service.get_for_user(current_user)
