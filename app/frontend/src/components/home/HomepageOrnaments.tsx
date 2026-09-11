export default function HomepageOrnaments() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block" aria-hidden="true">
      <svg className="absolute right-2 top-2 h-11 w-11 text-[var(--eam-home-gold)]/26" viewBox="0 0 48 48" fill="none">
        <path d="M6 6 H42 V16 H32 V42 H16 V16 H6 Z" stroke="currentColor" strokeWidth="0.9" />
        <path d="M24 16 V32 M16 24 H32" stroke="currentColor" strokeWidth="0.75" opacity="0.75" />
      </svg>
      <svg className="absolute left-2 top-2 h-11 w-11 text-[var(--eam-home-gold)]/26" viewBox="0 0 48 48" fill="none">
        <path d="M42 6 H6 V16 H16 V42 H32 V16 H42 Z" stroke="currentColor" strokeWidth="0.9" />
        <path d="M24 16 V32 M16 24 H32" stroke="currentColor" strokeWidth="0.75" opacity="0.75" />
      </svg>
      <svg className="absolute bottom-2 right-2 h-10 w-10 text-[var(--eam-home-gold)]/22" viewBox="0 0 48 48" fill="none">
        <path d="M6 42 H42 V32 H32 V6 H16 V32 H6 Z" stroke="currentColor" strokeWidth="0.9" />
      </svg>
      <svg className="absolute bottom-2 left-2 h-10 w-10 text-[var(--eam-home-gold)]/22" viewBox="0 0 48 48" fill="none">
        <path d="M42 42 H6 V32 H16 V6 H32 V32 H42 Z" stroke="currentColor" strokeWidth="0.9" />
      </svg>
    </div>
  );
}
