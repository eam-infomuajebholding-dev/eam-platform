import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Link2, Loader2, Type, Upload, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { EditSurfaceKind } from './editOverlayUtils';
import { kindLabelAr } from './editOverlayUtils';

export type EditElementDialogSavePayload =
  | { kind: 'text'; text: string }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'image'; url: string; file?: File }
  | { kind: 'video'; url: string; file?: File };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stableKey: string;
  kind: EditSurfaceKind;
  initialText?: string;
  initialHref?: string;
  initialMediaUrl?: string;
  saving?: boolean;
  onSave: (payload: EditElementDialogSavePayload) => void | Promise<void>;
};

export default function EditElementDialog({
  open,
  onOpenChange,
  stableKey,
  kind,
  initialText = '',
  initialHref = '',
  initialMediaUrl = '',
  saving = false,
  onSave,
}: Props) {
  const [text, setText] = useState(initialText);
  const [href, setHref] = useState(initialHref);
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl);
  const [file, setFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setText(initialText);
    setHref(initialHref);
    setMediaUrl(initialMediaUrl);
    setFile(null);
    const t = window.setTimeout(() => textareaRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open, initialText, initialHref, initialMediaUrl]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const previewUrl = file ? URL.createObjectURL(file) : mediaUrl;

  useEffect(() => {
    if (!file) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [file, previewUrl]);

  async function submit() {
    if (kind === 'text') {
      await onSave({ kind: 'text', text: text.trim() });
      return;
    }
    if (kind === 'link') {
      await onSave({ kind: 'link', text: text.trim(), href: href.trim() });
      return;
    }
    if (kind === 'image') {
      await onSave({ kind: 'image', url: mediaUrl.trim(), file: file ?? undefined });
      return;
    }
    await onSave({ kind: 'video', url: mediaUrl.trim(), file: file ?? undefined });
  }

  const Icon =
    kind === 'link' ? Link2 : kind === 'image' ? ImageIcon : kind === 'video' ? Video : Type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl" dir="rtl">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="flex items-center justify-end gap-2 font-tajawal">
            <span>تحرير {kindLabelAr(kind)}</span>
            <Icon className="h-5 w-5 text-gold" aria-hidden />
          </DialogTitle>
          <DialogDescription className="text-right font-mono text-xs text-muted-foreground">
            {stableKey}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {(kind === 'text' || kind === 'link') && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink" htmlFor="edit-element-text">
                المحتوى
              </label>
              <textarea
                id="edit-element-text"
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={kind === 'link' ? 2 : 5}
                className="w-full resize-y rounded-lg border border-soft-border bg-white px-3 py-2 text-sm leading-7 text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 dark:bg-surface"
                placeholder="اكتب النص هنا…"
              />
              <p className="text-left text-[11px] text-ink-muted ltr:unicode-bidi-plaintext">
                {text.length} حرف · Ctrl+Enter للحفظ
              </p>
            </div>
          )}

          {kind === 'link' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink" htmlFor="edit-element-href">
                الرابط (URL)
              </label>
              <input
                id="edit-element-href"
                type="url"
                dir="ltr"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                className="w-full rounded-lg border border-soft-border bg-white px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 dark:bg-surface"
                placeholder="https://…"
              />
            </div>
          )}

          {(kind === 'image' || kind === 'video') && (
            <>
              {previewUrl ? (
                <div className="overflow-hidden rounded-xl border border-soft-border bg-muted/30 p-2">
                  {kind === 'image' ? (
                    <img src={previewUrl} alt="" className="mx-auto max-h-48 rounded-lg object-contain" />
                  ) : (
                    <video src={previewUrl} controls className="mx-auto max-h-48 w-full rounded-lg" />
                  )}
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">رفع ملف</label>
                <label
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/35 bg-gold/5 px-4 py-6 text-sm font-medium text-gold-800 transition hover:bg-gold/10',
                  )}
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  {file ? file.name : 'اختر ملفاً من الجهاز'}
                  <input
                    type="file"
                    accept={kind === 'image' ? 'image/*' : 'video/*'}
                    className="sr-only"
                    onChange={(e) => {
                      const next = e.target.files?.[0] ?? null;
                      setFile(next);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink" htmlFor="edit-media-url">
                  أو الصق رابط مباشر
                </label>
                <input
                  id="edit-media-url"
                  type="url"
                  dir="ltr"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    if (e.target.value) setFile(null);
                  }}
                  className="w-full rounded-lg border border-soft-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 dark:bg-surface"
                  placeholder="https://…"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="inline-flex min-w-[7rem] items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-white hover:bg-gold-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            حفظ
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-soft-border px-4 py-2 text-sm font-medium text-ink hover:bg-muted"
          >
            إلغاء
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
