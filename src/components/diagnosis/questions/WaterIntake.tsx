'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface WaterIntakeProps {
  value: number;
  onChange: (value: number) => void;
}

function WaterGlass({ level, index }: { level: number; index: number }) {
  const fillPercent = Math.max(0, Math.min(1, level));
  const glassH = 44;
  const glassW = 28;
  const waterY = glassH * (1 - fillPercent);

  return (
    <svg width={glassW + 8} height={glassH + 8} viewBox={`0 0 ${glassW + 8} ${glassH + 8}`} className="overflow-visible">
      <defs>
        <clipPath id={`glass-clip-${index}`}>
          <path d={`M 6 4 L 4 ${glassH + 2} Q 4 ${glassH + 6} 8 ${glassH + 6} L ${glassW} ${glassH + 6} Q ${glassW + 4} ${glassH + 6} ${glassW + 4} ${glassH + 2} L ${glassW + 2} 4 Z`} />
        </clipPath>
      </defs>
      <path
        d={`M 6 4 L 4 ${glassH + 2} Q 4 ${glassH + 6} 8 ${glassH + 6} L ${glassW} ${glassH + 6} Q ${glassW + 4} ${glassH + 6} ${glassW + 4} ${glassH + 2} L ${glassW + 2} 4 Z`}
        fill="none"
        stroke="rgba(13,148,136,0.25)"
        strokeWidth={1.5}
      />
      {fillPercent > 0 && (
        <g clipPath={`url(#glass-clip-${index})`}>
          <motion.rect
            x={0}
            width={glassW + 8}
            height={glassH + 8}
            fill="rgba(13,148,136,0.35)"
            initial={false}
            animate={{ y: waterY }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
          <motion.path
            d={`M 0 0 Q ${(glassW + 8) * 0.25} -3 ${(glassW + 8) * 0.5} 0 Q ${(glassW + 8) * 0.75} 3 ${glassW + 8} 0 L ${glassW + 8} 4 L 0 4 Z`}
            fill="rgba(13,148,136,0.5)"
            initial={false}
            animate={{ y: waterY - 2, x: [0, 2, 0, -2, 0] }}
            transition={{
              y: { type: 'spring', stiffness: 200, damping: 20 },
              x: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        </g>
      )}
    </svg>
  );
}

export default function WaterIntake({ value, onChange }: WaterIntakeProps) {
  const t = useTranslations('diagnosis.q11');
  const filled = value ?? 0;

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <p className="mb-10 text-sm text-ofira-text-secondary">{t('subtitle')}</p>
      <div className="flex justify-center gap-3">
        {Array.from({ length: 8 }, (_, i) => {
          const isFilled = i < filled;
          return (
            <motion.button
              key={i}
              onClick={() => {
                try { navigator.vibrate?.(10); } catch {}
                onChange(i + 1);
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              animate={isFilled ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <WaterGlass level={isFilled ? 1 : 0} index={i} />
            </motion.button>
          );
        })}
      </div>
      <p className="mt-4 text-2xl font-bold text-ofira-mint">{filled}</p>
    </div>
  );
}
