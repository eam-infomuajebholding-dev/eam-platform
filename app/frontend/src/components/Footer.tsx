import { useState } from 'react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { path: '/', label: 'الرئيسية' },
  { path: '/services', label: 'خدماتنا' },
  { path: '/about', label: 'من نحن' },
  { path: '/projects', label: 'مشاريعنا' },
  { path: '/team', label: 'فريقنا' },
  { path: '/consultation', label: 'طلب استشارة' },
  { path: '/market', label: 'سوقنا' },
  { path: '/contact', label: 'اتصل بنا' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail('');
  };

  return (
    <footer className="bg-[#FDF6E3] dark:bg-[#1a1a2e] border-t border-gold/30 dark:border-gold/20 py-12 transition-colors duration-300" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="flex flex-col items-start gap-4">
            <img
              src="/assets/logo.jpeg"
              alt="إعمار الأصالة والمعاصرة"
              className="h-16 w-auto rounded-lg object-contain border-2 border-gold/50"
            />
            <h3 className="text-gold font-tajawal font-bold text-lg">
              إعمار الأصالة والمعاصرة للاستشارات الهندسية
            </h3>
            <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed">
              نقدم خدمات هندسية واستشارية متميزة تجمع بين الأصالة والمعاصرة لتحقيق رؤية عملائنا بأعلى معايير الجودة والاحترافية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold font-bold mb-4 text-lg">روابط سريعة</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-white/70 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-gold font-bold mb-4 text-lg">النشرة البريدية</h4>
            <p className="text-gray-600 dark:text-white/60 text-sm mb-4">
              اشترك للحصول على آخر الأخبار والمشاريع.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-white/10 border border-gold/30 text-[#2D2A1E] dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors text-sm"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-l from-[#c9a84c] to-[#e8a020] text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                اشترك الآن
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 dark:text-white/50 text-sm">
            © {new Date().getFullYear()} إعمار الأصالة والمعاصرة للاستشارات الهندسية. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-gray-500 dark:text-white/50 hover:text-gold transition-colors text-sm">
              سياسة الخصوصية
            </Link>
            <span className="text-gray-300 dark:text-white/30">|</span>
            <Link to="/terms" className="text-gray-500 dark:text-white/50 hover:text-gold transition-colors text-sm">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}