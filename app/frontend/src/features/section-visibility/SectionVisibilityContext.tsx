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
} from './registry';
import { loadSectionVisibilityMap, persistSectionVisibility } from './persistence';

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
  const { isEditMode, isDevEditModeAvailable } = useEditMode();
  const editorPreview = isDevEditModeAvailable && isEditMode;

  const [map, setMap] = useState<Record<string, SectionPublishState>>({});
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await loadSectionVisibilityMap(pathname);
      setMap(loaded);
    } catch {
      setMap({});
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getState = useCallback(
    (sectionId: string): SectionPublishState => {
      if (map[sectionId]) return map[sectionId];
      const def = sectionsForPage(pathname).find((s) => s.id === sectionId);
      return def?.defaultState ?? 'published';
    },
    [map, pathname],
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
        await persistSectionVisibility(pathname, sectionId, state);
        setMap((prev) => ({ ...prev, [sectionId]: state }));
        toast.success(state === 'published' ? 'تم نشر القسم للزوار' : 'تم إخفاء القسم عن الزوار');
      } catch {
        toast.error('تعذر حفظ حالة القسم');
      }
    },
    [pathname],
  );

  const sections = useMemo(() => {
    return sectionsForPage(pathname).map((def) => ({
      id: def.id,
      label: def.label,
      state: getState(def.id),
    }));
  }, [pathname, getState, map]);

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
