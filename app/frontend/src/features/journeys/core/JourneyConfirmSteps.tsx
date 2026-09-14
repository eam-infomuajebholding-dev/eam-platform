import { JourneyCheckboxConfirm } from '@/features/journeys/core/JourneyFieldControls';
import { useLanguage } from '@/contexts/LanguageContext';

export function JourneyScopeConfirmStep({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  const { t } = useLanguage();
  return (
    <JourneyCheckboxConfirm
      checked={checked}
      onChange={onChange}
      label={label ?? t('journey.confirm.scope')}
    />
  );
}

export function JourneySubmitConfirmStep({
  checked,
  onChange,
  preamble,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  preamble?: string;
  label?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      {preamble ? <p className="text-sm text-ink-secondary">{preamble}</p> : null}
      <JourneyCheckboxConfirm
        checked={checked}
        onChange={onChange}
        label={label ?? t('journey.confirm.submit')}
      />
    </div>
  );
}

export function JourneyIntakeCompleteStep({ message }: { message: string }) {
  return <p className="text-sm text-ink-secondary">{message}</p>;
}
