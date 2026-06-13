import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditMode } from '@/contexts/EditModeContext';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { saveMediaToIDB, getMediaFromIDB } from '@/lib/mediaStorage';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';

// ============ Stable Key Functions ============

/**
 * Get a stable storage key for an element.
 * Priority:
 * 1. data-editable-id attribute on the element or a close ancestor
 * 2. Fallback: page path + tag + first 30 chars of text/src content
 */
function getStableKey(el: HTMLElement): string {
  // Check for explicit data-editable-id
  const editableId = el.getAttribute('data-editable-id') || el.closest('[data-editable-id]')?.getAttribute('data-editable-id');
  if (editableId) {
    return editableId;
  }

  // Fallback: generate a key from tag + content
  const tag = el.tagName.toLowerCase();
  if (el.tagName === 'IMG') {
    const src = (el as HTMLImageElement).getAttribute('src') || '';
    const srcKey = src.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
    return `${tag}-${srcKey}`;
  }
  if (el.tagName === 'VIDEO') {
    const source = el.querySelector('source');
    const src = source?.getAttribute('src') || (el as HTMLVideoElement).getAttribute('src') || '';
    const srcKey = src.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
    return `${tag}-${srcKey}`;
  }
  // Text element
  const text = (el.textContent || '').trim().slice(0, 30).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
  return `${tag}-${text}`;
}

function getStorageKey(stableKey: string): string {
  const page = window.location.pathname;
  return `edit-v2-${page}-${stableKey}`;
}

// ============ Apply Saved Edits ============

/**
 * Apply all saved edits from localStorage for the current page.
 * Uses data-editable-id attributes for precise element matching,
 * with fallback matching by tag+content for elements without explicit IDs.
 */
export function applySavedEdits() {
  const page = window.location.pathname;
  const prefix = `edit-v2-${page}-`;

  // Collect all saved edits for this page
  const savedEdits: { key: string; stableKey: string; data: { type: string; value: string } }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const stableKey = key.replace(prefix, '');
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const data = JSON.parse(raw);
        savedEdits.push({ key, stableKey, data });
      } catch {
        /* ignore parse errors */
      }
    }
  }

  if (savedEdits.length === 0) return;

  // Apply edits with retry logic to handle React rendering delays
  const applyOnce = () => {
    for (const edit of savedEdits) {
      const { stableKey, data } = edit;

      // Strategy 1: Find by data-editable-id
      let el: HTMLElement | null = document.querySelector(`[data-editable-id="${stableKey}"]`);

      // Strategy 2: If not found by ID, try fallback matching
      if (!el && stableKey.includes('-')) {
        const dashIndex = stableKey.indexOf('-');
        const tag = stableKey.slice(0, dashIndex);
        const contentHint = stableKey.slice(dashIndex + 1);

        if (data.type === 'text' && contentHint) {
          // Find text elements by tag that contain similar text
          const candidates = document.querySelectorAll(tag);
          for (const candidate of candidates) {
            const candidateText = (candidate.textContent || '').trim().slice(0, 30).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
            if (candidateText === contentHint) {
              el = candidate as HTMLElement;
              break;
            }
          }
        } else if (data.type === 'image' && tag === 'img') {
          // Find images by src hint
          const images = document.querySelectorAll('img');
          for (const img of images) {
            const srcKey = (img.getAttribute('src') || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
            if (srcKey === contentHint) {
              el = img as HTMLElement;
              break;
            }
          }
        } else if (data.type === 'video' && tag === 'video') {
          const videos = document.querySelectorAll('video');
          for (const video of videos) {
            const source = video.querySelector('source');
            const src = source?.getAttribute('src') || video.getAttribute('src') || '';
            const srcKey = src.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
            if (srcKey === contentHint) {
              el = video as HTMLElement;
              break;
            }
          }
        }
      }

      if (!el) continue;

      // Apply the edit
      try {
        if (data.type === 'text') {
          el.textContent = data.value;
        } else if (data.type === 'image') {
          const imgEl = el as HTMLImageElement;
          if (imgEl.tagName === 'IMG') {
            if (data.value.startsWith('idb://')) {
              const idbKey = data.value.replace('idb://', '');
              getMediaFromIDB(idbKey).then((dataUrl) => {
                if (dataUrl) imgEl.src = dataUrl;
              });
            } else {
              imgEl.src = data.value;
            }
          }
        } else if (data.type === 'video') {
          const videoEl = el as HTMLVideoElement;
          if (videoEl.tagName === 'VIDEO') {
            if (data.value.startsWith('idb://')) {
              const idbKey = data.value.replace('idb://', '');
              getMediaFromIDB(idbKey).then((dataUrl) => {
                if (dataUrl) {
                  const source = videoEl.querySelector('source');
                  if (source) source.src = dataUrl;
                  else videoEl.src = dataUrl;
                  videoEl.load();
                }
              });
            } else {
              const source = videoEl.querySelector('source');
              if (source) source.src = data.value;
              else videoEl.src = data.value;
              videoEl.load();
            }
          }
        }
      } catch {
        /* ignore apply errors */
      }
    }
  };

  // Apply immediately
  applyOnce();

  // Retry after a short delay to catch late-rendered elements
  setTimeout(applyOnce, 300);
  setTimeout(applyOnce, 800);
}

