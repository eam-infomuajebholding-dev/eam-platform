import type { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  JourneyIntakeCompleteStep,
  JourneyScopeConfirmStep,
  JourneySubmitConfirmStep,
} from '@/features/journeys/core/JourneyConfirmSteps';
import {
  journeySectorMessageKey,
  type JourneySectorId,
} from '@/i18n/journeySectorMessages';

const CONFIRM_STEPS = new Set(['scope_confirm', 'submit_confirm', 'intake_complete']);

export function isStandardConfirmStep(step: string | null): step is string {
  return step != null && CONFIRM_STEPS.has(step);
}

export function useJourneyStandardConfirmStep(
  sectorId: JourneySectorId | undefined,
  step: string | null,
  values: { scopeConfirmed: boolean; submitConfirmed: boolean },
  onPatch: (patch: Partial<{ scopeConfirmed: boolean; submitConfirmed: boolean }>) => void,
): ReactNode | null {
  const { t } = useLanguage();

  if (!sectorId || !step || !CONFIRM_STEPS.has(step)) {
    return null;
  }

  if (step === 'scope_confirm') {
    return (
      <JourneyScopeConfirmStep
        checked={values.scopeConfirmed}
        onChange={(scopeConfirmed) => onPatch({ scopeConfirmed })}
        label={t(journeySectorMessageKey(sectorId, 'scopeConfirmLabel'))}
      />
    );
  }

  if (step === 'submit_confirm') {
    const preamble = t(journeySectorMessageKey(sectorId, 'submitPreamble'));
    return (
      <JourneySubmitConfirmStep
        checked={values.submitConfirmed}
        onChange={(submitConfirmed) => onPatch({ submitConfirmed })}
        preamble={preamble.trim() ? preamble : undefined}
        label={t('journey.confirm.submit')}
      />
    );
  }

  return (
    <JourneyIntakeCompleteStep message={t(journeySectorMessageKey(sectorId, 'intakeCompleteMessage'))} />
  );
}
