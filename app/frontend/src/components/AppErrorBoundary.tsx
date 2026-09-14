import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { translateMessage } from '@/i18n/messages';

type Props = { children: ReactNode };
type State = { hasError: boolean };

function t(key: Parameters<typeof translateMessage>[1]) {
  const lang =
    typeof document !== 'undefined' ? document.documentElement.lang || 'ar' : 'ar';
  return translateMessage(lang, key);
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-light px-4 dark:bg-surface">
        <div className="max-w-md rounded-xl border border-soft-border/80 p-8 text-center dark:border-white/10">
          <h1 className="text-xl font-bold text-ink dark:text-white">{t('site.error.title')}</h1>
          <p className="mt-3 text-sm text-ink-secondary">{t('site.error.body')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
            >
              {t('site.error.home')}
            </Link>
            <Link
              to="/my-requests"
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              {t('site.error.myRequests')}
            </Link>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              {t('site.error.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
