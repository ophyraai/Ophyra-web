'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface StatCounterProps {
  target: number;
  suffix: string;
  label: string;
  delay?: number;
}

function StatCounter({ target, suffix, label, delay = 0 }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) {
      return `${(v / 1000).toFixed(v >= 1000 ? 0 : 1)}K`;
    }
    return Math.floor(v).toLocaleString();
  });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, target, {
      duration: 2,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
    });
    return controls.stop;
  }, [isInView, count, target, delay]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4">
      <span className="text-4xl font-bold text-gradient sm:text-5xl">
        <motion.span>{rounded}</motion.span>
        {suffix}
      </span>
      <span className="text-sm font-medium text-ofira-text-secondary">{label}</span>
    </div>
  );
}

export default function SocialStats() {
  const t = useTranslations('landing.socialStats');

  return (
    <section className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16"
      >
        <StatCounter target={90000} suffix="+" label={t('followers')} delay={0} />
        <StatCounter target={2800} suffix="+" label={t('diagnoses')} delay={0.15} />
        <StatCounter target={15} suffix="+" label={t('countries')} delay={0.3} />
      </motion.div>
    </section>
  );
}
