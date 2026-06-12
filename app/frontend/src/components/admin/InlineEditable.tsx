import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditMode } from '@/contexts/EditModeContext';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { saveMediaToIDB, getMediaFromIDB } from '@/lib/mediaStorage';

// ============ Helper Functions ============

function getElementPath(el: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = el;
  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName
      );
      const index = siblings.indexOf(current);
      parts.unshift(`${tag}[${index}]`);
    } else {
      parts.unshift(tag);
    }
    current = current.parentElement;
  }
  return parts.join('>');
}

function getStorageKey(path: string): string {
  const page = window.location.pathname;
  return `edit-content-${page}-${path}`;
}

function findElementByPath(path: string): HTMLElement | null {
  try {
    const parts = path.split('>');
    let current: HTMLElement = document.body;
    for (const part of parts) {
      const match = part.match(/^(\w+)\[(\d+)\]$/);
      if (!match) return null;
      const [, tag, indexStr] = match;
      const index = parseInt(indexStr);
      const children = Array.from(current.children).filter(
        (c) => c.tagName.toLowerCase() === tag
      );
      if (!children[index]) return null;
      current = children[index] as HTMLElement;
    }
    return current;
  } catch {
    return null;
  }
}

// Apply all saved edits from localStorage for the current page
export function applySavedEdits() {
  const page = window.location.pathname;
  const prefix = `edit-content-${page}-`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const elementPath = key.replace(prefix, '');
      const savedValue = localStorage.getItem(key);
      if (!savedValue) continue;
      try {
        const data = JSON.parse(savedValue);
        if (data.type === 'text') {
          const el = findElementByPath(elementPath);
          if (el) el.textContent = data.value;
        } else if (data.type === 'image') {
          const el = findElementByPath(elementPath) as HTMLImageElement;
          if (el && el.tagName === 'IMG') {
            if (data.value.startsWith('idb://')) {
              // Load from IndexedDB
              const idbKey = data.value.replace('idb://', '');
              getMediaFromIDB(idbKey).then((dataUrl) => {
                if (dataUrl) el.src = dataUrl;
              });
            } else {
              el.src = data.value;
            }
          }
        } else if (data.type === 'video') {
          const el = findElementByPath(elementPath) as HTMLVideoElement;
          if (el && el.tagName === 'VIDEO') {
            if (data.value.startsWith('idb://')) {
              // Load from IndexedDB
              const idbKey = data.value.replace('idb://', '');
              getMediaFromIDB(idbKey).then((dataUrl) => {
                if (dataUrl) {
                  const source = el.querySelector('source');
                  if (source) source.src = dataUrl;
                  else el.src = dataUrl;
                  el.load();
                }
              });
            } else {
              const source = el.querySelector('source');
              if (source) source.src = data.value;
              else el.src = data.value;
            }
          }
        }
      } catch {
        /* ignore parse errors */
      }
    }
  }
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalTextRef = useRef<string>('');
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
            // Start inline text editing
            originalTextRef.current = el.textContent || '';
            setEditingElement(el);
            el.contentEditable = 'true';
            el.focus();
            el.style.outline = '2px solid #D3B051';
            el.style.outlineOffset = '2px';
            el.style.backgroundColor = 'rgba(211, 176, 81, 0.1)';
            updateToolbarPosition(el);
          } else if (isImageElement(el)) {
            // Open file picker for image
            setEditingElement(el);
            setFileAccept('image/*');
            setTimeout(() => fileInputRef.current?.click(), 0);
          } else if (isVideoElement(el)) {
            // Open file picker for video
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
    const path = getElementPath(editingElement);
    const key = getStorageKey(path);
    localStorage.setItem(key, JSON.stringify({ type: 'text', value: newText }));
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editingElement) {
        setEditingElement(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const path = getElementPath(editingElement);
        const storageKey = getStorageKey(path);
        const idbKey = `media-${storageKey}`;

        try {
          if (isImageElement(editingElement)) {
            (editingElement as HTMLImageElement).src = dataUrl;
            // Save to IndexedDB (handles large files)
            await saveMediaToIDB(idbKey, dataUrl);
            // Store reference in localStorage
            localStorage.setItem(storageKey, JSON.stringify({ type: 'image', value: `idb://${idbKey}` }));
            toast.success('تم تحديث الصورة');
          } else if (isVideoElement(editingElement)) {
            const videoEl = editingElement as HTMLVideoElement;
            const source = videoEl.querySelector('source');
            if (source) source.src = dataUrl;
            else videoEl.src = dataUrl;
            videoEl.load();
            // Save to IndexedDB (handles large files)
            await saveMediaToIDB(idbKey, dataUrl);
            // Store reference in localStorage
            localStorage.setItem(storageKey, JSON.stringify({ type: 'video', value: `idb://${idbKey}` }));
            toast.success('تم تحديث الفيديو');
          }
        } catch {
          toast.error('حدث خطأ أثناء حفظ الملف');
        }

        setEditingElement(null);
        setHoveredElement(null);
      };
      reader.readAsDataURL(file);

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