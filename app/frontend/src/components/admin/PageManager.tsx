import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Image, Video } from 'lucide-react';

export interface CustomNavLink {
  path: string;
  label: string;
  backgroundType?: 'none' | 'image' | 'video';
  backgroundData?: string;
}

const STORAGE_KEY = 'custom-nav-links';

export function getCustomNavLinks(): CustomNavLink[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomNavLinks(links: CustomNavLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  // Dispatch event so Layout can react
  window.dispatchEvent(new Event('nav-links-changed'));
}

function generatePathFromLabel(label: string): string {
  // Generate a simple path using timestamp to avoid conflicts
  const timestamp = Date.now().toString(36);
  return `/page-${timestamp}`;
}

interface PageManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function PageManager({ open, onClose }: PageManagerProps) {
  const [customLinks, setCustomLinks] = useState<CustomNavLink[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [bgType, setBgType] = useState<'none' | 'image' | 'video'>('none');
  const [bgData, setBgData] = useState<string>('');

  useEffect(() => {
    if (open) {
      setCustomLinks(getCustomNavLinks());
    }
  }, [open]);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBgData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const path = generatePathFromLabel(newLabel);
    const updated = [...customLinks, {
      path,
      label: newLabel.trim(),
      backgroundType: bgType,
      backgroundData: bgType !== 'none' ? bgData : undefined,
    }];
    setCustomLinks(updated);
    saveCustomNavLinks(updated);
    setNewLabel('');
    setBgType('none');
    setBgData('');
  };

  const handleRemove = (index: number) => {
    const updated = customLinks.filter((_, i) => i !== index);
    setCustomLinks(updated);
    saveCustomNavLinks(updated);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-[#4a4a4a] rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gold/30">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">إدارة الصفحات</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Existing custom pages */}
          {customLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-white/80">الصفحات المخصصة:</p>
              {customLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-gold/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">{link.label}</span>
                    {link.backgroundType === 'image' && <Image className="w-3.5 h-3.5 text-gold" />}
                    {link.backgroundType === 'video' && <Video className="w-3.5 h-3.5 text-gold" />}
                  </div>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {customLinks.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-white/60 text-center py-4">
              لا توجد صفحات مخصصة بعد
            </p>
          )}

          {/* Add new page */}
          <div className="border-t border-gray-200 dark:border-gold/20 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-600 dark:text-white/80">إضافة صفحة جديدة:</p>
            <input
              type="text"
              placeholder="اسم الصفحة (مثال: المدونة)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gold/30 bg-white dark:bg-white/10 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D3B051]/50"
            />

            {/* Background Type Selection */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-white/60">خلفية الصفحة:</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setBgType('none'); setBgData(''); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    bgType === 'none'
                      ? 'bg-gold text-dark'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  بدون
                </button>
                <button
                  type="button"
                  onClick={() => setBgType('image')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    bgType === 'image'
                      ? 'bg-gold text-dark'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  <Image className="w-3.5 h-3.5" />
                  صورة
                </button>
                <button
                  type="button"
                  onClick={() => setBgType('video')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    bgType === 'video'
                      ? 'bg-gold text-dark'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  فيديو
                </button>
              </div>

              {/* File Upload for background */}
              {bgType !== 'none' && (
                <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors">
                  <Upload className="w-4 h-4 text-gold" />
                  <span className="text-xs text-gray-600 dark:text-white/60">
                    {bgData ? '✓ تم رفع الملف' : bgType === 'image' ? 'اختر صورة خلفية' : 'اختر فيديو خلفية'}
                  </span>
                  <input
                    type="file"
                    accept={bgType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleBgUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={!newLabel.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#D3B051] text-[#1a1a2e] text-sm font-bold hover:bg-[#D3B051]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              إضافة صفحة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}