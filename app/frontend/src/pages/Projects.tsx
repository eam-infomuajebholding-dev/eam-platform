import { useMemo, useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, X, FileText, Building2, Video, Play, Image, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import ProjectPortfolioCard, {
  GRADIENT_VARIANTS,
  statusMessageKey,
  statusToneClass,
} from '@/components/projects/ProjectPortfolioCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { toast } from 'sonner';
import { savePageData, loadPageData } from '@/lib/dataStorage';
import { isCloudinaryConfigured, uploadToCloudinary, uploadMultipleToCloudinary } from '@/lib/cloudinary';
import type { MessageKey } from '@/i18n/messages';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  year: string;
  image: string;
  images: string[];
  videoData: string;
  videoName: string;
  pdfData: string;
  pdfName: string;
  status: 'active' | 'completed' | 'upcoming';
}

const defaultProjects: Project[] = [
  {
    id: 1,
    title: 'برج الأعمال المركزي',
    description: 'برج تجاري مكون من 42 طابقاً يضم مكاتب ومرافق تجارية متعددة الاستخدامات بأحدث التصاميم المعمارية',
    category: 'أبراج تجارية',
    location: 'الرياض',
    year: '2024',
    image: '',
    images: [],
    videoData: '',
    videoName: '',
    pdfData: '',
    pdfName: '',
    status: 'active',
  },
  {
    id: 2,
    title: 'جسر الملك عبدالله',
    description: 'جسر معلق بطول 1.2 كيلومتر يربط بين ضفتي المدينة بتصميم هندسي مبتكر ومتطور',
    category: 'بنية تحتية',
    location: 'جدة',
    year: '2023',
    image: '',
    images: [],
    videoData: '',
    videoName: '',
    pdfData: '',
    pdfName: '',
    status: 'completed',
  },
  {
    id: 3,
    title: 'مجمع الواحة السكني',
    description: 'مجمع سكني فاخر يضم 200 وحدة سكنية مع مرافق ترفيهية ومساحات خضراء واسعة',
    category: 'مجمعات سكنية',
    location: 'الدمام',
    year: '2024',
    image: '',
    images: [],
    videoData: '',
    videoName: '',
    pdfData: '',
    pdfName: '',
    status: 'active',
  },
  {
    id: 4,
    title: 'مركز الابتكار التقني',
    description: 'مركز تقني متطور يضم مختبرات ومساحات عمل مشتركة بتصميم مستدام وصديق للبيئة',
    category: 'مباني تقنية',
    location: 'الرياض',
    year: '2023',
    image: '',
    images: [],
    videoData: '',
    videoName: '',
    pdfData: '',
    pdfName: '',
    status: 'upcoming',
  },
];

const PROJECTS_STORAGE_KEY = 'projects-page-data';

type ProjectFilter = 'all' | 'active' | 'completed' | 'upcoming';

const FILTER_OPTIONS: { id: ProjectFilter; labelKey: MessageKey }[] = [
  { id: 'all', labelKey: 'page.projects.filter.all' },
  { id: 'active', labelKey: 'page.projects.filter.active' },
  { id: 'completed', labelKey: 'page.projects.filter.completed' },
  { id: 'upcoming', labelKey: 'page.projects.filter.upcoming' },
];

function getCardLayout(
  index: number,
  total: number,
): { variant: 'featured' | 'standard' | 'wide'; className: string } {
  if (total <= 1) {
    return { variant: 'featured', className: 'lg:col-span-12' };
  }
  if (index === 0) {
    return { variant: 'featured', className: 'lg:col-span-7 lg:row-span-2' };
  }
  if (index === total - 1 && total >= 3) {
    return { variant: 'wide', className: 'lg:col-span-12' };
  }
  return { variant: 'standard', className: 'lg:col-span-5' };
}

interface AddProjectFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  year: string;
  status: 'active' | 'completed' | 'upcoming';
}

const emptyForm: AddProjectFormData = {
  title: '',
  description: '',
  category: '',
  location: '',
  year: '',
  status: 'active',
};

