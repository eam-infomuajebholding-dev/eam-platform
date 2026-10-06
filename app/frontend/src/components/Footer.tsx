import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Instagram, Linkedin, Youtube, Globe, Facebook, Pencil, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useEditMode } from '@/contexts/EditModeContext';
import BrandLogo from '@/components/ui/BrandLogo';

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

const FOOTER_NAV = [
  { to: '/', labelKey: 'footer.nav.home' as const },
  { to: '/about', labelKey: 'footer.nav.about' as const },
  { to: '/services', labelKey: 'footer.nav.services' as const },
  { to: '/projects', labelKey: 'footer.nav.projects' as const },
  { to: '/contact', labelKey: 'footer.nav.contact' as const },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.095-.034.18-.063.247-.084a.64.64 0 01.235-.044c.18 0 .33.048.437.134.18.149.195.36.18.494a.86.86 0 01-.09.3c-.21.39-.93.585-1.084.63-.03.009-.06.015-.09.024-.18.045-.39.105-.435.27a.5.5 0 00.015.285c.135.33.42.705.72 1.095.48.63 1.02 1.335 1.305 2.13.015.045.03.09.045.135.12.375.12.69-.015.96-.27.525-.93.72-1.395.81-.105.015-.195.03-.285.045-.15.03-.255.06-.36.135-.075.06-.12.135-.18.24-.06.105-.165.3-.39.41a1.27 1.27 0 01-.555.12c-.21 0-.435-.045-.69-.09-.375-.075-.84-.165-1.455-.165-.3 0-.615.03-.93.06-.45.045-.87.195-1.32.36-.63.24-1.365.51-2.475.51h-.06c-1.11 0-1.845-.27-2.475-.51-.45-.165-.87-.315-1.32-.36a8.8 8.8 0 00-.93-.06c-.615 0-1.08.09-1.455.165-.255.045-.48.09-.69.09a1.27 1.27 0 01-.555-.12c-.225-.11-.33-.305-.39-.41-.06-.105-.105-.18-.18-.24-.105-.075-.21-.105-.36-.135-.09-.015-.18-.03-.285-.045-.465-.09-1.125-.285-1.395-.81-.135-.27-.135-.585-.015-.96.015-.045.03-.09.045-.135.285-.795.825-1.5 1.305-2.13.3-.39.585-.765.72-1.095a.5.5 0 00.015-.285c-.045-.165-.255-.225-.435-.27-.03-.009-.06-.015-.09-.024-.154-.045-.874-.24-1.084-.63a.86.86 0 01-.09-.3c-.015-.134 0-.345.18-.494a.58.58 0 01.437-.134.64.64 0 01.235.044c.067.021.152.05.247.084.263.094.622.23.922.214.198 0 .326-.045.401-.09a8.3 8.3 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.453 1.069 10.809.793 11.8.793h.406z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11V9.4a6.33 6.33 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.42a8.16 8.16 0 004.76 1.52V7.5a4.85 4.85 0 01-1-.81z" />
    </svg>
  );
}

type SocialIconProps = {
  platform: keyof SocialLinks;
  url: string;
  isEditMode: boolean;
  onEdit: (platform: keyof SocialLinks) => void;
};

