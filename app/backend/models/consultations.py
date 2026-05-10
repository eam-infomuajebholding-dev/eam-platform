from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Consultations(Base):
    __tablename__ = "consultations"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    consultation_type = Column(String, nullable=True)
    message = Column(String, nullable=False)
    status = Column(String, nullable=True, default='pending', server_default='pending')
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)