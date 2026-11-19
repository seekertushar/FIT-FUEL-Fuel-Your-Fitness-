export type Language = 'en' | 'hi';
export type ThemeMode = 'light' | 'dark';
export type UserRole = 'member' | 'admin';

export type FitnessGoal =
  | 'Weight Loss'
  | 'Weight Gain'
  | 'Weight Maintenance'
  | 'General Fitness';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type DietaryPreference =
  | 'Vegetarian'
  | 'Non-Vegetarian'
  | 'Vegan'
  | 'Balanced';

export type MealSlot =
  | 'Breakfast'
  | 'Mid-Morning Snack'
  | 'Lunch'
  | 'Evening Snack'
  | 'Dinner';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type WorkoutCategory =
  | 'Full Body Workout'
  | 'Upper Body Workout'
  | 'Lower Body Workout'
  | 'Cardio'
  | 'Strength Training'
  | 'Flexibility and Mobility';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  mobile: string;
  age: number;
  gender: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  experience: ExperienceLevel;
  activityLevel: string;
  dietaryPreference: DietaryPreference;
  allergies: string;
  fitnessGoal: FitnessGoal;
  branchCity: string;
  membershipPlan: string;
  role: UserRole;
  language: Language;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  onboardingComplete: boolean;
  authMode: 'demo' | 'firebase';
  joinedDate: string;
}

export interface ProgressRecord {
  id: string;
  recordDate: string; // YYYY-MM-DD
  weightKg: number | null;
  waistCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  notes: string;
}

export interface DietTemplate {
  id: string;
  title: string;
  titleHi: string;
  mealSlot: MealSlot;
  suggestedTime: string;
  dietType: DietaryPreference;
  goalTag: FitnessGoal;
  foodItems: string[];
  description: string;
  caloriesApprox: number;
  proteinGrams: number;
  dayOfWeek: DayOfWeek;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  titleHi: string;
  category: WorkoutCategory;
  difficulty: ExperienceLevel;
  targetMuscle: string;
  durationOrReps: string;
  description: string;
  dayOfWeek: DayOfWeek;
  goalTag: FitnessGoal;
  imageType: 'strength' | 'mobility' | 'gym';
}

export interface ActivityCompletionMap {
  [key: string]: boolean; // e.g., "2026-11-18:meal:d1" or "2026-11-18:workout:w1" or "2026-11-18:daily:today"
}

export interface PaymentRecord {
  id: string;
  planName: string;
  amountInr: number;
  gstInr: number;
  totalInr: number;
  paymentMethod: 'UPI (GPay / PhonePe)' | 'UPI ID' | 'RuPay / Debit Card' | 'NetBanking (HDFC / SBI / ICICI)';
  upiOrRef: string;
  invoiceNumber: string;
  status: 'Paid';
  paidAt: string;
}

export interface DemoMemberSummary {
  uid: string;
  fullName: string;
  email: string;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  fitnessGoal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  experience: ExperienceLevel;
  branchCity: string;
  membershipPlan: string;
  progressCount: number;
}

export interface MembershipPlanOption {
  id: string;
  name: string;
  nameHi: string;
  audience: string;
  audienceHi: string;
  priceInr: number;
  durationMonths: number;
  billingLabel: string;
  billingLabelHi: string;
  popular?: boolean;
  features: string[];
  featuresHi: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  time: string;
  read: boolean;
}
