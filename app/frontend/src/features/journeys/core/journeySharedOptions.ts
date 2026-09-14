import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const URGENCY_OPTION_VALUES = ['standard', 'soon', 'urgent'] as const;

/** Static labels for read-only summaries (Arabic default — matches intake snapshot display). */
export const URGENCY_OPTIONS = [
  { value: 'standard', label: 'عادي' },
  { value: 'soon', label: 'قريباً' },
  { value: 'urgent', label: 'عاجل' },
] as const;

export function useUrgencyOptions() {
  const { t } = useLanguage();
  return useMemo(
    () =>
      URGENCY_OPTION_VALUES.map((value) => ({
        value,
        label: t(`journey.option.urgency.${value}`),
      })),
    [t],
  );
}
