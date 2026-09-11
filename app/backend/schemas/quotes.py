from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class QuoteLineItemCreate(BaseModel):
    description: str = Field(min_length=1, max_length=512)
    quantity: Decimal = Field(default=Decimal("1"), gt=0)
    unit_price: Decimal = Field(ge=0)


class QuoteLineItemUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1, max_length=512)
    quantity: Decimal | None = Field(default=None, gt=0)
    unit_price: Decimal | None = Field(default=None, ge=0)


class QuoteLineItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    quantity: Decimal
    unit_price: Decimal
    sort_order: int
    line_total: Decimal


class QuoteSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_request_id: int
    reference_code: str
    status: str
    currency: str
    subtotal: Decimal
    vat_rate: Decimal
    vat_amount: Decimal
    total_amount: Decimal
    valid_until: datetime | None = None
    issued_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class QuoteDetailResponse(QuoteSummaryResponse):
    created_by_user_id: str
    approved_by_user_id: str | None = None
    internal_note: str | None = None
    line_items: list[QuoteLineItemResponse] = Field(default_factory=list)


class QuoteCreateRequest(BaseModel):
    internal_note: str | None = None
