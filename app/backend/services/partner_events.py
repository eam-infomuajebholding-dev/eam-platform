"""Shared partner event payloads."""

from __future__ import annotations

from typing import Any

from models.service_requests import ServiceRequest


def delivery_shipment_payload(shipment: Any) -> dict[str, Any]:
    return {
        "shipment_id": shipment.id,
        "reference_code": shipment.reference_code,
        "service_request_id": shipment.service_request_id,
        "procurement_order_id": shipment.procurement_order_id,
        "status": shipment.status,
        "tracking_number": shipment.tracking_number,
        "carrier_name": shipment.carrier_name,
        "delivery_address": shipment.delivery_address,
    }


def service_request_partner_payload(sr: ServiceRequest) -> dict[str, Any]:
    return {
        "service_request_id": sr.id,
        "reference_code": sr.reference_code,
        "journey_type": sr.journey_type,
        "status": sr.status,
        "partner_assignment_status": sr.partner_assignment_status,
        "source_channel": sr.source_channel,
        "created_at": sr.created_at.isoformat() if sr.created_at else None,
    }
