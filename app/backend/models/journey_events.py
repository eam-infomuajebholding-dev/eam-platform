from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.types import JSON

from core.database import Base


class JourneyEvent(Base):
    __tablename__ = "journey_events"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    journey_instance_id = Column(Integer, ForeignKey("journey_instances.id"), nullable=False, index=True)
    event_type = Column(String(64), nullable=False, index=True)
    from_step = Column(String(128), nullable=True)
    to_step = Column(String(128), nullable=True)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
