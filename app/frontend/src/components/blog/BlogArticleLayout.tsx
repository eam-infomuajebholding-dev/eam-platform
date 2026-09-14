import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BlogPost } from '@/lib/blog';
import { getHeroImage, getReadingTimeMinutes } from '@/lib/blog';
import BlogShareButtons from './BlogShareButtons';
import BlogArticleCta from './BlogArticleCta';

type BlogArticleLayoutProps = {
  post: BlogPost;
  children: React.ReactNode;
  related?: React.ReactNode;
};

function formatDate(date: string, locale: string) {
  const parsed = Date.parse(date);
  if (Number.isNaN(parsed)) {
    return date;
  }

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(parsed));
}

export default function BlogArticleLayout({ post, children, related }: BlogArticleLayoutProps) {
  const { language, t } = useLanguage();
  const heroImage = getHeroImage(post);
  const minutes = getReadingTimeMinutes(post.markdown);
  const author = typeof post.frontmatter.author === 'string' ? post.frontmatter.author : undefined;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Layout>
      <div className="bg-cream-light dark:bg-background">
        {heroImage ? (
          <div className="relative h-[40vh] min-h-[280px] max-h-[420px] w-full overflow-hidden">
            <img src={heroImage} alt={post.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ) : null}

        <article className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-gold dark:text-white/60"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            {t('blog.backToBlog')}
          </Link>

          <header className={`${heroImage ? '-mt-16 relative z-10 rounded-2xl border border-gold/20 bg-white/95 p-6 shadow-lg backdrop-blur dark:bg-background/95 md:p-8' : 'mt-6 border-b border-gold/20 pb-8'}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t('blog.article.label')}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
              {post.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
              {post.frontmatter.date ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gold" />
                  {t('blog.publishedOn').replace(
                    '{date}',
                    formatDate(String(post.frontmatter.date), language),
                  )}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gold" />
                {t('blog.readTime').replace('{minutes}', String(minutes))}
              </span>
              {author ? (
                <span className="text-ink-secondary">
                  {t('blog.byAuthor').replace('{author}', author)}
                </span>
              ) : null}
            </div>

            {post.frontmatter.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          <div className="mt-10">{children}</div>

          <div className="mt-10">
            <BlogShareButtons title={post.title} url={pageUrl} />
          </div>

          <BlogArticleCta />

          {related ? <div className="mt-14">{related}</div> : null}
        </article>
      </div>
    </Layout>
  );
}
