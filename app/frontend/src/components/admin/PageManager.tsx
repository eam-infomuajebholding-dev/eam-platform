import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export interface CustomNavLink {
  path: string;
  label: string;
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

interface PageManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function PageManager({ open, onClose }: PageManagerProps) {
  const [customLinks, setCustomLinks] = useState<CustomNavLink[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newPath, setNewPath] = useState('');

  useEffect(() => {
    if (open) {
      setCustomLinks(getCustomNavLinks());
    }
  }, [open]);

  const handleAdd = () => {
    if (!newLabel.trim() || !newPath.trim()) return;
    const path = newPath.startsWith('/') ? newPath : `/${newPath}`;
    const updated = [...customLinks, { path, label: newLabel.trim() }];
    setCustomLinks(updated);
    saveCustomNavLinks(updated);
    setNewLabel('');
    setNewPath('');
  };

  const handleRemove = (index: number) => {
    const updated = customLinks.filter((_, i) => i !== index);
    setCustomLinks(updated);
    saveCustomNavLinks(updated);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white dark:bg-[#252525] rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">إدارة الصفحات</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Existing custom pages */}
          {customLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">الصفحات المخصصة:</p>
              {customLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">{link.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{link.path}</span>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              لا توجد صفحات مخصصة بعد
            </p>
          )}

          {/* Add new page */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">إضافة صفحة جديدة:</p>
            <input
              type="text"
              placeholder="اسم الصفحة (مثال: المدونة)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D3B051]/50"
            />
            <input
              type="text"
              placeholder="المسار (مثال: /blog)"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D3B051]/50"
              dir="ltr"
            />
            <button
              onClick={handleAdd}
              disabled={!newLabel.trim() || !newPath.trim()}
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