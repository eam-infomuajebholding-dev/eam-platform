import { useState, useRef } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { client } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Image as ImageIcon, Video, Check, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

// ============ EditableText ============
interface EditableTextProps {
  children: React.ReactNode;
  entityName: string;
  entityId: number | string;
  field: string;
  value: string;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
  multiline?: boolean;
}

export function EditableText({
  children,
  entityName,
  entityId,
  field,
  value,
  className = '',
  as: Tag = 'span',
  multiline = false,
}: EditableTextProps) {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: async (newValue: string) => {
      await client.from(entityName).update(entityId, { [field]: newValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast.success('تم الحفظ بنجاح');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحفظ');
    },
  });

  const handleSave = () => {
    if (editValue !== value) {
      updateMutation.mutate(editValue);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditMode) {
    return <Tag className={className}>{children}</Tag>;
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-2 bg-[#1a1a2e]/90 border border-[#D3B051] rounded-md text-white resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#D3B051]/50"
            dir="rtl"
            autoFocus
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-2 bg-[#1a1a2e]/90 border border-[#D3B051] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#D3B051]/50"
            dir="rtl"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        )}
        <div className="flex gap-1 mt-1 justify-end">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="p-1.5 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating toolbar above element */}
      <div
        className={`absolute -top-9 right-0 z-20 flex items-center gap-1 px-2 py-1 rounded-md bg-[#D3B051] shadow-lg transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        <Pencil className="h-3 w-3 text-[#1a1a2e]" />
        <button
          onClick={() => {
            setEditValue(value);
            setIsEditing(true);
          }}
          className="text-[#1a1a2e] text-xs font-bold hover:underline"
        >
          تحرير
        </button>
      </div>

      {/* Element with gold dashed border on hover */}
      <Tag
        className={`${className} transition-all duration-200 cursor-pointer ${
          isHovered ? 'outline outline-1 outline-dashed outline-[#D3B051]/60 rounded' : ''
        }`}
        onClick={() => {
          setEditValue(value);
          setIsEditing(true);
        }}
      >
        {children}
      </Tag>
    </div>
  );
}

// ============ EditableImage ============
interface EditableImageProps {
  src: string;
  alt?: string;
  entityName: string;
  entityId: number | string;
  field: string;
  className?: string;
}

export function EditableImage({
  src,
  alt = '',
  entityName,
  entityId,
  field,
  className = '',
}: EditableImageProps) {
  const { isEditMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: async (newUrl: string) => {
      await client.from(entityName).update(entityId, { [field]: newUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast.success('تم تحديث الصورة بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الصورة');
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const filename = `images/${Date.now()}-${file.name}`;
      const result = await client.storage.from('media-uploads').upload(filename, file);
      if (result?.url) {
        updateMutation.mutate(result.url);
      }
    } catch {
      toast.error('حدث خطأ أثناء رفع الصورة');
    }
  };

  if (!isEditMode) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        className={`${className} transition-all duration-200 ${
          isHovered ? 'outline outline-2 outline-dashed outline-[#D3B051]/60 rounded' : ''
        }`}
      />

      {/* Overlay on hover */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded transition-all duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#D3B051] text-[#1a1a2e] font-bold text-sm shadow-lg hover:bg-[#D3B051]/80 transition-colors"
        >
          <ImageIcon className="h-4 w-4" />
          استبدال الصورة
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// ============ EditableVideo ============
interface EditableVideoProps {
  src: string;
  entityName: string;
  entityId: number | string;
  field: string;
  className?: string;
  poster?: string;
}

export function EditableVideo({
  src,
  entityName,
  entityId,
  field,
  className = '',
  poster,
}: EditableVideoProps) {
  const { isEditMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: async (newUrl: string) => {
      await client.from(entityName).update(entityId, { [field]: newUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast.success('تم تحديث الفيديو بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الفيديو');
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const filename = `videos/${Date.now()}-${file.name}`;
      const result = await client.storage.from('media-uploads').upload(filename, file);
      if (result?.url) {
        updateMutation.mutate(result.url);
      }
    } catch {
      toast.error('حدث خطأ أثناء رفع الفيديو');
    }
  };

  if (!isEditMode) {
    return (
      <video src={src} className={className} poster={poster} controls>
        <track kind="captions" />
      </video>
    );
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        src={src}
        className={`${className} transition-all duration-200 ${
          isHovered ? 'outline outline-2 outline-dashed outline-[#D3B051]/60 rounded' : ''
        }`}
        poster={poster}
        controls
      >
        <track kind="captions" />
      </video>

      {/* Overlay on hover */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded transition-all duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#D3B051] text-[#1a1a2e] font-bold text-sm shadow-lg hover:bg-[#D3B051]/80 transition-colors"
        >
          <Video className="h-4 w-4" />
          استبدال الفيديو
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// ============ EditableSection ============
interface EditableSectionProps {
  children: React.ReactNode;
  entityName: string;
  entityId: number | string;
  className?: string;
  onDelete?: () => void;
  onAddAbove?: () => void;
  onAddBelow?: () => void;
}

export function EditableSection({
  children,
  entityName,
  entityId,
  className = '',
  onDelete,
  onAddAbove,
  onAddBelow,
}: EditableSectionProps) {
  const { isEditMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await client.from(entityName).delete(entityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast.success('تم حذف القسم بنجاح');
      onDelete?.();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف');
    },
  });

  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative ${className} transition-all duration-200 ${
        isHovered ? 'outline outline-1 outline-dashed outline-[#D3B051]/40 rounded-lg' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating toolbar at top of section */}
      <div
        className={`absolute -top-10 right-2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-md bg-[#1a1a2e]/95 border border-[#D3B051]/40 shadow-lg transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
        dir="rtl"
      >
        <button
          onClick={() => {
            if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
              deleteMutation.mutate();
            }
          }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          حذف القسم
        </button>
        {onAddAbove && (
          <button
            onClick={onAddAbove}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-[#D3B051] hover:bg-[#D3B051]/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            إضافة أعلى
          </button>
        )}
        {onAddBelow && (
          <button
            onClick={onAddBelow}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-[#D3B051] hover:bg-[#D3B051]/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            إضافة أسفل
          </button>
        )}
      </div>

      {children}
    </div>
  );
}