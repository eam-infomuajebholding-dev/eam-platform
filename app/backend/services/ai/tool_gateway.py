"""Runtime AI Tool Gateway — orchestrates policy checks and business service execution."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from schemas.jos import JourneyInstanceResponse
from schemas.service_requests import ServiceRequestDetail, ServiceRequestListResponse, summary_from_model
from services.ai.tool_policy import (
    ToolAuditRecord,
    ToolAuthorizationResult,
    can_execute_tool,
    record_tool_audit,
    validate_tool_input,
)
from services.ai.tool_registry import ToolDefinition, get_tool
from services.ai_core_intents import M1_JOURNEY_INTENTS
from services.jos import JosAccessError, JosDuplicateActiveJourneyError, JosService, JosStateError
from services.service_requests import ServiceRequestService

logger = logging.getLogger(__name__)


@dataclass
class ToolExecutionContext:
    trace_id: str
    user_id: str | None = None
    anonymous_session_id: str | None = None
    granted_permissions: set[str] | None = None
    confirmation_present: bool = False


@dataclass
class ToolExecutionResult:
    tool_id: str
    trace_id: str
    status: str
    data: dict[str, Any] | None = None
    safe_message: str | None = None
    error_code: str | None = None
    audit_reference: str | None = None


class ToolGatewayError(Exception):
    def __init__(self, error_code: str, safe_message: str):
        self.error_code = error_code
        self.safe_message = safe_message
        super().__init__(safe_message)


class ToolGateway:
    """Orchestrates tool execution; business authority remains in domain services."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.jos = JosService(db)
        self.sr = ServiceRequestService(db)

    async def execute(
        self,
        tool_id: str,
        payload: dict[str, Any],
        context: ToolExecutionContext,
    ) -> ToolExecutionResult:
        started = time.perf_counter()
        auth_result: ToolAuthorizationResult | None = None
        try:
            tool = get_tool(tool_id)
        except KeyError:
            return self._deny(
                tool_id,
                context,
                started,
                auth_result=None,
                error_code="UNKNOWN_TOOL",
                safe_message="الأداة غير مسجلة.",
            )

        auth_result = can_execute_tool(
            tool_id,
            is_authenticated=bool(context.user_id),
            granted_permissions=context.granted_permissions,
            confirmation_present=context.confirmation_present,
        )
        if not auth_result.allowed:
            code = {
                "AUTH_REQUIRED": "AUTH_REQUIRED",
                "PERMISSION_DENIED": "PERMISSION_DENIED",
                "UNKNOWN_TOOL": "UNKNOWN_TOOL",
                "CONFIRMATION_MISSING": "CONFIRMATION_MISSING",
            }.get(auth_result.reason, "POLICY_DENIED")
            return self._deny(
                tool_id,
                context,
                started,
                auth_result=auth_result,
                error_code=code,
                safe_message="تعذر تنفيذ الإجراء المطلوب.",
                tool=tool,
            )

        if not validate_tool_input(tool, payload):
            return self._deny(
                tool_id,
                context,
                started,
                auth_result=auth_result,
                error_code="INVALID_ARGUMENTS",
                safe_message="مدخلات الأداة غير صالحة.",
                tool=tool,
            )

        try:
            data = await self._dispatch(tool_id, payload, context)
        except ToolGatewayError as exc:
            return self._deny(
                tool_id,
                context,
                started,
                auth_result=auth_result,
                error_code=exc.error_code,
                safe_message=exc.safe_message,
                tool=tool,
            )
        except JosDuplicateActiveJourneyError as exc:
            return self._deny(
                tool_id,
                context,
                started,
                auth_result=auth_result,
                error_code="DUPLICATE_ACTIVE_JOURNEY",
                safe_message="يوجد رحلة نشطة بالفعل.",
                tool=tool,
                business_reference=str(exc.existing_instance_id),
                data={"existing_journey_instance_id": exc.existing_instance_id},
            )
        except (JosAccessError, JosStateError) as exc:
            return self._deny(
                tool_id,
                context,
                started,
                auth_result=auth_result,
                error_code="JOURNEY_ACCESS_DENIED",
                safe_message="تعذر الوصول إلى الرحلة.",
                tool=tool,
            )
        except Exception:
            logger.exception("Tool execution failed tool_id=%s trace_id=%s", tool_id, context.trace_id)
            return self._deny(
                tool_id,
                context,
                started,
                auth_result=auth_result,
                error_code="TOOL_EXECUTION_FAILED",
                safe_message="تعذر إكمال العملية.",
                tool=tool,
            )

        duration_ms = int((time.perf_counter() - started) * 1000)
        record_tool_audit(
            ToolAuditRecord(
                trace_id=context.trace_id,
                tool_id=tool_id,
                risk_class=tool.risk if tool else None,
                authorization_result=auth_result.reason if auth_result else "ALLOWED",
                confirmation_result="CONFIRMED" if context.confirmation_present else "NOT_REQUIRED",
                execution_result="SUCCESS",
                duration_ms=duration_ms,
            )
        )
        return ToolExecutionResult(
            tool_id=tool_id,
            trace_id=context.trace_id,
            status="success",
            data=data,
            safe_message="تم تنفيذ الإجراء بنجاح.",
            audit_reference=context.trace_id,
        )

    async def _dispatch(
        self,
        tool_id: str,
        payload: dict[str, Any],
        context: ToolExecutionContext,
    ) -> dict[str, Any]:
        if tool_id == "journey.start":
            journey_type = payload["journey_type"]
            if journey_type not in M1_JOURNEY_INTENTS:
                raise ToolGatewayError("UNSUPPORTED_JOURNEY", "نوع الرحلة غير مدعوم.")
            instance = await self.jos.start_journey(
                journey_type,
                anonymous_session_id=context.anonymous_session_id,
                user_id=context.user_id,
            )
            return {
                "journey_instance_id": instance.id,
                "journey_type": instance.journey_type,
                "current_step_key": instance.current_step_key,
            }

        if tool_id == "journey.resume":
            instance_id = int(payload["journey_instance_id"])
            instance = await self.jos.get_instance(instance_id)
            if not instance:
                raise ToolGatewayError("JOURNEY_NOT_FOUND", "الرحلة غير موجودة.")
            self._assert_journey_access(instance, context)
            if instance.status == "paused":
                instance = await self.jos.resume(instance_id)
            return {
                "journey_instance_id": instance.id,
                "status": instance.status,
                "current_step_key": instance.current_step_key,
            }

        if tool_id == "journey.read_state":
            instance_id = int(payload["journey_instance_id"])
            instance = await self.jos.get_instance(instance_id)
            if not instance:
                raise ToolGatewayError("JOURNEY_NOT_FOUND", "الرحلة غير موجودة.")
            self._assert_journey_access(instance, context)
            return JourneyInstanceResponse.model_validate(instance).model_dump(mode="json")

        if tool_id == "service_request.read_current_user":
            if not context.user_id:
                raise ToolGatewayError("AUTH_REQUIRED", "يلزم تسجيل الدخول.")
            items = await self.sr.list_for_user(context.user_id)
            response = ServiceRequestListResponse(items=[summary_from_model(item) for item in items])
            return response.model_dump(mode="json")

        if tool_id == "service_request.read_detail":
            if not context.user_id:
                raise ToolGatewayError("AUTH_REQUIRED", "يلزم تسجيل الدخول.")
            request_id = int(payload["service_request_id"])
            item = await self.sr.get_by_id_for_user(request_id, context.user_id)
            if not item:
                raise ToolGatewayError("NOT_FOUND", "الطلب غير موجود.")
            detail = ServiceRequestDetail.model_validate(item)
            return detail.model_dump(mode="json")

        if tool_id == "human_handoff.request":
            reason = str(payload.get("reason", "")).strip()
            if not reason:
                raise ToolGatewayError("INVALID_ARGUMENTS", "سبب التحويل مطلوب.")
            journey_instance_id = payload.get("journey_instance_id")
            service_request_id = payload.get("service_request_id")
            journey_context: dict[str, Any] | None = None
            if journey_instance_id is not None:
                instance = await self.jos.get_instance(int(journey_instance_id))
                if instance:
                    self._assert_journey_access(instance, context)
                    journey_context = {
                        "journey_instance_id": instance.id,
                        "journey_type": instance.journey_type,
                        "current_step_key": instance.current_step_key,
                        "status": instance.status,
                    }
            return {
                "handoff_id": context.trace_id,
                "status": "queued",
                "reason": reason,
                "conversation_summary": payload.get("conversation_summary"),
                "journey_context": journey_context,
                "service_request_id": service_request_id,
                "customer_user_id": context.user_id,
            }

        raise ToolGatewayError("UNKNOWN_TOOL", "الأداة غير مسجلة.")

    @staticmethod
    def _assert_journey_access(instance: Any, context: ToolExecutionContext) -> None:
        if context.user_id and instance.user_id == context.user_id:
            return
        if (
            context.anonymous_session_id
            and instance.anonymous_session_id == context.anonymous_session_id
        ):
            return
        raise ToolGatewayError("JOURNEY_ACCESS_DENIED", "تعذر الوصول إلى الرحلة.")

    def _deny(
        self,
        tool_id: str,
        context: ToolExecutionContext,
        started: float,
        *,
        auth_result: ToolAuthorizationResult | None,
        error_code: str,
        safe_message: str,
        tool: ToolDefinition | None = None,
        business_reference: str | None = None,
        data: dict[str, Any] | None = None,
    ) -> ToolExecutionResult:
        duration_ms = int((time.perf_counter() - started) * 1000)
        record_tool_audit(
            ToolAuditRecord(
                trace_id=context.trace_id,
                tool_id=tool_id,
                risk_class=tool.risk if tool else None,
                authorization_result=auth_result.reason if auth_result else error_code,
                confirmation_result="CONFIRMATION_MISSING"
                if auth_result and auth_result.reason == "CONFIRMATION_MISSING"
                else ("CONFIRMED" if context.confirmation_present else "NOT_REQUIRED"),
                execution_result="DENIED",
                duration_ms=duration_ms,
                business_reference=business_reference,
            )
        )
        return ToolExecutionResult(
            tool_id=tool_id,
            trace_id=context.trace_id,
            status="denied",
            data=data,
            safe_message=safe_message,
            error_code=error_code,
            audit_reference=context.trace_id,
        )
