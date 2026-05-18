import { useState } from 'react';
import Layout from '@/components/Layout';
import { Send, Phone, Mail, MapPin, CheckCircle, Loader2, MessageCircle } from 'lucide-react';
import { createClient } from '@metagptx/web-sdk';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '966599555437'; // رقم الشركة
const WHATSAPP_MESSAGE = 'مرحباً، أود الاستفسار عن خدماتكم الهندسية';

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
                            placeholder="اكتب اسمك"
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
                          <input
                            type="tel" name="phone" value={formData.phone} onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#1a1a2e] font-tajawal placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                            placeholder="+966 50 000 0000"
                            disabled={isSubmitting}
                          />
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
                          placeholder="أخبرنا عن مشروعك..."
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
                      <p className="font-tajawal mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[16px] font-bold text-[#1A1A2E] bg-[#00000000] opacity-100" dir="ltr">+966 599555437</p>
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
                      <p className="font-tajawal mt-[0px] mr-[0px] mb-[0px] ml-[0px] pt-[0px] pr-[0px] pb-[0px] pl-[0px] rounded-none text-[16px] font-bold text-[#1A1A2E] bg-[#00000000] opacity-100">جدة،المملكة العربية السعودية</p>
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
      {/* Google Maps Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[#1a1a2e] text-3xl md:text-4xl font-bold font-tajawal mb-4">موقعنا على الخريطة</h2>
              <p className="text-[#1a1a2e]/60 text-lg font-tajawal">يسعدنا زيارتكم في مقر الشركة</p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <iframe
                title="موقع إعمار الأصالة والمعاصرة"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.674536257489!2d46.675296!3d24.713552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%2C%20Saudi%20Arabia!5e0!3m2!1sar!2ssa!4v1700000000000!5m2!1sar!2ssa"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 text-[#1a1a2e]/70">
              <MapPin className="w-5 h-5 text-gold" />
              <span className="font-tajawal text-base">الرياض، المملكة العربية السعودية</span>
            </div>
          </div>
        </div>
      </section>
      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white px-5 py-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_30px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-105 group"
        aria-label="تواصل عبر واتساب"
      >
        <span className="font-tajawal font-bold text-sm hidden sm:inline-block">تواصل عبر واتساب</span>
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </Layout>
  );
}