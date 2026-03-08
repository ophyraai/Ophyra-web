'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lock, Shield } from 'lucide-react';
import ShimmerButton from '@/components/ui/ShimmerButton';

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

  return (
    <motion.div
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ofira-violet/10">
          <Lock className="h-6 w-6 text-ofira-violet" />
        </div>

        <h3
          className="mb-2 text-xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('title')}
        </h3>

        <p className="mx-auto mb-6 max-w-md text-sm text-ofira-text-secondary">
          {t('subtitle')}
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
          <span>{t('guarantee')}</span>
        </div>
      </div>
    </motion.div>
  );
}
