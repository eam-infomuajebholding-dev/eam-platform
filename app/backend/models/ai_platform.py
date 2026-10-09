"""Persistent AI conversation, handoff, usage, and rate-limit rows."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from core.database import Base


class AIConversation(Base):
    __tablename__ = "ai_conversations"
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True)
    actor_key = Column(String(320), nullable=False, index=True)
    surface = Column(String(32), nullable=False, default="home")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class AIConversationMessage(Base):
    __tablename__ = "ai_conversation_messages"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String(36), nullable=False, index=True)
    role = Column(String(16), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class AIHandoff(Base):
    __tablename__ = "ai_handoffs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    trace_id = Column(String(64), nullable=False, index=True)
    actor_key = Column(String(320), nullable=True, index=True)
    reason = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    journey_instance_id = Column(Integer, nullable=True)
    service_request_id = Column(Integer, nullable=True)
    status = Column(String(32), nullable=False, default="queued")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class AIUsageEvent(Base):
    __tablename__ = "ai_usage_events"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_key = Column(String(320), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class AITokenUsage(Base):
    __tablename__ = "ai_token_usage"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    model = Column(String(64), nullable=False)
    prompt_tokens = Column(Integer, nullable=False, default=0)
    completion_tokens = Column(Integer, nullable=False, default=0)
    total_tokens = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
