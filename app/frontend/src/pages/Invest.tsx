import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Play, FileText, X, ChevronLeft, MapPin, Calendar, DollarSign, Building2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface Project {
  id: number;
  name: string;
  location: string;
  type: string;
  investmentAmount: string;
  expectedReturn: string;
  duration: string;
  description: string;
  videoUrl: string;
  images: string[];
  pdfUrl: string;
  status: 'available' | 'in-progress' | 'completed';
}

const projects: Project[] = [
  {
    id: 1,
    name: 'مجمع إعمار السكني',
    location: 'الرياض - حي النرجس',
    type: 'سكني',
    investmentAmount: '5,000,000 ريال',
    expectedReturn: '18% سنوياً',
    duration: '24 شهر',
    description: 'مجمع سكني فاخر يتكون من 50 فيلا و120 شقة، بتصميم عصري يلبي احتياجات العائلات. يقع في موقع استراتيجي قريب من الخدمات الأساسية.',
    videoUrl: '/projects/video1.mp4',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    pdfUrl: '/projects/project1-details.pdf',
    status: 'available',
  },
  {
    id: 2,
    name: 'برج إعمار التجاري',
    location: 'جدة - حي الروضة',
    type: 'تجاري',
    investmentAmount: '12,000,000 ريال',
    expectedReturn: '22% سنوياً',
    duration: '36 شهر',
    description: 'برج تجاري متكامل يتكون من 15 طابقاً، يضم مكاتب إدارية ومحلات تجارية ومرافق ترفيهية. موقع مميز في قلب النشاط التجاري.',
    videoUrl: '/projects/video2.mp4',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    pdfUrl: '/projects/project2-details.pdf',
    status: 'available',
  },
  {
    id: 3,
    name: 'منتجع إعمار السياحي',
    location: 'الخبر - كورنيش الخبر',
    type: 'سياحي',
    investmentAmount: '8,500,000 ريال',
    expectedReturn: '20% سنوياً',
    duration: '30 شهر',
    description: 'منتجع سياحي فاخر على الواجهة البحرية يضم 80 غرفة فندقية و5 فيلات خاصة ومطاعم ومرافق ترفيهية متكاملة.',
    videoUrl: '/projects/video3.mp4',
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    ],
    pdfUrl: '/projects/project3-details.pdf',
    status: 'in-progress',
  },
  {
    id: 4,
    name: 'مجمع إعمار الصناعي',
    location: 'الدمام - المدينة الصناعية الثانية',
    type: 'صناعي',
    investmentAmount: '15,000,000 ريال',
    expectedReturn: '25% سنوياً',
    duration: '48 شهر',
    description: 'مجمع صناعي متكامل يضم 20 مصنعاً و10 مستودعات ومرافق لوجستية. يقع في المنطقة الصناعية الواعدة بالدمام.',
    videoUrl: '/projects/video4.mp4',
    images: [
      'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    ],
    pdfUrl: '/projects/project4-details.pdf',
    status: 'available',
  },
];

