import type { FieldValidationErrorDetail } from '@/features/journeys/core/journeyErrors';
import type { JourneySectorId } from '@/i18n/journeySectorMessages';

export interface JourneyStepPanelProps<
  TValues,
  TContext extends Record<string, unknown> = Record<string, unknown>,
> {
  currentStep: string | null;
  context: TContext;
  values: TValues;
  onChange: (values: TValues) => void;
  fieldErrors: FieldValidationErrorDetail[];
  formError: string | null;
  isLoading: boolean;
  isTerminal: boolean;
  isCompleted: boolean;
  onAdvance: () => void;
  onComplete: () => void;
  onRevisit?: (targetStep: string) => void;
  completedMessage?: string;
  sectorId?: JourneySectorId;
}
