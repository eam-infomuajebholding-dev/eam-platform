import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useSiteEditor } from '../context/SiteEditorContext';
import { FieldEditorRouter } from './fields/FieldEditors';

export default function EditorControlSheet() {
  const { enabled, selectedFieldId, fields, contentSheetOpen, closeContentSheet, updateSelectedField } =
    useSiteEditor();

  if (!enabled) return null;

  const record = selectedFieldId ? fields[selectedFieldId] : null;
  const isText =
    record?.value.type === 'plain' ||
    record?.value.type === 'markdown' ||
    record?.value.type === 'link';
  const open = Boolean(record && isText && contentSheetOpen);

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) void closeContentSheet();
      }}
      shouldScaleBackground={false}
    >
      <DrawerContent
        overlayClassName="z-[10105] bg-black/25 backdrop-blur-[2px]"
        className="z-[10115] max-h-[min(88vh,640px)] rounded-t-[20px] border-white/10 bg-[#f2f2f7] dark:bg-[#1c1c1e]"
        data-edit-toolbar="true"
        dir="rtl"
      >
        {record ? (
          <>
            <DrawerHeader className="border-b border-black/5 pb-3 text-right dark:border-white/10">
              <DrawerTitle className="text-base font-bold text-ink dark:text-white">
                {record.meta.label}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-ink-muted">
                {record.meta.description ?? 'نقرة واحدة للتحريك · نقرتان أو «محتوى» لتعديل النص'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-8 pt-2">
              <FieldEditorRouter value={record.value} onChange={(value) => updateSelectedField(value)} />
            </div>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
