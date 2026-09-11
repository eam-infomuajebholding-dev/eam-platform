import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import MaintenanceStepPanel from './MaintenanceStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type MaintenanceStepValues,
} from './errors';
import { SMART_MAINTENANCE_JOURNEY_TYPE, type SmartMaintenanceContext } from './types';

const emptyValues = (): MaintenanceStepValues => ({
  maintenanceCategory: '',
  location: '',
  issueDescription: '',
  severityLevel: '',
  accessReadiness: '',
  systemNotes: '',
  priorMaintenance: null,
  serviceNotes: '',
  engagementGoal: '',
  desiredTimeline: '',
  urgency: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function SmartMaintenanceJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<MaintenanceStepValues>(emptyValues);

  const isMaintenanceInstance = currentInstance?.journey_type === SMART_MAINTENANCE_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as SmartMaintenanceContext;
  const currentStep = isMaintenanceInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isMaintenanceInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isMaintenanceInstance) return;
    setStepValues({
      maintenanceCategory: context.maintenance_category ?? '',
      location: context.location ?? '',
      issueDescription: context.issue_description ?? '',
      severityLevel: context.severity_level ?? '',
      accessReadiness: context.access_readiness ?? '',
      systemNotes: context.system_notes ?? '',
      priorMaintenance: context.prior_maintenance ?? null,
      serviceNotes: context.service_notes ?? '',
      engagementGoal: context.engagement_goal ?? '',
      desiredTimeline: context.desired_timeline ?? '',
      urgency: context.urgency ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isMaintenanceInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: SMART_MAINTENANCE_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة الصيانة الذكية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isMaintenanceInstance) return;
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
  }, [advance, currentInstance, currentStep, isMaintenanceInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isMaintenanceInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isMaintenanceInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isMaintenanceInstance && !isCompleted;

  return (
    <JourneyShell
      title="التشغيل والصيانة الذكية"
      description="رحلة جاهزية الصيانة — من فهم المشكلة إلى موجز أولي قبل المراجعة المهنية."
      startLabel="ابدأ رحلة جاهزية الصيانة الذكية"
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
      {isMaintenanceInstance && currentInstance ? (
        <MaintenanceStepPanel
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
