import { Link } from 'react-router-dom';
import Markdown from 'markdown-to-jsx';

type MarkdownArticleProps = {
  markdown: string;
};

function MarkdownLink({
  href,
  children,
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const className =
    'font-medium text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-light';

  if (href?.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

const MarkdownArticle = ({ markdown }: MarkdownArticleProps) => (
  <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-ink dark:prose-headings:text-white prose-h2:mt-10 prose-h2:border-t prose-h2:border-gold/20 prose-h2:pt-6 prose-a:no-underline prose-strong:text-ink dark:prose-strong:text-white prose-code:rounded prose-code:bg-gold/10 prose-code:px-1.5 prose-code:text-gold prose-pre:rounded-2xl prose-pre:bg-dark-card prose-table:text-sm">
    <Markdown
      options={{
        forceBlock: true,
        overrides: {
          a: { component: MarkdownLink },
          pre: { props: { className: 'overflow-x-auto' } },
        },
      }}
    >
      {markdown}
    </Markdown>
  </div>
);

export default MarkdownArticle;
