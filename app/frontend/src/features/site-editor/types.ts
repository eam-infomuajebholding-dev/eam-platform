export type FieldType = 'plain' | 'markdown' | 'link' | 'image' | 'video';

export type FieldValue =
  | { type: 'plain'; text: string }
  | { type: 'markdown'; markdown: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'image'; url: string }
  | { type: 'video'; url: string };

export type EditorFieldMeta = {
  id: string;
  label: string;
  type: FieldType;
  /** Exact paths, or '*' for any page */
  pages: string[];
  description?: string;
  group?: string;
};

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export type FieldRecord = {
  meta: EditorFieldMeta;
  value: FieldValue;
  baseline: FieldValue;
  persistedId?: number;
  dirty: boolean;
};

export type DocumentSnapshot = Record<string, FieldValue>;
