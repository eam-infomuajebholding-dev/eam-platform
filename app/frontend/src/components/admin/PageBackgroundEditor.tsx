import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Palette, ImageIcon, Video } from 'lucide-react';

export interface PageBackground {
  type: 'color' | 'image' | 'video';
  value: string;
  opacity?: number;
}

const PRESET_COLORS = [
  '#0a0a0a', '#1a1a2e', '#16213e', '#0f3460',
  '#1a1a1a', '#2d2d2d', '#1b2a1b', '#2a1b1b',
  '#D3B051', '#b8960c', '#8B7A2E', '#4a3f1a',
  '#1e1e3f', '#2c1e3f', '#3f1e2c', '#1e3f3f',
];

function getStorageKey(pathname: string) {
  return `page-bg-${pathname}`;
}

export function getPageBackground(pathname: string): PageBackground | null {
  try {
    const stored = localStorage.getItem(getStorageKey(pathname));
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PageBackgroundEditor({ open, onClose }: Props) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'color' | 'image' | 'video'>('color');
  const [selectedColor, setSelectedColor] = useState('#1a1a2e');
  const [customColor, setCustomColor] = useState('#1a1a2e');
  const [imageUrl, setImageUrl] = useState('');
  const [imageOpacity, setImageOpacity] = useState(0.3);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoOpacity, setVideoOpacity] = useState(0.4);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load existing settings
  useEffect(() => {
    if (open) {
      const bg = getPageBackground(location.pathname);
      if (bg) {
        setActiveTab(bg.type);
        if (bg.type === 'color') {
          setSelectedColor(bg.value);
          setCustomColor(bg.value);
        } else if (bg.type === 'image') {
          setImageUrl(bg.value);
          setImageOpacity(bg.opacity ?? 0.3);
        } else if (bg.type === 'video') {
          setVideoUrl(bg.value);
          setVideoOpacity(bg.opacity ?? 0.4);
        }
      }
    }
  }, [open, location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  const save = (bg: PageBackground) => {
    localStorage.setItem(getStorageKey(location.pathname), JSON.stringify(bg));
    window.dispatchEvent(new Event('page-bg-changed'));
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
    save({ type: 'color', value: color });
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomColor(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setSelectedColor(val);
      save({ type: 'color', value: val });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setImageUrl(url);
        save({ type: 'image', value: url, opacity: imageOpacity });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageOpacityChange = (val: number) => {
    setImageOpacity(val);
    if (imageUrl) {
      save({ type: 'image', value: imageUrl, opacity: val });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      save({ type: 'video', value: url, opacity: videoOpacity });
    }
  };

  const handleVideoOpacityChange = (val: number) => {
    setVideoOpacity(val);
    if (videoUrl) {
      save({ type: 'video', value: videoUrl, opacity: val });
    }
  };

  const handleRemoveBackground = () => {
    localStorage.removeItem(getStorageKey(location.pathname));
    setImageUrl('');
    setVideoUrl('');
    setSelectedColor('#1a1a2e');
    setCustomColor('#1a1a2e');
    window.dispatchEvent(new Event('page-bg-changed'));
    onClose();
  };

  const tabs = [
    { key: 'color' as const, label: 'لون', icon: Palette },
    { key: 'image' as const, label: 'صورة', icon: ImageIcon },
    { key: 'video' as const, label: 'فيديو', icon: Video },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="w-[90%] max-w-md bg-[#1a1a2e] border border-[#D3B051]/40 rounded-xl shadow-2xl shadow-[#D3B051]/10 overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#D3B051]/20">
          <h3 className="text-[#D3B051] font-bold text-base">تغيير خلفية الصفحة</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#D3B051]/20">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#D3B051] border-b-2 border-[#D3B051] bg-[#D3B051]/5'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {activeTab === 'color' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedColor === color
                        ? 'border-[#D3B051] ring-2 ring-[#D3B051]/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-white/70 text-sm whitespace-nowrap">لون مخصص:</label>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-10 h-10 rounded-md border border-white/20 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white text-sm text-center font-mono focus:outline-none focus:ring-1 focus:ring-[#D3B051]/50"
                />
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">رفع صورة خلفية:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#D3B051] file:text-[#1a1a2e] hover:file:bg-[#D3B051]/80 file:cursor-pointer"
                />
              </div>
              {imageUrl && (
                <div className="rounded-lg overflow-hidden border border-white/10">
                  <img src={imageUrl} alt="معاينة" className="w-full h-32 object-cover" />
                </div>
              )}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  شفافية الطبقة العلوية: {Math.round((1 - imageOpacity) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={imageOpacity}
                  onChange={(e) => handleImageOpacityChange(parseFloat(e.target.value))}
                  className="w-full accent-[#D3B051]"
                />
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">رفع فيديو خلفية:</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#D3B051] file:text-[#1a1a2e] hover:file:bg-[#D3B051]/80 file:cursor-pointer"
                />
              </div>
              {videoUrl && (
                <div className="rounded-lg overflow-hidden border border-white/10">
                  <video src={videoUrl} className="w-full h-32 object-cover" muted autoPlay loop />
                </div>
              )}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  شفافية الفيديو: {Math.round(videoOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={videoOpacity}
                  onChange={(e) => handleVideoOpacityChange(parseFloat(e.target.value))}
                  className="w-full accent-[#D3B051]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#D3B051]/20 flex items-center justify-between">
          <button
            onClick={handleRemoveBackground}
            className="px-4 py-2 rounded-md text-sm text-red-400 hover:bg-red-400/10 border border-red-400/30 transition-colors"
          >
            إزالة الخلفية
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm bg-[#D3B051] text-[#1a1a2e] font-bold hover:bg-[#D3B051]/80 transition-colors"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
}