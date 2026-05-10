import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  Ruler, Building2, Layers, Zap, Wind, Cpu, Box, Home, RotateCcw,
  FileSearch, PenTool, HardHat, FlaskConical, MapPin, TrendingUp, Calculator,
  FileText, Map, Key, Scissors, AlertTriangle, CheckCircle, Plus, ShieldCheck, Building, ClipboardCheck,
} from 'lucide-react';

const engineeringServices = [
  { icon: Ruler, name: 'تصميم مخططات حسب الكود السعودي الجديد' },
  { icon: Building2, name: 'مخططات معمارية معتمدة' },
  { icon: Layers, name: 'مخططات انشائية + نوته حسابية' },
  { icon: Zap, name: 'مخططات كهربائية متكاملة' },
  { icon: Wind, name: 'مخططات ميكانيكية متكاملة' },
  { icon: Cpu, name: 'مخططات النظام الذكي' },
  { icon: Box, name: 'مناظير خارجية 3D Exterior' },
  { icon: Home, name: 'مناظير داخلية 3D Interior' },
  { icon: RotateCcw, name: 'مناظير 360 درجة' },
  { icon: FileSearch, name: 'مراجعة / دراسة / تعديل مخططات' },
  { icon: PenTool, name: 'معماري / انشائي مع نوتة حسابية' },
  { icon: HardHat, name: 'إشراف هندسي / عظم / تشطيب' },
  { icon: FlaskConical, name: 'اختبار تربة' },
  { icon: MapPin, name: 'رفع مساحي' },
  { icon: TrendingUp, name: 'دراسة جدوى' },
  { icon: Calculator, name: 'حساب كميات' },
];

const governmentServices = [
  { icon: FileText, name: 'تحديث صكوك وما يعادله' },
  { icon: Map, name: 'إصدار كروكيات "إرشادي - تنظيمي"' },
  { icon: Key, name: 'رخص البناء (سكني / تجاري / إداري)' },
  { icon: Scissors, name: 'الفرز العقاري والدمج العقاري' },
  { icon: Building, name: 'رخص هدم / ترميم' },
  { icon: AlertTriangle, name: 'تصحيح أوضاع المخالفات' },
  { icon: CheckCircle, name: 'شهادات الإشغال' },
  { icon: Plus, name: 'إضافة الرخص القديمة' },
  { icon: ShieldCheck, name: 'طلبات رفع الحضر' },
  { icon: Building2, name: 'إصدار رخص السكن الجماعي' },
  { icon: ClipboardCheck, name: 'إصدار التأمين للمباني' },
];

function ServiceCard({ icon: Icon, name }: { icon: React.ElementType; name: string }) {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-gold/10 rounded-xl p-5 border-r-4 border-r-gold/50 transition-all duration-300 hover:scale-[1.02] hover:border-gold/30 hover:shadow-[0_0_20px_rgba(201,168,76,0.12)]">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
          <Icon className="w-5 h-5 text-gold" />
        </div>
        <h3 className="text-white font-bold font-tajawal text-sm md:text-base leading-relaxed group-hover:text-gold-light transition-colors">
          {name}
        </h3>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-dark-lighter">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">خدماتنا</h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            حلول هندسية وحكومية متكاملة تحت سقف واحد
          </p>
        </div>
      </section>

      {/* Engineering Services */}
      <section className="py-16 md:py-20 bg-dark">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="gold-text text-2xl md:text-3xl font-bold font-playfair">الخدمات الهندسية</h2>
            <Link to="/engineering-services" className="text-gold text-sm hover:underline font-tajawal">عرض التفاصيل ←</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {engineeringServices.map((s, i) => <ServiceCard key={i} icon={s.icon} name={s.name} />)}
          </div>
        </div>
      </section>

      {/* Government Services */}
      <section className="py-16 md:py-20 bg-dark-lighter">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="gold-text text-2xl md:text-3xl font-bold font-playfair">الخدمات الحكومية</h2>
            <Link to="/government-services" className="text-gold text-sm hover:underline font-tajawal">عرض التفاصيل ←</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {governmentServices.map((s, i) => <ServiceCard key={i} icon={s.icon} name={s.name} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="gold-text text-3xl md:text-4xl font-bold font-playfair mb-6">هل تحتاج إلى خدماتنا؟</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto font-tajawal">تواصل معنا اليوم للحصول على استشارة مجانية</p>
          <Link to="/consultation" className="inline-block px-8 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold font-tajawal rounded-lg text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:scale-105">
            طلب استشارة
          </Link>
        </div>
      </section>
    </Layout>
  );
}