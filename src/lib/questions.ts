export type QuestionType =
  | 'name'
  | 'time'
  | 'energy'
  | 'screenTime'
  | 'obstacles'
  | 'exercise'
  | 'sleepQuality'
  | 'morningRoutine'
  | 'habitChips'
  | 'stressManagement'
  | 'waterIntake'
  | 'mainGoal'
  | 'bodyGoal'
  | 'photoUpload'
  | 'healthConcerns'
  | 'freeText'
  | 'nutritionQuality';

export interface QuestionConfig {
  id: string;
  type: QuestionType;
  required: boolean;
  area?: 'sleep' | 'exercise' | 'nutrition' | 'stress' | 'productivity' | 'hydration';
}

export const questions: QuestionConfig[] = [
  // 1. Intro
  { id: 'name', type: 'name', required: true },
  // 2-4. Sleep & Energy
  { id: 'wakeTime', type: 'time', required: true, area: 'sleep' },
  { id: 'sleepQuality', type: 'sleepQuality', required: true, area: 'sleep' },
  { id: 'energyLevel', type: 'energy', required: true, area: 'productivity' },
  // 5-6. Body (exercise + goals)
  { id: 'exercise', type: 'exercise', required: true, area: 'exercise' },
  { id: 'bodyGoal', type: 'bodyGoal', required: true, area: 'exercise' },
  // 7-10. Daily habits
  { id: 'waterIntake', type: 'waterIntake', required: true, area: 'hydration' },
  { id: 'screenTime', type: 'screenTime', required: true, area: 'productivity' },
  { id: 'morningRoutine', type: 'morningRoutine', required: true, area: 'productivity' },
  // 10. Nutrition
  { id: 'nutritionQuality', type: 'nutritionQuality', required: true, area: 'nutrition' },
  // 11-12. Blockers
  { id: 'obstacle', type: 'obstacles', required: true },
  { id: 'stressManagement', type: 'stressManagement', required: true, area: 'stress' },
  // 13. Health signals
  { id: 'healthConcerns', type: 'healthConcerns', required: true },
  // 14-15. Goals
  { id: 'habitsToImprove', type: 'habitChips', required: true },
  { id: 'mainGoal', type: 'mainGoal', required: true },
  // 16-17. Bonus (optional)
  { id: 'photoUpload', type: 'photoUpload', required: false },
  { id: 'freeText', type: 'freeText', required: false },
];

export const TOTAL_QUESTIONS = questions.length;
