import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';

interface JourneyStepFrameProps {
  stepTitle?: string | null;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  isLoading: boolean;
  isTerminal: boolean;
  isCompleted: boolean;
  completedMessage?: string;
  onAdvance: () => void;
  onComplete: () => void;
  advanceLabel?: string;
  completeLabel?: string;
  children: ReactNode;
}

export default function JourneyStepFrame({
  stepTitle,
  fieldErrors,
  formError,
  isLoading,
  isTerminal,
  isCompleted,
  completedMessage,
  onAdvance,
  onComplete,
  advanceLabel,
  completeLabel,
  children,
}: JourneyStepFrameProps) {
  const { t } = useLanguage();

  if (isCompleted) {
    return (
      <p className="text-green-700 dark:text-green-300">
        {completedMessage ?? t('journey.completedSuccess')}
      </p>
    );
  }

  const displayError = formError ? getErrorMessage(fieldErrors, formError) : null;

  return (
    <div className="space-y-4">
      {stepTitle ? <h2 className="text-lg font-bold text-ink">{stepTitle}</h2> : null}
      {children}
      {displayError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200"
          role="alert"
          aria-live="polite"
        >
          {displayError}
        </div>
      ) : null}
      {!isTerminal ? (
        <button
          type="button"
          onClick={onAdvance}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {advanceLabel ?? t('journey.continue')}
        </button>
      ) : (
        <button
          type="button"
          onClick={onComplete}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {completeLabel ?? t('journey.completeSubmit')}
        </button>
      )}
    </div>
  );
}
