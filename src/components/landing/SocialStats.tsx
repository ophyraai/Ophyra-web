'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';

// ── Mini confetti burst ─────────────────────────────────────────────
const PARTICLE_COUNT = 12;
const COLORS = ['#0d9488', '#059669', '#10b981', '#14b8a6', '#34d399'];

function ConfettiBurst({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const cx = w / 2;
    const cy = h / 2;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      size: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.015 + Math.random() * 0.01,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
    }));

    let frame: number;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= p.decay;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ── Stat counter ────────────────────────────────────────────────────
interface StatCounterProps {
  target: number;
  suffix: string;
  label: string;
  delay?: number;
  format?: 'K' | 'M' | 'default';
}

function StatCounter({ target, suffix, label, delay = 0, format = 'default' }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const count = useMotionValue(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const rounded = useTransform(count, (v) => {
    if (format === 'M') {
      return `${(v / 1_000_000).toFixed(v >= 1_000_000 ? 0 : 1)}M`;
    }
    if (format === 'K' || target >= 1000) {
      return `${(v / 1000).toFixed(v >= 1000 ? 0 : 1)}K`;
    }
    return Math.floor(v).toLocaleString();
  });

  const onComplete = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
  }, []);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, target, {
      duration: 2,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
      onComplete,
    });
    return controls.stop;
  }, [isInView, count, target, delay, onComplete]);

  return (
    <div ref={ref} className="relative flex flex-col items-center gap-1 px-4">
      <ConfettiBurst active={showConfetti} />
      <motion.span
        className="text-4xl font-bold text-gradient sm:text-5xl"
        animate={showConfetti ? { scale: [1, 1.12, 1] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.span>{rounded}</motion.span>
        {suffix}
      </motion.span>
      <span className="text-sm font-medium text-ofira-text-secondary">{label}</span>
    </div>
  );
}

export default function SocialStats() {
  const t = useTranslations('landing.socialStats');

  return (
    <section className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16"
      >
        <StatCounter target={93000} suffix="+" label={t('followers')} delay={0} format="K" />
        <StatCounter target={2800} suffix="+" label={t('diagnoses')} delay={0.15} />
        <StatCounter target={35_000_000} suffix="+" label={t('views')} delay={0.3} format="M" />
      </motion.div>
    </section>
  );
}
