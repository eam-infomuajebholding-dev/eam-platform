import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BlogPost } from '@/lib/blog';
import { getBlogRoute, getHeroImage, getReadingTimeMinutes } from '@/lib/blog';

type BlogPostCardProps = {
  post: BlogPost;
  featured?: boolean;
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

export default function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const { language, t } = useLanguage();
  const heroImage = getHeroImage(post);
  const minutes = getReadingTimeMinutes(post.markdown);

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold-card dark:bg-white/5 ${
        featured ? 'md:grid md:grid-cols-2' : ''
      }`}
    >
      {heroImage ? (
        <Link to={getBlogRoute(post.slug)} className={`block overflow-hidden ${featured ? 'h-full min-h-[220px]' : 'h-48'}`}>
          <img
            src={heroImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      ) : null}

      <div className={`flex flex-col p-6 ${featured ? 'justify-center' : ''}`}>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          {post.frontmatter.date ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(String(post.frontmatter.date), language)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {t('blog.readTime').replace('{minutes}', String(minutes))}
          </span>
        </div>

        {post.frontmatter.tags?.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.frontmatter.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <h2 className={`font-display font-bold text-ink ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          <Link to={getBlogRoute(post.slug)} className="hover:text-gold">
            {post.title}
          </Link>
        </h2>

        <p className={`mt-3 flex-1 leading-relaxed text-ink-secondary ${featured ? 'text-base' : 'text-sm line-clamp-3'}`}>
          {post.description}
        </p>

        <Link
          to={getBlogRoute(post.slug)}
          className="mt-5 inline-flex text-sm font-bold text-gold hover:underline"
        >
          {t('blog.readArticle')} →
        </Link>
      </div>
    </article>
  );
}
