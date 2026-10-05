import { Link } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  Globe2,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  Newspaper,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

const LAUNCHER_LINKS = [
  { to: '/command-center', labelKey: 'commandCenter.nav.dashboard' as const, icon: LayoutDashboard },
  { to: '/about', labelKey: 'nav.about' as const, icon: Globe2 },
  { to: '/services', labelKey: 'nav.services' as const, icon: Briefcase },
  { to: '/projects', labelKey: 'nav.projects' as const, icon: BarChart3 },
  { to: '/invest', labelKey: 'nav.invest' as const, icon: TrendingUp },
  { to: '/market', labelKey: 'nav.market' as const, icon: ShoppingBag },
  { to: '/careers', labelKey: 'nav.careers' as const, icon: Users },
  { to: '/blog', labelKey: 'nav.blog' as const, icon: Newspaper },
  { to: '/contact', labelKey: 'nav.contact' as const, icon: Mail },
];

export default function CommandCenterAppLauncher() {
  const { t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="command-center-header__icon-btn" aria-label={t('commandCenter.launcher.title')}>
          <LayoutGrid size={18} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('commandCenter.launcher.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LAUNCHER_LINKS.map(({ to, labelKey, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild>
            <Link to={to} className="flex items-center gap-2">
              <Icon size={16} aria-hidden />
              {t(labelKey)}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
