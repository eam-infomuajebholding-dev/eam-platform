import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Play, FileText, X, ChevronLeft, MapPin, Calendar, DollarSign, Building2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useContent } from '@/components/ContentProvider';

const statusLabels = {
  available: { label: 'متاح للاستثمار', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  'in-progress': { label: 'قيد التنفيذ', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  completed: { label: 'مكتمل', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
};

export default function Invest() {
  const { content, loading } = useContent();
  const heroReveal = useScrollReveal({ threshold: 0.15 });
  const projectsReveal = useScrollReveal({ threshold: 0.1 });
  const ctaReveal = useScrollReveal({ threshold: 0.15 });

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'in-progress'>('all');

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gold text-xl">جاري التحميل...</div>
        </div>
      </Layout>
    );
  }

  if (!content) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-500 text-xl">خطأ في تحميل المحتوى</div>
        </div>
      </Layout>
    );
  }

  const filteredProjects = filter === 'all' 
    ? content.projects 
    : content.projects.filter((p: any) => p.status === filter);

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
            {content.invest.title}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            {content.invest.description}
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-dark-lighter border-b border-gold/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: `${content.projects.length}+`, label: 'مشروع' },
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
              {filteredProjects.map((project: any, index: number) => (
                <div
                  key={project.id}
                  className="group rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-gold/20 hover:border-gold/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(201,168,76,0.15)] overflow-hidden"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Project Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={project.images[0] || 'https://via.placeholder.com/800x400?text=No+Image'}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs rounded-full border ${statusLabels[project.status as keyof typeof statusLabels]?.color || statusLabels.available.color}`}>
                        {statusLabels[project.status as keyof typeof statusLabels]?.label || 'متاح'}
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
                  {selectedProject.videoUrl ? (
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      <source src={selectedProject.videoUrl} type="video/mp4" />
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  ) : (
                    <p className="text-white/60">لا يوجد فيديو لهذا المشروع</p>
                  )}
                </div>
              ) : (
                <>
                  <img
                    src={selectedProject.images[activeImageIndex] || 'https://via.placeholder.com/800x400?text=No+Image'}
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
                    {selectedProject.images.map((_: any, i: number) => (
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
                <span className={`px-3 py-1 text-xs rounded-full border ${statusLabels[selectedProject.status as keyof typeof statusLabels]?.color || statusLabels.available.color}`}>
                  {statusLabels[selectedProject.status as keyof typeof statusLabels]?.label || 'متاح'}
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
                  <p className="text-xs text-gray-500