import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
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
  const items = buildActivityFeed(overview).slice(0, 5);

  return (
    <section className="command-center-panel command-center-notifications">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="command-center-panel__title">{t('commandCenter.notificationsTitle')}</h3>
        <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('commandCenter.activity.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = toneIcon(item.tone);
            const body = (
              <div className="command-center-notifications__item">
                <span className={cn('command-center-notifications__icon', `command-center-notifications__icon--${item.tone}`)}>
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink dark:text-white">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-secondary">{item.summary}</p>
                  {item.timestamp ? (
                    <p className="mt-1 text-[10px] text-ink-muted">
                      {formatRelativeTimestamp(item.timestamp, locale)}
                    </p>
                  ) : null}
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
