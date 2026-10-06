import { bootstrapFieldFromDom, cloneFieldValue, restoreFieldToDefault } from '@/features/site-editor/persistence';
import { resolveFieldMeta } from '@/features/site-editor/fieldRegistry';
import { readValueFromElement, resolveElementForField } from '@/features/site-editor/domApply';
import { mergeLayout } from '@/features/site-editor/layoutUtils';
import type { ElementLayout, FieldRecord, FieldValue } from '@/features/site-editor/types';
import type { SectionPublishState } from '@/features/section-visibility/registry';
import { resolveFieldIdHint, resolveSectionIdHint } from './siteEditFieldResolve';
import type { SiteEditInstruction, SiteEditPlan } from './siteEditCopilotParse';

export type { SiteEditInstruction, SiteEditPlan, SiteEditSectionInstruction } from './siteEditCopilotParse';
export { parseSiteEditPlan } from './siteEditCopilotParse';

export type SiteEditCatalogEntry = {
  field_id: string;
  label: string;
  type: FieldValue['type'];
  preview: string;
  layout?: ElementLayout;
};

export interface SiteEditEditorApi {
  pagePath: string;
  selectedFieldId: string | null;
  fields: Record<string, FieldRecord>;
  fieldList: { id: string; label: string; group?: string }[];
  sections: { id: string; label: string; state: SectionPublishState }[];
  replaceFieldValue: (fieldId: string, value: FieldValue, element?: HTMLElement | null) => void;
  selectField: (fieldId: string | null) => void;
  saveAll: (options?: { silent?: boolean }) => Promise<void>;
  reloadDocument: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  setSectionState: (sectionId: string, state: SectionPublishState) => Promise<void>;
}

export type SiteEditApplyResult = {
  appliedFields: string[];
  skippedFields: string[];
  appliedSections: string[];
  skippedSections: string[];
  restoredFields: string[];
  command?: 'undo' | 'redo';
  assistantMessage: string;
};

const COMMAND_PREFIX =
  /^(?:غيّ|غير|عدّ|عدل|حوّ|حول|ضع|اجعل|اكتب|استبد|بدّ|بدل|انقل|اخف|أخف|اظهر|أظهر|كبّ|صغّ|غيّر|change|edit|set|update|replace|hide|show|move|resize|align|font|تراجع|undo|redo|استعد|استرجع)\b/i;

function previewFromValue(value: FieldValue): string {
  switch (value.type) {
    case 'plain':
      return value.text.slice(0, 120);
    case 'markdown':
      return value.markdown.slice(0, 120);
    case 'link':
      return `${value.text} → ${value.href}`.slice(0, 120);
    case 'image':
    case 'video':
      return value.url.slice(0, 120);
    default:
      return '';
  }
}

function readBaselineValue(api: SiteEditEditorApi, fieldId: string): FieldValue | undefined {
  const fromState = api.fields[fieldId]?.value;
  if (fromState) return fromState;
  const boot = bootstrapFieldFromDom(fieldId, api.pagePath)?.value;
  if (boot) return boot;
  const meta = resolveFieldMeta(fieldId, api.pagePath);
  const el = resolveElementForField(fieldId);
  return el ? readValueFromElement(el, meta.type) : undefined;
}

export function buildSiteEditCatalog(api: SiteEditEditorApi): SiteEditCatalogEntry[] {
  const { pagePath, fields, fieldList } = api;
  return fieldList.map(({ id, label }) => {
    const meta = resolveFieldMeta(id, pagePath);
    const value = readBaselineValue(api, id);
    const type = value?.type ?? meta.type;
    return {
      field_id: id,
      label,
      type,
      preview: value ? previewFromValue(value) : '',
      layout: value?.layout,
    };
  });
}

function looksLikeMultiFieldCommand(message: string): boolean {
  const trimmed = message.trim();
  if (COMMAND_PREFIX.test(trimmed)) return true;
  if (/field_id|حقل|section|قسم|ذيل|footer|شعار|logo|تراجع|undo|redo|layout|محاذ|خط|حجم/i.test(trimmed)) {
    return true;
  }
  return false;
}

