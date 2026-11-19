import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull().default('Member'),
  mobile: text('mobile').default(''),
  age: integer('age').default(25),
  gender: text('gender').default('Prefer not to say'),
  heightCm: doublePrecision('height_cm').default(170),
  currentWeightKg: doublePrecision('current_weight_kg').default(70),
  targetWeightKg: doublePrecision('target_weight_kg').default(67),
  experience: text('experience').default('Beginner'),
  activityLevel: text('activity_level').default('Moderately Active'),
  dietaryPreference: text('dietary_preference').default('Vegetarian'),
  allergies: text('allergies').default(''),
  fitnessGoal: text('fitness_goal').default('General Fitness'),
  branchCity: text('branch_city').default('Bengaluru — Indiranagar'),
  membershipPlan: text('membership_plan').default('Quarterly Pro (₹4,999)'),
  role: text('role').default('member'),
  language: text('language').default('en'),
  theme: text('theme').default('light'),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  onboardingComplete: boolean('onboarding_complete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const progressRecords = pgTable('progress_records', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  recordDate: text('record_date').notNull(),
  weightKg: doublePrecision('weight_kg'),
  waistCm: doublePrecision('waist_cm'),
  chestCm: doublePrecision('chest_cm'),
  armCm: doublePrecision('arm_cm'),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dietTemplates = pgTable('diet_templates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  titleHi: text('title_hi').default(''),
  mealSlot: text('meal_slot').notNull(),
  suggestedTime: text('suggested_time').notNull(),
  dietType: text('diet_type').notNull(),
  goalTag: text('goal_tag').notNull(),
  foodItems: text('food_items').notNull(),
  description: text('description').notNull(),
  caloriesApprox: integer('calories_approx').default(350),
  proteinGrams: integer('protein_grams').default(16),
  dayOfWeek: text('day_of_week').notNull(),
  createdBy: text('created_by').default('trainer'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workoutTemplates = pgTable('workout_templates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  titleHi: text('title_hi').default(''),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  targetMuscle: text('target_muscle').notNull(),
  durationOrReps: text('duration_or_reps').notNull(),
  description: text('description').notNull(),
  dayOfWeek: text('day_of_week').notNull(),
  goalTag: text('goal_tag').notNull(),
  createdBy: text('created_by').default('trainer'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  logDate: text('log_date').notNull(),
  itemType: text('item_type').notNull(),
  itemId: text('item_id').notNull(),
  completed: boolean('completed').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const paymentRecords = pgTable('payment_records', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  planName: text('plan_name').notNull(),
  amountInr: integer('amount_inr').notNull(),
  gstInr: integer('gst_inr').notNull(),
  totalInr: integer('total_inr').notNull(),
  paymentMethod: text('payment_method').notNull(),
  upiOrRef: text('upi_or_ref').notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  status: text('status').default('Paid').notNull(),
  paidAt: timestamp('paid_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  progressRecords: many(progressRecords),
  activityLogs: many(activityLogs),
  paymentRecords: many(paymentRecords),
}));

export const progressRecordsRelations = relations(progressRecords, ({ one }) => ({
  user: one(users, {
    fields: [progressRecords.userUid],
    references: [users.uid],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userUid],
    references: [users.uid],
  }),
}));

export const paymentRecordsRelations = relations(paymentRecords, ({ one }) => ({
  user: one(users, {
    fields: [paymentRecords.userUid],
    references: [users.uid],
  }),
}));
