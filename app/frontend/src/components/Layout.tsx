import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Footer from './Footer';
import AIChatbot from './AIChatbot';

const navLinks = [
  { path: '/', label: 'الرئيسية' },
  { path: '/services', label: 'خدماتنا' },
  { path: '/about', label: 'من نحن' },
  { path: '/projects', label: 'مشاريعنا' },
  { path: '/team', label: 'فريقنا' },
  { path: '/consultation', label: 'طلب استشارة' },
  { path: '/market', label: 'سوقنا' },
  { path: '/contact', label: 'اتصل بنا' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleToggleTheme = useCallback(() => {
    setIsToggling(true);
    toggleTheme();
    setTimeout(() => setIsToggling(false), 600);
  }, [toggleTheme]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark text-[#2D2A1E] dark:text-white font-tajawal transition-colors duration-300" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 bg-white/95 dark:bg-[#1a1a2e]/95 backdrop-blur-md border-b border-gold/30 dark:border-gold/20 transition-colors duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between mt-[0px] mr-[25.6px] mb-[0px] ml-[25.6px] pt-[12px] pr-[16px] pb-[12px] pl-[16px] rounded-none text-[16px] font-normal text-[#2D2A1E] bg-[#00000000] opacity-100">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[16px] font-normal text-[#2D2A1E] bg-[#00000000] opacity-100">
            <img
              src="/assets/logo.jpeg"
              alt="إعمار الأصالة والمعاصرة"
              className="h-12 w-auto rounded-lg object-contain border-2 border-gold/50"
            />
            <span className="font-tajawal md:text-base hidden sm:block mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[16px] font-bold text-[#D3B051] bg-[#00000000] opacity-100">
              إعمار الأصالة والمعاصرة<br />Emmar Al Asala Wa Al Muasara
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-1 xl:gap-3">
            {navLinks.map((link) => (
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
          <div className="lg:hidden bg-white/98 dark:bg-[#1a1a2e]/98 backdrop-blur-md border-t border-gold/20 dark:border-gold/10 transition-colors duration-300">
            <ul className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
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
      <main className="pt-[72px]">{children}</main>

      {/* Footer */}
      <Footer />

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}