export default function Projects() {
  const { t, direction } = useLanguage();
  const { isEditMode } = useEditMode();
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [statusFilter, setStatusFilter] = useState<ProjectFilter>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<AddProjectFormData>(emptyForm);
  const [formImage, setFormImage] = useState<string>('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formImageNames, setFormImageNames] = useState<string[]>([]);
  const [formVideoData, setFormVideoData] = useState<string>('');
  const [formVideoName, setFormVideoName] = useState<string>('');
  const [formPdfData, setFormPdfData] = useState<string>('');
  const [formPdfName, setFormPdfName] = useState<string>('');
  const [showProjectVideo, setShowProjectVideo] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    loadPageData<Project[]>(PROJECTS_STORAGE_KEY).then(data => {
      if (data) setProjects(data);
    });
  }, []);

  useEffect(() => {
    savePageData(PROJECTS_STORAGE_KEY, projects);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const portfolioStats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      cities: new Set(projects.map((p) => p.location.trim()).filter(Boolean)).size,
    }),
    [projects],
  );

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm(t('page.projects.deleteConfirm'))) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success(t('page.projects.deleteSuccess'));
    }
  };

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const names = fileArray.map((f) => f.name);

    if (isCloudinaryConfigured()) {
      setUploadingImages(true);
      try {
        const urls = await uploadMultipleToCloudinary(fileArray);
        setFormImages(urls);
        setFormImageNames(names);
        setFormImage(urls[0] || '');
        toast.success('تم رفع الصور بنجاح إلى السحابة');
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        toast.error('فشل الرفع إلى السحابة، جاري الحفظ محلياً...');
        fallbackImageUpload(fileArray, names);
      } finally {
        setUploadingImages(false);
      }
    } else {
      fallbackImageUpload(fileArray, names);
    }
  };

  const fallbackImageUpload = (fileArray: File[], names: string[]) => {
    const results: string[] = [];
    let loaded = 0;
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        results.push(reader.result as string);
        loaded++;
        if (loaded === fileArray.length) {
          setFormImages(results);
          setFormImageNames(names);
          setFormImage(results[0] || '');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isCloudinaryConfigured()) {
      setUploadingVideo(true);
      try {
        const url = await uploadToCloudinary(file);
        setFormVideoData(url);
        setFormVideoName(file.name);
        toast.success('تم رفع الفيديو بنجاح إلى السحابة');
      } catch (err) {
        console.error('Cloudinary video upload error:', err);
        toast.error('فشل الرفع إلى السحابة، جاري الحفظ محلياً...');
        fallbackSingleUpload(file, setFormVideoData, setFormVideoName);
      } finally {
        setUploadingVideo(false);
      }
    } else {
      fallbackSingleUpload(file, setFormVideoData, setFormVideoName);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isCloudinaryConfigured()) {
      setUploadingPdf(true);
      try {
        const url = await uploadToCloudinary(file);
        setFormPdfData(url);
        setFormPdfName(file.name);
        toast.success('تم رفع الملف بنجاح إلى السحابة');
      } catch (err) {
        console.error('Cloudinary PDF upload error:', err);
        toast.error('فشل الرفع إلى السحابة، جاري الحفظ محلياً...');
        fallbackSingleUpload(file, setFormPdfData, setFormPdfName);
      } finally {
        setUploadingPdf(false);
      }
    } else {
      fallbackSingleUpload(file, setFormPdfData, setFormPdfName);
    }
  };

  const fallbackSingleUpload = (
    file: File,
    setData: (val: string) => void,
    setName: (val: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      setData(reader.result as string);
      setName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      year: formData.year,
      image: formImage || (formImages[0] || ''),
      images: formImages,
      videoData: formVideoData,
      videoName: formVideoName,
      pdfData: formPdfData,
      pdfName: formPdfName,
      status: formData.status,
    };
    setProjects(prev => [...prev, newProject]);
    setFormData(emptyForm);
    setFormImage('');
    setFormImages([]);
    setFormImageNames([]);
    setFormVideoData('');
    setFormVideoName('');
    setFormPdfData('');
    setFormPdfName('');
    setShowAddModal(false);
    toast.success(t('page.projects.addSuccess'));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <PageHero
        titleKey="page.projects.hero.title"
        subtitleKey="page.projects.hero.subtitle"
      />

      <section className="relative overflow-hidden bg-cream py-16 dark:bg-background md:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_srgb,var(--gold-400)_10%,transparent),transparent)]"
          aria-hidden="true"
        />

        <div className="container relative mx-auto px-4">
          <div className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className={direction === 'rtl' ? 'lg:col-span-7 text-right' : 'lg:col-span-7 text-left'}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                {t('page.projects.eyebrow')}
              </p>
              <h2 className="font-display text-display-md text-ink">{t('page.projects.section.title')}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-ink-secondary md:text-base">
                {t('page.projects.disclaimer')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:col-span-5">
              {[
                { value: portfolioStats.total, labelKey: 'page.projects.statTotal' as const },
                { value: portfolioStats.active, labelKey: 'page.projects.statActive' as const },
                { value: portfolioStats.cities, labelKey: 'page.projects.statCities' as const },
              ].map((stat) => (
                <div
                  key={stat.labelKey}
                  className="rounded-2xl border border-soft-border/80 bg-cream-light px-3 py-4 text-center shadow-sm dark:bg-surface"
                >
                  <p className="font-display text-2xl font-semibold tabular-nums text-gold-600 md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium leading-snug text-ink-muted sm:text-xs">
                    {t(stat.labelKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStatusFilter(option.id)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    statusFilter === option.id
                      ? 'border-gold bg-gold text-[#2B2118] shadow-gold-sm'
                      : 'border-soft-border/80 bg-cream-light text-ink-secondary hover:border-gold/50 dark:bg-surface'
                  }`}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>

            {isEditMode ? (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold bg-gold px-5 py-2.5 text-sm font-semibold text-[#2B2118] shadow-gold-sm transition hover:shadow-gold"
              >
                <Plus className="h-4 w-4" />
                {t('page.projects.addProject')}
              </button>
            ) : null}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-soft-border/80 bg-cream-light px-6 py-16 text-center dark:bg-surface">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-ink-subtle" strokeWidth={1.25} />
              <p className="text-ink-secondary">{t('page.projects.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
              {filteredProjects.map((project, i) => {
                const layout = getCardLayout(i, filteredProjects.length);
                return (
                  <ProjectPortfolioCard
                    key={project.id}
                    project={project}
                    variant={layout.variant}
                    className={layout.className}
                    gradientClass={GRADIENT_VARIANTS[i % GRADIENT_VARIANTS.length]}
                    statusLabel={t(statusMessageKey(project.status))}
                    statusTone={statusToneClass(project.status)}
                    viewDetailsLabel={t('page.projects.viewDetails')}
                    isEditMode={isEditMode}
                    isRtl={direction === 'rtl'}
                    onView={() => setSelectedProject(project)}
                    onDelete={() => handleDeleteProject(project.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1c1917]/80 backdrop-blur-md"
            onClick={() => {
              setSelectedProject(null);
              setShowProjectVideo(false);
              setActiveImageIdx(0);
            }}
          />
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-soft-border/80 bg-cream-light shadow-gold-lg dark:bg-surface">
            <button
              type="button"
              onClick={() => {
                setSelectedProject(null);
                setShowProjectVideo(false);
                setActiveImageIdx(0);
              }}
              className="absolute start-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className={`relative h-72 overflow-hidden ${!selectedProject.image && (!selectedProject.images || selectedProject.images.length === 0) ? 'bg-gradient-to-br from-gold-600 to-gold-300' : ''}`}
            >
              {showProjectVideo && selectedProject.videoData ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <video controls autoPlay className="w-full h-full object-contain">
                    <source src={selectedProject.videoData} />
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                </div>
              ) : (
                <>
                  {(selectedProject.images && selectedProject.images.length > 0) ? (
                    <img src={selectedProject.images[activeImageIdx] || selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                  ) : selectedProject.image ? (
                    <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-20 h-20 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {selectedProject.videoData && (
                    <button
                      onClick={() => setShowProjectVideo(true)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gold/90 text-dark flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-gold/50"
                    >
                      <Play className="w-7 h-7 ml-1" />
                    </button>
                  )}
                  {selectedProject.images && selectedProject.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedProject.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIdx(i)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i === activeImageIdx ? 'bg-gold w-8' : 'bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="absolute bottom-4 right-4 left-4">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedProject.title}</h2>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedProject.location}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneClass(selectedProject.status)}`}
                >
                  {t(statusMessageKey(selectedProject.status))}
                </span>
                <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-600">
                  {selectedProject.category}
                </span>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-soft-border/60 bg-surface-alt p-4 dark:bg-surface-muted">
                  <MapPin className="mb-2 h-5 w-5 text-gold" strokeWidth={1.75} />
                  <p className="mb-1 text-xs text-ink-muted">{t('page.projects.modal.location')}</p>
                  <p className="text-sm font-semibold text-ink">{selectedProject.location}</p>
                </div>
                <div className="rounded-xl border border-soft-border/60 bg-surface-alt p-4 dark:bg-surface-muted">
                  <Calendar className="mb-2 h-5 w-5 text-gold" strokeWidth={1.75} />
                  <p className="mb-1 text-xs text-ink-muted">{t('page.projects.modal.year')}</p>
                  <p className="text-sm font-semibold text-ink">{selectedProject.year}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 font-display text-xl font-semibold text-gold-600">
                  {t('page.projects.modal.description')}
                </h3>
                <p className="leading-relaxed text-ink-secondary">{selectedProject.description}</p>
              </div>

              {selectedProject.images && selectedProject.images.length > 1 && (
                <div className="mb-6">
                  <h3 className="mb-3 font-display text-xl font-semibold text-gold-600">
                    {t('page.projects.modal.gallery')}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedProject.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveImageIdx(i); setShowProjectVideo(false); }}
                        className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          i === activeImageIdx ? 'border-gold shadow-lg shadow-gold/20' : 'border-transparent hover:border-gold/50'
                        }`}
                      >
                        <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.pdfData && (
                <a
                  href={selectedProject.pdfData}
                  download={selectedProject.pdfName || 'project-details.pdf'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 via-gold to-gold-300 py-4 font-semibold text-[#2B2118] transition hover:shadow-gold-sm"
                >
                  <FileText className="h-5 w-5" />
                  {t('page.projects.modal.downloadPdf')}
                </a>
              )}
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

            <h2 className="gold-text mb-6 font-display text-2xl font-semibold">{t('page.projects.modal.addTitle')}</h2>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">اسم المشروع *</label>
                <input
                  type="text" name="title" required value={formData.title} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                  placeholder="مثال: برج الأعمال المركزي"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">التصنيف *</label>
                  <input
                    type="text" name="category" required value={formData.category} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                    placeholder="مثال: أبراج تجارية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">الموقع *</label>
                  <input
                    type="text" name="location" required value={formData.location} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                    placeholder="مثال: الرياض"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">السنة *</label>
                  <input
                    type="text" name="year" required value={formData.year} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                    placeholder="مثال: 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink-secondary mb-1">حالة المشروع</label>
                  <select
                    name="status" value={formData.status} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                  >
                    <option value="active">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="upcoming">قادم</option>
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

              {/* Multiple Images Upload */}
              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">صور المشروع (يمكن اختيار عدة صور)</label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors ${uploadingImages ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploadingImages ? <Loader2 className="w-5 h-5 text-gold animate-spin" /> : <Image className="w-5 h-5 text-gold" />}
                    <span className="text-sm text-ink-muted">
                      {uploadingImages ? 'جاري الرفع...' : formImageNames.length > 0 ? `تم اختيار ${formImageNames.length} صورة` : 'اختر صور'}
                    </span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
                  </label>
                </div>
                {formImages.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {formImages.map((img, i) => (
                      <img key={i} src={img} alt={`preview ${i}`} className="w-full h-16 rounded-lg object-cover border border-gold/20" />
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">فيديو المشروع</label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors ${uploadingVideo ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploadingVideo ? <Loader2 className="w-5 h-5 text-gold animate-spin" /> : <Video className="w-5 h-5 text-gold" />}
                    <span className="text-sm text-ink-muted">
                      {uploadingVideo ? 'جاري الرفع...' : formVideoName || 'اختر فيديو'}
                    </span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
                  </label>
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">ملف PDF</label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors ${uploadingPdf ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploadingPdf ? <Loader2 className="w-5 h-5 text-gold animate-spin" /> : <FileText className="w-5 h-5 text-gold" />}
                    <span className="text-sm text-ink-muted">
                      {uploadingPdf ? 'جاري الرفع...' : formPdfName || 'اختر ملف PDF'}
                    </span>
                    <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" disabled={uploadingPdf} />
                  </label>
                </div>
              </div>

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