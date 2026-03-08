'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface MorningRoutineValue {
  hasRoutine: boolean;
  activities?: string[];
}

interface MorningRoutineProps {
  value: MorningRoutineValue;
  onChange: (value: MorningRoutineValue) => void;
}

const activityKeys = ['meditation', 'exercise', 'journaling', 'reading', 'coldShower', 'planning'] as const;

export default function MorningRoutine({ value, onChange }: MorningRoutineProps) {
  const t = useTranslations('diagnosis.q8');
  const current = value || { hasRoutine: false };

  const toggleActivity = (key: string) => {
    try { navigator.vibrate?.(10); } catch {}
    const activities = current.activities || [];
    const next = activities.includes(key)
      ? activities.filter((a) => a !== key)
      : [...activities, key];
    onChange({ hasRoutine: true, activities: next });
  };

  return (
    <div className="w-full max-w-md text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="mb-6 flex justify-center gap-4">
        {(['yes', 'no'] as const).map((option) => {
          const isYes = option === 'yes';
          const selected = current.hasRoutine === isYes;
          return (
            <motion.button
              key={option}
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(isYes ? { hasRoutine: true, activities: current.activities || [] } : { hasRoutine: false });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 rounded-xl border px-8 py-4 text-lg font-semibold transition-colors ${
                selected
                  ? 'border-ofira-violet bg-ofira-violet/10 text-ofira-violet shadow-[0_0_20px_rgba(196,161,255,0.3)]'
                  : 'border-ofira-card-border bg-ofira-card text-ofira-text-secondary hover:border-ofira-violet/30'
              }`}
            >
              {t(option)}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {current.hasRoutine && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-ofira-card-border bg-ofira-card p-6">
              <p className="mb-4 text-sm text-ofira-text-secondary">{t('activities')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {activityKeys.map((key) => {
                  const selected = current.activities?.includes(key);
                  return (
                    <motion.button
                      key={key}
                      onClick={() => toggleActivity(key)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-ofira-violet bg-ofira-violet/20 text-ofira-violet'
                          : 'border-ofira-card-border bg-ofira-card text-ofira-text-secondary hover:border-ofira-violet/30'
                      }`}
                    >
                      {t(`options.${key}`)}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
