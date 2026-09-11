from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.types import JSON

from core.database import Base


class ServiceRequestStatusTransition(Base):
    __tablename__ = "service_request_status_transitions"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    service_request_id = Column(
        Integer,
        ForeignKey("service_requests.id"),
        nullable=False,
        index=True,
    )
    from_status = Column(String(32), nullable=False)
    to_status = Column(String(32), nullable=False)
    actor_user_id = Column(String(255), nullable=False)
    actor_role = Column(String(32), nullable=False, default="admin")
    reason = Column(Text, nullable=True)
    customer_message = Column(Text, nullable=True)
    internal_note = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
