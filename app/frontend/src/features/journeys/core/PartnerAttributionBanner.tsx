type Props = {
  partnerName: string;
  outletLabel?: string | null;
};

export default function PartnerAttributionBanner({ partnerName, outletLabel }: Props) {
  return (
    <div
      className="mb-4 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-sm text-ink-secondary"
      dir="rtl"
    >
      <span className="text-ink font-medium">بالتعاون مع: </span>
      {partnerName}
      {outletLabel ? <span>{` — ${outletLabel}`}</span> : null}
    </div>
  );
}
