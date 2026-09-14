import { useEffect } from 'react';

type PageMetaProps = {
  title: string;
  description?: string;
  noIndex?: boolean;
};

function readMeta(name: string): string | null {
  const tag = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  return tag?.getAttribute('content');
}

function writeMeta(name: string, content: string | null) {
  if (!content) {
    document.head.querySelector(`meta[name="${name}"]`)?.remove();
    return;
  }
  let tag = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/** Lightweight document title + robots for private/authenticated pages. */
export default function PageMeta({ title, description, noIndex = true }: PageMetaProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = readMeta('description');
    const previousRobots = readMeta('robots');

    document.title = title;
    if (description) {
      writeMeta('description', description);
    }
    if (noIndex) {
      writeMeta('robots', 'noindex, nofollow');
    }

    return () => {
      document.title = previousTitle;
      writeMeta('description', previousDescription);
      writeMeta('robots', previousRobots);
    };
  }, [title, description, noIndex]);

  return null;
}