export function tryApplyDirectSelectedEdit(
  message: string,
  api: SiteEditEditorApi,
): { applied: boolean; assistantMessage: string } {
  const fieldId = api.selectedFieldId;
  if (!fieldId) {
    return { applied: false, assistantMessage: '' };
  }
  if (looksLikeMultiFieldCommand(message)) {
    return { applied: false, assistantMessage: '' };
  }

  const meta = resolveFieldMeta(fieldId, api.pagePath);
  const existing = readBaselineValue(api, fieldId);
  if (!existing) {
    return { applied: false, assistantMessage: '' };
  }

  const trimmed = message.trim();
  const urlMatch = trimmed.match(/^https?:\/\/\S+$/i);
  let next: FieldValue | null = null;

  if (urlMatch && (existing.type === 'image' || existing.type === 'video')) {
    next = { ...existing, url: urlMatch[0] };
  } else if (existing.type === 'plain') {
    next = { ...existing, text: trimmed };
  } else if (existing.type === 'markdown') {
    next = { ...existing, markdown: trimmed };
  } else if (existing.type === 'link' && urlMatch) {
    next = { ...existing, href: urlMatch[0] };
  }

  if (!next) {
    return { applied: false, assistantMessage: '' };
  }

  api.replaceFieldValue(fieldId, next);
  return {
    applied: true,
    assistantMessage: 'تم تطبيق التعديل على العنصر المحدّد وحفظه.',
  };
}

export async function tryApplyLocalSiteEditCommand(
  message: string,
  api: SiteEditEditorApi,
): Promise<SiteEditApplyResult | null> {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  if (/^(تراجع|undo|رجوع)$/i.test(trimmed)) {
    api.undo();
    return {
      appliedFields: [],
      skippedFields: [],
      appliedSections: [],
      skippedSections: [],
      restoredFields: [],
      command: 'undo',
      assistantMessage: 'تم التراجع عن آخر تعديل.',
    };
  }
  if (/^(إعادة|redo|repeat)$/i.test(trimmed)) {
    api.redo();
    return {
      appliedFields: [],
      skippedFields: [],
      appliedSections: [],
      skippedSections: [],
      restoredFields: [],
      command: 'redo',
      assistantMessage: 'تمت إعادة التعديل.',
    };
  }

  const hideMatch = trimmed.match(
    /(?:اخف|أخف|إخفاء|hide)\s*(?:قسم|section)?\s*[:\-]?\s*(.+)$/i,
  );
  if (hideMatch?.[1]) {
    const sectionId = resolveSectionIdHint(hideMatch[1], api.sections);
    if (sectionId) {
      await api.setSectionState(sectionId, 'hidden');
      return {
        appliedFields: [],
        skippedFields: [],
        appliedSections: [sectionId],
        skippedSections: [],
        restoredFields: [],
        assistantMessage: `تم إخفاء القسم «${sectionId}» عن الزوار.`,
      };
    }
  }

  const showMatch = trimmed.match(
    /(?:اظهر|أظهر|إظهار|انشر|show|publish)\s*(?:قسم|section)?\s*[:\-]?\s*(.+)$/i,
  );
  if (showMatch?.[1]) {
    const sectionId = resolveSectionIdHint(showMatch[1], api.sections);
    if (sectionId) {
      await api.setSectionState(sectionId, 'published');
      return {
        appliedFields: [],
        skippedFields: [],
        appliedSections: [sectionId],
        skippedSections: [],
        restoredFields: [],
        assistantMessage: `تم نشر القسم «${sectionId}» للزوار.`,
      };
    }
  }

  const restoreMatch = trimmed.match(
    /(?:استعد|استرجع|restore|الافتراضي)\s*(?:لـ|ل)?\s*(.+)$/i,
  );
  if (restoreMatch?.[1]) {
    const fieldId =
      resolveFieldIdHint(restoreMatch[1], api.fieldList) ?? api.selectedFieldId;
    if (fieldId) {
      const persistedId = api.fields[fieldId]?.persistedId;
      await restoreFieldToDefault(api.pagePath, fieldId, persistedId);
      await api.reloadDocument();
      return {
        appliedFields: [],
        skippedFields: [],
        appliedSections: [],
        skippedSections: [],
        restoredFields: [fieldId],
        assistantMessage: `تمت استعادة «${fieldId}» للوضع الافتراضي.`,
      };
    }
  }

  if (lower.includes('http') && api.selectedFieldId) {
    const url = trimmed.match(/https?:\/\/\S+/i)?.[0];
    const existing = readBaselineValue(api, api.selectedFieldId);
    if (url && existing && (existing.type === 'image' || existing.type === 'video')) {
      api.replaceFieldValue(api.selectedFieldId, { ...existing, url });
      return {
        appliedFields: [api.selectedFieldId],
        skippedFields: [],
        appliedSections: [],
        skippedSections: [],
        restoredFields: [],
        assistantMessage: 'تم تحديث رابط الوسائط للعنصر المحدّد.',
      };
    }
  }

  return null;
}

