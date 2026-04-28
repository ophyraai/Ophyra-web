'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import DiagnosisFlow from '@/components/diagnosis/DiagnosisFlow';
import TypewriterText from '@/components/ui/TypewriterText';
import type { DiagnosisAnswers } from '@/hooks/useDiagnosis';

type Phase = 'quiz' | 'analyzing' | 'error';

function AnalyzingScreen({
  messages,
  messageIndex,
  onNavigate,
}: {
  messages: string[];
  messageIndex: number;
  onNavigate: string | null;
}) {
  const t = useTranslations('analysis');
  const router = useRouter();
  const bgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [percent, setPercent] = useState(0);
  const [showShockwave, setShowShockwave] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !bgRef.current) return;

    let angle = 0;
    const step = () => {
      angle = (angle + 0.3) % 360;
      if (bgRef.current) {
        bgRef.current.style.background = `conic-gradient(from ${angle}deg at 50% 50%, #ffffff, rgba(13,148,136,0.06), #ffffff, rgba(5,150,105,0.04), #ffffff)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const duration = 12000;
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const linear = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - linear, 3);
      setPercent(Math.round(eased * 100));
      if (linear < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!onNavigate) return;
    setPercent(100);
    setShowShockwave(true);
    const timer = setTimeout(() => router.push(onNavigate), 1000);
    return () => clearTimeout(timer);
  }, [onNavigate, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ofira-bg px-4">
      <div ref={bgRef} className="absolute inset-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center gap-8"
      >
        {/* Multi-layer pulsing orb */}
        <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
          {/* Outer layer */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 128,
              height: 128,
              background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Middle layer */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 96,
              height: 96,
              background: 'radial-gradient(circle, #059669 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          {/* Inner core */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(13,148,136,0.15)',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Orbiting dots */}
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-ofira-violet"
              style={{ top: 0, left: '50%' }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.4,
              }}
              transformTemplate={({ rotate }) =>
                `rotate(${rotate}) translateY(54px)`
              }
            />
          ))}
        </div>

        <h2 className="text-2xl font-bold">{t('title')}</h2>

        {/* Percentage counter */}
        <motion.span
          className="text-4xl font-bold tabular-nums"
          style={{
            background: 'linear-gradient(135deg, #0d9488, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {percent}%
        </motion.span>

        {/* Typewriter messages */}
        <div className="h-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TypewriterText
                text={messages[messageIndex]}
                speed={30}
                className="text-ofira-text-secondary"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {messages.map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i === messageIndex ? '#0d9488' : 'rgba(13,148,136,0.15)',
              }}
            />
          ))}
        </div>

        {/* Shockwave effect — multi-layer dramatic burst */}
        {showShockwave && (
          <>
            {/* White flash overlay */}
            <motion.div
              className="fixed inset-0 z-50 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.8, times: [0, 0.3, 1], ease: 'easeOut' }}
            />
            {/* Ring 1 – fast, solid */}
            <motion.div
              className="absolute rounded-full border-4 border-ofira-violet"
              style={{ width: 128, height: 128, top: 0 }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
            {/* Ring 2 – slower, thinner */}
            <motion.div
              className="absolute rounded-full border-2 border-emerald-400"
              style={{ width: 128, height: 128, top: 0 }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
            />
            {/* Ring 3 – glow fill */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 128,
                height: 128,
                top: 0,
                background: 'radial-gradient(circle, rgba(13,148,136,0.4) 0%, transparent 70%)',
              }}
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 10, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            {/* Content scale up */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeIn' }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

function DiagnosisPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('analysis');
  const currentLocale = useLocale();
  const [phase, setPhase] = useState<Phase>('quiz');
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [navigateTo, setNavigateTo] = useState<string | null>(null);
  const messages = t.raw('messages') as string[];

  const isRediagnosis = searchParams.get('rediagnosis') === 'true';
  const previousDiagnosisId = searchParams.get('previous');

  const handleSubmit = useCallback(async (answers: DiagnosisAnswers) => {
    setPhase('analyzing');

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    try {
      // Extract known fields from answers
      const name = (answers.name as string) || '';
      const photoUrls = (answers.photoUpload as string[]) || [];
      const email = (answers.email as string) || `${Date.now()}@anonymous.ophyra`;

      // 1. Submit diagnosis & calculate scores
      const submitRes = await fetch('/api/diagnosis/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, email, name, locale: currentLocale, photoUrls }),
      });

      if (!submitRes.ok) throw new Error('Failed to submit diagnosis');
      const { id, scores } = await submitRes.json();

      // 2. Trigger AI analysis (fire & forget)
      // keepalive ensures the request survives page navigation
      fetch('/api/diagnosis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosisId: id, answers, scores, locale: currentLocale, photoUrls }),
        keepalive: true,
      }).catch(console.error);

      // 3. Navigate to results or comparison after animation
      clearInterval(interval);
      if (isRediagnosis && previousDiagnosisId) {
        setNavigateTo(`/diagnosis/${id}/compare?previous=${previousDiagnosisId}`);
      } else {
        setNavigateTo(`/diagnosis/${id}`);
      }
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('error');
    }
  }, [messages.length, isRediagnosis, previousDiagnosisId]);

  if (phase === 'analyzing') {
    return (
      <AnalyzingScreen
        messages={messages}
        messageIndex={messageIndex}
        onNavigate={navigateTo}
      />
    );
  }

  if (phase === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ofira-bg px-4">
        <p className="mb-4 text-red-400">{error}</p>
        <button
          onClick={() => setPhase('quiz')}
          className="rounded-lg bg-ofira-violet px-6 py-2 font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return <DiagnosisFlow onSubmit={handleSubmit} />;
}

export default function DiagnosisPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ofira-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ofira-violet border-t-transparent" />
      </div>
    }>
      <DiagnosisPageInner />
    </Suspense>
  );
}
