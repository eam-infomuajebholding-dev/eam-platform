import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  extractExistingInstanceId,
  extractFieldErrors,
  getErrorMessage,
  type FieldValidationErrorDetail,
} from '@/features/journeys/core/journeyErrors';
import * as josClient from '@/features/journeys/core/josClient';
import type { JourneyInstance } from '@/features/journeys/core/types';
import { useJourney } from '@/features/journeys/core/useJourney';
import {
  journeySectorMessageKey,
  type JourneySectorId,
} from '@/i18n/journeySectorMessages';

export interface JourneyPageShellConfig {
  title: string;
  description: string;
  startLabel: string;
  progressVariant?: 'bar' | 'text';
}

export interface JourneyPageMessages {
  startError: string;
  advanceError: string;
  completeError: string;
  revisitError?: string;
}

export interface UseJourneyPageConfig<TValues, TContext extends Record<string, unknown>> {
  sectorId?: JourneySectorId;
  journeyType: string;
  terminalStep?: string;
  emptyValues: () => TValues;
  syncFromContext: (context: TContext) => TValues;
  buildAdvanceInput: (currentStep: string | null, values: TValues) => Record<string, unknown>;
  resolveStepProgress: (stepKey: string | null) => number;
  getTotalSteps: () => number;
  messages: JourneyPageMessages;
  shell: JourneyPageShellConfig;
  supportsRevisit?: boolean;
  journeyInitialContext?: Record<string, unknown>;
  partnerBanner?: { partnerName: string; outletLabel?: string | null } | null;
  partnerLinkInvalid?: boolean;
}

function isResumable(instance: JourneyInstance): boolean {
  return instance.status === 'active' || instance.status === 'paused';
}

