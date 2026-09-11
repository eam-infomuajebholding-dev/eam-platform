"""Hybrid intent routing: deterministic rules before model classification."""

from __future__ import annotations

import re

from schemas.ai_intent import IntentDecision
from services.ai.prompt_registry import INTENT_CLASSIFIER
from services.ai_core_intents import (
    BUILD_VILLA_JOURNEY_TYPE,
    BUILD_VILLA_QUICK_ACTION_LABEL,
    CONTRACTING_JOURNEY_TYPE,
    ENGINEERING_CONSULTING_JOURNEY_TYPE,
    ENGINEERING_CONSULTING_LABEL,
    REAL_ESTATE_VALUATION_JOURNEY_TYPE,
    FACILITY_MANAGEMENT_JOURNEY_TYPE,
    GOVERNMENT_SERVICES_JOURNEY_TYPE,
    REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
    REAL_ESTATE_MARKETING_JOURNEY_TYPE,
    BUILDING_MATERIALS_JOURNEY_TYPE,
    EQUIPMENT_JOURNEY_TYPE,
    FURNISHING_JOURNEY_TYPE,
    PROJECT_MANAGEMENT_JOURNEY_TYPE,
    SMART_MAINTENANCE_JOURNEY_TYPE,
    classify_build_villa_deterministic,
    resolve_intent_hint,
)

BUILD_VILLA_START_MESSAGE = (
    "رائع! سأساعدك في بدء رحلة جمع معلومات بناء الفيلا. "
    "لنبدأ خطوة بخطوة — أولاً أخبرني عن المدينة."
)

ENGINEERING_CONSULTING_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة الاستشارة الهندسية. "
    "صف المشكلة أو الاستشارة المطلوبة في الخطوة الأولى."
)

CONTRACTING_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة جاهزية المقاولات. "
    "صف مشروعك ومتطلبات التنفيذ في الخطوة الأولى."
)

VALUATION_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة جاهزية التقييم العقاري. "
    "حدّد غرض التقييم في الخطوة الأولى."
)

SMART_MAINTENANCE_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة جاهزية الصيانة الذكية. "
    "حدّد نوع الصيانة المطلوبة في الخطوة الأولى."
)

PROJECT_MANAGEMENT_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة جاهزية إدارة المشروع. "
    "حدّد نوع المشروع في الخطوة الأولى."
)

FACILITY_MANAGEMENT_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة جاهزية إدارة المرافق. "
    "حدّد نوع المنشأة في الخطوة الأولى."
)

GOVERNMENT_SERVICES_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة الخدمات الحكومية. "
    "حدّد نوع الخدمة المطلوبة في الخطوة الأولى — الخارطة الأولية ليست استنتاجاً نظامياً."
)

REAL_ESTATE_DEVELOPMENT_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة التطوير العقاري. "
    "حدّد سياق الأصل في الخطوة الأولى — اللقطة الأولية ليست دراسة جدوى أو تقييماً."
)

REAL_ESTATE_MARKETING_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة التسويق العقاري. "
    "حدّد هدف التسويق في الخطوة الأولى — الموجز الأولي ليس خطة حملة ولا تقدير leads/ROI."
)

BUILDING_MATERIALS_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة مواد البناء. "
    "حدّد هدف التوريد في الخطوة الأولى — الموجز الأولي ليس عرض سعر ولا التزام توريد."
)

BUILDING_MATERIALS_PHRASE_PATTERNS = (
    re.compile(r"مواد\s+بناء", re.IGNORECASE),
    re.compile(r"building\s+materials?", re.IGNORECASE),
    re.compile(r"أ?ريد\s+شراء\s+مواد", re.IGNORECASE),
    re.compile(r"توريد\s+مواد", re.IGNORECASE),
    re.compile(r"procurement\s+materials?", re.IGNORECASE),
)

EQUIPMENT_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة المعدات والآلات. "
    "حدّد حاجتك في الخطوة الأولى — الموجز الأولي ليس عرض سعر ولا جدول تسليم."
)

EQUIPMENT_PHRASE_PATTERNS = (
    re.compile(r"معدات\s+(?:و|/)?\s*آلات", re.IGNORECASE),
    re.compile(r"equipment\s+(?:rental|hire|need)", re.IGNORECASE),
    re.compile(r"أ?بحث\s+ع(?:ن|ن)\s+(?:مورد\s+)?معدات", re.IGNORECASE),
    re.compile(r"أ?ريد\s+است(?:ئ|ا)جار\s+معدات", re.IGNORECASE),
    re.compile(r"heavy\s+machinery", re.IGNORECASE),
    re.compile(r"معدات\s+ ثقيلة", re.IGNORECASE),
)

