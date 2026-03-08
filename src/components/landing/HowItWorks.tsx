'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageSquare, Brain, Target } from 'lucide-react';
import GlowCard from '@/components/ui/GlowCard';

const steps = [
  { icon: MessageSquare, num: '01', titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: Brain, num: '02', titleKey: 'step2Title', descKey: 'step2Desc' },
  { icon: Target, num: '03', titleKey: 'step3Title', descKey: 'step3Desc' },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  return (
    <section className="py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <h2 className="text-3xl font-bold sm:text-4xl">{t('title')}</h2>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="grid gap-6 sm:grid-cols-3"
      >
        {steps.map(({ icon: Icon, num, titleKey, descKey }) => (
          <motion.div key={num} variants={item}>
            <GlowCard className="transition-colors hover:border-ofira-violet/20">
              <div className="p-8">
                <span className="mb-4 block text-sm font-bold text-gradient">{num}</span>
                <div className="mb-4 inline-flex rounded-xl bg-ofira-violet/10 p-3 text-ofira-violet">
                  <Icon className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t(titleKey)}</h3>
                <p className="text-sm leading-relaxed text-ofira-text-secondary">{t(descKey)}</p>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
