import Layout from '@/components/Layout';
import { Calendar, MapPin } from 'lucide-react';

const projects = [
  {
    title: 'برج الأعمال المركزي',
    description: 'برج تجاري مكون من 42 طابقاً يضم مكاتب ومرافق تجارية متعددة الاستخدامات بأحدث التصاميم المعمارية',
    category: 'أبراج تجارية',
    location: 'الرياض',
    year: '2024',
    gradient: 'from-blue-900 to-blue-700',
  },
  {
    title: 'جسر الملك عبدالله',
    description: 'جسر معلق بطول 1.2 كيلومتر يربط بين ضفتي المدينة بتصميم هندسي مبتكر ومتطور',
    category: 'بنية تحتية',
    location: 'جدة',
    year: '2023',
    gradient: 'from-emerald-900 to-emerald-700',
  },
  {
    title: 'مجمع الواحة السكني',
    description: 'مجمع سكني فاخر يضم 200 وحدة سكنية مع مرافق ترفيهية ومساحات خضراء واسعة',
    category: 'مجمعات سكنية',
    location: 'الدمام',
    year: '2024',
    gradient: 'from-amber-900 to-amber-700',
  },
  {
    title: 'مركز الابتكار التقني',
    description: 'مركز تقني متطور يضم مختبرات ومساحات عمل مشتركة بتصميم مستدام وصديق للبيئة',
    category: 'مباني تقنية',
    location: 'الرياض',
    year: '2023',
    gradient: 'from-purple-900 to-purple-700',
  },
];

export default function Projects() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#0c1a36]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">مشاريعنا</h1>
          <p className="text-gray-600 dark:text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            مشاريع تصنع الفارق في عالم الهندسة والبناء
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#132347]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="gold-text text-2xl md:text-3xl font-bold font-playfair">مشاريع تصنع الفارق</h2>
            <button className="text-gold border border-gold/40 px-4 py-2 rounded-lg text-sm font-tajawal hover:bg-gold/10 transition-colors">
              عرض جميع المشاريع
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <div key={i} className="group rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]">
                {/* Image Placeholder */}
                <div className={`h-56 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 right-4">
                    <span className="bg-gold text-dark text-xs font-bold px-3 py-1.5 rounded-full font-tajawal">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-gray-50 dark:bg-white/5">
                  <h3 className="text-gray-800 dark:text-white font-bold text-xl mb-3 font-tajawal group-hover:text-gold-light transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed mb-4 font-tajawal">{project.description}</p>
                  <div className="flex items-center gap-6 text-gray-500 dark:text-white/50 text-xs font-tajawal">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {project.year}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {project.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}