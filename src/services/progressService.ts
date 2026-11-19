import { ProgressRecord, UserProfile } from '../types/fitfuel';

export type ChartRange = 'weekly' | 'monthly' | 'yearly';

export function sortProgressByDateAsc(records: ProgressRecord[]): ProgressRecord[] {
  return [...records].sort((a, b) => a.recordDate.localeCompare(b.recordDate));
}

export function sortProgressByDateDesc(records: ProgressRecord[]): ProgressRecord[] {
  return [...records].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
}

export function filterProgressByRange(
  records: ProgressRecord[],
  range: ChartRange,
  referenceDate = new Date()
): ProgressRecord[] {
  const sorted = sortProgressByDateAsc(records).filter((r) => r.weightKg !== null);
  if (sorted.length === 0) return [];

  const refMs = referenceDate.getTime();
  const daysBack = range === 'weekly' ? 14 : range === 'monthly' ? 90 : 365;
  const cutoffMs = refMs - daysBack * 24 * 60 * 60 * 1000;

  const filtered = sorted.filter((r) => {
    const parsed = new Date(r.recordDate).getTime();
    return Number.isFinite(parsed) && parsed >= cutoffMs;
  });

  // Ensure chart always displays meaningful recent points if demo records are older than window
  if (filtered.length >= 2) return filtered;
  if (range === 'weekly') return sorted.slice(-4);
  if (range === 'monthly') return sorted.slice(-8);
  return sorted;
}

export function getLatestWeight(records: ProgressRecord[], fallbackWeight: number): number {
  const sortedDesc = sortProgressByDateDesc(records);
  const found = sortedDesc.find((r) => r.weightKg !== null && Number.isFinite(r.weightKg));
  return found && found.weightKg !== null ? found.weightKg : fallbackWeight;
}

export function calculateProfileCompletion(profile: UserProfile): number {
  const checks = [
    Boolean(profile.fullName.trim()),
    Boolean(profile.email.trim()),
    Boolean(profile.mobile.trim()),
    profile.age >= 10 && profile.age <= 100,
    profile.heightCm >= 80,
    profile.currentWeightKg >= 20,
    Boolean(profile.experience),
    Boolean(profile.dietaryPreference),
    Boolean(profile.fitnessGoal),
    Boolean(profile.branchCity),
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function calculateGstBreakdown(baseAmountInr: number): {
  baseInr: number;
  gstInr: number;
  totalInr: number;
} {
  const baseInr = Math.max(0, Math.round(baseAmountInr));
  const gstInr = Math.round(baseInr * 0.18);
  return {
    baseInr,
    gstInr,
    totalInr: baseInr + gstInr,
  };
}

export function validateIndianUpiId(upiId: string): boolean {
  return /^[a-zA-Z0-9._-]{2,64}@[a-zA-Z]{2,32}$/.test(upiId.trim());
}

export function validateIndianMobile(mobile: string): boolean {
  const digits = mobile.replace(/[\s+-]/g, '');
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits);
  if (digits.length === 12 && digits.startsWith('91')) return /^91[6-9]\d{9}$/.test(digits);
  return false;
}
