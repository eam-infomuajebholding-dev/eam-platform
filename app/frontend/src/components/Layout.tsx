import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Footer from './Footer';
import EditToolbar from './admin/EditToolbar';
import { isAssistantVisible } from '@/config/assistant';
import { GlobalEditOverlay, applySavedEdits } from './admin/InlineEditable';
import SectionManager from './admin/SectionManager';
import { getPageBackground, type PageBackground } from './admin/PageBackgroundEditor';
import { getVideoFromIDB } from '@/lib/videoStorage';
import { getCustomNavLinks, type CustomNavLink } from './admin/PageManager';
import UserActions from './Navbar/UserActions';
import PublicRouteMeta from './PublicRouteMeta';
import { isCommandCenterOpenAccessEnabled } from '@/config/commandCenterDevAccess';

const navLinks = [
  { path: '/about', labelKey: 'nav.about' as const },
  { path: '/services', labelKey: 'nav.services' as const },
  { path: '/projects', labelKey: 'nav.projects' as const },
  { path: '/invest', labelKey: 'nav.invest' as const },
  { path: '/careers', labelKey: 'nav.careers' as const },
  { path: '/blog', labelKey: 'nav.blog' as const },
  { path: '/contact', labelKey: 'nav.contact' as const },
];

/** TEMP: surface Command Center in main nav while building it out (dev / explicit flag). */
const commandCenterNavLink = { path: '/command-center', labelKey: 'auth.commandCenter' as const };

const showCommandCenterInMainNav =
  isCommandCenterOpenAccessEnabled || import.meta.env.VITE_SHOW_COMMAND_CENTER_NAV === 'true';

