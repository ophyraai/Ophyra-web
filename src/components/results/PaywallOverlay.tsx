'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles, Shield, Check, Clock, Users } from 'lucide-react';
import ShimmerButton from '@/components/ui/ShimmerButton';

const COUNTDOWN_KEY = 'ophyra:paywall_expires';
const COUNTDOWN_HOURS = 24;

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    let expires: number;
    try {
      const saved = localStorage.getItem(COUNTDOWN_KEY);
      if (saved && Number(saved) > Date.now()) {
        expires = Number(saved);
      } else {
        expires = Date.now() + COUNTDOWN_HOURS * 3600000;
        localStorage.setItem(COUNTDOWN_KEY, String(expires));
      }
    } catch {
      expires = Date.now() + COUNTDOWN_HOURS * 3600000;
    }

    const tick = () => {
      const diff = Math.max(0, expires - Date.now());
      if (diff <= 0) {
        setTimeLeft('');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

interface PaywallOverlayProps {
  diagnosisId: string;
  email: string;
  locale: string;
}

export default function PaywallOverlay({
  diagnosisId,
  email,
  locale,
}: PaywallOverlayProps) {
  const t = useTranslations('results.unlock');
  const [loading, setLoading] = useState(false);
  const countdown = useCountdown();

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosisId, email, locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout failed:', data);
        alert(data.error || 'Error al crear la sesión de pago.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const features = t.raw('features') as string[];

  return (
    <motion.div
      data-paywall
      className="relative my-8 overflow-hidden rounded-2xl p-8 text-center"
      style={{
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        background: 'linear-gradient(to bottom, rgba(248,247,252,0.9), rgba(240,238,245,0.95))',
        border: '1px solid transparent',
        backgroundClip: 'padding-box',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Animated gradient border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, #0d9488, #059669)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />

      {/* Glow effect */}
      <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-ofira-violet/20 blur-3xl" />

      <div className="relative">
        {/* Discount badge */}
        <motion.div
          className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
        >
          <Clock className="h-3 w-3" />
          {t('badge')}
        </motion.div>

        {/* Countdown timer */}
        {countdown && (
          <p className="mb-3 font-mono text-sm font-semibold text-red-600">
            {t('expiresIn')} {countdown}
          </p>
        )}

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ofira-violet/10">
          <Sparkles className="h-6 w-6 text-ofira-violet" />
        </div>

        <h3
          className="mb-2 text-xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('title')}
        </h3>

        <p className="mx-auto mb-5 max-w-md text-sm text-ofira-text-secondary">
          {t('subtitle')}
        </p>

        {/* Feature list */}
        <div className="mx-auto mb-6 max-w-xs space-y-2.5 text-left">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-2.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                <Check className="h-2.5 w-2.5 text-emerald-600" />
              </div>
              <span className="text-sm text-ofira-text-secondary">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mx-auto mb-3 flex max-w-xs items-center gap-3 rounded-lg bg-emerald-50/60 px-4 py-2.5">
          <Users className="size-4 flex-shrink-0 text-emerald-600" />
          <p className="text-left text-xs text-emerald-800">
            <span className="font-bold">{t('socialProofCount')}</span> {t('socialProofText')}
          </p>
        </div>

        {/* Mini testimonial */}
        <div className="mx-auto mb-5 max-w-xs rounded-lg border border-ofira-card-border bg-white/60 px-4 py-3">
          <p className="text-xs italic text-ofira-text-secondary">
            &ldquo;{t('testimonial')}&rdquo;
          </p>
          <p className="mt-1 text-[11px] font-semibold text-ofira-text">
            — {t('testimonialAuthor')}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <span className="text-lg text-ofira-text-secondary line-through">{t('originalPrice')}</span>
          <span
            className="text-3xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #0d9488, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('price')}
          </span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600">
            {t('discount')}
          </span>
        </div>

        {/* Digital content consent (EU withdrawal right waiver) */}
        <p className="mx-auto mb-4 max-w-xs text-[10px] leading-relaxed text-ofira-text-secondary/70">
          {t('digitalConsent')}
        </p>

        <ShimmerButton
          onClick={handleUnlock}
          disabled={loading}
          className="text-lg"
        >
          {loading ? (
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            t('cta')
          )}
        </ShimmerButton>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ofira-text-secondary">
          <Shield className="h-3.5 w-3.5" />
          <span>{t('trust')}</span>
        </div>
      </div>
    </motion.div>
  );
}
