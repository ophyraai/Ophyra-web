'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface HabitChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const chipKeys = [
  'sleep', 'exercise', 'nutrition', 'hydration',
  'stress', 'productivity', 'screenTime', 'socialLife',
] as const;

export default function HabitChips({ value, onChange }: HabitChipsProps) {
  const t = useTranslations('diagnosis.q9');
  const selected = value || [];

  const toggle = (key: string) => {
    try { navigator.vibrate?.(10); } catch {}
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next);
  };

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <p className="mb-10 text-sm text-ofira-text-secondary">{t('subtitle')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {chipKeys.map((key) => {
          const isSelected = selected.includes(key);
          return (
            <motion.button
              key={key}
              onClick={() => toggle(key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isSelected ? { scale: [1, 1.15, 1.05] } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-ofira-violet bg-ofira-violet text-white'
                  : 'border-ofira-card-border bg-ofira-card text-ofira-text-secondary hover:border-ofira-violet/30'
              }`}
            >
              {t(`chips.${key}`)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
