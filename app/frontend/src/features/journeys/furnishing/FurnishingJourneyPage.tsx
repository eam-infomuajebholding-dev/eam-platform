import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import FurnishingStepPanel from './FurnishingStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type FurnishingStepValues,
} from './errors';
import { FURNISHING_JOURNEY_TYPE, type FurnishingContext } from './types';

const emptyValues = (): FurnishingStepValues => ({
  spaceType: '',
  projectStage: '',
  furnishingGoal: '',
  styleDirection: '',
  functionalPriorities: '',
  roomScope: '',
  budgetRange: '',
  targetTimeline: '',
  urgency: '',
  procurementPreference: '',
  currentReadiness: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function FurnishingJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<FurnishingStepValues>(emptyValues);

  const isFrInstance = currentInstance?.journey_type === FURNISHING_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as FurnishingContext;
  const currentStep = isFrInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isFrInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isFrInstance) return;
    setStepValues({
      spaceType: context.space_type ?? '',
      projectStage: context.project_stage ?? '',
      furnishingGoal: context.furnishing_goal ?? '',
      styleDirection: context.style_direction ?? '',
      functionalPriorities: context.functional_priorities ?? '',
      roomScope: context.room_scope ?? '',
      budgetRange: context.budget_range ?? '',
      targetTimeline: context.target_timeline ?? '',
      urgency: context.urgency ?? '',
      procurementPreference: context.procurement_preference ?? '',
      currentReadiness: context.current_readiness ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isFrInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: FURNISHING_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة التأثيث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isFrInstance) return;
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await advance(currentInstance.id, { input: buildAdvanceInput(currentStep, stepValues) });
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      setFormError(getErrorMessage(errors, 'تعذر إرسال هذه الخطوة.'));
    } finally {
      setIsLoading(false);
    }
  }, [advance, currentInstance, currentStep, isFrInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isFrInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isFrInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isFrInstance && !isCompleted;

  return (
    <JourneyShell
      title="التأثيث والتجهيز"
      description="رحلة جاهزية التأثيث — من فهم المساحة والاحتياجات إلى موجز أولي قبل المراجعة المهنية."
      startLabel="ابدأ رحلة جاهزية التأثيث"
      onStart={handleStart}
      isLoading={isLoading}
      showStart={showStart}
      isCompleted={isCompleted}
      stepProgress={stepProgress}
      totalSteps={getTotalSteps()}
      progressVariant="bar"
      footer={
        isCompleted && user ? (
          <Link to="/my-requests" className="mt-6 block text-center text-gold hover:underline font-tajawal">
            الانتقال إلى طلباتي
          </Link>
        ) : null
      }
    >
      {isFrInstance && currentInstance ? (
        <FurnishingStepPanel
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
        />
      ) : null}
    </JourneyShell>
  );
}
