'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Clock, Target, Compass, Repeat, AlertTriangle } from 'lucide-react';

interface ObstacleCardsProps {
  value: string;
  onChange: (value: string) => void;
}

const obstacleKeys = ['time', 'motivation', 'knowledge', 'consistency', 'stress'] as const;
const obstacleIcons = [Clock, Target, Compass, Repeat, AlertTriangle];

export default function ObstacleCards({ value, onChange }: ObstacleCardsProps) {
  const t = useTranslations('diagnosis.q5');

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {obstacleKeys.map((key, i) => {
          const Icon = obstacleIcons[i];
          const selected = value === key;
          return (
            <motion.button
              key={key}
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(key);
              }}
              whileHover={{ scale: 1.02, rotateY: 3 }}
              whileTap={{ scale: 0.98 }}
              style={{ perspective: 600 }}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                selected
                  ? 'border-ofira-violet bg-ofira-violet/10 shadow-[0_0_20px_rgba(13,148,136,0.3)]'
                  : 'border-ofira-card-border bg-ofira-card hover:border-ofira-violet/30'
              }`}
            >
              <div className="relative shrink-0">
                <Icon className={`size-5 ${selected ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`} />
                {selected && (
                  <motion.svg
                    className="absolute -right-2 -top-2 size-4 text-ofira-peach"
                    viewBox="0 0 16 16"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <motion.path
                      d="M3 8.5L6.5 12L13 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </motion.svg>
                )}
              </div>
              <span className={`text-sm font-medium ${selected ? 'text-ofira-text' : 'text-ofira-text-secondary'}`}>
                {t(`options.${key}`)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
