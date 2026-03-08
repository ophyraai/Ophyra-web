'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface BodyGoalProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const zones = [
  { key: 'posture', label: 'zones.posture' },
  { key: 'toneUp', label: 'zones.toneUp' },
  { key: 'gainMuscle', label: 'zones.gainMuscle' },
  { key: 'loseWeight', label: 'zones.loseWeight' },
  { key: 'endurance', label: 'zones.endurance' },
] as const;

type ZoneKey = (typeof zones)[number]['key'];

/* ── SVG zone layout configuration ─────────────────────────────── */

interface ZoneConfig {
  /** Visible outline path */
  path: string;
  /** Invisible larger hitbox rect: [x, y, width, height] */
  hitbox: [number, number, number, number];
  /** Label anchor position [x, y] */
  labelPos: [number, number];
  /** Label text-anchor side */
  labelSide: 'left' | 'right';
}

const zoneConfigs: Record<ZoneKey, ZoneConfig> = {
  posture: {
    // Head + neck
    path: 'M88,28 C88,14 98,4 112,4 C126,4 136,14 136,28 C136,42 126,52 112,52 C98,52 88,42 88,28 Z M105,52 L105,68 M119,52 L119,68',
    hitbox: [82, 0, 60, 72],
    labelPos: [155, 36],
    labelSide: 'right',
  },
  toneUp: {
    // Torso / chest
    path: 'M80,68 C80,68 76,72 76,80 L76,120 C76,124 80,128 88,130 L136,130 C144,128 148,124 148,120 L148,80 C148,72 144,68 144,68 L119,68 L105,68 Z',
    hitbox: [72, 66, 80, 68],
    labelPos: [190, 100],
    labelSide: 'right',
  },
  gainMuscle: {
    // Arms (both)
    path: 'M76,72 L60,90 L48,120 L42,148 L50,150 L60,124 L72,100 M148,72 L164,90 L176,120 L182,148 L174,150 L164,124 L152,100',
    hitbox: [36, 70, 36, 84],
    labelPos: [28, 110],
    labelSide: 'left',
  },
  loseWeight: {
    // Core / belly
    path: 'M88,130 L88,172 C88,178 96,182 112,182 C128,182 136,178 136,172 L136,130',
    hitbox: [84, 128, 56, 58],
    labelPos: [155, 168],
    labelSide: 'right',
  },
  endurance: {
    // Legs
    path: 'M88,182 L84,220 L80,260 L78,290 L86,290 L92,260 L100,230 L112,220 L124,230 L132,260 L138,290 L146,290 L144,260 L140,220 L136,182',
    hitbox: [74, 180, 76, 114],
    labelPos: [28, 240],
    labelSide: 'left',
  },
};

/* ── Gradient IDs ──────────────────────────────────────────────── */

const GRADIENT_ID = 'body-goal-gradient';
const GLOW_ID = 'body-goal-glow';

export default function BodyGoal({ value, onChange }: BodyGoalProps) {
  const t = useTranslations('diagnosis.q6b');
  const selected = value || [];

  const toggle = (key: string) => {
    try {
      navigator.vibrate?.(10);
    } catch {}
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next);
  };

  return (
    <div className="w-full max-w-lg text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>

      {/* ── Body silhouette SVG ────────────────────────────────── */}
      <div className="relative mx-auto mb-6" style={{ maxWidth: 420 }}>
        <svg
          viewBox="-60 0 344 300"
          className="mx-auto h-[340px] w-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4a1ff" />
              <stop offset="100%" stopColor="#ff9e7a" />
            </linearGradient>
            <filter id={GLOW_ID} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {zones.map(({ key, label }) => {
            const config = zoneConfigs[key];
            const isSelected = selected.includes(key);
            const [hx, hy, hw, hh] = config.hitbox;
            const [lx, ly] = config.labelPos;

            return (
              <g key={key} className="cursor-pointer" onClick={() => toggle(key)}>
                {/* Invisible hitbox */}
                <rect
                  x={hx}
                  y={hy}
                  width={hw}
                  height={hh}
                  fill="transparent"
                  className="pointer-events-auto"
                />

                {/* Visible path */}
                <motion.path
                  d={config.path}
                  fill="none"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={false}
                  animate={
                    isSelected
                      ? {
                          stroke: `url(#${GRADIENT_ID})`,
                          filter: `url(#${GLOW_ID})`,
                          opacity: 1,
                        }
                      : {
                          stroke: '#ffffff',
                          filter: 'none',
                          opacity: 0.55,
                        }
                  }
                  transition={{ duration: 0.35 }}
                />

                {/* Glow pulse ring when selected */}
                {isSelected && (
                  <motion.path
                    d={config.path}
                    fill="none"
                    stroke={`url(#${GRADIENT_ID})`}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 0.15, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ filter: `url(#${GLOW_ID})` }}
                  />
                )}

                {/* Floating label */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.g
                      initial={{ opacity: 0, x: config.labelSide === 'right' ? -6 : 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: config.labelSide === 'right' ? -6 : 6 }}
                      transition={{ duration: 0.25 }}
                    >
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={config.labelSide === 'right' ? 'start' : 'end'}
                        dominantBaseline="middle"
                        className="fill-ofira-text text-[9px] font-medium"
                      >
                        {t(label)}
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* Second arm hitbox (right side, for gainMuscle) */}
                {key === 'gainMuscle' && (
                  <rect
                    x={152}
                    y={70}
                    width={36}
                    height={84}
                    fill="transparent"
                    className="pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(key);
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Flexibility pill button ────────────────────────────── */}
      <div className="flex justify-center">
        <motion.button
          onClick={() => toggle('flexibility')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            selected.includes('flexibility')
              ? { scale: [1, 1.12, 1.05] }
              : { scale: 1 }
          }
          transition={{ duration: 0.2 }}
          className={`rounded-full border px-6 py-2.5 text-sm font-medium transition-colors ${
            selected.includes('flexibility')
              ? 'border-transparent bg-gradient-to-r from-ofira-violet to-ofira-peach text-white shadow-[0_0_20px_rgba(196,161,255,0.35)]'
              : 'border-ofira-card-border bg-ofira-card text-ofira-text-secondary hover:border-ofira-violet/30'
          }`}
        >
          {t('zones.flexibility')}
        </motion.button>
      </div>
    </div>
  );
}
