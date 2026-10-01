"""Platform architecture registry and procurement orders."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import models.logistics  # noqa: F401
import models.partners  # noqa: F401
import models.partner_platform  # noqa: F401
import models.procurement_orders  # noqa: F401
from core.database import Base
from models.procurement_orders import PO_STATUS_AWAITING_PARTNER, PO_STATUS_PROVISIONAL
from services.building_materials_validators import BUILDING_MATERIALS_JOURNEY_TYPE, assemble_procurement_invoice
from services.platform_architecture import PLATFORM_SECTOR_ARCHITECTURE, get_platform_architecture
from services.procurement_orders import ProcurementOrderService
from services.service_requests import ServiceRequestService


def test_platform_architecture_covers_16_sectors():
    data = get_platform_architecture()
    assert data["summary"]["sector_count"] == 16
    assert len(PLATFORM_SECTOR_ARCHITECTURE) == 16
    slugs = {s["sector_slug"] for s in PLATFORM_SECTOR_ARCHITECTURE}
    assert len(slugs) == 16
    assert data["summary"]["live_journey_count"] == 16


def test_building_materials_sector_has_procurement_order_service():
    bm = next(s for s in PLATFORM_SECTOR_ARCHITECTURE if s["sector_slug"] == "building-materials")
    assert "procurement_order" in bm["business_services"]
    assert "logistics" in bm["business_services"]
    assert "ProcurementOrder" in bm["business_objects"]
    assert "DeliveryShipment" in bm["business_objects"]


def test_equipment_sector_has_procurement_and_logistics():
    eq = next(s for s in PLATFORM_SECTOR_ARCHITECTURE if s["sector_slug"] == "equipment")
    assert "procurement_order" in eq["business_services"]
    assert "logistics" in eq["business_services"]


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
async def test_procurement_order_created_from_building_materials_snapshot(db_session: AsyncSession):
    from models.service_requests import ServiceRequest

    invoice = assemble_procurement_invoice(
        {
            "materials_list": "اسمنت 10\nرمل 5",
            "delivery_location": "الرياض",
            "requester_name": "Test",
            "requester_phone": "+966500000000",
        }
    )
    sr = ServiceRequest(
        user_id="user-1",
        journey_instance_id=1,
        journey_type=BUILDING_MATERIALS_JOURNEY_TYPE,
        request_type="building_materials",
        status="submitted",
        reference_code="SR-BM-TEST1",
        intake_snapshot={"procurement_invoice": invoice},
        partner_assignment_status="none",
    )
    db_session.add(sr)
    await db_session.flush()

    po_service = ProcurementOrderService(db_session)
    po = await po_service.create_for_service_request(sr)
    assert po is not None
    assert po.reference_code == "PO-SR-BM-TEST1"
    assert po.status == PO_STATUS_PROVISIONAL

    sr.partner_assignment_status = "pending_partner"
    sr.partner_org_id = 1
    await po_service.sync_partner_assignment(sr)
    await db_session.refresh(po)
    assert po.status == PO_STATUS_AWAITING_PARTNER


@pytest.mark.asyncio
async def test_partner_accept_creates_delivery_shipment(db_session: AsyncSession):
    from models.service_requests import ServiceRequest
    from models.procurement_orders import PO_STATUS_PARTNER_ACCEPTED
    from services.logistics import LogisticsService

    invoice = assemble_procurement_invoice(
        {
            "materials_list": "بلاط",
            "delivery_location": "جدة",
        }
    )
    sr = ServiceRequest(
        user_id="user-2",
        journey_instance_id=2,
        journey_type=BUILDING_MATERIALS_JOURNEY_TYPE,
        request_type="building_materials",
        status="submitted",
        reference_code="SR-BM-TEST2",
        intake_snapshot={"procurement_invoice": invoice},
        partner_assignment_status="accepted",
        partner_org_id=10,
    )
    db_session.add(sr)
    await db_session.flush()

    po_service = ProcurementOrderService(db_session)
    po = await po_service.create_for_service_request(sr)
    assert po is not None
    synced = await po_service.sync_partner_assignment(sr)
    assert synced is not None
    assert synced.status == PO_STATUS_PARTNER_ACCEPTED

    logistics = LogisticsService(db_session)
    shipment = await logistics.get_by_service_request_id(sr.id)
    assert shipment is not None
    assert shipment.reference_code == "SH-SR-BM-TEST2"
