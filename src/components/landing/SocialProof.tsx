'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Quote } from 'lucide-react';

function AnimatedCounter({ target }: { target: number }) {
  const t = useTranslations('landing.socialProof');
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, target, { duration: 2, ease: 'easeOut' });
    return controls.stop;
  }, [count, target]);

  return (
    <div className="mb-16 text-center">
      <span className="text-5xl font-bold text-gradient sm:text-6xl">
        <motion.span>{rounded}</motion.span>+
      </span>
      <p className="mt-2 text-lg text-ofira-text-secondary">{t('counter')}</p>
    </div>
  );
}

const testimonials = [
  { textKey: 'testimonial1', authorKey: 'testimonial1Author' },
  { textKey: 'testimonial2', authorKey: 'testimonial2Author' },
  { textKey: 'testimonial3', authorKey: 'testimonial3Author' },
] as const;

function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
    setTilt({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-w-[280px] flex-shrink-0 rounded-2xl border border-ofira-card-border bg-ofira-card p-6 transition-transform duration-200 sm:min-w-0"
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      {children}
    </div>
  );
}

export default function SocialProof() {
  const t = useTranslations('landing.socialProof');
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  return (
    <section className="py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        <AnimatedCounter target={2847} />
      </motion.div>

      {/* Desktop: grid with tilt */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-6">
        {testimonials.map(({ textKey, authorKey }, i) => (
          <motion.div
            key={textKey}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <TiltCard>
              <Quote className="mb-4 size-5 text-ofira-violet" />
              <p className="mb-4 text-sm leading-relaxed text-ofira-text-secondary">
                &ldquo;{t(textKey)}&rdquo;
              </p>
              <span className="text-sm font-semibold">{t(authorKey)}</span>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Mobile: marquee auto-scroll */}
      <div
        className="sm:hidden overflow-hidden"
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          ref={marqueeRef}
          className="flex gap-6 marquee-scroll"
          style={{
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {[...testimonials, ...testimonials].map(({ textKey, authorKey }, i) => (
            <div
              key={`${textKey}-${i}`}
              className="min-w-[280px] flex-shrink-0 rounded-2xl border border-ofira-card-border bg-ofira-card p-6"
            >
              <Quote className="mb-4 size-5 text-ofira-violet" />
              <p className="mb-4 text-sm leading-relaxed text-ofira-text-secondary">
                &ldquo;{t(textKey)}&rdquo;
              </p>
              <span className="text-sm font-semibold">{t(authorKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