REAL_ESTATE_MARKETING_PHRASE_PATTERNS = (
    re.compile(r"تسويق\s+عقاري", re.IGNORECASE),
    re.compile(r"real\s+estate\s+marketing", re.IGNORECASE),
    re.compile(r"property\s+marketing", re.IGNORECASE),
    re.compile(r"marketing\s+(?:plan|strategy|readiness)", re.IGNORECASE),
    re.compile(r"أ?ريد\s+تسويق\s+(?:عقار(?:ي)?|مشروع|شقة|فيلا)", re.IGNORECASE),
    re.compile(r"تسويق\s+عقار(?:ي)?", re.IGNORECASE),
    re.compile(r"بيع\s+عقار|sell\s+(?:my\s+)?property", re.IGNORECASE),
    re.compile(r"launch\s+(?:marketing|campaign)", re.IGNORECASE),
)

REAL_ESTATE_DEVELOPMENT_PHRASE_PATTERNS = (
    re.compile(r"تطوير\s+عقاري", re.IGNORECASE),
    re.compile(r"real\s+estate\s+development", re.IGNORECASE),
    re.compile(r"property\s+development", re.IGNORECASE),
    re.compile(r"development\s+opportunity", re.IGNORECASE),
    re.compile(r"أ?ريد\s+تطوير\s+(?:مشروع|عقار|أ?رض)", re.IGNORECASE),
    re.compile(r"لدي\s+أ?رض.{0,40}(?:تطوير|development|مسار)", re.IGNORECASE),
    re.compile(r"مسار\s+تطوير", re.IGNORECASE),
    re.compile(r"فرصة\s+تطوير", re.IGNORECASE),
    re.compile(r"develop\s+(?:(?:my|a)\s+)?(?:property|land|site)", re.IGNORECASE),
    re.compile(r"i\s+want\s+to\s+develop", re.IGNORECASE),
)

GOVERNMENT_SERVICES_PHRASE_PATTERNS = (
    re.compile(r"خدم(?:ات|ة)\s+حكوم", re.IGNORECASE),
    re.compile(r"رخص(?:ة|ه)\s+بناء", re.IGNORECASE),
    re.compile(r"building\s+permit", re.IGNORECASE),
    re.compile(r"government\s+service", re.IGNORECASE),
    re.compile(r"ص(?:ك|كوك)", re.IGNORECASE),
    re.compile(r"شهادة\s+إ?شغال", re.IGNORECASE),
    re.compile(r"فرز\s+عقاري", re.IGNORECASE),
)

