import { ReactNode } from 'react';

type PageSectionVariant = 'cream' | 'alt' | 'muted';

const variantClasses: Record<PageSectionVariant, string> = {
  cream: 'bg-cream-light dark:bg-background',
  alt: 'bg-surface-alt dark:bg-surface-muted',
  muted: 'border-b border-soft-border/50 bg-cream-light dark:bg-background',
};

type PageSectionProps = {
  children: ReactNode;
  variant?: PageSectionVariant;
  className?: string;
  withGlow?: boolean;
};

export default function PageSection({
  children,
  variant = 'cream',
  className = '',
  withGlow = false,
}: PageSectionProps) {
  return (
    <section
      className={`relative py-16 md:py-24 ${variantClasses[variant]} ${className}`}
    >
      {withGlow ? (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--gold-400)_6%,transparent)_0%,transparent_70%)]"
          aria-hidden
        />
      ) : null}
      <div className="container relative z-10 mx-auto px-4">{children}</div>
    </section>
  );
}
