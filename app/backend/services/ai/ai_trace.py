"""Minimal structured AI trace logging."""

from __future__ import annotations

import logging
import time
from contextlib import contextmanager
from dataclasses import dataclass, field

logger = logging.getLogger("eam.ai.trace")


@dataclass
class AITraceContext:
    trace_id: str
    capability: str
    started_at: float = field(default_factory=time.perf_counter)
    intent: str | None = None
    confidence: float | None = None
    model_class: str | None = None
    fallback: bool = False
    structured_output_valid: bool | None = None
    error_code: str | None = None

    def finish(self, **extra: object) -> None:
        latency_ms = int((time.perf_counter() - self.started_at) * 1000)
        logger.info(
            "ai_trace trace_id=%s capability=%s intent=%s confidence=%s model_class=%s "
            "latency_ms=%s fallback=%s structured_valid=%s error=%s extra=%s",
            self.trace_id,
            self.capability,
            self.intent,
            self.confidence,
            self.model_class,
            latency_ms,
            self.fallback,
            self.structured_output_valid,
            self.error_code,
            extra,
        )


@contextmanager
def ai_trace(trace_id: str, capability: str):
    ctx = AITraceContext(trace_id=trace_id, capability=capability)
    try:
        yield ctx
    finally:
        ctx.finish()