// ============ Text Editable Elements ============
const TEXT_TAGS = new Set([
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'P', 'SPAN', 'A', 'LI', 'TD', 'TH', 'LABEL', 'BLOCKQUOTE',
]);

function isTextElement(el: HTMLElement): boolean {
  // Skip elements that are too large (likely containers/sections)
  if (el.offsetHeight > 200 && el.tagName === 'DIV') return false;
  if (el.tagName === 'SECTION' || el.tagName === 'MAIN' || el.tagName === 'NAV' || el.tagName === 'FOOTER' || el.tagName === 'HEADER') return false;

  if (TEXT_TAGS.has(el.tagName)) {
    // Has any text content at all (direct or nested)
    const text = el.textContent?.trim();
    return !!text && text.length > 0;
  }
  // Buttons and small divs with text
  if (el.tagName === 'BUTTON' || el.tagName === 'DIV') {
    const text = el.textContent?.trim();
    return !!text && text.length > 0 && text.length < 500 && el.offsetHeight < 150;
  }
  return false;
}

function isImageElement(el: HTMLElement): boolean {
  return el.tagName === 'IMG';
}

function isVideoElement(el: HTMLElement): boolean {
  return el.tagName === 'VIDEO';
}

function isEditableElement(el: HTMLElement): boolean {
  return isTextElement(el) || isImageElement(el) || isVideoElement(el);
}

// Check if element is inside the edit toolbar/overlay itself
function isInsideEditUI(el: HTMLElement): boolean {
  return !!el.closest('[data-edit-overlay]') || !!el.closest('[data-edit-toolbar]');
}

