"""Open copilot deny-list policy."""

from services.ai.platform_assistant_policy import (
    PLATFORM_ASSISTANT_DENY_RULES,
    format_open_copilot_system_prompt,
)


def test_deny_rules_are_documented():
    assert len(PLATFORM_ASSISTANT_DENY_RULES) >= 5
    prompt = format_open_copilot_system_prompt()
    assert "قائمة المحظورات" in prompt
    for rule in PLATFORM_ASSISTANT_DENY_RULES:
        assert rule in prompt
