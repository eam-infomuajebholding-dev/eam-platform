import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogSeo from '@/components/blog/BlogSeo';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getAllTags,
  getBlogIndexSeoMeta,
  getPostsForLanguage,
} from '@/lib/blog';
import { Link } from 'react-router-dom';

const BlogIndexPage = () => {
  const { language, t } = useLanguage();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const posts = useMemo(() => getPostsForLanguage(language), [language]);
  const tags = useMemo(() => getAllTags(posts), [posts]);

  const filteredPosts = useMemo(() => {
    if (!activeTag) {
      return posts;
    }
    return posts.filter((post) => post.frontmatter.tags?.includes(activeTag));
  }, [activeTag, posts]);

  const [featured, ...rest] = filteredPosts;

  const seo = {
    ...getBlogIndexSeoMeta(),
    description: t('blog.index.metaDescription'),
    ogDescription: t('blog.index.metaDescription'),
    twitterDescription: t('blog.index.metaDescription'),
  };

  return (
    <Layout>
      <BlogSeo seo={seo} />

      <PageHero titleKey="blog.hero.title" subtitleKey="blog.hero.subtitle" />

      <section className="bg-cream-light py-16 dark:bg-background md:py-20">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-gold/30 bg-surface-alt p-10 text-center dark:bg-white/5">
              <h2 className="font-display text-2xl font-bold text-ink">
                {t('blog.noPosts.title')}
              </h2>
              <p className="mt-4 leading-relaxed text-ink-secondary">
                {t('blog.noPosts.body')}
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-block rounded-lg bg-gold px-6 py-3 font-bold text-dark hover:bg-gold-light"
              >
                {t('blog.noPosts.cta')}
              </Link>
            </div>
          ) : (
            <>
              {tags.length > 0 ? (
                <div className="mb-10 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTag(null)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeTag === null
                        ? 'bg-gold text-dark'
                        : 'border border-gold/30 text-ink-secondary hover:bg-gold/10 dark:text-white/70'
                    }`}
                  >
                    {t('blog.tagFilter.all')}
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTag(tag)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        activeTag === tag
                          ? 'bg-gold text-dark'
                          : 'border border-gold/30 text-ink-secondary hover:bg-gold/10 dark:text-white/70'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null}

              {featured ? (
                <div className="mb-12">
                  <p className="mb-4 text-sm font-bold uppercase tracking-wide text-gold">
                    {t('blog.featured')}
                  </p>
                  <BlogPostCard post={featured} featured />
                </div>
              ) : null}

              {rest.length > 0 ? (
                <>
                  <h2 className="mb-6 font-display text-2xl font-bold text-ink">
                    {t('blog.allPosts')}
                  </h2>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                      <BlogPostCard key={post.slug} post={post} />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogIndexPage;
