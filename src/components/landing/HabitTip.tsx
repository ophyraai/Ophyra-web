'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Lightbulb, Droplets, Moon, Dumbbell, Brain, Apple, Zap } from 'lucide-react';

interface TipData {
  content: string;
  category: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  hydration: Droplets,
  sleep: Moon,
  exercise: Dumbbell,
  stress: Brain,
  nutrition: Apple,
  productivity: Zap,
  general: Lightbulb,
};

export default function HabitTip() {
  const t = useTranslations('landing.habitTip');
  const [tip, setTip] = useState<TipData>({
    content: t('fallback'),
    category: 'hydration',
  });

  useEffect(() => {
    async function fetchTip() {
      try {
        const res = await fetch('/api/social/stats');
        if (!res.ok) return;
        const data = await res.json();
        if (data.tip?.content) {
          setTip(data.tip);
        }
      } catch {
        // Keep fallback
      }
    }
    fetchTip();
  }, []);

  const IconComponent = categoryIcons[tip.category] || Lightbulb;

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="card-elevated flex items-start gap-4 p-6 sm:p-8"
        >
          {/* Animated icon */}
          <motion.div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ofira-violet/8 text-ofira-violet"
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <IconComponent className="size-6" />
          </motion.div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ofira-violet">
              {t('title')}
            </h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-base leading-relaxed text-ofira-text-secondary"
            >
              {tip.content}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
