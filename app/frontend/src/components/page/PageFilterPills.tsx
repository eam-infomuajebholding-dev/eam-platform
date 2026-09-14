import type { MessageKey } from '@/i18n/messages';
import { useLanguage } from '@/contexts/LanguageContext';

export type FilterOption<T extends string> = {
  key: T;
  labelKey: MessageKey;
};

type PageFilterPillsProps<T extends string> = {
  options: FilterOption<T>[];
  active: T;
  onChange: (key: T) => void;
  ariaLabelKey?: MessageKey;
  className?: string;
};

export default function PageFilterPills<T extends string>({
  options,
  active,
  onChange,
  ariaLabelKey,
  className = '',
}: PageFilterPillsProps<T>) {
  const { t } = useLanguage();

  return (
    <div
      className={`flex flex-wrap justify-center gap-2 ${className}`}
      role="tablist"
      aria-label={ariaLabelKey ? t(ariaLabelKey) : undefined}
    >
      {options.map(({ key, labelKey }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            active === key
              ? 'bg-gold-500 text-white shadow-gold'
              : 'border border-soft-border/80 bg-cream-light text-ink-secondary hover:border-gold-300 hover:bg-gold-50 dark:bg-surface dark:text-ink-secondary'
          }`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
