# تقرير حالة الرحلات — EAM

**آخر تحديث:** 2026-09-28  
**مصدر الحقيقة:** `services/platform_architecture.py`، `GET /api/v1/platform/architecture`

## الملخص

| المؤشر | القيمة |
|--------|--------|
| قطاعات مسجّلة | 16 |
| رحلات JOS LIVE | **13** |
| بدون رحلة تشغيلية | 3 (#03 استثمار، #12 مصانع/موردين، #16 تسليم/ملاك) |
| مسار بعد الإرسال | SR → مراجعة مهنية → تأهيل → عرض سعر |
| حلقة تجارية كاملة | قبول عرض / عقد / دفع / مشروع تشغيلي — **محجوبة** |

## الرحلات LIVE (13)

1. التطوير العقاري — `/journeys/real-estate-development`  
2. التسويق العقاري — `/journeys/real-estate-marketing`  
3. بناء منزل — `/journeys/build-villa`  
4. التقييم العقاري — `/journeys/real-estate-valuation`  
5. الخدمات الحكومية — `/journeys/government-services`  
6. إدارة المشاريع — `/journeys/project-management`  
7. الاستشارات الهندسية — `/journeys/engineering-consulting`  
8. المقاولات — `/journeys/contracting`  
9. **مواد البناء** — `/journeys/building-materials` (+ PO + شريك + لوجistics)  
10. المعدات — `/journeys/equipment` (+ PO أولي + شريك/شحن عند الإسناد)  
11. الصيانة الذكية — `/journeys/smart-maintenance`  
12. إدارة المرافق — `/journeys/facility-management`  
13. التأثيث — `/journeys/furnishing`  

## آليات مشتركة

- JOS (خادم) + `JourneyShell` + `PreliminaryBriefCard`  
- إرسال → `ServiceRequest` + `intake_snapshot`  
- Ops: `/operations/service-requests`  
- E2E: `app/frontend/e2e/*journey*.spec.ts`

## مواد البناء — امتداد المنصة

- `ProcurementOrder` عند الإرسال  
- قبول الشريك → `DeliveryShipment`  
- تتبع العميل: `procurement_order` + `delivery_logistics` في snapshot وواجهة «طلباتي»  
- Ops: لوحة التوريد والتوصيل + PO/شحنة على تفاصيل الطلب (مع query `?partner_assignment_status=`)  
- Command Center: تنبيهات قبول الشريك والشحنات المعلّقة  

## محجوب / مخطط

| قطاع | السبب |
|------|--------|
| استثمار | Opportunity BO، تنظيمي |
| مصانع وموردين | Supplier BO، marketplace |
| تسليم وملاك | OperationalProject |

## مراجع

- `docs/journey-shared-mechanics.md`  
- `docs/engineering/HOW_TO_ADD_A_JOURNEY.md`  
- `docs/roadmap/EAM_REMAINING_WORK_REGISTER.md`