// ============ GlobalEditOverlay Component ============
export function GlobalEditOverlay() {
  const { isEditMode } = useEditMode();
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [fileAccept, setFileAccept] = useState<string>('image/*');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalTextRef = useRef<string>('');
  const originalKeyRef = useRef<string>('');
  const styleSheetRef = useRef<HTMLStyleElement | null>(null);

  // Inject global cursor style for editable elements in edit mode
  useEffect(() => {
    if (isEditMode) {
      const style = document.createElement('style');
      style.setAttribute('data-edit-cursor', 'true');
      style.textContent = `
        body[data-edit-mode="true"] h1, body[data-edit-mode="true"] h2,
        body[data-edit-mode="true"] h3, body[data-edit-mode="true"] h4,
        body[data-edit-mode="true"] h5, body[data-edit-mode="true"] h6,
        body[data-edit-mode="true"] p, body[data-edit-mode="true"] span,
        body[data-edit-mode="true"] a, body[data-edit-mode="true"] li,
        body[data-edit-mode="true"] td, body[data-edit-mode="true"] th,
        body[data-edit-mode="true"] label, body[data-edit-mode="true"] blockquote,
        body[data-edit-mode="true"] button, body[data-edit-mode="true"] img,
        body[data-edit-mode="true"] video {
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);
      document.body.setAttribute('data-edit-mode', 'true');
      styleSheetRef.current = style;
    } else {
      document.body.removeAttribute('data-edit-mode');
      if (styleSheetRef.current) {
        styleSheetRef.current.remove();
        styleSheetRef.current = null;
      }
    }

    return () => {
      document.body.removeAttribute('data-edit-mode');
      if (styleSheetRef.current) {
        styleSheetRef.current.remove();
        styleSheetRef.current = null;
      }
    };
  }, [isEditMode]);

  const updateToolbarPosition = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    let top = rect.top - 44;
    if (top < 80) {
      top = rect.bottom + 8;
    }
    setToolbarPos({
      top,
      left: rect.left + rect.width / 2,
    });
  }, []);

  // Handle hover for visual feedback only (dashed outline, no toolbar)
  useEffect(() => {
    if (!isEditMode) {
      setHoveredElement(null);
      setEditingElement(null);
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || isInsideEditUI(target)) return;
      if (editingElement) return;

      // Walk up to find the nearest editable element
      let el: HTMLElement | null = target;
      while (el && el !== document.body) {
        if (isInsideEditUI(el)) return;
        if (isEditableElement(el)) {
          setHoveredElement(el);
          return;
        }
        el = el.parentElement;
      }
      setHoveredElement(null);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (relatedTarget && isInsideEditUI(relatedTarget)) return;
      if (editingElement) return;
      setHoveredElement(null);
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
    };
  }, [isEditMode, editingElement]);

  // Handle click to start editing
  useEffect(() => {
    if (!isEditMode) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || isInsideEditUI(target)) return;
      if (editingElement) return; // Already editing something

      // Walk up to find the nearest editable element
      let el: HTMLElement | null = target;
      while (el && el !== document.body) {
        if (isInsideEditUI(el)) return;
        if (isEditableElement(el)) {
          e.preventDefault();
          e.stopPropagation();

          if (isTextElement(el)) {
            // Store original text and stable key BEFORE editing starts
            originalTextRef.current = el.textContent || '';
            originalKeyRef.current = getStableKey(el);
            setEditingElement(el);
            el.contentEditable = 'true';
            el.focus();
            el.style.outline = '2px solid #D3B051';
            el.style.outlineOffset = '2px';
            el.style.backgroundColor = 'rgba(211, 176, 81, 0.1)';
            updateToolbarPosition(el);
          } else if (isImageElement(el)) {
            // Store stable key before file picker
            originalKeyRef.current = getStableKey(el);
            setEditingElement(el);
            setFileAccept('image/*');
            setTimeout(() => fileInputRef.current?.click(), 0);
          } else if (isVideoElement(el)) {
            // Store stable key before file picker
            originalKeyRef.current = getStableKey(el);
            setEditingElement(el);
            setFileAccept('video/*');
            setTimeout(() => fileInputRef.current?.click(), 0);
          }
          return;
        }
        el = el.parentElement;
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isEditMode, editingElement, updateToolbarPosition]);

  // Add/remove dashed outline on hovered element (visual feedback only)
  useEffect(() => {
    if (!hoveredElement || editingElement) return;
    hoveredElement.style.outline = '2px dashed #D3B051';
    hoveredElement.style.outlineOffset = '2px';
    hoveredElement.style.borderRadius = '4px';

    return () => {
      hoveredElement.style.outline = '';
      hoveredElement.style.outlineOffset = '';
      hoveredElement.style.borderRadius = '';
    };
  }, [hoveredElement, editingElement]);

  // Save text edit
  const saveTextEdit = useCallback(() => {
    if (!editingElement) return;
    const newText = editingElement.textContent || '';
    // Use the stable key captured at click time (before text was modified)
    const stableKey = originalKeyRef.current;
    const storageKey = getStorageKey(stableKey);
    localStorage.setItem(storageKey, JSON.stringify({ type: 'text', value: newText }));
    editingElement.contentEditable = 'false';
    editingElement.style.backgroundColor = '';
    editingElement.style.outline = '';
    editingElement.style.outlineOffset = '';
    setEditingElement(null);
    setHoveredElement(null);
    toast.success('تم حفظ التعديل');
  }, [editingElement]);

  // Cancel text edit
  const cancelTextEdit = useCallback(() => {
    if (!editingElement) return;
    editingElement.textContent = originalTextRef.current;
    editingElement.contentEditable = 'false';
    editingElement.style.backgroundColor = '';
    editingElement.style.outline = '';
    editingElement.style.outlineOffset = '';
    setEditingElement(null);
    setHoveredElement(null);
  }, [editingElement]);

  // Handle file selection for image/video
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editingElement) {
        setEditingElement(null);
        return;
      }

      const stableKey = originalKeyRef.current;
      const storageKey = getStorageKey(stableKey);
      setIsUploading(true);

      try {
        // Try Cloudinary first
        if (isCloudinaryConfigured()) {
          try {
            const cloudinaryUrl = await uploadToCloudinary(file);

            if (isImageElement(editingElement)) {
              (editingElement as HTMLImageElement).src = cloudinaryUrl;
              localStorage.setItem(storageKey, JSON.stringify({ type: 'image', value: cloudinaryUrl }));
              toast.success('تم تحديث الصورة');
            } else if (isVideoElement(editingElement)) {
              const videoEl = editingElement as HTMLVideoElement;
              const source = videoEl.querySelector('source');
              if (source) source.src = cloudinaryUrl;
              else videoEl.src = cloudinaryUrl;
              videoEl.load();
              localStorage.setItem(storageKey, JSON.stringify({ type: 'video', value: cloudinaryUrl }));
              toast.success('تم تحديث الفيديو');
            }

            setIsUploading(false);
            setEditingElement(null);
            setHoveredElement(null);
            e.target.value = '';
            return;
          } catch (cloudinaryError) {
            console.warn('Cloudinary upload failed, falling back to IndexedDB:', cloudinaryError);
            // Fall through to IndexedDB approach
          }
        }

        // Fallback: Read as data URL and store in IndexedDB
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const idbKey = `media-${storageKey}`;

          try {
            if (isImageElement(editingElement)) {
              (editingElement as HTMLImageElement).src = dataUrl;
              await saveMediaToIDB(idbKey, dataUrl);
              localStorage.setItem(storageKey, JSON.stringify({ type: 'image', value: `idb://${idbKey}` }));
              toast.success('تم تحديث الصورة');
            } else if (isVideoElement(editingElement)) {
              const videoEl = editingElement as HTMLVideoElement;
              const source = videoEl.querySelector('source');
              if (source) source.src = dataUrl;
              else videoEl.src = dataUrl;
              videoEl.load();
              await saveMediaToIDB(idbKey, dataUrl);
              localStorage.setItem(storageKey, JSON.stringify({ type: 'video', value: `idb://${idbKey}` }));
              toast.success('تم تحديث الفيديو');
            }
          } catch {
            toast.error('حدث خطأ أثناء حفظ الملف');
          }

          setIsUploading(false);
          setEditingElement(null);
          setHoveredElement(null);
        };
        reader.readAsDataURL(file);
      } catch {
        toast.error('حدث خطأ أثناء رفع الملف');
        setIsUploading(false);
        setEditingElement(null);
      }

      // Reset file input
      e.target.value = '';
    },
    [editingElement]
  );

  if (!isEditMode) return null;

  const showEditControls = editingElement && isTextElement(editingElement);

  return createPortal(
    <div data-edit-overlay="true" style={{ pointerEvents: 'none' }}>
      {/* Save/Cancel controls for text editing - appears after clicking a text element */}
      {showEditControls && (
        <div
          data-edit-toolbar="true"
          className="fixed z-[9999] flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#1a1a2e]/95 border border-[#D3B051] shadow-xl"
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={saveTextEdit}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-green-400 hover:bg-green-500/20 transition-colors"
          >
            <Check className="h-3 w-3" />
            حفظ
          </button>
          <button
            onClick={cancelTextEdit}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <X className="h-3 w-3" />
            إلغاء
          </button>
        </div>
      )}

      {/* Upload indicator */}
      {isUploading && (
        <div
          className="fixed z-[9999] px-4 py-2 rounded-lg bg-[#1a1a2e]/95 border border-[#D3B051] shadow-xl text-white text-sm"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          جاري الرفع...
        </div>
      )}

      {/* Hidden file input for image/video replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept={fileAccept}
        onChange={handleFileChange}
        className="hidden"
        style={{ pointerEvents: 'auto' }}
      />
    </div>,
    document.body
  );
}

// ============ Legacy Exports (pass-through wrappers) ============
// These are kept so existing imports don't break, but they just render children directly.

interface EditableTextProps {
  children: React.ReactNode;
  entityName?: string;
  entityId?: number | string;
  field?: string;
  value?: string;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
  multiline?: boolean;
}

export function EditableText({ children, className = '', as: Tag = 'span' }: EditableTextProps) {
  return <Tag className={className}>{children}</Tag>;
}

interface EditableImageProps {
  src: string;
  alt?: string;
  entityName?: string;
  entityId?: number | string;
  field?: string;
  className?: string;
}

export function EditableImage({ src, alt = '', className = '' }: EditableImageProps) {
  return <img src={src} alt={alt} className={className} />;
}

interface EditableVideoProps {
  src: string;
  entityName?: string;
  entityId?: number | string;
  field?: string;
  className?: string;
  poster?: string;
}

export function EditableVideo({ src, className = '', poster }: EditableVideoProps) {
  return (
    <video src={src} className={className} poster={poster} controls>
      <track kind="captions" />
    </video>
  );
}

interface EditableSectionProps {
  children: React.ReactNode;
  entityName?: string;
  entityId?: number | string;
  className?: string;
  onDelete?: () => void;
  onAddAbove?: () => void;
  onAddBelow?: () => void;
}

export function EditableSection({ children, className = '' }: EditableSectionProps) {
  return <div className={className}>{children}</div>;
}