import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-dark text-white font-tajawal" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-md border-b border-gold/20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/logo.jpeg"
              alt="إعمار الأصالة والمعاصرة"
              className="h-12 w-auto rounded-lg object-contain border-2 border-gold/50"
            />
            <span className="text-gold font-tajawal font-bold text-sm md:text-base hidden sm:block">
              إعمار الأصالة والمعاصرة
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
                      : 'text-white/80 hover:text-gold hover:bg-gold/5'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gold p-2 rounded-md hover:bg-gold/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1a1a2e]/98 backdrop-blur-md border-t border-gold/10">
            <ul className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-md text-sm transition-colors duration-200 ${
                      location.pathname === link.path
                        ? 'text-gold bg-gold/10 font-bold border-r-4 border-gold'
                        : 'text-white/80 hover:text-gold hover:bg-gold/5'
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