import { useEffect } from 'react';
import type { BlogPost, SeoMeta } from '@/lib/blog';
import { getAbsoluteUrlFromWindow, buildArticleJsonLd, buildBlogJsonLd } from '@/lib/blogSeo';

type BlogSeoProps = {
  seo: SeoMeta;
  post?: BlogPost | null;
};

function ensureMetaTag(attribute: 'name' | 'property', key: string) {
  let tag = document.head.querySelector(
    `meta[${attribute}="${key}"]`,
  ) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  return tag;
}

export default function BlogSeo({ seo, post }: BlogSeoProps) {
  useEffect(() => {
    const resolvedUrl = seo.url ?? getAbsoluteUrlFromWindow();
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;

    const metaEntries = [
      { attribute: 'name' as const, key: 'description', value: seo.description },
      { attribute: 'name' as const, key: 'keywords', value: seo.keywords },
      { attribute: 'property' as const, key: 'og:url', value: resolvedUrl },
      { attribute: 'property' as const, key: 'og:site_name', value: seo.siteName },
      { attribute: 'property' as const, key: 'og:title', value: seo.ogTitle },
      { attribute: 'property' as const, key: 'og:description', value: seo.ogDescription },
      { attribute: 'property' as const, key: 'og:image', value: seo.ogImage },
      { attribute: 'property' as const, key: 'og:image:alt', value: seo.ogImageAlt },
      { attribute: 'property' as const, key: 'og:type', value: seo.ogType },
      { attribute: 'property' as const, key: 'article:published_time', value: seo.publishedTime },
      { attribute: 'name' as const, key: 'twitter:card', value: seo.twitterCard },
      { attribute: 'name' as const, key: 'twitter:site', value: seo.twitterSite },
      { attribute: 'name' as const, key: 'twitter:creator', value: seo.twitterCreator },
      { attribute: 'name' as const, key: 'twitter:title', value: seo.twitterTitle },
      { attribute: 'name' as const, key: 'twitter:description', value: seo.twitterDescription },
      { attribute: 'name' as const, key: 'twitter:image', value: seo.twitterImage },
      { attribute: 'name' as const, key: 'twitter:image:alt', value: seo.twitterImageAlt },
    ];

    const previousValues = metaEntries.map(({ attribute, key, value }) => {
      if (!value) {
        return null;
      }
      const tag = ensureMetaTag(attribute, key);
      const previousContent = tag.content;
      tag.content = value;
      return { tag, previousContent };
    });

    document.title = seo.title;
    if (seo.lang) {
      document.documentElement.lang = seo.lang.split('-')[0];
    }

    const articleTags = (seo.tags ?? []).map((tag) => {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('property', 'article:tag');
      metaTag.content = tag;
      document.head.appendChild(metaTag);
      return metaTag;
    });

    const jsonLd = post
      ? buildArticleJsonLd(post, resolvedUrl ?? '')
      : buildBlogJsonLd(seo, resolvedUrl ?? '');

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.blogSeo = 'true';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      articleTags.forEach((tag) => tag.remove());
      script.remove();
      previousValues.forEach((entry) => {
        if (!entry) {
          return;
        }
        entry.tag.content = entry.previousContent;
      });
    };
  }, [seo, post]);

  return null;
}
