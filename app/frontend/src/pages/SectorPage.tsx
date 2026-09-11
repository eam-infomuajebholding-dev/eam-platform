import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getSectorBySlug } from '@/data/sectors';

export default function SectorPage() {
  const { slug } = useParams<{ slug: string }>();
  const sector = slug ? getSectorBySlug(slug) : undefined;

  if (!sector) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-tajawal text-2xl font-bold text-ink">القطاع غير موجود</h1>
          <Link to="/" className="mt-4 inline-block text-deep-gold hover:underline">
            العودة للرئيسية
          </Link>
        </div>
      </Layout>
    );
  }

  const Icon = sector.icon;

  return (
    <Layout>
      <div className="bg-cream">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div
            className="mb-6 h-40 rounded-2xl border border-soft-border"
            style={{ background: sector.imagePlaceholder }}
          />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-light text-sm font-bold text-deep-gold">
              {sector.number}
            </span>
            <Icon size={28} className="text-primary-gold" />
            <h1 className="font-tajawal text-3xl font-bold text-ink">{sector.title}</h1>
          </div>
          <p className="mt-4 text-ink/70">
            نعمل على إعداد المحتوى التفصيلي لهذا القطاع. تواصل معنا لمعرفة المزيد عن خدماتنا في هذا المجال.
          </p>
          {sector.slug === 'engineering-consulting' && (
            <Link to="/journeys/engineering-consulting" className="eam-btn-outline mt-6 inline-block">
              ابدأ الاستشارة الهندسية
            </Link>
          )}
          {sector.slug === 'build-villa' && (
            <Link to="/journeys/build-villa" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة بناء المنزل
            </Link>
          )}
          {sector.slug === 'contracting' && (
            <Link to="/journeys/contracting" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة جاهزية المقاولات
            </Link>
          )}
          {sector.slug === 'real-estate-valuation' && (
            <Link to="/journeys/real-estate-valuation" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة جاهزية التقييم العقاري
            </Link>
          )}
          {sector.slug === 'smart-maintenance' && (
            <Link to="/journeys/smart-maintenance" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة جاهزية الصيانة الذكية
            </Link>
          )}
          {sector.slug === 'project-management' && (
            <Link to="/journeys/project-management" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة جاهزية إدارة المشروع
            </Link>
          )}
          {sector.slug === 'furnishing' && (
            <Link to="/journeys/furnishing" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة جاهزية التأثيث
            </Link>
          )}
          {sector.slug === 'facility-management' && (
            <Link to="/journeys/facility-management" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة جاهزية إدارة المرافق
            </Link>
          )}
          {sector.slug === 'government-services' && (
            <Link to="/journeys/government-services" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة الخدمات الحكومية
            </Link>
          )}
          {sector.slug === 'investment' && (
            <Link to="/invest" className="eam-btn-outline mt-6 inline-block">
              استثمر معنا
            </Link>
          )}
          {sector.slug === 'real-estate-development' && (
            <Link to="/journeys/real-estate-development" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة التطوير العقاري
            </Link>
          )}
          {sector.slug === 'real-estate-marketing' && (
            <Link to="/journeys/real-estate-marketing" className="eam-btn-outline mt-6 inline-block">
              ابدأ رحلة التسويق العقاري
            </Link>
          )}
          <Link to="/" className="mt-8 inline-block text-deep-gold hover:underline">
            ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </Layout>
  );
}
