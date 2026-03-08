'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface NutritionQualityProps {
  value: string;
  onChange: (value: string) => void;
}

const levels = [
  { key: 'terrible', color: '#ef4444' },
  { key: 'poor', color: '#f97316' },
  { key: 'average', color: '#eab308' },
  { key: 'good', color: '#22c55e' },
  { key: 'excellent', color: '#10b981' },
] as const;

export default function NutritionQuality({ value, onChange }: NutritionQualityProps) {
  const t = useTranslations('diagnosis.qNutrition');
  const selectedIndex = levels.findIndex((l) => l.key === value);

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <p className="mb-10 text-ofira-text-secondary">{t('subtitle')}</p>

      {/* Spectrum bar */}
      <div className="relative mx-auto mb-8 flex items-center justify-between gap-1 px-2">
        {/* Track background */}
        <div className="pointer-events-none absolute inset-x-2 top-1/2 flex h-2 -translate-y-1/2 overflow-hidden rounded-full">
          {levels.map((level, i) => (
            <div
              key={level.key}
              className="flex-1 transition-opacity duration-300"
              style={{
                backgroundColor: level.color,
                opacity: selectedIndex >= 0 && i <= selectedIndex ? 0.7 : 0.12,
              }}
            />
          ))}
        </div>

        {/* Selector dots */}
        {levels.map((level, i) => {
          const selected = value === level.key;
          const isPast = selectedIndex >= 0 && i <= selectedIndex;

          return (
            <motion.button
              key={level.key}
              type="button"
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(level.key);
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="relative z-10 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
            >
              {/* Glow */}
              {selected && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 20px ${level.color}50, 0 0 40px ${level.color}25` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Outer ring */}
              <motion.div
                className="absolute rounded-full border-2"
                animate={{
                  width: selected ? 40 : 32,
                  height: selected ? 40 : 32,
                  borderColor: selected
                    ? level.color
                    : isPast
                    ? `${level.color}60`
                    : 'rgba(139,130,168,0.2)',
                  backgroundColor: selected
                    ? `${level.color}15`
                    : 'rgba(12,10,20,0.8)',
                }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 24 }}
              />

              {/* Inner dot */}
              <motion.div
                className="relative rounded-full"
                animate={{
                  width: selected ? 16 : isPast ? 10 : 6,
                  height: selected ? 16 : isPast ? 10 : 6,
                  backgroundColor: isPast || selected ? level.color : 'rgba(139,130,168,0.25)',
                }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 24 }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Selected label */}
      <div className="h-14">
        {selectedIndex >= 0 && (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-1"
          >
            <span
              className="text-lg font-semibold"
              style={{ color: levels[selectedIndex].color }}
            >
              {t(`levels.${levels[selectedIndex].key}`)}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
