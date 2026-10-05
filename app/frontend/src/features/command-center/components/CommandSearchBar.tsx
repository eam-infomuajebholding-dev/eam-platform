import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchCommandCenter } from '../api/commandCenterClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type Props = {
  variant?: 'panel' | 'header';
};

export default function CommandSearchBar({ variant = 'panel' }: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isHeader = variant === 'header';

  useEffect(() => {
    if (!isHeader) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHeader]);

  const searchQuery = useQuery({
    queryKey: ['operations', 'command-center', 'search', submitted],
    queryFn: () => searchCommandCenter(submitted),
    enabled: submitted.length > 0,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(query.trim());
  };

  return (
    <div
      className={cn(
        'relative',
        isHeader ? 'command-center-header-search' : 'rounded-2xl border border-gold/15 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5',
      )}
    >
      <form onSubmit={handleSubmit} className={cn('flex gap-2', isHeader && 'items-center')}>
        <label htmlFor="command-search" className="sr-only">
          {t('commandCenter.search.label')}
        </label>
        <div className={cn('relative flex-1', isHeader && 'flex items-center')}>
          {isHeader ? (
            <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink/40" aria-hidden />
          ) : null}
          <input
            ref={inputRef}
            id="command-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('commandCenter.search.placeholder')}
            className={cn(
              'w-full text-sm',
              isHeader
                ? 'rounded-full border border-black/8 bg-[#f4f6f8] py-2.5 pe-16 ps-10 text-ink shadow-inner dark:border-white/10 dark:bg-white/5 dark:text-white'
                : 'min-w-[240px] flex-1 rounded-xl border border-gold/20 bg-white px-4 py-2 dark:bg-white/5',
            )}
          />
          {isHeader ? (
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-md border border-black/8 bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink/45 dark:border-white/10 dark:bg-surface">
              {t('commandCenter.search.shortcutHint')}
            </span>
          ) : null}
        </div>
        {!isHeader ? (
          <button
            type="submit"
            className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-white"
          >
            {t('commandCenter.search.submit')}
          </button>
        ) : null}
      </form>

      {searchQuery.data?.results?.length ? (
        <ul
          className={cn(
            'mt-3 space-y-2',
            isHeader &&
              'absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 max-h-64 overflow-y-auto rounded-xl border border-black/8 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-surface',
          )}
        >
          {searchQuery.data.results.map((result) => (
            <li key={`${result.result_type}-${result.id}`}>
              {result.navigation_path ? (
                <Link
                  to={result.navigation_path}
                  className="block rounded-lg border border-gold/10 px-3 py-2 text-sm hover:bg-gold/5"
                >
                  <span className="text-ink/50">{result.result_type}</span> — {result.label_ar}
                </Link>
              ) : (
                <div className="rounded-lg border border-gold/10 px-3 py-2 text-sm">
                  <span className="text-ink/50">{result.result_type}</span> — {result.label_ar}
                  {result.description_ar ? (
                    <p className="text-xs text-ink/60">{result.description_ar}</p>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
