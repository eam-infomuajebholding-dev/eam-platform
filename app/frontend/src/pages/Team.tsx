import { useState, useEffect } from 'react';
import { Plus, X, FileText, Upload, User, Video, Play, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import PageSection from '@/components/page/PageSection';
import PageSectionHeader from '@/components/page/PageSectionHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { toast } from 'sonner';
import { savePageData, loadPageData } from '@/lib/dataStorage';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';

interface TeamMember {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  videoData: string;
  videoName: string;
  pdfData: string;
  pdfName: string;
}

const defaultTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'م. عبدالرحمن الأحمد',
    title: 'المدير العام',
    description: 'خبرة تزيد عن 20 عاماً في إدارة المشاريع الهندسية الكبرى والاستشارات الهندسية',
    image: '',
    videoData: '',
    videoName: '',
    pdfData: '',
    pdfName: '',
  },
  {
    id: 2,
    name: 'م. فهد العتيبي',
    title: 'مدير الخدمات الهندسية',
    description: 'متخصص في التصميم المعماري والإنشائي بخبرة 15 عاماً في المشاريع السكنية والتجارية',
    image: '',
    videoData: '',
    videoName: '',
    pdfData: '',
    pdfName: '',
  },
  {
    id: 3,
    name: 'م. أحمد القحطاني',
    title: 'مديرة الخدمات الحكومية',
    description: 'خبيرة في الإجراءات الحكومية والتراخيص مع خبرة واسعة في التعامل مع الجهات الرسمية',
    image: '',
    videoData: '',
    videoName: '',
    pdfData: '',
    pdfName: '',
  },
  {
    id: 4,
    name: 'م. خالد الشمري',
    title: 'مدير المشاريع',
    description: 'مهندس مدني متخصص في إدارة وتنفيذ المشاريع الكبرى مع سجل حافل بالإنجازات',
    image: '',
    videoData: '',
    videoName: '',
    pdfData: '',
    pdfName: '',
  },
];

const TEAM_STORAGE_KEY = 'team-page-data';

const gradientVariants = [
  'from-[#a08530] to-[var(--gold-400)]',
  'from-[var(--gold-400)] to-[#E8D48B]',
  'from-stone-600 to-stone-400',
  'from-[#2D2A1E] to-[#a08530]',
];

interface AddMemberFormData {
  name: string;
  title: string;
  description: string;
}

const emptyForm: AddMemberFormData = {
  name: '',
  title: '',
  description: '',
};

