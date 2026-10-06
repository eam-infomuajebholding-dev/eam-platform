import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useEditMode } from '@/contexts/EditModeContext';
import { listEditableDomIdsOnPage, listFieldsForPage } from '../fieldRegistry';
import { siteEditorPageKey } from '../siteEditorPageKey';
import { applyValueToElement, highlightElement, resolveElementForField, stampEditableId } from '../domApply';
import {
  bootstrapFieldFromDom,
  cloneFieldValue,
  loadPageFieldRecords,
  persistField,
  restoreFieldToDefault,
} from '../persistence';
import { snapshotFromRecords, valuesEqual } from '../serialization';
import {
  clearedValueAfterCut,
  getEditorClipboard,
  mergePasteValue,
  setEditorClipboard,
} from '../editorClipboard';
import { mergeLayout } from '../layoutUtils';
import type { DocumentSnapshot, ElementLayout, FieldRecord, FieldValue, SaveStatus } from '../types';

function isNativeTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return true;
  if (target.isContentEditable) return true;
  return false;
}

function selectAllInSiteEditorField() {
  const active = document.activeElement;
  if (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) {
    if (active.classList.contains('site-editor-field')) {
      active.select();
      return true;
    }
  }
  const field = document.querySelector(
    '.site-editor-field',
  ) as HTMLTextAreaElement | HTMLInputElement | null;
  if (field) {
    field.focus();
    field.select();
    return true;
  }
  return false;
}

const MAX_UNDO = 50;
const AUTOSAVE_MS = 1200;

type SiteEditorContextValue = {
  enabled: boolean;
  pagePath: string;
  selectedFieldId: string | null;
  contentSheetOpen: boolean;
  fields: Record<string, FieldRecord>;
  saveStatus: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  selectField: (fieldId: string | null, elementHint?: HTMLElement | null, options?: { openContentSheet?: boolean }) => void;
  openContentSheet: () => void;
  dismissFieldEditor: () => Promise<void>;
  closeContentSheet: () => Promise<void>;
  finishEditingSession: () => Promise<void>;
  updateSelectedField: (value: FieldValue) => void;
  patchSelectedLayout: (layout: Partial<ElementLayout>) => void;
  replaceFieldValue: (fieldId: string, value: FieldValue, element?: HTMLElement | null) => void;
  saveAll: (options?: { silent?: boolean }) => Promise<void>;
  copySelected: () => void;
  cutSelected: () => void;
  pasteToSelected: () => void;
  selectAllOnPage: () => void;
  undo: () => void;
  redo: () => void;
  reloadDocument: () => Promise<void>;
  restoreSelectedToDefault: () => Promise<void>;
  fieldList: { id: string; label: string; group?: string }[];
};

const SiteEditorContext = createContext<SiteEditorContextValue | null>(null);

export function useSiteEditor() {
  const ctx = useContext(SiteEditorContext);
  if (!ctx) throw new Error('useSiteEditor must be used within SiteEditorProvider');
  return ctx;
}

export function useSiteEditorOptional() {
  return useContext(SiteEditorContext);
}

