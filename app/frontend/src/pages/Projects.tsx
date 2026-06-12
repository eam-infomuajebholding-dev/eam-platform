import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, X, FileText, ChevronLeft, Building2, Video, Play, Image } from 'lucide-react';
import Layout from '@/components/Layout';
import { useEditMode } from '@/contexts/EditModeContext';
import { toast } from 'sonner';
import { savePageData, loadPageData } from '@/lib/dataStorage';

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

const statusLabels = {
  active: { label: 'قيد التنفيذ', color: 'bg-gold/10 text-gold border-gold/30' },
  completed: { label: 'مكتمل', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30' },
  upcoming: { label: 'قادم', color: 'bg-gold-light/10 text-gold-dark border-gold-light/30' },
};

const gradientVariants = [
  'from-[#a08530] to-[#C9A84C]',
  'from-[#C9A84C] to-[#E8D48B]',
  'from-gray-700 to-gray-500',
  'from-[#2D2A1E] to-[#a08530]',
];

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
  const { isEditMode } = useEditMode();
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
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

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('تم حذف المشروع بنجاح');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const results: string[] = [];
    const names: string[] = [];
    let loaded = 0;
    Array.from(files).forEach((file) => {
      names.push(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        results.push(reader.result as string);
        loaded++;
        if (loaded === files.length) {
          setFormImages(results);
          setFormImageNames(names);
          setFormImage(results[0] || '');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormVideoData(reader.result as string);
      setFormVideoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormPdfData(reader.result as string);
      setFormPdfName(file.name);
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
    toast.success('تم إضافة المشروع بنجاح');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#5E5E5E]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">مشاريعنا</h1>
          <p className="text-gray-600 dark:text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            مشاريع تصنع الفارق في عالم الهندسة والبناء
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#6B6B6B]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="gold-text text-2xl md:text-3xl font-bold font-playfair">مشاريع تصنع الفارق</h2>
            {isEditMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold text-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all duration-300 font-tajawal"
              >
                <Plus className="w-5 h-5" />
                إضافة مشروع
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <div key={project.id} className="group relative rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]">
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

                {/* Image / Gradient Placeholder */}
                <div className={`h-56 relative overflow-hidden ${!project.image ? `bg-gradient-to-br ${gradientVariants[i % gradientVariants.length]}` : ''}`}>
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-xs rounded-full border ${statusLabels[project.status].color}`}>
                      {statusLabels[project.status].label}
                    </span>
                  </div>
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
                  <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed mb-4 font-tajawal line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-gray-500 dark:text-white/50 text-xs font-tajawal">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {project.year}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {project.location}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-gold text-sm font-bold hover:text-gold-light transition-colors flex items-center gap-1 font-tajawal"
                    >
                      التفاصيل
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => { setSelectedProject(null); setShowProjectVideo(false); setActiveImageIdx(0); }}
          />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#4a4a4a] rounded-2xl border border-gold/30 shadow-2xl shadow-gold/10">
            <button
              onClick={() => { setSelectedProject(null); setShowProjectVideo(false); setActiveImageIdx(0); }}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image/Video Header */}
            <div className={`relative h-64 overflow-hidden ${!selectedProject.image && (!selectedProject.images || selectedProject.images.length === 0) ? 'bg-gradient-to-br from-[#a08530] to-[#C9A84C]' : ''}`}>
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
                <h2 className="font-tajawal text-2xl font-bold text-white mb-1">{selectedProject.title}</h2>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedProject.location}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs rounded-full border ${statusLabels[selectedProject.status].color}`}>
                  {statusLabels[selectedProject.status].label}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-gold/10 text-gold border border-gold/20">
                  {selectedProject.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/10 border border-gold/10">
                  <MapPin className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">الموقع</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedProject.location}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/10 border border-gold/10">
                  <Calendar className="w-5 h-5 text-gold mb-2" />
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">السنة</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedProject.year}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-tajawal text-xl font-bold text-gold mb-3">وصف المشروع</h3>
                <p className="text-gray-600 dark:text-white/60 leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Image Gallery */}
              {selectedProject.images && selectedProject.images.length > 1 && (
                <div className="mb-6">
                  <h3 className="font-tajawal text-xl font-bold text-gold mb-3">معرض الصور</h3>
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
                  className="w-full py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  تحميل ملف تفاصيل المشروع (PDF)
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
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#4a4a4a] rounded-2xl border border-gold/30 shadow-2xl p-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white flex items-center justify-center hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-tajawal text-2xl font-bold gold-text mb-6">إضافة مشروع جديد</h2>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">اسم المشروع *</label>
                <input
                  type="text" name="title" required value={formData.title} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gold/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none font-tajawal"
                  placeholder="مثال: برج الأعمال المركزي"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">التصنيف *</label>
                  <input
                    type="text" name="category" required value={formData.category} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gold/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none font-tajawal"
                    placeholder="مثال: أبراج تجارية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">الموقع *</label>
                  <input
                    type="text" name="location" required value={formData.location} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gold/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none font-tajawal"
                    placeholder="مثال: الرياض"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">السنة *</label>
                  <input
                    type="text" name="year" required value={formData.year} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gold/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none font-tajawal"
                    placeholder="مثال: 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">حالة المشروع</label>
                  <select
                    name="status" value={formData.status} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gold/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none font-tajawal"
                  >
                    <option value="active">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="upcoming">قادم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">وصف المشروع *</label>
                <textarea
                  name="description" required rows={4} value={formData.description} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gold/20 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none font-tajawal resize-none"
                  placeholder="اكتب وصفاً تفصيلياً للمشروع..."
                />
              </div>

              {/* Multiple Images Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">صور المشروع (يمكن اختيار عدة صور)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors">
                    <Image className="w-5 h-5 text-gold" />
                    <span className="text-sm text-gray-600 dark:text-white/60 font-tajawal">
                      {formImageNames.length > 0 ? `تم اختيار ${formImageNames.length} صورة` : 'اختر صور'}
                    </span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
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
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">فيديو المشروع</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors">
                    <Video className="w-5 h-5 text-gold" />
                    <span className="text-sm text-gray-600 dark:text-white/60 font-tajawal">
                      {formVideoName || 'اختر فيديو'}
                    </span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1 font-tajawal">ملف PDF</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors">
                    <FileText className="w-5 h-5 text-gold" />
                    <span className="text-sm text-gray-600 dark:text-white/60 font-tajawal">
                      {formPdfName || 'اختر ملف PDF'}
                    </span>
                    <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold text-lg rounded-xl hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
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