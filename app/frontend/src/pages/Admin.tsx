import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Plus, 
  Trash2, 
  LogOut, 
  Eye,
  FileText,
  Image,
  Lock,
  Copy,
  X
} from 'lucide-react';

const ADMIN_PASSWORD = 'EamAdmin2024!'; // غير كلمة السر هنا

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
  status: string;
}

interface SiteContent {
  site: {
    title: string;
    subtitle: string;
    description: string;
    email: string;
    phone: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
  };
  about: {
    title: string;
    text: string;
  };
  careers: {
    title: string;
    description: string;
    email: string;
  };
  invest: {
    title: string;
    description: string;
  };
  projects: Project[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showModal, setShowModal] = useState(false);
  const [jsonCode, setJsonCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/content.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error(err));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('كلمة السر غير صحيحة');
    }
  };

  const handleSave = () => {
    if (!content) return;
    
    const jsonString = JSON.stringify(content, null, 2);
    setJsonCode(jsonString);
    setShowModal(true);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = jsonCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateField = (section: string, field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      [section]: {
        ...content[section as keyof SiteContent],
        [field]: value
      }
    });
  };

  const updateProject = (index: number, field: string, value: string) => {
    if (!content) return;
    const newProjects = [...content.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setContent({ ...content, projects: newProjects });
  };

  const addProject = () => {
    if (!content) return;
    const newProject: Project = {
      id: Date.now(),
      name: 'مشروع جديد',
      location: '',
      type: 'سكني',
      investmentAmount: '',
      expectedReturn: '',
      duration: '',
      description: '',
      videoUrl: '',
      images: [''],
      pdfUrl: '',
      status: 'available'
    };
    setContent({ ...content, projects: [...content.projects, newProject] });
  };

  const removeProject = (index: number) => {
    if (!content) return;
    const newProjects = content.projects.filter((_, i) => i !== index);
    setContent({ ...content, projects: newProjects });
  };

  const addProjectImage = (projectIndex: number) => {
    if (!content) return;
    const newProjects = [...content.projects];
    newProjects[projectIndex].images.push('');
    setContent({ ...content, projects: newProjects });
  };

  const updateProjectImage = (projectIndex: number, imageIndex: number, value: string) => {
    if (!content) return;
    const newProjects = [...content.projects];
    newProjects[projectIndex].images[imageIndex] = value;
    setContent({ ...content, projects: newProjects });
  };

  const removeProjectImage = (projectIndex: number, imageIndex: number) => {
    if (!content) return;
    const newProjects = [...content.projects];
    newProjects[projectIndex].images = newProjects[projectIndex].images.filter((_, i) => i !== imageIndex);
    setContent({ ...content, projects: newProjects });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-gold/30">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-tajawal text-2xl font-bold gold-text text-center mb-2">
            لوحة التحكم
          </h1>
          <p className="text-white/60 text-center mb-6">
            إدارة محتوى موقع إعمار الأصالة والمعاصرة
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة السر"
              className="w-full px-4 py-3 rounded-xl border border-gold/30 bg-white/10 text-white placeholder-white/40 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-right"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!content) return <div className="text-center py-20 text-gold">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-lighter" dir="rtl">
      {/* Modal for JSON Code */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#1a1a2e] border-2 border-gold rounded-2xl p-6 flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h2 className="font-tajawal text-2xl font-bold gold-text">✅ تم الحفظ!</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white/70 text-center">
              انسخ هذا الكود والصقه في ملف <code className="text-gold bg-gold/10 px-2 py-1 rounded">public/content.json</code>
            </p>
            <textarea
              value={jsonCode}
              readOnly
              className="flex-1 min-h-[300px] bg-[#0f0f1e] border border-gold/30 rounded-xl text-green-400 font-mono text-xs p-4 resize-none direction-ltr text-left"
              style={{ direction: 'ltr', textAlign: 'left' }}
            />
            <div className="flex gap-3 justify-center">
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark hover:shadow-lg'
                }`}
              >
                <Copy className="w-5 h-5" />
                {copied ? '✓ تم النسخ!' : 'نسخ الكود'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gold/30 text-gold rounded-xl hover:bg-gold/10 transition-all font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-dark border-b border-gold/20 p-4">
        <div className="container mx-auto flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-tajawal text-xl font-bold gold-text">لوحة التحكم - إعمار الأصالة والمعاصرة</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold rounded-lg hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 border border-gold text-gold rounded-lg hover:bg-gold/10 transition-all"
            >
              <Eye className="w-4 h-4" />
              عرض الموقع
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'general', label: 'معلومات الموقع', icon: FileText },
            { id: 'hero', label: 'الصفحة الرئيسية', icon: Image },
            { id: 'about', label: 'من نحن', icon: FileText },
            { id: 'careers', label: 'التوظيف', icon: FileText },
            { id: 'invest', label: 'الاستثمار', icon: FileText },
            { id: 'projects', label: 'المشاريع', icon: Image },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gold text-dark'
                  : 'bg-white dark:bg-white/5 border border-gold/20 text-gray-600 dark:text-white/60 hover:border-gold/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Forms */}
        <div className="bg-white dark:bg-dark rounded-2xl border border-gold/20 p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h2 className="font-tajawal text-xl font-bold gold-text mb-4">معلومات الموقع العامة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">عنوان الموقع</label>
                  <input
                    type="text"
                    value={content.site.title}
                    onChange={(e) => updateField('site', 'title', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">العنوان الفرعي</label>
                  <input
                    type="text"
                    value={content.site.subtitle}
                    onChange={(e) => updateField('site', 'subtitle', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={content.site.email}
                    onChange={(e) => updateField('site', 'email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">رقم الجوال</label>
                  <input
                    type="tel"
                    value={content.site.phone}
                    onChange={(e) => updateField('site', 'phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">وصف الموقع</label>
                  <textarea
                    value={content.site.description}
                    onChange={(e) => updateField('site', 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <h2 className="font-tajawal text-xl font-bold gold-text mb-4">الصفحة الرئيسية</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => updateField('hero', 'title', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">العنوان الفرعي</label>
                  <input
                    type="text"
                    value={content.hero.subtitle}
                    onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">الوصف</label>
                  <textarea
                    value={content.hero.description}
                    onChange={(e) => updateField('hero', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">نص الزر</label>
                  <input
                    type="text"
                    value={content.hero.buttonText}
                    onChange={(e) => updateField('hero', 'buttonText', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <h2 className="font-tajawal text-xl font-bold gold-text mb-4">من نحن</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">العنوان</label>
                <input
                  type="text"
                  value={content.about.title}
                  onChange={(e) => updateField('about', 'title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">المحتوى</label>
                <textarea
                  value={content.about.text}
                  onChange={(e) => updateField('about', 'text', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Careers Tab */}
          {activeTab === 'careers' && (
            <div className="space-y-4">
              <h2 className="font-tajawal text-xl font-bold gold-text mb-4">التوظيف</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">العنوان</label>
                <input
                  type="text"
                  value={content.careers.title}
                  onChange={(e) => updateField('careers', 'title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">الوصف</label>
                <textarea
                  value={content.careers.description}
                  onChange={(e) => updateField('careers', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none resize-none mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">البريد الإلكتروني للتوظيف</label>
                <input
                  type="email"
                  value={content.careers.email}
                  onChange={(e) => updateField('careers', 'email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                />
              </div>
            </div>
          )}

          {/* Invest Tab */}
          {activeTab === 'invest' && (
            <div className="space-y-4">
              <h2 className="font-tajawal text-xl font-bold gold-text mb-4">الاستثمار</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">العنوان</label>
                <input
                  type="text"
                  value={content.invest.title}
                  onChange={(e) => updateField('invest', 'title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">الوصف</label>
                <textarea
                  value={content.invest.description}
                  onChange={(e) => updateField('invest', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-tajawal text-xl font-bold gold-text">المشاريع</h2>
                <button
                  onClick={addProject}
                  className="flex items-center gap-2 px-4 py-2 bg-gold text-dark font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  إضافة مشروع
                </button>
              </div>
              
              {content.projects.map((project, index) => (
                <div key={project.id} className="p-6 rounded-xl border border-gold/20 bg-gray-50 dark:bg-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gold">مشروع {index + 1}: {project.name}</h3>
                    <button
                      onClick={() => removeProject(index)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">اسم المشروع</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">الموقع</label>
                      <input
                        type="text"
                        value={project.location}
                        onChange={(e) => updateProject(index, 'location', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">النوع</label>
                      <select
                        value={project.type}
                        onChange={(e) => updateProject(index, 'type', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                      >
                        <option value="سكني">سكني</option>
                        <option value="تجاري">تجاري</option>
                        <option value="سياحي">سياحي</option>
                        <option value="صناعي">صناعي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">مبلغ الاستثمار</label>
                      <input
                        type="text"
                        value={project.investmentAmount}
                        onChange={(e) => updateProject(index, 'investmentAmount', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">العائد المتوقع</label>
                      <input
                        type="text"
                        value={project.expectedReturn}
                        onChange={(e) => updateProject(index, 'expectedReturn', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">مدة المشروع</label>
                      <input
                        type="text"
                        value={project.duration}
                        onChange={(e) => updateProject(index, 'duration', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">الوصف</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">رابط الفيديو</label>
                    <input
                      type="text"
                      value={project.videoUrl}
                      onChange={(e) => updateProject(index, 'videoUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">صور المشروع (روابط)</label>
                    <div className="space-y-2">
                      {project.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={img}
                            onChange={(e) => updateProjectImage(index, imgIndex, e.target.value)}
                            placeholder={`رابط الصورة ${imgIndex + 1}`}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                          />
                          <button
                            onClick={() => removeProjectImage(index, imgIndex)}
                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addProjectImage(index)}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة صورة
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">رابط ملف PDF</label>
                    <input
                      type="text"
                      value={project.pdfUrl}
                      onChange={(e) => updateProject(index, 'pdfUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">الحالة</label>
                    <select
                      value={project.status}
                      onChange={(e) => updateProject(index, 'status', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold outline-none"
                    >
                      <option value="available">متاح للاستثمار</option>
                      <option value="in-progress">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}