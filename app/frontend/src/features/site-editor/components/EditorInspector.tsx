import { X } from 'lucide-react';
import { useSiteEditor } from '../context/SiteEditorContext';
import { FieldEditorRouter } from './fields/FieldEditors';

export default function EditorInspector() {
  const { enabled, selectedFieldId, fields, selectField, updateSelectedField } = useSiteEditor();

  if (!enabled) return null;

  const record = selectedFieldId ? fields[selectedFieldId] : null;

  return (
    <aside
      className="site-editor-inspector fixed bottom-0 right-0 top-[7.5rem] z-[9998] flex w-[min(100%,22rem)] flex-col border-l border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#121820]"
      dir="rtl"
      data-edit-toolbar="true"
    >
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink dark:text-white">المفتش · Inspector</p>
          <p className="truncate font-mono text-[10px] text-ink-muted">
            {selectedFieldId ?? 'اختر عنصراً على الصفحة'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => selectField(null)}
          className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!record ? (
          <p className="text-sm leading-7 text-ink-muted">
            انقر أي عنصر مميز على الصفحة، أو استخدم{' '}
            <kbd className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px]">Ctrl+K</kbd> للانتقال إلى
            حقل.
          </p>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-base font-semibold text-ink dark:text-white">{record.meta.label}</p>
              {record.meta.description ? (
                <p className="text-xs text-ink-muted">{record.meta.description}</p>
              ) : null}
              <p className="mt-1 text-[10px] uppercase tracking-wide text-gold-700">{record.meta.type}</p>
            </div>
            <FieldEditorRouter
              value={record.value}
              onChange={(value) => updateSelectedField(value)}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
