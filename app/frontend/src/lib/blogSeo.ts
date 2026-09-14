import type { BlogPost, SeoMeta } from '@/lib/blog';
import { getBlogRoute, getHeroImage, getPostSeoMeta, getReadingTimeMinutes } from '@/lib/blog';

export function getAbsoluteUrlFromWindow(pathname?: string) {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const path = pathname ?? window.location.pathname;
  return `${window.location.origin}${path}`;
}

export function buildArticleJsonLd(post: BlogPost, url: string) {
  const seo = getPostSeoMeta(post);
  const heroImage = getHeroImage(post);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.frontmatter.date,
    author: {
      '@type': 'Organization',
      name: typeof post.frontmatter.author === 'string' ? post.frontmatter.author : seo.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: seo.siteName,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: heroImage ? [heroImage] : undefined,
    keywords: post.frontmatter.tags?.join(', '),
    wordCount: post.markdown.split(/\s+/).filter(Boolean).length,
    timeRequired: `PT${getReadingTimeMinutes(post.markdown)}M`,
    inLanguage: post.frontmatter.lang ?? 'ar',
  };
}

export function buildBlogJsonLd(seo: SeoMeta, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: seo.siteName,
    description: seo.description,
    url,
    inLanguage: ['ar', 'en'],
  };
}
