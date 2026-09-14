import type { ComponentType } from 'react';
import JourneyPageScaffold from '@/features/journeys/core/JourneyPageScaffold';
import {
  useSectorJourneyPage,
  type SectorJourneyDomainConfig,
} from '@/features/journeys/core/useSectorJourneyPage';
import type { JourneySectorId } from '@/i18n/journeySectorMessages';

interface SectorJourneyPageProps<TValues, TContext extends Record<string, unknown>> {
  sectorId: JourneySectorId;
  StepPanel: ComponentType<object>;
  domain: SectorJourneyDomainConfig<TValues, TContext>;
}

export default function SectorJourneyPage<TValues, TContext extends Record<string, unknown>>({
  sectorId,
  StepPanel,
  domain,
}: SectorJourneyPageProps<TValues, TContext>) {
  const journey = useSectorJourneyPage(sectorId, domain);
  return <JourneyPageScaffold journey={journey} StepPanel={StepPanel} />;
}
