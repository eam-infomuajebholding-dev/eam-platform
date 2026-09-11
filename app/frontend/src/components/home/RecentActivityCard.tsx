import { CheckCircle2, Clock3, FileText, LayoutGrid, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Static presentation data — not live backend events */
const ACTIVITIES = [
  { text: 'تم إنشاء طلب استشارة جديد', time: 'منذ 5 دقائق', icon: FileText },
  { text: 'اكتمال مرحلة التصميم — مشروع الرياض', time: 'منذ 42 دقيقة', icon: CheckCircle2 },
  { text: 'طلب مواد بناء قيد المراجعة', time: 'منذ ساعتين', icon: Clock3 },
  { text: 'تحديث حالة مشروع جدة', time: 'منذ 4 ساعات', icon: CheckCircle2 },
  { text: 'تسجيل مستثمر جديد على المنصة', time: 'منذ 6 ساعات', icon: Bell },
  { text: 'مراجعة عرض مقاولات — الدمام', time: 'منذ 8 ساعات', icon: FileText },
  { text: 'اعتماد مخططات مشروع الخبر', time: 'منذ 10 ساعات', icon: LayoutGrid },
];

export default function RecentActivityCard() {
  return (
    <section
      className="eam-panel flex h-auto flex-col overflow-hidden lg:h-[228px] lg:shrink-0"
      aria-label="آخر الأنشطة"
    >
      <div className="flex h-[30px] shrink-0 items-center border-b border-[var(--eam-home-border)] px-3">
        <h2 className="font-tajawal text-[14px] font-bold text-[var(--eam-home-ink)]">آخر الأنشطة</h2>
      </div>

      <ul className="flex-1 space-y-0 overflow-hidden px-2.5 py-0.5">
        {ACTIVITIES.map((item) => (
          <li
            key={item.text}
            className="flex h-[22px] items-center gap-1.5 rounded-[8px] border border-[var(--eam-home-border)]/50 bg-[var(--eam-home-cream-light)]/80 px-1.5"
          >
            <item.icon size={11} className="shrink-0 text-[var(--eam-home-gold)]" strokeWidth={1.75} />
            <div className="min-w-0 flex-1 leading-none">
              <p className="truncate text-[9px] font-medium text-[var(--eam-home-ink)]">{item.text}</p>
              <p className="text-[8px] text-[var(--eam-home-ink)]/50">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex h-[30px] shrink-0 items-center justify-center border-t border-[var(--eam-home-border)]">
        <Link
          to="/projects"
          className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--eam-home-gold-deep)] hover:underline"
        >
          <LayoutGrid size={11} className="text-[var(--eam-home-gold)]" />
          عرض جميع الأنشطة
        </Link>
      </div>
    </section>
  );
}
