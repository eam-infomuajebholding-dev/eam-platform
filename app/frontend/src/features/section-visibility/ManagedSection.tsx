import type { ReactNode } from 'react';
import { EyeOff } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSectionVisibility } from './SectionVisibilityContext';

type Props = {
  sectionId: string;
  children: ReactNode;
  className?: string;
};

/**
 * Gates a page section: hidden from visitors until published; still visible in editor with draft chrome.
 */
export default function ManagedSection({ sectionId, children, className = '' }: Props) {
  const { shouldRenderSection, isHiddenFromPublic } = useSectionVisibility();
  const { isEditMode, isDevEditModeAvailable } = useEditMode();

  if (!shouldRenderSection(sectionId)) {
    return null;
  }

  const draft = isHiddenFromPublic(sectionId);
  const showDraftChrome = draft && isDevEditModeAvailable && isEditMode;

  return (
    <div
      className={`site-managed-section ${className} ${showDraftChrome ? 'site-managed-section--draft' : ''}`}
      data-home-section={sectionId}
      data-section-publish={draft ? 'hidden' : 'published'}
    >
      {showDraftChrome ? (
        <div className="site-managed-section__banner" role="status">
          <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong>غير منشور</strong> — هذا القسم مخفي عن الزوار. انشره من «الأقسام» في محرر المحتوى عند
            الجاهزية.
          </span>
        </div>
      ) : null}
      {children}
    </div>
  );
}
