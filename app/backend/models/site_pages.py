from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Site_pages(Base):
    __tablename__ = "site_pages"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    title = Column(String, nullable=False)
    path = Column(String, nullable=False)
    background_type = Column(String, nullable=True)
    background_value = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)