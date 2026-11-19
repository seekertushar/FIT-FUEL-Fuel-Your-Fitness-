import { DayOfWeek, DietaryPreference, DietTemplate, FitnessGoal, MealSlot } from '../types/fitfuel';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const MEAL_SLOTS: MealSlot[] = [
  'Breakfast',
  'Mid-Morning Snack',
  'Lunch',
  'Evening Snack',
  'Dinner',
];

export function getEffectiveGoal(goal: FitnessGoal, age: number): FitnessGoal {
  if (age < 18) {
    return 'General Fitness';
  }
  return goal;
}

export function findAllergyMatches(template: DietTemplate, allergiesRaw: string): string[] {
  if (!allergiesRaw || !allergiesRaw.trim()) return [];
  const tokens = allergiesRaw
    .split(/[,;/]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 2);
  if (tokens.length === 0) return [];
  const haystack = `${template.title} ${template.foodItems.join(' ')} ${template.description}`.toLowerCase();
  return tokens.filter((token) => haystack.includes(token));
}

export function filterDietTemplates(params: {
  templates: DietTemplate[];
  day: DayOfWeek;
  dietFilter: DietaryPreference | 'All';
  searchQuery?: string;
}): DietTemplate[] {
  const { templates, day, dietFilter, searchQuery = '' } = params;
  const q = searchQuery.trim().toLowerCase();

  const matching = templates.filter((item) => {
    const dayMatch = item.dayOfWeek === day;
    const dietMatch =
      dietFilter === 'All' ||
      dietFilter === 'Balanced' ||
      item.dietType === dietFilter ||
      (dietFilter === 'Vegetarian' && item.dietType === 'Vegan');
    const queryMatch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.foodItems.some((f) => f.toLowerCase().includes(q)) ||
      item.mealSlot.toLowerCase().includes(q);
    return dayMatch && dietMatch && queryMatch;
  });

  // Sort strictly in meal-slot chronological order
  return matching.sort(
    (a, b) => MEAL_SLOTS.indexOf(a.mealSlot) - MEAL_SLOTS.indexOf(b.mealSlot)
  );
}

export function getTodayDayOfWeek(date = new Date()): DayOfWeek {
  const map: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return map[date.getDay()];
}
