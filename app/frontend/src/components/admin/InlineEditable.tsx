import { useState, useRef } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { client } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Image as ImageIcon, Video, Check, X } from 'lucide-react';
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
            className="p-1 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group/editable relative inline-block">
      <Tag
        className={`${className} cursor-pointer ring-1 ring-transparent group-hover/editable:ring-[#D3B051]/50 rounded transition-all`}
        onClick={() => {
          setEditValue(value);
          setIsEditing(true);
        }}
      >
        {children}
      </Tag>
      <button
        onClick={() => {
          setEditValue(value);
          setIsEditing(true);
        }}
        className="absolute -top-2 -left-2 opacity-0 group-hover/editable:opacity-100 p-1 rounded-full bg-[#D3B051] text-[#1a1a2e] shadow-lg transition-all duration-200 hover:scale-110 z-10"
      >
        <Pencil className="h-3 w-3" />
      </button>
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
    <div className="group/editable-img relative inline-block">
      <img
        src={src}
        alt={alt}
        className={`${className} ring-2 ring-transparent group-hover/editable-img:ring-[#D3B051]/50 rounded transition-all`}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-2 left-2 opacity-0 group-hover/editable-img:opacity-100 p-2 rounded-full bg-[#D3B051] text-[#1a1a2e] shadow-lg transition-all duration-200 hover:scale-110 z-10"
      >
        <ImageIcon className="h-4 w-4" />
      </button>
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
    <div className="group/editable-vid relative inline-block">
      <video src={src} className={`${className} ring-2 ring-transparent group-hover/editable-vid:ring-[#D3B051]/50 rounded transition-all`} poster={poster} controls>
        <track kind="captions" />
      </video>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-2 left-2 opacity-0 group-hover/editable-vid:opacity-100 p-2 rounded-full bg-[#D3B051] text-[#1a1a2e] shadow-lg transition-all duration-200 hover:scale-110 z-10"
      >
        <Video className="h-4 w-4" />
      </button>
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
}

export function EditableSection({
  children,
  entityName,
  entityId,
  className = '',
  onDelete,
}: EditableSectionProps) {
  const { isEditMode } = useEditMode();
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
    <div className={`group/editable-section relative ${className} ring-1 ring-transparent hover:ring-[#D3B051]/30 rounded-lg transition-all`}>
      {children}
      <div className="absolute top-2 left-2 opacity-0 group-hover/editable-section:opacity-100 flex gap-1 transition-all duration-200 z-10">
        <button
          onClick={() => {
            if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
              deleteMutation.mutate();
            }
          }}
          className="p-2 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 hover:scale-110 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}