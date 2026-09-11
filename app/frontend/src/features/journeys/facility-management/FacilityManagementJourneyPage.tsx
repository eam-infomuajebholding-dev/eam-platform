import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import FacilityManagementStepPanel from './FacilityManagementStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type FacilityManagementStepValues,
} from './errors';
import { FACILITY_MANAGEMENT_JOURNEY_TYPE, type FacilityManagementContext } from './types';

const emptyValues = (): FacilityManagementStepValues => ({
  facilityType: '',
  location: '',
  facilityScope: '',
  operationalChallenge: '',
  serviceMaturity: '',
  engagementGoal: '',
  targetTimeline: '',
  urgency: '',
  currentReadiness: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function FacilityManagementJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<FacilityManagementStepValues>(emptyValues);

  const isFmInstance = currentInstance?.journey_type === FACILITY_MANAGEMENT_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as FacilityManagementContext;
  const currentStep = isFmInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isFmInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isFmInstance) return;
    setStepValues({
      facilityType: context.facility_type ?? '',
      location: context.location ?? '',
      facilityScope: context.facility_scope ?? '',
      operationalChallenge: context.operational_challenge ?? '',
      serviceMaturity: context.service_maturity ?? '',
      engagementGoal: context.engagement_goal ?? '',
      targetTimeline: context.target_timeline ?? '',
      urgency: context.urgency ?? '',
      currentReadiness: context.current_readiness ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isFmInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: FACILITY_MANAGEMENT_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة إدارة المرافق. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isFmInstance) return;
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
  }, [advance, currentInstance, currentStep, isFmInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isFmInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isFmInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isFmInstance && !isCompleted;

  return (
    <JourneyShell
      title="إدارة المرافق"
      description="رحلة جاهزية إدارة المرافق — من فهم المنشأة والتحديات التشغيلية إلى موجز أولي قبل المراجعة المهنية."
      startLabel="ابدأ رحلة جاهزية إدارة المرافق"
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
      {isFmInstance && currentInstance ? (
        <FacilityManagementStepPanel
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
