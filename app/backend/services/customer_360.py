"""Customer 360 read model — aggregates authorized customer-facing state."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from schemas.auth import UserResponse
from schemas.customer_360 import ActiveJourneySummary, Customer360Response, CustomerProfileSummary
from schemas.service_requests import summary_from_model
from services.jos import JosService
from services.service_requests import ServiceRequestService


class Customer360Service:
    """Read-only aggregation; business truth remains in domain authorities."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.sr = ServiceRequestService(db)
        self.jos = JosService(db)

    async def get_for_user(self, user: UserResponse) -> Customer360Response:
        service_requests = await self.sr.list_for_user(user.id)
        active_journeys = await self.jos.list_active_instances(user_id=user.id)

        status_counts: dict[str, int] = {}
        for item in service_requests:
            status_counts[item.status] = status_counts.get(item.status, 0) + 1

        return Customer360Response(
            profile=CustomerProfileSummary(
                id=user.id,
                name=user.name,
                email=user.email,
            ),
            service_requests=[summary_from_model(item) for item in service_requests],
            active_journeys=[
                ActiveJourneySummary(
                    id=instance.id,
                    journey_type=instance.journey_type,
                    current_step_key=instance.current_step_key,
                    status=instance.status,
                    updated_at=instance.updated_at,
                )
                for instance in active_journeys
            ],
            summary={
                "service_request_count": len(service_requests),
                "active_journey_count": len(active_journeys),
                "service_request_status_counts": status_counts,
            },
        )
