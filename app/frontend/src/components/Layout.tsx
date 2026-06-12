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

const navLinks = [
  { path: '/', label: 'الرئيسية' },
  { path: '/about', label: 'من نحن' },
  { path: '/services', label: 'خدماتنا' },
  { path: '/projects', label: 'مشاريعنا' },
  { path: '/team', label: 'فريقنا' },
  { path: '/careers', label: 'التوظيف' },
  { path: '/invest', label: 'استثمر معنا' },
  { path: '/market', label: 'سوقنا' },
    { path: '/consultation', label: 'طلب استشارة' },
  { path: '/contact', label: 'اتصل بنا' },
];

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
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      applySavedEdits();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleToggleTheme = useCallback(() => {
    setIsToggling(true);
    toggleTheme();
    setTimeout(() => setIsToggling(false), 600);
  }, [toggleTheme]);

  return (
    <div className="min-h-screen bg-background dark:bg-[#111111] text-[#2D2A1E] dark:text-white font-tajawal transition-colors duration-300" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-b border-gold/30 dark:border-gold/20 transition-colors duration-300">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[16px] font-normal text-[#2D2A1E] bg-[#00000000] opacity-100">
            <img
              src="/assets/logo.jpeg"
              alt="إعمار الأصالة والمعاصرة"
              className="h-10 md:h-12 w-auto rounded-lg object-contain border-2 border-gold/50"
            />
            <span className="font-tajawal md:text-base hidden sm:block mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[16px] font-bold text-[#D3B051] bg-[#00000000] opacity-100">
              إعمار الأصالة والمعاصرة<br />Emmar Al Asala Wa Al Muasara
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-1 xl:gap-3">
            {[...navLinks, ...customNavLinks].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-gold font-bold border-b-2 border-gold'
                      : 'text-gray-700 dark:text-white/80 hover:text-gold hover:bg-gold/5'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="relative p-2 rounded-full bg-gold/10 dark:bg-white/10 hover:bg-gold/20 dark:hover:bg-white/20 transition-all duration-300 group"
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
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/98 dark:bg-[#1a1a1a]/98 backdrop-blur-md border-t border-gold/20 dark:border-gold/10 transition-colors duration-300">
            <ul className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {[...navLinks, ...customNavLinks].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-md text-sm transition-colors duration-200 ${
                      location.pathname === link.path
                        ? 'text-gold bg-gold/10 font-bold border-r-4 border-gold'
                        : 'text-gray-700 dark:text-white/80 hover:text-gold hover:bg-gold/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-[72px] relative">
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

      {/* Footer */}
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