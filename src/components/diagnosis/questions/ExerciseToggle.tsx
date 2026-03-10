'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Slider } from '@/components/ui/slider';

interface ExerciseValue {
  exercises: boolean;
  frequency?: number;
}

interface ExerciseToggleProps {
  value: ExerciseValue;
  onChange: (value: ExerciseValue) => void;
}

export default function ExerciseToggle({ value, onChange }: ExerciseToggleProps) {
  const t = useTranslations('diagnosis.q6');
  const current = value || { exercises: false };

  return (
    <div className="w-full max-w-md text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="mb-6 flex justify-center gap-4">
        {(['yes', 'no'] as const).map((option) => {
          const isYes = option === 'yes';
          const selected = current.exercises === isYes;
          return (
            <motion.button
              key={option}
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(isYes ? { exercises: true, frequency: current.frequency ?? 3 } : { exercises: false });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 rounded-xl border px-8 py-4 text-lg font-semibold transition-colors ${
                selected
                  ? 'border-ofira-violet bg-ofira-violet/10 text-ofira-violet shadow-[0_0_20px_rgba(13,148,136,0.3)]'
                  : 'border-ofira-card-border bg-ofira-card text-ofira-text-secondary hover:border-ofira-violet/30'
              }`}
            >
              {t(option)}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {current.exercises && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-ofira-card-border bg-ofira-card p-6">
              <p className="mb-2 text-sm text-ofira-text-secondary">{t('frequency')}</p>
              <div className="mb-4 text-4xl font-bold text-ofira-violet">
                {current.frequency ?? 3}
                <span className="ml-2 text-base font-normal text-ofira-text-secondary">{t('times')}</span>
              </div>
              <Slider
                min={1}
                max={7}
                step={1}
                value={[current.frequency ?? 3]}
                onValueChange={(v) => onChange({ exercises: true, frequency: v[0] })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
