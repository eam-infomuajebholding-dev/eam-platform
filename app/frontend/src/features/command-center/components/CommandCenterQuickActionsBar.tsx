import { Link } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  FolderPlus,
  RefreshCw,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  isOwner: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export default function CommandCenterQuickActionsBar({ isOwner, onRefresh, refreshing }: Props) {
  const { t } = useLanguage();

  const actions = [
    {
      key: 'project',
      to: '/operations/service-requests',
      icon: FolderPlus,
      label: t('commandCenter.quickActions.newProject'),
      ownerOnly: false,
    },
    {
      key: 'opportunity',
      to: '/invest',
      icon: Sparkles,
      label: t('commandCenter.quickActions.opportunity'),
      ownerOnly: false,
    },
    {
      key: 'report',
      to: '#leadership',
      icon: ClipboardList,
      label: t('commandCenter.quickActions.report'),
      ownerOnly: false,
    },
    {
      key: 'users',
      to: '/admin',
      icon: Users,
      label: t('commandCenter.quickActions.users'),
      ownerOnly: true,
    },
    {
      key: 'notify',
      to: '/contact',
      icon: Send,
      label: t('commandCenter.quickActions.notify'),
      ownerOnly: false,
    },
    {
      key: 'analytics',
      to: '/command-center#platform-sections',
      icon: BarChart3,
      label: t('commandCenter.quickActions.analytics'),
      ownerOnly: false,
    },
  ] as const;

  return (
    <div className="border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-background/95">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2">
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-ink-muted sm:block">
          {t('commandCenter.quickActions.title')}
        </p>
        <div className="flex flex-1 flex-wrap gap-2">
          {actions
            .filter((action) => !action.ownerOnly || isOwner)
            .map(({ key, to, icon: Icon, label }) => (
              <Link
                key={key}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/8 px-3 py-1.5 text-xs font-semibold text-gold-800 transition hover:bg-gold/15 dark:text-gold-200"
              >
                <Icon size={14} aria-hidden />
                {label}
              </Link>
            ))}
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-full border border-soft-border px-3 py-1.5 text-xs font-semibold text-ink/75 transition hover:bg-cream-light dark:text-white/75"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : undefined} aria-hidden />
              {t('commandCenter.refresh')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
