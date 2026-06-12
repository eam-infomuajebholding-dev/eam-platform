import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditMode } from '@/contexts/EditModeContext';
import { Pencil, Image as ImageIcon, Video, Check, X } from 'lucide-react';
import { toast } from 'sonner';

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
          if (el && el.tagName === 'IMG') el.src = data.value;
        } else if (data.type === 'video') {
          const el = findElementByPath(elementPath) as HTMLVideoElement;
          if (el && el.tagName === 'VIDEO') {
            const source = el.querySelector('source');
            if (source) source.src = data.value;
            else el.src = data.value;
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
  const [editType, setEditType] = useState<'text' | 'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updateToolbarPosition = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    // For fixed positioning, use rect directly (no scrollY needed)
    let top = rect.top - 44;
    // If too close to top of viewport (navbar area), position below element
    if (top < 80) {
      top = rect.bottom + 8;
    }
    setToolbarPos({
      top,
      left: rect.left + rect.width / 2,
    });
  }, []);

  // Handle mouseover with debounce
  useEffect(() => {
    if (!isEditMode) {
      setHoveredElement(null);
      setEditingElement(null);
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || isInsideEditUI(target)) return;
      if (editingElement) return; // Don't change hover while editing

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      hoverTimeoutRef.current = setTimeout(() => {
        // Walk up to find the nearest editable element
        let el: HTMLElement | null = target;
        while (el && el !== document.body) {
          if (isInsideEditUI(el)) return;
          if (isEditableElement(el)) {
            setHoveredElement(el);
            updateToolbarPosition(el);
            if (isTextElement(el)) setEditType('text');
            else if (isImageElement(el)) setEditType('image');
            else if (isVideoElement(el)) setEditType('video');
            return;
          }
          el = el.parentElement;
        }
        setHoveredElement(null);
        setEditType(null);
      }, 50);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (relatedTarget && isInsideEditUI(relatedTarget)) return;
      if (editingElement) return;

      // Check if mouse is moving toward the toolbar
      if (relatedTarget && toolbarRef.current) {
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        // If mouse is near the toolbar area, don't hide
        if (
          mouseX >= toolbarRect.left - 20 &&
          mouseX <= toolbarRect.right + 20 &&
          mouseY >= toolbarRect.top - 20 &&
          mouseY <= toolbarRect.bottom + 20
        ) {
          return;
        }
      }

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        if (!editingElement) {
          setHoveredElement(null);
          setEditType(null);
        }
      }, 300);
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isEditMode, editingElement, updateToolbarPosition]);

  // Add/remove outline on hovered element
  useEffect(() => {
    if (!hoveredElement) return;
    hoveredElement.style.outline = '2px dashed #D3B051';
    hoveredElement.style.outlineOffset = '2px';
    hoveredElement.style.borderRadius = '4px';

    return () => {
      hoveredElement.style.outline = '';
      hoveredElement.style.outlineOffset = '';
      hoveredElement.style.borderRadius = '';
    };
  }, [hoveredElement]);

  // Start editing text
  const startTextEdit = useCallback(() => {
    if (!hoveredElement) return;
    setEditingElement(hoveredElement);
    hoveredElement.contentEditable = 'true';
    hoveredElement.focus();
    hoveredElement.style.outline = '2px solid #D3B051';
    hoveredElement.style.backgroundColor = 'rgba(211, 176, 81, 0.1)';
  }, [hoveredElement]);

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
    setEditingElement(null);
    setHoveredElement(null);
    toast.success('تم حفظ التعديل');
  }, [editingElement]);

  // Cancel text edit
  const cancelTextEdit = useCallback(() => {
    if (!editingElement) return;
    // Restore original text from localStorage or leave as is
    const path = getElementPath(editingElement);
    const key = getStorageKey(path);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        editingElement.textContent = data.value;
      } catch { /* ignore */ }
    }
    editingElement.contentEditable = 'false';
    editingElement.style.backgroundColor = '';
    editingElement.style.outline = '';
    setEditingElement(null);
    setHoveredElement(null);
  }, [editingElement]);

  // Handle image replacement
  const handleImageReplace = useCallback(() => {
    if (!hoveredElement || !isImageElement(hoveredElement)) return;
    setEditingElement(hoveredElement);
    fileInputRef.current?.click();
  }, [hoveredElement]);

  // Handle video replacement
  const handleVideoReplace = useCallback(() => {
    if (!hoveredElement || !isVideoElement(hoveredElement)) return;
    setEditingElement(hoveredElement);
    fileInputRef.current?.click();
  }, [hoveredElement]);

  // Handle file selection
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editingElement) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const path = getElementPath(editingElement);
        const key = getStorageKey(path);

        if (isImageElement(editingElement)) {
          (editingElement as HTMLImageElement).src = dataUrl;
          localStorage.setItem(key, JSON.stringify({ type: 'image', value: dataUrl }));
          toast.success('تم تحديث الصورة');
        } else if (isVideoElement(editingElement)) {
          const videoEl = editingElement as HTMLVideoElement;
          const source = videoEl.querySelector('source');
          if (source) source.src = dataUrl;
          else videoEl.src = dataUrl;
          videoEl.load();
          localStorage.setItem(key, JSON.stringify({ type: 'video', value: dataUrl }));
          toast.success('تم تحديث الفيديو');
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

  const showToolbar = hoveredElement && !editingElement;
  const showEditControls = editingElement && editType === 'text';

  return createPortal(
    <div data-edit-overlay="true" style={{ pointerEvents: 'none' }}>
      {/* Floating toolbar for hovered element */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          data-edit-toolbar="true"
          className="fixed z-[9999] flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#1a1a2e]/95 border border-[#D3B051] shadow-xl"
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
          }}
        >
          {editType === 'text' && (
            <button
              onClick={startTextEdit}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold text-[#D3B051] hover:bg-[#D3B051]/20 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              تحرير
            </button>
          )}
          {editType === 'image' && (
            <button
              onClick={handleImageReplace}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold text-[#D3B051] hover:bg-[#D3B051]/20 transition-colors"
            >
              <ImageIcon className="h-3 w-3" />
              استبدال الصورة
            </button>
          )}
          {editType === 'video' && (
            <button
              onClick={handleVideoReplace}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold text-[#D3B051] hover:bg-[#D3B051]/20 transition-colors"
            >
              <Video className="h-3 w-3" />
              استبدال الفيديو
            </button>
          )}
        </div>
      )}

      {/* Save/Cancel controls for text editing */}
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
        accept={editType === 'image' ? 'image/*' : 'video/*'}
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