import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  buildActivityFeed,
  formatRelativeTimestamp,
} from '@/features/command-center/lib/dashboardUtils';
import type { CommandCenterOverview } from '@/features/command-center/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  overview: CommandCenterOverview | null | undefined;
};

export default function CommandCenterNotificationsSheet({ overview }: Props) {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const items = overview ? buildActivityFeed(overview) : [];
  const count = items.filter((item) => item.tone === 'critical' || item.tone === 'warning').length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-soft-border text-ink/70 transition hover:bg-cream-light dark:hover:bg-surface-muted"
          aria-label={t('commandCenter.notifications')}
        >
          <Bell size={16} />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          ) : null}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('commandCenter.notificationsTitle')}</SheetTitle>
          <SheetDescription>{t('commandCenter.notificationsSubtitle')}</SheetDescription>
        </SheetHeader>
        <ul className="mt-6 space-y-3">
          {items.length === 0 ? (
            <li className="text-sm text-ink-secondary">{t('commandCenter.activity.empty')}</li>
          ) : (
            items.map((item) => (
              <li key={item.id} className="rounded-xl border border-soft-border/70 px-3 py-2.5">
                <p className="text-sm font-semibold text-ink dark:text-white">{item.title}</p>
                <p className="mt-1 text-xs text-ink-secondary">{item.summary}</p>
                {item.timestamp ? (
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {formatRelativeTimestamp(item.timestamp, locale)}
                  </p>
                ) : null}
                {item.href ? (
                  <Link to={item.href} className="mt-2 inline-block text-xs font-semibold text-gold-700 hover:underline">
                    {t('commandCenter.viewDetails')}
                  </Link>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
