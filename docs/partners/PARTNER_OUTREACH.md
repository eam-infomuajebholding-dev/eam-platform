# Partner outreach — ربط الشركات ومنافذ البيع

## ما هو جاهز في المنصة

1. **سجل الشركاء** (`partner_organizations`) وحالة دورة الحياة: `prospect` → `onboarding` → `active`.
2. **منافذ البيع** (`partner_outlets`) برمز فرع (`outlet_code`) ومدينة.
3. **روابط عميقة** للرحلات مع إسناد تلقائي للطلب:
   - `/journeys/building-materials?partner=SLUG`
   - `/journeys/building-materials?partner=SLUG&outlet=OUTLET_CODE`
4. **لوحة المالك (Command Center)** — قسم «شركاء المنصة»: تسجيل Prospect، تفعيل، نسخ روابط.
5. **العمليات** — لقطة الطلب تعرض «إسناد الشريك» عند وجود `partner_attribution`.

## سير مخاطبة شركة (مقترح)

| المرحلة | الحالة في النظام | إجراء الفريق |
|---------|------------------|--------------|
| قائمة مرشحين | `prospect` | تسجيل الاسم، SLUG، الرحلات الم allowed، جهة اتصال |
| توقيع/تجهيز | `onboarding` | إنشاء منافذ، اختبار الروابط داخلياً |
| إطلاق | `active` | إرسال الروابط للشركة (QR، SMS، لوحة فرع) |
| إيقاف | `suspended` | لا يقبل الروابط العامة |

## API (Ops — admin)

- `GET/POST /api/v1/operations/partners`
- `GET/PATCH /api/v1/operations/partners/{id}`
- `POST /api/v1/operations/partners/{id}/outlets`

## API (عام — للتحقق من الرابط)

- `GET /api/v1/partners/resolve?partner=...&outlet=...`

## منفّذ (منصة B2B)

- بوابة `/partner` — قبول/رفض الطلبات
- API keys + Webhooks (Command Center)
- **أمر الشراء (PO)** مرتبط بالطلب عند مواد البناء — يتزامن مع قبول/رفض الشريك

راجع [PARTNER_PLATFORM.md](./PARTNER_PLATFORM.md) و [PLATFORM_ARCHITECTURE.md](../engineering/PLATFORM_ARCHITECTURE.md).

## Migration

```bash
cd app/backend && alembic upgrade head
```

Head: `b9c0d1e2f4a5`
