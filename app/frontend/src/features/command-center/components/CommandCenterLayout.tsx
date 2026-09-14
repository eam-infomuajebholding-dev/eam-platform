import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  Globe2,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import CommandCenterNotificationsSheet from '@/features/command-center/components/CommandCenterNotificationsSheet';
import CommandCenterQuickActionsBar from '@/features/command-center/components/CommandCenterQuickActionsBar';
import type { CommandCenterOverview } from '@/features/command-center/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const MAIN_LINKS = [
  { to: '/command-center', labelKey: 'commandCenter.nav.dashboard' as const, icon: LayoutDashboard },
  { to: '/about', labelKey: 'nav.about' as const, icon: Globe2 },
  { to: '/services', labelKey: 'nav.services' as const, icon: Briefcase },
  { to: '/projects', labelKey: 'nav.projects' as const, icon: BarChart3 },
];

const INTERNAL_LINKS = [
  { to: '/operations/service-requests', labelKey: 'commandCenter.nav.review' as const, icon: Shield },
  { to: '/command-center#delegations', labelKey: 'commandCenter.nav.delegations' as const, icon: Users },
  { to: '/admin', labelKey: 'commandCenter.nav.settings' as const, icon: Settings },
];

type CommandCenterLayoutProps = {
  children: React.ReactNode;
  overview?: CommandCenterOverview | null;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export default function CommandCenterLayout({
  children,
  overview,
  onRefresh,
  refreshing,
}: CommandCenterLayoutProps) {
  const { user, logout, isCommandCenterOwner, commandCenterAccess } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#eef1f4] text-ink dark:bg-background">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[#1a2634] text-white lg:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-gold-300">EAM</p>
            <h1 className="mt-1 text-lg font-bold">{t('commandCenter.title')}</h1>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                {t('commandCenter.nav.main')}
              </p>
              <ul className="space-y-1">
                {MAIN_LINKS.map(({ to, labelKey, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      aria-current={location.pathname === to ? 'page' : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                        location.pathname === to
                          ? 'bg-gold/20 text-gold-200'
                          : 'text-white/75 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                {t('commandCenter.nav.internal')}
              </p>
              <ul className="space-y-1">
                {INTERNAL_LINKS.map(({ to, labelKey, icon: Icon }) => {
                  if (labelKey === 'commandCenter.nav.delegations' && !isCommandCenterOwner) {
                    return null;
                  }
                  if (labelKey === 'commandCenter.nav.settings' && !isCommandCenterOwner) {
                    return null;
                  }
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        aria-current={location.pathname === to ? 'page' : undefined}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/8 hover:text-white"
                      >
                        <Icon size={16} />
                        {t(labelKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <div className="border-t border-white/10 px-4 py-4">
            <p className="truncate text-sm font-medium">{user?.name ?? user?.email}</p>
            <p className="truncate text-xs text-white/55">
              {commandCenterAccess?.role === 'owner'
                ? t('commandCenter.role.owner')
                : t('commandCenter.role.delegate')}
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/8"
            >
              <LogOut size={15} />
              {t('auth.logout')}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-background/90">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div>
                <p className="text-xs text-gold-600">{t('commandCenter.eyebrow')}</p>
                <p className="text-sm font-semibold text-ink dark:text-white">
                  {user?.name ?? user?.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-700 sm:inline">
                  {commandCenterAccess?.role === 'owner'
                    ? t('commandCenter.role.owner')
                    : t('commandCenter.role.delegate')}
                </span>
                <CommandCenterNotificationsSheet overview={overview} />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 pb-24 sm:px-6 lg:px-8">{children}</main>

          <CommandCenterQuickActionsBar
            isOwner={isCommandCenterOwner}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        </div>
      </div>
    </div>
  );
}
