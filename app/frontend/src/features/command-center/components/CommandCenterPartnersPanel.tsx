import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOperationsPartner,
  createOperationsPartnerApiKey,
  createOperationsPartnerOutlet,
  createOperationsPartnerWebhook,
  getOperationsPartner,
  inviteOperationsPartnerMember,
  listOperationsPartnerApiKeys,
  listOperationsPartnerWebhooks,
  listOperationsPartnerWebhookDeliveries,
  listOperationsPartners,
  updateOperationsPartner,
} from '@/features/partners/api/partnersClient';

const JOURNEY_TYPE_OPTIONS = [
  { value: 'building_materials', label: 'مواد البناء' },
  { value: 'equipment', label: 'المعدات' },
  { value: 'contracting', label: 'المقاولات' },
  { value: 'build_villa', label: 'بناء منزل' },
  { value: 'smart_maintenance', label: 'الصيانة' },
];

export default function CommandCenterPartnersPanel() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [slug, setSlug] = useState('');
  const [legalName, setLegalName] = useState('');
  const [displayNameAr, setDisplayNameAr] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [journeyTypes, setJourneyTypes] = useState<string[]>(['building_materials']);
  const [outletCode, setOutletCode] = useState('');
  const [outletNameAr, setOutletNameAr] = useState('');
  const [outletCity, setOutletCity] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('agent');
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyReveal, setApiKeyReveal] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecretReveal, setWebhookSecretReveal] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ['operations', 'partners'],
    queryFn: listOperationsPartners,
  });

  const detailQuery = useQuery({
    queryKey: ['operations', 'partners', selectedId],
    queryFn: () => getOperationsPartner(selectedId!),
    enabled: selectedId != null,
  });

  const apiKeysQuery = useQuery({
    queryKey: ['operations', 'partners', selectedId, 'api-keys'],
    queryFn: () => listOperationsPartnerApiKeys(selectedId!),
    enabled: selectedId != null,
  });

  const webhooksQuery = useQuery({
    queryKey: ['operations', 'partners', selectedId, 'webhooks'],
    queryFn: () => listOperationsPartnerWebhooks(selectedId!),
    enabled: selectedId != null,
  });

  const webhookDeliveriesQuery = useQuery({
    queryKey: ['operations', 'partners', selectedId, 'webhook-deliveries'],
    queryFn: () => listOperationsPartnerWebhookDeliveries(selectedId!),
    enabled: selectedId != null,
  });

  const createPartnerMutation = useMutation({
    mutationFn: () =>
      createOperationsPartner({
        slug,
        legal_name: legalName,
        display_name_ar: displayNameAr,
        contact_email: contactEmail || undefined,
        journey_types: journeyTypes,
        sector_slugs: journeyTypes.includes('building_materials') ? ['building-materials'] : [],
        status: 'prospect',
      }),
    onSuccess: async (org) => {
      setSelectedId(org.id);
      setSlug('');
      setLegalName('');
      setDisplayNameAr('');
      setContactEmail('');
      await queryClient.invalidateQueries({ queryKey: ['operations', 'partners'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (orgId: number) => updateOperationsPartner(orgId, { status: 'onboarding' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations', 'partners'] });
      if (selectedId != null) {
        await queryClient.invalidateQueries({ queryKey: ['operations', 'partners', selectedId] });
      }
    },
  });

  const goLiveMutation = useMutation({
    mutationFn: (orgId: number) => updateOperationsPartner(orgId, { status: 'active' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations', 'partners'] });
      if (selectedId != null) {
        await queryClient.invalidateQueries({ queryKey: ['operations', 'partners', selectedId] });
      }
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: () =>
      inviteOperationsPartnerMember(selectedId!, {
        user_email: memberEmail.trim(),
        role: memberRole,
      }),
    onSuccess: async () => {
      setMemberEmail('');
      await queryClient.invalidateQueries({ queryKey: ['operations', 'partners', selectedId] });
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: () =>
      createOperationsPartnerApiKey(selectedId!, {
        name: apiKeyName.trim(),
        scopes: ['orders:read', 'orders:write'],
      }),
    onSuccess: async (created) => {
      setApiKeyName('');
      setApiKeyReveal(created.api_key);
      await queryClient.invalidateQueries({ queryKey: ['operations', 'partners', selectedId, 'api-keys'] });
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: () =>
      createOperationsPartnerWebhook(selectedId!, {
        url: webhookUrl.trim(),
      }),
    onSuccess: async (created) => {
      setWebhookUrl('');
      setWebhookSecretReveal(created.signing_secret);
      await queryClient.invalidateQueries({ queryKey: ['operations', 'partners', selectedId, 'webhooks'] });
    },
  });

  const createOutletMutation = useMutation({
    mutationFn: () =>
      createOperationsPartnerOutlet(selectedId!, {
        outlet_code: outletCode,
        name_ar: outletNameAr,
        city: outletCity || undefined,
      }),
    onSuccess: async () => {
      setOutletCode('');
      setOutletNameAr('');
      setOutletCity('');
      await queryClient.invalidateQueries({ queryKey: ['operations', 'partners', selectedId] });
    },
  });

  return (
    <section
      id="partners"
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-surface"
      dir="rtl"
    >
      <h3 className="text-lg font-bold text-ink dark:text-white">شركاء المنصة (مخاطبة وربط)</h3>
      <p className="mt-1 text-sm text-ink-secondary">
        سجّل الشركات المرشحة، فعّل الرحلات، وانسخ روابط منافذ البيع للعروض التقديمية.
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h4 className="font-semibold text-ink">شركاء مسجلون</h4>
          <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {(listQuery.data?.items ?? []).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-right ${
                    selectedId === item.id ? 'border-gold bg-gold/10' : 'border-soft-border'
                  }`}
                >
                  <span className="font-medium">{item.display_name_ar}</span>
                  <span className="text-ink-secondary"> — {item.slug} ({item.status})</span>
                </button>
              </li>
            ))}
          </ul>

          <h4 className="font-semibold text-ink pt-2">إضافة شركة (Prospect)</h4>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="slug (latin): acme-materials"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            dir="ltr"
          />
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="الاسم القانوني"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="الاسم المعروض للعملاء"
            value={displayNameAr}
            onChange={(e) => setDisplayNameAr(e.target.value)}
          />
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="البريد للتواصل"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            dir="ltr"
          />
          <div className="flex flex-wrap gap-2">
            {JOURNEY_TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={journeyTypes.includes(opt.value)}
                  onChange={(e) => {
                    setJourneyTypes((prev) =>
                      e.target.checked ? [...prev, opt.value] : prev.filter((v) => v !== opt.value),
                    );
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={!slug.trim() || !legalName.trim() || !displayNameAr.trim() || createPartnerMutation.isPending}
            onClick={() => createPartnerMutation.mutate()}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            حفظ كـ Prospect
          </button>
        </div>

        <div className="space-y-3">
          {detailQuery.data ? (
            <>
              <h4 className="font-semibold text-ink">{detailQuery.data.display_name_ar}</h4>
              <p className="text-sm text-ink-secondary">الحالة: {detailQuery.data.status}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded border px-3 py-1 text-xs font-semibold"
                  onClick={() => activateMutation.mutate(detailQuery.data.id)}
                >
                  → Onboarding
                </button>
                <button
                  type="button"
                  className="rounded border border-gold px-3 py-1 text-xs font-semibold text-gold"
                  onClick={() => goLiveMutation.mutate(detailQuery.data.id)}
                >
                  → Active (روابط حية)
                </button>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary mb-1">روابط مقترحة للمنفذ:</p>
                <ul className="text-xs space-y-1 font-mono" dir="ltr">
                  {detailQuery.data.sample_journey_links.map((link) => (
                    <li key={link.path} className="break-all rounded bg-surface-alt px-2 py-1">
                      {link.path}
                    </li>
                  ))}
                </ul>
              </div>
              <h4 className="font-semibold text-ink pt-2">منافذ البيع</h4>
              <ul className="text-sm space-y-1">
                {detailQuery.data.outlets.map((o) => (
                  <li key={o.id}>
                    {o.name_ar} ({o.outlet_code}) {o.city ? `— ${o.city}` : ''}
                  </li>
                ))}
              </ul>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="outlet code"
                value={outletCode}
                onChange={(e) => setOutletCode(e.target.value)}
                dir="ltr"
              />
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="اسم المنفذ"
                value={outletNameAr}
                onChange={(e) => setOutletNameAr(e.target.value)}
              />
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="المدينة"
                value={outletCity}
                onChange={(e) => setOutletCity(e.target.value)}
              />
              <button
                type="button"
                disabled={!outletCode.trim() || !outletNameAr.trim() || createOutletMutation.isPending}
                onClick={() => createOutletMutation.mutate()}
                className="rounded-lg border border-gold px-4 py-2 text-sm font-semibold text-gold disabled:opacity-60"
              >
                إضافة منفذ
              </button>

              <div className="mt-6 rounded-xl border border-gold/20 bg-surface-alt/50 p-4 space-y-3">
                <h4 className="font-semibold text-ink">بوابة الشريك والتكامل</h4>
                <p className="text-xs text-ink-secondary">
                  المستخدم يجب أن يسجّل دخولاً مرة واحدة في EAM قبل الدعوة. البوابة:{' '}
                  <span dir="ltr" className="font-mono">
                    /partner
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="flex-1 min-w-[12rem] rounded-lg border px-3 py-2 text-sm"
                    placeholder="بريد مستخدم EAM"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    dir="ltr"
                  />
                  <select
                    className="rounded-lg border px-2 py-2 text-sm"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                  >
                    <option value="owner">owner</option>
                    <option value="manager">manager</option>
                    <option value="agent">agent</option>
                  </select>
                  <button
                    type="button"
                    disabled={!memberEmail.trim() || inviteMemberMutation.isPending}
                    onClick={() => inviteMemberMutation.mutate()}
                    className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    دعوة
                  </button>
                </div>
                {inviteMemberMutation.isError ? (
                  <p className="text-xs text-red-600">تعذّرت الدعوة — تحقق من البريد وحساب EAM.</p>
                ) : null}

                <div className="pt-2 border-t border-soft-border space-y-2">
                  <p className="text-xs font-semibold">مفاتيح API</p>
                  <ul className="text-xs space-y-1">
                    {(apiKeysQuery.data ?? []).map((k) => (
                      <li key={k.id} dir="ltr">
                        {k.name} — {k.key_prefix}… ({k.scopes.join(', ')})
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border px-3 py-2 text-sm"
                      placeholder="اسم المفتاح (ERP)"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={!apiKeyName.trim() || createApiKeyMutation.isPending}
                      onClick={() => createApiKeyMutation.mutate()}
                      className="rounded-lg border border-gold px-3 py-2 text-xs font-semibold text-gold disabled:opacity-60"
                    >
                      إنشاء
                    </button>
                  </div>
                  {apiKeyReveal ? (
                    <p className="text-xs break-all rounded bg-amber-50 dark:bg-amber-950/30 p-2" dir="ltr">
                      انسخ الآن: {apiKeyReveal}
                    </p>
                  ) : null}
                </div>

                <div className="pt-2 border-t border-soft-border space-y-2">
                  <p className="text-xs font-semibold">Webhooks</p>
                  <ul className="text-xs space-y-1 break-all">
                    {(webhooksQuery.data ?? []).map((w) => (
                      <li key={w.id} dir="ltr">
                        {w.url}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border px-3 py-2 text-sm"
                      placeholder="https://partner.example/hooks/eam"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      disabled={!webhookUrl.trim() || createWebhookMutation.isPending}
                      onClick={() => createWebhookMutation.mutate()}
                      className="rounded-lg border border-gold px-3 py-2 text-xs font-semibold text-gold disabled:opacity-60"
                    >
                      اشتراك
                    </button>
                  </div>
                  {webhookSecretReveal ? (
                    <p className="text-xs break-all rounded bg-amber-50 dark:bg-amber-950/30 p-2" dir="ltr">
                      signing secret: {webhookSecretReveal}
                    </p>
                  ) : null}
                  {(webhookDeliveriesQuery.data?.length ?? 0) > 0 ? (
                    <ul className="text-[10px] space-y-1 max-h-24 overflow-y-auto mt-2">
                      {webhookDeliveriesQuery.data?.slice(0, 10).map((d) => (
                        <li key={d.id} className={d.success ? 'text-emerald-700' : 'text-red-600'}>
                          {d.event_type} · {d.success ? 'OK' : 'FAIL'}
                          {d.response_status != null ? ` (${d.response_status})` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-secondary">اختر شركة من القائمة لعرض التفاصيل والروابط.</p>
          )}
        </div>
      </div>
    </section>
  );
}
