'use client';

import { useRef, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { ArrowRight, Moon, Dumbbell, Brain, Droplets, Lock, Sparkles } from 'lucide-react';
import ShimmerButton from '@/components/ui/ShimmerButton';

// ── Scroll timeline ──────────────────────────────────────────────────
// 0.00–0.08  phone enters
// 0.08–0.30  Q1: sleep arc fills
// 0.30–0.35  pause / transition
// 0.35–0.57  Q2: day blocks light up
// 0.57–0.62  pause / transition
// 0.62–0.78  Q3: stress meter moves
// 0.78–0.82  pause / transition
// 0.82–1.00  result screen

function useQuizState(p: number) {
  if (p < 0.08) return { screen: 'q' as const, q: 0, interactionProgress: 0 };
  if (p < 0.30) return { screen: 'q' as const, q: 0, interactionProgress: (p - 0.08) / 0.22 };
  if (p < 0.35) return { screen: 'q' as const, q: 0, interactionProgress: 1 };
  if (p < 0.57) return { screen: 'q' as const, q: 1, interactionProgress: (p - 0.35) / 0.22 };
  if (p < 0.62) return { screen: 'q' as const, q: 1, interactionProgress: 1 };
  if (p < 0.78) return { screen: 'q' as const, q: 2, interactionProgress: (p - 0.62) / 0.16 };
  if (p < 0.82) return { screen: 'q' as const, q: 2, interactionProgress: 1 };
  return { screen: 'result' as const, q: -1, interactionProgress: Math.min(1, (p - 0.82) / 0.18) };
}

// ── Q1: Sleep arc gauge ──────────────────────────────────────────────

function SleepArc({ progress }: { progress: number }) {
  const hours = Math.round(4 + progress * 5); // 4h → 9h
  const arcProgress = progress;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 75;
  const startAngle = 220;
  const endAngle = 320;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + totalAngle * arcProgress;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const rd = (n: number) => Math.round(n * 1000) / 1000;
  const startX = rd(cx + r * Math.cos(toRad(startAngle)));
  const startY = rd(cy + r * Math.sin(toRad(startAngle)));

  const arcPath = (angle: number) => {
    const endX = rd(cx + r * Math.cos(toRad(angle)));
    const endY = rd(cy + r * Math.sin(toRad(angle)));
    const largeArc = angle - startAngle > 180 ? 1 : 0;
    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
  };

  const ticks = [4, 5, 6, 7, 8, 9];
  const tickPositions = ticks.map((h, i) => {
    const angle = startAngle + (totalAngle / (ticks.length - 1)) * i;
    const innerR = r - 8;
    const outerR = r + 4;
    return {
      x1: rd(cx + innerR * Math.cos(toRad(angle))),
      y1: rd(cy + innerR * Math.sin(toRad(angle))),
      x2: rd(cx + outerR * Math.cos(toRad(angle))),
      y2: rd(cy + outerR * Math.sin(toRad(angle))),
      label: `${h}h`,
      lx: rd(cx + (r + 16) * Math.cos(toRad(angle))),
      ly: rd(cy + (r + 16) * Math.sin(toRad(angle))),
      active: h <= hours,
    };
  });

  const knobX = rd(cx + r * Math.cos(toRad(currentAngle)));
  const knobY = rd(cy + r * Math.sin(toRad(currentAngle)));

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size - 20} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <path d={arcPath(endAngle)} fill="none" stroke="#e0f2ef" strokeWidth={6} strokeLinecap="round" />
        <motion.path
          d={arcPath(currentAngle)}
          fill="none"
          stroke="url(#sleepGrad)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {tickPositions.map((t, i) => (
          <g key={i}>
            <line
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={t.active ? '#0d9488' : '#d1d5db'}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <text
              x={t.lx} y={t.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] font-semibold"
              fill={t.active ? '#0d9488' : '#9ca3af'}
            >
              {t.label}
            </text>
          </g>
        ))}
        <circle cx={knobX} cy={knobY} r={8} fill="white" stroke="#0d9488" strokeWidth={3}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(13,148,136,0.25))' }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" className="text-[36px] font-bold" fill="#0f1f1c">
          {hours}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="text-[12px] font-semibold" fill="#4b6b64">
          horas
        </text>
        <defs>
          <linearGradient id="sleepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        className="mt-3 text-center"
        animate={{ opacity: progress > 0.1 ? 1 : 0 }}
      >
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
          hours >= 7 ? 'bg-emerald-50 text-emerald-600' : hours >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
        }`}>
          <div className={`size-2 rounded-full ${
            hours >= 7 ? 'bg-emerald-400' : hours >= 5 ? 'bg-amber-400' : 'bg-red-400'
          }`} />
          <span className="text-[11px] font-semibold">
            {hours >= 7 ? 'Buen descanso' : hours >= 5 ? 'Puedes mejorar' : 'Muy poco'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Q2: Weekly exercise day blocks ───────────────────────────────────

function ExerciseDays({ progress }: { progress: number }) {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const activeDays = Math.round(progress * 4);
  const activeIndices = [0, 2, 4, 5].slice(0, activeDays);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full justify-between px-1">
        {days.map((day, i) => {
          const isActive = activeIndices.includes(i);
          return (
            <motion.div
              key={day}
              animate={{
                backgroundColor: isActive ? '#0d9488' : '#f0faf8',
                scale: isActive ? 1.08 : 1,
              }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              className="flex size-[28px] flex-col items-center justify-center rounded-xl"
            >
              <span className={`text-[9px] font-bold ${isActive ? 'text-white' : 'text-ofira-text-secondary'}`}>
                {day}
              </span>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1">
        <motion.p
          className="text-[48px] font-bold leading-none text-gradient"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.4 }}
          key={activeDays}
        >
          {activeDays}
        </motion.p>
        <p className="text-[11px] font-semibold text-ofira-text-secondary">días esta semana</p>
        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
          activeDays >= 3 ? 'bg-emerald-50 text-emerald-600' : activeDays >= 1 ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-500'
        }`}>
          <div className={`size-2 rounded-full ${
            activeDays >= 3 ? 'bg-emerald-400' : activeDays >= 1 ? 'bg-amber-400' : 'bg-zinc-400'
          }`} />
          <span className="text-[10px] font-semibold">
            {activeDays >= 3 ? 'Muy activo' : activeDays >= 1 ? 'Algo activo' : 'Sedentario'}
          </span>
        </div>
      </div>

      <div className="w-full rounded-xl bg-ofira-surface1 p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-semibold text-ofira-text-secondary">Objetivo semanal</span>
          <span className="text-[9px] font-bold text-ofira-violet">{activeDays}/5</span>
        </div>
        <div className="h-[6px] overflow-hidden rounded-full bg-ofira-surface2">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0d9488, #10b981)' }}
            animate={{ width: `${(activeDays / 5) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Q3: Stress level meter ───────────────────────────────────────────

function StressMeter({ progress }: { progress: number }) {
  const levels = [
    { label: 'Muy bajo', color: '#10b981', bg: 'bg-emerald-50' },
    { label: 'Bajo', color: '#0d9488', bg: 'bg-teal-50' },
    { label: 'Moderado', color: '#f59e0b', bg: 'bg-amber-50' },
    { label: 'Alto', color: '#ef4444', bg: 'bg-red-50' },
    { label: 'Muy alto', color: '#dc2626', bg: 'bg-red-50' },
  ];

  const rawIndex = progress * 3.2;
  const activeIndex = Math.min(4, Math.round(rawIndex));
  const meterFill = Math.min(1, rawIndex / 4);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <motion.div
        className="flex flex-col items-center gap-2"
        key={activeIndex}
      >
        <motion.div
          className="flex size-[56px] items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${levels[activeIndex].color}12` }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Brain className="size-6" style={{ color: levels[activeIndex].color }} />
        </motion.div>
        <motion.div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${levels[activeIndex].bg}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="size-2 rounded-full" style={{ backgroundColor: levels[activeIndex].color }} />
          <span className="text-[12px] font-bold" style={{ color: levels[activeIndex].color }}>
            {levels[activeIndex].label}
          </span>
        </motion.div>
      </motion.div>

      <div className="w-full px-1">
        <div className="relative h-4 overflow-hidden rounded-full"
          style={{ background: 'linear-gradient(90deg, #10b981 0%, #0d9488 25%, #f59e0b 50%, #ef4444 75%, #dc2626 100%)' }}
        >
          <motion.div
            className="absolute right-0 top-0 h-full bg-ofira-surface2"
            animate={{ width: `${(1 - meterFill) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 size-[22px] rounded-full border-[3px] border-white bg-white shadow-md"
            animate={{ left: `calc(${meterFill * 100}% - 11px)` }}
            transition={{ duration: 0.3 }}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <div className="size-full rounded-full" style={{ backgroundColor: levels[activeIndex].color }} />
          </motion.div>
        </div>
        <div className="mt-2 flex justify-between px-1">
          {['Bajo', '', 'Medio', '', 'Alto'].map((label, i) => (
            <span key={i} className="text-[8px] font-semibold text-ofira-text-secondary">{label}</span>
          ))}
        </div>
      </div>

      <motion.div
        className="w-full rounded-xl bg-ofira-surface1 px-3 py-2.5"
        animate={{ opacity: progress > 0.3 ? 1 : 0.3 }}
      >
        <p className="text-[10px] font-semibold leading-relaxed text-ofira-text-secondary">
          {activeIndex <= 1
            ? 'Buen manejo del estrés. Sigue así.'
            : activeIndex === 2
              ? 'Nivel moderado. Podrías incorporar técnicas de relajación.'
              : 'Nivel elevado. Te recomendamos actuar cuanto antes.'}
        </p>
      </motion.div>
    </div>
  );
}

// ── iPhone 16 Pro frame ──────────────────────────────────────────────

const PHONE_W = 262;
const PHONE_RATIO = 2.165;
const PHONE_H = Math.round(PHONE_W * PHONE_RATIO);
const BEZEL = 3;
const FRAME = 2;
const CORNER_OUTER = 50;
const CORNER_INNER = CORNER_OUTER - FRAME - BEZEL;

function IPhone16Pro({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ width: PHONE_W }}>
      {/* Titanium outer frame */}
      <div
        className="relative overflow-hidden bg-gradient-to-b from-[#8e8e93] via-[#78787c] to-[#8e8e93]"
        style={{
          borderRadius: CORNER_OUTER,
          padding: FRAME,
          boxShadow: '0 25px 60px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.2)',
        }}
      >
        {/* Black bezel */}
        <div
          className="relative overflow-hidden bg-[#1d1d1f]"
          style={{ borderRadius: CORNER_OUTER - FRAME, padding: BEZEL }}
        >
          {/* Screen */}
          <div
            className="relative flex flex-col overflow-hidden bg-white"
            style={{ borderRadius: CORNER_INNER, height: PHONE_H - (FRAME + BEZEL) * 2 }}
          >
            <div style={{ minHeight: 44 }} />

            {/* App header */}
            <div className="flex items-center justify-center gap-1.5 py-0.5">
              <div className="h-[3px] w-[3px] rounded-full bg-ofira-violet" />
              <span className="text-[10px] font-bold text-gradient tracking-wider uppercase">
                Ophyra
              </span>
              <div className="h-[3px] w-[3px] rounded-full bg-ofira-peach" />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-3.5 pb-8">
              {children}
            </div>

            <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2">
              <div className="h-[4px] w-[110px] rounded-full bg-[#1d1d1f]/15" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Island */}
      <div className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2" style={{ top: FRAME + BEZEL + 10 }}>
        <div className="h-[18px] w-[62px] rounded-full bg-[#1d1d1f]" />
      </div>

      {/* Status bar */}
      <div className="pointer-events-none absolute z-50 flex items-center justify-between" style={{ top: FRAME + BEZEL + 14, left: FRAME + BEZEL + 20, right: FRAME + BEZEL + 20 }}>
        <span className="text-[12px] font-semibold text-black"
          style={{ fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif', fontFeatureSettings: '"tnum"' }}
        >9:41</span>
        <div className="flex items-center gap-[5px]">
          <svg width="13" height="10" viewBox="-0.5 -1 14 11" className="overflow-visible">
            <rect x="0" y="6.5" width="2" height="2.5" rx="0.5" fill="black" />
            <rect x="3" y="4.5" width="2" height="4.5" rx="0.5" fill="black" />
            <rect x="6" y="2" width="2" height="7" rx="0.5" fill="black" />
            <rect x="9" y="0" width="2" height="9" rx="0.5" fill="black" />
          </svg>
          <svg width="13" height="10" viewBox="-1 -1 13 11" className="overflow-visible">
            <circle cx="5.5" cy="8" r="1" fill="black" />
            <path d="M3.2 6a3.2 3.2 0 014.6 0" fill="none" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M1.2 3.8a6.1 6.1 0 018.6 0" fill="none" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M-0.5 1.6a9 9 0 0112 0" fill="none" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <svg width="20" height="10" viewBox="-0.5 -1 21 12" className="overflow-visible">
            <rect x="0" y="0" width="16" height="9" rx="2.2" fill="none" stroke="black" strokeWidth="1" opacity="0.35" />
            <path d="M17 2.8v3.4a1.4 1.4 0 000-3.4z" fill="black" opacity="0.4" />
            <rect x="1.2" y="1.2" width="13.6" height="6.6" rx="1.3" fill="black" />
          </svg>
        </div>
      </div>

      {/* Side buttons */}
      <div className="absolute left-[-2.5px] top-[90px] h-[26px] w-[3px] rounded-l-full bg-[#78787c]" />
      <div className="absolute left-[-2.5px] top-[134px] h-[44px] w-[3px] rounded-l-full bg-[#78787c]" />
      <div className="absolute left-[-2.5px] top-[186px] h-[44px] w-[3px] rounded-l-full bg-[#78787c]" />
      <div className="absolute right-[-2.5px] top-[148px] h-[56px] w-[3px] rounded-r-full bg-[#78787c]" />

      {/* Glass reflection */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: CORNER_OUTER,
          background: 'linear-gradient(155deg, rgba(255,255,255,0.07) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)',
        }}
      />
    </div>
  );
}

// ── Ambient elements ─────────────────────────────────────────────────

function AmbientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Central glow — uses the teal brand color */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, rgba(16,185,129,0.03) 40%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {[
        { Icon: Moon, x: -65, y: 50, delay: 0, size: 32, gradient: 'from-teal-50 to-emerald-50' },
        { Icon: Dumbbell, x: 68, y: 160, delay: 1.5, size: 30, gradient: 'from-emerald-50 to-teal-50' },
        { Icon: Brain, x: -58, y: 340, delay: 3, size: 28, gradient: 'from-teal-50 to-teal-100' },
        { Icon: Droplets, x: 62, y: 440, delay: 2, size: 26, gradient: 'from-emerald-50 to-emerald-100' },
      ].map(({ Icon, x, y, delay, size, gradient }, i) => (
        <motion.div
          key={i}
          className={`absolute left-1/2 top-0 flex items-center justify-center rounded-xl border border-ofira-card-border bg-gradient-to-br ${gradient} text-ofira-violet shadow-lg backdrop-blur-sm`}
          style={{ width: size, height: size, x, y }}
          animate={{ y: [y, y - 10, y + 4, y], rotate: [0, 3, -2, 0] }}
          transition={{ duration: 7, repeat: Infinity, delay, ease: 'easeInOut' }}
        >
          <Icon className="size-3.5" />
        </motion.div>
      ))}
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(13,148,136,0.08)" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#scoreGrad3)" strokeWidth={6}
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
        />
        <defs>
          <linearGradient id="scoreGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[32px] font-bold text-gradient leading-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-semibold text-ofira-text-secondary">/100</span>
      </div>
    </div>
  );
}

// ── Phone quiz content ───────────────────────────────────────────────

const ICONS: Record<string, React.ReactNode> = {
  moon: <Moon className="size-3" />,
  dumbbell: <Dumbbell className="size-3" />,
  brain: <Brain className="size-3" />,
};

const QUESTIONS = [
  { key: 'sampleQ1', category: 'Sueño', iconKey: 'moon', score: 78 },
  { key: 'sampleQ2', category: 'Ejercicio', iconKey: 'dumbbell', score: 40 },
  { key: 'sampleQ3', category: 'Estrés', iconKey: 'brain', score: 55 },
];

const CATEGORY_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  'Sueño': { bar: 'linear-gradient(90deg, #0d9488, #14b8a6)', text: '#0d9488', bg: 'rgba(13,148,136,0.06)' },
  'Ejercicio': { bar: 'linear-gradient(90deg, #059669, #10b981)', text: '#059669', bg: 'rgba(5,150,105,0.06)' },
  'Estrés': { bar: 'linear-gradient(90deg, #f59e0b, #fbbf24)', text: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
};

function PhoneContent({
  state,
  t,
}: {
  state: ReturnType<typeof useQuizState>;
  t: (key: string) => string;
}) {
  const isResult = state.screen === 'result';
  const qi = Math.max(0, state.q);
  const question = QUESTIONS[qi];

  const scores = [78, 40, 55];
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return (
    <AnimatePresence mode="wait">
      {isResult ? (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <ScoreRing score={avg} size={130} />
          <div className="mt-5 w-full space-y-4">
            {QUESTIONS.map((q, i) => {
              const catColors = CATEGORY_COLORS[q.category];
              const scoreVal = scores[i];
              return (
                <motion.div
                  key={q.category}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.1 }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-5 items-center justify-center rounded-md"
                        style={{ backgroundColor: catColors.bg, color: catColors.text }}
                      >
                        {ICONS[q.iconKey]}
                      </span>
                      <span className="text-[13px] font-semibold text-ofira-text">{q.category}</span>
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: catColors.text }}>{scoreVal}%</span>
                  </div>
                  <div className="h-[7px] overflow-hidden rounded-full bg-ofira-surface2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: catColors.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${scoreVal}%` }}
                      transition={{ duration: 0.7, delay: 0.4 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Locked section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="relative mt-5 w-full overflow-hidden rounded-2xl border border-ofira-card-border"
          >
            <div className="select-none space-y-2.5 px-4 py-8 blur-[4px]" aria-hidden>
              <div className="h-[7px] w-[75%] rounded bg-ofira-surface2" />
              <div className="h-[7px] w-full rounded bg-ofira-surface2" />
              <div className="h-[7px] w-[55%] rounded bg-ofira-surface2" />
              <div className="h-[7px] w-[85%] rounded bg-ofira-surface2" />
              <div className="h-[7px] w-[65%] rounded bg-ofira-surface2" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-3 bg-gradient-to-t from-white via-white/95 to-white/70">
              <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-50 to-emerald-50">
                <Lock className="size-4 text-ofira-violet" />
              </div>
              <p className="text-center text-[13px] font-bold text-ofira-text">{t('resultReady')}</p>
              <p className="mt-1 text-center text-[11px] leading-snug text-ofira-text-secondary">{t('resultSub')}</p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key={`q-${qi}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Progress dots */}
          <div className="mb-3 flex items-center justify-center gap-1.5">
            {QUESTIONS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === qi ? 20 : 6,
                  backgroundColor: i <= qi ? '#0d9488' : '#e0f2ef',
                }}
                className="h-[4px] rounded-full"
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Category pill */}
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ofira-violet/8 px-3 py-1 text-[10px] font-bold text-ofira-violet">
              {ICONS[question.iconKey]}
              {question.category}
            </span>
          </div>

          {/* Question */}
          <p className="mb-4 text-center text-[13px] font-bold leading-snug text-ofira-text">
            {t(question.key)}
          </p>

          {/* Interactive widget */}
          {qi === 0 && <SleepArc progress={state.interactionProgress} />}
          {qi === 1 && <ExerciseDays progress={state.interactionProgress} />}
          {qi === 2 && <StressMeter progress={state.interactionProgress} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scroll hint ──────────────────────────────────────────────────────

function ScrollHint({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5"
        >
          <span className="text-[9px] font-medium text-ofira-text-secondary">Haz scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b6b64" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Step indicator icons ─────────────────────────────────────────────

const STEP_ICONS = [Moon, Dumbbell, Brain, Sparkles];
const STEP_COLORS = ['#0d9488', '#059669', '#10b981', '#0d9488'];

// ── Main component ───────────────────────────────────────────────────

export default function DiagnosisPreview() {
  const t = useTranslations('landing.diagnosisPreview');

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(smoothProgress, 'change', (v) => setProgress(v));

  const state = useQuizState(progress);

  // 3D tilt
  const phoneRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 120, damping: 18 });
  const springRY = useSpring(rotateY, { stiffness: 120, damping: 18 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(x * 7);
    rotateX.set(-y * 4);
  }, [rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const floatY = useTransform(smoothProgress, [0, 0.5, 1], [0, -6, 0]);

  return (
    <section
      ref={sectionRef}
      id="diagnosis-preview"
      className="relative"
      style={{
        height: '300vh',
        background: 'linear-gradient(180deg, #f0faf8 0%, #e8f6f3 30%, #f0faf8 70%, #f0faf8 100%)',
      }}
    >
      {/* Subtle decorative blurs in the background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-32 top-[20%] h-[500px] w-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12), transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -left-32 top-[50%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.10), transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="absolute left-1/2 top-[80%] h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
      </div>

      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden px-4 py-12">
        <div className="ml-auto mr-[3%] w-full max-w-5xl">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-20">

            {/* Left — text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 flex max-w-sm flex-col items-center text-center lg:order-1 lg:flex-1 lg:items-start lg:text-left"
            >
              {/* Section badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-ofira-card-border bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-ofira-violet backdrop-blur-sm shadow-sm"
              >
                <Sparkles className="size-3" />
                Diagnóstico interactivo
              </motion.div>

              <h2 className="mb-3 text-3xl font-bold leading-tight text-ofira-text sm:text-4xl lg:text-[40px]">
                {t('title')}
              </h2>

              <p className="mb-8 text-[15px] leading-relaxed text-ofira-text-secondary">
                3 preguntas, resultados al instante. Haz scroll para ver tu análisis.
              </p>

              {/* Step indicator — vertical with icons */}
              <div className="mb-8 flex flex-col gap-2.5">
                {[
                  { label: 'Calidad de sueño', step: 0 },
                  { label: 'Actividad física', step: 1 },
                  { label: 'Nivel de estrés', step: 2 },
                  { label: 'Tu resultado', step: 3 },
                ].map(({ label, step }, idx) => {
                  const isActive = state.screen === 'result' ? step <= 3 : state.q >= step;
                  const isCurrent = state.screen === 'result' ? step === 3 : state.q === step;
                  const StepIcon = STEP_ICONS[idx];
                  const stepColor = STEP_COLORS[idx];

                  return (
                    <motion.div
                      key={step}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300 ${
                        isCurrent ? 'bg-white shadow-sm border border-ofira-card-border' : ''
                      }`}
                      animate={{ scale: isCurrent ? 1.02 : 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <motion.div
                        animate={{
                          backgroundColor: isActive ? stepColor : '#e0f2ef',
                          scale: isCurrent ? 1.1 : 1,
                        }}
                        className="flex size-[30px] items-center justify-center rounded-lg"
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {isActive ? (
                          <StepIcon className="size-3.5 text-white" />
                        ) : (
                          <span className="text-[11px] font-bold text-ofira-text-secondary">{step + 1}</span>
                        )}
                      </motion.div>
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-semibold transition-colors ${
                          isCurrent ? 'text-ofira-text' : isActive ? 'text-ofira-violet' : 'text-ofira-text-secondary'
                        }`}>
                          {label}
                        </span>
                        {isCurrent && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-[10px] text-ofira-text-secondary"
                          >
                            En progreso...
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <ShimmerButton href="/diagnosis">
                {t('cta')}
                <ArrowRight className="size-4" />
              </ShimmerButton>
            </motion.div>

            {/* Right — phone */}
            <motion.div
              ref={phoneRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative order-1 lg:order-2"
              style={{ perspective: 1000 }}
            >
              <AmbientOrbs />

              <motion.div
                style={{
                  rotateX: springRX,
                  rotateY: springRY,
                  y: floatY,
                  transformStyle: 'preserve-3d',
                }}
              >
                <IPhone16Pro>
                  <PhoneContent state={state} t={t} />
                </IPhone16Pro>
              </motion.div>

              <ScrollHint visible={progress < 0.04} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