export function tryBuildHeuristicSiteEditPlan(
  message: string,
  api: SiteEditEditorApi,
  catalog: SiteEditCatalogEntry[],
): SiteEditPlan | null {
  const changeMatch = message.match(
    /(?:غيّ|غير|عدّ|عدل|حوّ|حوّل|اجعل|اكتب|set|change|update)\s+(?:نص|عنوان|صورة)?\s*(.+?)\s+(?:إلى|الى|to|=)\s+([\s\S]+)/i,
  );
  if (changeMatch?.[1] && changeMatch[2]) {
    const fieldId = resolveFieldIdHint(changeMatch[1], api.fieldList);
    const value = changeMatch[2].trim();
    if (fieldId) {
      const entry = catalog.find((c) => c.field_id === fieldId);
      const instruction: SiteEditInstruction = { field_id: fieldId };
      const url = value.match(/^https?:\/\/\S+$/i)?.[0];
      if (url && (entry?.type === 'image' || entry?.type === 'video')) {
        if (entry.type === 'image') instruction.image_url = url;
        else instruction.video_url = url;
      } else if (entry?.type === 'markdown') {
        instruction.markdown = value;
      } else {
        instruction.plain_text = value;
      }
      return {
        assistant_message: `تم تعديل «${entry?.label ?? fieldId}».`,
        edits: [instruction],
      };
    }
  }

  const alignMatch = message.match(
    /(?:محاذ|align|وسط|center|يمين|right|يسار|left)\s*(?:نص|عنوان)?\s*(.+)?/i,
  );
  if (alignMatch) {
    const fieldId =
      resolveFieldIdHint(alignMatch[1] ?? '', api.fieldList) ?? api.selectedFieldId;
    if (fieldId) {
      let textAlign: ElementLayout['textAlign'] = 'center';
      if (/يمين|right/i.test(message)) textAlign = 'right';
      if (/يسار|left/i.test(message)) textAlign = 'left';
      if (/justify|ضبط/i.test(message)) textAlign = 'justify';
      return {
        assistant_message: 'تم ضبط المحاذاة.',
        edits: [{ field_id: fieldId, layout: { textAlign } }],
      };
    }
  }

  return null;
}

export function buildSiteEditPrompt(
  userMessage: string,
  catalog: SiteEditCatalogEntry[],
  pagePath: string,
  selectedFieldId: string | null,
  sections: { id: string; label: string; state: SectionPublishState }[],
): string {
  const catalogLines = catalog
    .map((entry) => {
      const layout = entry.layout ? JSON.stringify(entry.layout) : '{}';
      return `- ${entry.field_id} | ${entry.label} | ${entry.type} | ${entry.preview.replace(/\s+/g, ' ')} | layout=${layout}`;
    })
    .join('\n');

  const sectionLines = sections
    .map((s) => `- ${s.id} | ${s.label} | ${s.state}`)
    .join('\n');

  return `[EAM_SITE_EDITOR v2 — FULL OPERATOR]
أنت مساعد تحرير الموقع بصلاحيات كاملة على الصفحة الحالية. نفّذ طلب المستخدم بدقة باستخدام field_id و section_id من القوائم فقط.
أعد JSON صالحاً فقط (بدون markdown):

{
  "assistant_message": "رسالة قصيرة بالعربية",
  "edits": [
    {
      "field_id": "exact-id",
      "plain_text": "...",
      "markdown": "...",
      "link_text": "...",
      "link_href": "...",
      "image_url": "...",
      "video_url": "...",
      "layout": { "fontSize": "18px", "textAlign": "center", "width": "100%", "objectFit": "cover" }
    }
  ],
  "sections": [{ "section_id": "exact-id", "visibility": "hidden" | "published" }],
  "restore": ["field_id"],
  "command": "undo" | "redo"
}

قواعد:
- يمكن الجمع بين edits و sections في طلب واحد.
- layout: fontSize, fontWeight, lineHeight, textAlign, width, height, maxWidth, left, top, objectFit, position.
- لإخفاء/إظهار قسم استخدم sections وليس edits.
- استعد الصورة/النص الافتراضي عبر restore.
- إذا لم تجد field_id مطابقاً اختر الأقرب من القائمة ولا تخترع ids.
- العنصر المحدّد حالياً له أولوية إن لم يُذكر الهدف.

الصفحة: ${pagePath}
العنصر المحدّد: ${selectedFieldId ?? 'none'}

الحقول:
${catalogLines || '(none)'}

الأقسام:
${sectionLines || '(none)'}

طلب المستخدم:
${userMessage}`;
}

