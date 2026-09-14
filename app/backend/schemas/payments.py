from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PaymentConfigResponse(BaseModel):
    payments_enabled: bool
    webhook_configured: bool
    checkout_ready: bool = False
    mode: str = "unset"
    currency: str = "SAR"
    frontend_url_configured: bool = False


class CheckoutSessionCreateResponse(BaseModel):
    session_id: str
    url: str


class PaymentStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    quote_id: int
    service_request_id: int
    status: str
    paid: bool
    amount: Decimal | None = None
    currency: str = "SAR"
    paid_at: datetime | None = None
    can_pay: bool = False
    quote_status: str | None = None
    payments_enabled: bool = False
    webhook_configured: bool = False
    receipt_url: str | None = None


class CheckoutVerifyResponse(BaseModel):
    session_id: str
    status: str
    payment_status: str
    paid: bool
    quote_id: int | None = None
    service_request_id: int | None = None
    amount_total: int = Field(description="Total amount in smallest currency unit (halalas for SAR)")
    currency: str
    receipt_url: str | None = None
