import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import RealEstateMarketingStepPanel from './RealEstateMarketingStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type RealEstateMarketingStepValues,
} from './errors';
import { REAL_ESTATE_MARKETING_JOURNEY_TYPE, type RealEstateMarketingContext } from './types';

const emptyValues = (): RealEstateMarketingStepValues => ({
  marketingGoal: '',
  propertyDescription: '',
  propertyLocation: '',
  targetAudience: '',
  marketingStage: '',
  existingAssets: '',
  channelsInterest: '',
  targetTimeline: '',
  urgency: '',
  budgetContext: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function RealEstateMarketingJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<RealEstateMarketingStepValues>(emptyValues);

  const isRmInstance = currentInstance?.journey_type === REAL_ESTATE_MARKETING_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as RealEstateMarketingContext;
  const currentStep = isRmInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isRmInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isRmInstance) return;
    setStepValues({
      marketingGoal: context.marketing_goal ?? '',
      propertyDescription: context.property_description ?? '',
      propertyLocation: context.property_location ?? '',
      targetAudience: context.target_audience ?? '',
      marketingStage: context.marketing_stage ?? '',
      existingAssets: context.existing_assets ?? '',
      channelsInterest: context.channels_interest ?? '',
      targetTimeline: context.target_timeline ?? '',
      urgency: context.urgency ?? '',
      budgetContext: context.budget_context ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isRmInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: REAL_ESTATE_MARKETING_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة التسويق العقاري. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isRmInstance) return;
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
  }, [advance, currentInstance, currentStep, isRmInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isRmInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isRmInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isRmInstance && !isCompleted;

  return (
    <JourneyShell
      title="التسويق العقاري"
      description="رحلة جاهزية التسويق العقاري — من فهم الهدف التسويقي والجمهور إلى موجز أولي قبل المراجعة المهنية."
      startLabel="ابدأ رحلة التسويق العقاري"
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
      {isRmInstance && currentInstance ? (
        <RealEstateMarketingStepPanel
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
