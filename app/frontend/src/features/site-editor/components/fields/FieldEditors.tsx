import { useState } from 'react';
import Markdown from 'markdown-to-jsx';
import { Images, Upload } from 'lucide-react';
import { useMediaLibrary } from '@/features/media-library';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';
import { uploadMedia } from '@/lib/dbService';
import type { FieldValue } from '../../types';

type EditorProps = {
  value: FieldValue;
  onChange: (value: FieldValue) => void;
};

export function PlainFieldEditor({ value, onChange }: EditorProps) {
  if (value.type !== 'plain') return null;
  return (
    <textarea
      value={value.text}
      onChange={(e) => onChange({ type: 'plain', text: e.target.value })}
      rows={4}
      className="site-editor-field"
      dir="auto"
    />
  );
}

export function MarkdownFieldEditor({ value, onChange }: EditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  if (value.type !== 'markdown') return null;
  return (
    <div className="space-y-2">
      <div className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/5">
        <button
          type="button"
          className={`flex-1 rounded-md py-1 text-xs font-semibold ${tab === 'write' ? 'bg-white shadow dark:bg-surface' : ''}`}
          onClick={() => setTab('write')}
        >
          Markdown
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-1 text-xs font-semibold ${tab === 'preview' ? 'bg-white shadow dark:bg-surface' : ''}`}
          onClick={() => setTab('preview')}
        >
          معاينة
        </button>
      </div>
      {tab === 'write' ? (
        <textarea
          value={value.markdown}
          onChange={(e) => onChange({ type: 'markdown', markdown: e.target.value })}
          rows={10}
          className="site-editor-field font-mono text-sm"
          dir="auto"
          placeholder="## عنوان&#10;نص **غامق** و [رابط](https://…)"
        />
      ) : (
        <div className="prose prose-sm max-w-none rounded-lg border border-soft-border bg-white p-3 dark:prose-invert dark:bg-surface" dir="auto">
          <Markdown>{value.markdown || '*لا محتوى*'}</Markdown>
        </div>
      )}
    </div>
  );
}

export function LinkFieldEditor({ value, onChange }: EditorProps) {
  if (value.type !== 'link') return null;
  return (
    <div className="space-y-3">
      <div>
        <label className="site-editor-label">نص الرابط</label>
        <input
          className="site-editor-field"
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          dir="auto"
        />
      </div>
      <div>
        <label className="site-editor-label">URL</label>
        <input
          className="site-editor-field ltr:unicode-bidi-plaintext"
          dir="ltr"
          value={value.href}
          onChange={(e) => onChange({ ...value, href: e.target.value })}
        />
      </div>
    </div>
  );
}

async function uploadFile(file: File, register: (url: string, kind: 'image' | 'video', label: string) => void): Promise<string> {
  if (isCloudinaryConfigured()) {
    try {
      const url = await uploadToCloudinary(file);
      register(url, file.type.startsWith('video/') ? 'video' : 'image', file.name);
      return url;
    } catch {
      /* fallback */
    }
  }
  const url = await uploadMedia(file);
  register(url, file.type.startsWith('video/') ? 'video' : 'image', file.name);
  return url;
}

export function MediaFieldEditor({ value, onChange }: EditorProps) {
  const [uploading, setUploading] = useState(false);
  const { openPicker, registerUpload } = useMediaLibrary();
  const isVideo = value.type === 'video';

  if (value.type !== 'image' && value.type !== 'video') return null;

  const kind = isVideo ? 'video' : 'image';

  return (
    <div className="space-y-3">
      {value.url ? (
        <div className="overflow-hidden rounded-xl border border-soft-border bg-muted/20 p-2">
          {isVideo ? (
            <video src={value.url} controls className="max-h-40 w-full rounded-lg" />
          ) : (
            <img src={value.url} alt="" className="mx-auto max-h-40 rounded-lg object-contain" />
          )}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() =>
          openPicker({
            kind,
            onSelect: (item) =>
              onChange(kind === 'video' ? { type: 'video', url: item.url } : { type: 'image', url: item.url }),
          })
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/45 bg-gold/15 py-3 text-sm font-bold text-gold-900 dark:text-gold-100"
      >
        <Images className="h-4 w-4" />
        فتح مكتبة {isVideo ? 'الفيديو' : 'الصور'}
      </button>
      <label className="site-editor-label">أو الصق رابطاً مباشراً</label>
      <input
        className="site-editor-field ltr:unicode-bidi-plaintext"
        dir="ltr"
        value={value.url}
        onChange={(e) =>
          onChange(isVideo ? { type: 'video', url: e.target.value } : { type: 'image', url: e.target.value })
        }
      />
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-gold/5 py-4 text-sm font-medium text-gold-800">
        <Upload className="h-4 w-4" />
        {uploading ? 'جاري الرفع…' : 'رفع من الجهاز'}
        <input
          type="file"
          accept={isVideo ? 'video/*' : 'image/*'}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setUploading(true);
            void uploadFile(file, registerUpload)
              .then((url) => onChange(isVideo ? { type: 'video', url } : { type: 'image', url }))
              .finally(() => setUploading(false));
          }}
        />
      </label>
    </div>
  );
}

export function FieldEditorRouter({ value, onChange }: EditorProps) {
  switch (value.type) {
    case 'markdown':
      return <MarkdownFieldEditor value={value} onChange={onChange} />;
    case 'link':
      return <LinkFieldEditor value={value} onChange={onChange} />;
    case 'image':
    case 'video':
      return <MediaFieldEditor value={value} onChange={onChange} />;
    default:
      return <PlainFieldEditor value={value} onChange={onChange} />;
  }
}
