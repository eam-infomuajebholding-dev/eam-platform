import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, Image, Video } from 'lucide-react';
import { PUBLIC_SITE_ROUTES } from '@/features/section-visibility/publicSiteRoutes';
import {
  getCustomNavLinks,
  type CustomNavLink,
} from '@/components/admin/PageManager';
import EditorDrawerFrame, { EditorIOSGroup, EditorIOSRow } from './EditorDrawerFrame';

const STORAGE_KEY = 'custom-nav-links';

function saveCustomNavLinks(links: CustomNavLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  window.dispatchEvent(new Event('nav-links-changed'));
}

function generatePathFromLabel(_label: string): string {
  return `/page-${Date.now().toString(36)}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function EditorPagesSheet({ open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [customLinks, setCustomLinks] = useState<CustomNavLink[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [bgType, setBgType] = useState<'none' | 'image' | 'video'>('none');
  const [bgData, setBgData] = useState('');

  useEffect(() => {
    if (open) {
      setCustomLinks(getCustomNavLinks());
    }
  }, [open]);

  const goToPage = (path: string) => {
    onClose();
    window.setTimeout(() => {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 120);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBgData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const path = generatePathFromLabel(newLabel);
    const updated = [
      ...customLinks,
      {
        path,
        label: newLabel.trim(),
        backgroundType: bgType,
        backgroundData: bgType !== 'none' ? bgData : undefined,
      },
    ];
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

  return (
    <EditorDrawerFrame
      open={open}
      onClose={onClose}
      title="الصفحات"
      description="اختر صفحة للتحرير · اسحب للأسفل أو «تم» للإغلاق"
    >
      <EditorIOSGroup title="صفحات الموقع">
        {PUBLIC_SITE_ROUTES.map((route) => (
          <EditorIOSRow
            key={route.path}
            label={route.label}
            detail={route.path === location.pathname ? 'الحالية' : undefined}
            active={location.pathname === route.path}
            onClick={() => goToPage(route.path)}
          />
        ))}
      </EditorIOSGroup>

      {customLinks.length > 0 ? (
        <EditorIOSGroup title="صفحات مخصصة">
          {customLinks.map((link, idx) => (
            <div key={link.path} className="flex items-center gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => goToPage(link.path)}
                className="min-w-0 flex-1 text-right text-[17px] font-medium"
              >
                {link.label}
                {link.backgroundType === 'image' ? (
                  <Image className="mr-2 inline h-3.5 w-3.5 text-gold" aria-hidden />
                ) : null}
                {link.backgroundType === 'video' ? (
                  <Video className="mr-2 inline h-3.5 w-3.5 text-gold" aria-hidden />
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="rounded-lg p-2 text-red-500 active:bg-red-500/10"
                aria-label="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </EditorIOSGroup>
      ) : null}

      <EditorIOSGroup title="إضافة صفحة للقائمة">
        <div className="space-y-3 px-4 py-3">
          <input
            type="text"
            placeholder="اسم الصفحة"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full rounded-[10px] border border-black/10 bg-[#f2f2f7] px-3 py-2.5 text-[17px] focus:outline-none focus:ring-2 focus:ring-[#007aff]/40 dark:border-white/10 dark:bg-black/20"
          />
          <div className="flex gap-2">
            {(['none', 'image', 'video'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setBgType(type);
                  if (type === 'none') setBgData('');
                }}
                className={`flex-1 rounded-[10px] py-2 text-xs font-bold ${
                  bgType === type
                    ? 'bg-[#007aff] text-white'
                    : 'bg-black/5 dark:bg-white/10'
                }`}
              >
                {type === 'none' ? 'بدون خلفية' : type === 'image' ? 'صورة' : 'فيديو'}
              </button>
            ))}
          </div>
          {bgType !== 'none' ? (
            <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-dashed border-gold/40 px-3 py-2.5">
              <Upload className="h-4 w-4 text-gold" />
              <span className="text-sm text-ink-muted">
                {bgData ? 'تم اختيار الملف' : 'رفع خلفية'}
              </span>
              <input
                type="file"
                accept={bgType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleBgUpload}
                className="hidden"
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newLabel.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#007aff] py-3 text-[17px] font-semibold text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            إضافة
          </button>
        </div>
      </EditorIOSGroup>
    </EditorDrawerFrame>
  );
}
