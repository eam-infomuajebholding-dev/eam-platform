import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Mail, User, Phone, FileText, CheckCircle, Briefcase, GraduationCap } from 'lucide-react';
import Layout from '@/components/Layout';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Careers() {
  const heroReveal = useScrollReveal({ threshold: 0.15 });
  const formReveal = useScrollReveal({ threshold: 0.15 });

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
      {/* Hero Section */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#111111]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div
          ref={heroReveal.ref}
          className={`relative z-10 px-4 text-center ${heroReveal.isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-gold" />
          </div>
          <h1 className="font-tajawal text-4xl md:text-5xl font-bold gold-text mb-4">
            انضم إلى فريقنا
          </h1>
          <p className="text-gray-600 dark:text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            نرحب دائماً بالمواهب المتميزة. أرسل سيرتك الذاتية وسنتواصل معك عند توفر الفرصة المناسبة
          </p>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-[#1a1a1a] relative">
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

                  {/* Position/Field */}
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