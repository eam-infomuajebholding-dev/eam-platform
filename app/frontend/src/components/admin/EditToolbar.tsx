import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { History, PenSquare, X, Paintbrush, FileText } from 'lucide-react';
import PageBackgroundEditor from './PageBackgroundEditor';
import PageManager from './PageManager';
import PageEditsPanel from './PageEditsPanel';

export default function EditToolbar() {
  const { isEditMode, isDevEditModeAvailable, toggleEditMode, logout } = useEditMode();
  const [showBgEditor, setShowBgEditor] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);
  const [showEditsPanel, setShowEditsPanel] = useState(false);

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
        <div className="fixed top-[72px] left-0 right-0 z-[9999] border-b border-[#1a1a2e]/10 bg-[#D3B051]/95 shadow-lg backdrop-blur-sm" data-edit-toolbar="true">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2.5" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
              <div>
                <span className="text-[#1a1a2e] text-sm font-bold">وضع التحرير</span>
                <p className="text-[10px] text-[#1a1a2e]/70">انقر أي نص أو صورة · نافذة تحرير · Ctrl+Enter للحفظ</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEditsPanel(true)}
                className="flex items-center gap-1 rounded-md bg-[#1a1a2e]/80 px-3 py-1.5 text-sm font-medium text-[#D3B051] transition-colors hover:bg-[#1a1a2e]"
              >
                <History className="h-3.5 w-3.5" />
                تعديلات الصفحة
              </button>
              <button
                type="button"
                onClick={() => setShowBgEditor(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#1a1a2e]/80 text-[#D3B051] text-sm font-medium hover:bg-[#1a1a2e] transition-colors"
              >
                <Paintbrush className="h-3.5 w-3.5" />
                خلفية الصفحة
              </button>
              <button
                type="button"
                onClick={() => setShowPageManager(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#1a1a2e]/80 text-[#D3B051] text-sm font-medium hover:bg-[#1a1a2e] transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                إدارة الصفحات
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-[#1a1a2e]/70 text-xs hover:text-[#1a1a2e] underline transition-colors"
              >
                إيقاف التحرير
              </button>
              <button
                type="button"
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
      <PageEditsPanel open={showEditsPanel} onClose={() => setShowEditsPanel(false)} />
    </>
  );
}
