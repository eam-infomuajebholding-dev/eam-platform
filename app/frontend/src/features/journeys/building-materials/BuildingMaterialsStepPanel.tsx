import JourneyStepPanelShell from '@/features/journeys/core/JourneyStepPanelShell';
import type { JourneyStepPanelProps } from '@/features/journeys/core/journeyStepPanel';
import { JourneyTextField } from '@/features/journeys/core/JourneyFieldControls';
import { Checkbox } from '@/components/ui/checkbox';
import { STEP_LABELS, STEP_ORDER } from './constants';
import { type BuildingMaterialsStepValues } from './errors';
import type { BuildingMaterialsContext } from './types';
import MaterialsIntakeSection from './MaterialsIntakeSection';
import ProcurementInvoiceCard from './ProcurementInvoiceCard';
import { BUYER_LIABILITY_TERMS_VERSION, liabilityTermsCheckboxLabel } from './legalTerms';

type Props = JourneyStepPanelProps<BuildingMaterialsStepValues, BuildingMaterialsContext>;

export default function BuildingMaterialsStepPanel({
  currentStep,
  context,
  values,
  onChange,
  fieldErrors,
  formError,
  isLoading,
  isTerminal,
  isCompleted,
  onAdvance,
  onComplete,
  onRevisit,
  completedMessage,
}: Props) {
  const update = (patch: Partial<BuildingMaterialsStepValues>) => onChange({ ...values, ...patch });
  const invoice = context.procurement_invoice as Record<string, unknown> | undefined;

  const renderFields = () => {
    if (!currentStep) return null;

    switch (currentStep) {
      case 'materials_intake':
        return (
          <MaterialsIntakeSection
            intakeChannel={values.intakeChannel}
            materialsList={values.materialsList}
            materialsImageUrl={values.materialsImageUrl}
            assistantTranscript={values.assistantTranscript}
            onChange={(patch) =>
              update({
                ...(patch.intakeChannel !== undefined ? { intakeChannel: patch.intakeChannel } : {}),
                ...(patch.materialsList !== undefined ? { materialsList: patch.materialsList } : {}),
                ...(patch.materialsImageUrl !== undefined
                  ? { materialsImageUrl: patch.materialsImageUrl }
                  : {}),
                ...(patch.assistantTranscript !== undefined
                  ? { assistantTranscript: patch.assistantTranscript }
                  : {}),
              })
            }
          />
        );
      case 'requester_identity':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.requesterName}
              onChange={(requesterName) => update({ requesterName })}
              placeholder="الاسم الكامل"
            />
            <JourneyTextField
              value={values.requesterPhone}
              onChange={(requesterPhone) => update({ requesterPhone })}
              placeholder="05xxxxxxxx"
              dir="ltr"
            />
            <p className="text-xs text-ink-secondary">سنرسل رمز تأكيد إلى هذا الرقم.</p>
          </div>
        );
      case 'phone_verification':
        return (
          <div className="space-y-3">
            <JourneyTextField
              value={values.otpCode}
              onChange={(otpCode) => update({ otpCode })}
              placeholder="رمز التحقق (6 أرقام)"
              dir="ltr"
            />
            <p className="text-xs text-ink-secondary">
              أدخل الرمز المرسل إلى جوالك. في بيئة التطوير يمكن ضبط `JOURNEY_DEV_OTP` في الخادم.
            </p>
          </div>
        );
      case 'delivery_location':
        return (
          <JourneyTextField
            value={values.deliveryLocation}
            onChange={(deliveryLocation) => update({ deliveryLocation })}
            placeholder="المدينة، الحي، وصف الموقع أو رابط الخريطة"
          />
        );
      case 'procurement_invoice':
        return invoice ? (
          <ProcurementInvoiceCard invoice={invoice as Parameters<typeof ProcurementInvoiceCard>[0]['invoice']} />
        ) : (
          <p className="text-sm text-ink-secondary">جاري تجهيز الفاتورة...</p>
        );
      case 'invoice_confirm': {
        const termsVersion =
          (invoice?.buyer_liability_terms as { version?: string } | undefined)?.version ??
          BUYER_LIABILITY_TERMS_VERSION;
        return (
          <div className="space-y-4">
            {invoice ? (
              <ProcurementInvoiceCard invoice={invoice as Parameters<typeof ProcurementInvoiceCard>[0]['invoice']} />
            ) : null}
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={values.invoiceConfirmed}
                onCheckedChange={(checked) => update({ invoiceConfirmed: checked === true })}
              />
              <span>أؤكد قائمة المشتريات والكميات الواردة في الفاتورة.</span>
            </label>
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={values.buyerLiabilityTermsAccepted}
                onCheckedChange={(checked) =>
                  update({ buyerLiabilityTermsAccepted: checked === true })
                }
              />
              <span>{liabilityTermsCheckboxLabel(termsVersion)}</span>
            </label>
          </div>
        );
      }
      case 'intake_complete':
        return (
          <div className="space-y-4">
            {invoice ? (
              <ProcurementInvoiceCard
                invoice={invoice as Parameters<typeof ProcurementInvoiceCard>[0]['invoice']}
                showLiabilityTerms={false}
              />
            ) : null}
            <p className="text-sm text-ink-secondary">
              بعد إرسال الطلب، انتقل إلى «طلباتي» لإتمام الدفع عند إصدار عرض السعر النهائي.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <JourneyStepPanelShell
      currentStep={currentStep}
      stepLabels={STEP_LABELS}
      fieldErrors={fieldErrors}
      formError={formError}
      isLoading={isLoading}
      isTerminal={isTerminal}
      isCompleted={isCompleted}
      completedMessage={completedMessage}
      stepOrder={STEP_ORDER}
      onAdvance={onAdvance}
      onComplete={onComplete}
      onRevisit={onRevisit}
      completeLabel="إرسال الطلب"
    >
      {renderFields()}
    </JourneyStepPanelShell>
  );
}
