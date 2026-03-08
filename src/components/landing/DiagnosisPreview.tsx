'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ShimmerButton from '@/components/ui/ShimmerButton';

interface QuestionOption {
  label: string;
  emoji: string;
}

interface SampleQuestion {
  questionKey: string;
  options: QuestionOption[];
}

const sampleQuestions: SampleQuestion[] = [
  {
    questionKey: 'sampleQ1',
    options: [
      { label: 'Agotado', emoji: '😴' },
      { label: 'Normal', emoji: '😐' },
      { label: 'Bueno', emoji: '😊' },
      { label: 'Increible', emoji: '⚡' },
    ],
  },
  {
    questionKey: 'sampleQ2',
    options: [
      { label: 'Nunca', emoji: '🚫' },
      { label: '1-2 veces', emoji: '🚶' },
      { label: '3-4 veces', emoji: '🏃' },
      { label: 'Diario', emoji: '💪' },
    ],
  },
  {
    questionKey: 'sampleQ3',
    options: [
      { label: 'Meditacion', emoji: '🧘' },
      { label: 'Deporte', emoji: '🏋️' },
      { label: 'Redes', emoji: '📱' },
      { label: 'Nada', emoji: '🤷' },
    ],
  },
];

export default function DiagnosisPreview() {
  const t = useTranslations('landing.diagnosisPreview');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = sampleQuestions[currentQ];
  const isLast = currentQ === sampleQuestions.length - 1;

  const handleOptionClick = (idx: number) => {
    setSelectedOption(idx);
    // Auto-advance after a short delay
    setTimeout(() => {
      if (!isLast) {
        setCurrentQ((prev) => prev + 1);
        setSelectedOption(null);
      }
    }, 500);
  };

  return (
    <section id="diagnosis-preview" className="py-20 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-ofira-text sm:text-4xl">{t('title')}</h2>
        </motion.div>

        {/* Quiz card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card overflow-hidden p-6 sm:p-8"
        >
          {/* Progress dots */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {sampleQuestions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentQ ? 'w-8 bg-ofira-violet' : i < currentQ ? 'w-4 bg-ofira-violet/40' : 'w-4 bg-ofira-surface2'
                }`}
              />
            ))}
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-6 text-center text-lg font-semibold text-ofira-text">
                {t(question.questionKey)}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {question.options.map((opt, i) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleOptionClick(i)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
                      selectedOption === i
                        ? 'border-ofira-violet/30 bg-ofira-violet/5 text-ofira-violet scale-[0.97]'
                        : 'border-ofira-card-border bg-white text-ofira-text hover:border-ofira-violet/15 hover:bg-ofira-surface1'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <div className="mt-8 flex justify-center">
            <ShimmerButton href="/diagnosis">
              {t('cta')}
              <ArrowRight className="size-4" />
            </ShimmerButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
