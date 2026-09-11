interface Props {
  current: number;
  total: number;
  variant?: 'bar' | 'text';
}

export default function JourneyProgress({ current, total, variant = 'text' }: Props) {
  const clamped = Math.min(Math.max(current, 0), total);

  if (variant === 'bar') {
    return (
      <div className="mb-4 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gold transition-all"
          style={{ width: `${total > 0 ? (clamped / total) * 100 : 0}%` }}
        />
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center justify-between text-sm font-tajawal text-gray-600 dark:text-white/70">
      <span>
        التقدم: {clamped} / {total}
      </span>
    </div>
  );
}
