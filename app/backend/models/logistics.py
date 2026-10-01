"""Logistics layer — delivery shipments for procurement fulfillment."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from core.database import Base

SHIPMENT_STATUS_AWAITING_DISPATCH = "awaiting_dispatch"
SHIPMENT_STATUS_DISPATCHED = "dispatched"
SHIPMENT_STATUS_IN_TRANSIT = "in_transit"
SHIPMENT_STATUS_OUT_FOR_DELIVERY = "out_for_delivery"
SHIPMENT_STATUS_DELIVERED = "delivered"
SHIPMENT_STATUS_DELIVERY_FAILED = "delivery_failed"
SHIPMENT_STATUS_CANCELLED = "cancelled"

SHIPMENT_STATUSES = frozenset(
    {
        SHIPMENT_STATUS_AWAITING_DISPATCH,
        SHIPMENT_STATUS_DISPATCHED,
        SHIPMENT_STATUS_IN_TRANSIT,
        SHIPMENT_STATUS_OUT_FOR_DELIVERY,
        SHIPMENT_STATUS_DELIVERED,
        SHIPMENT_STATUS_DELIVERY_FAILED,
        SHIPMENT_STATUS_CANCELLED,
    }
)

# Allowed forward transitions (ops may override via explicit cancel)
SHIPMENT_TRANSITIONS: dict[str, frozenset[str]] = {
    SHIPMENT_STATUS_AWAITING_DISPATCH: frozenset(
        {SHIPMENT_STATUS_DISPATCHED, SHIPMENT_STATUS_CANCELLED}
    ),
    SHIPMENT_STATUS_DISPATCHED: frozenset(
        {SHIPMENT_STATUS_IN_TRANSIT, SHIPMENT_STATUS_OUT_FOR_DELIVERY, SHIPMENT_STATUS_DELIVERY_FAILED}
    ),
    SHIPMENT_STATUS_IN_TRANSIT: frozenset(
        {SHIPMENT_STATUS_OUT_FOR_DELIVERY, SHIPMENT_STATUS_DELIVERED, SHIPMENT_STATUS_DELIVERY_FAILED}
    ),
    SHIPMENT_STATUS_OUT_FOR_DELIVERY: frozenset(
        {SHIPMENT_STATUS_DELIVERED, SHIPMENT_STATUS_DELIVERY_FAILED}
    ),
    SHIPMENT_STATUS_DELIVERED: frozenset(),
    SHIPMENT_STATUS_DELIVERY_FAILED: frozenset({SHIPMENT_STATUS_DISPATCHED, SHIPMENT_STATUS_CANCELLED}),
    SHIPMENT_STATUS_CANCELLED: frozenset(),
}


class DeliveryShipment(Base):
    __tablename__ = "delivery_shipments"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    procurement_order_id = Column(
        Integer,
        ForeignKey("procurement_orders.id"),
        nullable=False,
        unique=True,
        index=True,
    )
    service_request_id = Column(Integer, ForeignKey("service_requests.id"), nullable=False, index=True)
    reference_code = Column(String(32), nullable=False, unique=True, index=True)
    status = Column(
        String(32),
        nullable=False,
        default=SHIPMENT_STATUS_AWAITING_DISPATCH,
        server_default=SHIPMENT_STATUS_AWAITING_DISPATCH,
    )
    delivery_address = Column(String(500), nullable=True)
    carrier_name = Column(String(120), nullable=True)
    tracking_number = Column(String(120), nullable=True)
    estimated_delivery_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    partner_org_id = Column(Integer, ForeignKey("partner_organizations.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    events = relationship("DeliveryShipmentEvent", back_populates="shipment", order_by="DeliveryShipmentEvent.created_at")


class DeliveryShipmentEvent(Base):
    __tablename__ = "delivery_shipment_events"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    shipment_id = Column(Integer, ForeignKey("delivery_shipments.id"), nullable=False, index=True)
    from_status = Column(String(32), nullable=False)
    to_status = Column(String(32), nullable=False)
    actor_role = Column(String(32), nullable=False)
    actor_user_id = Column(String(255), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)

    shipment = relationship("DeliveryShipment", back_populates="events")
