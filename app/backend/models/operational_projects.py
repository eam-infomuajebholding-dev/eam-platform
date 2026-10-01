from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from core.database import Base

OP_STATUS_PLANNED = "planned"
OP_STATUS_ACTIVE = "active"
OP_STATUS_CLOSED = "closed"


class OperationalProject(Base):
    __tablename__ = "operational_projects"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    service_request_id = Column(
        Integer, ForeignKey("service_requests.id"), nullable=False, unique=True, index=True
    )
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=True, index=True)
    reference_code = Column(String(32), nullable=False, unique=True, index=True)
    status = Column(String(32), nullable=False, default=OP_STATUS_PLANNED, server_default=OP_STATUS_PLANNED)
    title_ar = Column(String(255), nullable=True)
    internal_note = Column(Text, nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    service_request = relationship("ServiceRequest", backref="operational_project", uselist=False)