export function useJourneyPage<TValues, TContext extends Record<string, unknown>>(
  config: UseJourneyPageConfig<TValues, TContext>,
) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    currentInstance,
    isHydrating,
    anonymousSessionId,
    startJourney,
    advance,
    complete,
    revisit,
    getInstance,
    setCurrentInstance,
  } = useJourney();

  const {
    sectorId,
    journeyType,
    terminalStep: configuredTerminalStep,
    emptyValues,
    syncFromContext,
    buildAdvanceInput,
    resolveStepProgress,
    getTotalSteps,
    messages,
    shell,
    supportsRevisit,
    journeyInitialContext,
    partnerBanner,
    partnerLinkInvalid,
  } = config;

  const terminalStep = configuredTerminalStep ?? 'intake_complete';

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldValidationErrorDetail[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [stepValues, setStepValues] = useState<TValues>(() => emptyValues());
  const [resumableInstance, setResumableInstance] = useState<JourneyInstance | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);

  const scopedInstance = currentInstance?.journey_type === journeyType ? currentInstance : null;

  const context = (scopedInstance?.context ?? {}) as TContext;
  const currentStep = scopedInstance?.current_step_key ?? null;
  const isCompleted = scopedInstance?.status === 'completed';
  const isTerminal = currentStep === terminalStep;
  const showPanel = Boolean(scopedInstance);

  useEffect(() => {
    if (!scopedInstance) {
      return;
    }
    setStepValues(syncFromContext((scopedInstance.context ?? {}) as TContext));
  }, [scopedInstance?.id, scopedInstance?.current_step_key, scopedInstance?.updated_at, syncFromContext]);

  useEffect(() => {
    if (isHydrating || scopedInstance) {
      return;
    }

    let cancelled = false;

    async function loadResumable() {
      try {
        const items = await josClient.listActiveInstances(journeyType, anonymousSessionId);
        const match = items.find(isResumable);
        if (!cancelled) {
          setResumableInstance(match ?? null);
        }
      } catch {
        if (!cancelled) {
          setResumableInstance(null);
        }
      }
    }

    void loadResumable();
    return () => {
      cancelled = true;
    };
  }, [anonymousSessionId, journeyType, isHydrating, scopedInstance]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await startJourney({
        journey_type: journeyType,
        ...(journeyInitialContext ? { initial_context: journeyInitialContext } : {}),
      });
      setResumableInstance(null);
    } catch (error) {
      const existingId = extractExistingInstanceId(error);
      if (existingId) {
        try {
          await getInstance(existingId);
          setResumableInstance(null);
          return;
        } catch {
          /* fall through */
        }
      }
      setFormError(messages.startError);
    } finally {
      setIsLoading(false);
    }
  }, [getInstance, journeyInitialContext, journeyType, messages.startError, startJourney]);

  const handleResume = useCallback(async () => {
    if (!resumableInstance) {
      return;
    }
    setIsLoadingResume(true);
    setFormError(null);
    try {
      setCurrentInstance(resumableInstance);
      setResumableInstance(null);
    } finally {
      setIsLoadingResume(false);
    }
  }, [resumableInstance, setCurrentInstance]);

  const handleAdvance = useCallback(async () => {
    if (!scopedInstance) {
      return;
    }
    setIsLoading(true);
    setFormError(null);
    setFieldErrors([]);
    try {
      await advance(scopedInstance.id, {
        input: buildAdvanceInput(currentStep, stepValues),
      });
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      setFormError(getErrorMessage(errors, messages.advanceError));
    } finally {
      setIsLoading(false);
    }
  }, [advance, buildAdvanceInput, currentStep, messages.advanceError, scopedInstance, stepValues]);

  const handleRevisit = useCallback(
    async (targetStep: string) => {
      if (!scopedInstance || !supportsRevisit) {
        return;
      }
      setIsLoading(true);
      setFormError(null);
      setFieldErrors([]);
      try {
        await revisit(scopedInstance.id, targetStep);
      } catch {
        setFormError(messages.revisitError ?? t('journey.revisitError'));
      } finally {
        setIsLoading(false);
      }
    },
    [messages.revisitError, revisit, scopedInstance, supportsRevisit, t],
  );

  const handleComplete = useCallback(async () => {
    if (!scopedInstance) {
      return;
    }
    setIsLoading(true);
    setFormError(null);
    try {
      await complete(scopedInstance.id);
    } catch {
      setFormError(messages.completeError);
    } finally {
      setIsLoading(false);
    }
  }, [complete, messages.completeError, scopedInstance]);

  const stepProgress = useMemo(
    () => resolveStepProgress(currentStep),
    [currentStep, resolveStepProgress],
  );

  const showStart = !scopedInstance && !isCompleted && !isHydrating;
  const showResume = showStart && Boolean(resumableInstance);

  const footer: ReactNode =
    isCompleted && user ? (
      <Link to="/my-requests" className="mt-6 block text-center text-gold hover:underline">
        {t('journey.goToMyRequests')}
      </Link>
    ) : null;

  const completedMessage = sectorId
    ? t(journeySectorMessageKey(sectorId, 'completedMessage'))
    : undefined;

  const panelProps = {
    currentStep,
    context,
    values: stepValues,
    onChange: setStepValues,
    fieldErrors,
    formError,
    isLoading,
    isTerminal,
    isCompleted,
    onAdvance: handleAdvance,
    onComplete: handleComplete,
    ...(sectorId ? { sectorId } : {}),
    ...(completedMessage ? { completedMessage } : {}),
    ...(supportsRevisit ? { onRevisit: handleRevisit } : {}),
  };

  return {
    isHydrating,
    isLoading: isLoading || isLoadingResume,
    showStart,
    showResume,
    showPanel,
    resumableInstance,
    scopedInstance,
    context,
    currentStep,
    isCompleted,
    isTerminal,
    stepValues,
    setStepValues,
    fieldErrors,
    formError,
    stepProgress,
    footer,
    panelProps,
    handleStart,
    handleResume,
    handleAdvance,
    handleComplete,
    handleRevisit: supportsRevisit ? handleRevisit : undefined,
    shell: {
      title: shell.title,
      description: shell.description,
      startLabel: shell.startLabel,
      onStart: handleStart,
      isLoading: isLoading || isLoadingResume,
      showStart,
      showResume,
      onResume: handleResume,
      resumeHint: t('journey.resumeHint'),
      resumeLabel: t('journey.resumeButton'),
      isCompleted,
      stepProgress,
      totalSteps: getTotalSteps(),
      progressVariant: shell.progressVariant ?? 'bar',
      isHydrating,
      footer,
      partnerBanner: partnerBanner ?? null,
      partnerLinkInvalid: partnerLinkInvalid ?? false,
    },
  };
}
