"""AI endpoint authorization — reuse production JWT auth, no second AI auth system."""

from dependencies.auth import get_current_user as require_authenticated_user

__all__ = ["require_authenticated_user"]
