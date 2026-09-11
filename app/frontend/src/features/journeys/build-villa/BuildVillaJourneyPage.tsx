import { useCallback, useEffect, useMemo, useState } from 'react';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useJourney } from '@/features/journeys/core/useJourney';
import BuildVillaStepPanel from '@/features/journeys/build-villa/BuildVillaStepPanel';
import {
  buildAdvanceInput,
  emptyStepValues,
  extractFieldErrors,
  getErrorMessage,
  syncStepValuesFromContext,
} from '@/features/journeys/build-villa/errors';
import type { BuildVillaContext } from '@/features/journeys/build-villa/types';
import { getStepNumber, getTotalSteps } from '@/features/journeys/build-villa/constants';
import { BUILD_VILLA_JOURNEY_TYPE } from '@/features/journeys/build-villa/types';

export default function BuildVillaJourneyPage() {
  const { currentInstance, startJourney, advance, complete, revisit } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState(emptyStepValues);

  const isBvInstance = currentInstance?.journey_type === BUILD_VILLA_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as BuildVillaContext;
  const currentStep = isBvInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isBvInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isBvInstance) {
      return;
    }
    setStepValues(syncStepValuesFromContext(context as Record<string, unknown>));
  }, [currentInstance, context, isBvInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: BUILD_VILLA_JOURNEY_TYPE });
    } catch (error) {
      setFormError('تعذر بدء الرحلة. يرجى المحاولة مرة أخرى.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isBvInstance) {
      return;
    }
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    const input = buildAdvanceInput(currentStep, stepValues);
    try {
      await advance(currentInstance.id, { input });
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      setFormError(getErrorMessage(errors, 'تعذر إرسال هذه الخطوة. يرجى مراجعة البيانات.'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [advance, currentInstance, currentStep, isBvInstance, stepValues]);

  const handleRevisit = useCallback(
    async (targetStep: string) => {
      if (!currentInstance || !isBvInstance) {
        return;
      }
      setIsLoading(true);
      setFormError(null);
      setFieldErrors([]);
      try {
        await revisit(currentInstance.id, targetStep);
      } catch (error) {
        setFormError('تعذر العودة لتعديل هذا القسم.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentInstance, isBvInstance, revisit],
  );

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isBvInstance) {
      return;
    }
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch (error) {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isBvInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') {
      return getTotalSteps();
    }
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isBvInstance && !isCompleted;

  return (
    <JourneyShell
      title="بناء الفيلا"
      description="رحلة استكشافية لجمع معلومات مشروعك قبل المراجعة المهنية."
      startLabel="ابدأ رحلة بناء الفيلا"
      onStart={handleStart}
      isLoading={isLoading}
      showStart={showStart}
      isCompleted={isCompleted}
      stepProgress={stepProgress}
      totalSteps={getTotalSteps()}
      progressVariant="text"
    >
      {isBvInstance && currentInstance ? (
        <BuildVillaStepPanel
          currentStep={currentStep}
          context={context}
          values={stepValues}
          onChange={setStepValues}
          fieldErrors={fieldErrors}
          formError={formError}
          isLoading={isLoading}
          isTerminal={isTerminal}
          isCompleted={isCompleted}
          onAdvance={handleAdvance}
          onComplete={handleComplete}
          onRevisit={handleRevisit}
        />
      ) : null}
    </JourneyShell>
  );
}