const statusLabels = {
  available: { label: 'متاح للاستثمار', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  'in-progress': { label: 'قيد التنفيذ', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  completed: { label: 'مكتمل', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
};

export default function Invest() {
  const heroReveal = useScrollReveal({ threshold: 0.15 });
  const projectsReveal = useScrollReveal({ threshold: 0.1 });
  const ctaReveal = useScrollReveal({ threshold: 0.15 });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'in-progress'>('all');

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.15)_0%,transparent_70%)]" />
        <div
          ref={heroReveal.ref}
          className={`relative z-10 px-4 text-center ${heroReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-gold" />
          </div>
          <h1 className="font-tajawal text-4xl md:text-5xl font-bold gold-text mb-4">
            استثمر معنا
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            فرص استثمارية واعدة في مشاريع عقارية متنوعة. انضم إلينا وكن شريكاً في بناء المستقبل
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-dark-lighter border-b border-gold/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: '15+', label: 'مشروع منجز' },
              { number: '200M+', label: 'حجم الاستثمارات' },
              { number: '20%', label: 'متوسط العائد' },
              { number: '50+', label: 'شريك نجاح' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4">
                <p className="font-tajawal text-3xl md:text-4xl font-bold gold-text mb-2">{stat.number}</p>
                <p className="text-sm text-gray-500 dark:text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div
            ref={projectsReveal.ref}
            className={`${projectsReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
          >
            <div className="text-center mb-12">
              <h2 className="font-tajawal text-3xl md:text-4xl font-bold gold-text mb-4">
                المشاريع المتاحة
              </h2>
              <p className="text-gray-600 dark:text-white/60 max-w-xl mx-auto mb-8">
                اختر المشروع المناسب لك وتواصل معنا للحصول على تفاصيل أكثر
              </p>

              {/* Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { key: 'all', label: 'الكل' },
                  { key: 'available', label: 'متاح للاستثمار' },
                  { key: 'in-progress', label: 'قيد التنفيذ' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as any)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                      filter === f.key
                        ? 'bg-gold text-dark shadow-lg shadow-gold/30'
                        : 'bg-white dark:bg-white/5 border border-gold/20 text-gray-600 dark:text-white/60 hover:border-gold/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="group rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-gold/20 hover:border-gold/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(201,168,76,0.15)] overflow-hidden"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Project Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={project.images[0]}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs rounded-full border ${statusLabels[project.status].color}`}>
                        {statusLabels[project.status].label}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 left-4">
                      <h3 className="font-tajawal text-xl font-bold text-white mb-1">{project.name}</h3>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-gold" />
                        <span className="text-gray-600 dark:text-white/60">{project.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gold" />
                        <span className="text-gray-600 dark:text-white/60">{project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gold" />
                        <span className="text-gray-600 dark:text-white/60">{project.investmentAmount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-gold" />
                        <span className="text-gold font-bold">{project.expectedReturn}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed mb-6 line-clamp-2">
                      {project.description}
                    </p>

                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveImageIndex(0);
                        setShowVideo(false);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      عرض التفاصيل
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-dark-lighter relative">
        <div
          ref={ctaReveal.ref}
          className={`container mx-auto px-4 text-center ${ctaReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <h2 className="font-tajawal text-3xl md:text-4xl font-bold gold-text mb-6">
            هل لديك مشروع تريد عرضه للاستثمار؟
          </h2>
          <p className="text-gray-600 dark:text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            نرحب بشركاء النجاح. إذا كان لديك مشروع عقاري وترغب في عرضه للاستثمار، تواصل معنا وسنساعدك في تحقيق أهدافك
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold text-lg rounded-lg hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-105"
          >
            تواصل معنا
          </Link>
        </div>
      </section>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-lighter rounded-2xl border border-gold/30 shadow-2xl shadow-gold/10">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Project Header */}
            <div className="relative h-72 overflow-hidden">
              {showVideo ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    <source src={selectedProject.videoUrl} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                </div>
              ) : (
                <>
                  <img
                    src={selectedProject.images[activeImageIndex]}
                    alt={selectedProject.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play Video Button */}
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gold/90 text-dark flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-gold/50"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </button>

                  {/* Image Navigation */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedProject.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          i === activeImageIndex ? 'bg-gold w-8' : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Project Info */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs rounded-full border ${statusLabels[selectedProject.status].color}`}>
                  {statusLabels[selectedProject.status].label}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-gold/10 text-gold border border-gold/20">
                  {selectedProject.type}
                </span>
              </div>

              <h2 className="font-tajawal text-3xl font-bold gold-text mb-4">{selectedProject.name}</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gold/10">
                  <MapPin className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">الموقع</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedProject.location}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gold/10">
                  <DollarSign className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">مبلغ الاستثمار</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedProject.investmentAmount}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gold/10">
                  <TrendingUp className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">العائد المتوقع</p>
                  <p className="text-sm font-bold text-gold">{selectedProject.expectedReturn}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gold/10">
                  <Calendar className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">مدة المشروع</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedProject.duration}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-tajawal text-xl font-bold text-gold mb-3">وصف المشروع</h3>
                <p className="text-gray-600 dark:text-white/60 leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Image Gallery */}
              <div className="mb-6">
                <h3 className="font-tajawal text-xl font-bold text-gold mb-3">معرض الصور</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedProject.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveImageIndex(i);
                        setShowVideo(false);
                      }}
                      className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        i === activeImageIndex ? 'border-gold shadow-lg shadow-gold/20' : 'border-transparent hover:border-gold/50'
                      }`}
                    >
                      <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Download */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={selectedProject.pdfUrl}
                  download
                  className="flex-1 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  تحميل ملف تفاصيل المشروع (PDF)
                </a>
                <Link
                  to="/contact"
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 py-4 border-2 border-gold text-gold font-bold rounded-xl hover:bg-gold/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  تواصل معنا للاستثمار
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}