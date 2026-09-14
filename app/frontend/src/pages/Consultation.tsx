import { useState } from 'react';
import Layout from '@/components/Layout';
import PageHero from '@/components/page/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

export default function Consultation() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/notifications/submit-consultation',
        method: 'POST',
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          consultation_type: formData.type,
          message: formData.message,
        },
      });

      if (response.data?.success) {
        setIsSubmitted(true);
        toast.success(t('page.consultation.toast.success'));
        setFormData({ name: '', email: '', phone: '', type: '', message: '' });
      } else {
        toast.error(t('page.consultation.toast.error'));
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(t('page.consultation.toast.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHero
        titleKey="page.consultation.hero.title"
        subtitleKey="page.consultation.hero.subtitle"
      />

      <section className="bg-cream-light py-16 dark:bg-background md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            {isSubmitted ? (
              <div className="rounded-2xl border border-soft-border/70 bg-cream p-8 text-center shadow-gold-card dark:bg-surface md:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gold">
                  {t('page.consultation.success.title')}
                </h2>
                <p className="mb-2 text-lg text-ink-secondary">
                  {t('page.consultation.success.body1')}
                </p>
                <p className="mb-8 text-base text-ink-muted">
                  {t('page.consultation.success.body2')}
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-3 font-bold text-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-lg"
                >
                  {t('page.consultation.success.sendAnother')}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-soft-border/70 bg-cream p-8 shadow-gold-card dark:bg-surface md:p-10"
              >
                <h2 className="mb-2 text-2xl font-bold text-gold">
                  {t('page.consultation.form.title')}
                </h2>

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
                    placeholder={t('page.consultation.form.namePlaceholder')}
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

                <div>
                  <label className="mb-2 block text-sm text-ink-secondary">
                    {t('page.contact.form.phone')}
                  </label>
                  <div className="flex gap-2">
                    <span className="eam-input w-auto shrink-0 text-sm text-ink-muted">
                      +966
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="eam-input flex-1"
                      placeholder="5XXXXXXXX"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-ink-secondary">
                    {t('page.consultation.form.type')}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="eam-input"
                    disabled={isSubmitting}
                  >
                    <option value="" className="bg-cream-light dark:bg-background">
                      {t('page.consultation.form.typePlaceholder')}
                    </option>
                    <option value="engineering" className="bg-cream-light dark:bg-background">
                      {t('page.consultation.form.type.engineering')}
                    </option>
                    <option value="government" className="bg-cream-light dark:bg-background">
                      {t('page.consultation.form.type.government')}
                    </option>
                    <option value="other" className="bg-cream-light dark:bg-background">
                      {t('page.consultation.form.type.other')}
                    </option>
                  </select>
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
                    placeholder={t('page.consultation.form.messagePlaceholder')}
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 py-4 text-lg font-bold text-dark transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('common.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {t('page.consultation.form.submit')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
