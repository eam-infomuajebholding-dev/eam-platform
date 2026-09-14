import type { ReactNode } from 'react';
import JourneyStepFrame from '@/features/journeys/core/JourneyStepFrame';
import type { FieldValidationErrorDetail } from '@/features/journeys/core/journeyErrors';

export interface JourneyStepPanelShellProps {
  currentStep: string | null;
  stepLabels: Record<string, string>;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  isLoading: boolean;
  isTerminal: boolean;
  isCompleted: boolean;
  completedMessage?: string;
  onAdvance: () => void;
  onComplete: () => void;
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
  advanceLabel,
  completeLabel,
  children,
}: JourneyStepPanelShellProps) {
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
      {children}
    </JourneyStepFrame>
  );
}
