'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import ShimmerButton from '@/components/ui/ShimmerButton';

function FloatingDot({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full ${className}`}
      animate={{
        y: [0, -20, 5, -15, 0],
        x: [0, 10, -8, 12, 0],
        opacity: [0.4, 0.8, 0.5, 0.7, 0.4],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function CommunityGrowth() {
  const t = useTranslations('landing.communityGrowth');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());

  const weeklyCount = 347;

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, weeklyCount, {
      duration: 1.8,
      ease: [0.25, 0.1, 0.25, 1],
    });
    return controls.stop;
  }, [isInView, count]);

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-ofira-surface1 to-ofira-surface2 p-10 sm:p-16">
        {/* Animated decorative blurs */}
        <motion.div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-ofira-violet/[0.08] blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-ofira-peach/[0.08] blur-3xl"
          animate={{ scale: [1, 1.15, 1], y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Floating dots */}
        <FloatingDot className="top-8 right-12 size-2 bg-ofira-violet/40" delay={0} />
        <FloatingDot className="top-1/4 left-8 size-1.5 bg-ofira-peach/40" delay={1.5} />
        <FloatingDot className="bottom-12 right-1/4 size-2.5 bg-ofira-mint/30" delay={3} />
        <FloatingDot className="bottom-1/3 left-1/3 size-1.5 bg-ofira-violet/30" delay={4.5} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center text-center"
        >
          <h2 className="mb-2 text-2xl font-bold text-ofira-text sm:text-3xl">
            {t('title', { count: '' })}
            <span className="text-gradient">
              <motion.span>{rounded}</motion.span>
            </span>
            {' '}
          </h2>
          <p className="mb-8 text-lg text-ofira-text-secondary">{t('subtitle')}</p>

          <ShimmerButton href="/diagnosis">
            {t('cta')}
            <ArrowRight className="size-4" />
          </ShimmerButton>
        </motion.div>
      </div>
    </section>
  );
}
