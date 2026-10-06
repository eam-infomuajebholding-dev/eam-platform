import { useState, useRef } from 'react';
import { Upload, Mail, User, Phone, FileText, CheckCircle, Briefcase, GraduationCap } from 'lucide-react';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import PageSection from '@/components/page/PageSection';
import PageSectionHeader from '@/components/page/PageSectionHeader';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Careers() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    type: 'job', // 'job' or 'training'
    position: '',
    message: '',
  });
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`طلب ${formData.type === 'job' ? 'توظيف' : 'تدريب'} - ${formData.fullName}`);
    const body = encodeURIComponent(
      `الاسم الكامل: ${formData.fullName}\n` +
      `البريد الإلكتروني: ${formData.email}\n` +
      `رقم الجوال: ${formData.phone}\n` +
      `نوع الطلب: ${formData.type === 'job' ? 'توظيف' : 'تدريب'}\n` +
      `المنصب/المجال المطلوب: ${formData.position}\n\n` +
      `رسالة إضافية:\n${formData.message}`
    );
    window.location.href = `mailto:hr@emmar.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <PageHero
        titleKey="page.careers.hero.title"
        subtitleKey="page.careers.hero.subtitle"
        titleEditableId="careers-hero-title"
        subtitleEditableId="careers-hero-desc"
      />

      <PageSection variant="cream" sectionId="main" sectionLabel="المحتوى الرئيسي">
        <div className="mx-auto max-w-3xl">
          <PageSectionHeader
            titleKey="page.careers.apply.title"
            subtitleKey="page.careers.form.desc"
            titleEditableId="careers-form-title"
            subtitleEditableId="careers-form-desc"
          />

            <div className="rounded-2xl border border-soft-border/70 bg-cream p-8 shadow-gold-card dark:bg-surface md:p-10">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gold mb-2">{t('page.careers.success.title')}</h3>
                  <p className="text-ink-muted">
                    {t('page.careers.success.body')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'job' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                        formData.type === 'job'
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-soft-border/80 dark:border-white/10 text-ink-muted hover:border-gold/50'
                      }`}
                    >
                      <Briefcase className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-bold">توظيف</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'training' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                        formData.type === 'training'
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-soft-border/80 dark:border-white/10 text-ink-muted hover:border-gold/50'
                      }`}
                    >
                      <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-bold">تدريب</span>
                    </button>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-ink-secondary mb-2">
                      <User className="w-4 h-4 inline-block ml-2 text-gold" />
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="eam-input"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-ink-secondary mb-2">
                        <Mail className="w-4 h-4 inline-block ml-2 text-gold" />
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="eam-input"
                        placeholder="example@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ink-secondary mb-2">
                        <Phone className="w-4 h-4 inline-block ml-2 text-gold" />
                        رقم الجوال
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="eam-input"
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                  </div>

                  {/* Position/Field */}
                  <div>
                    <label className="block text-sm font-bold text-ink-secondary mb-2">
                      <Briefcase className="w-4 h-4 inline-block ml-2 text-gold" />
                      {formData.type === 'job' ? 'المجال الوظيفي المطلوب' : 'مجال التدريب المطلوب'}
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="eam-input"
                      placeholder={formData.type === 'job' ? 'مثال: مهندس معماري، إداري، محاسب...' : 'مثال: هندسي، إداري، تقني...'}
                    />
                  </div>

                  {/* CV Upload */}
                  <div>
                    <label className="block text-sm font-bold text-ink-secondary mb-2">
                      <Upload className="w-4 h-4 inline-block ml-2 text-gold" />
                      السيرة الذاتية (CV)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-soft-border dark:border-white/20 bg-cream-light dark:bg-surface text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all duration-200"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gold" />
                      <p className="text-sm text-ink-muted">
                        {fileName ? (
                          <span className="text-gold font-bold">✓ {fileName}</span>
                        ) : (
                          'اضغط هنا لاختيار ملف السيرة الذاتية (PDF, Word)'
                        )}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-ink-subtle mt-2">
                      * سيتم فتح تطبيق البريد الإلكتروني لإرفاق وإرسال السيرة الذاتية
                    </p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-ink-secondary mb-2">
                      <FileText className="w-4 h-4 inline-block ml-2 text-gold" />
                      رسالة إضافية (اختياري)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="eam-input resize-none"
                      placeholder="اكتب أي معلومات إضافية تريد مشاركتها..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold text-lg rounded-xl hover:shadow-gold-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    إرسال الطلب عبر البريد الإلكتروني
                  </button>
                </form>
              )}
            </div>
        </div>
      </PageSection>
    </Layout>
  );
}