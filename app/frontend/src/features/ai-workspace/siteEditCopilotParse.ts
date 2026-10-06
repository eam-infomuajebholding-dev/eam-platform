export type SiteEditLayoutPatch = {
  width?: string;
  height?: string;
  maxWidth?: string;
  minHeight?: string;
  position?: 'relative' | 'absolute';
  left?: string;
  top?: string;
  zIndex?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'right' | 'left' | 'center' | 'justify';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
};

export type SiteEditInstruction = {
  field_id: string;
  plain_text?: string;
  markdown?: string;
  link_text?: string;
  link_href?: string;
  image_url?: string;
  video_url?: string;
  layout?: SiteEditLayoutPatch;
};

export type SiteEditSectionInstruction = {
  section_id: string;
  visibility: 'published' | 'hidden';
};

export type SiteEditPlan = {
  assistant_message: string;
  edits: SiteEditInstruction[];
  sections?: SiteEditSectionInstruction[];
  restore?: string[];
  command?: 'undo' | 'redo';
};

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    return trimmed;
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    return fence[1].trim();
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return null;
}

export function parseSiteEditPlan(raw: string): SiteEditPlan | null {
  const jsonText = extractJsonObject(raw);
  if (!jsonText) return null;
  try {
    const parsed = JSON.parse(jsonText) as SiteEditPlan;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.assistant_message !== 'string') return null;
    if (!Array.isArray(parsed.edits)) parsed.edits = [];
    if (parsed.sections != null && !Array.isArray(parsed.sections)) return null;
    if (parsed.restore != null && !Array.isArray(parsed.restore)) return null;
    if (parsed.command != null && parsed.command !== 'undo' && parsed.command !== 'redo') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
