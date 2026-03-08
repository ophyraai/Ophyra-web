'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface EnergyLevelProps {
  value: number;
  onChange: (value: number) => void;
}

const auraColors = [
  { inner: '#c4a1ff', outer: 'rgba(196,161,255,0.15)', size: 28, rings: 1 },
  { inner: '#c4a1ff', outer: 'rgba(196,161,255,0.25)', size: 34, rings: 1 },
  { inner: '#d4a8ff', outer: 'rgba(196,161,255,0.35)', size: 40, rings: 2 },
  { inner: '#ff9e7a', outer: 'rgba(255,158,122,0.35)', size: 46, rings: 2 },
  { inner: '#ff9e7a', outer: 'rgba(255,158,122,0.5)', size: 52, rings: 3 },
];

export default function EnergyLevel({ value, onChange }: EnergyLevelProps) {
  const t = useTranslations('diagnosis.q3');
  const levels = t.raw('levels') as string[];

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="grid grid-cols-5 gap-3">
        {levels.map((label, i) => {
          const selected = value === i;
          const aura = auraColors[i];
          return (
            <motion.button
              key={i}
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(i);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={selected ? { scale: 1.1 } : { scale: 1 }}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                selected
                  ? 'border-ofira-violet bg-ofira-violet/10 shadow-[0_0_20px_rgba(196,161,255,0.3)]'
                  : 'border-ofira-card-border bg-ofira-card hover:border-ofira-violet/30'
              }`}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" className="overflow-visible">
                {Array.from({ length: aura.rings }, (_, r) => (
                  <motion.circle
                    key={r}
                    cx="24"
                    cy="24"
                    r={aura.size / 2 + (r + 1) * 6}
                    fill="none"
                    stroke={selected ? aura.inner : 'rgba(196,161,255,0.1)'}
                    strokeWidth={1}
                    initial={false}
                    animate={{
                      opacity: selected ? [0.3, 0.6, 0.3] : 0.15,
                      scale: selected ? [1, 1.08, 1] : 1,
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: r * 0.3 }}
                  />
                ))}
                <motion.circle
                  cx="24"
                  cy="24"
                  r="10"
                  fill={selected ? aura.inner : 'rgba(196,161,255,0.2)'}
                  animate={{
                    scale: selected ? aura.size / 20 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
                {selected && (
                  <motion.circle
                    cx="24"
                    cy="24"
                    r={aura.size / 2}
                    fill="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ filter: `drop-shadow(0 0 8px ${aura.outer})` }}
                    stroke={aura.inner}
                    strokeWidth={2}
                  />
                )}
              </svg>
              <span className={`text-xs font-medium ${selected ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
