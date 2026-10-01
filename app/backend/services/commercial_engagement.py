"""Post-quote acceptance: contract record + operational project."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.commercial_contracts import CONTRACT_TERMS_VERSION, CommercialContract
from models.operational_projects import OP_STATUS_ACTIVE, OperationalProject
from models.quotes import QUOTE_STATUS_ACCEPTED, QUOTE_STATUS_ISSUED, Quote
from models.service_requests import ServiceRequest
from services.quotes import QuoteService, QuoteTransitionError, QuoteValidationError


class CommercialEngagementError(ValueError):
    pass


class CommercialEngagementService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.quote_service = QuoteService(db)

    async def accept_issued_quote(
        self,
        service_request_id: int,
        *,
        user_id: str,
        terms_version: str = CONTRACT_TERMS_VERSION,
    ) -> dict:
        quote = await self.quote_service.get_customer_issued_quote(service_request_id, user_id=user_id)
        if quote is None:
            raise CommercialEngagementError("Issued quote not found")
        if quote.status != QUOTE_STATUS_ISSUED:
            raise QuoteTransitionError("Only issued quotes can be accepted")

        now = datetime.now(timezone.utc)
        if quote.valid_until is not None and quote.valid_until < now:
            raise CommercialEngagementError("Quote has expired")

        sr = await self._get_sr(service_request_id)
        if sr.user_id != user_id:
            raise CommercialEngagementError("Service request not found")

        existing_contract = await self.db.execute(
            select(CommercialContract).where(CommercialContract.service_request_id == service_request_id)
        )
        if existing_contract.scalar_one_or_none() is not None:
            raise CommercialEngagementError("Quote already accepted for this service request")

        quote.status = QUOTE_STATUS_ACCEPTED
        quote.updated_at = now

        contract = CommercialContract(
            service_request_id=service_request_id,
            quote_id=quote.id,
            reference_code=f"CN-{quote.reference_code}",
            terms_version=terms_version,
            customer_acknowledged=True,
            accepted_by_user_id=user_id,
            accepted_at=now,
            summary_ar="قبول العرض الإلكتروني — يلزم مستند عقد موقّع عند طلب الجهة المنظمة",
        )
        self.db.add(contract)

        op_ref = f"OP-{sr.reference_code}"
        project = OperationalProject(
            service_request_id=service_request_id,
            quote_id=quote.id,
            reference_code=op_ref,
            status=OP_STATUS_ACTIVE,
            title_ar=f"مشروع تشغيلي — {sr.reference_code}",
            opened_at=now,
        )
        self.db.add(project)
        await self.db.flush()

        return {
            "quote": self.quote_service.to_detail(quote),
            "contract_reference": contract.reference_code,
            "operational_project_reference": project.reference_code,
            "operational_project_status": project.status,
        }

    async def _get_sr(self, service_request_id: int) -> ServiceRequest:
        result = await self.db.execute(
            select(ServiceRequest).where(ServiceRequest.id == service_request_id)
        )
        sr = result.scalar_one_or_none()
        if sr is None:
            raise CommercialEngagementError("Service request not found")
        return sr
