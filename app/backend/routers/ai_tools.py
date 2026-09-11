import logging
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.jos import get_anonymous_session_id, get_optional_current_user
from schemas.ai_tools import ToolExecuteRequest, ToolExecuteResponse
from schemas.auth import UserResponse
from services.ai.tool_gateway import ToolExecutionContext, ToolGateway

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai/tools", tags=["ai-tools"])


def _granted_permissions(user: UserResponse | None) -> set[str]:
    permissions = {
        "journey.start",
        "journey.resume",
        "journey.read",
        "human_handoff.request",
    }
    if user:
        permissions.add("service_request.read_own")
    return permissions


@router.post("/execute", response_model=ToolExecuteResponse)
async def execute_tool(
    body: ToolExecuteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    trace_id = body.trace_id or str(uuid.uuid4())
    gateway = ToolGateway(db)
    context = ToolExecutionContext(
        trace_id=trace_id,
        user_id=current_user.id if current_user else None,
        anonymous_session_id=anonymous_session_id,
        granted_permissions=_granted_permissions(current_user),
        confirmation_present=body.confirmation_present,
    )
    result = await gateway.execute(body.tool_id, body.payload, context)
    if result.status == "success":
        await db.commit()
    return ToolExecuteResponse(
        tool_id=result.tool_id,
        trace_id=result.trace_id,
        status=result.status,
        data=result.data,
        safe_message=result.safe_message,
        error_code=result.error_code,
        audit_reference=result.audit_reference,
    )
