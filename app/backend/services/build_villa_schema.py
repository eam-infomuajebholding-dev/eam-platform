"""Canonical Build Villa discovery schema constants (single source)."""

from __future__ import annotations

BUILD_VILLA_STEP_ORDER = [
    "project_intent",
    "city",
    "land_ownership",
    "land_area",
    "household_needs",
    "space_program",
    "budget_context",
    "timeline_context",
    "design_direction",
    "documents_context",
    "desired_service",
    "summary_review",
    "brief_review",
    "scope_confirm",
    "submit_confirm",
    "intake_complete",
]

BRIEF_REVIEW_STEP = "brief_review"
TERMINAL_STEP = "intake_complete"
REVISIT_BLOCKED_FROM = frozenset({"brief_review", "scope_confirm", "submit_confirm", "intake_complete"})

LAND_OWNERSHIP_TYPES = frozenset({"owned", "leased", "planning_to_acquire", "other"})
DESIRED_SERVICES = frozenset({"design_only", "supervision", "execution", "full_service"})
BUDGET_RANGES = frozenset(
    {"under_1m", "1m_2m", "2m_5m", "5m_10m", "over_10m", "prefer_not_say"}
)
DESIRED_START_OPTIONS = frozenset(
    {"asap", "within_3_months", "within_6_months", "within_1_year", "flexible"}
)
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})
DESIGN_STYLES = frozenset(
    {"modern", "contemporary", "classic", "minimal", "traditional_local", "unsure", "need_help"}
)
SPACE_OPTIONS = frozenset(
    {
        "guest_majlis",
        "family_living",
        "dining",
        "kitchen",
        "office",
        "parking",
        "garden",
        "roof",
        "service_rooms",
        "special",
    }
)

LAND_OWNERSHIP_LABELS = {
    "owned": "أملك الأرض",
    "leased": "الأرض مؤجرة",
    "planning_to_acquire": "أخطط للشراء",
    "other": "أخرى",
}

DESIRED_SERVICE_LABELS = {
    "design_only": "تصميم فقط",
    "supervision": "إشراف",
    "execution": "تنفيذ",
    "full_service": "خدمة متكاملة",
}

BUDGET_RANGE_LABELS = {
    "under_1m": "أقل من 1 مليون",
    "1m_2m": "1 – 2 مليون",
    "2m_5m": "2 – 5 مليون",
    "5m_10m": "5 – 10 مليون",
    "over_10m": "أكثر من 10 مليون",
    "prefer_not_say": "أفضل عدم التحديد الآن",
}

DESIRED_START_LABELS = {
    "asap": "في أقرب وقت",
    "within_3_months": "خلال 3 أشهر",
    "within_6_months": "خلال 6 أشهر",
    "within_1_year": "خلال سنة",
    "flexible": "مرن",
}

DESIGN_STYLE_LABELS = {
    "modern": "حديث",
    "contemporary": "معاصر",
    "classic": "كلاسيكي",
    "minimal": "Minimal",
    "traditional_local": "تقليدي/محلي",
    "unsure": "غير متأكد",
    "need_help": "أحتاج مساعدة في الاختيار",
}

SPACE_OPTION_LABELS = {
    "guest_majlis": "مجلس ضيوف",
    "family_living": "صالة عائلية",
    "dining": "غرفة طعام",
    "kitchen": "مطبخ",
    "office": "مكتب",
    "parking": "مواقف",
    "garden": "حديقة",
    "roof": "استخدام السطح",
    "service_rooms": "غرف خدم",
    "special": "مساحات خاصة",
}

BRIEF_DISCLAIMER = (
    "هذا ملخص أولي لأغراض فهم المشروع وتجهيز نطاق الخدمة، "
    "وليس تصميمًا معماريًا أو تقريرًا هندسيًا أو عرضًا تعاقديًا نهائيًا."
)
