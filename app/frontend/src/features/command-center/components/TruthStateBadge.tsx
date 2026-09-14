import type { CommandCenterMessageKey } from '@/i18n/commandCenterMessages';
import type { TruthState } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';

const TRUTH_STATE_KEYS: Record<TruthState, CommandCenterMessageKey> = {
  LIVE: 'commandCenter.truthState.LIVE',
  STALE: 'commandCenter.truthState.STALE',
  PARTIAL: 'commandCenter.truthState.PARTIAL',
  ESTIMATED: 'commandCenter.truthState.ESTIMATED',
  NOT_AVAILABLE: 'commandCenter.truthState.NOT_AVAILABLE',
  NOT_YET_OPERATIONAL: 'commandCenter.truthState.NOT_YET_OPERATIONAL',
  BLOCKED: 'commandCenter.truthState.BLOCKED',
  UNKNOWN: 'commandCenter.truthState.UNKNOWN',
};

export default function TruthStateBadge({ state }: { state?: TruthState }) {
  const { t } = useLanguage();
  if (!state || state === 'LIVE') return null;
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      {t(TRUTH_STATE_KEYS[state])}
    </span>
  );
}
