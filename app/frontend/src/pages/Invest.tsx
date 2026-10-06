import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Play, FileText, X, ChevronLeft, MapPin, Calendar, DollarSign, Building2, Plus, Upload, Video, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import PageSection from '@/components/page/PageSection';
import PageSectionHeader from '@/components/page/PageSectionHeader';
import PageStatGrid from '@/components/page/PageStatGrid';
import PageFilterPills from '@/components/page/PageFilterPills';
import PageCtaSection from '@/components/page/PageCtaSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useEditMode } from '@/contexts/EditModeContext';
import { toast } from 'sonner';
import { savePageData, loadPageData } from '@/lib/dataStorage';
import { isCloudinaryConfigured, uploadMultipleToCloudinary } from '@/lib/cloudinary';

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

const defaultProjects: Project[] = [
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

const PROJECTS_STORAGE_KEY = 'invest-projects-data';

const statusColors = {
  available: 'bg-green-500/10 text-green-600 border-green-500/30',
  'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  completed: 'bg-stone-500/10 text-ink-secondary border-stone-500/30',
} as const;

interface AddProjectFormData {
  name: string;
  location: string;
  type: string;
  investmentAmount: string;
  expectedReturn: string;
  duration: string;
  description: string;
  status: 'available' | 'in-progress' | 'completed';
}

const emptyForm: AddProjectFormData = {
  name: '',
  location: '',
  type: '',
  investmentAmount: '',
  expectedReturn: '',
  duration: '',
  description: '',
  status: 'available',
};

function FileUploadField({ label, accept, multiple, onFiles, fileNames }: {
  label: string;
  accept: string;
  multiple?: boolean;
  onFiles: (files: string[], names: string[]) => void;
  fileNames: string[];
}) {
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const names = fileArray.map((f) => f.name);

    if (isCloudinaryConfigured()) {
      // Upload to Cloudinary
      setUploading(true);
      try {
        const urls = await uploadMultipleToCloudinary(fileArray);
        onFiles(urls, names);
        toast.success('تم رفع الملفات بنجاح إلى السحابة');
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        toast.error('فشل الرفع إلى السحابة، جاري الحفظ محلياً...');
        // Fallback to base64
        fallbackToBase64(fileArray, names);
      } finally {
        setUploading(false);
      }
    } else {
      // Fallback to base64 (FileReader)
      fallbackToBase64(fileArray, names);
    }
  };

  const fallbackToBase64 = (fileArray: File[], names: string[]) => {
    const results: string[] = [];
    let loaded = 0;
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        results.push(reader.result as string);
        loaded++;
        if (loaded === fileArray.length) {
          onFiles(results, names);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <label className="block text-sm font-bold text-ink-secondary mb-1">{label}</label>
      <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
        {uploading ? (
          <Loader2 className="w-5 h-5 text-gold animate-spin" />
        ) : (
          <Upload className="w-5 h-5 text-gold" />
        )}
        <span className="text-sm text-ink-muted">
          {uploading ? 'جاري الرفع...' : fileNames.length > 0 ? `تم اختيار ${fileNames.length} ملف` : 'اختر ملف'}
        </span>
        <input type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" disabled={uploading} />
      </label>
      {fileNames.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {fileNames.map((name, i) => (
            <span key={i} className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded">{name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Invest() {
  const { t } = useLanguage();
  const statusLabels = {
    available: { label: t('page.invest.status.available'), color: statusColors.available },
    'in-progress': { label: t('page.invest.status.inProgress'), color: statusColors['in-progress'] },
    completed: { label: t('page.invest.status.completed'), color: statusColors.completed },
  };
  const projectsReveal = useScrollReveal({ threshold: 0.1 });
  const { isEditMode } = useEditMode();

  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'in-progress'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<AddProjectFormData>(emptyForm);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formImageNames, setFormImageNames] = useState<string[]>([]);
  const [formVideoData, setFormVideoData] = useState<string>('');
  const [formVideoName, setFormVideoName] = useState<string>('');
  const [formPdfData, setFormPdfData] = useState<string>('');
  const [formPdfName, setFormPdfName] = useState<string>('');

  useEffect(() => {
    loadPageData<Project[]>(PROJECTS_STORAGE_KEY).then(data => {
      if (data) setProjects(data);
    });
  }, []);

  useEffect(() => {
    savePageData(PROJECTS_STORAGE_KEY, projects);
  }, [projects]);

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter);

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('تم حذف المشروع بنجاح');
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Date.now(),
      name: formData.name,
      location: formData.location,
      type: formData.type,
      investmentAmount: formData.investmentAmount,
      expectedReturn: formData.expectedReturn,
      duration: formData.duration,
      description: formData.description,
      videoUrl: formVideoData,
      images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
      pdfUrl: formPdfData,
      status: formData.status,
    };
    setProjects(prev => [...prev, newProject]);
    setFormData(emptyForm);
    setFormImages([]);
    setFormImageNames([]);
    setFormVideoData('');
    setFormVideoName('');
    setFormPdfData('');
    setFormPdfName('');
    setShowAddModal(false);
    toast.success('تم إضافة المشروع بنجاح');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <PageHero
        titleKey="page.invest.hero.title"
        subtitleKey="page.invest.hero.subtitle"
        titleEditableId="invest-hero-title"
        subtitleEditableId="invest-hero-subtitle"
      />

      <PageSection variant="muted" className="py-10 md:py-14" sectionId="stats" sectionLabel="إحصائيات">
        <PageStatGrid
          columns={4}
          stats={[
            { value: '15+', labelKey: 'page.invest.stats.projects' },
            { value: '200M+', labelKey: 'page.invest.stats.volume' },
            { value: '20%', labelKey: 'page.invest.stats.return' },
            { value: '50+', labelKey: 'page.invest.stats.partners' },
          ]}
        />
      </PageSection>

      <PageSection variant="alt" withGlow sectionId="projects" sectionLabel="فرص الاستثمار">
          <div
            ref={projectsReveal.ref}
            className={`${projectsReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
          >
            <PageSectionHeader
              titleKey="page.invest.section.title"
              subtitleKey="page.invest.section.desc"
            />
            <PageFilterPills
              options={[
                { key: 'all', labelKey: 'page.invest.filter.all' },
                { key: 'available', labelKey: 'page.invest.filter.available' },
                { key: 'in-progress', labelKey: 'page.invest.filter.inProgress' },
              ]}
              active={filter}
              onChange={(key) => setFilter(key)}
              className="mb-10"
            />

            {/* Add Project Button (Edit Mode) */}
            {isEditMode && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gold text-dark font-bold rounded-xl hover:shadow-gold-sm transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  {t('page.invest.addProject')}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="group relative rounded-2xl bg-cream-light dark:bg-surface backdrop-blur-md border border-gold/20 hover:border-gold/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-gold-card overflow-hidden"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Delete Button (Edit Mode) */}
                  {isEditMode && (
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      title="حذف المشروع"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

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
                      <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
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
                        <span className="text-ink-muted">{project.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gold" />
                        <span className="text-ink-muted">{project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gold" />
                        <span className="text-ink-muted">{project.investmentAmount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-gold" />
                        <span className="text-gold font-bold">{project.expectedReturn}</span>
                      </div>
                    </div>

                    <p className="text-ink-muted text-sm leading-relaxed mb-6 line-clamp-2">
                      {project.description}
                    </p>

                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveImageIndex(0);
                        setShowVideo(false);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold rounded-xl hover:shadow-gold-sm transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {t('page.invest.viewDetails')}
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </PageSection>

      <PageCtaSection
        titleKey="page.invest.cta.title"
        descKey="page.invest.cta.desc"
        buttonKey="common.contactUs"
        buttonTo="/contact"
      />

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-surface rounded-2xl border border-gold/30 shadow-2xl shadow-gold/10">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-72 overflow-hidden">
              {showVideo ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <video controls autoPlay className="w-full h-full object-contain">
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
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gold/90 text-dark flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-gold/50"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </button>
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

            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs rounded-full border ${statusLabels[selectedProject.status].color}`}>
                  {statusLabels[selectedProject.status].label}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-gold/10 text-gold border border-gold/20">
                  {selectedProject.type}
                </span>
              </div>

              <h2 className="text-3xl font-bold gold-text mb-4">{selectedProject.name}</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-surface-alt dark:bg-surface border border-gold/10">
                  <MapPin className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-ink-muted mb-1">الموقع</p>
                  <p className="text-sm font-bold text-ink">{selectedProject.location}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-alt dark:bg-surface border border-gold/10">
                  <DollarSign className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-ink-muted mb-1">مبلغ الاستثمار</p>
                  <p className="text-sm font-bold text-ink">{selectedProject.investmentAmount}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-alt dark:bg-surface border border-gold/10">
                  <TrendingUp className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-ink-muted mb-1">العائد المتوقع</p>
                  <p className="text-sm font-bold text-gold">{selectedProject.expectedReturn}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-alt dark:bg-surface border border-gold/10">
                  <Calendar className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-ink-muted mb-1">مدة المشروع</p>
                  <p className="text-sm font-bold text-ink">{selectedProject.duration}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gold mb-3">وصف المشروع</h3>
                <p className="text-ink-muted leading-relaxed">{selectedProject.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gold mb-3">معرض الصور</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedProject.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveImageIndex(i); setShowVideo(false); }}
                      className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        i === activeImageIndex ? 'border-gold shadow-lg shadow-gold/20' : 'border-transparent hover:border-gold/50'
                      }`}
                    >
                      <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={selectedProject.pdfUrl}
                  download
                  className="flex-1 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold rounded-xl hover:shadow-gold-sm transition-all duration-300 flex items-center justify-center gap-2"
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

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-surface rounded-2xl border border-gold/30 shadow-2xl p-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-surface-alt dark:bg-white/10 text-ink-secondary dark:text-white flex items-center justify-center hover:bg-gold-100 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold gold-text mb-6">إضافة مشروع جديد</h2>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">اسم المشروع *</label>
                <input
                  type="text" name="name" required value={formData.name} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                  placeholder="مثال: مجمع إعمار السكني"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">الموقع *</label>
                  <input
                    type="text" name="location" required value={formData.location} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                    placeholder="مثال: الرياض - حي النرجس"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">نوع المشروع *</label>
                  <input
                    type="text" name="type" required value={formData.type} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                    placeholder="مثال: سكني، تجاري، صناعي"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">مبلغ الاستثمار *</label>
                  <input
                    type="text" name="investmentAmount" required value={formData.investmentAmount} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                    placeholder="مثال: 5,000,000 ريال"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">العائد المتوقع *</label>
                  <input
                    type="text" name="expectedReturn" required value={formData.expectedReturn} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                    placeholder="مثال: 18% سنوياً"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">مدة المشروع *</label>
                  <input
                    type="text" name="duration" required value={formData.duration} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                    placeholder="مثال: 24 شهر"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">حالة المشروع</label>
                  <select
                    name="status" value={formData.status} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                  >
                    <option value="available">متاح للاستثمار</option>
                    <option value="in-progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">وصف المشروع *</label>
                <textarea
                  name="description" required rows={4} value={formData.description} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none resize-none"
                  placeholder="اكتب وصفاً تفصيلياً للمشروع..."
                />
              </div>

              {/* File Uploads */}
              <FileUploadField
                label="صور المشروع (يمكن اختيار عدة صور)"
                accept="image/*"
                multiple
                onFiles={(files, names) => { setFormImages(files); setFormImageNames(names); }}
                fileNames={formImageNames}
              />

              <FileUploadField
                label="فيديو المشروع"
                accept="video/*"
                onFiles={(files, names) => { setFormVideoData(files[0] || ''); setFormVideoName(names[0] || ''); }}
                fileNames={formVideoName ? [formVideoName] : []}
              />

              <FileUploadField
                label="ملف PDF (تفاصيل المشروع)"
                accept=".pdf"
                onFiles={(files, names) => { setFormPdfData(files[0] || ''); setFormPdfName(names[0] || ''); }}
                fileNames={formPdfName ? [formPdfName] : []}
              />

              {/* Image Previews */}
              {formImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {formImages.map((img, i) => (
                    <img key={i} src={img} alt={`preview ${i}`} className="w-full h-16 rounded-lg object-cover border border-gold/20" />
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold text-lg rounded-xl hover:shadow-gold-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة المشروع
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}