'use client';

import { useState, useCallback } from 'react';
import { questions, TOTAL_QUESTIONS } from '@/lib/questions';

export type DiagnosisAnswers = Record<string, unknown>;

export function useDiagnosis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswers>({});
  const [direction, setDirection] = useState<1 | -1>(1);

  const currentQuestion = questions[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOTAL_QUESTIONS - 1;
  const progress = ((currentStep + 1) / TOTAL_QUESTIONS) * 100;

  const setAnswer = useCallback((questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_QUESTIONS - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const canAdvance = useCallback(() => {
    const q = questions[currentStep];
    const answer = answers[q.id];
    if (!q.required) return true;
    if (answer === undefined || answer === null || answer === '') return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    return true;
  }, [currentStep, answers]);

  return {
    currentStep,
    currentQuestion,
    answers,
    direction,
    isFirst,
    isLast,
    progress,
    totalQuestions: TOTAL_QUESTIONS,
    setAnswer,
    goNext,
    goBack,
    canAdvance,
  };
}
