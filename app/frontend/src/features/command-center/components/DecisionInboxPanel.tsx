import type { AttentionItem } from '@/features/command-center/types';
import TruthStateBadge from '@/features/command-center/components/TruthStateBadge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  items: AttentionItem[];
}

export default function DecisionInboxPanel({ items }: Props) {
  const { t } = useLanguage();
  const decisions = items.filter((item) => item.severity === 'DECISION');

  if (!decisions.length) {
    return (
      <div className="rounded-2xl border border-gold/15 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
        <h3 className="mb-2 font-bold text-ink dark:text-white">{t('commandCenter.decisionInbox.title')}</h3>
        <p className="text-sm text-ink/60 dark:text-white/60">{t('commandCenter.decisionInbox.empty')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gold/15 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-ink dark:text-white">{t('commandCenter.decisionInbox.title')}</h3>
        <TruthStateBadge state="BLOCKED" />
      </div>
      <ul className="space-y-3">
        {decisions.map((item) => (
          <li key={item.id} className="rounded-xl border border-gold/10 p-3 dark:border-white/10">
            <p className="text-sm font-semibold text-ink dark:text-white">{item.title_ar}</p>
            <p className="mt-1 text-xs text-ink/60 dark:text-white/60">{item.why_ar}</p>
            <p className="mt-2 text-xs text-ink/40">
              {t('commandCenter.decisionInbox.source')}: {item.source}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink/50">{t('commandCenter.decisionInbox.footer')}</p>
    </div>
  );
}
