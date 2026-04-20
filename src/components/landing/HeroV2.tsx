'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Compass, Sparkles, Play, ShoppingBag } from 'lucide-react';
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

// ── SVG Icons ───────────────────────────────────────────────────────
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.16v-3.45a4.85 4.85 0 01-4.83-1.56V6.69h4.83z"/>
    </svg>
  );
}

// ── Animated counter ────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', format }: { target: number; suffix?: string; format?: 'K' | 'M' }) {
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

  const formatValue = (v: number) => {
    if (format === 'M') return `${(v / 1_000_000).toFixed(v >= 1_000_000 ? 0 : 1)}M`;
    if (format === 'K') return `${(v / 1000).toFixed(v >= 1000 ? 0 : 1)}K`;
    return v.toLocaleString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatValue(val)}{suffix}
    </span>
  );
}

// ── Floating avatar bubbles ─────────────────────────────────────────
const avatars = [
  { name: 'MG', img: 'https://i.pravatar.cc/80?img=1' },
  { name: 'CR', img: 'https://i.pravatar.cc/80?img=5' },
  { name: 'LP', img: 'https://i.pravatar.cc/80?img=9' },
  { name: 'AS', img: 'https://i.pravatar.cc/80?img=16' },
  { name: 'JR', img: 'https://i.pravatar.cc/80?img=11' },
];

function AvatarStack() {
  return (
    <div className="flex items-center">
      {avatars.map((a, i) => (
        <motion.div
          key={a.name}
          className="relative size-9 overflow-hidden rounded-full border-2 border-white shadow-md"
          style={{ marginLeft: i > 0 ? -8 : 0, zIndex: avatars.length - i }}
          initial={{ opacity: 0, scale: 0, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 1.2 + i * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
        >
          <img src={a.img} alt={a.name} className="size-full object-cover" />
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
        +3K
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

  // 3D tilt tracking
  const sectionRef = useRef<HTMLElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    rotateY.set(x * 4);
    rotateX.set(-y * 3);
  }, [rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16 pb-24"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(13,148,136,0.08), transparent 70%)', perspective: 1200 }}
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

        {/* Title - word by word reveal + 3D tilt */}
        <motion.h1
          variants={itemVariants}
          style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d' }}
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
          <a
            href="/shop"
            className="group mt-1 inline-flex items-center gap-2 rounded-full border-2 border-ofira-violet/25 bg-white px-6 py-2.5 text-sm font-semibold text-ofira-violet shadow-sm transition-all hover:border-ofira-violet/40 hover:bg-ofira-violet/5 hover:shadow-md"
          >
            <ShoppingBag className="size-4" />
            {t('ctaShop')}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
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
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <InstagramIcon className="size-3.5 text-ofira-violet" />
                <TikTokIcon className="size-3.5 text-ofira-violet" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-ofira-text leading-none">
                  <AnimatedCounter target={93000} suffix="+" format="K" />
                </p>
                <p className="text-[10px] text-ofira-text-secondary font-medium">seguidores</p>
              </div>
            </div>
            <div className="h-8 w-px bg-ofira-surface2" />
            <div className="flex items-center gap-2">
              <Play className="size-4 text-ofira-violet fill-ofira-violet" />
              <div className="text-left">
                <p className="text-lg font-bold text-ofira-text leading-none">
                  <AnimatedCounter target={35_000_000} suffix="+" format="M" />
                </p>
                <p className="text-[10px] text-ofira-text-secondary font-medium">views</p>
              </div>
            </div>
            <div className="h-8 w-px bg-ofira-surface2" />
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-ofira-violet" />
              <div className="text-left">
                <p className="text-lg font-bold text-ofira-text leading-none">
                  <AnimatedCounter target={2800} suffix="+" format="K" />
                </p>
                <p className="text-[10px] text-ofira-text-secondary font-medium">diagnósticos</p>
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
