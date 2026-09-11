import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchCommandCenter } from '../api/commandCenterClient';

export default function CommandSearchBar() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

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
    <div className="rounded-2xl border border-gold/15 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <label htmlFor="command-search" className="sr-only">
          بحث لوحة القيادة
        </label>
        <input
          id="command-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث، اسأل، أو انتقل — مثال: الطلبات المؤهلة، المخاطر، OIDC"
          className="min-w-[240px] flex-1 rounded-xl border border-gold/20 bg-white px-4 py-2 font-tajawal text-sm dark:bg-white/5"
        />
        <button
          type="submit"
          className="rounded-xl bg-gold px-4 py-2 font-tajawal text-sm font-bold text-white"
        >
          تنفيذ
        </button>
      </form>

      {searchQuery.data?.results?.length ? (
        <ul className="mt-3 space-y-2">
          {searchQuery.data.results.map((result) => (
            <li key={`${result.result_type}-${result.id}`}>
              {result.navigation_path ? (
                <Link
                  to={result.navigation_path}
                  className="block rounded-lg border border-gold/10 px-3 py-2 font-tajawal text-sm hover:bg-gold/5"
                >
                  <span className="text-ink/50">{result.result_type}</span> — {result.label_ar}
                </Link>
              ) : (
                <div className="rounded-lg border border-gold/10 px-3 py-2 font-tajawal text-sm">
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

      {searchQuery.data?.limitations?.length ? (
        <p className="mt-2 font-tajawal text-xs text-ink/50">{searchQuery.data.limitations.join(' ')}</p>
      ) : null}
    </div>
  );
}
