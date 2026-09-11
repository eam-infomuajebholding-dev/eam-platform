import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import RealEstateDevelopmentStepPanel from './RealEstateDevelopmentStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type RealEstateDevelopmentStepValues,
} from './errors';
import { REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE, type RealEstateDevelopmentContext } from './types';

const emptyValues = (): RealEstateDevelopmentStepValues => ({
  assetContext: '',
  assetLocation: '',
  developmentObjective: '',
  intendedUse: '',
  currentStatus: '',
  knownConstraints: '',
  documentsReadiness: '',
  targetTimeline: '',
  urgency: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function RealEstateDevelopmentJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<RealEstateDevelopmentStepValues>(emptyValues);

  const isRedInstance = currentInstance?.journey_type === REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as RealEstateDevelopmentContext;
  const currentStep = isRedInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isRedInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isRedInstance) return;
    setStepValues({
      assetContext: context.asset_context ?? '',
      assetLocation: context.asset_location ?? '',
      developmentObjective: context.development_objective ?? '',
      intendedUse: context.intended_use ?? '',
      currentStatus: context.current_status ?? '',
      knownConstraints: context.known_constraints ?? '',
      documentsReadiness: context.documents_readiness ?? '',
      targetTimeline: context.target_timeline ?? '',
      urgency: context.urgency ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isRedInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة التطوير العقاري. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isRedInstance) return;
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
  }, [advance, currentInstance, currentStep, isRedInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isRedInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isRedInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isRedInstance && !isCompleted;

  return (
    <JourneyShell
      title="التطوير العقاري"
      description="رحلة فرصة التطوير العقاري — من فهم سياق الأصل والهدف التطويري إلى لقطة أولية قبل المراجعة المهنية."
      startLabel="ابدأ رحلة التطوير العقاري"
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
      {isRedInstance && currentInstance ? (
        <RealEstateDevelopmentStepPanel
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
