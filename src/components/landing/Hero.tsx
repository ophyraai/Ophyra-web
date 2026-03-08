'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import MeshGradientBg from '@/components/ui/MeshGradientBg';
import ParticleField from '@/components/ui/ParticleField';
import ShimmerButton from '@/components/ui/ShimmerButton';

export default function Hero() {
  const t = useTranslations('landing.hero');
  const words = t('title').split(' ');

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <MeshGradientBg />
      <ParticleField count={25} className="-z-[5]" />

      <div className="flex max-w-3xl flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-ofira-violet/20 bg-ofira-violet/5 px-4 py-1.5 text-sm text-ofira-violet shadow-[0_0_15px_rgba(196,161,255,0.15)] animate-pulse-glow"
        >
          <Sparkles className="size-3.5" />
          {t('badge')}
        </motion.div>

        {/* Title with staggered word reveal */}
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="mr-[0.3em] inline-block bg-gradient-to-r from-ofira-violet to-ofira-peach bg-clip-text text-transparent last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-10 max-w-xl text-lg text-ofira-text-secondary sm:text-xl"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <ShimmerButton href="/diagnosis">{t('cta')}</ShimmerButton>
          <span className="text-sm text-ofira-text-secondary">{t('ctaSub')}</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="size-6 text-ofira-text-secondary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
