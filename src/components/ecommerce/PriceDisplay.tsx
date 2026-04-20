interface Props {
  priceCents: number;
  compareAtCents?: number | null;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showSavings?: boolean;
  locale?: 'es' | 'en';
  className?: string;
}

function formatMoney(cents: number, currency: string, locale: 'es' | 'en') {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function PriceDisplay({
  priceCents,
  compareAtCents,
  currency = 'eur',
  size = 'md',
  showSavings = true,
  locale = 'es',
  className = '',
}: Props) {
  const hasCompare =
    compareAtCents != null && compareAtCents > priceCents && priceCents > 0;

  const priceText = formatMoney(priceCents, currency, locale);
  const compareText = hasCompare
    ? formatMoney(compareAtCents!, currency, locale)
    : null;
  const savingsCents = hasCompare ? compareAtCents! - priceCents : 0;
  const savingsText = hasCompare
    ? formatMoney(savingsCents, currency, locale)
    : null;
  const percentOff = hasCompare
    ? Math.round((savingsCents / compareAtCents!) * 100)
    : 0;

  const sizing = {
    sm: {
      price: 'text-sm font-bold',
      compare: 'text-[11px]',
      badge: 'text-[10px] px-1.5 py-0.5',
      savings: 'text-[11px]',
    },
    md: {
      price: 'text-lg font-bold',
      compare: 'text-sm',
      badge: 'text-[11px] px-2 py-0.5',
      savings: 'text-xs',
    },
    lg: {
      price: 'text-3xl font-bold',
      compare: 'text-lg',
      badge: 'text-xs px-2.5 py-1',
      savings: 'text-sm',
    },
  }[size];

  return (
    <div className={['flex flex-col gap-0.5', className].join(' ')}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span
          className={[
            sizing.price,
            hasCompare ? 'text-rose-600' : 'text-ofira-text',
          ].join(' ')}
        >
          {priceText}
        </span>
        {hasCompare && (
          <>
            <span
              className={[
                sizing.compare,
                'text-ofira-text-secondary/70 line-through',
              ].join(' ')}
            >
              {compareText}
            </span>
            <span
              className={[
                sizing.badge,
                'inline-flex items-center rounded-full bg-rose-600 font-bold uppercase tracking-wide text-white',
              ].join(' ')}
            >
              −{percentOff}%
            </span>
          </>
        )}
      </div>
      {hasCompare && showSavings && (
        <span
          className={[
            sizing.savings,
            'font-medium text-rose-600',
          ].join(' ')}
        >
          Ahorras {savingsText}
        </span>
      )}
    </div>
  );
}
