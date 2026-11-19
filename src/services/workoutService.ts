import {
  DayOfWeek,
  ExperienceLevel,
  FitnessGoal,
  WorkoutCategory,
  WorkoutTemplate,
} from '../types/fitfuel';

export const WORKOUT_CATEGORIES: WorkoutCategory[] = [
  'Full Body Workout',
  'Upper Body Workout',
  'Lower Body Workout',
  'Cardio',
  'Strength Training',
  'Flexibility and Mobility',
];

export function filterWorkoutTemplates(params: {
  templates: WorkoutTemplate[];
  category: WorkoutCategory | 'All';
  difficulty: ExperienceLevel | 'All';
  day?: DayOfWeek | 'All';
  searchQuery?: string;
}): WorkoutTemplate[] {
  const { templates, category, difficulty, day = 'All', searchQuery = '' } = params;
  const q = searchQuery.trim().toLowerCase();

  return templates.filter((w) => {
    const catOk = category === 'All' || w.category === category;
    const diffOk = difficulty === 'All' || w.difficulty === difficulty;
    const dayOk = day === 'All' || w.dayOfWeek === day;
    const queryOk =
      !q ||
      w.title.toLowerCase().includes(q) ||
      w.targetMuscle.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q);
    return catOk && diffOk && dayOk && queryOk;
  });
}

export function getSuggestedDailyWorkout(
  templates: WorkoutTemplate[],
  day: DayOfWeek,
  experience: ExperienceLevel,
  goal: FitnessGoal,
  age: number
): WorkoutTemplate[] {
  const effectiveDiff: ExperienceLevel = age < 18 ? 'Beginner' : experience;
  const exactDay = templates.filter(
    (w) => w.dayOfWeek === day && w.difficulty === effectiveDiff
  );
  if (exactDay.length > 0) return exactDay;
  const fallbackDay = templates.filter((w) => w.dayOfWeek === day);
  if (fallbackDay.length > 0) return fallbackDay;
  return templates.filter((w) => w.difficulty === effectiveDiff || w.goalTag === goal).slice(0, 3);
}

export function isRestDay(day: DayOfWeek): boolean {
  return day === 'Sunday';
}
