/** Blog UI copy (ar + en). */

export type BlogMessageKey =
  | 'blog.hero.title'
  | 'blog.hero.subtitle'
  | 'blog.featured'
  | 'blog.allPosts'
  | 'blog.readArticle'
  | 'blog.readTime'
  | 'blog.byAuthor'
  | 'blog.publishedOn'
  | 'blog.backToBlog'
  | 'blog.noPosts.title'
  | 'blog.noPosts.body'
  | 'blog.noPosts.cta'
  | 'blog.related.title'
  | 'blog.cta.title'
  | 'blog.cta.body'
  | 'blog.cta.button'
  | 'blog.share.title'
  | 'blog.share.copy'
  | 'blog.share.copied'
  | 'blog.share.whatsapp'
  | 'blog.notFound.title'
  | 'blog.notFound.body'
  | 'blog.tagFilter.all'
  | 'blog.index.metaDescription'
  | 'blog.article.label';

export type BlogMessageCatalog = Record<BlogMessageKey, string>;

export const BLOG_MESSAGES_AR: BlogMessageCatalog = {
  'blog.hero.title': 'مدونة إعمار',
  'blog.hero.subtitle':
    'رؤى ومعرفة في الاستشارات الهندسية، التطوير العقاري، الصيانة الذكية، والخدمات الحكومية — لمساعدتك على اتخاذ قرارات أفضل.',
  'blog.featured': 'مقال مميز',
  'blog.allPosts': 'جميع المقالات',
  'blog.readArticle': 'اقرأ المقال',
  'blog.readTime': '{minutes} دقائق قراءة',
  'blog.byAuthor': 'بقلم {author}',
  'blog.publishedOn': 'نُشر في {date}',
  'blog.backToBlog': 'العودة للمدونة',
  'blog.noPosts.title': 'المقالات قادمة قريباً',
  'blog.noPosts.body':
    'نعمل على إعداد محتوى متخصص في الهندسة والتطوير العقاري. اشترك في النشرة أو تواصل معنا لتصلك آخر المقالات.',
  'blog.noPosts.cta': 'تواصل معنا',
  'blog.related.title': 'مقالات ذات صلة',
  'blog.cta.title': 'هل لديك مشروع أو استفسار؟',
  'blog.cta.body': 'فريق إعمار جاهز لمساعدتك في الاستشارة الهندسية، التراخيص، والتنفيذ.',
  'blog.cta.button': 'اطلب استشارة',
  'blog.share.title': 'شارك المقال',
  'blog.share.copy': 'نسخ الرابط',
  'blog.share.copied': 'تم النسخ!',
  'blog.share.whatsapp': 'مشاركة عبر واتساب',
  'blog.notFound.title': 'المقال غير موجود',
  'blog.notFound.body': 'عذراً، لم نجد المقال الذي تبحث عنه. ربما نُقل أو حُذف.',
  'blog.tagFilter.all': 'الكل',
  'blog.index.metaDescription':
    'مدونة إعمار الأصالة والمعاصرة — مقالات متخصصة في الاستشارات الهندسية، الاستثمار العقاري، الصيانة، والخدمات الحكومية في السعودية.',
  'blog.article.label': 'مقال',
};

export const BLOG_MESSAGES_EN: BlogMessageCatalog = {
  'blog.hero.title': 'Emmar Blog',
  'blog.hero.subtitle':
    'Insights on engineering consultancy, real estate development, smart maintenance, and government services — to help you make better decisions.',
  'blog.featured': 'Featured article',
  'blog.allPosts': 'All articles',
  'blog.readArticle': 'Read article',
  'blog.readTime': '{minutes} min read',
  'blog.byAuthor': 'By {author}',
  'blog.publishedOn': 'Published {date}',
  'blog.backToBlog': 'Back to blog',
  'blog.noPosts.title': 'Articles coming soon',
  'blog.noPosts.body':
    'We are preparing specialized engineering and real estate content. Contact us or subscribe to get the latest articles.',
  'blog.noPosts.cta': 'Contact us',
  'blog.related.title': 'Related articles',
  'blog.cta.title': 'Have a project or question?',
  'blog.cta.body': 'The Emmar team is ready to help with engineering consulting, licensing, and execution.',
  'blog.cta.button': 'Request a consultation',
  'blog.share.title': 'Share article',
  'blog.share.copy': 'Copy link',
  'blog.share.copied': 'Copied!',
  'blog.share.whatsapp': 'Share on WhatsApp',
  'blog.notFound.title': 'Article not found',
  'blog.notFound.body': 'Sorry, we could not find the article you are looking for.',
  'blog.tagFilter.all': 'All',
  'blog.index.metaDescription':
    'Emmar Al Asala Wa Al Muasara blog — articles on engineering consultancy, real estate investment, maintenance, and government services in Saudi Arabia.',
  'blog.article.label': 'Article',
};
