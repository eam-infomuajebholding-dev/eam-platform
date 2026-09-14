import { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2
      className={`mb-10 text-center font-display text-display-md text-ink md:text-display-lg ${className}`}
    >
      {children}
    </h2>
  );
}
