import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { buildMediaCatalog } from './catalog';
import { registerLocalMedia } from './localIndex';
import MediaLibraryModal from './MediaLibraryModal';
import type { MediaKind, MediaLibraryItem, MediaPickerOptions } from './types';

type MediaLibraryContextValue = {
  open: boolean;
  filterKind: MediaKind;
  openPicker: (options: MediaPickerOptions) => void;
  openBrowse: (kind?: MediaKind) => void;
  close: () => void;
  registerUpload: (url: string, kind: MediaKind, label: string) => void;
  refreshCatalog: () => Promise<MediaLibraryItem[]>;
};

const MediaLibraryContext = createContext<MediaLibraryContextValue | null>(null);

export function useMediaLibrary() {
  const ctx = useContext(MediaLibraryContext);
  if (!ctx) throw new Error('useMediaLibrary must be used within MediaLibraryProvider');
  return ctx;
}

export function MediaLibraryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [filterKind, setFilterKind] = useState<MediaKind>('image');
  const [title, setTitle] = useState<string | undefined>();
  const [pickerMode, setPickerMode] = useState(false);
  const pickerCallback = useRef<((item: MediaLibraryItem) => void) | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPickerMode(false);
    pickerCallback.current = null;
  }, []);

  const openPicker = useCallback((options: MediaPickerOptions) => {
    setFilterKind(options.kind);
    setTitle(options.title);
    pickerCallback.current = options.onSelect;
    setPickerMode(true);
    setOpen(true);
  }, []);

  const openBrowse = useCallback((kind: MediaKind = 'image') => {
    setFilterKind(kind);
    setTitle(undefined);
    pickerCallback.current = null;
    setPickerMode(false);
    setOpen(true);
  }, []);

  const registerUpload = useCallback((url: string, kind: MediaKind, label: string) => {
    registerLocalMedia({ url, kind, label, source: 'upload' });
  }, []);

  const refreshCatalog = useCallback(() => buildMediaCatalog(), []);

  const handleSelect = useCallback(
    (item: MediaLibraryItem) => {
      if (pickerMode && pickerCallback.current) {
        pickerCallback.current(item);
        close();
        return;
      }
      close();
    },
    [close, pickerMode],
  );

  const value = useMemo<MediaLibraryContextValue>(
    () => ({
      open,
      filterKind,
      openPicker,
      openBrowse,
      close,
      registerUpload,
      refreshCatalog,
    }),
    [open, filterKind, openPicker, openBrowse, close, registerUpload, refreshCatalog],
  );

  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
      <MediaLibraryModal
        open={open}
        kind={filterKind}
        title={title}
        onClose={close}
        onSelect={handleSelect}
        pickerMode={pickerMode}
      />
    </MediaLibraryContext.Provider>
  );
}
