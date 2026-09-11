"""Deterministic intent golden set for CI eval metrics (WO-006 STREAM F)."""

from __future__ import annotations

from dataclasses import dataclass

from services.ai_core_intents import (
    BUILD_VILLA_JOURNEY_TYPE,
    CONTRACTING_JOURNEY_TYPE,
    ENGINEERING_CONSULTING_JOURNEY_TYPE,
    REAL_ESTATE_VALUATION_JOURNEY_TYPE,
    REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
    FACILITY_MANAGEMENT_JOURNEY_TYPE,
    GOVERNMENT_SERVICES_JOURNEY_TYPE,
    FURNISHING_JOURNEY_TYPE,
    PROJECT_MANAGEMENT_JOURNEY_TYPE,
    SMART_MAINTENANCE_JOURNEY_TYPE,
)

EXPECTED_START = "start_journey"
EXPECTED_CLARIFY = "clarify"
EXPECTED_NONE = "none"


@dataclass(frozen=True)
class IntentGoldenCase:
    message: str
    expected: str
    expected_journey: str | None = None


BUILD_VILLA_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أريد بناء فيلا", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("أبي أبني بيت", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("عندي أرض وأبي أبني", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("ودي أبدأ تصميم فيلا", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("احتاج أبني منزل", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("ابي اسوي بيت جديد", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("build villa", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("new house design", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("أبني منزلًا", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("أريد بناء فيلا في الرياض", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("ابغى ابني بيت", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("ودي أبني منزل", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("احتاج تصميم بيت جديد", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("أبي أبدأ مشروع فيلا", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
    IntentGoldenCase("new villa project", EXPECTED_START, BUILD_VILLA_JOURNEY_TYPE),
)

ENGINEERING_CONSULTING_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أحتاج استشارة هندسية", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("ابي مهندس يشوف المشكلة", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("عندي تشققات بالمبنى", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("احتاج مهندس إنشائي", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("عندي cracks بالجدار", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("مشكلة هندسية", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("engineering consultation", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("structural issue", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("عندي مشروع إنشائي ومحتاج مراجعة", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("عندي تشققات", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("عندي مشكلة انشائية", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("احتاج مهندس كهربائي", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("structural problem", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("cracks in wall", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
    IntentGoldenCase("ابي مهندس انشائي", EXPECTED_START, ENGINEERING_CONSULTING_JOURNEY_TYPE),
)

VALUATION_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أريد تقييم عقار", EXPECTED_START, REAL_ESTATE_VALUATION_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج تقييم أرض", EXPECTED_START, REAL_ESTATE_VALUATION_JOURNEY_TYPE),
    IntentGoldenCase("ابغى valuation للفيلا", EXPECTED_START, REAL_ESTATE_VALUATION_JOURNEY_TYPE),
    IntentGoldenCase("property valuation", EXPECTED_START, REAL_ESTATE_VALUATION_JOURNEY_TYPE),
    IntentGoldenCase("تقييم عقاري", EXPECTED_START, REAL_ESTATE_VALUATION_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج تقييم رسمي للعقار", EXPECTED_START, REAL_ESTATE_VALUATION_JOURNEY_TYPE),
)

FURNISHING_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أريد تأثيث المنزل", EXPECTED_START, FURNISHING_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج تجهيز مكتب", EXPECTED_START, FURNISHING_JOURNEY_TYPE),
    IntentGoldenCase("أريد أثث الفيلا", EXPECTED_START, FURNISHING_JOURNEY_TYPE),
    IntentGoldenCase("furnish my home", EXPECTED_START, FURNISHING_JOURNEY_TYPE),
    IntentGoldenCase("office furnishing", EXPECTED_START, FURNISHING_JOURNEY_TYPE),
)

REAL_ESTATE_DEVELOPMENT_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أريد تطوير مشروع عقاري", EXPECTED_START, REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE),
    IntentGoldenCase(
        "لدي أرض وأريد معرفة أفضل مسار لتطويرها",
        EXPECTED_START,
        REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
    ),
    IntentGoldenCase("I want to develop a property", EXPECTED_START, REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE),
    IntentGoldenCase("property development", EXPECTED_START, REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE),
    IntentGoldenCase("development opportunity", EXPECTED_START, REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE),
    IntentGoldenCase("مسار تطوير", EXPECTED_START, REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE),
)

GOVERNMENT_SERVICES_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("خدمات حكومية", EXPECTED_START, GOVERNMENT_SERVICES_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج رخصة بناء", EXPECTED_START, GOVERNMENT_SERVICES_JOURNEY_TYPE),
    IntentGoldenCase("building permit", EXPECTED_START, GOVERNMENT_SERVICES_JOURNEY_TYPE),
    IntentGoldenCase("أريد شهادة إشغال", EXPECTED_START, GOVERNMENT_SERVICES_JOURNEY_TYPE),
    IntentGoldenCase("فرز عقاري", EXPECTED_START, GOVERNMENT_SERVICES_JOURNEY_TYPE),
)

