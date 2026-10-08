function normalizeHint(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ');
}

type NamedItem = { id: string; label: string };

const FIELD_ALIASES: Record<string, string[]> = {
  'home-hero-bg-image': ['هيرو', 'hero', 'بطل', 'خلفيه الهيرو', 'صوره الهيرو', 'صورة الهيرو'],
  'home-about-eam-image': ['عن eam', 'about', 'قسم 2', 'about eam'],
  'home-body-bg-right': ['خلفيه يمين', 'خلفية يمين', 'يمين النص', 'body bg right'],
  'home-body-bg-left': ['خلفيه يسار', 'خلفية يسار', 'يسار النص', 'body bg left'],
  'about-intro-text': ['مقدمه من نحن', 'intro about'],
  'services-intro': ['مقدمه الخدمات', 'services intro'],
  'services-cta-title': ['عنوان دعوه الخدمات', 'cta title'],
  'services-cta-desc': ['وصف دعوه الخدمات', 'cta desc'],
};

const SECTION_ALIASES: Record<string, string[]> = {
  'first-viewport': ['البطل', 'الهيرو', 'hero', 'first viewport'],
  'about-eam': ['عن eam', 'about eam'],
  'one-statement': ['رسالة واحدة', 'one statement'],
  'what-we-offer': ['ماذا نقدم', 'what we offer'],
  'sector-platforms': ['منصة القطاعات', 'sectors'],
  'mid-content': ['محتوى وسط', 'mid content'],
  'projects-showcase': ['المشاريع', 'projects'],
  'investment': ['الاستثمار', 'investment'],
  'contact': ['تواصل', 'contact', 'cta'],
  'footer': ['ذيل', 'footer'],
};

function scoreMatch(normalizedHint: string, id: string, label: string, aliases: string[]): number {
  const normId = normalizeHint(id);
  const normLabel = normalizeHint(label);
  if (normalizedHint === normId) return 100;
  if (normalizedHint === normLabel) return 95;
  if (normLabel.includes(normalizedHint) || normalizedHint.includes(normLabel)) return 80;
  for (const alias of aliases) {
    const a = normalizeHint(alias);
    if (normalizedHint === a || normalizedHint.includes(a) || a.includes(normalizedHint)) {
      return 70;
    }
  }
  const hintTokens = normalizedHint.split(' ').filter(Boolean);
  const labelTokens = normLabel.split(' ').filter(Boolean);
  const overlap = hintTokens.filter((t) => labelTokens.some((lt) => lt.includes(t) || t.includes(lt))).length;
  if (overlap > 0 && hintTokens.length > 0) {
    return 40 + (overlap / hintTokens.length) * 30;
  }
  return 0;
}

export function resolveFieldIdHint(hint: string, items: NamedItem[]): string | null {
  const normalized = normalizeHint(hint);
  if (!normalized) return null;

  let best: { id: string; score: number } | null = null;
  for (const item of items) {
    const aliases = FIELD_ALIASES[item.id] ?? [];
    const score = scoreMatch(normalized, item.id, item.label, aliases);
    if (score > 0 && (!best || score > best.score)) {
      best = { id: item.id, score };
    }
  }
  return best && best.score >= 40 ? best.id : null;
}

export function resolveSectionIdHint(hint: string, items: NamedItem[]): string | null {
  const normalized = normalizeHint(hint);
  if (!normalized) return null;

  let best: { id: string; score: number } | null = null;
  for (const item of items) {
    const aliases = SECTION_ALIASES[item.id] ?? [];
    const score = scoreMatch(normalized, item.id, item.label, aliases);
    if (score > 0 && (!best || score > best.score)) {
      best = { id: item.id, score };
    }
  }
  return best && best.score >= 40 ? best.id : null;
}
