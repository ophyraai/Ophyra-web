'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, Target } from 'lucide-react';

const steps = [
  { icon: MessageSquare, num: '01', titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: BarChart3, num: '02', titleKey: 'step2Title', descKey: 'step2Desc' },
  { icon: Target, num: '03', titleKey: 'step3Title', descKey: 'step3Desc' },
] as const;

function StepCard({
  icon: Icon,
  num,
  title,
  desc,
  index,
}: {
  icon: typeof MessageSquare;
  num: string;
  title: string;
  desc: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-elevated card-hover relative overflow-hidden p-8"
    >
      {/* Background glow on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-ofira-violet/5 to-transparent"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative">
        <span className="mb-4 block text-sm font-bold text-gradient">{num}</span>
        <motion.div
          className="mb-4 inline-flex rounded-xl bg-ofira-violet/10 p-3 text-ofira-violet"
          animate={{
            scale: hovered ? 1.1 : 1,
            rotate: hovered ? 5 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Icon className="size-6" />
        </motion.div>
        <h3 className="mb-2 text-xl font-semibold text-ofira-text">{title}</h3>
        <p className="text-sm leading-relaxed text-ofira-text-secondary">{desc}</p>
      </div>

      {/* Connecting line (not on last card) */}
      {index < 2 && (
        <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-ofira-violet/20 to-transparent sm:block" />
      )}
    </motion.div>
  );
}

export default function HowItWorksV2() {
  const t = useTranslations('landing.howItWorksV2');

  return (
    <section className="py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        className="mb-16 text-center"
      >
        <h2 className="text-3xl font-bold text-ofira-text sm:text-4xl">{t('title')}</h2>
      </motion.div>

      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        {steps.map(({ icon, num, titleKey, descKey }, i) => (
          <StepCard
            key={num}
            icon={icon}
            num={num}
            title={t(titleKey)}
            desc={t(descKey)}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
