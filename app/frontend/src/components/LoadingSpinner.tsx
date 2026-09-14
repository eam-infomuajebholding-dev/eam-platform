import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingSpinnerProps {
  message?: string;
  /** When true, fills the viewport (default). Set false for inline sections. */
  fullScreen?: boolean;
  className?: string;
  spinnerClassName?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  fullScreen = true,
  className = '',
  spinnerClassName = 'border-ink',
}) => {
  const { t } = useLanguage();
  const text = message ?? t('site.loading');

  const content = (
    <div className="text-center">
      <div
        className={`inline-block h-8 w-8 animate-spin rounded-full border-b-2 ${spinnerClassName}`}
        role="status"
        aria-label={text}
      />
      <p className="mt-4 text-ink-secondary">{text}</p>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-surface-alt ${className}`.trim()}
    >
      {content}
    </div>
  );
};

export default LoadingSpinner;
