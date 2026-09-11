"""Quote business object service — M1 policy (WO-018)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.quotes import (
    QUOTE_ACTIVE_STATUSES,
    QUOTE_STATUS_APPROVED,
    QUOTE_STATUS_CANCELLED,
    QUOTE_STATUS_DRAFT,
    QUOTE_STATUS_ISSUED,
    QUOTE_STATUS_PENDING_APPROVAL,
    QUOTE_VALIDITY_DAYS,
    VAT_RATE,
    Quote,
    QuoteLineItem,
)
from models.service_requests import ServiceRequest
from services.service_requests import SERVICE_REQUEST_STATUS_QUALIFIED

TWOPLACES = Decimal("0.01")


class QuoteValidationError(ValueError):
    """Quote business rule violation."""


class QuoteTransitionError(ValueError):
    """Invalid quote status transition."""


def _quantize(value: Decimal) -> Decimal:
    return value.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def _line_total(quantity: Decimal, unit_price: Decimal) -> Decimal:
    return _quantize(quantity * unit_price)


def _compute_totals(line_items: list[QuoteLineItem]) -> tuple[Decimal, Decimal, Decimal]:
    subtotal = _quantize(sum(_line_total(item.quantity, item.unit_price) for item in line_items))
    vat_amount = _quantize(subtotal * Decimal(str(VAT_RATE)))
    total_amount = _quantize(subtotal + vat_amount)
    return subtotal, vat_amount, total_amount


def _line_item_response(item: QuoteLineItem) -> dict:
    return {
        "id": item.id,
        "description": item.description,
        "quantity": item.quantity,
        "unit_price": item.unit_price,
        "sort_order": item.sort_order,
        "line_total": _line_total(item.quantity, item.unit_price),
    }


def _quote_detail_dict(quote: Quote) -> dict:
    data = {
        "id": quote.id,
        "service_request_id": quote.service_request_id,
        "reference_code": quote.reference_code,
        "status": quote.status,
        "currency": quote.currency,
        "subtotal": quote.subtotal,
        "vat_rate": quote.vat_rate,
        "vat_amount": quote.vat_amount,
        "total_amount": quote.total_amount,
        "valid_until": quote.valid_until,
        "issued_at": quote.issued_at,
        "created_at": quote.created_at,
        "updated_at": quote.updated_at,
        "created_by_user_id": quote.created_by_user_id,
        "approved_by_user_id": quote.approved_by_user_id,
        "internal_note": quote.internal_note,
        "line_items": [_line_item_response(item) for item in quote.line_items],
    }
    return data


class QuoteService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, quote_id: int) -> Quote | None:
        result = await self.db.execute(
            select(Quote).options(selectinload(Quote.line_items)).where(Quote.id == quote_id)
        )
        return result.scalar_one_or_none()

    async def get_by_service_request_id(self, service_request_id: int) -> Quote | None:
        result = await self.db.execute(
            select(Quote)
            .options(selectinload(Quote.line_items))
            .where(Quote.service_request_id == service_request_id)
        )
        return result.scalar_one_or_none()

    async def _get_service_request(self, service_request_id: int) -> ServiceRequest:
        result = await self.db.execute(
            select(ServiceRequest).where(ServiceRequest.id == service_request_id)
        )
        sr = result.scalar_one_or_none()
        if sr is None:
            raise QuoteValidationError("Service request not found")
        return sr

    async def _ensure_editable(self, quote: Quote) -> None:
        if quote.status != QUOTE_STATUS_DRAFT:
            raise QuoteValidationError("Quote can only be edited in draft status")

    async def _recalculate(self, quote: Quote) -> None:
        subtotal, vat_amount, total_amount = _compute_totals(list(quote.line_items))
        quote.subtotal = subtotal
        quote.vat_amount = vat_amount
        quote.total_amount = total_amount
        quote.updated_at = datetime.now(timezone.utc)

    async def _generate_reference_code(self, sr: ServiceRequest) -> str:
        return f"QT-{sr.reference_code}"

    async def create_draft(
        self,
        service_request_id: int,
        *,
        created_by_user_id: str,
        internal_note: str | None = None,
    ) -> Quote:
        sr = await self._get_service_request(service_request_id)
        if sr.status != SERVICE_REQUEST_STATUS_QUALIFIED:
            raise QuoteValidationError("Quote can only be created for qualified service requests")

        existing = await self.get_by_service_request_id(service_request_id)
        if existing is not None and existing.status in QUOTE_ACTIVE_STATUSES:
            raise QuoteValidationError("An active quote already exists for this service request")

        quote = Quote(
            service_request_id=service_request_id,
            reference_code=await self._generate_reference_code(sr),
            status=QUOTE_STATUS_DRAFT,
            created_by_user_id=created_by_user_id,
            internal_note=internal_note,
        )
        self.db.add(quote)
        await self.db.flush()
        await self.db.refresh(quote, attribute_names=["line_items"])
        return quote

    async def add_line_item(
        self,
        quote_id: int,
        *,
        description: str,
        quantity: Decimal,
        unit_price: Decimal,
    ) -> Quote:
        quote = await self.get_by_id(quote_id)
        if quote is None:
            raise QuoteValidationError("Quote not found")
        await self._ensure_editable(quote)

        sort_order = len(quote.line_items)
        item = QuoteLineItem(
            quote_id=quote.id,
            description=description.strip(),
            quantity=quantity,
            unit_price=unit_price,
            sort_order=sort_order,
        )
        quote.line_items.append(item)
        await self._recalculate(quote)
        await self.db.flush()
        return quote

    async def update_line_item(
        self,
        quote_id: int,
        line_item_id: int,
        *,
        description: str | None = None,
        quantity: Decimal | None = None,
        unit_price: Decimal | None = None,
    ) -> Quote:
        quote = await self.get_by_id(quote_id)
        if quote is None:
            raise QuoteValidationError("Quote not found")
        await self._ensure_editable(quote)

        item = next((li for li in quote.line_items if li.id == line_item_id), None)
        if item is None:
            raise QuoteValidationError("Line item not found")

        if description is not None:
            item.description = description.strip()
        if quantity is not None:
            item.quantity = quantity
        if unit_price is not None:
            item.unit_price = unit_price

        await self._recalculate(quote)
        await self.db.flush()
        return quote

    async def remove_line_item(self, quote_id: int, line_item_id: int) -> Quote:
        quote = await self.get_by_id(quote_id)
        if quote is None:
            raise QuoteValidationError("Quote not found")
        await self._ensure_editable(quote)

        item = next((li for li in quote.line_items if li.id == line_item_id), None)
        if item is None:
            raise QuoteValidationError("Line item not found")

        quote.line_items.remove(item)
        for index, li in enumerate(quote.line_items):
            li.sort_order = index
        await self._recalculate(quote)
        await self.db.flush()
        return quote

    async def submit_for_approval(self, quote_id: int) -> Quote:
        quote = await self.get_by_id(quote_id)
        if quote is None:
            raise QuoteValidationError("Quote not found")
        if quote.status != QUOTE_STATUS_DRAFT:
            raise QuoteTransitionError("Only draft quotes can be submitted for approval")
        if not quote.line_items:
            raise QuoteValidationError("Quote must have at least one line item before submission")

        quote.status = QUOTE_STATUS_PENDING_APPROVAL
        quote.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return quote

    async def approve(self, quote_id: int, *, approved_by_user_id: str) -> Quote:
        quote = await self.get_by_id(quote_id)
        if quote is None:
            raise QuoteValidationError("Quote not found")
        if quote.status != QUOTE_STATUS_PENDING_APPROVAL:
            raise QuoteTransitionError("Only pending quotes can be approved")

        quote.status = QUOTE_STATUS_APPROVED
        quote.approved_by_user_id = approved_by_user_id
        quote.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return quote

    async def issue(self, quote_id: int) -> Quote:
        quote = await self.get_by_id(quote_id)
        if quote is None:
            raise QuoteValidationError("Quote not found")
        if quote.status != QUOTE_STATUS_APPROVED:
            raise QuoteTransitionError("Only approved quotes can be issued")

        now = datetime.now(timezone.utc)
        quote.status = QUOTE_STATUS_ISSUED
        quote.issued_at = now
        quote.valid_until = now + timedelta(days=QUOTE_VALIDITY_DAYS)
        quote.updated_at = now
        await self.db.flush()
        return quote

    async def cancel(self, quote_id: int) -> Quote:
        quote = await self.get_by_id(quote_id)
        if quote is None:
            raise QuoteValidationError("Quote not found")
        if quote.status == QUOTE_STATUS_ISSUED:
            raise QuoteTransitionError("Issued quotes cannot be cancelled in M1")
        if quote.status == QUOTE_STATUS_CANCELLED:
            raise QuoteTransitionError("Quote is already cancelled")

        quote.status = QUOTE_STATUS_CANCELLED
        quote.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return quote

    async def get_customer_issued_quote(
        self,
        service_request_id: int,
        *,
        user_id: str,
    ) -> Quote | None:
        sr = await self._get_service_request(service_request_id)
        if sr.user_id != user_id:
            return None
        quote = await self.get_by_service_request_id(service_request_id)
        if quote is None or quote.status != QUOTE_STATUS_ISSUED:
            return None
        return quote

    def to_detail(self, quote: Quote) -> dict:
        return _quote_detail_dict(quote)
