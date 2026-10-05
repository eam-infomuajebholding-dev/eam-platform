import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  FileText,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { getHomeImage } from '@/config/assets';
import CommandCenterAppLauncher from '@/features/command-center/components/CommandCenterAppLauncher';
import CommandCenterMobileNav from '@/features/command-center/components/CommandCenterMobileNav';
import CommandCenterNotificationsSheet from '@/features/command-center/components/CommandCenterNotificationsSheet';
import CommandCenterQuickActionsBar from '@/features/command-center/components/CommandCenterQuickActionsBar';
import CommandCenterValuesStrip from '@/features/command-center/components/CommandCenterValuesStrip';
import CommandSearchBar from '@/features/command-center/components/CommandSearchBar';
import LanguageSelector from '@/components/Navbar/LanguageSelector';
import type { CommandCenterOverview } from '@/features/command-center/types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

type MainLink = {
  to: string;
  labelKey:
    | 'commandCenter.nav.dashboard'
    | 'nav.about'
    | 'nav.services'
    | 'nav.projects'
    | 'nav.invest'
    | 'nav.market'
    | 'nav.careers'
    | 'nav.blog'
    | 'nav.contact';
  icon: typeof LayoutDashboard;
  matchCommandCenter?: boolean;
};

const MAIN_LINKS: MainLink[] = [
  { to: '/command-center', labelKey: 'commandCenter.nav.dashboard', icon: LayoutDashboard, matchCommandCenter: true },
  { to: '/about', labelKey: 'nav.about', icon: Globe2 },
  { to: '/services', labelKey: 'nav.services', icon: Briefcase },
  { to: '/projects', labelKey: 'nav.projects', icon: BarChart3 },
  { to: '/invest', labelKey: 'nav.invest', icon: TrendingUp },
  { to: '/market', labelKey: 'nav.market', icon: ShoppingBag },
  { to: '/careers', labelKey: 'nav.careers', icon: Users },
  { to: '/blog', labelKey: 'nav.blog', icon: Newspaper },
  { to: '/contact', labelKey: 'nav.contact', icon: Mail },
];

const INTERNAL_LINKS = [
  { to: '/admin', labelKey: 'commandCenter.nav.users' as const, icon: Users, ownerOnly: true },
  { to: '/admin', labelKey: 'commandCenter.nav.content' as const, icon: FileText, ownerOnly: true },
  { to: '/command-center#platform-sections', labelKey: 'commandCenter.nav.analytics' as const, icon: BarChart3, ownerOnly: false },
  { to: '/admin', labelKey: 'commandCenter.nav.settings' as const, icon: Settings, ownerOnly: true },
  { to: '/contact', labelKey: 'commandCenter.nav.help' as const, icon: HelpCircle, ownerOnly: false },
  { to: '/command-center#delegations', labelKey: 'commandCenter.nav.delegations' as const, icon: Users, ownerOnly: true },
] as const;

function userInitials(nameOrEmail: string): string {
  const parts = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return nameOrEmail.slice(0, 2).toUpperCase();
}

function isNavActive(pathname: string, link: MainLink) {
  if (link.matchCommandCenter) {
    return pathname === '/command-center' || pathname.startsWith('/command-center/');
  }
  return pathname === link.to;
}

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

  const roleLabel =
    commandCenterAccess?.role === 'owner'
      ? t('commandCenter.role.projectOwner')
      : t('commandCenter.role.delegate');
  const displayName = user?.name ?? user?.email ?? '';
  const sidebarScenic = getHomeImage('aboutCinematic');

  return (
    <div className="command-center-shell min-h-screen bg-[#f3f5f7] text-ink dark:bg-background">
      <div className="flex min-h-screen">
        <aside className="command-center-sidebar hidden w-[17rem] shrink-0 flex-col lg:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt=""
                className="h-10 w-10 rounded-full object-contain ring-1 ring-gold/35"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <p className="text-base font-bold tracking-wide text-white">EAM</p>
                <p className="line-clamp-2 text-[10px] leading-4 text-white/60">{t('brand.name')}</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                {t('commandCenter.nav.main')}
              </p>
              <ul className="space-y-1">
                {MAIN_LINKS.map((link) => {
                  const { to, labelKey, icon: Icon } = link;
                  const active = isNavActive(location.pathname, link);
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        aria-current={active ? 'page' : undefined}
                        className={`command-center-sidebar__link ${active ? 'command-center-sidebar__link--active' : ''}`}
                      >
                        <Icon size={16} aria-hidden />
                        {link.matchCommandCenter ? (
                          <span className="flex min-w-0 flex-col leading-tight">
                            <span>{t(labelKey)}</span>
                            <span className="text-[10px] font-normal text-white/50">Command Center</span>
                          </span>
                        ) : (
                          t(labelKey)
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                {t('commandCenter.nav.internal')}
              </p>
              <ul className="space-y-1">
                {INTERNAL_LINKS.map(({ to, labelKey, icon: Icon, ownerOnly }) => {
                  if (ownerOnly && !isCommandCenterOwner) {
                    return null;
                  }
                  return (
                    <li key={`${to}-${labelKey}`}>
                      <Link to={to} className="command-center-sidebar__link">
                        <Icon size={16} aria-hidden />
                        {t(labelKey)}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="command-center-sidebar__link w-full"
                  >
                    <LogOut size={16} aria-hidden />
                    {t('auth.logout')}
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          <div className="command-center-sidebar__slogan relative mt-auto min-h-[5.5rem] overflow-hidden">
            <ResponsiveImage asset={sidebarScenic} className="absolute inset-0 h-full w-full object-cover opacity-35" loading="lazy" />
            <p className="relative px-4 py-5 text-center text-[10px] font-semibold uppercase leading-relaxed tracking-wide text-white/85">
              {t('commandCenter.sidebar.slogan')}
            </p>
          </div>

        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="command-center-header sticky top-0 z-20 border-b border-black/5 bg-white/92 backdrop-blur dark:border-white/10 dark:bg-background/92">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[1fr_minmax(0,36rem)_1fr]">
              <div className="flex items-center gap-2 lg:hidden">
                <CommandCenterMobileNav />
                <p className="truncate text-sm font-semibold text-ink dark:text-white">
                  {t('commandCenter.title')}
                </p>
              </div>
              <div className="col-span-3 lg:col-span-1 lg:col-start-2">
                <CommandSearchBar variant="header" />
              </div>
              <div className="col-span-3 flex items-center justify-end gap-2 lg:col-span-1 lg:col-start-3">
                <CommandCenterNotificationsSheet overview={overview} />
                <CommandCenterAppLauncher />
                <LanguageSelector />
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="command-center-header__avatar">{userInitials(displayName)}</span>
                  <div className="max-w-[11rem]">
                    <p className="truncate text-sm font-semibold text-ink dark:text-white">{displayName}</p>
                    <p className="truncate text-[11px] text-ink-muted">{roleLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="command-center-main flex-1 px-4 py-5 pb-28 sm:px-6 lg:px-8">{children}</main>

          <div className="command-center-footer-actions sticky bottom-0 z-20">
            <CommandCenterQuickActionsBar
              isOwner={isCommandCenterOwner}
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
            <CommandCenterValuesStrip />
          </div>
        </div>
      </div>
    </div>
  );
}
