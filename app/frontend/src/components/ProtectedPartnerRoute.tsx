import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { fetchPartnerMe } from '@/features/partners/api/partnerPortalClient';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

export default function ProtectedPartnerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <PartnerGate>{children}</PartnerGate>
    </ProtectedRoute>
  );
}

function PartnerGate({ children }: { children: React.ReactNode }) {
  const query = useQuery({
    queryKey: ['partner', 'me'],
    queryFn: fetchPartnerMe,
    retry: false,
  });

  if (query.isLoading) {
    return <p className="p-8 text-center text-sm text-ink-secondary">جاري التحقق من حساب الشريك...</p>;
  }

  if (query.isError) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-3" dir="rtl">
        <p className="text-ink font-semibold">بوابة الشركاء</p>
        <p className="text-sm text-ink-secondary">
          هذا الحساب غير مرتبط بشركة شريكة. تواصل مع فريق EAM لتفعيل الوصول بعد اتفاق الربط.
        </p>
        <Navigate to="/my-requests" replace />
      </div>
    );
  }

  return <>{children}</>;
}