function SocialIcon({ platform, url, isEditMode, onEdit }: SocialIconProps) {
  const { t } = useLanguage();
  const iconClass = 'h-[1.05rem] w-[1.05rem]';

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
    <div className="group relative">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="eam-site-footer__social-btn"
        title={platform}
      >
        {getIcon()}
      </a>
      {isEditMode ? (
        <button
          type="button"
          onClick={() => onEdit(platform)}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white opacity-0 transition-opacity group-hover:opacity-100"
          title={`${t('footer.editLink')} ${platform}`}
        >
          <Pencil className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}

type FooterProps = {
  flushWithHomeContact?: boolean;
};

export default function Footer({ flushWithHomeContact = false }: FooterProps) {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { isEditMode } = useEditMode();
  const { t, direction } = useLanguage();
  const { canAccessCommandCenter } = useAuth();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultLinks);

  useEffect(() => {
    const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (!stored) return;
    try {
      setSocialLinks({ ...defaultLinks, ...JSON.parse(stored) });
    } catch {
      setSocialLinks(defaultLinks);
    }
  }, []);

  const handleEditLink = useCallback(
    (platform: keyof SocialLinks) => {
      const currentUrl = socialLinks[platform] === '#' ? '' : socialLinks[platform];
      const newUrl = window.prompt(`${t('footer.editLinkPrompt')} ${platform}:`, currentUrl);
      if (newUrl === null) return;
      const updatedLinks = { ...socialLinks, [platform]: newUrl || '#' };
      setSocialLinks(updatedLinks);
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(updatedLinks));
    },
    [socialLinks, t],
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    toast.success(t('footer.newsletter.success'));
    navigate('/contact', {
      state: {
        fromNewsletter: true,
        email: trimmed,
        subject: t('footer.newsletter.prefillSubject'),
      },
    });
    setEmail('');
  };

  const platforms: (keyof SocialLinks)[] = [
    'linkedin',
    'instagram',
    'twitter',
    'youtube',
    'facebook',
    'tiktok',
    'snapchat',
    'website',
  ];

  return (
    <footer
      className={`eam-site-footer eam-site-footer--premium ${
        flushWithHomeContact ? 'eam-site-footer--flush-home' : ''
      }`}
      dir={direction}
      aria-labelledby="eam-site-footer-heading"
    >
      <div className="eam-site-footer__shell">
        <div className="eam-site-footer__pane">
          <div className="eam-site-footer__main">
            <section className="eam-site-footer__brand" dir={direction}>
              <h2 id="eam-site-footer-heading" className="eam-site-footer__tagline">
                {t('footer.companyName')}
              </h2>
              <p className="eam-site-footer__description">{t('footer.description')}</p>
              <div className="eam-site-footer__social" aria-label={t('footer.socialAria')}>
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
            </section>

            <nav className="eam-site-footer__nav" dir={direction} aria-label={t('footer.quickLinks')}>
              <h3 className="eam-site-footer__col-title">{t('footer.quickLinks')}</h3>
              <ul className="eam-site-footer__nav-list">
                {FOOTER_NAV.map(({ to, labelKey }) => (
                  <li key={to}>
                    <Link to={to} className="eam-site-footer__nav-link">
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/consultation" className="eam-site-footer__nav-link eam-site-footer__nav-link--accent">
                    {t('footer.consultation')}
                  </Link>
                </li>
              </ul>
            </nav>

            <section className="eam-site-footer__newsletter" dir={direction} aria-labelledby="footer-newsletter-title">
              <div className="eam-site-footer__newsletter-head">
                <span className="eam-site-footer__newsletter-icon" aria-hidden>
                  <Mail className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
                </span>
                <div className="eam-site-footer__newsletter-copy">
                  <h3 id="footer-newsletter-title" className="eam-site-footer__newsletter-title">
                    {t('footer.newsletter.title')}
                  </h3>
                  <p className="eam-site-footer__newsletter-body">{t('footer.newsletter.body')}</p>
                </div>
              </div>
              <form onSubmit={handleSubscribe} className="eam-site-footer__newsletter-form">
                <div className="eam-site-footer__newsletter-field">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    {t('footer.newsletter.placeholder')}
                  </label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.newsletter.placeholder')}
                    className="eam-input eam-site-footer__newsletter-input"
                    dir="ltr"
                    required
                  />
                </div>
                <button type="submit" className="eam-site-footer__newsletter-btn">
                  {t('footer.newsletter.cta')}
                </button>
                <p className="eam-site-footer__newsletter-hint">{t('footer.newsletter.hint')}</p>
              </form>
            </section>
          </div>

          <div className="eam-site-footer__legal" dir={direction}>
            <p className="eam-site-footer__copyright">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
            <nav className="eam-site-footer__legal-nav" aria-label={`${t('footer.privacy')} / ${t('footer.terms')}`}>
              {canAccessCommandCenter ? (
                <Link to="/command-center" className="eam-site-footer__legal-link eam-site-footer__legal-link--gold">
                  {t('auth.commandCenter')}
                </Link>
              ) : null}
              <Link to="/privacy" className="eam-site-footer__legal-link">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="eam-site-footer__legal-link">
                {t('footer.terms')}
              </Link>
            </nav>
          </div>
        </div>

        <div className="eam-site-footer__logo-rail" aria-hidden={false}>
          <div className="eam-site-footer__logo-slot">
            <BrandLogo
              size="footer"
              showText={false}
              alt={t('footer.logoAlt')}
              align="end"
              className="eam-site-footer__logo-mark"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
