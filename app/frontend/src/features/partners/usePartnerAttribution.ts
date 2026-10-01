import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resolvePartner } from '@/features/partners/api/partnersClient';

export function usePartnerAttribution() {
  const [searchParams] = useSearchParams();
  const partnerSlug = searchParams.get('partner')?.trim() || null;
  const outletCode = searchParams.get('outlet')?.trim() || null;

  const resolveQuery = useQuery({
    queryKey: ['partners', 'resolve', partnerSlug, outletCode],
    queryFn: () => resolvePartner(partnerSlug!, outletCode),
    enabled: Boolean(partnerSlug),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const initialContext = useMemo(() => {
    if (!partnerSlug) {
      return undefined;
    }
    return {
      partner_slug: partnerSlug,
      ...(outletCode ? { partner_outlet_code: outletCode, outlet: outletCode } : {}),
      partner: partnerSlug,
    };
  }, [outletCode, partnerSlug]);

  const banner = useMemo(() => {
    if (!partnerSlug || !resolveQuery.data) {
      return null;
    }
    const { partner, outlet } = resolveQuery.data;
    const outletLabel = outlet?.name_ar ?? null;
    return {
      partnerName: partner.display_name_ar,
      outletLabel,
    };
  }, [partnerSlug, resolveQuery.data]);

  return {
    partnerSlug,
    outletCode,
    initialContext,
    banner,
    isResolving: Boolean(partnerSlug) && resolveQuery.isLoading,
    resolveError: resolveQuery.isError,
  };
}
