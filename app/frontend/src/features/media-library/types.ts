export type MediaKind = 'image' | 'video';

export type MediaLibraryItem = {
  id: string;
  url: string;
  kind: MediaKind;
  label: string;
  source: 'upload' | 'site-edit' | 'bundled' | 'page';
};

export type MediaPickerOptions = {
  kind: MediaKind;
  title?: string;
  onSelect: (item: MediaLibraryItem) => void;
};
