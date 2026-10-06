import { useEffect, useState } from 'react';
import { Ellipsis, PenSquare, Redo2, Undo2 } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useMediaLibrary } from '@/features/media-library';
import SectionVisibilityPanel from '@/features/section-visibility/SectionVisibilityPanel';
import PageBackgroundEditor from '@/components/admin/PageBackgroundEditor';
import EditorPagesSheet from './EditorPagesSheet';
import { useSiteEditor } from '../context/SiteEditorContext';
import EditorControlSheet from './EditorControlSheet';
import EditorCanvasLayer from './EditorCanvasLayer';
import EditorSelectionChrome from './EditorSelectionChrome';
import EditorTransformToolbar from './EditorTransformToolbar';
import EditorCommandPalette from './EditorCommandPalette';
import EditorRevisionsPanel from './EditorRevisionsPanel';
import EditorMoreSheet from './EditorMoreSheet';

function SaveDot({ status }: { status: string }) {
  const color =
    status === 'error'
      ? 'bg-red-400'
      : status === 'dirty' || status === 'saving'
        ? 'bg-amber-400 animate-pulse'
        : status === 'saved'
          ? 'bg-emerald-400'
          : 'bg-white/35';
  const title =
    status === 'saving'
      ? 'جاري الحفظ'
      : status === 'saved'
        ? 'محفوظ'
        : status === 'dirty'
          ? 'تغييرات قيد الحفظ'
          : status === 'error'
            ? 'خطأ'
            : 'جاهز';
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} title={title} aria-label={title} />;
}

export default function SiteEditorShell() {
  const { isDevEditModeAvailable, isEditMode, toggleEditMode, logout } = useEditMode();
  const {
    enabled,
    saveStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedFieldId,
    contentSheetOpen,
    pagePath,
    dismissFieldEditor,
    closeContentSheet,
    finishEditingSession,
    saveAll,
  } = useSiteEditor();
  const [showBg, setShowBg] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const { openBrowse } = useMediaLibrary();

  const closeAllPanels = () => {
    setShowBg(false);
    setShowPages(false);
    setShowRevisions(false);
    setShowSections(false);
    setShowMore(false);
  };

  useEffect(() => {
    if (!isEditMode) closeAllPanels();
  }, [isEditMode]);

  if (!isDevEditModeAvailable) return null;

  const handleDone = () => {
    if (contentSheetOpen) {
      void closeContentSheet();
      return;
    }
    if (selectedFieldId) {
      void dismissFieldEditor();
      return;
    }
    void finishEditingSession().then(() => {
      closeAllPanels();
      logout();
      toggleEditMode();
    });
  };

  return (
    <>
      {!isEditMode ? (
        <div className="fixed bottom-6 left-6 z-[10002]">
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
          <div
            className="site-editor-ios-bar pointer-events-none fixed inset-x-0 top-[4.25rem] z-[10130] flex justify-center px-3 py-2"
            data-edit-toolbar="true"
          >
            <div
              className="pointer-events-auto flex w-full max-w-lg items-center justify-between gap-2 rounded-[14px] border border-white/15 bg-white/75 px-3 py-2 shadow-lg backdrop-blur-2xl dark:bg-[#1c1c1e]/88"
              dir="rtl"
            >
              <button
                type="button"
                onClick={handleDone}
                className="rounded-lg px-2 py-1 text-[17px] font-semibold text-[#007aff] transition active:opacity-70 dark:text-[#0a84ff]"
              >
                تم
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                <SaveDot status={saveStatus} />
                <span
                  className="truncate text-xs font-semibold text-ink/80 dark:text-white/85"
                  title={pagePath}
                >
                  {selectedFieldId ? 'تحرير العنصر' : pagePath || 'انقر للتحرير'}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={undo}
                  className="site-editor-ios-icon text-ink/85 dark:text-white/88"
                  title="تراجع"
                  aria-label="تراجع"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!canRedo}
                  onClick={redo}
                  className="site-editor-ios-icon text-ink/85 dark:text-white/88"
                  title="إعادة"
                  aria-label="إعادة"
                >
                  <Redo2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowMore(true)}
                  className="site-editor-ios-icon text-ink/85 dark:text-white/88"
                  title="المزيد"
                  aria-label="المزيد"
                >
                  <Ellipsis className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {enabled ? (
            <>
              <EditorCanvasLayer />
              <EditorSelectionChrome />
              <EditorTransformToolbar />
              <EditorControlSheet />
              <EditorCommandPalette />
            </>
          ) : null}

          <EditorMoreSheet
            open={showMore}
            onClose={() => setShowMore(false)}
            onOpenMedia={() => {
              closeAllPanels();
              openBrowse('image');
            }}
            onOpenRevisions={() => {
              closeAllPanels();
              setShowRevisions(true);
            }}
            onOpenBackground={() => {
              closeAllPanels();
              setShowBg(true);
            }}
            onOpenPages={() => {
              closeAllPanels();
              setShowPages(true);
            }}
            onOpenSections={() => {
              closeAllPanels();
              setShowSections(true);
            }}
            onSave={() => void saveAll()}
            onExitEditor={() => {
              void finishEditingSession().then(() => {
                closeAllPanels();
                logout();
                toggleEditMode();
              });
            }}
          />
        </>
      )}

      <PageBackgroundEditor open={showBg} onClose={() => setShowBg(false)} />
      <EditorPagesSheet open={showPages} onClose={() => setShowPages(false)} />
      <EditorRevisionsPanel open={showRevisions} onClose={() => setShowRevisions(false)} />
      <SectionVisibilityPanel open={showSections} onClose={() => setShowSections(false)} />
    </>
  );
}
