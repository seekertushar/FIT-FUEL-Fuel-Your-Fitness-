import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  ActivityCompletionMap,
  DemoMemberSummary,
  DietTemplate,
  Language,
  NotificationItem,
  PaymentRecord,
  ProgressRecord,
  ThemeMode,
  UserProfile,
  UserRole,
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
import { storageService } from '../services/storageService';
import { API_CONFIG, apiFetch } from '../services/apiConfig';
import { getEffectiveGoal } from '../services/dietService';
import { useLanguage } from './LanguageContext';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextValue {
  user: UserProfile;
  isAuthenticated: boolean;
  authLoading: boolean;
  progressRecords: ProgressRecord[];
  dietTemplates: DietTemplate[];
  workoutTemplates: WorkoutTemplate[];
  activityMap: ActivityCompletionMap;
  payments: PaymentRecord[];
  demoMembers: DemoMemberSummary[];
  notifications: NotificationItem[];
  language: Language;
  theme: ThemeMode;
  toasts: ToastItem[];
  addToast: (type: ToastItem['type'], message: string) => void;
  dismissToast: (id: string) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  signInWithGoogle: () => Promise<boolean>;
  demoLogin: (email: string, role?: UserRole, remember?: boolean) => void;
  demoRegister: (payload: {
    fullName: string;
    email: string;
    mobile: string;
    age: number;
    gender: string;
  }) => void;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  addProgress: (entry: Omit<ProgressRecord, 'id'>) => Promise<void>;
  updateProgress: (id: string, entry: Omit<ProgressRecord, 'id'>) => Promise<void>;
  deleteProgress: (id: string) => Promise<void>;
  toggleActivity: (dateStr: string, itemType: 'meal' | 'workout' | 'daily', itemId: string) => Promise<void>;
  recordPayment: (entry: Omit<PaymentRecord, 'id' | 'status' | 'paidAt'>) => Promise<PaymentRecord>;
  addDietTemplate: (item: Omit<DietTemplate, 'id'>) => Promise<void>;
  updateDietTemplate: (id: string, item: Omit<DietTemplate, 'id'>) => Promise<void>;
  deleteDietTemplate: (id: string) => Promise<void>;
  addWorkoutTemplate: (item: Omit<WorkoutTemplate, 'id'>) => Promise<void>;
  updateWorkoutTemplate: (id: string, item: Omit<WorkoutTemplate, 'id'>) => Promise<void>;
  deleteWorkoutTemplate: (id: string) => Promise<void>;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage: setContextLanguage } = useLanguage();
  const [user, setUser] = useState<UserProfile>(() => ({
    ...storageService.loadUser(),
    language,
  }));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageService.isLoggedIn());
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>(() =>
    storageService.loadProgress()
  );
  const [dietTemplates, setDietTemplates] = useState<DietTemplate[]>(() => storageService.loadDiets());
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(() =>
    storageService.loadWorkouts()
  );
  const [activityMap, setActivityMap] = useState<ActivityCompletionMap>(() =>
    storageService.loadActivity()
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() => storageService.loadPayments());
  const [demoMembers, setDemoMembers] = useState<DemoMemberSummary[]>(() =>
    storageService.loadMembers()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    storageService.loadNotifications()
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Firebase ID token kept strictly in memory (never in localStorage)
  const idTokenRef = useRef<string | null>(null);

  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Apply Tailwind v4 .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (user.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [user.theme]);

  // Keep user.language synchronized with LanguageContext
  useEffect(() => {
    setUser((prev) => (prev.language === language ? prev : { ...prev, language }));
  }, [language]);

  // Persist local demo state
  useEffect(() => {
    storageService.saveUser(user);
  }, [user]);

  useEffect(() => {
    storageService.setLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    storageService.saveProgress(progressRecords);
  }, [progressRecords]);

  useEffect(() => {
    storageService.saveDiets(dietTemplates);
  }, [dietTemplates]);

  useEffect(() => {
    storageService.saveWorkouts(workoutTemplates);
  }, [workoutTemplates]);

  useEffect(() => {
    storageService.saveActivity(activityMap);
  }, [activityMap]);

  useEffect(() => {
    storageService.savePayments(payments);
  }, [payments]);

  useEffect(() => {
    storageService.saveMembers(demoMembers);
  }, [demoMembers]);

  useEffect(() => {
    storageService.saveNotifications(notifications);
  }, [notifications]);

  // Observe Firebase Auth state & sync Cloud SQL profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        idTokenRef.current = null;
        return;
      }
      try {
        setAuthLoading(true);
        const token = await fbUser.getIdToken();
        idTokenRef.current = token;
        const data = await apiFetch<{
          profile: any;
          progress: any[];
          activities: any[];
          payments: any[];
        }>(API_CONFIG.endpoints.authMe, { method: 'GET' }, token);

        if (data.profile) {
          const p = data.profile;
          const syncedUser: UserProfile = {
            ...DEFAULT_USER_PROFILE,
            uid: p.uid,
            email: p.email,
            fullName: p.fullName || fbUser.displayName || 'FIT FUEL Member',
            mobile: p.mobile || '',
            age: Number(p.age ?? 25),
            gender: p.gender || 'Prefer not to say',
            heightCm: Number(p.heightCm ?? 170),
            currentWeightKg: Number(p.currentWeightKg ?? 70),
            targetWeightKg: Number(p.targetWeightKg ?? 67),
            experience: p.experience || 'Beginner',
            activityLevel: p.activityLevel || 'Moderately Active',
            dietaryPreference: p.dietaryPreference || 'Vegetarian',
            allergies: p.allergies || '',
            fitnessGoal: getEffectiveGoal(p.fitnessGoal || 'General Fitness', Number(p.age ?? 25)),
            branchCity: p.branchCity || 'Bengaluru — Indiranagar',
            membershipPlan: p.membershipPlan || 'Quarterly Pro',
            role: p.role === 'admin' ? 'admin' : 'member',
            language: p.language === 'hi' ? 'hi' : 'en',
            theme: p.theme === 'dark' ? 'dark' : 'light',
            notificationsEnabled: Boolean(p.notificationsEnabled ?? true),
            onboardingComplete: Boolean(p.onboardingComplete ?? true),
            authMode: 'firebase',
            joinedDate: p.createdAt ? String(p.createdAt).slice(0, 10) : DEFAULT_USER_PROFILE.joinedDate,
          };
          setUser(syncedUser);
          setContextLanguage(syncedUser.language);
          setIsAuthenticated(true);

          if (Array.isArray(data.progress) && data.progress.length > 0) {
            setProgressRecords(
              data.progress.map((r) => ({
                id: String(r.id),
                recordDate: r.recordDate,
                weightKg: r.weightKg ?? null,
                waistCm: r.waistCm ?? null,
                chestCm: r.chestCm ?? null,
                armCm: r.armCm ?? null,
                notes: r.notes || '',
              }))
            );
          }

          if (Array.isArray(data.activities) && data.activities.length > 0) {
            const nextMap: ActivityCompletionMap = {};
            data.activities.forEach((a) => {
              nextMap[`${a.logDate}:${a.itemType}:${a.itemId}`] = Boolean(a.completed);
            });
            setActivityMap(nextMap);
          }

          if (Array.isArray(data.payments) && data.payments.length > 0) {
            setPayments(
              data.payments.map((pay) => ({
                id: String(pay.id),
                planName: pay.planName,
                amountInr: Number(pay.amountInr),
                gstInr: Number(pay.gstInr),
                totalInr: Number(pay.totalInr),
                paymentMethod: pay.paymentMethod,
                upiOrRef: pay.upiOrRef,
                invoiceNumber: pay.invoiceNumber,
                status: 'Paid',
                paidAt: pay.paidAt ? String(pay.paidAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
              }))
            );
          }
        }
      } catch (err) {
        console.error('Could not sync Cloud SQL profile:', err);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthLoading(true);
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const token = await cred.user.getIdToken();
      idTokenRef.current = token;
      setIsAuthenticated(true);
      addToast('success', `Signed in as ${cred.user.displayName || cred.user.email}`);
      return true;
    } catch (error: any) {
      addToast('error', error?.message || 'Google Sign-In was cancelled or failed.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [addToast]);

  const demoLogin = useCallback(
    (email: string, role: UserRole = 'member', remember = false) => {
      if (remember) {
        storageService.setRememberedEmail(email);
      }
      setUser((prev) => {
        const existingEmail = prev.email.toLowerCase() === email.toLowerCase();
        return {
          ...(existingEmail ? prev : DEFAULT_USER_PROFILE),
          email,
          fullName: existingEmail
            ? prev.fullName
            : role === 'admin'
            ? 'Coach Vikram Mehta'
            : DEFAULT_USER_PROFILE.fullName,
          role,
          authMode: 'demo',
          onboardingComplete: true,
        };
      });
      setIsAuthenticated(true);
      addToast('success', role === 'admin' ? 'Signed in to Trainer / Admin Demo Console' : 'Signed in to FIT FUEL Member Demo');
    },
    [addToast]
  );

  const demoRegister = useCallback(
    (payload: {
      fullName: string;
      email: string;
      mobile: string;
      age: number;
      gender: string;
    }) => {
      const nextUser: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        uid: `demo-${Date.now()}`,
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        mobile: payload.mobile.trim(),
        age: payload.age,
        gender: payload.gender || 'Prefer not to say',
        fitnessGoal: payload.age < 18 ? 'General Fitness' : 'General Fitness',
        onboardingComplete: false,
        role: 'member',
        authMode: 'demo',
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      setUser(nextUser);
      setIsAuthenticated(true);
      setDemoMembers((prev) => [
        {
          uid: nextUser.uid,
          fullName: nextUser.fullName,
          email: nextUser.email,
          age: nextUser.age,
          heightCm: nextUser.heightCm,
          currentWeightKg: nextUser.currentWeightKg,
          fitnessGoal: nextUser.fitnessGoal,
          dietaryPreference: nextUser.dietaryPreference,
          experience: nextUser.experience,
          branchCity: nextUser.branchCity,
          membershipPlan: nextUser.membershipPlan,
          progressCount: progressRecords.length,
        },
        ...prev.filter((m) => m.email !== nextUser.email),
      ]);
      addToast('success', 'Demo account created! Complete your fitness profile.');
    },
    [addToast, progressRecords.length]
  );

  const logout = useCallback(async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch {
      // ignore firebase signout error in demo mode
    }
    idTokenRef.current = null;
    setIsAuthenticated(false);
    addToast('info', 'You have been logged out.');
  }, [addToast]);

  const switchDemoRole = useCallback(
    (role: UserRole) => {
      setUser((prev) => ({ ...prev, role }));
      setIsAuthenticated(true);
      addToast('info', role === 'admin' ? 'Switched to Trainer / Admin View (Demo)' : 'Switched to Member View');
    },
    [addToast]
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      setContextLanguage(lang);
      setUser((prev) => ({ ...prev, language: lang }));
    },
    [setContextLanguage]
  );

  const toggleTheme = useCallback(() => {
    setUser((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      setUser((prev) => {
        const nextAge = patch.age ?? prev.age;
        const nextGoal = getEffectiveGoal(patch.fitnessGoal ?? prev.fitnessGoal, nextAge);
        const updated: UserProfile = {
          ...prev,
          ...patch,
          age: nextAge,
          fitnessGoal: nextGoal,
          targetWeightKg: nextAge < 18 ? (patch.currentWeightKg ?? prev.currentWeightKg) : (patch.targetWeightKg ?? prev.targetWeightKg),
        };
        setDemoMembers((members) =>
          members.map((m) =>
            m.uid === updated.uid
              ? {
                  ...m,
                  fullName: updated.fullName,
                  age: updated.age,
                  heightCm: updated.heightCm,
                  currentWeightKg: updated.currentWeightKg,
                  fitnessGoal: updated.fitnessGoal,
                  dietaryPreference: updated.dietaryPreference,
                  experience: updated.experience,
                  branchCity: updated.branchCity,
                  membershipPlan: updated.membershipPlan,
                }
              : m
          )
        );
        return updated;
      });

      if (idTokenRef.current) {
        try {
          await apiFetch(
            API_CONFIG.endpoints.profile,
            { method: 'PUT', body: JSON.stringify(patch) },
            idTokenRef.current
          );
        } catch (err) {
          console.error('Cloud SQL profile sync error:', err);
        }
      }
    },
    []
  );

  const addProgress = useCallback(
    async (entry: Omit<ProgressRecord, 'id'>) => {
      let id = `pr-${Date.now()}`;
      if (idTokenRef.current) {
        try {
          const saved = await apiFetch<{ id: number }>(
            API_CONFIG.endpoints.progress,
            { method: 'POST', body: JSON.stringify(entry) },
            idTokenRef.current
          );
          if (saved?.id) id = String(saved.id);
        } catch (err) {
          console.error('Cloud SQL progress save error:', err);
        }
      }
      const next: ProgressRecord = { ...entry, id };
      setProgressRecords((prev) => [next, ...prev]);
      if (entry.weightKg !== null && Number.isFinite(entry.weightKg)) {
        setUser((prev) => ({ ...prev, currentWeightKg: entry.weightKg! }));
      }
      addToast('success', 'Progress record saved.');
    },
    [addToast]
  );

  const updateProgress = useCallback(
    async (id: string, entry: Omit<ProgressRecord, 'id'>) => {
      setProgressRecords((prev) => prev.map((r) => (r.id === id ? { ...entry, id } : r)));
      if (idTokenRef.current && /^\d+$/.test(id)) {
        try {
          await apiFetch(
            `${API_CONFIG.endpoints.progress}/${id}`,
            { method: 'PUT', body: JSON.stringify(entry) },
            idTokenRef.current
          );
        } catch (err) {
          console.error('Cloud SQL progress update error:', err);
        }
      }
      addToast('success', 'Progress record updated.');
    },
    [addToast]
  );

  const deleteProgress = useCallback(
    async (id: string) => {
      setProgressRecords((prev) => prev.filter((r) => r.id !== id));
      if (idTokenRef.current && /^\d+$/.test(id)) {
        try {
          await apiFetch(
            `${API_CONFIG.endpoints.progress}/${id}`,
            { method: 'DELETE' },
            idTokenRef.current
          );
        } catch (err) {
          console.error('Cloud SQL progress delete error:', err);
        }
      }
      addToast('info', 'Progress record removed.');
    },
    [addToast]
  );

  const toggleActivity = useCallback(
    async (dateStr: string, itemType: 'meal' | 'workout' | 'daily', itemId: string) => {
      const key = `${dateStr}:${itemType}:${itemId}`;
      let nextState = true;
      setActivityMap((prev) => {
        nextState = !prev[key];
        return { ...prev, [key]: nextState };
      });
      if (idTokenRef.current) {
        try {
          await apiFetch(
            API_CONFIG.endpoints.activity,
            {
              method: 'POST',
              body: JSON.stringify({ logDate: dateStr, itemType, itemId, completed: nextState }),
            },
            idTokenRef.current
          );
        } catch (err) {
          console.error('Cloud SQL activity sync error:', err);
        }
      }
    },
    []
  );

  const recordPayment = useCallback(
    async (entry: Omit<PaymentRecord, 'id' | 'status' | 'paidAt'>): Promise<PaymentRecord> => {
      const paidAt = new Date().toISOString().slice(0, 10);
      let id = `pay-${Date.now()}`;
      if (idTokenRef.current) {
        try {
          const saved = await apiFetch<{ id: number }>(
            API_CONFIG.endpoints.payments,
            { method: 'POST', body: JSON.stringify(entry) },
            idTokenRef.current
          );
          if (saved?.id) id = String(saved.id);
        } catch (err) {
          console.error('Cloud SQL payment sync error:', err);
        }
      }
      const record: PaymentRecord = {
        ...entry,
        id,
        status: 'Paid',
        paidAt,
      };
      setPayments((prev) => [record, ...prev]);
      setUser((prev) => ({ ...prev, membershipPlan: entry.planName }));
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: `Membership Activated: ${entry.planName}`,
          titleHi: `मेंबरशिप सक्रिय: ${entry.planName}`,
          message: `Receipt ${entry.invoiceNumber} for ₹${entry.totalInr.toLocaleString('en-IN')} (${entry.paymentMethod}).`,
          messageHi: `रसीद ${entry.invoiceNumber} — ₹${entry.totalInr.toLocaleString('en-IN')} (${entry.paymentMethod})।`,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);
      addToast('success', `Payment confirmed! Invoice ${entry.invoiceNumber} generated.`);
      return record;
    },
    [addToast]
  );

  const addDietTemplate = useCallback(
    async (item: Omit<DietTemplate, 'id'>) => {
      const id = `d-custom-${Date.now()}`;
      setDietTemplates((prev) => [{ ...item, id }, ...prev]);
      if (idTokenRef.current) {
        try {
          await apiFetch(
            API_CONFIG.endpoints.dietTemplates,
            {
              method: 'POST',
              body: JSON.stringify({ ...item, foodItems: item.foodItems.join(', ') }),
            },
            idTokenRef.current
          );
        } catch {
          // keep local state synced
        }
      }
      addToast('success', `Diet template "${item.title}" added.`);
    },
    [addToast]
  );

  const updateDietTemplate = useCallback(
    async (id: string, item: Omit<DietTemplate, 'id'>) => {
      setDietTemplates((prev) => prev.map((d) => (d.id === id ? { ...item, id } : d)));
      addToast('success', `Diet template "${item.title}" updated.`);
    },
    [addToast]
  );

  const deleteDietTemplate = useCallback(
    async (id: string) => {
      setDietTemplates((prev) => prev.filter((d) => d.id !== id));
      addToast('info', 'Diet template deleted.');
    },
    [addToast]
  );

  const addWorkoutTemplate = useCallback(
    async (item: Omit<WorkoutTemplate, 'id'>) => {
      const id = `w-custom-${Date.now()}`;
      setWorkoutTemplates((prev) => [{ ...item, id }, ...prev]);
      if (idTokenRef.current) {
        try {
          await apiFetch(
            API_CONFIG.endpoints.workoutTemplates,
            { method: 'POST', body: JSON.stringify(item) },
            idTokenRef.current
          );
        } catch {
          // keep local state synced
        }
      }
      addToast('success', `Workout template "${item.title}" added.`);
    },
    [addToast]
  );

  const updateWorkoutTemplate = useCallback(
    async (id: string, item: Omit<WorkoutTemplate, 'id'>) => {
      setWorkoutTemplates((prev) => prev.map((w) => (w.id === id ? { ...item, id } : w)));
      addToast('success', `Workout template "${item.title}" updated.`);
    },
    [addToast]
  );

  const deleteWorkoutTemplate = useCallback(
    async (id: string) => {
      setWorkoutTemplates((prev) => prev.filter((w) => w.id !== id));
      addToast('info', 'Workout template deleted.');
    },
    [addToast]
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const resetDemoData = useCallback(() => {
    storageService.resetAllDemoData();
    setUser(DEFAULT_USER_PROFILE);
    setProgressRecords(INITIAL_PROGRESS_RECORDS);
    setDietTemplates(INITIAL_DIET_TEMPLATES);
    setWorkoutTemplates(INITIAL_WORKOUT_TEMPLATES);
    setActivityMap(INITIAL_ACTIVITY_MAP);
    setPayments(INITIAL_PAYMENT_RECORDS);
    setDemoMembers(INITIAL_DEMO_MEMBERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    addToast('info', 'Demo data restored to default Indian sample dataset.');
  }, [addToast]);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      isAuthenticated,
      authLoading,
      progressRecords,
      dietTemplates,
      workoutTemplates,
      activityMap,
      payments,
      demoMembers,
      notifications,
      language,
      theme: user.theme,
      toasts,
      addToast,
      dismissToast,
      setLanguage,
      toggleTheme,
      signInWithGoogle,
      demoLogin,
      demoRegister,
      logout,
      switchDemoRole,
      updateProfile,
      addProgress,
      updateProgress,
      deleteProgress,
      toggleActivity,
      recordPayment,
      addDietTemplate,
      updateDietTemplate,
      deleteDietTemplate,
      addWorkoutTemplate,
      updateWorkoutTemplate,
      deleteWorkoutTemplate,
      markAllNotificationsRead,
      resetDemoData,
    }),
    [
      user,
      isAuthenticated,
      authLoading,
      progressRecords,
      dietTemplates,
      workoutTemplates,
      activityMap,
      payments,
      demoMembers,
      notifications,
      language,
      toasts,
      addToast,
      dismissToast,
      setLanguage,
      toggleTheme,
      signInWithGoogle,
      demoLogin,
      demoRegister,
      logout,
      switchDemoRole,
      updateProfile,
      addProgress,
      updateProgress,
      deleteProgress,
      toggleActivity,
      recordPayment,
      addDietTemplate,
      updateDietTemplate,
      deleteDietTemplate,
      addWorkoutTemplate,
      updateWorkoutTemplate,
      deleteWorkoutTemplate,
      markAllNotificationsRead,
      resetDemoData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
