"""Delivery logistics layer."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import models.logistics  # noqa: F401
import models.partners  # noqa: F401
import models.procurement_orders  # noqa: F401
from core.database import Base
from models.logistics import SHIPMENT_STATUS_DISPATCHED, SHIPMENT_STATUS_IN_TRANSIT
from models.procurement_orders import PO_STATUS_PARTNER_ACCEPTED, ProcurementOrder
from models.service_requests import ServiceRequest
from services.logistics import LogisticsError, LogisticsService


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
async def test_shipment_created_on_accepted_po(db_session: AsyncSession):
    sr = ServiceRequest(
        user_id="u1",
        journey_instance_id=1,
        journey_type="building_materials",
        request_type="building_materials",
        status="submitted",
        reference_code="SR-BM-LOG1",
        intake_snapshot={"delivery_location": "الرياض"},
        partner_assignment_status="accepted",
    )
    db_session.add(sr)
    await db_session.flush()

    po = ProcurementOrder(
        service_request_id=sr.id,
        reference_code="PO-SR-BM-LOG1",
        journey_type="building_materials",
        status=PO_STATUS_PARTNER_ACCEPTED,
        currency="SAR",
        line_items=[],
        invoice_snapshot={},
        delivery_location="الرياض",
    )
    db_session.add(po)
    await db_session.flush()

    logistics = LogisticsService(db_session)
    shipment = await logistics.ensure_shipment_for_procurement_order(po)
    assert shipment is not None
    assert shipment.reference_code == "SH-SR-BM-LOG1"
    assert shipment.status == "awaiting_dispatch"


@pytest.mark.asyncio
async def test_shipment_status_transition(db_session: AsyncSession):
    sr = ServiceRequest(
        user_id="u1",
        journey_instance_id=2,
        journey_type="building_materials",
        request_type="building_materials",
        status="submitted",
        reference_code="SR-BM-LOG2",
        intake_snapshot={},
        partner_assignment_status="accepted",
    )
    db_session.add(sr)
    await db_session.flush()
    po = ProcurementOrder(
        service_request_id=sr.id,
        reference_code="PO-SR-BM-LOG2",
        journey_type="building_materials",
        status=PO_STATUS_PARTNER_ACCEPTED,
        currency="SAR",
        line_items=[],
        invoice_snapshot={},
    )
    db_session.add(po)
    await db_session.flush()

    logistics = LogisticsService(db_session)
    shipment = await logistics.ensure_shipment_for_procurement_order(po)
    assert shipment is not None

    shipment = await logistics.transition_status(
        shipment,
        to_status=SHIPMENT_STATUS_DISPATCHED,
        actor_role="partner",
        tracking_number="TRK-001",
    )
    shipment = await logistics.transition_status(
        shipment,
        to_status=SHIPMENT_STATUS_IN_TRANSIT,
        actor_role="partner",
    )
    assert shipment.status == SHIPMENT_STATUS_IN_TRANSIT
    assert shipment.tracking_number == "TRK-001"

    with pytest.raises(LogisticsError):
        await logistics.transition_status(
            shipment,
            to_status="awaiting_dispatch",
            actor_role="partner",
        )


@pytest.mark.asyncio
async def test_partner_dispatch_requires_tracking(db_session: AsyncSession):
    sr = ServiceRequest(
        user_id="u1",
        journey_instance_id=3,
        journey_type="building_materials",
        request_type="building_materials",
        status="submitted",
        reference_code="SR-BM-LOG3",
        intake_snapshot={},
        partner_assignment_status="accepted",
    )
    db_session.add(sr)
    await db_session.flush()
    po = ProcurementOrder(
        service_request_id=sr.id,
        reference_code="PO-SR-BM-LOG3",
        journey_type="building_materials",
        status=PO_STATUS_PARTNER_ACCEPTED,
        currency="SAR",
        line_items=[],
        invoice_snapshot={},
    )
    db_session.add(po)
    await db_session.flush()

    logistics = LogisticsService(db_session)
    shipment = await logistics.ensure_shipment_for_procurement_order(po)
    assert shipment is not None

    with pytest.raises(LogisticsError, match="tracking_number"):
        await logistics.transition_status(
            shipment,
            to_status=SHIPMENT_STATUS_DISPATCHED,
            actor_role="partner",
        )
