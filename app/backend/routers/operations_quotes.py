import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_owner_user
from schemas.auth import UserResponse
from schemas.quotes import (
    QuoteCreateRequest,
    QuoteDetailResponse,
    QuoteLineItemCreate,
    QuoteLineItemUpdate,
)
from services.quotes import QuoteService, QuoteTransitionError, QuoteValidationError, _quote_detail_dict

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/operations", tags=["operations"])


def _map_quote_error(exc: Exception) -> HTTPException:
    if isinstance(exc, QuoteTransitionError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    if isinstance(exc, QuoteValidationError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    logger.exception("Unexpected quote operations error")
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


def _detail_response(quote) -> QuoteDetailResponse:
    return QuoteDetailResponse.model_validate(_quote_detail_dict(quote))


@router.post(
    "/service-requests/{request_id}/quotes",
    response_model=QuoteDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_quote_draft(
    request_id: int,
    body: QuoteCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    service = QuoteService(db)
    try:
        quote = await service.create_draft(
            request_id,
            created_by_user_id=admin.id,
            internal_note=body.internal_note,
        )
        await db.commit()
        quote = await service.get_by_id(quote.id)
        return _detail_response(quote)
    except Exception as exc:
        raise _map_quote_error(exc) from exc


@router.get("/service-requests/{request_id}/quote", response_model=QuoteDetailResponse)
async def get_quote_for_service_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = QuoteService(db)
    quote = await service.get_by_service_request_id(request_id)
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")
    return _detail_response(quote)


@router.get("/quotes/{quote_id}", response_model=QuoteDetailResponse)
async def get_quote(
    quote_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = QuoteService(db)
    quote = await service.get_by_id(quote_id)
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")
    return _detail_response(quote)


@router.post("/quotes/{quote_id}/line-items", response_model=QuoteDetailResponse)
async def add_quote_line_item(
    quote_id: int,
    body: QuoteLineItemCreate,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = QuoteService(db)
    try:
        quote = await service.add_line_item(
            quote_id,
            description=body.description,
            quantity=body.quantity,
            unit_price=body.unit_price,
        )
        await db.commit()
        quote = await service.get_by_id(quote.id)
        return _detail_response(quote)
    except Exception as exc:
        raise _map_quote_error(exc) from exc


@router.patch("/quotes/{quote_id}/line-items/{line_item_id}", response_model=QuoteDetailResponse)
async def update_quote_line_item(
    quote_id: int,
    line_item_id: int,
    body: QuoteLineItemUpdate,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = QuoteService(db)
    try:
        quote = await service.update_line_item(
            quote_id,
            line_item_id,
            description=body.description,
            quantity=body.quantity,
            unit_price=body.unit_price,
        )
        await db.commit()
        quote = await service.get_by_id(quote.id)
        return _detail_response(quote)
    except Exception as exc:
        raise _map_quote_error(exc) from exc


@router.delete("/quotes/{quote_id}/line-items/{line_item_id}", response_model=QuoteDetailResponse)
async def delete_quote_line_item(
    quote_id: int,
    line_item_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = QuoteService(db)
    try:
        quote = await service.remove_line_item(quote_id, line_item_id)
        await db.commit()
        quote = await service.get_by_id(quote.id)
        return _detail_response(quote)
    except Exception as exc:
        raise _map_quote_error(exc) from exc


@router.post("/quotes/{quote_id}/submit", response_model=QuoteDetailResponse)
async def submit_quote_for_approval(
    quote_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = QuoteService(db)
    try:
        quote = await service.submit_for_approval(quote_id)
        await db.commit()
        quote = await service.get_by_id(quote.id)
        return _detail_response(quote)
    except Exception as exc:
        raise _map_quote_error(exc) from exc


@router.post("/quotes/{quote_id}/approve", response_model=QuoteDetailResponse)
async def approve_quote(
    quote_id: int,
    db: AsyncSession = Depends(get_db),
    owner: UserResponse = Depends(get_owner_user),
):
    service = QuoteService(db)
    try:
        quote = await service.approve(quote_id, approved_by_user_id=owner.id)
        await db.commit()
        quote = await service.get_by_id(quote.id)
        return _detail_response(quote)
    except Exception as exc:
        raise _map_quote_error(exc) from exc


@router.post("/quotes/{quote_id}/issue", response_model=QuoteDetailResponse)
async def issue_quote(
    quote_id: int,
    db: AsyncSession = Depends(get_db),
    owner: UserResponse = Depends(get_owner_user),
):
    service = QuoteService(db)
    try:
        quote = await service.issue(quote_id)
        await db.commit()
        quote = await service.get_by_id(quote.id)
        return _detail_response(quote)
    except Exception as exc:
        raise _map_quote_error(exc) from exc
