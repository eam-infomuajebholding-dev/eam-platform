import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useEditMode } from '@/contexts/EditModeContext';
import {
  type SectionPublishState,
  sectionsForPage,
  sectionStorageKey,
  pageKeyForSectionVisibility,
} from './registry';
import { applyDomSectionVisibility } from './applyDomSectionVisibility';
import { loadSectionVisibilityMap, persistSectionVisibility } from './persistence';
import {
  discoverSectionsFromDocument,
  mergeSectionDefinitions,
} from './sectionDom';

type SectionVisibilityContextValue = {
  pagePath: string;
  sections: { id: string; label: string; state: SectionPublishState }[];
  isLoading: boolean;
  /** Public + published, or editor preview of hidden */
  shouldRenderSection: (sectionId: string) => boolean;
  isHiddenFromPublic: (sectionId: string) => boolean;
  getState: (sectionId: string) => SectionPublishState;
  setSectionState: (sectionId: string, state: SectionPublishState) => Promise<void>;
  reload: () => Promise<void>;
};

const SectionVisibilityContext = createContext<SectionVisibilityContextValue | null>(null);

export function useSectionVisibility() {
  const ctx = useContext(SectionVisibilityContext);
  if (!ctx) {
    throw new Error('useSectionVisibility must be used within SectionVisibilityProvider');
  }
  return ctx;
}

export function useSectionVisibilityOptional() {
  return useContext(SectionVisibilityContext);
}

export function SectionVisibilityProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const pageKey = pageKeyForSectionVisibility(pathname);
  const { isEditMode, isDevEditModeAvailable } = useEditMode();
  const editorPreview = isDevEditModeAvailable && isEditMode;

  const [map, setMap] = useState<Record<string, SectionPublishState>>({});
  const [domSections, setDomSections] = useState<ReturnType<typeof discoverSectionsFromDocument>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshDomSections = useCallback(() => {
    setDomSections(discoverSectionsFromDocument());
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await loadSectionVisibilityMap(pageKey);
      setMap(loaded);
    } catch {
      setMap({});
    } finally {
      setIsLoading(false);
    }
  }, [pageKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    refreshDomSections();
    const t1 = window.setTimeout(refreshDomSections, 300);
    const t2 = window.setTimeout(refreshDomSections, 800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, refreshDomSections, isEditMode, map]);

  useEffect(() => {
    if (isLoading) return;
    const run = () => {
      refreshDomSections();
      applyDomSectionVisibility(pathname, map, editorPreview);
    };
    run();
    const t1 = window.setTimeout(run, 300);
    const t2 = window.setTimeout(run, 800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, pageKey, map, editorPreview, isLoading, refreshDomSections]);

  const getState = useCallback(
    (sectionId: string): SectionPublishState => {
      if (map[sectionId]) return map[sectionId];
      const def = sectionsForPage(pageKey).find((s) => s.id === sectionId);
      return def?.defaultState ?? 'published';
    },
    [map, pageKey],
  );

  const isHiddenFromPublic = useCallback(
    (sectionId: string) => getState(sectionId) === 'hidden',
    [getState],
  );

  const shouldRenderSection = useCallback(
    (sectionId: string) => {
      const state = getState(sectionId);
      if (state === 'published') return true;
      return editorPreview;
    },
    [getState, editorPreview],
  );

  const setSectionState = useCallback(
    async (sectionId: string, state: SectionPublishState) => {
      try {
        await persistSectionVisibility(pageKey, sectionId, state);
        setMap((prev) => ({ ...prev, [sectionId]: state }));
        toast.success(state === 'published' ? 'تم نشر القسم للزوار' : 'تم إخفاء القسم عن الزوار');
      } catch {
        toast.error('تعذر حفظ حالة القسم');
      }
    },
    [pageKey],
  );

  const sections = useMemo(() => {
    const merged = mergeSectionDefinitions(sectionsForPage(pageKey), domSections);
    return merged.map((def) => ({
      id: def.id,
      label: def.label,
      state: getState(def.id),
    }));
  }, [pageKey, getState, map, domSections]);

  const value = useMemo<SectionVisibilityContextValue>(
    () => ({
      pagePath: pathname,
      sections,
      isLoading,
      shouldRenderSection,
      isHiddenFromPublic,
      getState,
      setSectionState,
      reload,
    }),
    [pathname, sections, isLoading, shouldRenderSection, isHiddenFromPublic, getState, setSectionState, reload],
  );

  return <SectionVisibilityContext.Provider value={value}>{children}</SectionVisibilityContext.Provider>;
}

/** Re-export for persistence keys used in revisions UI */
export { sectionStorageKey };
