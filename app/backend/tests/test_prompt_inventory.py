"""Prompt inventory classification (WO-007 §48)."""

from __future__ import annotations

from services.ai.prompt_registry import PROMPT_REGISTRY


def test_active_prompts_are_registered():
    assert "faq.system" in PROMPT_REGISTRY
    assert "intent.classifier" in PROMPT_REGISTRY


def test_registered_prompts_have_required_metadata():
    for prompt_id, prompt in PROMPT_REGISTRY.items():
        assert prompt.prompt_id == prompt_id
        assert prompt.purpose
        assert prompt.owner
        assert prompt.version
        assert prompt.content.strip()
