import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  journeySectorMessageKey,
  type JourneySectorId,
} from '@/i18n/journeySectorMessages';
import { JOURNEY_SECTOR_CATALOG } from '@/features/journeys/core/journeyCatalog';
import { createStepHelpers } from '@/features/journeys/core/stepUtils';
import { useJourneyPage } from '@/features/journeys/core/useJourneyPage';
import { usePartnerAttribution } from '@/features/partners/usePartnerAttribution';

export interface SectorJourneyDomainConfig<TValues, TContext extends Record<string, unknown>> {
  stepOrder: readonly string[];
  emptyValues: () => TValues;
  syncFromContext: (context: TContext) => TValues;
  buildAdvanceInput: (currentStep: string | null, values: TValues) => Record<string, unknown>;
}

export function useSectorJourneyPage<TValues, TContext extends Record<string, unknown>>(
  sectorId: JourneySectorId,
  config: SectorJourneyDomainConfig<TValues, TContext>,
) {
  const { t } = useLanguage();
  const catalog = JOURNEY_SECTOR_CATALOG[sectorId];
  const partnerAttribution = usePartnerAttribution();
  const stepHelpers = useMemo(() => createStepHelpers(config.stepOrder), [config.stepOrder]);

  const advanceErrorKey = journeySectorMessageKey(sectorId, 'advanceError');
  const advanceError =
    sectorId === 'build-villa' ? t(advanceErrorKey) : t('journey.error.advance');

  return useJourneyPage({
    sectorId,
    journeyType: catalog.journeyType,
    terminalStep: catalog.terminalStep,
    supportsRevisit: catalog.supportsRevisit,
    journeyInitialContext:
      partnerAttribution.partnerSlug && !partnerAttribution.resolveError
        ? partnerAttribution.initialContext
        : undefined,
    partnerBanner: partnerAttribution.banner,
    partnerLinkInvalid: Boolean(partnerAttribution.partnerSlug && partnerAttribution.resolveError),
    emptyValues: config.emptyValues,
    syncFromContext: config.syncFromContext,
    buildAdvanceInput: config.buildAdvanceInput,
    resolveStepProgress: stepHelpers.resolveStepProgress,
    getTotalSteps: stepHelpers.getTotalSteps,
    messages: {
      startError: t(journeySectorMessageKey(sectorId, 'startError')),
      advanceError,
      completeError: t('journey.error.complete'),
      revisitError: t('journey.revisitError'),
    },
    shell: {
      title: t(journeySectorMessageKey(sectorId, 'title')),
      description: t(journeySectorMessageKey(sectorId, 'description')),
      startLabel: t(journeySectorMessageKey(sectorId, 'startLabel')),
      progressVariant: catalog.progressVariant ?? 'bar',
    },
  });
}
