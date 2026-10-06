import EditorPagesSheet from '@/features/site-editor/components/EditorPagesSheet';

export interface CustomNavLink {
  path: string;
  label: string;
  backgroundType?: 'none' | 'image' | 'video';
  backgroundData?: string;
}

const STORAGE_KEY = 'custom-nav-links';

export function getCustomNavLinks(): CustomNavLink[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

interface PageManagerProps {
  open: boolean;
  onClose: () => void;
}

/** @deprecated Use EditorPagesSheet — kept for EditToolbar compatibility. */
export default function PageManager({ open, onClose }: PageManagerProps) {
  return <EditorPagesSheet open={open} onClose={onClose} />;
}