FACILITY_MANAGEMENT_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أريد إدارة مرافق", EXPECTED_START, FACILITY_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج إدارة مرافق", EXPECTED_START, FACILITY_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("facility management", EXPECTED_START, FACILITY_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("manage my facility", EXPECTED_START, FACILITY_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("تشغيل مرافق", EXPECTED_START, FACILITY_MANAGEMENT_JOURNEY_TYPE),
)

PROJECT_MANAGEMENT_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أحتاج إدارة مشروع", EXPECTED_START, PROJECT_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("أريد تنظيم المشروع", EXPECTED_START, PROJECT_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("مشروعي متعثر", EXPECTED_START, PROJECT_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج مدير مشروع", EXPECTED_START, PROJECT_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("project management", EXPECTED_START, PROJECT_MANAGEMENT_JOURNEY_TYPE),
    IntentGoldenCase("manage my project", EXPECTED_START, PROJECT_MANAGEMENT_JOURNEY_TYPE),
)

MAINTENANCE_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أحتاج صيانة مكيف", EXPECTED_START, SMART_MAINTENANCE_JOURNEY_TYPE),
    IntentGoldenCase("صيانة مكيف", EXPECTED_START, SMART_MAINTENANCE_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج صيانة مبنى", EXPECTED_START, SMART_MAINTENANCE_JOURNEY_TYPE),
    IntentGoldenCase("عطل تكييف مركزي", EXPECTED_START, SMART_MAINTENANCE_JOURNEY_TYPE),
    IntentGoldenCase("smart maintenance", EXPECTED_START, SMART_MAINTENANCE_JOURNEY_TYPE),
    IntentGoldenCase("HVAC maintenance", EXPECTED_START, SMART_MAINTENANCE_JOURNEY_TYPE),
)

CONTRACTING_POSITIVE: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أحتاج مقاول", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("أبي مقاول", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج تنفيذ المشروع", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("عندي مخططات وأحتاج مقاول", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج عروض مقاولين", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج مقاول بناء", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("المشروع جاهز للتنفيذ", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("عندي BOQ وأبي مقاول", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("أحتاج تسعير تنفيذ", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("أبي أبدأ أعمال البناء", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("construction contractor", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
    IntentGoldenCase("contracting", EXPECTED_START, CONTRACTING_JOURNEY_TYPE),
)

AMBIGUOUS_CASES: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("عندي مشروع", EXPECTED_CLARIFY),
    IntentGoldenCase("أحتاج تنفيذ", EXPECTED_CLARIFY),
    IntentGoldenCase("أحتاج شركة", EXPECTED_CLARIFY),
    IntentGoldenCase("أحتاج مساعدة", EXPECTED_NONE),
    IntentGoldenCase("عندي أرض", EXPECTED_NONE),
    IntentGoldenCase("عندي مشكلة بالمبنى", EXPECTED_NONE),
    IntentGoldenCase("أحتاج مهندس", EXPECTED_NONE),
    IntentGoldenCase("احتاج مساعدة", EXPECTED_NONE),
    IntentGoldenCase("عندي مشكلة", EXPECTED_NONE),
    IntentGoldenCase("مرحبا", EXPECTED_NONE),
    IntentGoldenCase("ما هي خدماتكم؟", EXPECTED_NONE),
)

COMMERCIAL_CASES: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أرسلت طلبي وش صار عليه", EXPECTED_NONE),
    IntentGoldenCase("احتاج أكلم مهندس", EXPECTED_NONE),
    IntentGoldenCase("وش ناقص في طلبي", EXPECTED_NONE),
    IntentGoldenCase("أبي أكمل الطلب", EXPECTED_NONE),
    IntentGoldenCase("أبغى أعرف حالة طلبي", EXPECTED_NONE),
)

NEGATIVE_CASES: tuple[IntentGoldenCase, ...] = (
    IntentGoldenCase("أريد التقديم على وظيفة", EXPECTED_NONE),
    IntentGoldenCase("هل لديكم فرص استثمار؟", EXPECTED_NONE),
    IntentGoldenCase("أريد شراء مواد بناء", EXPECTED_NONE),
    IntentGoldenCase("كيف أتواصل معكم؟", EXPECTED_NONE),
    IntentGoldenCase("أبحث عن مورد معدات", EXPECTED_NONE),
    IntentGoldenCase("طلب توظيف", EXPECTED_NONE),
)

GOLDEN_SET: tuple[IntentGoldenCase, ...] = (
    *BUILD_VILLA_POSITIVE,
    *ENGINEERING_CONSULTING_POSITIVE,
    *CONTRACTING_POSITIVE,
    *VALUATION_POSITIVE,
    *MAINTENANCE_POSITIVE,
    *PROJECT_MANAGEMENT_POSITIVE,
    *FURNISHING_POSITIVE,
    *FACILITY_MANAGEMENT_POSITIVE,
    *REAL_ESTATE_DEVELOPMENT_POSITIVE,
    *GOVERNMENT_SERVICES_POSITIVE,
    *AMBIGUOUS_CASES,
    *COMMERCIAL_CASES,
    *NEGATIVE_CASES,
)

UNSUPPORTED_JOURNEY_TYPES = frozenset(
    {
        "investment",
        "marketplace",
        "materials",
    }
)
