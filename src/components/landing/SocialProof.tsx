'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { Star, BadgeCheck } from 'lucide-react';

function AnimatedCounter({ target }: { target: number }) {
  const t = useTranslations('landing.socialProof');
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, target, { duration: 2, ease: 'easeOut' });
    return controls.stop;
  }, [count, target]);

  return (
    <div className="mb-14 text-center">
      <span className="text-5xl font-bold text-gradient sm:text-6xl">
        <motion.span>{rounded}</motion.span>+
      </span>
      <p className="mt-2 text-lg text-ofira-text-secondary">{t('counter')}</p>
    </div>
  );
}

const testimonials = [
  { textKey: 'testimonial1', authorKey: 'testimonial1Author', avatar: 'https://i.pravatar.cc/80?img=1', score: 82 },
  { textKey: 'testimonial2', authorKey: 'testimonial2Author', avatar: 'https://i.pravatar.cc/80?img=3', score: 76 },
  { textKey: 'testimonial3', authorKey: 'testimonial3Author', avatar: 'https://i.pravatar.cc/80?img=5', score: 91 },
  { textKey: 'testimonial4', authorKey: 'testimonial4Author', avatar: 'https://i.pravatar.cc/80?img=8', score: 68 },
  { textKey: 'testimonial5', authorKey: 'testimonial5Author', avatar: 'https://i.pravatar.cc/80?img=9', score: 85 },
  { textKey: 'testimonial6', authorKey: 'testimonial6Author', avatar: 'https://i.pravatar.cc/80?img=11', score: 73 },
  { textKey: 'testimonial7', authorKey: 'testimonial7Author', avatar: 'https://i.pravatar.cc/80?img=16', score: 88 },
  { textKey: 'testimonial8', authorKey: 'testimonial8Author', avatar: 'https://i.pravatar.cc/80?img=12', score: 79 },
  { textKey: 'testimonial9', authorKey: 'testimonial9Author', avatar: 'https://i.pravatar.cc/80?img=20', score: 84 },
  { textKey: 'testimonial10', authorKey: 'testimonial10Author', avatar: 'https://i.pravatar.cc/80?img=14', score: 77 },
  { textKey: 'testimonial11', authorKey: 'testimonial11Author', avatar: 'https://i.pravatar.cc/80?img=23', score: 90 },
  { textKey: 'testimonial12', authorKey: 'testimonial12Author', avatar: 'https://i.pravatar.cc/80?img=33', score: 71 },
  { textKey: 'testimonial13', authorKey: 'testimonial13Author', avatar: 'https://i.pravatar.cc/80?img=25', score: 83 },
  { textKey: 'testimonial14', authorKey: 'testimonial14Author', avatar: 'https://i.pravatar.cc/80?img=51', score: 66 },
  { textKey: 'testimonial15', authorKey: 'testimonial15Author', avatar: 'https://i.pravatar.cc/80?img=52', score: 95 },
  { textKey: 'testimonial16', authorKey: 'testimonial16Author', avatar: 'https://i.pravatar.cc/80?img=32', score: 81 },
  { textKey: 'testimonial17', authorKey: 'testimonial17Author', avatar: 'https://i.pravatar.cc/80?img=53', score: 87 },
  { textKey: 'testimonial18', authorKey: 'testimonial18Author', avatar: 'https://i.pravatar.cc/80?img=44', score: 74 },
  { textKey: 'testimonial19', authorKey: 'testimonial19Author', avatar: 'https://i.pravatar.cc/80?img=57', score: 80 },
  { textKey: 'testimonial20', authorKey: 'testimonial20Author', avatar: 'https://i.pravatar.cc/80?img=47', score: 92 },
] as const;

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function TestimonialCard({ textKey, authorKey, avatar, score }: typeof testimonials[number]) {
  const t = useTranslations('landing.socialProof');

  return (
    <div className="card-elevated flex h-full flex-col p-6">
      <Stars />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ofira-text">
        &ldquo;{t(textKey)}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="relative">
          <img
            src={avatar}
            alt=""
            className="size-10 rounded-full object-cover shadow-md ring-2 ring-white"
          />
          <BadgeCheck className="absolute -bottom-0.5 -right-0.5 size-4 fill-ofira-violet text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-ofira-text">{t(authorKey)}</p>
            <span className="rounded bg-ofira-violet/10 px-1.5 py-0.5 text-[9px] font-bold text-ofira-violet uppercase tracking-wider">Verificado</span>
          </div>
          <p className="text-[11px] text-ofira-text-secondary">Score: {score}/100</p>
        </div>
      </div>
    </div>
  );
}

// ── Infinite scroll rows (marquee) ──────────────────────────────────
const CARD_WIDTH = 320;
const GAP = 20;

function MarqueeRow({ items, direction = 'left', speed = 40 }: {
  items: typeof testimonials[number][];
  direction?: 'left' | 'right';
  speed?: number;
}) {
  // Triple items for seamless infinite loop
  const tripled = [...items, ...items, ...items];
  const setWidth = items.length * (CARD_WIDTH + GAP);

  return (
    <div className="relative overflow-hidden py-2">
      <div
        className="flex"
        style={{
          width: `${tripled.length * (CARD_WIDTH + GAP)}px`,
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {tripled.map((item, i) => (
          <div
            key={`${item.textKey}-${i}`}
            className="flex-shrink-0"
            style={{ width: CARD_WIDTH, marginRight: GAP }}
          >
            <TestimonialCard {...item} />
          </div>
        ))}
      </div>
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ofira-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ofira-bg to-transparent" />
    </div>
  );
}

export default function SocialProof() {
  const row1 = [...testimonials].slice(0, 10) as typeof testimonials[number][];
  const row2 = [...testimonials].slice(10) as typeof testimonials[number][];

  return (
    <section className="py-24 px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        <AnimatedCounter target={3247} />
      </motion.div>

      <div className="space-y-5">
        <MarqueeRow items={row1} direction="left" speed={45} />
        <MarqueeRow items={row2} direction="right" speed={50} />
      </div>
    </section>
  );
}