export function SiteEditorProvider({ children }: { children: ReactNode }) {
  const { isEditMode, isDevEditModeAvailable } = useEditMode();
  const location = useLocation();
  const enabled = isDevEditModeAvailable && isEditMode;
  const pagePath = siteEditorPageKey(location.pathname);

  const [fields, setFields] = useState<Record<string, FieldRecord>>({});
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [contentSheetOpen, setContentSheetOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [undoStack, setUndoStack] = useState<DocumentSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<DocumentSnapshot[]>([]);

  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const autosaveTimer = useRef<number | null>(null);
  const undoTransactionStarted = useRef(false);

  const pushUndo = useCallback(() => {
    const snap = snapshotFromRecords(fieldsRef.current);
    setUndoStack((prev) => [...prev.slice(-MAX_UNDO + 1), snap]);
    setRedoStack([]);
  }, []);

  const loadDocument = useCallback(async () => {
    if (!enabled) return;
    setSaveStatus('idle');
    const records = await loadPageFieldRecords(pagePath);
    setFields(records);
    setUndoStack([]);
    setRedoStack([]);
  }, [enabled, pagePath]);

  useEffect(() => {
    if (!enabled) return;
    void loadDocument();
    const t1 = window.setTimeout(() => void loadDocument(), 350);
    const t2 = window.setTimeout(() => void loadDocument(), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [enabled, loadDocument]);

  useEffect(() => {
    if (enabled) {
      document.body.classList.add('site-editor-active');
      return () => document.body.classList.remove('site-editor-active');
    }
    document.body.classList.remove('site-editor-active');
    return undefined;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !selectedFieldId || fields[selectedFieldId]) return;
    const boot = bootstrapFieldFromDom(selectedFieldId, pagePath);
    if (!boot) return;
    setFields((prev) => ({ ...prev, [selectedFieldId]: boot }));
  }, [enabled, selectedFieldId, pagePath, fields]);

  useEffect(() => {
    if (!enabled) {
      setSelectedFieldId(null);
      setContentSheetOpen(false);
      return;
    }
    const prev = document.querySelector('[data-site-editor-selected="true"]') as HTMLElement | null;
    if (prev) {
      highlightElement(prev, false);
      prev.removeAttribute('data-site-editor-selected');
    }
    if (!selectedFieldId) return;
    const el = resolveElementForField(selectedFieldId);
    if (el) {
      stampEditableId(el, selectedFieldId);
      highlightElement(el, true);
      el.setAttribute('data-site-editor-selected', 'true');
      if (contentSheetOpen) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedFieldId, enabled, pagePath, contentSheetOpen]);

  const saveAllInternal = useCallback(async (options?: { silent?: boolean }) => {
    const dirtyEntries = Object.entries(fieldsRef.current).filter(([, r]) => r.dirty);
    if (dirtyEntries.length === 0) {
      setSaveStatus('saved');
      return;
    }
    setSaveStatus('saving');
    try {
      let savedLocally = false;
      for (const [fieldId, record] of dirtyEntries) {
        const result = await persistField(pagePath, fieldId, record);
        record.persistedId = result.id;
        if (result.storage === 'local') savedLocally = true;
        record.baseline = cloneFieldValue(record.value);
        record.dirty = false;
      }
      setFields({ ...fieldsRef.current });
      setSaveStatus('saved');
      if (!options?.silent) {
        toast.success(
          savedLocally ? 'تم الحفظ على هذا الجهاز (وضع التطوير)' : 'تم حفظ التعديلات',
        );
      }
    } catch {
      setSaveStatus('error');
      toast.error('تعذر الحفظ');
    }
  }, [pagePath]);

  const saveAllRef = useRef(saveAllInternal);
  saveAllRef.current = saveAllInternal;

  const selectField = useCallback(
    (
      fieldId: string | null,
      elementHint?: HTMLElement | null,
      options?: { openContentSheet?: boolean },
    ) => {
      if (!enabled) return;

      let rec = fieldId ? fieldsRef.current[fieldId] : undefined;
      if (fieldId && !rec) {
        const boot = bootstrapFieldFromDom(fieldId, pagePath, elementHint);
        if (boot) {
          rec = boot;
          setFields((prev) => ({ ...prev, [fieldId]: boot }));
        }
      }

      undoTransactionStarted.current = false;
      setSelectedFieldId(fieldId);
      if (!fieldId) {
        setContentSheetOpen(false);
        return;
      }

      const type = rec?.value.type;
      const isText = type === 'plain' || type === 'markdown' || type === 'link';
      setContentSheetOpen(Boolean(options?.openContentSheet && isText));
    },
    [enabled, pagePath],
  );

  const openContentSheet = useCallback(() => {
    if (!selectedFieldId) return;
    const rec = fieldsRef.current[selectedFieldId];
    if (!rec) return;
    if (rec.value.type === 'plain' || rec.value.type === 'markdown' || rec.value.type === 'link') {
      setContentSheetOpen(true);
    }
  }, [selectedFieldId]);

  const applyFieldValue = useCallback(
    (fieldId: string, value: FieldValue, element?: HTMLElement | null) => {
      if (!enabled) return;
      if (!undoTransactionStarted.current) {
        pushUndo();
        undoTransactionStarted.current = true;
      }
      const targetEl = element ?? resolveElementForField(fieldId);
      if (targetEl) stampEditableId(targetEl, fieldId);
      setFields((prev) => {
        let current = prev[fieldId];
        if (!current) {
          current = bootstrapFieldFromDom(fieldId, pagePath, targetEl) ?? undefined;
        }
        if (!current) return prev;
        const dirty = !valuesEqual(value, current.baseline);
        return { ...prev, [fieldId]: { ...current, value, dirty } };
      });
      if (targetEl) applyValueToElement(targetEl, value);
      setSaveStatus('dirty');
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = window.setTimeout(() => {
        void saveAllRef.current({ silent: true });
      }, AUTOSAVE_MS);
    },
    [enabled, pagePath, pushUndo],
  );

  const updateSelectedField = useCallback(
    (value: FieldValue) => {
      if (!selectedFieldId) return;
      applyFieldValue(selectedFieldId, value);
    },
    [selectedFieldId, applyFieldValue],
  );

  const patchSelectedLayout = useCallback(
    (layoutPatch: Partial<ElementLayout>) => {
      if (!selectedFieldId) return;
      const current = fieldsRef.current[selectedFieldId];
      if (!current) return;
      const el = resolveElementForField(selectedFieldId);
      const layout = mergeLayout(current.value.layout, layoutPatch);
      applyFieldValue(selectedFieldId, { ...current.value, layout } as FieldValue, el);
    },
    [selectedFieldId, applyFieldValue],
  );

  const closeContentSheet = useCallback(async () => {
    undoTransactionStarted.current = false;
    setContentSheetOpen(false);
    await saveAllInternal({ silent: true });
  }, [saveAllInternal]);

  const dismissFieldEditor = useCallback(async () => {
    undoTransactionStarted.current = false;
    setContentSheetOpen(false);
    setSelectedFieldId(null);
    await saveAllInternal({ silent: true });
  }, [saveAllInternal]);

  const finishEditingSession = useCallback(async () => {
    undoTransactionStarted.current = false;
    setContentSheetOpen(false);
    setSelectedFieldId(null);
    await saveAllInternal({ silent: false });
  }, [saveAllInternal]);

  const replaceFieldValue = useCallback(
    (fieldId: string, value: FieldValue, element?: HTMLElement | null) => {
      undoTransactionStarted.current = false;
      const existing = fieldsRef.current[fieldId];
      let next = value;
      if (
        existing &&
        (value.type === 'image' || value.type === 'video') &&
        existing.value.type === value.type
      ) {
        next = { ...value, layout: value.layout ?? existing.value.layout };
      }
      setSelectedFieldId(fieldId);
      applyFieldValue(fieldId, next, element);
    },
    [applyFieldValue],
  );

  const saveAll = saveAllInternal;

  const restoreSelectedToDefault = useCallback(async () => {
    if (!selectedFieldId) return;
    const record = fieldsRef.current[selectedFieldId];
    try {
      await restoreFieldToDefault(pagePath, selectedFieldId, record?.persistedId);
      setFields((prev) => {
        const next = { ...prev };
        delete next[selectedFieldId];
        return next;
      });
      setSelectedFieldId(null);
      setContentSheetOpen(false);
      toast.success('تمت استعادة الصورة الأصلية');
      await loadDocument();
    } catch {
      toast.error('تعذر الاستعادة');
    }
  }, [selectedFieldId, pagePath, loadDocument]);

  const resolveFieldRecord = useCallback(
    (fieldId: string, elementHint?: HTMLElement | null): FieldRecord | null => {
      let record = fieldsRef.current[fieldId];
      if (record) return record;
      const boot = bootstrapFieldFromDom(fieldId, pagePath, elementHint);
      if (!boot) return null;
      setFields((prev) => ({ ...prev, [fieldId]: boot }));
      return boot;
    },
    [pagePath],
  );

  const copySelected = useCallback(() => {
    if (!selectedFieldId) {
      toast.message('حدّد عنصراً ثم Ctrl+C');
      return;
    }
    const record = resolveFieldRecord(selectedFieldId);
    if (!record) {
      toast.error('تعذر قراءة العنصر');
      return;
    }
    setEditorClipboard({
      value: cloneFieldValue(record.value),
      sourceFieldId: selectedFieldId,
      pagePath,
      copiedAt: Date.now(),
    });
    toast.success('تم النسخ (Ctrl+V للصق)');
  }, [selectedFieldId, pagePath, resolveFieldRecord]);

  const cutSelected = useCallback(() => {
    if (!selectedFieldId) {
      toast.message('حدّد عنصراً ثم Ctrl+X');
      return;
    }
    const record = resolveFieldRecord(selectedFieldId);
    if (!record) {
      toast.error('تعذر قراءة العنصر');
      return;
    }
    setEditorClipboard({
      value: cloneFieldValue(record.value),
      sourceFieldId: selectedFieldId,
      pagePath,
      copiedAt: Date.now(),
    });
    const cleared = clearedValueAfterCut(record.value, record.baseline);
    undoTransactionStarted.current = false;
    applyFieldValue(selectedFieldId, cleared);
    toast.success('تم القص (Ctrl+V للصق)');
  }, [selectedFieldId, pagePath, resolveFieldRecord, applyFieldValue]);

  const pasteToSelected = useCallback(() => {
    if (!selectedFieldId) {
      toast.message('حدّد عنصراً ثم Ctrl+V');
      return;
    }
    const clip = getEditorClipboard();
    if (!clip) {
      toast.error('الحافظة فارغة — انسخ عنصراً بـ Ctrl+C');
      return;
    }
    const record = resolveFieldRecord(selectedFieldId);
    if (!record) {
      toast.error('تعذر قراءة العنصر');
      return;
    }
    const merged = mergePasteValue(record.value, clip.value);
    if (!merged) {
      toast.error('نوع العنصر لا يقبل هذا اللصق');
      return;
    }
    undoTransactionStarted.current = false;
    applyFieldValue(selectedFieldId, merged);
    toast.success('تم اللصق');
  }, [selectedFieldId, applyFieldValue, resolveFieldRecord]);

  const selectAllOnPage = useCallback(() => {
    if (selectAllInSiteEditorField()) return;

    const ids = listEditableDomIdsOnPage();
    if (ids.length === 0) {
      toast.message('لا عناصر قابلة للتحرير على هذه الصفحة');
      return;
    }

    setFields((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        if (!next[id]) {
          const boot = bootstrapFieldFromDom(id, pagePath);
          if (boot) next[id] = boot;
        }
      }
      return next;
    });

    const activeId =
      selectedFieldId && ids.includes(selectedFieldId) ? selectedFieldId : ids[0]!;
    if (activeId !== selectedFieldId) {
      selectField(activeId, resolveElementForField(activeId), { openContentSheet: false });
    }

    const record = fieldsRef.current[activeId] ?? bootstrapFieldFromDom(activeId, pagePath);
    const isText =
      record?.value.type === 'plain' ||
      record?.value.type === 'markdown' ||
      record?.value.type === 'link';

    if (isText) {
      setContentSheetOpen(true);
      window.requestAnimationFrame(() => {
        if (!selectAllInSiteEditorField()) {
          toast.success(`تم تحديد ${ids.length} عنصراً — حدّد نصاً في اللوحة`);
        }
      });
      return;
    }

    toast.success(`تم تحديد ${ids.length} عنصر${ids.length === 1 ? '' : 'اً'} على الصفحة`);
  }, [selectedFieldId, pagePath, selectField]);

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const snap = stack[stack.length - 1]!;
      const current = snapshotFromRecords(fieldsRef.current);
      setRedoStack((r) => [...r, current]);
      setFields((prev) => {
        const next = { ...prev };
        for (const [id, record] of Object.entries(next)) {
          const v = snap[id] ?? record.baseline;
          record.value = cloneFieldValue(v);
          record.dirty = !valuesEqual(record.value, record.baseline);
          const el = resolveElementForField(id);
          if (el) applyValueToElement(el, record.value);
        }
        return { ...next };
      });
      setSaveStatus('dirty');
      return stack.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const snap = stack[stack.length - 1]!;
      const current = snapshotFromRecords(fieldsRef.current);
      setUndoStack((u) => [...u, current]);
      setFields((prev) => {
        const next = { ...prev };
        for (const [id, record] of Object.entries(next)) {
          const v = snap[id] ?? record.value;
          record.value = cloneFieldValue(v);
          record.dirty = !valuesEqual(record.value, record.baseline);
          const el = resolveElementForField(id);
          if (el) applyValueToElement(el, record.value);
        }
        return { ...next };
      });
      setSaveStatus('dirty');
      return stack.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (isNativeTextInput(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        void saveAllInternal();
        return;
      }
      if (key === 'c') {
        event.preventDefault();
        copySelected();
        return;
      }
      if (key === 'x') {
        event.preventDefault();
        cutSelected();
        return;
      }
      if (key === 'v') {
        event.preventDefault();
        pasteToSelected();
        return;
      }
      if (key === 'a') {
        event.preventDefault();
        selectAllOnPage();
        return;
      }
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      if (key === 'z' && event.shiftKey) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    enabled,
    saveAllInternal,
    copySelected,
    cutSelected,
    pasteToSelected,
    selectAllOnPage,
    undo,
    redo,
  ]);

  const fieldList = useMemo(() => {
    if (!enabled) return [];
    return listFieldsForPage(pagePath).map((f) => ({ id: f.id, label: f.label, group: f.group }));
  }, [enabled, pagePath, fields]);

  const value = useMemo<SiteEditorContextValue>(
    () => ({
      enabled,
      pagePath,
      selectedFieldId,
      contentSheetOpen,
      fields,
      saveStatus,
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      selectField,
      openContentSheet,
      dismissFieldEditor,
      closeContentSheet,
      finishEditingSession,
      updateSelectedField,
      patchSelectedLayout,
      replaceFieldValue,
      saveAll,
      copySelected,
      cutSelected,
      pasteToSelected,
      selectAllOnPage,
      undo,
      redo,
      reloadDocument: loadDocument,
      restoreSelectedToDefault,
      fieldList,
    }),
    [
      enabled,
      pagePath,
      selectedFieldId,
      contentSheetOpen,
      fields,
      saveStatus,
      undoStack.length,
      redoStack.length,
      selectField,
      openContentSheet,
      dismissFieldEditor,
      closeContentSheet,
      finishEditingSession,
      updateSelectedField,
      patchSelectedLayout,
      replaceFieldValue,
      saveAll,
      copySelected,
      cutSelected,
      pasteToSelected,
      selectAllOnPage,
      undo,
      redo,
      loadDocument,
      restoreSelectedToDefault,
      fieldList,
    ],
  );

  return <SiteEditorContext.Provider value={value}>{children}</SiteEditorContext.Provider>;
}
