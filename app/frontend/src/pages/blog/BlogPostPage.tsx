import { Link, Navigate, useLocation } from 'react-router-dom';
import BlogArticleLayout from '@/components/blog/BlogArticleLayout';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogSeo from '@/components/blog/BlogSeo';
import MarkdownArticle from '@/components/blog/MarkdownArticle';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBlogPost, getPostSeoMeta, getRelatedPosts } from '@/lib/blog';

function getSlugFromPathname(pathname: string) {
  return pathname
    .replace(/^\/blog\/?/, '')
    .replace(/\/+$/, '')
    .replace(/^\/+/, '');
}

const BlogPostPage = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const slug = getSlugFromPathname(location.pathname);
  const post = slug === '*' ? null : getBlogPost(slug);
  const related = post ? getRelatedPosts(post.slug) : [];

  if (slug === '*') {
    return <Navigate to="/blog" replace />;
  }

  if (!post) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
          <h1 className="font-display text-6xl font-bold text-ink-subtle">404</h1>
          <h2 className="mt-4 text-2xl font-bold text-ink">
            {t('blog.notFound.title')}
          </h2>
          <p className="mt-2 max-w-md text-ink-secondary">
            {t('blog.notFound.body')}
          </p>
          <Link
            to="/blog"
            className="mt-8 rounded-lg bg-gold px-6 py-3 font-bold text-dark hover:bg-gold-light"
          >
            {t('blog.backToBlog')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <BlogSeo seo={getPostSeoMeta(post)} post={post} />
      <BlogArticleLayout
        post={post}
        related={
          related.length > 0 ? (
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold text-ink">
                {t('blog.related.title')}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((item) => (
                  <BlogPostCard key={item.slug} post={item} />
                ))}
              </div>
            </div>
          ) : null
        }
      >
        <MarkdownArticle markdown={post.markdown} />
      </BlogArticleLayout>
    </>
  );
};

export default BlogPostPage;
