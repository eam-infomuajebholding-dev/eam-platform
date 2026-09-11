import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useJourney } from '@/features/journeys/core/useJourney';
import ProjectManagementStepPanel from './ProjectManagementStepPanel';
import { getStepNumber, getTotalSteps } from './constants';
import {
  buildAdvanceInput,
  extractFieldErrors,
  getErrorMessage,
  type ProjectManagementStepValues,
} from './errors';
import { PROJECT_MANAGEMENT_JOURNEY_TYPE, type ProjectManagementContext } from './types';

const emptyValues = (): ProjectManagementStepValues => ({
  projectType: '',
  projectStage: '',
  projectObjective: '',
  currentStatus: '',
  scopeClarity: '',
  desiredTimeline: '',
  urgency: '',
  budgetState: '',
  mainChallenges: '',
  topRisks: '',
  stakeholderNotes: '',
  engagementGoal: '',
  scopeConfirmed: false,
  submitConfirmed: false,
});

export default function ProjectManagementJourneyPage() {
  const { user } = useAuth();
  const { currentInstance, startJourney, advance, complete } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof extractFieldErrors>>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<ProjectManagementStepValues>(emptyValues);

  const isPmInstance = currentInstance?.journey_type === PROJECT_MANAGEMENT_JOURNEY_TYPE;
  const context = (currentInstance?.context ?? {}) as ProjectManagementContext;
  const currentStep = isPmInstance ? (currentInstance?.current_step_key ?? null) : null;
  const isCompleted = isPmInstance && currentInstance?.status === 'completed';
  const isTerminal = currentStep === 'intake_complete';

  useEffect(() => {
    if (!currentInstance || !isPmInstance) return;
    setStepValues({
      projectType: context.project_type ?? '',
      projectStage: context.project_stage ?? '',
      projectObjective: context.project_objective ?? '',
      currentStatus: context.current_status ?? '',
      scopeClarity: context.scope_clarity ?? '',
      desiredTimeline: context.desired_timeline ?? '',
      urgency: context.urgency ?? '',
      budgetState: context.budget_state ?? '',
      mainChallenges: context.main_challenges ?? '',
      topRisks: context.top_risks ?? '',
      stakeholderNotes: context.stakeholder_notes ?? '',
      engagementGoal: context.engagement_goal ?? '',
      scopeConfirmed: context.scope_confirmed ?? false,
      submitConfirmed: context.submit_confirmed ?? false,
    });
  }, [currentInstance, context, isPmInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({ journey_type: PROJECT_MANAGEMENT_JOURNEY_TYPE });
    } catch {
      setFormError('تعذر بدء رحلة إدارة المشروع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [startJourney]);

  const handleAdvance = useCallback(async () => {
    if (!currentInstance || !isPmInstance) return;
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
  }, [advance, currentInstance, currentStep, isPmInstance, stepValues]);

  const handleComplete = useCallback(async () => {
    if (!currentInstance || !isPmInstance) return;
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(currentInstance.id);
    } catch {
      setFormError('تعذر إنهاء الرحلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [complete, currentInstance, isPmInstance]);

  const stepProgress = useMemo(() => {
    if (!currentStep || currentStep === 'intake_complete') return getTotalSteps();
    return getStepNumber(currentStep);
  }, [currentStep]);

  const showStart = !isPmInstance && !isCompleted;

  return (
    <JourneyShell
      title="إدارة المشاريع"
      description="رحلة جاهزية إدارة المشروع — من فهم الوضع الحالي إلى موجز أولي قبل المراجعة المهنية."
      startLabel="ابدأ رحلة جاهزية إدارة المشروع"
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
      {isPmInstance && currentInstance ? (
        <ProjectManagementStepPanel
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
