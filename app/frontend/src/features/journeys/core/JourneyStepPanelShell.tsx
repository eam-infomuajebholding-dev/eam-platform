import type { ReactNode } from 'react';
import JourneyStepFrame from '@/features/journeys/core/JourneyStepFrame';
import type { FieldValidationErrorDetail } from '@/features/journeys/core/journeyErrors';
import JourneyStepRevisitBar from '@/features/journeys/core/JourneyStepRevisitBar';
import { isOptionalJourneyStep } from '@/features/journeys/core/journeyRevisit';

export interface JourneyStepPanelShellProps {
  currentStep: string | null;
  stepOrder?: readonly string[];
  stepLabels: Record<string, string>;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  isLoading: boolean;
  isTerminal: boolean;
  isCompleted: boolean;
  completedMessage?: string;
  onAdvance: () => void;
  onComplete: () => void;
  onRevisit?: (targetStep: string) => void;
  advanceLabel?: string;
  completeLabel?: string;
  children: ReactNode;
}

export default function JourneyStepPanelShell({
  currentStep,
  stepLabels,
  fieldErrors,
  formError,
  isLoading,
  isTerminal,
  isCompleted,
  completedMessage,
  onAdvance,
  onComplete,
  onRevisit,
  advanceLabel,
  completeLabel,
  stepOrder,
  children,
}: JourneyStepPanelShellProps) {
  const showOptionalHint = isOptionalJourneyStep(currentStep) && !isTerminal && !isCompleted;

  return (
    <JourneyStepFrame
      stepTitle={currentStep ? (stepLabels[currentStep] ?? currentStep) : null}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      isTerminal={isTerminal}
      isCompleted={isCompleted}
      completedMessage={completedMessage}
      advanceLabel={advanceLabel}
      completeLabel={completeLabel}
      onAdvance={onAdvance}
      onComplete={onComplete}
    >
      {stepOrder ? (
        <JourneyStepRevisitBar
          stepOrder={stepOrder}
          currentStep={currentStep}
          stepLabels={stepLabels}
          onRevisit={onRevisit}
          isLoading={isLoading}
        />
      ) : null}
      {children}
      {showOptionalHint ? (
        <p className="text-xs text-ink-secondary" dir="rtl">
          هذه الخطوة مرنة — يمكنك المتابعة دون تعبئة إذا لا ينطبق ذلك عليك.
        </p>
      ) : null}
    </JourneyStepFrame>
  );
}
