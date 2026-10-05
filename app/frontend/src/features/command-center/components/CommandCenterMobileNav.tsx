import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';

const MOBILE_LINKS = [
  { to: '/command-center', labelKey: 'commandCenter.nav.dashboard' as const },
  { to: '/about', labelKey: 'nav.about' as const },
  { to: '/services', labelKey: 'nav.services' as const },
  { to: '/projects', labelKey: 'nav.projects' as const },
  { to: '/invest', labelKey: 'nav.invest' as const },
  { to: '/market', labelKey: 'nav.market' as const },
  { to: '/contact', labelKey: 'nav.contact' as const },
];

export default function CommandCenterMobileNav() {
  const { t } = useLanguage();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" className="command-center-header__icon-btn lg:hidden" aria-label={t('commandCenter.nav.main')}>
          <Menu size={18} aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[17rem] bg-[#1a2634] p-0 text-white">
        <SheetHeader className="border-b border-white/10 px-4 py-4 text-left">
          <SheetTitle className="text-white">EAM</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {MOBILE_LINKS.map(({ to, labelKey }) => (
            <Link
              key={to}
              to={to}
              className="command-center-sidebar__link"
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
