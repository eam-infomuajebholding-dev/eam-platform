type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'emblem' | 'heroEmblem' | 'header' | 'footer';
  showText?: boolean;
  className?: string;
  align?: 'center' | 'end' | 'start';
  alt?: string;
};

const LOGO_SRC = '/assets/eam-emblem-transparent.png';
const LOGO_FALLBACK = '/assets/logo.png';

export default function BrandLogo({
  size = 'lg',
  showText = true,
  className = '',
  align = 'center',
  alt = 'شعار إعمار الأصالة والمعاصرة',
}: BrandLogoProps) {
  const logoSize = {
    sm: 'h-16 w-auto',
    md: 'h-24 w-auto',
    lg: 'h-[280px] md:h-[320px] w-auto',
    emblem:
      'h-auto w-full max-h-[min(440px,56vh)] max-w-[min(330px,90%)] object-contain',
    heroEmblem: 'h-auto w-auto max-h-[min(220px,34vh)] object-contain',
    header: 'h-10 w-auto max-h-10',
    footer: 'h-auto w-full max-h-none max-w-none object-contain',
  }[size];

  const isEmblem = size === 'emblem' || size === 'heroEmblem';
  const isHeader = size === 'header';
  const alignClass =
    align === 'end'
      ? 'items-end'
      : align === 'start'
        ? 'items-start'
        : 'items-center justify-center';

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      <img
        src={LOGO_SRC}
        onError={(event) => {
          event.currentTarget.src = LOGO_FALLBACK;
        }}
        alt={alt}
        className={`${logoSize} object-contain ${isEmblem ? 'drop-shadow-[0_6px_28px_rgba(198,138,42,0.28)]' : ''}`}
        loading={isEmblem || isHeader ? 'eager' : 'lazy'}
        decoding="async"
      />

      {showText && !isEmblem && !isHeader && (
        <>
          <h1 className="mt-4 text-3xl font-bold text-ink dark:text-white">
            إعمار الأصالة والمعاصرة
          </h1>

          <p className="mt-2 text-sm tracking-[0.25em] text-deep-gold/80 dark:text-ink-subtle">
            EMMAR AL ASALA WA AL MUASARA
          </p>
        </>
      )}
    </div>
  );
}