function resolveInstructionFieldId(
  rawId: string,
  api: SiteEditEditorApi,
): string | null {
  const trimmed = rawId?.trim();
  if (!trimmed) return null;
  if (api.fieldList.some((f) => f.id === trimmed)) return trimmed;
  return resolveFieldIdHint(trimmed, api.fieldList);
}

function instructionToFieldValue(
  instruction: SiteEditInstruction,
  pagePath: string,
  baseline?: FieldValue,
): FieldValue | null {
  const meta = resolveFieldMeta(instruction.field_id, pagePath);
  const type = baseline?.type ?? meta.type;
  const layoutPatch = instruction.layout as Partial<ElementLayout> | undefined;

  let next: FieldValue | null = null;

  if (type === 'plain' && instruction.plain_text != null) {
    const base = baseline?.type === 'plain' ? baseline : { type: 'plain' as const, text: '' };
    next = { ...base, text: instruction.plain_text };
  } else if (type === 'markdown' && instruction.markdown != null) {
    const base =
      baseline?.type === 'markdown' ? baseline : { type: 'markdown' as const, markdown: '' };
    next = { ...base, markdown: instruction.markdown };
  } else if (type === 'link' && (instruction.link_text != null || instruction.link_href != null)) {
    const base =
      baseline?.type === 'link' ? baseline : { type: 'link' as const, text: '', href: '' };
    next = {
      ...base,
      text: instruction.link_text ?? base.text,
      href: instruction.link_href ?? base.href,
    };
  } else if (type === 'image' && instruction.image_url != null) {
    const base = baseline?.type === 'image' ? baseline : { type: 'image' as const, url: '' };
    next = { ...base, url: instruction.image_url };
  } else if (type === 'video' && instruction.video_url != null) {
    const base = baseline?.type === 'video' ? baseline : { type: 'video' as const, url: '' };
    next = { ...base, url: instruction.video_url };
  } else if (instruction.plain_text != null && (type === 'plain' || type === 'markdown')) {
    if (type === 'markdown') {
      const base =
        baseline?.type === 'markdown' ? baseline : { type: 'markdown' as const, markdown: '' };
      next = { ...base, markdown: instruction.plain_text };
    } else {
      const base = baseline?.type === 'plain' ? baseline : { type: 'plain' as const, text: '' };
      next = { ...base, text: instruction.plain_text };
    }
  } else if (baseline && layoutPatch && Object.keys(layoutPatch).length > 0) {
    next = { ...baseline };
  }

  if (!next) return null;

  if (layoutPatch && Object.keys(layoutPatch).length > 0) {
    next = { ...next, layout: mergeLayout(next.layout, layoutPatch) } as FieldValue;
  }

  return next;
}

