'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ProgressBarProps {
  progress: number;
  current: number;
  total: number;
}

export default function ProgressBar({ progress, current, total }: ProgressBarProps) {
  const t = useTranslations('diagnosis');

  return (
    <div className="w-full px-4 py-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-2 flex items-center justify-between text-sm text-ofira-text-secondary">
          <span>{t('progress', { current, total })}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ofira-card">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-ofira-teal to-ofira-emerald"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    </div>
  );
}
