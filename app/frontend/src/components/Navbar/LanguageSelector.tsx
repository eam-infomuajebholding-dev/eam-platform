import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

const iconBtnClass = 'site-nav-icon-btn';

type LanguageSelectorProps = {
  variant?: 'icon' | 'mobile';
  onNavigate?: () => void;
};

export default function LanguageSelector({ variant = 'icon', onNavigate }: LanguageSelectorProps) {
  const { language, languages, setLanguage, t } = useLanguage();
  const active = languages.find((entry) => entry.code === language);

  const handleSelect = (code: string) => {
    onNavigate?.();
    setLanguage(code);
  };

  if (variant === 'mobile') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-soft-border px-4 py-3 text-sm text-ink/80 transition-colors hover:border-primary-gold hover:bg-primary-gold/10 dark:border-white/10 dark:text-white/80"
          >
            <span className="flex items-center gap-2">
              <Globe size={16} />
              {t('language.label')}
            </span>
            <span className="font-medium text-deep-gold">{active?.label ?? language}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 w-56 overflow-y-auto">
          <DropdownMenuLabel>{t('language.choose')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((entry) => (
            <DropdownMenuItem key={entry.code} onClick={() => handleSelect(entry.code)} className="justify-between">
              <span>{entry.label}</span>
              {entry.code === language ? <Check className="h-4 w-4 text-deep-gold" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t('language.choose')} className={iconBtnClass}>
          <Globe size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 w-56 overflow-y-auto">
        <DropdownMenuLabel>{t('language.choose')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((entry) => (
          <DropdownMenuItem key={entry.code} onClick={() => handleSelect(entry.code)} className="justify-between">
            <span>{entry.label}</span>
            {entry.code === language ? <Check className="h-4 w-4 text-deep-gold" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
