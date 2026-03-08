'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Compass, Users, Clock, Sparkles } from 'lucide-react';
import ShimmerButton from '@/components/ui/ShimmerButton';

// ── Stagger animations ─────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// ── Animated counter ────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const duration = 2;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.round(start));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [started, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString()}{suffix}
    </span>
  );
}

// ── Floating avatar bubbles ─────────────────────────────────────────
const avatars = [
  { initials: 'MG', bg: 'from-teal-400 to-emerald-400' },
  { initials: 'CR', bg: 'from-emerald-400 to-teal-500' },
  { initials: 'LP', bg: 'from-teal-500 to-emerald-500' },
  { initials: 'AS', bg: 'from-emerald-500 to-teal-400' },
  { initials: 'JR', bg: 'from-teal-400 to-teal-600' },
];

function AvatarStack() {
  return (
    <div className="flex items-center">
      {avatars.map((a, i) => (
        <motion.div
          key={a.initials}
          className={`flex size-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${a.bg} text-[11px] font-bold text-white shadow-md`}
          style={{ marginLeft: i > 0 ? -8 : 0, zIndex: avatars.length - i }}
          initial={{ opacity: 0, scale: 0, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 1.2 + i * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
        >
          {a.initials}
        </motion.div>
      ))}
      {/* Pulsing "more" dot */}
      <motion.div
        className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-ofira-surface2 text-[11px] font-bold text-ofira-text-secondary shadow-md"
        style={{ marginLeft: -8 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.7, type: 'spring', stiffness: 400 }}
      >
        +99
      </motion.div>
    </div>
  );
}

// ── Animated particles background (deterministic to avoid hydration mismatch) ──
const particles = [
  { w: 4, h: 3, x: 12, y: 8, dy: -60, dx: 15, dur: 8, del: 0 },
  { w: 3, h: 5, x: 85, y: 15, dy: -80, dx: -20, dur: 10, del: 1.2 },
  { w: 5, h: 4, x: 45, y: 72, dy: -50, dx: 10, dur: 7, del: 2.5 },
  { w: 2, h: 3, x: 28, y: 90, dy: -70, dx: -15, dur: 9, del: 0.8 },
  { w: 4, h: 4, x: 68, y: 35, dy: -55, dx: 25, dur: 11, del: 3.1 },
  { w: 3, h: 2, x: 8, y: 55, dy: -65, dx: 8, dur: 8, del: 1.5 },
  { w: 5, h: 5, x: 92, y: 60, dy: -45, dx: -12, dur: 10, del: 4.0 },
  { w: 2, h: 4, x: 55, y: 20, dy: -75, dx: 18, dur: 9, del: 0.3 },
  { w: 4, h: 3, x: 35, y: 45, dy: -60, dx: -22, dur: 7, del: 2.0 },
  { w: 3, h: 3, x: 78, y: 80, dy: -50, dx: 5, dur: 12, del: 3.5 },
  { w: 5, h: 2, x: 18, y: 30, dy: -85, dx: -10, dur: 8, del: 1.8 },
  { w: 2, h: 5, x: 62, y: 95, dy: -40, dx: 20, dur: 10, del: 4.5 },
  { w: 4, h: 4, x: 40, y: 12, dy: -70, dx: -8, dur: 9, del: 0.5 },
  { w: 3, h: 3, x: 90, y: 42, dy: -55, dx: 12, dur: 11, del: 2.8 },
  { w: 5, h: 5, x: 5, y: 75, dy: -60, dx: -18, dur: 7, del: 1.0 },
];

function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-ofira-violet/20"
          style={{ width: p.w, height: p.h, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, p.dy, 0],
            x: [0, p.dx, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.del,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Glowing ring behind CTA ─────────────────────────────────────────
function GlowRing() {
  return (
    <motion.div
      className="pointer-events-none absolute -inset-8 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)',
      }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ── Live activity ticker ────────────────────────────────────────────
const tickerMessages = [
  'Ana acaba de completar su diagnostico',
  'Carlos mejoro su score un 12%',
  'Laura descubrio su area mas debil',
  '3 personas completaron su diagnostico ahora',
  'Pablo alcanzo un score de 91/100',
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % tickerMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      variants={itemVariants}
      className="mt-10 flex items-center gap-2.5 rounded-full border border-ofira-card-border bg-white/70 px-4 py-2 shadow-sm backdrop-blur-sm"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <div className="overflow-hidden h-5">
        <motion.p
          key={idx}
          className="text-xs font-medium text-ofira-text-secondary whitespace-nowrap"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {tickerMessages[idx]}
        </motion.p>
      </div>
    </motion.div>
  );
}

// ── Floating orbs ───────────────────────────────────────────────────
function FloatingOrb({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 15, -10, 20, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

// ── Main Hero ───────────────────────────────────────────────────────
export default function HeroV2() {
  const t = useTranslations('landing.heroV2');

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16 pb-24"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(13,148,136,0.08), transparent 70%)' }}
    >
      {/* Background effects */}
      <FloatingOrb className="-top-32 right-0 h-[500px] w-[500px] bg-ofira-violet/[0.10]" delay={0} />
      <FloatingOrb className="-bottom-32 left-0 h-[400px] w-[400px] bg-ofira-peach/[0.08]" delay={3} />
      <FloatingOrb className="top-1/3 left-1/4 h-[200px] w-[200px] bg-ofira-mint/[0.05]" delay={6} />
      <HeroParticles />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex max-w-3xl flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ofira-violet/15 bg-ofira-violet/5 px-4 py-1.5 text-sm font-medium text-ofira-violet backdrop-blur-sm"
        >
          <Sparkles className="size-3.5" />
          {t('badge')}
        </motion.div>

        {/* Title - word by word reveal */}
        <motion.h1
          variants={itemVariants}
          className="mb-5 text-4xl font-bold leading-[1.08] tracking-tight text-ofira-text sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {t('title').split(' ').map((word: string, i: number) => (
            <motion.span
              key={i}
              className="mr-[0.25em] inline-block last:mr-0"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mb-10 max-w-xl text-lg leading-relaxed text-ofira-text-secondary sm:text-xl"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA group */}
        <motion.div variants={itemVariants} className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <GlowRing />
            <ShimmerButton href="/diagnosis">{t('cta')}</ShimmerButton>
          </div>
          <span className="text-sm text-ofira-text-secondary">{t('ctaSub')}</span>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:gap-8"
        >
          {/* Avatars */}
          <div className="flex items-center gap-3">
            <AvatarStack />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-ofira-violet" />
              <div className="text-left">
                <p className="text-lg font-bold text-ofira-text leading-none">
                  <AnimatedCounter target={3247} suffix="+" />
                </p>
                <p className="text-[10px] text-ofira-text-secondary font-medium">diagnosticos</p>
              </div>
            </div>
            <div className="h-8 w-px bg-ofira-surface2" />
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-ofira-violet" />
              <div className="text-left">
                <p className="text-lg font-bold text-ofira-text leading-none">4 min</p>
                <p className="text-[10px] text-ofira-text-secondary font-medium">de media</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live ticker */}
        <LiveTicker />
      </motion.div>

    </section>
  );
}
