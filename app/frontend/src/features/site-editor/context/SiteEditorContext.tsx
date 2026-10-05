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
import { listFieldsForPage } from '../fieldRegistry';
import { applyValueToElement, getElementForField, highlightElement } from '../domApply';
import {
  bootstrapFieldFromDom,
  cloneFieldValue,
  loadPageFieldRecords,
  persistField,
} from '../persistence';
import { snapshotFromRecords, valuesEqual } from '../serialization';
import type { DocumentSnapshot, FieldRecord, FieldValue, SaveStatus } from '../types';

const MAX_UNDO = 50;
const AUTOSAVE_MS = 1200;

type SiteEditorContextValue = {
  enabled: boolean;
  pagePath: string;
  selectedFieldId: string | null;
  fields: Record<string, FieldRecord>;
  saveStatus: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  selectField: (fieldId: string | null) => void;
  updateSelectedField: (value: FieldValue) => void;
  replaceFieldValue: (fieldId: string, value: FieldValue, element?: HTMLElement | null) => void;
  saveAll: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  reloadDocument: () => Promise<void>;
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
  const pagePath = location.pathname;

  const [fields, setFields] = useState<Record<string, FieldRecord>>({});
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
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
    void loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    if (enabled) {
      document.body.classList.add('site-editor-active');
      return () => document.body.classList.remove('site-editor-active');
    }
    document.body.classList.remove('site-editor-active');
    return undefined;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setSelectedFieldId(null);
      return;
    }
    const prev = document.querySelector('[data-site-editor-selected="true"]') as HTMLElement | null;
    if (prev) {
      highlightElement(prev, false);
      prev.removeAttribute('data-site-editor-selected');
    }
    if (!selectedFieldId) return;
    const el = getElementForField(selectedFieldId);
    if (el) {
      highlightElement(el, true);
      el.setAttribute('data-site-editor-selected', 'true');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedFieldId, enabled, pagePath]);

  const saveAllInternal = useCallback(async () => {
    const dirtyEntries = Object.entries(fieldsRef.current).filter(([, r]) => r.dirty);
    if (dirtyEntries.length === 0) {
      setSaveStatus('saved');
      return;
    }
    setSaveStatus('saving');
    try {
      for (const [fieldId, record] of dirtyEntries) {
        const id = await persistField(pagePath, fieldId, record);
        record.persistedId = id;
        record.baseline = cloneFieldValue(record.value);
        record.dirty = false;
      }
      setFields({ ...fieldsRef.current });
      setSaveStatus('saved');
      toast.success('تم حفظ التعديلات');
    } catch {
      setSaveStatus('error');
      toast.error('تعذر الحفظ');
    }
  }, [pagePath]);

  const saveAllRef = useRef(saveAllInternal);
  saveAllRef.current = saveAllInternal;

  const selectField = useCallback(
    (fieldId: string | null) => {
      if (!enabled) return;
      if (fieldId && !fieldsRef.current[fieldId]) {
        const boot = bootstrapFieldFromDom(fieldId, pagePath);
        if (boot) {
          setFields((prev) => ({ ...prev, [fieldId]: boot }));
        }
      }
      undoTransactionStarted.current = false;
      setSelectedFieldId(fieldId);
    },
    [enabled, pagePath],
  );

  const applyFieldValue = useCallback(
    (fieldId: string, value: FieldValue, element?: HTMLElement | null) => {
      if (!enabled) return;
      if (!undoTransactionStarted.current) {
        pushUndo();
        undoTransactionStarted.current = true;
      }
      setFields((prev) => {
        let current = prev[fieldId];
        if (!current) {
          current = bootstrapFieldFromDom(fieldId, pagePath) ?? undefined;
        }
        if (!current) return prev;
        const dirty = !valuesEqual(value, current.baseline);
        return { ...prev, [fieldId]: { ...current, value, dirty } };
      });
      const el = element ?? getElementForField(fieldId);
      if (el) applyValueToElement(el, value);
      setSaveStatus('dirty');
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = window.setTimeout(() => {
        void saveAllRef.current();
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

  const replaceFieldValue = useCallback(
    (fieldId: string, value: FieldValue, element?: HTMLElement | null) => {
      undoTransactionStarted.current = false;
      setSelectedFieldId(fieldId);
      if (fieldId && !fieldsRef.current[fieldId]) {
        const boot = bootstrapFieldFromDom(fieldId, pagePath);
        if (boot) {
          setFields((prev) => ({ ...prev, [fieldId]: boot }));
        }
      }
      applyFieldValue(fieldId, value, element);
    },
    [applyFieldValue, pagePath],
  );

  const saveAll = saveAllInternal;

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
          const el = getElementForField(id);
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
          const el = getElementForField(id);
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
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void saveAllInternal();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, saveAllInternal, undo, redo]);

  const fieldList = useMemo(() => {
    if (!enabled) return [];
    return listFieldsForPage(pagePath).map((f) => ({ id: f.id, label: f.label, group: f.group }));
  }, [enabled, pagePath, fields]);

  const value = useMemo<SiteEditorContextValue>(
    () => ({
      enabled,
      pagePath,
      selectedFieldId,
      fields,
      saveStatus,
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      selectField,
      updateSelectedField,
      saveAll,
      undo,
      redo,
      reloadDocument: loadDocument,
      fieldList,
    }),
    [
      enabled,
      pagePath,
      selectedFieldId,
      fields,
      saveStatus,
      undoStack.length,
      redoStack.length,
      selectField,
      updateSelectedField,
      replaceFieldValue,
      saveAll,
      undo,
      redo,
      loadDocument,
      fieldList,
    ],
  );

  return <SiteEditorContext.Provider value={value}>{children}</SiteEditorContext.Provider>;
}
