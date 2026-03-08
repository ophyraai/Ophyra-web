interface Scores {
  sleep: number;
  exercise: number;
  nutrition: number;
  stress: number;
  productivity: number;
  hydration: number;
}

interface ScoringResult {
  scores: Scores;
  overall_score: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreSleep(answers: Record<string, unknown>): number {
  let score = 5;

  // wakeTime: number 0-14 (slider index, each step = 1hr starting at 5:00)
  const wakeTime = answers.wakeTime;
  if (typeof wakeTime === 'number') {
    // 0=5:00, 1=5:30, 2=6:00 ... index 0-4 → early (5-7am), 4-6 → ok (7-8am), etc.
    if (wakeTime <= 4) score += 2;       // 5:00-7:00
    else if (wakeTime <= 6) score += 1;  // 7:00-8:00
    else if (wakeTime <= 10) score -= 1; // 8:00-10:00
    else score -= 2;                      // >10:00
  }

  // sleepQuality: number 0-4 (0=terrible, 4=incredible)
  const sleepQuality = answers.sleepQuality;
  if (typeof sleepQuality === 'number') {
    const qualityScores = [-3, -2, 0, 2, 3]; // terrible→incredible
    score += qualityScores[sleepQuality] ?? 0;
  }

  return clamp(score, 1, 10);
}

function scoreExercise(answers: Record<string, unknown>): number {
  // exercise: { exercises: boolean, frequency?: number (1-7) }
  const exercise = answers.exercise as { exercises?: boolean; frequency?: number } | undefined;

  let score = 3;
  if (exercise) {
    if (!exercise.exercises) {
      score = 2;
    } else {
      const freq = exercise.frequency ?? 0;
      if (freq >= 6) score = 9;
      else if (freq >= 4) score = 8;
      else if (freq >= 3) score = 6;
      else if (freq >= 2) score = 5;
      else score = 4;
    }
  }

  // Body goal adjustment
  const bodyGoals = answers.bodyGoal as string[] | undefined;
  if (Array.isArray(bodyGoals) && bodyGoals.length > 0) {
    const physicalGoals = ['gainMuscle', 'toneUp', 'loseWeight', 'endurance'];
    const hasPhysicalGoal = bodyGoals.some((g) => physicalGoals.includes(g));
    if (hasPhysicalGoal && (!exercise?.exercises)) {
      score = Math.max(1, score - 1);
    }
  }

  return clamp(score, 1, 10);
}

function scoreNutrition(answers: Record<string, unknown>): number {
  // nutritionQuality: string (terrible|poor|average|good|excellent)
  const nutritionQuality = answers.nutritionQuality as string | undefined;
  if (nutritionQuality) {
    const qualityMap: Record<string, number> = {
      excellent: 9,
      good: 7,
      average: 5,
      poor: 3,
      terrible: 1,
    };
    let score = qualityMap[nutritionQuality] ?? 5;

    // energyLevel: number 0-4
    const energyLevel = answers.energyLevel;
    if (typeof energyLevel === 'number') {
      if (energyLevel >= 4) score += 1;
      else if (energyLevel <= 1) score -= 1;
    }

    // Check if nutrition is in habits to improve
    const habits = answers.habitsToImprove as string[] | undefined;
    if (Array.isArray(habits) && habits.includes('nutrition')) {
      score -= 1;
    }

    return clamp(score, 1, 10);
  }

  return 5;
}

function scoreStress(answers: Record<string, unknown>): number {
  let score = 5;

  // stressManagement: string (meditation|exercise|social|nothing|entertainment)
  const stressMethod = answers.stressManagement as string | undefined;
  if (stressMethod) {
    const methodScores: Record<string, number> = {
      meditation: 3,
      exercise: 2,
      social: 1,
      nothing: -3,
      entertainment: -1,
    };
    score += methodScores[stressMethod] ?? 0;
  }

  // obstacle: string — check if stress-related
  const obstacle = answers.obstacle as string | undefined;
  if (obstacle === 'stress') {
    score -= 2;
  }

  return clamp(score, 1, 10);
}

function scoreProductivity(answers: Record<string, unknown>): number {
  let score = 5;

  // screenTime: number (0-16 hours)
  const screenTime = answers.screenTime;
  if (typeof screenTime === 'number') {
    if (screenTime <= 2) score += 2;
    else if (screenTime <= 4) score += 1;
    else if (screenTime >= 8) score -= 2;
    else if (screenTime >= 6) score -= 1;
  }

  // morningRoutine: { hasRoutine: boolean, activities?: string[] }
  const routine = answers.morningRoutine as { hasRoutine?: boolean; activities?: string[] } | undefined;
  if (routine) {
    if (!routine.hasRoutine) {
      score -= 2;
    } else {
      const activities = routine.activities ?? [];
      if (activities.length >= 3) score += 2;
      else if (activities.length >= 1) score += 1;
    }
  }

  // energyLevel: number 0-4
  const energyLevel = answers.energyLevel;
  if (typeof energyLevel === 'number') {
    if (energyLevel >= 4) score += 1;
    else if (energyLevel <= 1) score -= 1;
  }

  return clamp(score, 1, 10);
}

function scoreHydration(answers: Record<string, unknown>): number {
  // waterIntake: number (1-8 glasses)
  const waterIntake = answers.waterIntake;
  if (typeof waterIntake !== 'number') return 5;

  if (waterIntake >= 8) return 9;
  if (waterIntake >= 6) return 7;
  if (waterIntake >= 4) return 5;
  if (waterIntake >= 2) return 3;
  return 1;
}

export function calculateScores(answers: Record<string, unknown>): ScoringResult {
  const scores: Scores = {
    sleep: scoreSleep(answers),
    exercise: scoreExercise(answers),
    nutrition: scoreNutrition(answers),
    stress: scoreStress(answers),
    productivity: scoreProductivity(answers),
    hydration: scoreHydration(answers),
  };

  const weights = {
    sleep: 0.20,
    exercise: 0.18,
    nutrition: 0.17,
    stress: 0.18,
    productivity: 0.15,
    hydration: 0.12,
  };

  const weightedSum =
    scores.sleep * weights.sleep +
    scores.exercise * weights.exercise +
    scores.nutrition * weights.nutrition +
    scores.stress * weights.stress +
    scores.productivity * weights.productivity +
    scores.hydration * weights.hydration;

  let overall_score = Math.round(weightedSum * 10);

  // Health concerns adjustment
  const healthConcerns = answers.healthConcerns as string[] | undefined;
  if (Array.isArray(healthConcerns)) {
    const count = healthConcerns.filter((c) => !c.startsWith('other:')).length;
    if (count >= 5) overall_score -= 3;
    else if (count >= 3) overall_score -= 2;
    else if (count >= 1) overall_score -= 1;
  }

  return { scores, overall_score: clamp(overall_score, 0, 100) };
}
