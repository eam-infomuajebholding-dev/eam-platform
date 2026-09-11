import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Footer from './Footer';
import AIChatbot from './AIChatbot';
import EditToolbar from './admin/EditToolbar';
import { GlobalEditOverlay, applySavedEdits } from './admin/InlineEditable';
import SectionManager from './admin/SectionManager';
import { getPageBackground, type PageBackground } from './admin/PageBackgroundEditor';
import { getVideoFromIDB } from '@/lib/videoStorage';
import { getCustomNavLinks, type CustomNavLink } from './admin/PageManager';
import UserActions from './Navbar/UserActions';

const navLinks = [
  { path: '/about', label: 'عن EAM' },
  { path: '/services', label: 'الخدمات' },
  { path: '/projects', label: 'المشاريع' },
  { path: '/invest', label: 'مستثمر معنا' },
  { path: '/market', label: 'سوقنا' },
  { path: '/careers', label: 'التوظيف' },
  { path: '/blog', label: 'المدونة' },
  { path: '/contact', label: 'تواصل معنا' },
];

const homeNavLink = { path: '/', label: 'الرئيسية' };

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [pageBg, setPageBg] = useState<PageBackground | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [customNavLinks, setCustomNavLinks] = useState<CustomNavLink[]>([]);
  const { theme, toggleTheme } = useTheme();

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

  const isHomepage = location.pathname === '/';
  const navHeightClass = isHomepage ? 'h-[84px] min-h-[84px]' : 'h-[86px] min-h-[86px]';
  const mainOffsetClass = isHomepage ? 'pt-[84px]' : 'pt-[86px]';
  const resolvedNavLinks = isHomepage ? [homeNavLink, ...navLinks] : navLinks;
  const shellClassName = isHomepage
    ? 'min-h-screen bg-cream text-ink dark:bg-[#5E5E5E] dark:text-white font-tajawal transition-colors duration-300'
    : 'min-h-screen bg-background dark:bg-[#5E5E5E] text-[#2D2A1E] dark:text-white font-tajawal transition-colors duration-300';
  const navClassName = isHomepage
    ? 'fixed top-0 right-0 left-0 z-50 border-b border-soft-border/80 bg-cream-light/95 backdrop-blur-md dark:border-gold/20 dark:bg-[#6B6B6B]/95 transition-colors duration-300'
    : 'fixed top-0 right-0 left-0 z-50 bg-white/95 dark:bg-[#6B6B6B]/95 backdrop-blur-md border-b border-gold/30 dark:border-gold/20 transition-colors duration-300';

  return (
    <div className={shellClassName} dir="rtl">
      {/* Navigation */}
      <nav className={navClassName}>
        <div className={`container mx-auto flex ${navHeightClass} items-center justify-between px-4 lg:px-7`}>
          {/* Logo — far right in RTL */}
          <Link to="/" className={`flex shrink-0 items-center gap-2 ${isHomepage ? 'max-w-[230px]' : ''}`}>
            <img
              src="/assets/eam-emblem-transparent.png"
              alt="إعمار الأصالة والمعاصرة"
              onError={(event) => {
                event.currentTarget.src = '/assets/logo.png';
              }}
              className={`w-auto object-contain ${isHomepage ? 'h-11 max-h-11' : 'h-10 md:h-12'}`}
              loading="eager"
              decoding="async"
            />
            <span className={`hidden font-tajawal font-bold text-deep-gold sm:block ${isHomepage ? 'text-[14px] leading-tight' : 'text-[15px]'}`}>
              إعمار الأصالة والمعاصرة
              <span className={`block font-normal uppercase tracking-wide text-ink/55 ${isHomepage ? 'text-[9px]' : 'text-xs'}`}>
                Emmar Al Asala Wa Al Muasara
              </span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
            {[...resolvedNavLinks, ...customNavLinks].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`px-2 py-1 rounded-md transition-colors duration-200 xl:px-2.5 ${
                    isHomepage ? 'text-[13px]' : 'text-[13px] xl:text-sm'
                  } ${
                    location.pathname === link.path
                      ? 'font-bold text-deep-gold border-b-2 border-primary-gold'
                      : 'text-ink/80 dark:text-white/80 hover:text-deep-gold hover:bg-primary-gold/10'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Account, theme & mobile menu */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <UserActions />
            </div>
            <button
              onClick={handleToggleTheme}
              className="relative rounded-full bg-primary-gold/10 p-2 transition-all duration-300 hover:bg-primary-gold/20 dark:bg-white/10 dark:hover:bg-white/20 group md:hidden"
              aria-label="تبديل الوضع"
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

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gold p-2 rounded-md hover:bg-gold/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/98 dark:bg-[#6B6B6B]/98 backdrop-blur-md border-t border-gold/20 dark:border-gold/10 transition-colors duration-300">
            <ul className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {[...resolvedNavLinks, ...customNavLinks].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-md text-sm transition-colors duration-200 ${
                      location.pathname === link.path
                        ? 'text-gold bg-gold/10 font-bold border-r-4 border-gold'
                        : 'text-ink/80 dark:text-white/80 hover:text-deep-gold hover:bg-primary-gold/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-gold/20 pt-3">
                <UserActions
                  variant="mobile"
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className={`relative ${mainOffsetClass}`}>
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

      <Footer />

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Edit Mode Toolbar */}
      <EditToolbar />

      {/* Global Edit Overlay (event delegation approach) */}
      <GlobalEditOverlay />

      {/* Section Manager (add/delete sections in edit mode) */}
      <SectionManager />
    </div>
  );
}