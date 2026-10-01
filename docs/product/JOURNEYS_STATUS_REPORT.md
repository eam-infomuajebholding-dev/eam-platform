# تقرير حالة الرحلات — EAM

**آخر تحديث:** 2026-10-01  
**مصدر الحقيقة:** `services/platform_architecture.py`، `GET /api/v1/platform/architecture`

## الملخص

| المؤشر | القيمة |
|--------|--------|
| قطاعات مسجّلة | 16 |
| رحلات JOS LIVE | **16** |
| مسار بعد الإرسال | SR → مراجعة مهنية → تأهيل → عرض سعر |
| حلقة تجارية | قبول عرض → عقد (سجل) → مشروع تشغيلي → دفع Stripe |

## الرحلات LIVE (16)

1. التطوير العقاري — `/journeys/real-estate-development`  
2. التسويق العقاري — `/journeys/real-estate-marketing`  
3. **الاستثمار** — `/journeys/investment` (اهتمام أولي — بدون وعود عائد)  
4. بناء منزل — `/journeys/build-villa`  
5. التقييم العقاري — `/journeys/real-estate-valuation`  
6. الخدمات الحكومية — `/journeys/government-services`  
7. إدارة المشاريع — `/journeys/project-management`  
8. الاستشارات الهندسية — `/journeys/engineering-consulting`  
9. المقاولات — `/journeys/contracting`  
10. مواد البناء — `/journeys/building-materials` (+ PO + شريك + logistics)  
11. المعدات — `/journeys/equipment` (+ PO أولي)  
12. **المصانع والموردين** — `/journeys/factories-suppliers`  
13. الصيانة الذكية — `/journeys/smart-maintenance`  
14. إدارة المرافق — `/journeys/facility-management`  
15. التأثيث — `/journeys/furnishing`  
16. **التسليم وخدمات الملاك** — `/journeys/delivery-warranty`  

## Alembic

رأس السلسلة: **`d1e2f3a4b5c7`** (16 journeys + commercial tables)

## مراجع

- `docs/roadmap/EAM_REMAINING_WORK_REGISTER.md`  
- `docs/engineering/HOW_TO_ADD_A_JOURNEY.md`
