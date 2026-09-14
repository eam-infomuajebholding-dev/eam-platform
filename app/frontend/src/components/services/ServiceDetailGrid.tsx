import type { LucideIcon } from 'lucide-react';
import PageSection from '@/components/page/PageSection';
import PageSectionHeader from '@/components/page/PageSectionHeader';
import type { MessageKey } from '@/i18n/messages';

export type ServiceItem = {
  icon: LucideIcon;
  name: string;
  description?: string;
};

type ServiceDetailGridProps = {
  services: ServiceItem[];
  titleKey?: MessageKey;
  subtitleKey?: MessageKey;
};

export default function ServiceDetailGrid({
  services,
  titleKey,
  subtitleKey,
}: ServiceDetailGridProps) {
  return (
    <PageSection variant="alt" withGlow>
      {titleKey ? (
        <PageSectionHeader titleKey={titleKey} subtitleKey={subtitleKey} />
      ) : null}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={`${service.name}-${index}`}
              className="group rounded-2xl border border-soft-border/70 bg-cream-light p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/80 hover:shadow-gold-card dark:bg-surface"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-50 transition-colors duration-300 group-hover:bg-gold-100 dark:bg-gold/10">
                  <Icon className="h-6 w-6 text-gold-600 dark:text-gold-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-relaxed text-ink transition-colors duration-300 group-hover:text-gold-700 md:text-lg">
                    {service.name}
                  </h3>
                  {service.description ? (
                    <p className="text-caption mt-2 leading-relaxed">{service.description}</p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
}
