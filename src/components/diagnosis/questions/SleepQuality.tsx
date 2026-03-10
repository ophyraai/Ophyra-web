'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface SleepQualityProps {
  value: number;
  onChange: (value: number) => void;
}

function MoonPhase({ phase, selected }: { phase: number; selected: boolean }) {
  const size = 40;
  const cx = size / 2;
  const cy = size / 2;
  const r = 14;

  const phases: Record<number, React.ReactNode> = {
    0: (
      <>
        <circle cx={cx} cy={cy} r={r} fill="rgba(13,148,136,0.15)" />
        <path
          d={`M ${cx + 2} ${cy - r} A ${r} ${r} 0 1 0 ${cx + 2} ${cy + r} A ${r * 0.15} ${r} 0 1 1 ${cx + 2} ${cy - r}`}
          fill={selected ? '#0d9488' : 'rgba(13,148,136,0.3)'}
        />
      </>
    ),
    1: (
      <>
        <circle cx={cx} cy={cy} r={r} fill="rgba(13,148,136,0.15)" />
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy + r} A ${r * 0.4} ${r} 0 1 1 ${cx} ${cy - r}`}
          fill={selected ? '#0d9488' : 'rgba(13,148,136,0.3)'}
        />
      </>
    ),
    2: (
      <>
        <circle cx={cx} cy={cy} r={r} fill="rgba(13,148,136,0.15)" />
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy + r} L ${cx} ${cy - r} Z`}
          fill={selected ? '#059669' : 'rgba(13,148,136,0.35)'}
        />
      </>
    ),
    3: (
      <>
        <circle cx={cx} cy={cy} r={r} fill={selected ? '#059669' : 'rgba(13,148,136,0.3)'} />
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r * 0.4} ${r} 0 1 0 ${cx} ${cy - r}`}
          fill="rgba(13,148,136,0.1)"
        />
      </>
    ),
    4: (
      <circle cx={cx} cy={cy} r={r} fill={selected ? '#0d9488' : 'rgba(13,148,136,0.35)'} />
    ),
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {selected && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill="none"
          stroke="#0d9488"
          strokeWidth={1}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {phases[phase]}
    </svg>
  );
}

export default function SleepQuality({ value, onChange }: SleepQualityProps) {
  const t = useTranslations('diagnosis.q7');
  const levels = t.raw('levels') as string[];

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <div className="flex justify-center gap-4">
        {levels.map((label, i) => {
          const selected = value === i;
          return (
            <motion.button
              key={i}
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(i);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={selected ? { scale: 1.3 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-colors ${
                selected ? 'shadow-[0_0_20px_rgba(13,148,136,0.3)]' : ''
              }`}
            >
              <MoonPhase phase={i} selected={selected} />
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
