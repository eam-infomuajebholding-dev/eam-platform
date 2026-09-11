import type { ReactNode } from 'react';

export default function HomeQuickActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="home-quick-action-bar mb-1 flex h-[34px] items-center overflow-hidden rounded-[14px] border border-[var(--eam-home-border)] bg-[var(--eam-home-cream-light)]/90 px-2 shadow-[0_1px_8px_rgba(139,77,0,0.06)] lg:h-[34px]">
      {children}
    </div>
  );
}
