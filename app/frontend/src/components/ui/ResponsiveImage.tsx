import type { CSSProperties } from 'react';

type ResponsiveImageProps = {
  asset: { src: string; alt: string; objectPosition?: string };
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  priority?: boolean;
  width?: number;
  height?: number;
  style?: CSSProperties;
  'data-editable-id'?: string;
  'data-editor-default-src'?: string;
};

/** Minimal responsive image wrapper — presentation only; asset data lives in config/assets. */
export default function ResponsiveImage({
  asset,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  priority = false,
  width,
  height,
  style,
  'data-editable-id': dataEditableId,
  'data-editor-default-src': dataEditorDefaultSrc,
}: ResponsiveImageProps) {
  return (
    <img
      src={asset.src}
      alt={asset.alt}
      data-editable-id={dataEditableId}
      data-editor-default-src={dataEditorDefaultSrc}
      className={className}
      loading={priority ? 'eager' : loading}
      decoding={decoding}
      fetchPriority={priority ? 'high' : undefined}
      width={width}
      height={height}
      style={{
        objectPosition: asset.objectPosition,
        ...style,
      }}
    />
  );
}
