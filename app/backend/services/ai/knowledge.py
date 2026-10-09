"""Trusted EAM passages. Answers that use them must cite the passage id."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class KnowledgePassage:
    passage_id: str
    title: str
    text: str
    citation: str


PASSAGES: tuple[KnowledgePassage, ...] = (
    KnowledgePassage(
        passage_id="eam.identity",
        title="هوية EAM",
        text="إعمار الأصالة والمعاصرة (EAM) شركة سعودية للاستشارات الهندسية: تصميم، إنشاء، إدارة مشاريع، ودراسات.",
        citation="eam.identity",
    ),
    KnowledgePassage(
        passage_id="eam.contact",
        title="التواصل",
        text="للتواصل: info@eam.sa — الرياض، المملكة العربية السعودية.",
        citation="eam.contact",
    ),
    KnowledgePassage(
        passage_id="eam.authority",
        title="حدود المساعد",
        text="المساعد لا يوقّع ولا يصدر اعتماداً هندسياً ولا عرض سعر ملزم. التنفيذ يتم عبر رحلات المنصة بعد تأكيد المستخدم.",
        citation="eam.authority",
    ),
    KnowledgePassage(
        passage_id="eam.first_value",
        title="القيمة الأولى",
        text="أي رقم أو جدول يظهر في الحوار تمهيدي وليس عرضاً نهائياً.",
        citation="eam.first_value",
    ),
)


def retrieve_knowledge(message: str, *, limit: int = 3) -> list[KnowledgePassage]:
    tokens = {part for part in (message or "").lower().split() if len(part) > 2}
    scored: list[tuple[int, KnowledgePassage]] = []
    for passage in PASSAGES:
        haystack = f"{passage.title} {passage.text}".lower()
        score = sum(1 for token in tokens if token in haystack)
        if any(key in (message or "") for key in ("eam", "إعمار", "تواصل", "info@", "سعر", "اعتماد")):
            score += 1
        if score > 0:
            scored.append((score, passage))
    scored.sort(key=lambda item: item[0], reverse=True)
    if not scored and any(word in (message or "") for word in ("من أنتم", "من انت", "خدمات", "تواصل")):
        return list(PASSAGES[:2])
    return [passage for _, passage in scored[:limit]]


def format_knowledge_addendum(passages: list[KnowledgePassage]) -> str:
    if not passages:
        return (
            "لا توجد مقاطع شركة مطابقة لهذا السؤال. أجب بحرية عن الموضوع العام. "
            "إذا سُئلت عن حقيقة خاصة بشركة EAM أو سعر أو اعتماد وليست في المصادر، قل إن المعلومة غير موثقة."
        )
    lines = [
        "مقاطع موثقة عن الشركة. أجب بحرية عن أي موضوع آخر. إذا استندت إلى مقطع شركة فاذكر معرّفه مثل [eam.contact]. لا تخترع أسعاراً أو اعتمادات."
    ]
    for passage in passages:
        lines.append(f"[{passage.citation}] {passage.title}: {passage.text}")
    return "\n".join(lines)
