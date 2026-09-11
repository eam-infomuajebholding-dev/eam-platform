"""Deterministic Command Center search — no speculative entity registry."""

from __future__ import annotations

import re

from schemas.operations_dashboard import CommandSearchResponse, CommandSearchResult
from services.command_center_metrics import METRIC_CATALOG

JOURNEY_NAV = [
    ("build_villa", "بناء الفيلا", "/journeys/build-villa"),
    ("real_estate_valuation", "تقييم عقاري", "/journeys/real-estate-valuation"),
    ("project_management", "إدارة المشاريع", "/journeys/project-management"),
    ("engineering_consulting", "استشارات هندسية", "/journeys/engineering-consulting"),
    ("contracting", "المقاولات", "/journeys/contracting"),
    ("smart_maintenance", "الصيانة الذكية", "/journeys/smart-maintenance"),
    ("facility_management", "إدارة المرافق", "/journeys/facility-management"),
    ("furnishing", "التأثيث", "/journeys/furnishing"),
    ("government_services", "الخدمات الحكومية", "/journeys/government-services"),
    ("real_estate_development", "التطوير العقاري", "/journeys/real-estate-development"),
    ("real_estate_marketing", "التسويق العقاري", "/journeys/real-estate-marketing"),
]

VIEW_NAV = [
    ("command_center", "لوحة القيادة", "/command-center"),
    ("service_requests", "المراجعة المهنية", "/operations/service-requests"),
    ("risks", "مركز المخاطر", "/command-center#risks"),
]

PATTERNS: list[tuple[re.Pattern[str], str, CommandSearchResult]] = []


def _build_patterns() -> list[tuple[re.Pattern[str], str, CommandSearchResult]]:
    out: list[tuple[re.Pattern[str], str, CommandSearchResult]] = []
    for jtype, label, path in JOURNEY_NAV:
        out.append(
            (
                re.compile(rf"(?:{re.escape(label)}|{re.escape(jtype.replace('_', ' '))})", re.I),
                "journey",
                CommandSearchResult(
                    result_type="JOURNEY",
                    id=jtype,
                    label_ar=label,
                    navigation_path=path,
                ),
            )
        )
    out.append(
        (
            re.compile(r"(?:لوحة\s*القيادة|command\s*center|مركز\s*القيادة)", re.I),
            "view",
            CommandSearchResult(
                result_type="COMMAND_CENTER_VIEW",
                id="command_center",
                label_ar="لوحة القيادة",
                navigation_path="/command-center",
            ),
        )
    )
    out.append(
        (
            re.compile(r"(?:طلبات?\s*(?:ال)?مؤهلة|qualified)", re.I),
            "sr",
            CommandSearchResult(
                result_type="SERVICE_REQUEST",
                id="qualified",
                label_ar="الطلبات المؤهلة",
                navigation_path="/operations/service-requests?status=qualified",
            ),
        )
    )
    out.append(
        (
            re.compile(r"(?:مخاطر|risks?)", re.I),
            "risk",
            CommandSearchResult(
                result_type="RISK",
                id="open_risks",
                label_ar="المخاطر المفتوحة",
                navigation_path="/command-center#risks",
            ),
        )
    )
    out.append(
        (
            re.compile(r"(?:OIDC|تسجيل\s*الدخول\s*الخارجي)", re.I),
            "capability",
            CommandSearchResult(
                result_type="CAPABILITY",
                id="oidc",
                label_ar="حالة OIDC",
                description_ar="BLOCKED_EXTERNAL — قبول مصادق خارجي",
                truth_state="BLOCKED",
            ),
        )
    )
    out.append(
        (
            re.compile(r"(?:قرار|decision|يحتاج\s*قرار)", re.I),
            "decision",
            CommandSearchResult(
                result_type="DECISION_ITEM",
                id="decisions",
                label_ar="ما يحتاج قرارك",
                navigation_path="/command-center#leadership",
            ),
        )
    )
    out.append(
        (
            re.compile(r"(?:تغير|what\s*changed|هذا\s*الأسبوع)", re.I),
            "view",
            CommandSearchResult(
                result_type="COMMAND_CENTER_VIEW",
                id="what_changed",
                label_ar="ما الذي تغير",
                navigation_path="/command-center#leadership",
            ),
        )
    )
    for metric_id, definition in METRIC_CATALOG.items():
        out.append(
            (
                re.compile(re.escape(definition.label_ar), re.I),
                "metric",
                CommandSearchResult(
                    result_type="METRIC",
                    id=metric_id,
                    label_ar=definition.label_ar,
                    description_ar=definition.description_ar,
                ),
            )
        )
    return out


def search_command_center(query: str) -> CommandSearchResponse:
    normalized = (query or "").strip()
    if not normalized:
        return CommandSearchResponse(query=normalized, limitations=["أدخل استعلاماً للبحث"])

    patterns = PATTERNS or _build_patterns()
    seen: set[str] = set()
    results: list[CommandSearchResult] = []

    for pattern, _kind, result in patterns:
        if pattern.search(normalized) and result.id not in seen:
            seen.add(result.id)
            results.append(result)

    sr_match = re.search(r"(?:PM|BV|EC|CT|RV|SM|FR|FM|GS)-[\w-]+", normalized, re.I)
    if sr_match:
        ref = sr_match.group(0).upper()
        results.insert(
            0,
            CommandSearchResult(
                result_type="SERVICE_REQUEST",
                id=ref,
                label_ar=f"طلب {ref}",
                navigation_path=f"/operations/service-requests?search={ref}",
            ),
        )

    mode = "ASK" if normalized.endswith("?") or normalized.startswith("ما") else "SEARCH"
    limitations: list[str] = []
    if not results:
        limitations.append("لم يُعثر على نتائج حتمية — جرّب AI ASK عبر executive-brief?question=")

    return CommandSearchResponse(query=normalized, mode=mode, results=results, limitations=limitations)
