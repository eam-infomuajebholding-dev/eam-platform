import { Suspense, type ReactNode } from 'react';
import { Route } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { JOURNEY_ROUTE_DEFINITIONS, lazyJourneyPages } from '@/features/journeys/journeyRouteConfig';

function JourneyRouteFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-secondary">
      {t('journey.hydrating')}
    </div>
  );
}

export function JourneyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<JourneyRouteFallback />}>{children}</Suspense>;
}

export const journeyRouteElements = JOURNEY_ROUTE_DEFINITIONS.map(({ path }) => {
  const Page = lazyJourneyPages[path];
  return (
    <Route
      key={path}
      path={`/journeys/${path}`}
      element={
        <JourneyRoute>
          <Page />
        </JourneyRoute>
      }
    />
  );
});

export { JOURNEY_ROUTE_DEFINITIONS, lazyJourneyPages };
