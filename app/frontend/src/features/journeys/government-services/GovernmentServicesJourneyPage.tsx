import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import GovernmentServicesStepPanel from './GovernmentServicesStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type GovernmentServicesStepValues,
} from './errors';
import { GOVERNMENT_SERVICES_JOURNEY_TYPE, type GovernmentServicesContext } from './types';

const emptyValues = (): GovernmentServicesStepValues => ({
  serviceCategory: '',
  propertyLocation: '',
  propertyType: '',
  requestSummary: '',
  documentsStatus: '',
  urgency: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function GovernmentServicesJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<GovernmentServicesStepValues>(emptyValues);

  const isGsInstance = currentInstance?.journey_type === GOVERNMENT_SERVICES_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as GovernmentServicesContext;
  const currentStep = isGsInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isGsInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isGsInstance) return;
    setStepValues({
      serviceCategory: context.service_category ?? '',
      propertyLocation: context.property_location ?? '',
      propertyType: context.property_type ?? '',
      requestSummary: context.request_summary ?? '',
      documentsStatus: context.documents_status ?? '',
      urgency: context.urgency ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isGsInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: GOVERNMENT_SERVICES_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة الخدمات الحكومية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isGsInstance) return;
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
  }, [advance, currentInstance, currentStep, isGsInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isGsInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isGsInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isGsInstance && !isCompleted;

  return (
    <JourneyShell
      title="الخدمات الحكومية"
      description="رحلة الخدمات الحكومية — من تحديد نوع الخدمة إلى خارطة مهام أولية قبل المراجعة المهنية."
      startLabel="ابدأ رحلة الخدمات الحكومية"
      onStart={handleStart}
      isLoading={isLoading}
      showStart={showStart}
      isCompleted={isCompleted}
      stepProgress={stepProgress}
      totalSteps={getTotalSteps()}
      resumeHint="يمكنك متابعة رحلتك من حيث توقفت."
    >
      {!user ? (
        <p className="mb-4 font-tajawal text-xs text-ink/50 dark:text-white/50">
          الرحلة متاحة بدون تسجيل —{' '}
          <Link to="/auth/login" className="text-gold underline">
            تسجيل الدخول
          </Link>{' '}
          اختياري.
        </p>
      ) : null}
      <GovernmentServicesStepPanel
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
    </JourneyShell>
  );
}
