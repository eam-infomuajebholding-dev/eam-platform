import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import { ENGINEERING_CONSULTING_JOURNEY_TYPE, type EngineeringConsultingContext } from './types';
import EngineeringConsultingStepPanel from './EngineeringConsultingStepPanel';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type EngineeringStepValues,
} from './errors';
import { getStepNumber, getTotalSteps } from './constants';

const emptyValues = (): EngineeringStepValues => ({
  problemStatement: '',
  desiredOutcome: '',
  discipline: '',
  projectType: '',
  location: '',
  objective: '',
  currentStage: '',
  urgency: '',
  hasDocuments: null,
  documentNotes: '',
  scopeConfirmed: false,
});

export default function EngineeringConsultingJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<EngineeringStepValues>(emptyValues);

  const isEcInstance = currentInstance?.journey_type === ENGINEERING_CONSULTING_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as EngineeringConsultingContext;
  const currentStep = isEcInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isEcInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'handoff_complete';

  useEffect(() => {
    if (!currentInstance || !isEcInstance) return;
    setStepValues({
      problemStatement: context.problem_statement ?? '',
      desiredOutcome: context.desired_outcome ?? '',
      discipline: context.discipline ?? '',
      projectType: context.project_type ?? '',
      location: context.location ?? '',
      objective: context.objective ?? '',
      currentStage: context.current_stage ?? '',
      urgency: context.urgency ?? '',
      hasDocuments: context.has_documents ?? null,
      documentNotes: context.document_notes ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
    });
  }, [currentInstance, context, isEcInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: ENGINEERING_CONSULTING_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة الاستشارة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isEcInstance) return;
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
  }, [advance, currentInstance, currentStep, isEcInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isEcInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isEcInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'handoff_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isEcInstance && !isCompleted;

  return (
    <JourneyShell
      title="الاستشارات الهندسية"
      description="من الفهم الأولي إلى موجز هندسي أولي — ثم طلب استشارة مهنية."
      startLabel="ابدأ الاستشارة الهندسية"
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
      {isEcInstance && currentInstance ? (
        <EngineeringConsultingStepPanel
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
