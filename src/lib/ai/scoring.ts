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

// Each scoring function uses DIRECT MAPPING (not base+delta)
// Sleep: map wakeTime + sleepQuality directly
function scoreSleep(answers: Record<string, unknown>): number {
  // wakeTime: 0-14 (slider, each = 30min from 5:00)
  // sleepQuality: 0-4 (terrible=0 to incredible=4)

  let score = 5; // default

  const sleepQuality = answers.sleepQuality;
  if (typeof sleepQuality === 'number') {
    // Direct map: 0→2, 1→3, 2→5, 3→7, 4→9
    const qualityMap = [2, 3, 5, 7, 9];
    score = qualityMap[sleepQuality] ?? 5;
  }

  const wakeTime = answers.wakeTime;
  if (typeof wakeTime === 'number') {
    // Early risers get bonus, late risers get penalty
    if (wakeTime <= 2) score += 2; // 5:00-6:00
    else if (wakeTime <= 4) score += 1; // 6:00-7:00
    else if (wakeTime <= 6) score += 0; // 7:00-8:00
    else if (wakeTime <= 10) score -= 1; // 8:00-10:00
    else score -= 2; // >10:00
  }

  // Intention-action gap
  const mainGoal = answers.mainGoal as string | undefined;
  if (mainGoal === 'sleep' && typeof sleepQuality === 'number' && sleepQuality <= 1) {
    score -= 1;
  }

  return clamp(score, 1, 10);
}

// Exercise: direct map from frequency
function scoreExercise(answers: Record<string, unknown>): number {
  const exercise = answers.exercise as { exercises?: boolean; frequency?: number } | undefined;

  let score = 2; // default: no exercise data = bad
  if (exercise) {
    if (!exercise.exercises) {
      score = 2;
    } else {
      const freq = exercise.frequency ?? 0;
      // Direct map: 1→4, 2→5, 3→6, 4→7, 5→8, 6→9, 7→10
      if (freq >= 7) score = 10;
      else if (freq >= 6) score = 9;
      else if (freq >= 5) score = 8;
      else if (freq >= 4) score = 7;
      else if (freq >= 3) score = 6;
      else if (freq >= 2) score = 5;
      else score = 4;
    }
  }

  // Intention-action gap: physical goals but no exercise
  const bodyGoals = answers.bodyGoal as string[] | undefined;
  const physicalGoals = ['gainMuscle', 'toneUp', 'loseWeight', 'endurance'];
  if (Array.isArray(bodyGoals) && bodyGoals.some((g) => physicalGoals.includes(g))) {
    if (!exercise?.exercises) score -= 2;
  }

  // Goal-action gap
  const mainGoal = answers.mainGoal as string | undefined;
  if (mainGoal === 'fitness' && !exercise?.exercises) {
    score -= 2;
  }

  return clamp(score, 1, 10);
}

// Nutrition: direct map from quality
function scoreNutrition(answers: Record<string, unknown>): number {
  const nutritionQuality = answers.nutritionQuality as string | undefined;
  // Direct map
  const qualityMap: Record<string, number> = {
    excellent: 9,
    good: 7,
    average: 5,
    poor: 3,
    terrible: 1,
  };
  let score = qualityMap[nutritionQuality ?? ''] ?? 5;

  // Energy level modifier (stronger effect)
  const energyLevel = answers.energyLevel;
  if (typeof energyLevel === 'number') {
    if (energyLevel >= 4) score += 1;
    else if (energyLevel === 0) score -= 2;
    else if (energyLevel <= 1) score -= 1;
  }

  // Self-awareness: listing nutrition as to-improve
  const habits = answers.habitsToImprove as string[] | undefined;
  if (Array.isArray(habits) && habits.includes('nutrition')) {
    score -= 1;
  }

  return clamp(score, 1, 10);
}

// Stress: direct map from method
function scoreStress(answers: Record<string, unknown>): number {
  const stressMethod = answers.stressManagement as string | undefined;
  // Direct map (no base+delta)
  const methodScores: Record<string, number> = {
    meditation: 8,
    exercise: 7,
    social: 5,
    entertainment: 3,
    nothing: 2,
  };
  let score = methodScores[stressMethod ?? ''] ?? 5;

  // Obstacle penalty
  const obstacle = answers.obstacle as string | undefined;
  if (obstacle === 'stress') score -= 2;

  return clamp(score, 1, 10);
}

