'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';

interface QuestionWrapperProps {
  direction: 1 | -1;
  questionKey: string;
  questionType: string;
  children: React.ReactNode;
}

const defaultVariants: Variants = {
  enter: (direction: number) => ({
    x: direction * 300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction * -300,
    opacity: 0,
  }),
};

function getVariants(questionType: string): Variants {
  switch (questionType) {
    case 'name':
      return {
        enter: { scale: 0.95, opacity: 0 },
        center: { scale: 1, opacity: 1 },
        exit: { scale: 1.05, opacity: 0 },
      };
    case 'time':
      return {
        enter: { y: 100, opacity: 0 },
        center: { y: 0, opacity: 1 },
        exit: { y: -100, opacity: 0 },
      };
    case 'energy':
      return {
        enter: { y: 40, opacity: 0, transition: { staggerChildren: 0.05 } },
        center: { y: 0, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
      };
    case 'obstacles':
      return {
        enter: { y: 200, opacity: 0, rotateZ: -3 },
        center: { y: 0, opacity: 1, rotateZ: 0 },
        exit: { y: -200, opacity: 0, rotateZ: Math.random() * 6 - 3 },
      };
    case 'sleepQuality':
      return {
        enter: { scale: 0.9, rotate: -2, opacity: 0 },
        center: { scale: 1, rotate: 0, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
      };
    case 'habitChips':
      return {
        enter: { scale: 0, opacity: 0 },
        center: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 },
      };
    case 'waterIntake':
      return {
        enter: { y: -80, opacity: 0 },
        center: { y: 0, opacity: 1 },
        exit: { y: 80, opacity: 0 },
      };
    case 'mainGoal':
      return {
        enter: { scale: 0.8, opacity: 0 },
        center: { scale: 1, opacity: 1 },
        exit: { scale: 0.5, opacity: 0 },
      };
    case 'bodyGoal':
      return {
        enter: { y: 60, opacity: 0 },
        center: { y: 0, opacity: 1 },
        exit: { y: -60, opacity: 0 },
      };
    case 'photoUpload':
      return {
        enter: { scale: 0.9, opacity: 0 },
        center: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
      };
    case 'healthConcerns':
      return {
        enter: { y: 40, opacity: 0 },
        center: { y: 0, opacity: 1 },
        exit: { y: -40, opacity: 0 },
      };
    case 'freeText':
      return {
        enter: { y: 80, opacity: 0 },
        center: { y: 0, opacity: 1 },
        exit: { y: -80, opacity: 0 },
      };
    case 'nutritionQuality':
      return {
        enter: { y: 50, opacity: 0 },
        center: { y: 0, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
      };
    default:
      return defaultVariants;
  }
}

export default function QuestionWrapper({ direction, questionKey, questionType, children }: QuestionWrapperProps) {
  const variants = getVariants(questionType);
  const usesDirection = questionType === undefined || !['name', 'time', 'energy', 'obstacles', 'sleepQuality', 'habitChips', 'waterIntake', 'mainGoal', 'bodyGoal', 'photoUpload', 'healthConcerns', 'freeText', 'nutritionQuality'].includes(questionType);

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={questionKey}
        custom={usesDirection ? direction : undefined}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex min-h-[calc(100vh-10rem)] w-full flex-col items-center justify-center px-4"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
