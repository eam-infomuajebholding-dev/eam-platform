import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_current_user
from schemas.auth import UserResponse
from schemas.payments import (
    CheckoutSessionCreateResponse,
    CheckoutVerifyResponse,
    PaymentConfigResponse,
    PaymentStatusResponse,
)
from services.payment import CheckoutError
from services.payment_config import get_payment_config
from services.quote_payments import QuotePaymentError, QuotePaymentService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


@router.get("/config", response_model=PaymentConfigResponse)
async def get_payment_config_endpoint():
    return PaymentConfigResponse(**get_payment_config())


@router.get("/service-requests/{request_id}/status", response_model=PaymentStatusResponse)
async def get_quote_payment_status(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    service = QuotePaymentService(db)
    try:
        data = await service.get_payment_status(request_id, user_id=current_user.id)
    except QuotePaymentError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return PaymentStatusResponse.model_validate(data)


@router.post(
    "/service-requests/{request_id}/checkout",
    response_model=CheckoutSessionCreateResponse,
)
async def create_quote_checkout_session(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    service = QuotePaymentService(db)
    try:
        data = await service.create_checkout_session(
            request_id,
            user_id=current_user.id,
            customer_email=current_user.email,
        )
        await db.commit()
    except QuotePaymentError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except CheckoutError as exc:
        logger.exception("Stripe checkout creation failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return CheckoutSessionCreateResponse.model_validate(data)


@router.get("/checkout/{session_id}", response_model=CheckoutVerifyResponse)
async def verify_checkout_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    service = QuotePaymentService(db)
    try:
        data = await service.verify_checkout_session(session_id, user_id=current_user.id)
        await db.commit()
    except QuotePaymentError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CheckoutError as exc:
        logger.exception("Stripe checkout verification failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return CheckoutVerifyResponse.model_validate(data)


@router.get(
    "/operations/service-requests/{request_id}/status",
    response_model=PaymentStatusResponse,
)
async def get_ops_quote_payment_status(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(get_admin_user),
):
    service = QuotePaymentService(db)
    try:
        data = await service.get_ops_payment_status(request_id)
    except QuotePaymentError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return PaymentStatusResponse.model_validate(data)


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    service = QuotePaymentService(db)
    try:
        await service.handle_webhook_event(payload, signature)
        await db.commit()
    except QuotePaymentError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"received": True}
