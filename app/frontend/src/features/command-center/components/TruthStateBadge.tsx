import type { TruthState } from '../types';

const LABELS: Record<TruthState, string> = {
  LIVE: 'مباشر',
  STALE: 'قديم',
  PARTIAL: 'جزئي',
  ESTIMATED: 'تقديري',
  NOT_AVAILABLE: 'غير متاح',
  NOT_YET_OPERATIONAL: 'غير تشغيلي بعد',
  BLOCKED: 'محظور',
  UNKNOWN: 'غير معروف',
};

export default function TruthStateBadge({ state }: { state?: TruthState }) {
  if (!state || state === 'LIVE') return null;
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-tajawal text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      {LABELS[state]}
    </span>
  );
}
