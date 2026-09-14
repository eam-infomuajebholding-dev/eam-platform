import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TARGET_DIRS = [
  path.join(ROOT, 'src/pages'),
  path.join(ROOT, 'src/components'),
  path.join(ROOT, 'src/features'),
];

const SKIP_DIRS = new Set(['node_modules', 'dist', '__tests__']);

const REPLACEMENTS = [
  ['font-playfair', 'font-display'],
  ['font-tajawal ', ''],
  [' font-tajawal', ''],
  ['text-gray-900 dark:text-white', 'text-ink'],
  ['text-gray-800 dark:text-white', 'text-ink'],
  ['text-gray-700 dark:text-white/85', 'text-ink-secondary'],
  ['text-gray-700 dark:text-white/80', 'text-ink-secondary'],
  ['text-gray-700 dark:text-white/70', 'text-ink-secondary'],
  ['text-gray-600 dark:text-white/80', 'text-ink-secondary'],
  ['text-gray-600 dark:text-white/70', 'text-ink-secondary'],
  ['text-gray-600 dark:text-white/65', 'text-ink-secondary'],
  ['text-gray-600 dark:text-white/60', 'text-ink-muted'],
  ['text-gray-500 dark:text-white/60', 'text-ink-muted'],
  ['text-gray-500 dark:text-white/50', 'text-ink-muted'],
  ['text-gray-700 dark:text-gold/80', 'text-ink-secondary dark:text-gold/80'],
  ['text-gray-900', 'text-ink'],
  ['text-gray-800', 'text-ink'],
  ['text-gray-700', 'text-ink-secondary'],
  ['text-gray-600', 'text-ink-secondary'],
  ['text-gray-500', 'text-ink-muted'],
  ['text-gray-400', 'text-ink-subtle'],
  ['bg-gray-50 dark:bg-surface-muted', 'bg-surface-alt dark:bg-surface-muted'],
  ['bg-gray-50 dark:bg-background', 'bg-surface-alt dark:bg-background'],
  ['bg-gray-50 dark:bg-white/5', 'bg-surface-alt dark:bg-surface'],
  ['bg-gray-100', 'bg-surface-alt'],
  ['bg-white dark:bg-background', 'bg-cream-light dark:bg-background'],
  ['bg-white dark:bg-white/5', 'bg-cream-light dark:bg-surface'],
  ['border-gray-200 dark:border-gold/20', 'border-soft-border/80 dark:border-gold/20'],
  ['border-gray-200', 'border-soft-border/80'],
  ['border-gray-300', 'border-soft-border'],
  ['placeholder:text-gray-400', 'placeholder:text-ink-subtle'],
  [
    'hover:shadow-[0_0_30px_rgba(201,168,76,0.4)]',
    'hover:shadow-gold-lg',
  ],
  [
    'hover:shadow-[0_10px_40px_rgba(201,168,76,0.3),0_4px_15px_rgba(201,168,76,0.15)]',
    'hover:shadow-gold-lg',
  ],
  ['hover:border-[#C9A84C]/40', 'hover:border-gold-300/80'],
  ['#C9A84C', 'var(--gold-400)'],
  ['hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]', 'hover:shadow-gold-sm'],
  ['hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]', 'hover:shadow-gold'],
  ['hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]', 'hover:shadow-gold'],
  ['hover:shadow-[0_20px_60px_rgba(201,168,76,0.15)]', 'hover:shadow-gold-card'],
  ['hover:shadow-[0_0_20px_rgba(201,168,76,0.12)]', 'hover:shadow-gold-sm'],
  ['shadow-[0_20px_60px_rgba(201,168,76,0.18)]', 'shadow-gold-card'],
  ['shadow-[0_0_40px_rgba(201,168,76,0.35)]', 'shadow-gold-lg'],
  ['hover:shadow-[0_0_20px_rgba(201,168,76,0.35)]', 'hover:shadow-gold-sm'],
  ['hover:shadow-[0_0_20px_rgba(201,168,76,0.35)]', 'hover:shadow-gold-sm'],
  ['bg-gray-200 dark:bg-white/10', 'bg-surface-alt dark:bg-white/10'],
  ['hover:bg-gray-300 dark:hover:bg-white/20', 'hover:bg-gold-100 dark:hover:bg-white/20'],
  ['hover:bg-gray-200 dark:hover:bg-white/20', 'hover:bg-gold-100 dark:hover:bg-white/20'],
  ['from-gray-600 to-gray-400', 'from-stone-600 to-stone-400'],
  ['from-gray-700 to-gray-500', 'from-stone-700 to-stone-500'],
  ['text-gray-300', 'text-ink-subtle'],
  ['bg-gray-800 text-white dark:bg-white/20', 'bg-dark-card text-white dark:bg-white/20'],
  ['border-gray-100 dark:border-white/10', 'border-soft-border/40 dark:border-white/10'],
  ['bg-gray-50 dark:bg-white/5', 'bg-surface-alt dark:bg-surface'],
  ['from-gray-50 to-blue-50', 'from-cream-soft to-gold-50'],
  [
    'bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.1)_0%,transparent_70%)]',
    'bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold-400)_10%,transparent)_0%,transparent_70%)]',
  ],
  [
    'bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]',
    'bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold-400)_8%,transparent)_0%,transparent_70%)]',
  ],
  [
    'bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06)_0%,transparent_70%)]',
    'bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold-400)_6%,transparent)_0%,transparent_70%)]',
  ],
];

// Standalone bg-gray-50 — avoid breaking gray-500/10 etc.
function applyReplacements(content) {
  for (const [from, to] of REPLACEMENTS) {
    content = content.split(from).join(to);
  }
  return content.replace(/\bbg-gray-50\b/g, 'bg-surface-alt');
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

let updated = 0;
for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    content = applyReplacements(content);
    if (content !== original) {
      fs.writeFileSync(file, content);
      updated += 1;
      console.log('updated:', path.relative(ROOT, file));
    }
  }
}

console.log(`Done. ${updated} files updated.`);
