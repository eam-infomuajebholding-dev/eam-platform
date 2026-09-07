import { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
}

export default function SectionTitle({
  children,
  className = "",
}: SectionTitleProps) {
  return (
    <h2
      className={`mb-10 text-center font-tajawal text-4xl font-bold text-[#2F3645] md:text-5xl ${className}`}
    >
      {children}
    </h2>
  );
}