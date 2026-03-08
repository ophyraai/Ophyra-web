'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
        bgRef.current.style.background = `conic-gradient(from ${angle}deg at 50% 50%, #0c0a14, rgba(196,161,255,0.08), #0c0a14, rgba(255,158,122,0.06), #0c0a14)`;
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
    const timer = setTimeout(() => router.push(onNavigate), 600);
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
              background: 'radial-gradient(circle, #c4a1ff 0%, transparent 70%)',
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
              background: 'radial-gradient(circle, #ff9e7a 0%, transparent 70%)',
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
              backgroundColor: 'rgba(196,161,255,0.3)',
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
            background: 'linear-gradient(135deg, #c4a1ff, #ff9e7a)',
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
                backgroundColor: i === messageIndex ? '#c4a1ff' : 'rgba(196,161,255,0.2)',
              }}
            />
          ))}
        </div>

        {/* Shockwave effect */}
        {showShockwave && (
          <motion.div
            className="absolute rounded-full border-2 border-ofira-violet"
            style={{ width: 128, height: 128, top: 0 }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </motion.div>
    </div>
  );
}

export default function DiagnosisPage() {
  const router = useRouter();
  const t = useTranslations('analysis');
  const [phase, setPhase] = useState<Phase>('quiz');
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [navigateTo, setNavigateTo] = useState<string | null>(null);
  const messages = t.raw('messages') as string[];

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
        body: JSON.stringify({ answers, email, name, locale: 'es', photoUrls }),
      });

      if (!submitRes.ok) throw new Error('Failed to submit diagnosis');
      const { id, scores } = await submitRes.json();

      // 2. Trigger AI analysis (fire & forget — streams in background)
      fetch('/api/diagnosis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosisId: id, answers, scores, locale: 'es', photoUrls }),
      }).catch(console.error);

      // 3. Navigate to results after animation
      clearInterval(interval);
      setNavigateTo(`/diagnosis/${id}`);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('error');
    }
  }, [messages.length]);

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
