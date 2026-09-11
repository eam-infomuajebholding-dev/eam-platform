"""Shared CMS entity mutation authorization boundary.

Apply to POST/PUT/PATCH/DELETE on CMS entity routers. Public lead-intake
single-create endpoints (contact_messages, consultations) remain open by design.
"""

from dependencies.auth import get_admin_user as require_cms_admin_write

__all__ = ["require_cms_admin_write"]
