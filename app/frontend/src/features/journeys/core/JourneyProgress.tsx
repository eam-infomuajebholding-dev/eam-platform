import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  current: number;
  total: number;
  variant?: 'bar' | 'text';
}

export default function JourneyProgress({ current, total, variant = 'text' }: Props) {
  const { t } = useLanguage();
  const clamped = Math.min(Math.max(current, 0), total);

  if (variant === 'bar') {
    return (
      <div
        className="mb-4 h-2 overflow-hidden rounded-full bg-surface-alt dark:bg-white/10"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={t('journey.progress')
          .replace('{current}', String(clamped))
          .replace('{total}', String(total))}
      >
        <div
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${total > 0 ? (clamped / total) * 100 : 0}%` }}
        />
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center justify-between text-sm text-ink-secondary">
      <span>
        {t('journey.progress')
          .replace('{current}', String(clamped))
          .replace('{total}', String(total))}
      </span>
    </div>
  );
}
