import { AlignCenter, AlignJustify, AlignLeft, AlignRight, ImageIcon, Type } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useMediaLibrary } from '@/features/media-library';
import { resolveElementForField } from '../domApply';
import { applyLayoutToElement } from '../layoutUtils';
import { useSiteEditor } from '../context/SiteEditorContext';
import type { ElementLayout } from '../types';

function elHasDefaultSrc(fieldId: string): boolean {
  const el = resolveElementForField(fieldId);
  return Boolean(el?.getAttribute('data-editor-default-src'));
}

const FONT_FAMILIES = [
  { label: 'افتراضي', value: '' },
  { label: 'Sans', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'عربي', value: '"Noto Sans Arabic", "Segoe UI", sans-serif' },
];

export default function EditorTransformToolbar() {
  const {
    enabled,
    selectedFieldId,
    fields,
    patchSelectedLayout,
    openContentSheet,
    replaceFieldValue,
    restoreSelectedToDefault,
  } = useSiteEditor();
  const { openPicker } = useMediaLibrary();

  const record = selectedFieldId ? fields[selectedFieldId] : null;
  if (!enabled || !record || !selectedFieldId) return null;

  const value = record.value;
  const layout = value.layout ?? {};
  const isText = value.type === 'plain' || value.type === 'markdown' || value.type === 'link';
  const isMedia = value.type === 'image' || value.type === 'video';

  const apply = (patch: Partial<ElementLayout>) => {
    const el = resolveElementForField(selectedFieldId);
    if (el) applyLayoutToElement(el, patch);
    patchSelectedLayout(patch);
  };

  const fontSizePx = parseInt(layout.fontSize ?? '16', 10) || 16;

  const bar = (
    <div
      data-edit-transform="true"
      data-edit-toolbar="true"
      className="site-editor-transform-toolbar fixed bottom-[5.5rem] left-1/2 z-[10140] flex max-w-[min(100vw-1rem,36rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-[#0f141c]/95 px-3 py-2 shadow-xl backdrop-blur-md"
      dir="rtl"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {isText ? (
        <>
          <button
            type="button"
            className="site-editor-transform-btn"
            onClick={() => openContentSheet()}
            title="تحرير النص"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">محتوى</span>
          </button>
          <label className="flex items-center gap-1 text-[10px] text-white/70">
            حجم
            <input
              type="range"
              min={12}
              max={72}
              value={fontSizePx}
              onChange={(e) => apply({ fontSize: `${e.target.value}px` })}
              className="w-20 accent-gold"
            />
            <span className="w-8 font-mono text-white">{fontSizePx}</span>
          </label>
          <select
            className="site-editor-transform-select"
            value={layout.fontFamily ?? ''}
            onChange={(e) => apply({ fontFamily: e.target.value || undefined })}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            className="site-editor-transform-select"
            value={layout.fontWeight ?? '400'}
            onChange={(e) => apply({ fontWeight: e.target.value })}
          >
            <option value="400">عادي</option>
            <option value="600">Semi</option>
            <option value="700">غامق</option>
          </select>
          <div className="flex rounded-lg border border-white/10 p-0.5">
            {(
              [
                ['right', AlignRight],
                ['center', AlignCenter],
                ['left', AlignLeft],
                ['justify', AlignJustify],
              ] as const
            ).map(([align, Icon]) => (
              <button
                key={align}
                type="button"
                className={`rounded-md p-1.5 ${layout.textAlign === align ? 'bg-gold/30 text-gold' : 'text-white/70 hover:bg-white/10'}`}
                onClick={() => apply({ textAlign: align })}
                aria-label={align}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </>
      ) : null}

      {isMedia ? (
        <>
          {elHasDefaultSrc(selectedFieldId) ? (
            <button
              type="button"
              className="site-editor-transform-btn"
              onClick={() => void restoreSelectedToDefault()}
              title="استعادة الصورة الأصلية"
            >
              استعادة
            </button>
          ) : null}
          <button
            type="button"
            className="site-editor-transform-btn"
            onClick={() => {
              const el = resolveElementForField(selectedFieldId);
              const kind = value.type === 'video' ? 'video' : 'image';
              openPicker({
                kind,
                onSelect: (item) => {
                  replaceFieldValue(
                    selectedFieldId,
                    kind === 'video'
                      ? { type: 'video', url: item.url, layout: value.layout }
                      : { type: 'image', url: item.url, layout: value.layout },
                    el,
                  );
                },
              });
            }}
            title="استبدال الوسيط"
          >
            <ImageIcon className="h-4 w-4" />
            استبدال
          </button>
          <select
            className="site-editor-transform-select"
            value={layout.objectFit ?? 'cover'}
            onChange={(e) => apply({ objectFit: e.target.value as ElementLayout['objectFit'] })}
          >
            <option value="cover">ملء (cover)</option>
            <option value="contain">احتواء</option>
            <option value="fill">مدّ</option>
          </select>
        </>
      ) : null}

      <span className="hidden text-[9px] text-white/40 sm:inline">
        اسحب الإطار · Ctrl+C/X/V/A/Z
      </span>
    </div>
  );

  return createPortal(bar, document.body);
}
