export type FieldType = 'plain' | 'markdown' | 'link' | 'image' | 'video';

/** PowerPoint-style box typography & dimensions (persisted with the field). */
export type ElementLayout = {
  width?: string;
  height?: string;
  maxWidth?: string;
  minHeight?: string;
  /** Position on page (PowerPoint-style move). */
  position?: 'relative' | 'absolute';
  left?: string;
  top?: string;
  zIndex?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'right' | 'left' | 'center' | 'justify';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
};

export type FieldValue =
  | { type: 'plain'; text: string; layout?: ElementLayout }
  | { type: 'markdown'; markdown: string; layout?: ElementLayout }
  | { type: 'link'; text: string; href: string; layout?: ElementLayout }
  | { type: 'image'; url: string; layout?: ElementLayout }
  | { type: 'video'; url: string; layout?: ElementLayout };

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
