import type { MessageKey } from '@/i18n/messages';

/** Public marketing routes → i18n title key (indexable pages). */
export const PUBLIC_ROUTE_TITLES: Record<string, MessageKey> = {
  '/': 'hero.titleBefore',
  '/about': 'page.about.hero.title',
  '/services': 'page.services.hero.title',
  '/projects': 'page.projects.hero.title',
  '/contact': 'page.contact.hero.title',
  '/careers': 'page.careers.hero.title',
  '/invest': 'page.invest.hero.title',
  '/contact-card': 'page.contact.hero.title',
  '/consultation': 'page.consultation.hero.title',
  '/market': 'page.market.hero.title',
  '/team': 'page.team.hero.title',
  '/engineering-services': 'page.services.engineering.title',
  '/government-services': 'page.services.government.title',
  '/services/contracting': 'page.services.contracting.title',
  '/services/maintenance': 'page.services.maintenance.title',
  '/services/real-estate-development': 'page.red.hero.title',
  '/services/real-estate-marketing': 'page.rem.hero.title',
};

const PRIVATE_PREFIXES = [
  '/my-requests',
  '/payment',
  '/command-center',
  '/operations',
  '/auth',
  '/admin',
];

export function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function publicTitleKey(pathname: string): MessageKey | null {
  if (isPrivateRoute(pathname)) return null;
  if (PUBLIC_ROUTE_TITLES[pathname]) return PUBLIC_ROUTE_TITLES[pathname];
  if (pathname.startsWith('/journeys/')) return 'nav.services';
  if (pathname.startsWith('/sectors/')) return 'nav.services';
  if (pathname.startsWith('/blog')) return 'nav.blog';
  return null;
}
