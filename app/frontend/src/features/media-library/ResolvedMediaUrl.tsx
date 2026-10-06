import { useEffect, useState } from 'react';
import { getMediaFromIDB } from '@/lib/mediaStorage';
import type { MediaKind } from './types';

type Props = {
  url: string;
  kind: MediaKind;
  className?: string;
};

export default function ResolvedMediaUrl({ url, kind, className }: Props) {
  const [src, setSrc] = useState(() => (url.startsWith('idb://') ? '' : url));

  useEffect(() => {
    if (!url.startsWith('idb://')) {
      setSrc(url);
      return;
    }
    let cancelled = false;
    const key = url.replace('idb://', '');
    void getMediaFromIDB(key).then((resolved) => {
      if (!cancelled && resolved) setSrc(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!src) {
    return <div className={`animate-pulse bg-white/10 ${className ?? ''}`} aria-hidden />;
  }

  if (kind === 'video') {
    return <video src={src} className={className} muted playsInline />;
  }

  return <img src={src} alt="" className={className} loading="lazy" />;
}
