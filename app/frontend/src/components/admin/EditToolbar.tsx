import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { PenSquare, X, Paintbrush, FileText } from 'lucide-react';
import PageBackgroundEditor from './PageBackgroundEditor';
import PageManager from './PageManager';

export default function EditToolbar() {
  const { isEditMode, isDevEditModeAvailable, toggleEditMode, logout } = useEditMode();
  const [showBgEditor, setShowBgEditor] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);

  if (!isDevEditModeAvailable) {
    return null;
  }

  return (
    <>
      {!isEditMode && (
        <div className="fixed bottom-6 left-6 z-[9999]">
          <button
            onClick={toggleEditMode}
            className="w-12 h-12 rounded-full bg-[#1a1a2e]/90 border border-[#D3B051]/40 shadow-lg shadow-[#D3B051]/10 flex items-center justify-center hover:bg-[#D3B051]/20 hover:border-[#D3B051]/70 transition-all duration-300 group"
            aria-label="تفعيل وضع التحرير (بيئة التطوير)"
          >
            <PenSquare className="h-5 w-5 text-[#D3B051] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {isEditMode && (
        <div className="fixed top-[72px] left-0 right-0 z-[9999] bg-[#D3B051]/95 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span className="text-[#1a1a2e] text-sm font-bold">
                وضع التحرير — بيئة التطوير فقط
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBgEditor(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#1a1a2e]/80 text-[#D3B051] text-sm font-medium hover:bg-[#1a1a2e] transition-colors"
              >
                <Paintbrush className="h-3.5 w-3.5" />
                خلفية الصفحة
              </button>
              <button
                onClick={() => setShowPageManager(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#1a1a2e]/80 text-[#D3B051] text-sm font-medium hover:bg-[#1a1a2e] transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                إدارة الصفحات
              </button>
              <button
                onClick={logout}
                className="text-[#1a1a2e]/70 text-xs hover:text-[#1a1a2e] underline transition-colors"
              >
                إيقاف التحرير
              </button>
              <button
                onClick={toggleEditMode}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#1a1a2e] text-[#D3B051] text-sm font-bold hover:bg-[#1a1a2e]/80 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      <PageBackgroundEditor open={showBgEditor} onClose={() => setShowBgEditor(false)} />
      <PageManager open={showPageManager} onClose={() => setShowPageManager(false)} />
    </>
  );
}
