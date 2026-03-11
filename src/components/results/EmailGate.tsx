'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { UserPlus, Shield, LogIn } from 'lucide-react';
import ShimmerButton from '@/components/ui/ShimmerButton';
import ScoreCounter from './ScoreCounter';
import Link from 'next/link';

interface EmailGateProps {
  diagnosisId: string;
  score: number;
  name: string;
  onUnlock: (email: string) => void;
}

export default function EmailGate({ diagnosisId, score, name }: EmailGateProps) {
  const t = useTranslations('results.emailGate');
  const redirectPath = `/diagnosis/${diagnosisId}`;

  return (
    <div className="min-h-screen bg-ofira-bg px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Score teaser */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="mb-2 text-sm text-ofira-text-secondary">
            {name ? `${name}, ` : ''}{t('scoreReady')}
          </p>
          <h1
            className="text-3xl font-bold md:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('yourScore')}
          </h1>
        </motion.div>

        {/* Score + blurred preview stacked tight */}
        <div className="relative mb-6 flex justify-center">
          <ScoreCounter score={score} />
        </div>

        {/* FREE badge */}
        <motion.div
          className="mb-4 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
            {t('freeBadge')}
          </span>
        </motion.div>

        {/* Blurred preview – immediately below score */}
        <div className="relative mb-2 overflow-hidden rounded-xl">
          <div className="space-y-2.5 blur-md select-none pointer-events-none px-4">
            <div className="h-10 rounded-lg bg-ofira-surface1" />
            <div className="h-10 rounded-lg bg-ofira-surface1" />
            <div className="h-10 rounded-lg bg-ofira-surface1" />
            <div className="h-10 rounded-lg bg-ofira-surface1" />
            <div className="h-10 rounded-lg bg-ofira-surface1" />
            <div className="h-10 rounded-lg bg-ofira-surface1" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ofira-bg via-ofira-bg/80 to-transparent" />
        </div>

        {/* Auth capture card */}
        <motion.div
          className="relative overflow-hidden rounded-2xl p-8 text-center"
          style={{
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            background: 'linear-gradient(to bottom, rgba(248,247,252,0.9), rgba(240,238,245,0.95))',
            border: '1px solid transparent',
            backgroundClip: 'padding-box',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Gradient border */}
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

          <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-ofira-violet/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ofira-violet/10">
              <UserPlus className="h-6 w-6 text-ofira-violet" />
            </div>

            <h3
              className="mb-2 text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('title')}
            </h3>

            <p className="mx-auto mb-6 max-w-sm text-sm text-ofira-text-secondary">
              {t('subtitle')}
            </p>

            <div className="space-y-3">
              <Link href={`/auth/signup?redirect=${encodeURIComponent(redirectPath)}`}>
                <ShimmerButton className="w-full text-base">
                  <UserPlus className="h-4 w-4" />
                  {t('ctaSignup')}
                </ShimmerButton>
              </Link>

              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirectPath)}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-ofira-card-border bg-white py-3 text-sm font-medium text-ofira-text transition-colors hover:border-ofira-violet/30"
              >
                <LogIn className="h-4 w-4" />
                {t('ctaLogin')}
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ofira-text-secondary">
              <Shield className="h-3.5 w-3.5" />
              <span>{t('privacy')}</span>
            </div>
          </div>
        </motion.div>

        <div className="h-16" />
      </div>
    </div>
  );
}
