'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ScoreCounterProps {
  score: number;
}

export default function ScoreCounter({ score }: ScoreCounterProps) {
  const t = useTranslations('results');
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayRef = useRef<HTMLSpanElement>(null);
  const conicRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const getScoreColor = (s: number) => {
    if (s < 40) return '#ef4444';
    if (s < 70) return '#059669';
    return '#0d9488';
  };

  const getLabel = (s: number) => {
    if (s < 40) return 'Critico';
    if (s < 70) return 'Mejorable';
    return 'Excelente';
  };

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !conicRef.current) return;

    let angle = 0;
    const step = () => {
      angle = (angle + 0.5) % 360;
      if (conicRef.current) {
        conicRef.current.style.transform = `rotate(${angle}deg)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 2,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [count, score]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (displayRef.current) {
        displayRef.current.textContent = String(latest);
      }
    });
    return unsubscribe;
  }, [rounded]);

  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      {/* Rotating conic-gradient glow */}
      <div
        ref={conicRef}
        className="absolute -z-10 h-56 w-56 rounded-full opacity-20 blur-2xl"
        style={{
          background: `conic-gradient(from 0deg, ${color}, transparent, ${color})`,
        }}
      />

      {/* Concentric animated rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute -z-10 rounded-full border"
          style={{
            borderColor: `${color}15`,
            width: `${160 + i * 40}px`,
            height: `${160 + i * 40}px`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className="relative flex items-baseline gap-1"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      >
        <motion.span
          ref={displayRef}
          className="text-8xl font-bold tabular-nums md:text-9xl"
          style={{
            fontFamily: 'var(--font-display)',
            background: `linear-gradient(135deg, #0d9488, #059669)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          0
        </motion.span>
      </motion.div>
      <motion.p
        className="mt-2 text-lg text-ofira-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {t('outOf')}
      </motion.p>

      {/* Contextual label */}
      <motion.span
        className="mt-1 text-sm font-semibold"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {getLabel(score)}
      </motion.span>

      {/* Percentile context */}
      <motion.p
        className="mt-1.5 text-xs text-ofira-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        {t('percentile', { pct: score >= 70 ? '15' : score >= 50 ? '40' : '60' })}
      </motion.p>

      {/* Glow ring behind score */}
      <motion.div
        className="absolute -z-10 h-48 w-48 rounded-full blur-3xl"
        style={{ backgroundColor: color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.5, duration: 1 }}
      />
    </div>
  );
}