const homeNavLink = { path: '/', labelKey: 'nav.home' as const };

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [pageBg, setPageBg] = useState<PageBackground | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [customNavLinks, setCustomNavLinks] = useState<CustomNavLink[]>([]);
  const { theme, toggleTheme } = useTheme();
  const { direction, language, t } = useLanguage();

  // Load custom nav links
  useEffect(() => {
    const loadCustomLinks = () => {
      setCustomNavLinks(getCustomNavLinks());
    };
    loadCustomLinks();
    window.addEventListener('nav-links-changed', loadCustomLinks);
    return () => window.removeEventListener('nav-links-changed', loadCustomLinks);
  }, []);

  // Load and listen for background changes
  useEffect(() => {
    const loadBg = () => {
      setPageBg(getPageBackground(location.pathname));
    };
    loadBg();
    window.addEventListener('page-bg-changed', loadBg);
    return () => window.removeEventListener('page-bg-changed', loadBg);
  }, [location.pathname]);

  // Resolve video source from IndexedDB when pageBg is video
  useEffect(() => {
    let revoked = false;
    let currentUrl: string | null = null;

    if (pageBg && pageBg.type === 'video') {
      if (pageBg.value.startsWith('idb://')) {
        const idbKey = pageBg.value.replace('idb://', '');
        getVideoFromIDB(idbKey).then((url) => {
          if (!revoked) {
            currentUrl = url;
            setVideoSrc(url);
          } else if (url) {
            URL.revokeObjectURL(url);
          }
        });
      } else {
        // Legacy or direct URL
        setVideoSrc(pageBg.value);
      }
    } else {
      setVideoSrc(null);
    }

    return () => {
      revoked = true;
      if (currentUrl && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [pageBg]);

  // Apply saved inline edits on page load and route change
  useEffect(() => {
    // applySavedEdits now has its own internal retry logic (0ms, 300ms, 800ms)
    applySavedEdits();
  }, [location.pathname]);

  const handleToggleTheme = useCallback(() => {
    setIsToggling(true);
    toggleTheme();
    setTimeout(() => setIsToggling(false), 600);
  }, [toggleTheme]);

  const resolvedNavLinks = [
    homeNavLink,
    ...(showCommandCenterInMainNav ? [commandCenterNavLink] : []),
    ...navLinks,
  ];
  const isNavActive = (path: string) => location.pathname === path;
  const shellClassName =
    'min-h-screen bg-background font-sans text-foreground antialiased transition-colors duration-300';

  return (
    <div className={shellClassName} dir={direction}>
      <PublicRouteMeta />
      {/* Navigation */}
      <nav className="site-nav">
        <div dir="ltr" className="site-nav-inner container mx-auto w-full">
          {/* Utilities — physical left */}
          <div className="site-nav-utilities">
            <div className="hidden md:block">
              <UserActions />
            </div>
            <button
              type="button"
              onClick={handleToggleTheme}
              className="site-nav-icon-btn relative md:hidden"
              aria-label={t('aria.toggleTheme')}
            >
              <div
                className={`relative w-5 h-5 overflow-hidden transition-transform duration-600 ${
                  isToggling ? 'rotate-[360deg] scale-110' : 'rotate-0 scale-100'
                }`}
                style={{ transitionDuration: '0.6s' }}
              >
                <Sun
                  size={20}
                  className={`absolute inset-0 text-gold transition-all duration-500 ${
                    theme === 'dark'
                      ? 'rotate-0 scale-100 opacity-100'
                      : 'rotate-90 scale-0 opacity-0'
                  }`}
                />
                <Moon
                  size={20}
                  className={`absolute inset-0 text-gold transition-all duration-500 ${
                    theme === 'light'
                      ? 'rotate-0 scale-100 opacity-100'
                      : '-rotate-90 scale-0 opacity-0'
                  }`}
                />
              </div>
            </button>

            <button
              type="button"
              className="site-nav-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Nav Links — center */}
          <ul dir={direction} className="site-nav-links">
            {[...resolvedNavLinks, ...customNavLinks].map((link) => {
              const active = isNavActive(link.path);
              return (
                <li key={link.path} className="shrink-0">
                  <Link
                    to={link.path}
                    className={`site-nav-link${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {'labelKey' in link ? t(link.labelKey) : link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Brand lockup — emblem at physical far right */}
          <Link to="/" className="site-nav-brand">
            <span
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              className="site-nav-brand-copy notranslate"
            >
              <span className="site-nav-brand-name">{t('brand.name')}</span>
              {language === 'ar' ? (
                <span dir="ltr" className="site-nav-brand-latin notranslate">
                  {t('brand.nameLatin')}
                </span>
              ) : null}
            </span>
            <img
              src="/assets/eam-emblem-transparent.png"
              alt={t('brand.logoAlt')}
              onError={(event) => {
                event.currentTarget.src = '/assets/logo.png';
              }}
              className="site-nav-brand-emblem"
              loading="eager"
              decoding="async"
            />
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="site-nav-mobile-panel lg:hidden">
            <ul className="container mx-auto flex flex-col gap-0.5 px-4 py-3 sm:px-6">
              {[...resolvedNavLinks, ...customNavLinks].map((link) => {
                const active = isNavActive(link.path);
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`site-nav-mobile-link${active ? ' is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {'labelKey' in link ? t(link.labelKey) : link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-2 border-t border-soft-border/60 pt-3 dark:border-gold/15">
                <UserActions
                  variant="mobile"
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </li>
            </ul>
          </div>
        )}
      </nav>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t('site.skipToContent')}
      </a>

      {/* Main Content */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`site-nav-offset relative ${
          isAssistantVisible(location.pathname) ? 'pb-24 sm:pb-28' : ''
        }`}
      >
        {/* Background Layer */}
        {pageBg && pageBg.type === 'color' && (
          <div
            className="absolute inset-0 z-0"
            style={{ backgroundColor: pageBg.value }}
          />
        )}
        {pageBg && pageBg.type === 'image' && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${pageBg.value})`,
              opacity: pageBg.opacity ?? 0.3,
            }}
          />
        )}
        {pageBg && pageBg.type === 'video' && videoSrc && (
          <video
            key={videoSrc}
            className="absolute inset-0 z-0 w-full h-full object-cover"
            style={{ opacity: pageBg.opacity ?? 0.4 }}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        <div className="relative z-10">{children}</div>
      </main>

      <Footer flushWithHomeContact={location.pathname === '/'} />

      {/* Edit Mode Toolbar */}
      <EditToolbar />

      {/* Global Edit Overlay (event delegation approach) */}
      <GlobalEditOverlay />

      {/* Section Manager (add/delete sections in edit mode) */}
      <SectionManager />
    </div>
  );
}