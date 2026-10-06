import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, Phone, Mail, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '966599555437';

type ContactLocationState = {
  fromNewsletter?: boolean;
  email?: string;
  subject?: string;
};

export default function Contact() {
  const { t } = useLanguage();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const state = location.state as ContactLocationState | null;
    if (!state?.fromNewsletter) return;
    setFormData((prev) => ({
      ...prev,
      email: state.email?.trim() || prev.email,
      subject: state.subject?.trim() || prev.subject,
    }));
  }, [location.state]);

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
        toast.success(t('page.contact.toast.success'));
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(t('page.contact.toast.error'));
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(t('page.contact.toast.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHero
        titleKey="page.contact.hero.title"
        subtitleKey="page.contact.hero.subtitle"
        titleEditableId="contact-hero-title"
        subtitleEditableId="contact-hero-desc"
      />

      <section
        className="bg-cream-light py-16 dark:bg-background md:py-24"
        data-page-section="form"
        data-section-label="نموذج التواصل"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-soft-border/70 bg-cream p-8 shadow-gold-card dark:bg-surface md:p-10">
                {isSubmitted ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="mb-4 text-2xl font-bold text-ink">
                      {t('page.contact.form.successTitle')}
                    </h2>
                    <p className="mb-2 text-lg text-ink-secondary">
                      {t('page.contact.form.successBody1')}
                    </p>
                    <p className="mb-8 text-base text-ink-muted">
                      {t('page.contact.form.successBody2')}
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-3 font-bold text-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-sm"
                    >
                      {t('page.contact.form.sendAnother')}
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="mb-8 text-2xl font-bold text-ink">
                      {t('page.contact.form.title')}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm text-ink-secondary">
                            {t('page.contact.form.name')} *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="eam-input"
                            placeholder={t('page.contact.form.namePlaceholder')}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-ink-secondary">
                            {t('page.contact.form.email')} *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="eam-input"
                            placeholder="example@email.com"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm text-ink-secondary">
                            {t('page.contact.form.phone')}
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="eam-input"
                            placeholder="+966 50 000 0000"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-ink-secondary">
                            {t('page.contact.form.subject')}
                          </label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="eam-input"
                            placeholder={t('page.contact.form.subjectPlaceholder')}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-ink-secondary">
                          {t('page.contact.form.message')} *
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className="eam-input resize-none"
                          placeholder={t('page.contact.form.messagePlaceholder')}
                          disabled={isSubmitting}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-4 text-lg font-bold text-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-sm disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {t('common.submitting')}
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            {t('page.contact.form.submit')}
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-soft-border/70 bg-cream p-8 shadow-gold-card dark:bg-surface">
                <h3 className="mb-6 text-xl font-bold text-ink">
                  {t('page.contact.info.title')}
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10">
                      <Phone className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-ink-muted">
                        {t('page.contact.info.phone')}
                      </p>
                      <p className="text-base font-bold text-ink" dir="ltr">
                        +966 599555437
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10">
                      <Mail className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-ink-muted">
                        {t('page.contact.info.email')}
                      </p>
                      <p className="font-bold text-ink">info@eam.sa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10">
                      <MapPin className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-ink-muted">
                        {t('page.contact.info.location')}
                      </p>
                      <p className="text-base font-bold text-ink">
                        جدة، المملكة العربية السعودية
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-soft-border/70 bg-cream p-8 text-center shadow-gold-sm dark:bg-surface">
                <h3 className="mb-3 text-lg font-bold text-gold">{t('page.contact.hours.title')}</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-secondary">
                  {t('page.contact.hours.body')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-surface-alt py-16 dark:bg-surface-muted md:py-24"
        data-page-section="channels"
        data-section-label="قنوات التواصل"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-3xl font-bold text-ink md:text-4xl">
                {t('page.contact.map.title')}
              </h2>
              <p className="text-lg text-ink-muted">
                {t('page.contact.map.subtitle')}
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gold/20 shadow-lg">
              <iframe
                title={t('brand.logoAlt')}
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
            <div className="mt-6 flex items-center justify-center gap-3 text-ink-secondary">
              <MapPin className="h-5 w-5 text-gold" />
              <span className="text-base">{t('page.contact.map.location')}</span>
            </div>
          </div>
        </div>
      </section>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('page.contact.whatsapp'))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-8 left-8 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-4 text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-105 hover:bg-[#1ebe57] hover:shadow-[0_6px_30px_rgba(37,211,102,0.6)]"
        aria-label={t('aria.whatsapp')}
      >
        <span className="hidden text-sm font-bold sm:inline-block">
          {t('page.contact.whatsappLabel')}
        </span>
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </Layout>
  );
}
