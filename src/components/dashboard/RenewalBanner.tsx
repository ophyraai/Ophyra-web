'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RenewalBannerProps {
  email: string;
  renewalOfferExpires: string | null;
  locale?: string;
}

export default function RenewalBanner({ email, renewalOfferExpires, locale = 'es' }: RenewalBannerProps) {
  const t = useTranslations('dashboard.renewal');
  const [timeLeft, setTimeLeft] = useState('');

  const offerActive = renewalOfferExpires && new Date(renewalOfferExpires) > new Date();

  useEffect(() => {
    if (!offerActive || !renewalOfferExpires) return;

    function updateCountdown() {
      const diff = new Date(renewalOfferExpires!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(days > 0 ? `${days}d ${hours}h` : `${hours}h`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [offerActive, renewalOfferExpires]);

  const renewalUrl = `/api/payments/renewal-checkout?email=${encodeURIComponent(email)}&locale=${locale}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-teal-500/10 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 text-amber-400" />
          <div>
            <p className="font-semibold text-ofira-text">{t('title')}</p>
            <p className="mt-1 text-sm text-ofira-text-secondary">{t('description')}</p>
            {offerActive && timeLeft && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400">
                <Clock className="size-3.5" />
                <span>{t('countdown', { time: timeLeft })}</span>
              </div>
            )}
          </div>
        </div>
        <a
          href={renewalUrl}
          className="shrink-0 rounded-lg bg-gradient-to-r from-amber-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
        >
          {offerActive ? t('ctaDiscount') : t('cta')}
        </a>
      </div>
    </motion.div>
  );
}