function formatApplySummary(result: SiteEditApplyResult, planMessage: string): string {
  const parts = [planMessage.trim() || 'تم تنفيذ الطلب.'];
  if (result.appliedFields.length) {
    parts.push(`✓ حقول: ${result.appliedFields.join('، ')}`);
  }
  if (result.appliedSections.length) {
    parts.push(`✓ أقسام: ${result.appliedSections.join('، ')}`);
  }
  if (result.restoredFields.length) {
    parts.push(`✓ استعادة: ${result.restoredFields.join('، ')}`);
  }
  if (result.command) {
    parts.push(`✓ ${result.command === 'undo' ? 'تراجع' : 'إعادة'}`);
  }
  if (result.skippedFields.length) {
    parts.push(`⚠ حقول لم تُطبَّق: ${result.skippedFields.join('، ')}`);
  }
  if (result.skippedSections.length) {
    parts.push(`⚠ أقسام: ${result.skippedSections.join('، ')}`);
  }
  return parts.join('\n');
}

export async function executeSiteEditPlan(
  plan: SiteEditPlan,
  api: SiteEditEditorApi,
): Promise<SiteEditApplyResult> {
  const result: SiteEditApplyResult = {
    appliedFields: [],
    skippedFields: [],
    appliedSections: [],
    skippedSections: [],
    restoredFields: [],
    assistantMessage: plan.assistant_message,
  };

  if (plan.command === 'undo') {
    api.undo();
    result.command = 'undo';
  } else if (plan.command === 'redo') {
    api.redo();
    result.command = 'redo';
  }

  for (const rawFieldId of plan.restore ?? []) {
    const fieldId = resolveInstructionFieldId(rawFieldId, api);
    if (!fieldId) {
      result.skippedFields.push(rawFieldId);
      continue;
    }
    const persistedId = api.fields[fieldId]?.persistedId;
    await restoreFieldToDefault(api.pagePath, fieldId, persistedId);
    result.restoredFields.push(fieldId);
  }

  for (const instruction of plan.edits) {
    const fieldId = resolveInstructionFieldId(instruction.field_id, api);
    if (!fieldId) {
      result.skippedFields.push(instruction.field_id);
      continue;
    }

    const baseline = readBaselineValue(api, fieldId);
    const next = instructionToFieldValue({ ...instruction, field_id: fieldId }, api.pagePath, baseline);
    if (!next) {
      result.skippedFields.push(fieldId);
      continue;
    }

    const withLayout =
      baseline && (next.type === 'image' || next.type === 'video') && next.type === baseline.type
        ? { ...next, layout: next.layout ?? cloneFieldValue(baseline).layout }
        : next;

    api.replaceFieldValue(fieldId, withLayout as FieldValue);
    api.selectField(fieldId);
    result.appliedFields.push(fieldId);
  }

  for (const sectionOp of plan.sections ?? []) {
    const sectionId =
      api.sections.some((s) => s.id === sectionOp.section_id)
        ? sectionOp.section_id
        : resolveSectionIdHint(sectionOp.section_id, api.sections);
    if (!sectionId) {
      result.skippedSections.push(sectionOp.section_id);
      continue;
    }
    await api.setSectionState(sectionId, sectionOp.visibility);
    result.appliedSections.push(sectionId);
  }

  if (result.restoredFields.length > 0) {
    await api.reloadDocument();
  }

  result.assistantMessage = formatApplySummary(result, plan.assistant_message);
  return result;
}

export function hasExecutableSiteEditPlan(plan: SiteEditPlan): boolean {
  return (
    plan.edits.length > 0 ||
    (plan.sections?.length ?? 0) > 0 ||
    (plan.restore?.length ?? 0) > 0 ||
    plan.command === 'undo' ||
    plan.command === 'redo'
  );
}

/** @deprecated use executeSiteEditPlan */
export function applySiteEditPlan(plan: SiteEditPlan, api: SiteEditEditorApi) {
  const appliedIds: string[] = [];
  const skipped: string[] = [];
  for (const instruction of plan.edits) {
    const fieldId = resolveInstructionFieldId(instruction.field_id, api);
    if (!fieldId) {
      skipped.push(instruction.field_id);
      continue;
    }
    const baseline = readBaselineValue(api, fieldId);
    const next = instructionToFieldValue({ ...instruction, field_id: fieldId }, api.pagePath, baseline);
    if (!next) {
      skipped.push(fieldId);
      continue;
    }
    api.replaceFieldValue(fieldId, next);
    api.selectField(fieldId);
    appliedIds.push(fieldId);
  }
  return { appliedIds, skipped };
}
