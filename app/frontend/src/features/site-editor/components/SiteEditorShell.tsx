import { useState } from 'react';
import {
  History,
  Paintbrush,
  PenSquare,
  Redo2,
  Save,
  Undo2,
  FileText,
  Images,
  X,
} from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useMediaLibrary } from '@/features/media-library';
import PageBackgroundEditor from '@/components/admin/PageBackgroundEditor';
import PageManager from '@/components/admin/PageManager';
import { useSiteEditor } from '../context/SiteEditorContext';
import EditorInspector from './EditorInspector';
import EditorCanvasLayer from './EditorCanvasLayer';
import EditorCommandPalette from './EditorCommandPalette';
import EditorRevisionsPanel from './EditorRevisionsPanel';

function SaveStatusBadge({ status }: { status: string }) {
  const label =
    status === 'saving'
      ? 'جاري الحفظ…'
      : status === 'saved'
        ? 'محفوظ'
        : status === 'dirty'
          ? 'تغييرات غير محفوظة'
          : status === 'error'
            ? 'خطأ في الحفظ'
            : 'جاهز';
  const tone =
    status === 'error'
      ? 'bg-red-500/20 text-red-100'
      : status === 'dirty'
        ? 'bg-amber-500/25 text-amber-50'
        : status === 'saved'
          ? 'bg-green-500/20 text-green-50'
          : 'bg-white/10 text-white/80';
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tone}`}>{label}</span>;
}

export default function SiteEditorShell() {
  const { isDevEditModeAvailable, isEditMode, toggleEditMode, logout } = useEditMode();
  const { enabled, saveStatus, saveAll, undo, redo, canUndo, canRedo, pagePath } = useSiteEditor();
  const [showBg, setShowBg] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const { openBrowse } = useMediaLibrary();

  if (!isDevEditModeAvailable) return null;

  return (
    <>
      {!isEditMode ? (
        <div className="fixed bottom-6 left-6 z-[9999]">
          <button
            type="button"
            onClick={toggleEditMode}
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-[#1a1a2e]/90 shadow-lg shadow-gold/10 transition hover:border-gold/70 hover:bg-gold/20"
            aria-label="فتح محرر المحتوى"
          >
            <PenSquare className="h-5 w-5 text-gold transition group-hover:scale-110" />
          </button>
        </div>
      ) : (
        <>
          <header
            className="site-editor-topbar fixed left-0 right-0 top-[4.25rem] z-[9999] border-b border-black/10 bg-[#0f141c]/95 text-white backdrop-blur-md"
            data-edit-toolbar="true"
            dir="rtl"
          >
            <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 py-2">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">محرر EAM · Content Studio</p>
                  <p className="truncate font-mono text-[10px] text-white/50">{pagePath}</p>
                </div>
                <SaveStatusBadge status={saveStatus} />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={undo}
                  className="site-editor-chip"
                  title="تراجع"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={!canRedo}
                  onClick={redo}
                  className="site-editor-chip"
                  title="إعادة"
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => void saveAll()} className="site-editor-chip site-editor-chip--primary">
                  <Save className="h-3.5 w-3.5" />
                  حفظ
                </button>
                <button type="button" onClick={() => setShowRevisions(true)} className="site-editor-chip">
                  <History className="h-3.5 w-3.5" />
                  سجل
                </button>
                <button type="button" onClick={() => openBrowse('image')} className="site-editor-chip">
                  <Images className="h-3.5 w-3.5" />
                  مكتبة الوسائط
                </button>
                <button type="button" onClick={() => setShowBg(true)} className="site-editor-chip">
                  <Paintbrush className="h-3.5 w-3.5" />
                  خلفية
                </button>
                <button type="button" onClick={() => setShowPages(true)} className="site-editor-chip">
                  <FileText className="h-3.5 w-3.5" />
                  صفحات
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    toggleEditMode();
                  }}
                  className="site-editor-chip"
                >
                  <X className="h-3.5 w-3.5" />
                  إغلاق
                </button>
              </div>
            </div>
            <p className="border-t border-white/5 py-1 text-center text-[10px] text-white/45">
              Ctrl+K أوامر · Ctrl+S حفظ · انقر صورة/فيديو لفتح المكتبة · المفتش للنص
            </p>
          </header>

          {enabled ? (
            <>
              <EditorCanvasLayer />
              <EditorInspector />
              <EditorCommandPalette />
            </>
          ) : null}
        </>
      )}

      <PageBackgroundEditor open={showBg} onClose={() => setShowBg(false)} />
      <PageManager open={showPages} onClose={() => setShowPages(false)} />
      <EditorRevisionsPanel open={showRevisions} onClose={() => setShowRevisions(false)} />
    </>
  );
}
