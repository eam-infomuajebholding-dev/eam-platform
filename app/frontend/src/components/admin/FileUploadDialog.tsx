import { useState, useRef } from 'react';
import { client } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, FileImage, FileVideo, FileText, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (url: string) => void;
}

interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

export default function FileUploadDialog({ open, onOpenChange, onUploadComplete }: FileUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf';

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-400" />;
    if (type.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-400" />;
    return <FileText className="h-5 w-5 text-orange-400" />;
  };

  const getFolder = (type: string) => {
    if (type.startsWith('image/')) return 'images';
    if (type.startsWith('video/')) return 'videos';
    return 'documents';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);

    const totalFiles = files.length;
    let completedFiles = 0;

    for (const file of Array.from(files)) {
      try {
        const folder = getFolder(file.type);
        const filename = `${folder}/${Date.now()}-${file.name}`;
        const result = await client.storage.from('media-uploads').upload(filename, file);

        if (result?.url) {
          setUploadedFiles((prev) => [...prev, { name: file.name, url: result.url, type: file.type }]);
          onUploadComplete?.(result.url);
        }
      } catch {
        toast.error(`فشل رفع الملف: ${file.name}`);
      }

      completedFiles++;
      setProgress(Math.round((completedFiles / totalFiles) * 100));
    }

    setUploading(false);
    toast.success(`تم رفع ${completedFiles} ملف بنجاح`);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setUploadedFiles([]);
    setProgress(0);
    onOpenChange(false);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#1a1a2e] border-[#D3B051]/30" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-[#D3B051]">تحميل ملفات</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#D3B051]/40 rounded-lg p-8 text-center cursor-pointer hover:border-[#D3B051]/70 hover:bg-[#D3B051]/5 transition-all"
          >
            <Upload className="h-10 w-10 text-[#D3B051]/60 mx-auto mb-3" />
            <p className="text-white/80 text-sm">اضغط لاختيار الملفات</p>
            <p className="text-white/40 text-xs mt-1">صور (JPG, PNG, WebP) • فيديو (MP4, WebM) • PDF</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-white/60 text-xs text-center">جاري الرفع... {progress}%</p>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              <p className="text-white/60 text-xs font-bold">الملفات المرفوعة:</p>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-white/5 rounded-md border border-white/10"
                >
                  {getFileIcon(file.type)}
                  <span className="text-white/80 text-xs flex-1 truncate">{file.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyUrl(file.url)}
                      className="p-1 rounded bg-[#D3B051]/20 hover:bg-[#D3B051]/40 text-[#D3B051] transition-colors"
                      title="نسخ الرابط"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <Button
            variant="outline"
            className="w-full border-[#D3B051]/40 text-[#D3B051] hover:bg-[#D3B051]/10 bg-transparent"
            onClick={handleClose}
          >
            <X className="h-4 w-4 ml-1" />
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}