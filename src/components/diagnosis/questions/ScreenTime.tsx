'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';

interface ScreenTimeProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ScreenTime({ value, onChange }: ScreenTimeProps) {
  const t = useTranslations('diagnosis.q4');
  const current = value ?? 0;

  return (
    <div className="w-full max-w-md text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.max(0, current - 0.5))}
          disabled={current <= 0}
          className="flex size-14 items-center justify-center rounded-full border border-ofira-card-border bg-ofira-card text-ofira-text transition-colors hover:border-ofira-violet/30 disabled:opacity-30"
        >
          <Minus className="size-6" />
        </motion.button>

        <div className="flex min-w-[120px] flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={current}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-6xl font-bold text-ofira-violet"
            >
              {current}
            </motion.span>
          </AnimatePresence>
          <span className="mt-1 text-sm text-ofira-text-secondary">{t('unit')}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.min(16, current + 0.5))}
          disabled={current >= 16}
          className="flex size-14 items-center justify-center rounded-full border border-ofira-card-border bg-ofira-card text-ofira-text transition-colors hover:border-ofira-violet/30 disabled:opacity-30"
        >
          <Plus className="size-6" />
        </motion.button>
      </div>
    </div>
  );
}
