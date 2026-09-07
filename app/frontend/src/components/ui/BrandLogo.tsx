type BrandLogoProps = {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
  };
  
  export default function BrandLogo({
    size = "lg",
    showText = true,
    className = "",
  }: BrandLogoProps) {
    const logoSize = {
      sm: "h-26",
      md: "h-34",
      lg: "h-[380px] md:h-[420px]",
    }[size];
  
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
      >
        <img
          src="/assets/logo.png"
          alt="EAM Logo"
          className={`${logoSize} w-auto object-contain`}
        />
  
        {showText && (
          <>
            <h1 className="mt-4 text-3xl font-bold text-[#6B7280] dark:text-white">
              إعمار الأصالة والمعاصرة
            </h1>
  
            <p className="mt-2 text-sm tracking-[0.25em] text-gray-500 dark:text-gray-400">
              EMMAR AL ASALA WA AL MUASARA
            </p>
          </>
        )}
      </div>
    );
  }