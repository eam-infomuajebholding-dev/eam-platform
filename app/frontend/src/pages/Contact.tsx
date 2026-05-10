import { useState } from 'react';
import Layout from '@/components/Layout';
import { Send, Phone, Mail, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@metagptx/web-sdk';
import { toast } from 'sonner';

const client = createClient();

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/notifications/submit-contact',
        method: 'POST',
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        },
      });

      if (response.data?.success) {
        setIsSubmitted(true);
        toast.success('تم إرسال رسالتك بنجاح!');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-dark-lighter">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">اتصل بنا</h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            نسعد بتواصلكم معنا في أي وقت
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 md:py-24 bg-[#f5f5f5]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-[#1a1a2e] font-bold text-2xl mb-4 font-tajawal">تم إرسال رسالتك بنجاح!</h2>
                    <p className="text-[#1a1a2e]/70 text-lg mb-2 font-tajawal">
                      شكراً لتواصلك معنا. تم حفظ رسالتك في نظامنا.
                    </p>
                    <p className="text-[#1a1a2e]/60 text-base mb-8 font-tajawal">
                      سيتم إرسال تأكيد إلى بريدك الإلكتروني وسيتم الرد عليك في أقرب وقت.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-8 py-3 bg-[#1a1a2e] text-white font-bold font-tajawal rounded-lg transition-all duration-300 hover:bg-[#2a2a4e] hover:shadow-lg"
                    >
                      إرسال رسالة أخرى
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-[#1a1a2e] font-bold text-2xl mb-8 font-tajawal">أرسل لنا رسالة</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Row 1: Name + Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#1a1a2e]/70 text-sm mb-2 font-tajawal">الاسم الكامل *</label>
                          <input
                            type="text" name="name" required value={formData.name} onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1a1a2e] font-tajawal placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                            placeholder="أدخل اسمك الكامل"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-[#1a1a2e]/70 text-sm mb-2 font-tajawal">البريد الإلكتروني *</label>
                          <input
                            type="email" name="email" required value={formData.email} onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1a1a2e] font-tajawal placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                            placeholder="example@email.com"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      {/* Row 2: Phone + Subject */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#1a1a2e]/70 text-sm mb-2 font-tajawal">رقم الهاتف</label>
                          <div className="flex gap-2">
                            <span className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-500 font-tajawal text-sm">+966</span>
                            <input
                              type="tel" name="phone" value={formData.phone} onChange={handleChange}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1a1a2e] font-tajawal placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                              placeholder="5XXXXXXXX"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[#1a1a2e]/70 text-sm mb-2 font-tajawal">الموضوع</label>
                          <input
                            type="text" name="subject" value={formData.subject} onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1a1a2e] font-tajawal placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                            placeholder="موضوع الرسالة"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      {/* Row 3: Message */}
                      <div>
                        <label className="block text-[#1a1a2e]/70 text-sm mb-2 font-tajawal">الرسالة *</label>
                        <textarea
                          name="message" required rows={5} value={formData.message} onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1a1a2e] font-tajawal placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
                          placeholder="اكتب رسالتك هنا..."
                          disabled={isSubmitting}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1a1a2e] text-white font-bold font-tajawal rounded-lg text-lg transition-all duration-300 hover:bg-[#2a2a4e] hover:shadow-lg w-full md:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            إرسال الرسالة
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-[#1a1a2e] font-bold text-xl mb-6 font-tajawal">معلومات التواصل</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-[#1a1a2e]/60 text-sm font-tajawal mb-1">الهاتف</p>
                      <p className="text-[#1a1a2e] font-bold font-tajawal" dir="ltr">+966 XX XXX XXXX</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-[#1a1a2e]/60 text-sm font-tajawal mb-1">البريد الإلكتروني</p>
                      <p className="text-[#1a1a2e] font-bold font-tajawal">info@eam.sa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-[#1a1a2e]/60 text-sm font-tajawal mb-1">الموقع</p>
                      <p className="text-[#1a1a2e] font-bold font-tajawal">المملكة العربية السعودية</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a2e] rounded-2xl p-8 text-center">
                <h3 className="text-gold font-bold text-lg mb-3 font-tajawal">ساعات العمل</h3>
                <p className="text-white/70 text-sm font-tajawal leading-relaxed">
                  الأحد - الخميس<br />
                  8:00 صباحاً - 5:00 مساءً
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}