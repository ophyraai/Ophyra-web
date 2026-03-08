'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Zap, Moon, Dumbbell, Scale } from 'lucide-react';

interface MainGoalProps {
  value: string;
  onChange: (value: string) => void;
}

const goalKeys = ['energy', 'sleep', 'fitness', 'balance'] as const;
const goalIcons = [Zap, Moon, Dumbbell, Scale];

export default function MainGoal({ value, onChange }: MainGoalProps) {
  const t = useTranslations('diagnosis.q12');

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {goalKeys.map((key, i) => {
          const Icon = goalIcons[i];
          const selected = value === key;
          return (
            <motion.button
              key={key}
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(key);
              }}
              whileHover={{ scale: 1.03, rotateY: 2 }}
              whileTap={{ scale: 0.97 }}
              animate={selected ? { scale: 1.05 } : { scale: 1 }}
              style={{ perspective: 800 }}
              className={`relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border p-6 transition-colors ${
                selected
                  ? 'border-transparent bg-ofira-violet/10 shadow-[0_0_25px_rgba(196,161,255,0.3)]'
                  : 'border-ofira-card-border bg-ofira-card hover:border-ofira-violet/30'
              }`}
            >
              {selected && (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-ofira-violet/20 to-ofira-peach/10" />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-ofira-violet to-ofira-peach [mask-composite:exclude] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]" style={{ padding: 1 }} />
                </>
              )}
              <Icon className={`size-8 ${selected ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`} />
              <span className={`text-base font-semibold ${selected ? 'text-ofira-text' : 'text-ofira-text-secondary'}`}>
                {t(`options.${key}`)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
