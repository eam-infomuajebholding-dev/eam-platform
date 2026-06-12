import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Youtube, Globe, Facebook, Pencil } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';

const SOCIAL_STORAGE_KEY = 'social-media-links';

interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  snapchat: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
  website: string;
}

const defaultLinks: SocialLinks = {
  facebook: '#',
  instagram: '#',
  twitter: '#',
  snapchat: '#',
  linkedin: '#',
  tiktok: '#',
  youtube: '#',
  website: '#',
};

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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.095-.034.18-.063.247-.084a.64.64 0 01.235-.044c.18 0 .33.048.437.134.18.149.195.36.18.494a.86.86 0 01-.09.3c-.21.39-.93.585-1.084.63-.03.009-.06.015-.09.024-.18.045-.39.105-.435.27a.5.5 0 00.015.285c.135.33.42.705.72 1.095.48.63 1.02 1.335 1.305 2.13.015.045.03.09.045.135.12.375.12.69-.015.96-.27.525-.93.72-1.395.81-.105.015-.195.03-.285.045-.15.03-.255.06-.36.135-.075.06-.12.135-.18.24-.06.105-.165.3-.39.41a1.27 1.27 0 01-.555.12c-.21 0-.435-.045-.69-.09-.375-.075-.84-.165-1.455-.165-.3 0-.615.03-.93.06-.45.045-.87.195-1.32.36-.63.24-1.365.51-2.475.51h-.06c-1.11 0-1.845-.27-2.475-.51-.45-.165-.87-.315-1.32-.36a8.8 8.8 0 00-.93-.06c-.615 0-1.08.09-1.455.165-.255.045-.48.09-.69.09a1.27 1.27 0 01-.555-.12c-.225-.11-.33-.305-.39-.41-.06-.105-.105-.18-.18-.24-.105-.075-.21-.105-.36-.135-.09-.015-.18-.03-.285-.045-.465-.09-1.125-.285-1.395-.81-.135-.27-.135-.585-.015-.96.015-.045.03-.09.045-.135.285-.795.825-1.5 1.305-2.13.3-.39.585-.765.72-1.095a.5.5 0 00.015-.285c-.045-.165-.255-.225-.435-.27-.03-.009-.06-.015-.09-.024-.154-.045-.874-.24-1.084-.63a.86.86 0 01-.09-.3c-.015-.134 0-.345.18-.494a.58.58 0 01.437-.134.64.64 0 01.235.044c.067.021.152.05.247.084.263.094.622.23.922.214.198 0 .326-.045.401-.09a8.3 8.3 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.453 1.069 10.809.793 11.8.793h.406z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11V9.4a6.33 6.33 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.42a8.16 8.16 0 004.76 1.52V7.5a4.85 4.85 0 01-1-.81z" />
    </svg>
  );
}

interface SocialIconProps {
  platform: keyof SocialLinks;
  url: string;
  isEditMode: boolean;
  onEdit: (platform: keyof SocialLinks) => void;
}

function SocialIcon({ platform, url, isEditMode, onEdit }: SocialIconProps) {
  const iconClass = "w-5 h-5";

  const getIcon = () => {
    switch (platform) {
      case 'facebook':
        return <Facebook className={iconClass} />;
      case 'instagram':
        return <Instagram className={iconClass} />;
      case 'twitter':
        return <XIcon className={iconClass} />;
      case 'snapchat':
        return <SnapchatIcon className={iconClass} />;
      case 'linkedin':
        return <Linkedin className={iconClass} />;
      case 'tiktok':
        return <TikTokIcon className={iconClass} />;
      case 'youtube':
        return <Youtube className={iconClass} />;
      case 'website':
        return <Globe className={iconClass} />;
      default:
        return null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      onEdit(platform);
    }
  };

  return (
    <div className="relative group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gold/40 dark:border-gold/30 text-gray-700 dark:text-gold/80 hover:text-gold hover:border-gold dark:hover:text-gold dark:hover:border-gold transition-all duration-200 hover:scale-110"
        title={platform}
      >
        {getIcon()}
      </a>
      {isEditMode && (
        <button
          onClick={() => onEdit(platform)}
          className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title={`تعديل رابط ${platform}`}
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const { isEditMode } = useEditMode();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultLinks);

  useEffect(() => {
    const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSocialLinks({ ...defaultLinks, ...parsed });
      } catch {
        setSocialLinks(defaultLinks);
      }
    }
  }, []);

  const handleEditLink = useCallback((platform: keyof SocialLinks) => {
    const currentUrl = socialLinks[platform] === '#' ? '' : socialLinks[platform];
    const newUrl = window.prompt(`أدخل رابط ${platform}:`, currentUrl);
    if (newUrl !== null) {
      const updatedLinks = { ...socialLinks, [platform]: newUrl || '#' };
      setSocialLinks(updatedLinks);
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(updatedLinks));
    }
  }, [socialLinks]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  const platforms: (keyof SocialLinks)[] = [
    'facebook', 'instagram', 'twitter', 'snapchat',
    'linkedin', 'tiktok', 'youtube', 'website'
  ];

  return (
    <footer className="bg-gray-50 dark:bg-[#5E5E5E] border-t border-gold/30 dark:border-gold/20 py-12 transition-colors duration-300" dir="rtl">
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

            {/* Social Media Icons */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {platforms.map((platform) => (
                <SocialIcon
                  key={platform}
                  platform={platform}
                  url={socialLinks[platform]}
                  isEditMode={isEditMode}
                  onEdit={handleEditLink}
                />
              ))}
            </div>
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