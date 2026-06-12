import Layout from '@/components/Layout';
import { ShoppingBag, Clock } from 'lucide-react';

export default function Market() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#5E5E5E]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">سوقنا</h1>
          <p className="text-gray-600 dark:text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            سوق المنتجات والخدمات الهندسية
          </p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-24 md:py-36 bg-white dark:bg-[#6B6B6B]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gold/10 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gold" />
            </div>
            <h2 className="gold-text text-3xl md:text-4xl font-bold font-playfair mb-6">قريباً</h2>
            <p className="text-gray-600 dark:text-white/65 text-lg leading-relaxed font-tajawal mb-8">
              نعمل حالياً على تطوير سوق إلكتروني متكامل للمنتجات والخدمات الهندسية.
              سيتيح لكم السوق الوصول إلى مجموعة واسعة من المواد والأدوات والخدمات الهندسية المتخصصة.
            </p>
            <div className="flex items-center justify-center gap-2 text-gold/70 text-sm font-tajawal">
              <Clock className="w-4 h-4" />
              <span>سيتم الإطلاق قريباً - ترقبونا</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}