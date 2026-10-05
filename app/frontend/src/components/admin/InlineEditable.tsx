import type React from 'react';

/** @deprecated Use `@/features/site-editor` — kept for backward-compatible imports. */
export { applySavedEdits } from '@/features/site-editor';

export function GlobalEditOverlay() {
  return null;
}

export function EditableText({ children, className = '', as: Tag = 'span' }: { children: React.ReactNode; className?: string; as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div' }) {
  return <Tag className={className}>{children}</Tag>;
}

export function EditableImage({ src, alt = '', className = '' }: { src: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} className={className} />;
}

export function EditableVideo({ src, className = '', poster }: { src: string; className?: string; poster?: string }) {
  return (
    <video src={src} className={className} poster={poster} controls>
      <track kind="captions" />
    </video>
  );
}

export function EditableSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
