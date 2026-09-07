from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.types import JSON

from core.database import Base


class ServiceRequest(Base):
    __tablename__ = "service_requests"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String(255), nullable=False, index=True)
    journey_instance_id = Column(
        Integer,
        ForeignKey("journey_instances.id"),
        nullable=False,
        unique=True,
        index=True,
    )
    journey_type = Column(String(64), nullable=False, index=True)
    request_type = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False, default="submitted", server_default="submitted")
    reference_code = Column(String(32), nullable=False, unique=True, index=True)
    intake_snapshot = Column(JSON, nullable=False)
    source_channel = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
