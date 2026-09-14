import type { ComponentType } from 'react';
import JourneyShell from '@/features/journeys/core/JourneyShell';
import type { useJourneyPage } from '@/features/journeys/core/useJourneyPage';

type JourneyState = ReturnType<typeof useJourneyPage>;

interface JourneyPageScaffoldProps<P extends object> {
  journey: JourneyState;
  StepPanel: ComponentType<P>;
}

export default function JourneyPageScaffold<P extends object>({
  journey,
  StepPanel,
}: JourneyPageScaffoldProps<P>) {
  return (
    <JourneyShell {...journey.shell}>
      {journey.showPanel ? <StepPanel {...(journey.panelProps as P)} /> : null}
    </JourneyShell>
  );
}