export default function Team() {
  const { t } = useLanguage();
  const { isEditMode } = useEditMode();
  const [members, setMembers] = useState<TeamMember[]>(defaultTeamMembers);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<AddMemberFormData>(emptyForm);
  const [formImage, setFormImage] = useState<string>('');
  const [formVideoData, setFormVideoData] = useState<string>('');
  const [formVideoName, setFormVideoName] = useState<string>('');
  const [formPdfData, setFormPdfData] = useState<string>('');
  const [formPdfName, setFormPdfName] = useState<string>('');
  const [showMemberVideo, setShowMemberVideo] = useState(false);

  useEffect(() => {
    loadPageData<TeamMember[]>(TEAM_STORAGE_KEY).then(data => {
      if (data) setMembers(data);
    });
  }, []);

  useEffect(() => {
    savePageData(TEAM_STORAGE_KEY, members);
  }, [members]);

  const handleDeleteMember = (memberId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العضو؟')) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('تم حذف العضو بنجاح');
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isCloudinaryConfigured()) {
      setUploadingImage(true);
      try {
        const url = await uploadToCloudinary(file);
        setFormImage(url);
        toast.success('تم رفع الصورة بنجاح إلى السحابة');
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        toast.error('فشل الرفع إلى السحابة، جاري الحفظ محلياً...');
        fallbackReadAsDataURL(file, setFormImage);
      } finally {
        setUploadingImage(false);
      }
    } else {
      fallbackReadAsDataURL(file, setFormImage);
    }
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
        fallbackReadAsDataURL(file, setFormVideoData);
        setFormVideoName(file.name);
      } finally {
        setUploadingVideo(false);
      }
    } else {
      fallbackReadAsDataURL(file, setFormVideoData);
      setFormVideoName(file.name);
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
        fallbackReadAsDataURL(file, setFormPdfData);
        setFormPdfName(file.name);
      } finally {
        setUploadingPdf(false);
      }
    } else {
      fallbackReadAsDataURL(file, setFormPdfData);
      setFormPdfName(file.name);
    }
  };

  const fallbackReadAsDataURL = (file: File, setter: (val: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: TeamMember = {
      id: Date.now(),
      name: formData.name,
      title: formData.title,
      description: formData.description,
      image: formImage,
      videoData: formVideoData,
      videoName: formVideoName,
      pdfData: formPdfData,
      pdfName: formPdfName,
    };
    setMembers(prev => [...prev, newMember]);
    setFormData(emptyForm);
    setFormImage('');
    setFormVideoData('');
    setFormVideoName('');
    setFormPdfData('');
    setFormPdfName('');
    setShowAddModal(false);
    toast.success('تم إضافة العضو بنجاح');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <PageHero
        titleKey="page.team.hero.title"
        subtitleKey="page.team.hero.subtitle"
        titleEditableId="team-hero-title"
        subtitleEditableId="team-hero-subtitle"
      />

      <PageSection variant="cream" sectionId="main" sectionLabel="المحتوى الرئيسي">
          <PageSectionHeader subtitleKey="page.team.intro" />

          {/* Add Member Button (Edit Mode) */}
          {isEditMode && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gold text-dark font-bold rounded-xl hover:shadow-gold-sm transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                إضافة عضو جديد
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {members.map((member, i) => (
              <div
                key={member.id}
                className="group relative cursor-pointer rounded-2xl border border-soft-border/70 bg-cream p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/70 hover:shadow-gold-card dark:bg-surface"
                onClick={() => setSelectedMember(member)}
              >
                {/* Delete Button (Edit Mode) */}
                {isEditMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id); }}
                    className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    title="حذف العضو"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Avatar */}
                <div className={`w-24 h-24 mx-auto mb-5 rounded-full overflow-hidden ${!member.image ? `bg-gradient-to-br ${gradientVariants[i % gradientVariants.length]}` : ''} flex items-center justify-center`}>
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-bold">
                      {member.name.charAt(2)}
                    </span>
                  )}
                </div>
                <h3 className="text-gold font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-gold-light/70 text-sm mb-3">{member.title}</p>
                <p className="text-ink-secondary dark:text-white/55 text-xs leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
      </PageSection>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => { setSelectedMember(null); setShowMemberVideo(false); }}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-soft-border/70 bg-cream p-8 shadow-gold-lg dark:bg-surface">
            <button
              onClick={() => { setSelectedMember(null); setShowMemberVideo(false); }}
              className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className={`relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ${!selectedMember.image ? 'bg-gradient-to-br from-[#a08530] to-[var(--gold-400)]' : ''} flex items-center justify-center`}>
                {selectedMember.image ? (
                  <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white/60" />
                )}
              </div>
              <h2 className="text-2xl font-bold gold-text mb-1">{selectedMember.name}</h2>
              <p className="text-gold-light/70">{selectedMember.title}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gold mb-3">نبذة</h3>
              <p className="text-ink-muted leading-relaxed">{selectedMember.description}</p>
            </div>

            {/* Video Section */}
            {selectedMember.videoData && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gold mb-3">فيديو تعريفي</h3>
                {showMemberVideo ? (
                  <div className="rounded-xl overflow-hidden bg-black">
                    <video controls autoPlay className="w-full h-48 object-contain">
                      <source src={selectedMember.videoData} />
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMemberVideo(true)}
                    className="w-full py-3 rounded-xl bg-surface-alt dark:bg-white/10 border border-gold/20 flex items-center justify-center gap-2 text-gold font-bold hover:bg-gold/10 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    تشغيل الفيديو
                  </button>
                )}
              </div>
            )}

            {selectedMember.pdfData && (
              <a
                href={selectedMember.pdfData}
                download={selectedMember.pdfName || 'cv.pdf'}
                className="w-full py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold rounded-xl hover:shadow-gold-sm transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                تحميل السيرة الذاتية (PDF)
              </a>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
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

            <h2 className="text-2xl font-bold gold-text mb-6">إضافة عضو جديد</h2>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">الاسم *</label>
                <input
                  type="text" name="name" required value={formData.name} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                  placeholder="مثال: م. أحمد محمد"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">المسمى الوظيفي *</label>
                <input
                  type="text" name="title" required value={formData.title} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                  placeholder="مثال: مدير المشاريع"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">نبذة *</label>
                <textarea
                  name="description" required rows={4} value={formData.description} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-soft-border/80 dark:border-gold/20 bg-cream-light dark:bg-surface text-ink focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none resize-none"
                  placeholder="اكتب نبذة عن العضو..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">الصورة الشخصية</label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 cursor-pointer hover:bg-gold/10 transition-colors ${uploadingImage ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploadingImage ? <Loader2 className="w-5 h-5 text-gold animate-spin" /> : <Upload className="w-5 h-5 text-gold" />}
                    <span className="text-sm text-ink-muted">
                      {uploadingImage ? 'جاري الرفع...' : formImage ? 'تم اختيار صورة' : 'اختر صورة'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                  {formImage && (
                    <img src={formImage} alt="preview" className="w-12 h-12 rounded-full object-cover border border-gold/20" />
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-bold text-ink-secondary mb-1">فيديو تعريفي</label>
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
                <label className="block text-sm font-bold text-ink-secondary mb-1">السيرة الذاتية (PDF)</label>
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
                إضافة العضو
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}