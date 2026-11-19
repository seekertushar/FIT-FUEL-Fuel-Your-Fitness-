import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBmiValue, evaluateBmi } from './bmiService';
import { findAllergyMatches, getEffectiveGoal } from './dietService';
import {
  calculateGstBreakdown,
  calculateProfileCompletion,
  formatInr,
  getLatestWeight,
  validateIndianMobile,
  validateIndianUpiId,
} from './progressService';
import { isRestDay } from './workoutService';
import { DietTemplate, ProgressRecord, UserProfile } from '../types/fitfuel';
import {
  TRANSLATIONS,
  getNextLanguage,
  localizeDayShort,
  localizeEnum,
  translate,
} from '../utils/i18n';

test('BMI calculation computes accurate metric BMI', () => {
  assert.equal(calculateBmiValue(175, 72), 23.5);
  assert.equal(calculateBmiValue(165, 50), 18.4);
  assert.equal(calculateBmiValue(40, 70), null);
});

test('Adult BMI evaluation returns exact reference categories', () => {
  const normal = evaluateBmi(175, 72, 26);
  assert.equal(normal.valid, true);
  assert.equal(normal.isMinor, false);
  assert.equal(normal.category, 'Normal range');

  const overweight = evaluateBmi(170, 80, 30);
  assert.equal(overweight.category, 'Overweight');

  const obesity = evaluateBmi(170, 92, 32);
  assert.equal(obesity.category, 'Obesity range');
});

test('Under-18 safety guard blocks adult BMI categories and weight-loss/gain goals', () => {
  const minor = evaluateBmi(165, 72, 16);
  assert.equal(minor.valid, true);
  assert.equal(minor.isMinor, true);
  assert.equal(minor.category, null);
  assert.equal(getEffectiveGoal('Weight Loss', 16), 'General Fitness');
  assert.equal(getEffectiveGoal('Weight Gain', 15), 'General Fitness');
  assert.equal(getEffectiveGoal('Weight Loss', 22), 'Weight Loss');
});

test('Diet allergy detection matches ingredients case-insensitively', () => {
  const sampleMeal: DietTemplate = {
    id: 'm1',
    title: 'Vegetable Poha with Roasted Peanuts',
    titleHi: 'वेजिटेबल पोहा',
    mealSlot: 'Breakfast',
    suggestedTime: '08:00 AM',
    dietType: 'Vegan',
    goalTag: 'General Fitness',
    foodItems: ['Flattened rice (Poha)', 'Roasted peanuts', 'Curry leaves'],
    description: 'Light Indian breakfast rich in complex carbs.',
    caloriesApprox: 310,
    proteinGrams: 9,
    dayOfWeek: 'Monday',
  };
  assert.deepEqual(findAllergyMatches(sampleMeal, 'peanuts, shellfish'), ['peanuts']);
  assert.deepEqual(findAllergyMatches(sampleMeal, 'dairy'), []);
});

test('INR GST calculation, Indian formatting, UPI and mobile validation work', () => {
  const gst = calculateGstBreakdown(4999);
  assert.equal(gst.baseInr, 4999);
  assert.equal(gst.gstInr, 900);
  assert.equal(gst.totalInr, 5899);
  assert.equal(formatInr(14999), '₹14,999');

  assert.equal(validateIndianUpiId('aarav.sharma@okaxis'), true);
  assert.equal(validateIndianUpiId('invalid-upi'), false);

  assert.equal(validateIndianMobile('+91 98450 12345'), true);
  assert.equal(validateIndianMobile('9845012345'), true);
  assert.equal(validateIndianMobile('12345'), false);
});

test('Progress latest weight, rest day check, and profile completion work', () => {
  const records: ProgressRecord[] = [
    { id: '1', recordDate: '2026-10-01', weightKg: 75.2, waistCm: 84, chestCm: 98, armCm: 34, notes: '' },
    { id: '2', recordDate: '2026-11-15', weightKg: 72.4, waistCm: 81, chestCm: 99, armCm: 34.5, notes: '' },
  ];
  assert.equal(getLatestWeight(records, 76), 72.4);
  assert.equal(isRestDay('Sunday'), true);
  assert.equal(isRestDay('Monday'), false);

  const profile: UserProfile = {
    uid: 'demo-1',
    fullName: 'Aarav Sharma',
    email: 'aarav@fitfuel.in',
    mobile: '+91 98450 12345',
    age: 26,
    gender: 'Male',
    heightCm: 175,
    currentWeightKg: 72.4,
    targetWeightKg: 69,
    experience: 'Intermediate',
    activityLevel: 'Moderately Active',
    dietaryPreference: 'Vegetarian',
    allergies: '',
    fitnessGoal: 'General Fitness',
    branchCity: 'Bengaluru — Indiranagar',
    membershipPlan: 'Quarterly Pro',
    role: 'member',
    language: 'en',
    theme: 'light',
    notificationsEnabled: true,
    onboardingComplete: true,
    authMode: 'demo',
    joinedDate: '2026-08-12',
  };
  assert.equal(calculateProfileCompletion(profile), 100);
});

test('i18n translation dictionary, interpolation, and enum localization work for EN and HI', () => {
  // Every translation key must have non-empty English and Hindi strings
  for (const [key, entry] of Object.entries(TRANSLATIONS)) {
    assert.ok(entry.en.trim().length > 0, `Missing EN text for key ${key}`);
    assert.ok(entry.hi.trim().length > 0, `Missing HI text for key ${key}`);
  }

  assert.equal(translate('en', 'navHome'), 'Home');
  assert.equal(translate('hi', 'navHome'), 'होम');
  assert.equal(translate('en', 'stepCounter', { step: 2, total: 3 }), 'Step 2 of 3');
  assert.equal(translate('hi', 'stepCounter', { step: 2, total: 3 }), 'चरण 2 / 3');
  assert.equal(translate('hi', 'unknownKeyFallback'), 'unknownKeyFallback');

  assert.equal(localizeEnum('en', 'Vegetarian'), 'Vegetarian');
  assert.equal(localizeEnum('hi', 'Vegetarian'), 'शाकाहारी');
  assert.equal(localizeEnum('hi', 'Normal range'), 'सामान्य श्रेणी');
  assert.equal(localizeEnum('hi', 'Monday'), 'सोमवार');
  assert.equal(localizeEnum('hi', 'Paid'), 'भुगतान पूर्ण');

  assert.equal(localizeDayShort('en', 'Wednesday'), 'Wed');
  assert.equal(localizeDayShort('hi', 'Wednesday'), 'बुध');

  assert.equal(getNextLanguage('en'), 'hi');
  assert.equal(getNextLanguage('hi'), 'en');
});
