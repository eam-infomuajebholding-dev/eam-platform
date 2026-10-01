import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from schemas.partners import (
    CreatePartnerOrganizationBody,
    CreatePartnerOutletBody,
    PartnerOrganizationDetail,
    PartnerOrganizationListResponse,
    PartnerOrganizationSummary,
    PartnerOutletSummary,
    UpdatePartnerOrganizationBody,
    sample_links_for_partner,
)
from schemas.partner_portal import (
    CreatePartnerApiKeyBody,
    CreatePartnerMembershipBody,
    CreatePartnerWebhookBody,
    PartnerApiKeyCreatedResponse,
    PartnerApiKeySummary,
    PartnerWebhookCreatedResponse,
    PartnerWebhookDeliverySummary,
    PartnerWebhookSummary,
)
from services.partner_api_keys import PartnerApiKeyService
from services.partner_portal import PartnerPortalError, PartnerPortalService
from services.partner_webhooks import generate_webhook_secret
from models.partner_platform import PartnerWebhookDelivery, PartnerWebhookSubscription
from services.partners import PartnerService, PartnerValidationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/operations/partners", tags=["operations"])


def _map_error(exc: Exception) -> HTTPException:
    if isinstance(exc, PartnerValidationError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    logger.exception("Unexpected partner operations error")
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("", response_model=PartnerOrganizationListResponse)
async def list_partners(
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = PartnerService(db)
    items = await service.list_organizations()
    return PartnerOrganizationListResponse(
        items=[PartnerOrganizationSummary.model_validate(item) for item in items]
    )


@router.post("", response_model=PartnerOrganizationSummary, status_code=status.HTTP_201_CREATED)
async def create_partner(
    body: CreatePartnerOrganizationBody,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = PartnerService(db)
    try:
        org = await service.create_organization(body.model_dump())
        await db.commit()
        await db.refresh(org)
        return PartnerOrganizationSummary.model_validate(org)
    except Exception as exc:
        await db.rollback()
        raise _map_error(exc) from exc


@router.get("/{org_id}", response_model=PartnerOrganizationDetail)
async def get_partner(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = PartnerService(db)
    org = await service.get_org_by_id(org_id)
    if org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    outlets = await service.list_outlets(org_id)
    detail = PartnerOrganizationDetail.model_validate(org)
    return detail.model_copy(
        update={
            "outlets": [PartnerOutletSummary.model_validate(o) for o in outlets],
            "sample_journey_links": sample_links_for_partner(org.slug, list(org.journey_types or [])),
        }
    )


@router.patch("/{org_id}", response_model=PartnerOrganizationSummary)
async def update_partner(
    org_id: int,
    body: UpdatePartnerOrganizationBody,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = PartnerService(db)
    try:
        org = await service.update_organization(org_id, body.model_dump(exclude_unset=True))
        await db.commit()
        await db.refresh(org)
        return PartnerOrganizationSummary.model_validate(org)
    except Exception as exc:
        await db.rollback()
        raise _map_error(exc) from exc


@router.post("/{org_id}/outlets", response_model=PartnerOutletSummary, status_code=status.HTTP_201_CREATED)
async def create_outlet(
    org_id: int,
    body: CreatePartnerOutletBody,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = PartnerService(db)
    try:
        outlet = await service.create_outlet(org_id, body.model_dump())
        await db.commit()
        await db.refresh(outlet)
        return PartnerOutletSummary.model_validate(outlet)
    except Exception as exc:
        await db.rollback()
        raise _map_error(exc) from exc


@router.post("/{org_id}/members", status_code=status.HTTP_201_CREATED)
async def invite_partner_member(
    org_id: int,
    body: CreatePartnerMembershipBody,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    portal = PartnerPortalService(db)
    try:
        row = await portal.invite_member(
            partner_org_id=org_id,
            user_email=body.user_email,
            role=body.role,
            invited_by_user_id=admin.id,
        )
        await db.commit()
        return {"id": row.id, "user_id": row.user_id, "role": row.role}
    except PartnerPortalError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/{org_id}/api-keys", response_model=PartnerApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_partner_api_key(
    org_id: int,
    body: CreatePartnerApiKeyBody,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    keys = PartnerApiKeyService(db)
    cred, full_key = await keys.create_credential(
        partner_org_id=org_id,
        name=body.name,
        scopes=body.scopes,
        created_by_user_id=admin.id,
    )
    await db.commit()
    return PartnerApiKeyCreatedResponse(
        id=cred.id,
        name=cred.name,
        key_prefix=cred.key_prefix,
        scopes=list(cred.scopes or []),
        api_key=full_key,
    )


@router.get("/{org_id}/api-keys", response_model=list[PartnerApiKeySummary])
async def list_partner_api_keys(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    keys = PartnerApiKeyService(db)
    items = await keys.list_for_org(org_id)
    return [PartnerApiKeySummary.model_validate(i) for i in items]


@router.post("/{org_id}/webhooks", response_model=PartnerWebhookCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_partner_webhook(
    org_id: int,
    body: CreatePartnerWebhookBody,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    secret = generate_webhook_secret()
    sub = PartnerWebhookSubscription(
        partner_org_id=org_id,
        url=body.url.strip(),
        secret=secret,
        event_types=body.event_types,
        description=body.description,
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return PartnerWebhookCreatedResponse(
        id=sub.id,
        url=sub.url,
        event_types=list(sub.event_types or []),
        signing_secret=secret,
    )


@router.get("/{org_id}/webhooks", response_model=list[PartnerWebhookSummary])
async def list_partner_webhooks(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    from sqlalchemy import select

    result = await db.execute(
        select(PartnerWebhookSubscription)
        .where(PartnerWebhookSubscription.partner_org_id == org_id)
        .order_by(PartnerWebhookSubscription.created_at.desc())
    )
    return [PartnerWebhookSummary.model_validate(row) for row in result.scalars().all()]


@router.get("/{org_id}/webhook-deliveries", response_model=list[PartnerWebhookDeliverySummary])
async def list_partner_webhook_deliveries(
    org_id: int,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    from sqlalchemy import select

    sub_ids = select(PartnerWebhookSubscription.id).where(
        PartnerWebhookSubscription.partner_org_id == org_id
    )
    result = await db.execute(
        select(PartnerWebhookDelivery)
        .where(PartnerWebhookDelivery.subscription_id.in_(sub_ids))
        .order_by(PartnerWebhookDelivery.created_at.desc())
        .limit(min(limit, 200))
    )
    return [PartnerWebhookDeliverySummary.model_validate(row) for row in result.scalars().all()]
