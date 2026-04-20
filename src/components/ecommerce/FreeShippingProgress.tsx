'use client';

import { motion } from 'framer-motion';
import { Truck, PartyPopper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { calculateShipping, SHIPPING_ZONES } from '@/lib/shipping';

interface Props {
  subtotalCents: number;
  countryCode?: string;
  variant?: 'compact' | 'full';
  locale?: 'es' | 'en';
  className?: string;
}

function formatMoney(cents: number, locale: 'es' | 'en') {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export default function FreeShippingProgress({
  subtotalCents,
  countryCode = 'ES',
  variant = 'full',
  locale = 'es',
  className = '',
}: Props) {
  const t = useTranslations('shipping.progress');
  const calc = calculateShipping(countryCode, subtotalCents);
  const progress = Math.min(
    1,
    calc.free_threshold_cents > 0
      ? subtotalCents / calc.free_threshold_cents
      : 0,
  );

  const zoneLabel =
    locale === 'en'
      ? SHIPPING_ZONES[calc.zone].label_en
      : SHIPPING_ZONES[calc.zone].label_es;

  const isCompact = variant === 'compact';

  if (calc.is_free) {
    return (
      <div
        className={[
          'flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800',
          isCompact ? 'px-3 py-2 text-xs font-semibold' : 'px-4 py-3 text-sm font-semibold',
          className,
        ].join(' ')}
      >
        <PartyPopper className={isCompact ? 'size-3.5' : 'size-4'} />
        <span>
          {t('unlocked')}{' '}
          <span className="font-normal text-emerald-700/80">
            ({zoneLabel})
          </span>
        </span>
      </div>
    );
  }

  const remaining = formatMoney(calc.amount_to_free_cents, locale);

  return (
    <div
      className={[
        'rounded-xl border border-ofira-card-border bg-white',
        isCompact ? 'px-3 py-2.5' : 'px-4 py-3',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center gap-2 text-ofira-text',
          isCompact ? 'text-xs' : 'text-sm',
        ].join(' ')}
      >
        <Truck
          className={[
            'shrink-0 text-ofira-violet',
            isCompact ? 'size-3.5' : 'size-4',
          ].join(' ')}
        />
        <span className="font-medium">
          {t('remaining', { amount: remaining })}
        </span>
      </div>
      <div
        className={[
          'relative overflow-hidden rounded-full bg-ofira-surface1',
          isCompact ? 'mt-1.5 h-1.5' : 'mt-2 h-2',
        ].join(' ')}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-ofira-violet to-ofira-mint"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {!isCompact && (
        <p className="mt-1.5 text-[11px] text-ofira-text-secondary">
          {t('toZone', { zone: zoneLabel })}
        </p>
      )}
    </div>
  );
}
