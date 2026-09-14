import type { LucideIcon } from 'lucide-react';
import type { MessageKey } from '@/i18n/messages';
import { useLanguage } from '@/contexts/LanguageContext';

export type PageStatItem = {
  valueKey?: MessageKey;
  value?: string;
  labelKey: MessageKey;
  icon?: LucideIcon;
};

type PageStatGridProps = {
  stats: PageStatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
};

export default function PageStatGrid({
  stats,
  columns = 3,
  className = '',
}: PageStatGridProps) {
  const { t } = useLanguage();

  const gridCols =
    columns === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : columns === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-3';

  return (
    <div
      className={`mx-auto grid max-w-4xl grid-cols-1 gap-4 ${gridCols} ${className}`}
    >
      {stats.map(({ valueKey, value, labelKey, icon: Icon }) => (
        <div
          key={labelKey}
          className="rounded-2xl border border-soft-border/60 bg-cream px-5 py-6 text-center dark:bg-surface"
        >
          {Icon ? (
            <Icon className="mx-auto mb-3 h-6 w-6 text-gold-500" strokeWidth={1.75} />
          ) : null}
          <p className="font-display text-3xl font-semibold text-gold-600 dark:text-gold-300">
            {valueKey ? t(valueKey) : value}
          </p>
          <p className="text-caption mt-1">{t(labelKey)}</p>
        </div>
      ))}
    </div>
  );
}
