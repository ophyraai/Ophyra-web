'use client';

import { useTranslations } from 'next-intl';
import { useDiagnosis, type DiagnosisAnswers } from '@/hooks/useDiagnosis';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import ConstellationProgress from './ConstellationProgress';
import QuestionWrapper from './QuestionWrapper';
import NameInput from './questions/NameInput';
import TimeSelector from './questions/TimeSelector';
import EnergyLevel from './questions/EnergyLevel';
import ScreenTime from './questions/ScreenTime';
import ObstacleCards from './questions/ObstacleCards';
import ExerciseToggle from './questions/ExerciseToggle';
import SleepQuality from './questions/SleepQuality';
import MorningRoutine from './questions/MorningRoutine';
import HabitChips from './questions/HabitChips';
import StressManagement from './questions/StressManagement';
import WaterIntake from './questions/WaterIntake';
import MainGoal from './questions/MainGoal';
import BodyGoal from './questions/BodyGoal';
import PhotoUpload from './questions/PhotoUpload';
import HealthConcerns from './questions/HealthConcerns';
import FreeText from './questions/FreeText';
import NutritionQuality from './questions/NutritionQuality';
import type { QuestionType } from '@/lib/questions';

interface DiagnosisFlowProps {
  onSubmit: (answers: DiagnosisAnswers) => void;
}

function QuestionComponent({
  type,
  value,
  onChange,
}: {
  type: QuestionType;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (type) {
    case 'name':
      return <NameInput value={(value as string) ?? ''} onChange={onChange} />;
    case 'time':
      return <TimeSelector value={value as number} onChange={onChange} />;
    case 'energy':
      return <EnergyLevel value={value as number} onChange={onChange} />;
    case 'screenTime':
      return <ScreenTime value={value as number} onChange={onChange} />;
    case 'obstacles':
      return <ObstacleCards value={value as string} onChange={onChange} />;
    case 'exercise':
      return <ExerciseToggle value={value as { exercises: boolean; frequency?: number }} onChange={onChange} />;
    case 'sleepQuality':
      return <SleepQuality value={value as number} onChange={onChange} />;
    case 'morningRoutine':
      return <MorningRoutine value={value as { hasRoutine: boolean; activities?: string[] }} onChange={onChange} />;
    case 'habitChips':
      return <HabitChips value={value as string[]} onChange={onChange} />;
    case 'stressManagement':
      return <StressManagement value={value as string} onChange={onChange} />;
    case 'waterIntake':
      return <WaterIntake value={value as number} onChange={onChange} />;
    case 'mainGoal':
      return <MainGoal value={value as string} onChange={onChange} />;
    case 'bodyGoal':
      return <BodyGoal value={(value as string[]) ?? []} onChange={onChange} />;
    case 'photoUpload':
      return <PhotoUpload value={(value as string[]) ?? []} onChange={onChange} />;
    case 'healthConcerns':
      return <HealthConcerns value={(value as string[]) ?? []} onChange={onChange} />;
    case 'freeText':
      return <FreeText value={(value as string) ?? ''} onChange={onChange} />;
    case 'nutritionQuality':
      return <NutritionQuality value={(value as string) ?? ''} onChange={onChange} />;
  }
}

export default function DiagnosisFlow({ onSubmit }: DiagnosisFlowProps) {
  const t = useTranslations('diagnosis');
  const {
    currentStep,
    currentQuestion,
    answers,
    direction,
    isFirst,
    isLast,
    progress,
    totalQuestions,
    setAnswer,
    goNext,
    goBack,
    canAdvance,
  } = useDiagnosis();

  const handleNext = () => {
    if (isLast) {
      onSubmit(answers);
    } else {
      goNext();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ofira-bg">
      <ConstellationProgress current={currentStep} total={totalQuestions} />

      <div className="flex flex-1 flex-col">
        <QuestionWrapper direction={direction} questionKey={currentQuestion.id} questionType={currentQuestion.type}>
          <QuestionComponent
            type={currentQuestion.type}
            value={answers[currentQuestion.id]}
            onChange={(val) => setAnswer(currentQuestion.id, val)}
          />
        </QuestionWrapper>

        <div className="flex items-center justify-between px-4 pb-8 pt-4">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={isFirst}
            className="gap-2 text-ofira-text-secondary hover:text-ofira-text"
          >
            <ArrowLeft className="size-4" />
            {t('back')}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            className={`group gap-2 rounded-full bg-gradient-to-r from-ofira-violet to-ofira-peach px-6 font-semibold text-white transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 ${canAdvance() ? 'animate-pulse-glow' : ''}`}
          >
            {isLast ? (
              <>
                <Sparkles className="size-4" />
                {t('submit')}
              </>
            ) : (
              <>
                {t('next')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
