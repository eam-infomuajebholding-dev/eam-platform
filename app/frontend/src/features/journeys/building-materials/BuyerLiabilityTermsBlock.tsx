import {
  BUYER_LIABILITY_TERMS_CLAUSES,
  BUYER_LIABILITY_TERMS_TITLE,
  BUYER_LIABILITY_TERMS_VERSION,
} from './legalTerms';

export type LiabilityTermsFromInvoice = {
  title?: string;
  version?: string;
  clauses?: { heading: string; body: string }[];
};

type Props = {
  terms?: LiabilityTermsFromInvoice | null;
  compact?: boolean;
};

export default function BuyerLiabilityTermsBlock({ terms, compact }: Props) {
  const title = terms?.title ?? BUYER_LIABILITY_TERMS_TITLE;
  const version = terms?.version ?? BUYER_LIABILITY_TERMS_VERSION;
  const clauses = terms?.clauses?.length ? terms.clauses : BUYER_LIABILITY_TERMS_CLAUSES;

  return (
    <div className="rounded-lg border border-gold/20 bg-surface/50 p-3 space-y-2" dir="rtl">
      <div>
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <p className="text-xs text-ink-secondary">الإصدار: {version}</p>
      </div>
      <div
        className={
          compact
            ? 'max-h-40 overflow-y-auto text-xs text-ink-secondary leading-relaxed space-y-3 pr-1'
            : 'text-xs text-ink-secondary leading-relaxed space-y-3'
        }
      >
        {clauses.map((clause) => (
          <div key={clause.heading}>
            <p className="font-medium text-ink">{clause.heading}</p>
            <p>{clause.body}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink-secondary/80 border-t border-gold/10 pt-2">
        هذا النص لأغراض تعاقدية تجارية عبر المنصة. يُنصح بمراجعته من مستشار قانوني قبل الاعتماد النهائي
        للمنشأة.
      </p>
    </div>
  );
}
