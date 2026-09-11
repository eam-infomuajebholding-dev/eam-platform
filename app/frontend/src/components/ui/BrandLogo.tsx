type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'emblem' | 'header';
  showText?: boolean;
  className?: string;
};

const LOGO_SRC = '/assets/eam-emblem-transparent.png';
const LOGO_FALLBACK = '/assets/logo.png';

export default function BrandLogo({
  size = 'lg',
  showText = true,
  className = '',
}: BrandLogoProps) {
  const logoSize = {
    sm: 'h-16 w-auto',
    md: 'h-24 w-auto',
    lg: 'h-[280px] md:h-[320px] w-auto',
    emblem:
      'h-auto w-full max-h-[min(440px,56vh)] max-w-[min(330px,90%)] object-contain',
    header: 'h-10 w-auto max-h-10',
  }[size];

  const isEmblem = size === 'emblem';
  const isHeader = size === 'header';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={LOGO_SRC}
        onError={(event) => {
          event.currentTarget.src = LOGO_FALLBACK;
        }}
        alt="شعار إعمار الأصالة والمعاصرة"
        className={`${logoSize} object-contain ${isEmblem ? 'drop-shadow-[0_6px_28px_rgba(198,138,42,0.28)]' : ''}`}
        loading={isEmblem || isHeader ? 'eager' : 'lazy'}
        decoding="async"
      />

      {showText && !isEmblem && !isHeader && (
        <>
          <h1 className="mt-4 text-3xl font-bold text-ink dark:text-white">
            إعمار الأصالة والمعاصرة
          </h1>

          <p className="mt-2 text-sm tracking-[0.25em] text-deep-gold/80 dark:text-gray-400">
            EMMAR AL ASALA WA AL MUASARA
          </p>
        </>
      )}
    </div>
  );
}