FACILITY_MANAGEMENT_PHRASE_PATTERNS = (
    re.compile(r"إ?دارة\s+مرافق", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+إ?دارة\s+مرافق", re.IGNORECASE),
    re.compile(r"أ?ريد\s+إ?دارة\s+مرافق", re.IGNORECASE),
    re.compile(r"facility\s+management", re.IGNORECASE),
    re.compile(r"manage\s+(?:my\s+)?facilit(?:y|ies)", re.IGNORECASE),
    re.compile(r"operations\s+(?:for|of)\s+(?:building|facility)", re.IGNORECASE),
    re.compile(r"تشغيل\s+مرافق", re.IGNORECASE),
)

FURNISHING_START_MESSAGE = (
    "حسناً! سأساعدك في بدء رحلة جاهزية التأثيث والتجهيز. "
    "حدّد نوع المساحة في الخطوة الأولى."
)

FURNISHING_PHRASE_PATTERNS = (
    re.compile(r"أ?ريد\s+ت(?:أ|ا)ثيث", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+ت(?:أ|ا)ثيث", re.IGNORECASE),
    re.compile(r"أ?بي\s+أ?ث(?:ّ|)ث", re.IGNORECASE),
    re.compile(r"ت(?:أ|ا)ثيث\s+(?:ال)?(?:منزل|فيلا|مكتب|شقة)", re.IGNORECASE),
    re.compile(r"تجهيز\s+(?:ال)?(?:منزل|مكتب|فيلا|شقة)", re.IGNORECASE),
    re.compile(r"interior\s+furnishing", re.IGNORECASE),
    re.compile(r"furnish\s+my\s+(?:home|office|villa)", re.IGNORECASE),
    re.compile(r"office\s+furnishing", re.IGNORECASE),
    re.compile(r"أ?ثاث\s+(?:ال)?(?:منزل|مكتب)", re.IGNORECASE),
)

PROJECT_MANAGEMENT_PHRASE_PATTERNS = (
    re.compile(r"أ?حتاج\s+إ?دارة\s+مشروع", re.IGNORECASE),
    re.compile(r"أ?ريد\s+تنظيم\s+المشروع", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+مدير\s+مشروع", re.IGNORECASE),
    re.compile(r"مشروع(?:ي)?\s+متعثر", re.IGNORECASE),
    re.compile(r"المشروع\s+متأخر", re.IGNORECASE),
    re.compile(r"project\s+management", re.IGNORECASE),
    re.compile(r"manage\s+my\s+project", re.IGNORECASE),
    re.compile(r"project\s+is\s+delayed", re.IGNORECASE),
    re.compile(r"إ?دارة\s+مشروع", re.IGNORECASE),
)

MAINTENANCE_PHRASE_PATTERNS = (
    re.compile(r"صيانة\s+مكيف", re.IGNORECASE),
    re.compile(r"صيانة\s+تكييف", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+صيانة", re.IGNORECASE),
    re.compile(r"أ?بي\s+صيانة", re.IGNORECASE),
    re.compile(r"تصليح\s+مكيف", re.IGNORECASE),
    re.compile(r"عطل\s+تكييف", re.IGNORECASE),
    re.compile(r"صيانة\s+مبنى", re.IGNORECASE),
    re.compile(r"صيانة\s+دورية", re.IGNORECASE),
    re.compile(r"maintenance", re.IGNORECASE),
    re.compile(r"\bhvac\b", re.IGNORECASE),
    re.compile(r"تشغيل\s+وصيانة", re.IGNORECASE),
)

VALUATION_PHRASE_PATTERNS = (
    re.compile(r"تقييم\s+عقار", re.IGNORECASE),
    re.compile(r"تقييم\s+العقار", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+تقييم", re.IGNORECASE),
    re.compile(r"أ?بي\s+تقييم", re.IGNORECASE),
    re.compile(r"أ?بي\s+أ?قي[ّ]?م", re.IGNORECASE),
    re.compile(r"تقييم\s+فيلا", re.IGNORECASE),
    re.compile(r"تقييم\s+أ?رض", re.IGNORECASE),
    re.compile(r"تقييم\s+مبنى", re.IGNORECASE),
    re.compile(r"تقييم\s+شقة", re.IGNORECASE),
    re.compile(r"property\s+valuation", re.IGNORECASE),
    re.compile(r"real\s+estate\s+valuation", re.IGNORECASE),
    re.compile(r"\bvaluation\b", re.IGNORECASE),
    re.compile(r"appraise\s+property", re.IGNORECASE),
)

CONTRACTING_PHRASE_PATTERNS = (
    re.compile(r"أ?حتاج\s+مقاول", re.IGNORECASE),
    re.compile(r"أ?بي\s+مقاول", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+تنفيذ\s+المشروع", re.IGNORECASE),
    re.compile(r"عندي\s+مخططات.{0,40}مقاول", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+عروض\s+مقاولين", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+مقاول\s+بناء", re.IGNORECASE),
    re.compile(r"المشروع\s+جاهز\s+للتنفيذ", re.IGNORECASE),
    re.compile(r"عندي\s+BOQ.{0,30}مقاول", re.IGNORECASE),
    re.compile(r"أ?حتاج\s+تسعير\s+تنفيذ", re.IGNORECASE),
    re.compile(r"أ?بي\s+أ?بدأ\s+أ?عمال\s+البناء", re.IGNORECASE),
    re.compile(r"construction\s+contractor", re.IGNORECASE),
    re.compile(r"\bcontracting\b", re.IGNORECASE),
    re.compile(r"\bcontractor\b", re.IGNORECASE),
)

AMBIGUOUS_EXECUTION = re.compile(r"^أ?حتاج\s+تنفيذ\s*$", re.IGNORECASE)
AMBIGUOUS_COMPANY = re.compile(r"^أ?حتاج\s+شركة\s*$", re.IGNORECASE)

ENGINEERING_CONSULTING_PHRASE_PATTERNS = (
    re.compile(r"استشار(?:ة|ه)\s+هندس", re.IGNORECASE),
    re.compile(r"استشاره\s+انشائ", re.IGNORECASE),
    re.compile(r"مهندس\s+(?:انشائي|إنشائي|كهرب|كهربائي|ميكانيك)", re.IGNORECASE),
    re.compile(r"مهندس\s+كهرب", re.IGNORECASE),
    re.compile(r"مشك(?:لة|له)\s+انشائ", re.IGNORECASE),
    re.compile(r"structural\s+problem", re.IGNORECASE),
    re.compile(r"cracks?\s+in\s+wall", re.IGNORECASE),
    re.compile(r"مراجعه?\s+انشائ", re.IGNORECASE),
    re.compile(r"مشروع\s+انشائ", re.IGNORECASE),
    re.compile(r"انشائ(?:ي|يه)?.{0,40}مراجع", re.IGNORECASE),
    re.compile(r"محتاج\s+مراجع(?:ة|ه)", re.IGNORECASE),
    re.compile(r"مشك(?:لة|له)\s+هندس", re.IGNORECASE),
    re.compile(r"مهندس.{0,30}مشك", re.IGNORECASE),
    re.compile(r"structural\s+issue", re.IGNORECASE),
    re.compile(r"تشقق|cracks", re.IGNORECASE),
    re.compile(r"engineering\s+consult", re.IGNORECASE),
    re.compile(r"دراس(?:ة|ه)\s+هندس", re.IGNORECASE),
)

AMBIGUOUS_PROJECT_HELP = re.compile(r"عندي\s+مشروع\s+و?أ?حتاج\s+مساعد", re.IGNORECASE)
AMBIGUOUS_ONLY_PROJECT = re.compile(r"^عندي\s+مشروع\s*$", re.IGNORECASE)

SERVICE_REQUEST_STATUS_PATTERNS = (
    re.compile(r"ح(?:الة|ال(?:ة)?)\s+طلب", re.IGNORECASE),
    re.compile(r"وش\s+صار\s+عل(?:ى|ي)\s+طلب", re.IGNORECASE),
    re.compile(r"أ?رسلت\s+طلب", re.IGNORECASE),
    re.compile(r"وش\s+ناقص\s+في\s+طلب", re.IGNORECASE),
    re.compile(r"أ?بي\s+أ?ك(?:مل|امل)\s+الطلب", re.IGNORECASE),
    re.compile(r"أ?ب(?:غ|ع)(?:ى|ي)\s+أ?عرف\s+ح(?:الة|ال(?:ة)?)\s+طلب", re.IGNORECASE),
)

HUMAN_HANDOFF_PATTERNS = (
    re.compile(r"أ?حتاج\s+أ?ك(?:لم|alam)\s+مهندس", re.IGNORECASE),
    re.compile(r"أ?بي\s+أ?ت(?:كلم|حدث)\s+مع\s+(?:ف(?:ريق)?\s+)?(?:EAM|eam|مهندس)", re.IGNORECASE),
)

CLASSIFIER_CONFIDENCE_THRESHOLD = 0.6


def classify_building_materials_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == BUILDING_MATERIALS_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in BUILDING_MATERIALS_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_equipment_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == EQUIPMENT_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in EQUIPMENT_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_real_estate_marketing_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == REAL_ESTATE_MARKETING_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in REAL_ESTATE_MARKETING_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_real_estate_development_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    if classify_real_estate_marketing_deterministic(message, intent_hint):
        return False
    if re.search(r"تقييم|valuation|استثمار|investment|تسويق|marketing", trimmed, re.IGNORECASE):
        return False
    if re.search(r"بناء\s+(?:فيلا|منزل)|build\s+villa|أ?بني\s+(?:فيلا|منزل)", trimmed, re.IGNORECASE):
        return False
    for pattern in REAL_ESTATE_DEVELOPMENT_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_government_services_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == GOVERNMENT_SERVICES_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in GOVERNMENT_SERVICES_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_facility_management_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == FACILITY_MANAGEMENT_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in FACILITY_MANAGEMENT_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_furnishing_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == FURNISHING_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in FURNISHING_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_project_management_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == PROJECT_MANAGEMENT_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in PROJECT_MANAGEMENT_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_smart_maintenance_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == SMART_MAINTENANCE_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in MAINTENANCE_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_real_estate_valuation_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == REAL_ESTATE_VALUATION_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in VALUATION_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_contracting_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == CONTRACTING_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    for pattern in CONTRACTING_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def classify_engineering_consulting_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == ENGINEERING_CONSULTING_JOURNEY_TYPE:
        return True
    trimmed = (message or "").strip()
    if trimmed == ENGINEERING_CONSULTING_LABEL:
        return True
    for pattern in ENGINEERING_CONSULTING_PHRASE_PATTERNS:
        if pattern.search(trimmed):
            return True
    return False


def route_intent_deterministic(message: str, intent_hint: str | None = None) -> IntentDecision | None:
    trimmed = (message or "").strip()

    for pattern in SERVICE_REQUEST_STATUS_PATTERNS:
        if pattern.search(trimmed):
            return IntentDecision(
                intent="general",
                confidence=0.95,
                action="general_answer",
                assistant_message="يمكنك متابعة حالة طلبك من مساحة العميل بعد تسجيل الدخول.",
            )

    for pattern in HUMAN_HANDOFF_PATTERNS:
        if pattern.search(trimmed):
            return IntentDecision(
                intent="general",
                confidence=0.95,
                action="general_answer",
                assistant_message="يمكننا تحويلك إلى أحد مهندسي EAM. يرجى توضيح طلبك أو متابعة رحلتك الحالية.",
            )

    if AMBIGUOUS_EXECUTION.search(trimmed) or AMBIGUOUS_COMPANY.search(trimmed):
        return IntentDecision(
            intent="general",
            confidence=0.35,
            action="clarify",
            assistant_message="هل تقصد جاهزية مقاولات/تنفيذ، بناء فيلا، أم استشارة هندسية؟",
        )

    if AMBIGUOUS_PROJECT_HELP.search(trimmed) or AMBIGUOUS_ONLY_PROJECT.search(trimmed):
        return IntentDecision(
            intent="general",
            confidence=0.3,
            action="clarify",
            assistant_message=(
                "هل تريد بناء فيلا، استشارة هندسية، جاهزية مقاولات، "
                "تقييم عقاري، تطوير عقاري، صيانة ذكية، إدارة مشروع، تأثيث، إدارة مرافق، خدمات حكومية، أم سؤالاً عاماً عن خدمات EAM؟"
            ),
        )

    if classify_building_materials_deterministic(message, intent_hint):
        return IntentDecision(
            intent=BUILDING_MATERIALS_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=BUILDING_MATERIALS_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=BUILDING_MATERIALS_START_MESSAGE,
        )

    if classify_equipment_deterministic(message, intent_hint):
        return IntentDecision(
            intent=EQUIPMENT_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=EQUIPMENT_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=EQUIPMENT_START_MESSAGE,
        )

    if classify_real_estate_marketing_deterministic(message, intent_hint):
        return IntentDecision(
            intent=REAL_ESTATE_MARKETING_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=REAL_ESTATE_MARKETING_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=REAL_ESTATE_MARKETING_START_MESSAGE,
        )

    if classify_real_estate_development_deterministic(message, intent_hint):
        return IntentDecision(
            intent=REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=REAL_ESTATE_DEVELOPMENT_START_MESSAGE,
        )

    if classify_government_services_deterministic(message, intent_hint):
        return IntentDecision(
            intent=GOVERNMENT_SERVICES_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=GOVERNMENT_SERVICES_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=GOVERNMENT_SERVICES_START_MESSAGE,
        )

    if classify_facility_management_deterministic(message, intent_hint):
        return IntentDecision(
            intent=FACILITY_MANAGEMENT_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=FACILITY_MANAGEMENT_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=FACILITY_MANAGEMENT_START_MESSAGE,
        )

    if classify_furnishing_deterministic(message, intent_hint):
        return IntentDecision(
            intent=FURNISHING_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=FURNISHING_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=FURNISHING_START_MESSAGE,
        )

    if classify_project_management_deterministic(message, intent_hint):
        return IntentDecision(
            intent=PROJECT_MANAGEMENT_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=PROJECT_MANAGEMENT_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=PROJECT_MANAGEMENT_START_MESSAGE,
        )

    if classify_smart_maintenance_deterministic(message, intent_hint):
        return IntentDecision(
            intent=SMART_MAINTENANCE_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=SMART_MAINTENANCE_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=SMART_MAINTENANCE_START_MESSAGE,
        )

    if classify_real_estate_valuation_deterministic(message, intent_hint):
        return IntentDecision(
            intent=REAL_ESTATE_VALUATION_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=REAL_ESTATE_VALUATION_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=VALUATION_START_MESSAGE,
        )

    if classify_build_villa_deterministic(message, intent_hint):
        return IntentDecision(
            intent=BUILD_VILLA_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=BUILD_VILLA_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=BUILD_VILLA_START_MESSAGE,
        )

    if classify_engineering_consulting_deterministic(message, intent_hint):
        return IntentDecision(
            intent=ENGINEERING_CONSULTING_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=ENGINEERING_CONSULTING_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=ENGINEERING_CONSULTING_START_MESSAGE,
        )

    if classify_contracting_deterministic(message, intent_hint):
        return IntentDecision(
            intent=CONTRACTING_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=CONTRACTING_JOURNEY_TYPE,
            action="start_journey",
            required_confirmation=False,
            assistant_message=CONTRACTING_START_MESSAGE,
        )

    hinted = resolve_intent_hint(intent_hint)
    if hinted == BUILD_VILLA_JOURNEY_TYPE:
        return IntentDecision(
            intent=BUILD_VILLA_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=BUILD_VILLA_JOURNEY_TYPE,
            action="start_journey",
            assistant_message=BUILD_VILLA_START_MESSAGE,
        )
    if hinted == ENGINEERING_CONSULTING_JOURNEY_TYPE:
        return IntentDecision(
            intent=ENGINEERING_CONSULTING_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=ENGINEERING_CONSULTING_JOURNEY_TYPE,
            action="start_journey",
            assistant_message=ENGINEERING_CONSULTING_START_MESSAGE,
        )
    if hinted == REAL_ESTATE_VALUATION_JOURNEY_TYPE:
        return IntentDecision(
            intent=REAL_ESTATE_VALUATION_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=REAL_ESTATE_VALUATION_JOURNEY_TYPE,
            action="start_journey",
            assistant_message=VALUATION_START_MESSAGE,
        )
    if hinted == SMART_MAINTENANCE_JOURNEY_TYPE:
        return IntentDecision(
            intent=SMART_MAINTENANCE_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=SMART_MAINTENANCE_JOURNEY_TYPE,
            action="start_journey",
            assistant_message=SMART_MAINTENANCE_START_MESSAGE,
        )

    if (message or "").strip() == BUILD_VILLA_QUICK_ACTION_LABEL:
        return IntentDecision(
            intent=BUILD_VILLA_JOURNEY_TYPE,
            confidence=1.0,
            candidate_journey=BUILD_VILLA_JOURNEY_TYPE,
            action="start_journey",
            assistant_message=BUILD_VILLA_START_MESSAGE,
        )

    return None


def parse_model_intent_decision(payload: dict) -> IntentDecision:
    intent = payload.get("intent", "general")
    confidence = float(payload.get("confidence", 0.0))
    if intent == BUILD_VILLA_JOURNEY_TYPE and confidence >= CLASSIFIER_CONFIDENCE_THRESHOLD:
        return IntentDecision(
            intent=BUILD_VILLA_JOURNEY_TYPE,
            confidence=confidence,
            candidate_journey=BUILD_VILLA_JOURNEY_TYPE,
            action="start_journey",
            assistant_message=BUILD_VILLA_START_MESSAGE,
        )
    if intent == ENGINEERING_CONSULTING_JOURNEY_TYPE and confidence >= CLASSIFIER_CONFIDENCE_THRESHOLD:
        return IntentDecision(
            intent=ENGINEERING_CONSULTING_JOURNEY_TYPE,
            confidence=confidence,
            candidate_journey=ENGINEERING_CONSULTING_JOURNEY_TYPE,
            action="start_journey",
            assistant_message=ENGINEERING_CONSULTING_START_MESSAGE,
        )
    if confidence < 0.35:
        return IntentDecision(
            intent="general",
            confidence=confidence,
            action="clarify",
            required_confirmation=False,
            assistant_message="هل تريد بناء فيلا، طلب استشارة هندسية، أم لديك سؤال عام عن خدمات EAM؟",
        )
    return IntentDecision(
        intent="general",
        confidence=confidence,
        action="general_answer",
    )


def classifier_system_prompt() -> str:
    return INTENT_CLASSIFIER.content
