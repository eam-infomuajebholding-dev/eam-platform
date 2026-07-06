import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Share2, Download, Instagram, Linkedin, Youtube, Globe, Facebook } from 'lucide-react';

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

const CONTACT_INFO = {
  phone: '+966 59 955 5437',
  email: 'majeb.alzh@gmail.com',
  address: 'جدة، المملكة العربية السعودية',
  companyName: 'إعمار الأصالة والمعاصرة',
  title: 'للاستشارات الهندسية',
};

export default function ContactCard() {
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

  const activeSocialLinks = Object.entries(socialLinks).filter(
    ([, url]) => url && url !== '#' && url.trim() !== ''
  );

  const handleShare = async () => {
    const shareData = {
      title: CONTACT_INFO.companyName,
      text: `${CONTACT_INFO.companyName} - ${CONTACT_INFO.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${CONTACT_INFO.companyName}
ORG:${CONTACT_INFO.companyName}
TITLE:${CONTACT_INFO.title}
TEL;TYPE=WORK,VOICE:${CONTACT_INFO.phone}
EMAIL;TYPE=WORK:${CONTACT_INFO.email}
ADR;TYPE=WORK:;;${CONTACT_INFO.address}
URL:${window.location.origin}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'emaar-contact.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSocialIcon = (platform: string) => {
    const iconClass = "w-5 h-5";
    switch (platform) {
      case 'facebook': return <Facebook className={iconClass} />;
      case 'instagram': return <Instagram className={iconClass} />;
      case 'twitter': return <XIcon className={iconClass} />;
      case 'snapchat': return <SnapchatIcon className={iconClass} />;
      case 'linkedin': return <Linkedin className={iconClass} />;
      case 'tiktok': return <TikTokIcon className={iconClass} />;
      case 'youtube': return <Youtube className={iconClass} />;
      case 'website': return <Globe className={iconClass} />;
      default: return null;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'فيسبوك';
      case 'instagram': return 'انستقرام';
      case 'twitter': return 'إكس';
      case 'snapchat': return 'سناب شات';
      case 'linkedin': return 'لينكد إن';
      case 'tiktok': return 'تيك توك';
      case 'youtube': return 'يوتيوب';
      case 'website': return 'الموقع الإلكتروني';
      default: return platform;
    }
  };

  return (
     <div
     className="min-h-screen bg-gradient-to-br from-white via-[#FCFCFC] to-[#F8F8F8] flex items-center justify-center p-6"
     dir="rtl"
     >
      {/* Card Container */}
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="relative bg-[#1E2436] rounded-3xl border border-[#C9A84C]/30 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden">
          {/* Gold accent top bar */}
          <div className="h-2 bg-gradient-to-l from-[#c9a84c] via-[#e8c84c] to-[#c9a84c]" />

          {/* Header Section */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6">
            {/* Logo */}
            <div className="mb-8 w-[260px] md:w-[320px] bg-white rounded-2xl border-2 border-[#C9A84C] shadow-[0_0_40px_rgba(201,168,76,0.35)] p-5">
              <img
                src="/assets/logo.png"
                alt={CONTACT_INFO.companyName}
                className="w-full h-auto object-contain"
              />
            </div>
            {/* Company Name */}
            <h1 className="text-3xl md:text-3xl font-bold text-white text-center font-tajawal leading-tight">
              {CONTACT_INFO.companyName}
            </h1>

            <p className="mt-2 text-[#D7B95E] text-base tracking-wide font-semibold font-tajawal">
              {CONTACT_INFO.title}
            </p>

            <p className="mt-6 text-center text-white/75 leading-7 font-tajawal text-sm max-w-sm">
              يسعدنا مناقشة احتياجات مشروعكم وتقديم الحلول الهندسية المناسبة.
            </p>
          </div>

          {/* Contact Info Section */}
          <div className="px-6 pb-4 space-y-3">
            {/* Phone */}
            <a
              href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-4 p-5 rounded-xl bg-white/10 border-[#C9A84C]/20 border border-white/10 hover:bg-white/10 hover:border-[#c9a84c]/40 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center group-hover:bg-[#c9a84c]/30 transition-colors">
                <Phone className="w-5 h-5 text-[#c9a84c]" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-xs font-tajawal">الهاتف</p>
                <p className="text-white font-tajawal text-sm" dir="ltr">{CONTACT_INFO.phone}</p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="flex items-center gap-4 p-5 rounded-xl bg-white/10 border-[#C9A84C]/20 border border-white/10 hover:bg-white/10 hover:border-[#c9a84c]/40 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center group-hover:bg-[#c9a84c]/30 transition-colors">
                <Mail className="w-5 h-5 text-[#c9a84c]" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-xs font-tajawal">البريد الإلكتروني</p>
                <p className="text-white font-tajawal text-sm" dir="ltr">{CONTACT_INFO.email}</p>
              </div>
            </a>

            {/* Location */}
            <div className="flex items-center gap-4 p-5 rounded-xl bg-white/10 border-[#C9A84C]/20 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#c9a84c]" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-xs font-tajawal">الموقع</p>
                <p className="text-white font-tajawal text-sm">{CONTACT_INFO.address}</p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          {activeSocialLinks.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-white/40 text-xs font-tajawal mb-3 text-center">منصاتنا الرقمية</p>
              <div className="grid grid-cols-4 gap-3">
                {activeSocialLinks.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-5 rounded-xl bg-white/10 border-[#C9A84C]/20 border border-white/10 hover:bg-[#c9a84c]/10 hover:border-[#c9a84c]/40 transition-all duration-300 group"
                    title={getPlatformLabel(platform)}
                  >
                    <div className="text-white/70 group-hover:text-[#c9a84c] transition-colors">
                      {getSocialIcon(platform)}
                    </div>
                    <span className="text-[10px] text-white/50 group-hover:text-[#c9a84c]/80 font-tajawal transition-colors">
                      {getPlatformLabel(platform)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* If no social links configured, show all platforms as placeholders */}
          {activeSocialLinks.length === 0 && (
            <div className="px-6 pb-6">
              <p className="text-white/40 text-xs font-tajawal mb-3 text-center">تابعنا على</p>
              <div className="grid grid-cols-4 gap-3">
                {Object.keys(socialLinks).map((platform) => (
                  <div
                    key={platform}
                    className="flex flex-col items-center gap-1.5 p-5 rounded-xl bg-white/10 border-[#C9A84C]/20 border border-white/10 opacity-50"
                    title={getPlatformLabel(platform)}
                  >
                    <div className="text-white/70">
                      {getSocialIcon(platform)}
                    </div>
                    <span className="text-[10px] text-white/50 font-tajawal">
                      {getPlatformLabel(platform)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-6 pb-8 space-y-3">
            {/* Save Contact */}
            <button
              onClick={handleDownloadVCard}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-l from-[#C9A84C] to-[#E0C36D] text-[#1E2436] font-bold font-tajawal hover:shadow-[0_0_25px_rgba(201,168,76,0.35)] transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              حفظ بيانات التواصل
            </button>

            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/966599555437"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-4 rounded-xl border border-[#C9A84C]/40 bg-white/10 text-white font-semibold font-tajawal hover:bg-[#C9A84C]/15 hover:border-[#C9A84C] transition-all duration-300"
              >
                واتساب
              </a>

              {/* Call */}
              <a
                href="tel:+966599555437"
                className="flex items-center justify-center py-4 rounded-xl border border-[#C9A84C]/40 bg-white/10 text-white font-semibold font-tajawal hover:bg-[#C9A84C]/15 hover:border-[#C9A84C] transition-all duration-300"
              >
                اتصال مباشر
              </a>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-tajawal text-sm hover:bg-white/20 transition-all"
            >
              <Share2 className="w-4 h-4" />
              مشاركة
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto mb-3" />
          <p className="text-xs tracking-[0.08em] text-[#A9965A] font-tajawal">
            © {new Date().getFullYear()} إعمار الأصالة والمعاصرة للاستشارات الهندسية
          </p>
        </div>
      </div>
    </div>
  );
}