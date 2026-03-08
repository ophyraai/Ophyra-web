'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface AnalyzingScreenProps {
  diagnosisId: string;
  answers: Record<string, unknown>;
  scores: Record<string, number>;
  locale: string;
  onComplete: () => void;
}

export default function AnalyzingScreen({
  diagnosisId,
  answers,
  scores,
  locale,
  onComplete,
}: AnalyzingScreenProps) {
  const t = useTranslations('analysis');
  const messages = t.raw('messages') as string[];
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    async function analyze() {
      try {
        const res = await fetch('/api/diagnosis/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diagnosisId, answers, scores, locale }),
        });

        if (!res.ok) throw new Error('Analysis failed');

        // Read the stream to completion
        const reader = res.body?.getReader();
        if (reader) {
          while (true) {
            const { done } = await reader.read();
            if (done) break;
          }
        }

        setIsAnalyzing(false);
        // Small delay for UX before navigating
        setTimeout(onComplete, 1500);
      } catch (error) {
        console.error('Analysis error:', error);
        // Still navigate on error - results page will handle missing analysis
        setTimeout(onComplete, 2000);
      }
    }

    analyze();
  }, [diagnosisId, answers, scores, locale, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ofira-bg">
      {/* Pulsing orb animation */}
      <div className="relative mb-12">
        <motion.div
          className="h-32 w-32 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(20,184,166,0.4) 0%, rgba(16,185,129,0.1) 50%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(20,184,166,0.6) 0%, rgba(16,185,129,0.2) 60%, transparent 80%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />
        <motion.div
          className="absolute inset-10 rounded-full bg-ofira-teal/30"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          }}
        />
      </div>

      {/* Title */}
      <motion.h2
        className="mb-8 text-2xl font-bold"
        style={{ fontFamily: 'var(--font-display)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t('title')}
      </motion.h2>

      {/* Cycling messages */}
      <div className="h-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            className="text-ofira-text-secondary text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {messages[currentMessage]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex gap-2">
        {messages.map((_, i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full"
            animate={{
              backgroundColor:
                i <= currentMessage
                  ? 'rgba(20,184,166,1)'
                  : 'rgba(255,255,255,0.1)',
              scale: i === currentMessage ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {!isAnalyzing && (
          <motion.p
            className="mt-8 text-ofira-teal font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {locale === 'es' ? 'Listo! Preparando tus resultados...' : 'Done! Preparing your results...'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
