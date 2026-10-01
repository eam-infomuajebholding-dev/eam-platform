from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text

from core.database import Base

CONTRACT_TERMS_VERSION = "2026-10-01"


class CommercialContract(Base):
    __tablename__ = "commercial_contracts"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    service_request_id = Column(
        Integer, ForeignKey("service_requests.id"), nullable=False, unique=True, index=True
    )
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    reference_code = Column(String(32), nullable=False, unique=True, index=True)
    terms_version = Column(String(32), nullable=False, default=CONTRACT_TERMS_VERSION)
    customer_acknowledged = Column(Boolean, nullable=False, default=True, server_default="1")
    accepted_by_user_id = Column(String(255), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=False)
    summary_ar = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
