import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useSiteEditor } from '../context/SiteEditorContext';

export default function EditorCommandPalette() {
  const {
    enabled,
    fieldList,
    selectField,
    saveAll,
    copySelected,
    cutSelected,
    pasteToSelected,
    selectAllOnPage,
    undo,
    redo,
  } = useSiteEditor();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);

  if (!enabled || !open) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-start justify-center bg-black/40 pt-[12vh]" data-edit-toolbar="true">
      <button type="button" className="absolute inset-0" aria-label="إغلاق" onClick={() => setOpen(false)} />
      <Command
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-gold/25 bg-white shadow-2xl dark:bg-[#121820]"
        dir="rtl"
        label="أوامر المحرر"
      >
        <Command.Input
          placeholder="انتقل إلى حقل أو نفّذ أمراً…"
          className="w-full border-b border-black/5 bg-transparent px-4 py-3 text-sm outline-none dark:border-white/10"
        />
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-ink-muted">لا نتائج</Command.Empty>
          <Command.Group heading="حقول الصفحة">
            {fieldList.map((field) => (
              <Command.Item
                key={field.id}
                value={`${field.label} ${field.id}`}
                onSelect={() => {
                  selectField(field.id, null, { openContentSheet: false });
                  setOpen(false);
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-gold/15"
              >
                <span className="font-medium">{field.label}</span>
                <span className="mr-2 font-mono text-[10px] text-ink-muted">{field.id}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="أوامر">
            <Command.Item
              onSelect={() => {
                copySelected();
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-gold/15"
            >
              نسخ العنصر (Ctrl+C)
            </Command.Item>
            <Command.Item
              onSelect={() => {
                cutSelected();
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-gold/15"
            >
              قص العنصر (Ctrl+X)
            </Command.Item>
            <Command.Item
              onSelect={() => {
                pasteToSelected();
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-gold/15"
            >
              لصق (Ctrl+V)
            </Command.Item>
            <Command.Item
              onSelect={() => {
                selectAllOnPage();
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-gold/15"
            >
              تحديد الكل (Ctrl+A)
            </Command.Item>
            <Command.Item
              onSelect={() => {
                void saveAll();
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-gold/15"
            >
              حفظ الكل (Ctrl+S)
            </Command.Item>
            <Command.Item
              onSelect={() => {
                undo();
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-gold/15"
            >
              تراجع (Ctrl+Z)
            </Command.Item>
            <Command.Item
              onSelect={() => {
                redo();
                setOpen(false);
              }}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-gold/15"
            >
              إعادة (Ctrl+Shift+Z)
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