// Productivity: direct mapping
function scoreProductivity(answers: Record<string, unknown>): number {
  let score = 5;

  const screenTime = answers.screenTime;
  if (typeof screenTime === 'number') {
    // Direct map screen time
    if (screenTime <= 1) score = 9;
    else if (screenTime <= 2) score = 8;
    else if (screenTime <= 3) score = 7;
    else if (screenTime <= 4) score = 6;
    else if (screenTime <= 6) score = 4;
    else if (screenTime <= 8) score = 3;
    else score = 2;
  }

  const routine = answers.morningRoutine as
    | { hasRoutine?: boolean; activities?: string[] }
    | undefined;
  if (routine) {
    if (!routine.hasRoutine) {
      score -= 2;
    } else {
      const activities = routine.activities ?? [];
      if (activities.length >= 4) score += 2;
      else if (activities.length >= 2) score += 1;
    }
  }

  const energyLevel = answers.energyLevel;
  if (typeof energyLevel === 'number') {
    if (energyLevel >= 4) score += 1;
    else if (energyLevel <= 1) score -= 1;
  }

  return clamp(score, 1, 10);
}

// Hydration: direct map
function scoreHydration(answers: Record<string, unknown>): number {
  const waterIntake = answers.waterIntake;
  if (typeof waterIntake !== 'number') return 5;

  if (waterIntake >= 8) return 10;
  if (waterIntake >= 7) return 9;
  if (waterIntake >= 6) return 7;
  if (waterIntake >= 5) return 6;
  if (waterIntake >= 4) return 5;
  if (waterIntake >= 3) return 4;
  if (waterIntake >= 2) return 3;
  return 1;
}

export function calculateScores(answers: Record<string, unknown>): ScoringResult {
  // Phase 1: Individual scores
  const scores: Scores = {
    sleep: scoreSleep(answers),
    exercise: scoreExercise(answers),
    nutrition: scoreNutrition(answers),
    stress: scoreStress(answers),
    productivity: scoreProductivity(answers),
    hydration: scoreHydration(answers),
  };

  // Phase 2: Cross-penalties
  if (scores.sleep <= 3 && scores.exercise <= 3) {
    scores.productivity = clamp(scores.productivity - 1, 1, 10);
  }
  if (scores.nutrition <= 3 && scores.exercise <= 3) {
    scores.hydration = clamp(scores.hydration - 1, 1, 10);
  }
  if (scores.stress <= 3 && scores.sleep <= 3) {
    scores.nutrition = clamp(scores.nutrition - 1, 1, 10);
  }

  // Phase 3: Synergy bonuses
  const exercise = answers.exercise as { exercises?: boolean; frequency?: number } | undefined;
  const sleepQuality = answers.sleepQuality;
  const stressMethod = answers.stressManagement as string | undefined;

  if (
    exercise?.exercises &&
    (exercise.frequency ?? 0) >= 5 &&
    typeof sleepQuality === 'number' &&
    sleepQuality >= 3 &&
    (stressMethod === 'meditation' || stressMethod === 'exercise')
  ) {
    scores.productivity = clamp(scores.productivity + 1, 1, 10);
  }

  const waterIntake = answers.waterIntake;
  const nutritionQuality = answers.nutritionQuality as string | undefined;
  if (
    typeof waterIntake === 'number' &&
    waterIntake >= 6 &&
    (nutritionQuality === 'good' || nutritionQuality === 'excellent')
  ) {
    scores.exercise = clamp(scores.exercise + 1, 1, 10);
  }

  // Phase 4: Overall score with amplified variance
  const weights = {
    sleep: 0.2,
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

  let raw = weightedSum * 10;

  // Amplify variance
  let overall_score = Math.round(50 + (raw - 50) * 1.4);

  // Compounding penalties for very low areas
  const scoreValues = Object.values(scores);
  const veryLowCount = scoreValues.filter((s) => s <= 3).length;
  overall_score -= veryLowCount * 2;

  // Bonuses for high areas
  const highCount = scoreValues.filter((s) => s >= 8).length;
  overall_score += highCount;

  // Health concerns adjustment
  const healthConcerns = answers.healthConcerns as string[] | undefined;
  if (Array.isArray(healthConcerns)) {
    const count = healthConcerns.filter((c) => !c.startsWith('other:')).length;
    if (count >= 5) overall_score -= 4;
    else if (count >= 3) overall_score -= 2;
    else if (count >= 1) overall_score -= 1;
  }

  return { scores, overall_score: clamp(overall_score, 0, 100) };
}
