import type { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import JourneyProgress from '@/features/journeys/core/JourneyProgress';

interface Props {
  title: string;
  description: string;
  startLabel: string;
  onStart: () => void;
  isLoading: boolean;
  showStart: boolean;
  isCompleted?: boolean;
  stepProgress?: number;
  totalSteps?: number;
  progressVariant?: 'bar' | 'text';
  children?: ReactNode;
  footer?: ReactNode;
}

export default function JourneyShell({
  title,
  description,
  startLabel,
  onStart,
  isLoading,
  showStart,
  isCompleted = false,
  stepProgress = 0,
  totalSteps = 1,
  progressVariant = 'text',
  children,
  footer,
}: Props) {
  return (
    <Layout>
      <section className="py-16 md:py-24 bg-white dark:bg-[#6B6B6B] min-h-[70vh]">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="gold-text text-3xl md:text-4xl font-bold font-playfair mb-3">{title}</h1>
            <p className="text-gray-600 dark:text-white/70 font-tajawal">{description}</p>
          </div>

          {showStart ? (
            <div className="text-center">
              <button
                type="button"
                onClick={onStart}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-tajawal font-semibold text-white disabled:opacity-60"
              >
                {startLabel}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gold/20 bg-cream dark:bg-dark p-6 shadow-sm">
              {!isCompleted ? (
                <JourneyProgress current={stepProgress} total={totalSteps} variant={progressVariant} />
              ) : (
                <div className="mb-4 flex items-center gap-2 text-green-700 dark:text-green-300 font-tajawal">
                  <CheckCircle className="h-5 w-5" />
                  <span>اكتملت الرحلة</span>
                </div>
              )}
              {children}
              {footer}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
