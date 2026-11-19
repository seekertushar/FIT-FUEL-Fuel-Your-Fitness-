import {
  ActivityCompletionMap,
  DemoMemberSummary,
  DietTemplate,
  NotificationItem,
  PaymentRecord,
  ProgressRecord,
  UserProfile,
  WorkoutTemplate,
} from '../types/fitfuel';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_ACTIVITY_MAP,
  INITIAL_DEMO_MEMBERS,
  INITIAL_DIET_TEMPLATES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENT_RECORDS,
  INITIAL_PROGRESS_RECORDS,
  INITIAL_WORKOUT_TEMPLATES,
} from '../data/sampleData';

const KEYS = {
  user: 'fitfuel_demo_user_v1',
  loggedIn: 'fitfuel_demo_logged_in_v1',
  progress: 'fitfuel_demo_progress_v1',
  diets: 'fitfuel_demo_diets_v1',
  workouts: 'fitfuel_demo_workouts_v1',
  activity: 'fitfuel_demo_activity_v1',
  payments: 'fitfuel_demo_payments_v1',
  members: 'fitfuel_demo_members_v1',
  notifications: 'fitfuel_demo_notifications_v1',
  rememberEmail: 'fitfuel_remember_email_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export const storageService = {
  loadUser: (): UserProfile => safeRead(KEYS.user, DEFAULT_USER_PROFILE),
  saveUser: (user: UserProfile) => {
    // Never persist passwords — UserProfile interface has no password field
    safeWrite(KEYS.user, user);
  },

  isLoggedIn: (): boolean => safeRead(KEYS.loggedIn, false),
  setLoggedIn: (val: boolean) => safeWrite(KEYS.loggedIn, val),

  getRememberedEmail: (): string => safeRead(KEYS.rememberEmail, ''),
  setRememberedEmail: (email: string) => safeWrite(KEYS.rememberEmail, email),

  loadProgress: (): ProgressRecord[] => safeRead(KEYS.progress, INITIAL_PROGRESS_RECORDS),
  saveProgress: (items: ProgressRecord[]) => safeWrite(KEYS.progress, items),

  loadDiets: (): DietTemplate[] => safeRead(KEYS.diets, INITIAL_DIET_TEMPLATES),
  saveDiets: (items: DietTemplate[]) => safeWrite(KEYS.diets, items),

  loadWorkouts: (): WorkoutTemplate[] => safeRead(KEYS.workouts, INITIAL_WORKOUT_TEMPLATES),
  saveWorkouts: (items: WorkoutTemplate[]) => safeWrite(KEYS.workouts, items),

  loadActivity: (): ActivityCompletionMap => safeRead(KEYS.activity, INITIAL_ACTIVITY_MAP),
  saveActivity: (map: ActivityCompletionMap) => safeWrite(KEYS.activity, map),

  loadPayments: (): PaymentRecord[] => safeRead(KEYS.payments, INITIAL_PAYMENT_RECORDS),
  savePayments: (items: PaymentRecord[]) => safeWrite(KEYS.payments, items),

  loadMembers: (): DemoMemberSummary[] => safeRead(KEYS.members, INITIAL_DEMO_MEMBERS),
  saveMembers: (items: DemoMemberSummary[]) => safeWrite(KEYS.members, items),

  loadNotifications: (): NotificationItem[] => safeRead(KEYS.notifications, INITIAL_NOTIFICATIONS),
  saveNotifications: (items: NotificationItem[]) => safeWrite(KEYS.notifications, items),

  resetAllDemoData: () => {
    Object.values(KEYS).forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  },
};
