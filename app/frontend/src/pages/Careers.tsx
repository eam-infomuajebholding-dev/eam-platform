import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Upload, Mail, CheckCircle, User, FileText, Phone } from 'lucide-react';
import Layout from '@/components/Layout';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useContent } from '@/components/ContentProvider';

export default function Careers() {
  const { content, loading } = useContent();
  const heroReveal = useScrollReveal({ threshold: 0.15 });
  const formReveal = useScrollReveal({ threshold: 0.15 });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    type: 'job',
    position: '',
    message: '',
  });
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    window.location.href = `mailto:${content.careers.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
            <Briefcase className="w-10 h-10 text-gold" />
          </div>
          <h1 className="font-tajawal text-4xl md:text-5xl font-bold gold-text mb-4">
            {content.careers.title}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            {content.careers.description}
          </p>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-dark-lighter relative">
        <div className="container mx-auto px-4">
          <div
            ref={formReveal.ref}
            className={`max-w-3xl mx-auto ${formReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
          >
            <div className="text-center mb-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-tajawal text-3xl md:text-4xl font-bold gold-text mb-4">
                قدم طلبك الآن
              </h2>
              <p className="text-gray-600 dark:text-white/60">
                املأ النموذج أدناه وارفع سيرتك الذاتية
              </p>
            </div>

            <div className="p-8 md:p-10 rounded-2xl border border-gold/20 dark:border-gold/10 bg-white dark:bg-white/5 backdrop-blur-md shadow-lg shadow-gold/5">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="font-tajawal text-2xl font-bold text-gold mb-2">تم إرسال طلبك بنجاح!</h3>
                  <p className="text-gray-600 dark:text-white/60">
                    سيتم فتح تطبيق البريد الإلكتروني لإرسال سيرتك الذاتية. شكراً لاهتمامك بالانضمام إلينا.
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
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-gold/50'
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
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-gold/50'
                      }`}
                    >
                      <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-bold">تدريب</span>
                    </button>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                      <User className="w-4 h-4 inline-block ml-2 text-gold" />
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 outline-none"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                        <Mail className="w-4 h-4 inline-block ml-2 text-gold" />
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 outline-none"
                        placeholder="example@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                        <Phone className="w-4 h-4 inline-block ml-2 text-gold" />
                        رقم الجوال
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 outline-none"
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                      <Briefcase className="w-4 h-4 inline-block ml-2 text-gold" />
                      {formData.type === 'job' ? 'المجال الوظيفي المطلوب' : 'مجال التدريب المطلوب'}
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 outline-none"
                      placeholder={formData.type === 'job' ? 'مثال: مهندس معماري، إداري، محاسب...' : 'مثال: هندسي، إداري، تقني...'}
                    />
                  </div>

                  {/* CV Upload */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                      <Upload className="w-4 h-4 inline-block ml-2 text-gold" />
                      السيرة الذاتية (CV)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all duration-200"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gold" />
                      <p className="text-sm text-gray-600 dark:text-white/60">
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
                    <p className="text-xs text-gray-400 mt-2">
                      * سيتم فتح تطبيق البريد الإلكتروني لإرفاق وإرسال السيرة الذاتية
                    </p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">
                      <FileText className="w-4 h-4 inline-block ml-2 text-gold" />
                      رسالة إضافية (اختياري)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 outline-none resize-none"
                      placeholder="اكتب أي معلومات إضافية تريد مشاركتها..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold text-lg rounded-xl hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    إرسال الطلب عبر البريد الإلكتروني
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}