import { useState } from 'react';
import Layout from '@/components/Layout';
import { Send } from 'lucide-react';

export default function Consultation() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم إرسال طلب الاستشارة بنجاح! سنتواصل معك قريباً.');
    setFormData({ name: '', email: '', phone: '', type: '', message: '' });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-dark-lighter">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">طلب استشارة</h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            احصل على استشارة هندسية متخصصة من فريقنا
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 md:py-24 bg-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-gold/20 rounded-2xl p-8 md:p-10 space-y-6">
              <h2 className="text-gold font-bold text-2xl mb-2 font-tajawal">أرسل طلبك</h2>

              {/* Name */}
              <div>
                <label className="block text-white/80 text-sm mb-2 font-tajawal">الاسم الكامل *</label>
                <input
                  type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="w-full bg-white/10 border border-gold/20 rounded-lg px-4 py-3 text-white font-tajawal placeholder:text-white/40 focus:outline-none focus:border-gold/60 transition-colors"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white/80 text-sm mb-2 font-tajawal">البريد الإلكتروني *</label>
                <input
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="w-full bg-white/10 border border-gold/20 rounded-lg px-4 py-3 text-white font-tajawal placeholder:text-white/40 focus:outline-none focus:border-gold/60 transition-colors"
                  placeholder="example@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-white/80 text-sm mb-2 font-tajawal">رقم الهاتف</label>
                <div className="flex gap-2">
                  <span className="bg-white/10 border border-gold/20 rounded-lg px-4 py-3 text-white/60 font-tajawal text-sm">+966</span>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="flex-1 bg-white/10 border border-gold/20 rounded-lg px-4 py-3 text-white font-tajawal placeholder:text-white/40 focus:outline-none focus:border-gold/60 transition-colors"
                    placeholder="5XXXXXXXX"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-white/80 text-sm mb-2 font-tajawal">نوع الاستشارة</label>
                <select
                  name="type" value={formData.type} onChange={handleChange}
                  className="w-full bg-white/10 border border-gold/20 rounded-lg px-4 py-3 text-white font-tajawal focus:outline-none focus:border-gold/60 transition-colors"
                >
                  <option value="" className="bg-dark">اختر نوع الاستشارة</option>
                  <option value="engineering" className="bg-dark">استشارة هندسية</option>
                  <option value="government" className="bg-dark">استشارة حكومية</option>
                  <option value="other" className="bg-dark">أخرى</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-white/80 text-sm mb-2 font-tajawal">الرسالة *</label>
                <textarea
                  name="message" required rows={5} value={formData.message} onChange={handleChange}
                  className="w-full bg-white/10 border border-gold/20 rounded-lg px-4 py-3 text-white font-tajawal placeholder:text-white/40 focus:outline-none focus:border-gold/60 transition-colors resize-none"
                  placeholder="اكتب تفاصيل طلبك هنا..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-dark font-bold font-tajawal rounded-lg text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:scale-[1.02]"
              >
                <Send className="w-5 h-5" />
                إرسال الطلب
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}