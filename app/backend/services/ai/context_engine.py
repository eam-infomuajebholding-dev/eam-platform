"""Server-built AI context. Client hints are not authorization."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from sqlalchemy.ext.asyncio import AsyncSession

from schemas.ai_core import WorkspaceClientHints
from schemas.auth import UserResponse
from services.jos import JosService

AiSurface = Literal["home", "journey", "command_center", "site_editor"]
ActorKind = Literal["user", "anonymous"]

_BASE_PERMISSIONS = frozenset(
    {
        "journey.start",
        "journey.resume",
        "journey.read",
        "human_handoff.request",
    }
)


@dataclass(frozen=True)
class ActorBinding:
    """Identity taken from the server session, never from the model or request body."""

    user_id: str | None
    anonymous_session_id: str | None
    role: str
    permissions: frozenset[str]


@dataclass(frozen=True)
class AIContext:
    actor_kind: ActorKind
    user_id: str | None
    anonymous_session_id: str | None
    role: str
    surface: AiSurface
    route: str | None
    locale: Literal["ar", "en"]
    journey_instance_id: int | None
    journey_type: str | None
    journey_step_key: str | None
    journey_status: str | None
    journey_context: dict
    business_object_type: str | None
    business_object_id: int | None
    permissions: frozenset[str]
    conflict: bool
    forbidden: bool

    def trace_fields(self) -> dict[str, object]:
        return {
            "surface": self.surface,
            "actor_kind": self.actor_kind,
            "journey_id": self.journey_instance_id,
            "conflict": self.conflict,
        }


def permissions_for_actor(user: UserResponse | None) -> frozenset[str]:
    granted = set(_BASE_PERMISSIONS)
    if user is None:
        return frozenset(granted)
    granted.add("service_request.read_own")
    if user.command_center is not None:
        granted.update(user.command_center.permissions)
    return frozenset(granted)


def actor_binding(user: UserResponse | None, anonymous_session_id: str | None) -> ActorBinding:
    session = (anonymous_session_id or "").strip() or None
    if session is not None:
        session = session[:128]
    if user is None:
        return ActorBinding(
            user_id=None,
            anonymous_session_id=session,
            role="",
            permissions=permissions_for_actor(None),
        )
    return ActorBinding(
        user_id=user.id,
        anonymous_session_id=session,
        role=user.role or "",
        permissions=permissions_for_actor(user),
    )


def journey_type_from_route(route: str | None) -> str | None:
    """Presentation hint only. JOS remains the active journey authority."""
    if not route:
        return None
    path = route.split("?", 1)[0].rstrip("/") or "/"
    if path == "/invest" or path.startswith("/invest/"):
        return "investment"
    for prefix in ("/journeys/", "/services/"):
        if not path.startswith(prefix):
            continue
        slug = path[len(prefix) :].split("/", 1)[0]
        if not slug:
            return None
        return slug.replace("-", "_")
    return None


def _owns_journey(instance: object, actor: ActorBinding) -> bool:
    user_id = getattr(instance, "user_id", None)
    anonymous_session_id = getattr(instance, "anonymous_session_id", None)
    if actor.user_id and user_id == actor.user_id:
        return True
    if actor.anonymous_session_id and anonymous_session_id == actor.anonymous_session_id:
        return True
    return False


class ContextEngine:
    def __init__(self, db: AsyncSession | None) -> None:
        self.db = db

    async def build(self, actor: ActorBinding, hints: WorkspaceClientHints) -> AIContext:
        actor_kind: ActorKind = "user" if actor.user_id else "anonymous"
        base = AIContext(
            actor_kind=actor_kind,
            user_id=actor.user_id,
            anonymous_session_id=actor.anonymous_session_id,
            role=actor.role,
            surface=hints.surface,
            route=hints.route,
            locale=hints.locale,
            journey_instance_id=None,
            journey_type=None,
            journey_step_key=None,
            journey_status=None,
            journey_context={},
            business_object_type=None,
            business_object_id=None,
            permissions=actor.permissions,
            conflict=False,
            forbidden=False,
        )
        if hints.journey_instance_id is None:
            return base
        if self.db is None:
            return _replace(base, forbidden=True)
        jos = JosService(self.db)
        instance = await jos.get_instance(hints.journey_instance_id)
        if instance is None:
            return base
        if not _owns_journey(instance, actor):
            return _replace(base, forbidden=True)
        raw_context = instance.context if isinstance(instance.context, dict) else {}
        business_type: str | None = None
        business_id: int | None = None
        try:
            service_request_id = await jos._get_service_request_id(instance.id)
        except Exception:
            service_request_id = None
        if service_request_id is not None:
            business_type = "service_request"
            business_id = int(service_request_id)
        route_type = journey_type_from_route(hints.route)
        conflict = route_type is not None and route_type != instance.journey_type
        return _replace(
            base,
            journey_instance_id=instance.id,
            journey_type=instance.journey_type,
            journey_step_key=instance.current_step_key,
            journey_status=instance.status,
            journey_context=dict(raw_context),
            business_object_type=business_type,
            business_object_id=business_id,
            conflict=conflict,
            forbidden=False,
        )


def _replace(context: AIContext, **changes: object) -> AIContext:
    data = {
        "actor_kind": context.actor_kind,
        "user_id": context.user_id,
        "anonymous_session_id": context.anonymous_session_id,
        "role": context.role,
        "surface": context.surface,
        "route": context.route,
        "locale": context.locale,
        "journey_instance_id": context.journey_instance_id,
        "journey_type": context.journey_type,
        "journey_step_key": context.journey_step_key,
        "journey_status": context.journey_status,
        "journey_context": context.journey_context,
        "business_object_type": context.business_object_type,
        "business_object_id": context.business_object_id,
        "permissions": context.permissions,
        "conflict": context.conflict,
        "forbidden": context.forbidden,
    }
    data.update(changes)
    return AIContext(**data)  # type: ignore[arg-type]
