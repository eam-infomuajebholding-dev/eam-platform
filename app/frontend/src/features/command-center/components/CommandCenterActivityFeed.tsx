import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Info } from 'lucide-react';
import {
  buildActivityFeed,
  formatRelativeTimestamp,
} from '@/features/command-center/lib/dashboardUtils';
import type { CommandCenterOverview } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type Props = {
  overview: CommandCenterOverview;
};

function toneIcon(tone: 'info' | 'warning' | 'critical' | 'success') {
  if (tone === 'critical' || tone === 'warning') return AlertTriangle;
  if (tone === 'success') return CheckCircle2;
  return Info;
}

export default function CommandCenterActivityFeed({ overview }: Props) {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const items = buildActivityFeed(overview);

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-surface">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-ink dark:text-white">{t('commandCenter.activity.title')}</h3>
        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold-700">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('commandCenter.activity.empty')}</p>
      ) : (
        <ul className="max-h-[420px] space-y-2 overflow-y-auto">
          {items.map((item) => {
            const Icon = toneIcon(item.tone);
            const body = (
              <div
                className={cn(
                  'rounded-xl border px-3 py-2.5',
                  item.tone === 'critical' && 'border-red-200 bg-red-50/70',
                  item.tone === 'warning' && 'border-amber-200 bg-amber-50/70',
                  item.tone === 'success' && 'border-emerald-200 bg-emerald-50/70',
                  item.tone === 'info' && 'border-soft-border/70 bg-cream-light/70 dark:bg-surface-muted',
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink dark:text-white">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-secondary">{item.summary}</p>
                    {item.timestamp ? (
                      <p className="mt-1 text-[11px] text-ink-muted">
                        {formatRelativeTimestamp(item.timestamp, locale)}
                      </p>
                    ) : null}
                  </div>
                  {item.href ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" /> : null}
                </div>
              </div>
            );

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link to={item.href} className="block transition hover:opacity-90">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
