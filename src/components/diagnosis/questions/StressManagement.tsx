'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Brain, Dumbbell, Users, HelpCircle, Tv } from 'lucide-react';

interface StressManagementProps {
  value: string;
  onChange: (value: string) => void;
}

const optionKeys = ['meditation', 'exercise', 'social', 'nothing', 'entertainment'] as const;
const optionIcons = [Brain, Dumbbell, Users, HelpCircle, Tv];

export default function StressManagement({ value, onChange }: StressManagementProps) {
  const t = useTranslations('diagnosis.q10');

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {optionKeys.map((key, i) => {
          const Icon = optionIcons[i];
          const selected = value === key;
          return (
            <motion.button
              key={key}
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(key);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                selected
                  ? 'border-ofira-violet bg-ofira-violet/10 shadow-[0_0_20px_rgba(196,161,255,0.3)]'
                  : 'border-ofira-card-border bg-ofira-card hover:border-ofira-violet/30'
              }`}
            >
              <Icon className={`size-5 shrink-0 ${selected ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`} />
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
