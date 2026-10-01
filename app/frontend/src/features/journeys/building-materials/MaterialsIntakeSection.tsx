import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Mic } from 'lucide-react';
import { client } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { JourneyTextArea } from '@/features/journeys/core/JourneyFieldControls';
import { toast } from 'sonner';

type Props = {
  intakeChannel: string;
  materialsList: string;
  materialsImageUrl: string;
  assistantTranscript: string;
  onChange: (patch: {
    intakeChannel?: string;
    materialsList?: string;
    materialsImageUrl?: string;
    assistantTranscript?: string;
  }) => void;
};

export default function MaterialsIntakeSection({
  intakeChannel,
  materialsList,
  materialsImageUrl,
  assistantTranscript,
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const objectKey = `journeys/building-materials/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
      const result = await client.storage.from('media-uploads').upload(objectKey, file);
      if (result?.url) {
        onChange({ materialsImageUrl: result.url, intakeChannel: 'image' });
        toast.success('تم رفع صورة قائمة المواد');
      }
    } catch {
      toast.error('تعذر رفع الصورة. جرّب كتابة القائمة في الحقل أدناه.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-secondary leading-relaxed">
        أدخل المواد والكميات بإحدى الطرق: صورة للقائمة، نص في المساعد الذكي (انسخه هنا)، أو نص
        مقطع صوتي بعد تحويله.
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => void handleImageUpload(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          تحميل صورة للمواد والكميات
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="gap-2 text-gold"
          onClick={() => onChange({ intakeChannel: 'assistant_text' })}
        >
          <Mic className="h-4 w-4" />
          سأستخدم المساعد الذكي
        </Button>
      </div>

      {materialsImageUrl ? (
        <p className="text-xs text-ink-secondary break-all">مرفق: {materialsImageUrl}</p>
      ) : null}

      <JourneyTextArea
        value={materialsList}
        onChange={(materialsList) => onChange({ materialsList, intakeChannel: intakeChannel || 'assistant_text' })}
        placeholder={'مثال:\nأسمنت 50 كيس\nحديد 12 مم — 2 طن\nبلك — 5000 قطعة'}
        minHeight="120px"
      />

      <JourneyTextArea
        value={assistantTranscript}
        onChange={(assistantTranscript) =>
          onChange({ assistantTranscript, intakeChannel: 'audio_transcript' })
        }
        placeholder="الصق هنا نص المقطع الصوتي أو رد المساعد الذكي إن وُجد..."
        minHeight="80px"
      />
    </div>
  );
}
