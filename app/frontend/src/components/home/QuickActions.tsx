import { useEffect, useRef } from "react";
import { BUILD_VILLA_QUICK_ACTION_LABEL } from "@/ai/types";

const suggestions = [
  BUILD_VILLA_QUICK_ACTION_LABEL,
  "أحتاج خدمة هندسية",
  "أحتاج خدمة حكومية",
  "أبحث عن استثمار",
  "أمثل شركة أو جهة",
  "مواد بناء أو أثاث 🛒",
];

interface QuickActionsProps {
  onSelect?: (label: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let x = 0;
    let frame = 0;

    const animate = () => {
      x += 0.5;

      const width = track.scrollWidth / 2;

      if (x >= width) {
        x = 0;
      }

      track.style.transform = `translateX(${x}px)`;

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="mt-4 overflow-hidden">
      <div ref={trackRef} className="flex w-max gap-4">
        {[...suggestions, ...suggestions].map((item, index) => (
          <button
            key={`${item}-${index}`}
            type="button"
            onClick={() => onSelect?.(item)}
            className="
              mx-2
              whitespace-nowrap
              rounded-full
              border
              border-[#d7c08a]
              bg-white
              px-5
              py-3
              text-sm
              font-medium
              text-[#1A2340]
              shadow-sm
              transition-all
              duration-200
              hover:border-[#B9923F]
              hover:text-[#B9923F]
              hover:shadow-md
              dark:border-white/10
              dark:bg-dark
              dark:text-white
              dark:hover:border-gold
              dark:hover:text-gold
            "
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
