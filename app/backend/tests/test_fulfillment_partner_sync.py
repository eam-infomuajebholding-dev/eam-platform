"""Partner accept → PO sync → delivery shipment."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import models.logistics  # noqa: F401
import models.procurement_orders  # noqa: F401
from core.database import Base
from models.partner_platform import PARTNER_ASSIGNMENT_ACCEPTED, PARTNER_ASSIGNMENT_PENDING
from models.service_requests import ServiceRequest
from services.building_materials_validators import assemble_procurement_invoice
from services.logistics import LogisticsService
from services.procurement_orders import ProcurementOrderService


@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_partner_acceptance_creates_shipment(db_session: AsyncSession):
    invoice = assemble_procurement_invoice(
        {"materials_list": "حديد", "delivery_location": "الرياض", "requester_name": "A", "requester_phone": "+966500000001"}
    )
    sr = ServiceRequest(
        user_id="u1",
        journey_instance_id=99,
        journey_type="building_materials",
        request_type="building_materials",
        status="submitted",
        reference_code="SR-BM-SYNC1",
        intake_snapshot={"procurement_invoice": invoice},
        partner_org_id=5,
        partner_assignment_status=PARTNER_ASSIGNMENT_PENDING,
    )
    db_session.add(sr)
    await db_session.flush()

    po_service = ProcurementOrderService(db_session)
    po = await po_service.create_for_service_request(sr)
    assert po is not None

    sr.partner_assignment_status = PARTNER_ASSIGNMENT_ACCEPTED
    await po_service.sync_partner_assignment(sr)

    logistics = LogisticsService(db_session)
    shipment = await logistics.get_by_service_request_id(sr.id)
    assert shipment is not None
    assert shipment.partner_org_id == 5
