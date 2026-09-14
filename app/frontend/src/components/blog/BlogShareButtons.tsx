import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type BlogShareButtonsProps = {
  title: string;
  url: string;
};

export default function BlogShareButtons({ title, url }: BlogShareButtonsProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-alt p-5 dark:bg-white/5">
      <p className="mb-3 text-sm font-bold text-ink">
        {t('blog.share.title')}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-white px-4 py-2 text-sm text-ink-secondary transition-colors hover:bg-gold/10 dark:bg-white/10 dark:text-white"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4 text-gold" />}
          {copied ? t('blog.share.copied') : t('blog.share.copy')}
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1ebe57]"
        >
          {t('blog.share.whatsapp')}
        </a>
      </div>
    </div>
  );
}
