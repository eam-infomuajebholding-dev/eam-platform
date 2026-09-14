import type { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import JourneyProgress from '@/features/journeys/core/JourneyProgress';
import JourneyOptionalLoginHint from '@/features/journeys/core/JourneyOptionalLoginHint';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  title: string;
  description: string;
  startLabel: string;
  onStart: () => void;
  isLoading: boolean;
  showStart: boolean;
  isCompleted?: boolean;
  stepProgress?: number;
  totalSteps?: number;
  progressVariant?: 'bar' | 'text';
  isHydrating?: boolean;
  showResume?: boolean;
  resumeHint?: string;
  resumeLabel?: string;
  onResume?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
}

export default function JourneyShell({
  title,
  description,
  startLabel,
  onStart,
  isLoading,
  showStart,
  isCompleted = false,
  stepProgress = 0,
  totalSteps = 1,
  progressVariant = 'text',
  isHydrating = false,
  showResume = false,
  resumeHint,
  resumeLabel,
  onResume,
  children,
  footer,
}: Props) {
  const { t } = useLanguage();

  return (
    <Layout>
      <section className="py-16 md:py-24 bg-cream-light dark:bg-background min-h-[70vh]">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="gold-text text-3xl md:text-4xl font-bold font-display mb-3">{title}</h1>
            <p className="text-ink-secondary">{description}</p>
          </div>

          {isHydrating ? (
            <div className="text-center text-sm text-ink-secondary" role="status">
              {t('journey.hydrating')}
            </div>
          ) : showStart ? (
            <div className="space-y-4 text-center">
              <JourneyOptionalLoginHint />
              {showResume && resumeHint && onResume ? (
                <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-ink-secondary">
                  <p>{resumeHint}</p>
                  <button
                    type="button"
                    onClick={onResume}
                    disabled={isLoading}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-gold px-5 py-2.5 font-semibold text-gold disabled:opacity-60"
                  >
                    {resumeLabel ?? t('journey.resumeButton')}
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={onStart}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-semibold text-white disabled:opacity-60"
              >
                {startLabel}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gold/20 bg-cream dark:bg-dark p-6 shadow-sm">
              <JourneyOptionalLoginHint />
              {!isCompleted ? (
                <JourneyProgress current={stepProgress} total={totalSteps} variant={progressVariant} />
              ) : (
                <div className="mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" aria-hidden />
                  <span>{t('journey.completed')}</span>
                </div>
              )}
              {children}
              {footer}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
