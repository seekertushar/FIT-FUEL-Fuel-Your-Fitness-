import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, RotateCcw, ShieldAlert } from 'lucide-react';
import { AdminLayout, AdminTab } from '../components/AdminLayout';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { evaluateBmi } from '../services/bmiService';
import { DAYS_OF_WEEK, MEAL_SLOTS } from '../services/dietService';
import { WORKOUT_CATEGORIES } from '../services/workoutService';
import {
  DayOfWeek,
  DietaryPreference,
  DietTemplate,
  ExperienceLevel,
  FitnessGoal,
  MealSlot,
  WorkoutCategory,
  WorkoutTemplate,
} from '../types/fitfuel';

export const AdminDashboardPage: React.FC = () => {
  const {
    demoMembers,
    dietTemplates,
    workoutTemplates,
    progressRecords,
    addDietTemplate,
    updateDietTemplate,
    deleteDietTemplate,
    addWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    resetDemoData,
  } = useApp();
  const { language, t, tx, localize } = useLanguage();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [dietSearch, setDietSearch] = useState('');
  const [dietTypeFilter, setDietTypeFilter] = useState<DietaryPreference | 'All'>('All');
  const [workoutSearch, setWorkoutSearch] = useState('');
  const [workoutDiffFilter, setWorkoutDiffFilter] = useState<ExperienceLevel | 'All'>('All');
  const [memberSearch, setMemberSearch] = useState('');

  // Diet Form State
  const [editingDietId, setEditingDietId] = useState<string | null>(null);
  const [dietForm, setDietForm] = useState({
    title: '',
    titleHi: '',
    mealSlot: 'Breakfast' as MealSlot,
    suggestedTime: '08:00 AM',
    dietType: 'Vegetarian' as DietaryPreference,
    goalTag: 'General Fitness' as FitnessGoal,
    foodItems: '',
    description: '',
    caloriesApprox: '360',
    proteinGrams: '16',
    dayOfWeek: 'Monday' as DayOfWeek,
  });
  const [dietError, setDietError] = useState('');

  // Workout Form State
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [workoutForm, setWorkoutForm] = useState({
    title: '',
    titleHi: '',
    category: 'Full Body Workout' as WorkoutCategory,
    difficulty: 'Beginner' as ExperienceLevel,
    targetMuscle: '',
    durationOrReps: '',
    description: '',
    dayOfWeek: 'Monday' as DayOfWeek,
    goalTag: 'General Fitness' as FitnessGoal,
    imageType: 'strength' as 'strength' | 'mobility' | 'gym',
  });
  const [workoutError, setWorkoutError] = useState('');

  // Confirmation dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    kind: 'diet' | 'workout' | 'reset';
    id?: string;
    label: string;
  } | null>(null);

  const filteredDiets = useMemo(() => {
    const q = dietSearch.trim().toLowerCase();
    return dietTemplates.filter((d) => {
      const typeOk = dietTypeFilter === 'All' || d.dietType === dietTypeFilter;
      const qOk =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.titleHi.toLowerCase().includes(q) ||
        d.dayOfWeek.toLowerCase().includes(q) ||
        d.foodItems.some((i) => i.toLowerCase().includes(q));
      return typeOk && qOk;
    });
  }, [dietTemplates, dietSearch, dietTypeFilter]);

  const filteredWorkouts = useMemo(() => {
    const q = workoutSearch.trim().toLowerCase();
    return workoutTemplates.filter((w) => {
      const diffOk = workoutDiffFilter === 'All' || w.difficulty === workoutDiffFilter;
      const qOk =
        !q ||
        w.title.toLowerCase().includes(q) ||
        w.titleHi.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.targetMuscle.toLowerCase().includes(q);
      return diffOk && qOk;
    });
  }, [workoutTemplates, workoutSearch, workoutDiffFilter]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return demoMembers.filter(
      (m) =>
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.branchCity.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [demoMembers, memberSearch]);

  const handleSaveDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    setDietError('');
    if (!dietForm.title.trim() || !dietForm.foodItems.trim() || !dietForm.description.trim()) {
      setDietError(
        tx(
          'Please enter meal title, food items (comma-separated), and description.',
          'कृपया भोजन का नाम, खाद्य सामग्री (कॉमा से अलग) और विवरण दर्ज करें।'
        )
      );
      return;
    }
    const payload: Omit<DietTemplate, 'id'> = {
      title: dietForm.title.trim(),
      titleHi: dietForm.titleHi.trim() || dietForm.title.trim(),
      mealSlot: dietForm.mealSlot,
      suggestedTime: dietForm.suggestedTime.trim() || '08:00 AM',
      dietType: dietForm.dietType,
      goalTag: dietForm.goalTag,
      foodItems: dietForm.foodItems
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      description: dietForm.description.trim(),
      caloriesApprox: Number(dietForm.caloriesApprox) || 350,
      proteinGrams: Number(dietForm.proteinGrams) || 15,
      dayOfWeek: dietForm.dayOfWeek,
    };

    if (editingDietId) {
      await updateDietTemplate(editingDietId, payload);
    } else {
      await addDietTemplate(payload);
    }
    setEditingDietId(null);
    setDietForm({
      title: '',
      titleHi: '',
      mealSlot: 'Breakfast',
      suggestedTime: '08:00 AM',
      dietType: 'Vegetarian',
      goalTag: 'General Fitness',
      foodItems: '',
      description: '',
      caloriesApprox: '360',
      proteinGrams: '16',
      dayOfWeek: 'Monday',
    });
  };

  const startEditDiet = (item: DietTemplate) => {
    setEditingDietId(item.id);
    setDietForm({
      title: item.title,
      titleHi: item.titleHi,
      mealSlot: item.mealSlot,
      suggestedTime: item.suggestedTime,
      dietType: item.dietType,
      goalTag: item.goalTag,
      foodItems: item.foodItems.join(', '),
      description: item.description,
      caloriesApprox: String(item.caloriesApprox),
      proteinGrams: String(item.proteinGrams),
      dayOfWeek: item.dayOfWeek,
    });
    setTab('diets');
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkoutError('');
    if (
      !workoutForm.title.trim() ||
      !workoutForm.targetMuscle.trim() ||
      !workoutForm.durationOrReps.trim() ||
      !workoutForm.description.trim()
    ) {
      setWorkoutError(
        tx(
          'Please complete exercise title, target muscle, duration/reps, and description.',
          'कृपया व्यायाम का नाम, लक्षित मांसपेशी, अवधि/रेप्स और विवरण भरें।'
        )
      );
      return;
    }
    const payload: Omit<WorkoutTemplate, 'id'> = {
      title: workoutForm.title.trim(),
      titleHi: workoutForm.titleHi.trim() || workoutForm.title.trim(),
      category: workoutForm.category,
      difficulty: workoutForm.difficulty,
      targetMuscle: workoutForm.targetMuscle.trim(),
      durationOrReps: workoutForm.durationOrReps.trim(),
      description: workoutForm.description.trim(),
      dayOfWeek: workoutForm.dayOfWeek,
      goalTag: workoutForm.goalTag,
      imageType: workoutForm.imageType,
    };

    if (editingWorkoutId) {
      await updateWorkoutTemplate(editingWorkoutId, payload);
    } else {
      await addWorkoutTemplate(payload);
    }
    setEditingWorkoutId(null);
    setWorkoutForm({
      title: '',
      titleHi: '',
      category: 'Full Body Workout',
      difficulty: 'Beginner',
      targetMuscle: '',
      durationOrReps: '',
      description: '',
      dayOfWeek: 'Monday',
      goalTag: 'General Fitness',
      imageType: 'strength',
    });
  };

  const startEditWorkout = (item: WorkoutTemplate) => {
    setEditingWorkoutId(item.id);
    setWorkoutForm({
      title: item.title,
      titleHi: item.titleHi,
      category: item.category,
      difficulty: item.difficulty,
      targetMuscle: item.targetMuscle,
      durationOrReps: item.durationOrReps,
      description: item.description,
      dayOfWeek: item.dayOfWeek,
      goalTag: item.goalTag,
      imageType: item.imageType,
    });
    setTab('workouts');
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog) return;
    if (deleteDialog.kind === 'diet' && deleteDialog.id) {
      await deleteDietTemplate(deleteDialog.id);
    } else if (deleteDialog.kind === 'workout' && deleteDialog.id) {
      await deleteWorkoutTemplate(deleteDialog.id);
    } else if (deleteDialog.kind === 'reset') {
      resetDemoData();
    }
    setDeleteDialog(null);
  };

  return (
    <AdminLayout activeTab={tab} onSelectTab={setTab}>
      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {tx('Total Demo Members', 'कुल डेमो सदस्य')}
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums">{demoMembers.length}</p>
          <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">
            {tx('Across 5 Indian cities', '5 भारतीय शहरों में')}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {tx('Diet Templates', 'डाइट टेम्पलेट्स')}
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums">{dietTemplates.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            {tx('Veg · Non-Veg · Vegan', 'शाकाहारी · मांसाहारी · वीगन')}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {tx('Workout Templates', 'वर्कआउट टेम्पलेट्स')}
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums">{workoutTemplates.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            {tx('6 Categories · 3 Levels', '6 श्रेणियाँ · 3 स्तर')}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('progressRecords')}
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums">{progressRecords.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            {tx('Active member check-ins', 'सक्रिय सदस्य चेक-इन')}
          </p>
        </div>
      </div>

      {/* TAB: OVERVIEW */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-display text-lg font-bold">
              {tx('Trainer Quick Actions', 'ट्रेनर त्वरित कार्य')}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {tx(
                'Changes made here immediately update the Member Diet Plans and Workout Planner.',
                'यहाँ किए गए बदलाव तुरंत सदस्य डाइट प्लान और वर्कआउट प्लानर में दिखाई देते हैं।'
              )}
            </p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTab('diets')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left hover:border-sky-400"
              >
                <p className="font-display font-bold text-sm">{tx('Manage Diets', 'डाइट प्रबंधन')}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {tx('Add or edit Indian meals', 'भारतीय भोजन जोड़ें या संपादित करें')}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setTab('workouts')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left hover:border-sky-400"
              >
                <p className="font-display font-bold text-sm">{tx('Manage Workouts', 'वर्कआउट प्रबंधन')}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {tx('Update weekly routines', 'साप्ताहिक रूटीन अपडेट करें')}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setTab('members')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left hover:border-sky-400"
              >
                <p className="font-display font-bold text-sm">{tx('Member Reports', 'सदस्य रिपोर्ट')}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {tx('Inspect Indian branch roster', 'भारतीय शाखा सूची देखें')}
                </p>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-sky-500" />
              <span>{tx('Demo Role Architecture Notice', 'डेमो भूमिका आर्किटेक्चर सूचना')}</span>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {tx(
                'This Admin/Trainer console uses a client-side demo role toggle for academic demonstration. In production deployments, role claims are enforced strictly on the Express backend via verified Firebase Admin ID tokens and PostgreSQL authorization checks.',
                'यह एडमिन/ट्रेनर कंसोल शैक्षणिक प्रदर्शन के लिए क्लाइंट-साइड डेमो रोल टॉगल का उपयोग करता है। प्रोडक्शन में रोल अनुमतियाँ सत्यापित Firebase ID टोकन और PostgreSQL जाँच द्वारा सर्वर पर लागू की जाती हैं।'
              )}
            </p>
          </div>
        </div>
      )}

      {/* TAB: MANAGE DIET TEMPLATES */}
      {tab === 'diets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-display text-lg font-bold">
              {editingDietId
                ? tx('Edit Diet Template', 'डाइट टेम्पलेट संपादित करें')
                : tx('Add Diet Template', 'नया डाइट टेम्पलेट जोड़ें')}
            </h2>
            {dietError && (
              <div className="mt-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300">
                {dietError}
              </div>
            )}
            <form onSubmit={handleSaveDiet} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="ad-title" className="block text-xs font-semibold mb-1">
                  {tx('Meal Name *', 'भोजन का नाम *')}
                </label>
                <input
                  id="ad-title"
                  type="text"
                  value={dietForm.title}
                  onChange={(e) => setDietForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={tx('e.g., Besan Chilla with Mint Chutney', 'जैसे पुदीना चटनी के साथ बेसन चीला')}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ad-day" className="block text-xs font-semibold mb-1">
                    {tx('Day', 'दिन')}
                  </label>
                  <select
                    id="ad-day"
                    value={dietForm.dayOfWeek}
                    onChange={(e) => setDietForm((f) => ({ ...f, dayOfWeek: e.target.value as DayOfWeek }))}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>{localize(d)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ad-slot" className="block text-xs font-semibold mb-1">
                    {tx('Meal Slot', 'भोजन समय')}
                  </label>
                  <select
                    id="ad-slot"
                    value={dietForm.mealSlot}
                    onChange={(e) => setDietForm((f) => ({ ...f, mealSlot: e.target.value as MealSlot }))}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                  >
                    {MEAL_SLOTS.map((s) => (
                      <option key={s} value={s}>{localize(s)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ad-type" className="block text-xs font-semibold mb-1">
                    {tx('Diet Type', 'आहार प्रकार')}
                  </label>
                  <select
                    id="ad-type"
                    value={dietForm.dietType}
                    onChange={(e) =>
                      setDietForm((f) => ({ ...f, dietType: e.target.value as DietaryPreference }))
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                  >
                    <option value="Vegetarian">{localize('Vegetarian')}</option>
                    <option value="Non-Vegetarian">{localize('Non-Vegetarian')}</option>
                    <option value="Vegan">{localize('Vegan')}</option>
                    <option value="Balanced">{localize('Balanced')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ad-time" className="block text-xs font-semibold mb-1">
                    {tx('Suggested Time', 'सुझाया गया समय')}
                  </label>
                  <input
                    id="ad-time"
                    type="text"
                    value={dietForm.suggestedTime}
                    onChange={(e) => setDietForm((f) => ({ ...f, suggestedTime: e.target.value }))}
                    placeholder="08:00 AM"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="ad-items" className="block text-xs font-semibold mb-1">
                  {tx('Food Items (comma-separated) *', 'खाद्य सामग्री (कॉमा से अलग) *')}
                </label>
                <input
                  id="ad-items"
                  type="text"
                  value={dietForm.foodItems}
                  onChange={(e) => setDietForm((f) => ({ ...f, foodItems: e.target.value }))}
                  placeholder={tx('2 besan chillas, mint chutney, cucumber slices', '2 बेसन चीला, पुदीना चटनी, खीरा')}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="ad-desc" className="block text-xs font-semibold mb-1">
                  {tx('Description *', 'विवरण *')}
                </label>
                <textarea
                  id="ad-desc"
                  rows={2}
                  value={dietForm.description}
                  onChange={(e) => setDietForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={tx('Balanced plant protein Indian breakfast.', 'संतुलित वनस्पति प्रोटीन भारतीय नाश्ता।')}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#38BDF8] text-[#0F172A] text-sm font-bold hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingDietId
                      ? tx('Update Template', 'टेम्पलेट अपडेट करें')
                      : tx('Add Diet Template', 'डाइट टेम्पलेट जोड़ें')}
                  </span>
                </button>
                {editingDietId && (
                  <button
                    type="button"
                    onClick={() => setEditingDietId(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    {t('cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={dietSearch}
                  onChange={(e) => setDietSearch(e.target.value)}
                  placeholder={tx('Search diet templates...', 'डाइट टेम्पलेट खोजें...')}
                  aria-label={tx('Search diet templates', 'डाइट टेम्पलेट खोजें')}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <select
                aria-label={tx('Filter diets by type', 'आहार प्रकार से फ़िल्टर करें')}
                value={dietTypeFilter}
                onChange={(e) => setDietTypeFilter(e.target.value as DietaryPreference | 'All')}
                className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs"
              >
                <option value="All">{tx('All Diet Types', 'सभी आहार प्रकार')}</option>
                <option value="Vegetarian">{localize('Vegetarian')}</option>
                <option value="Non-Vegetarian">{localize('Non-Vegetarian')}</option>
                <option value="Vegan">{localize('Vegan')}</option>
                <option value="Balanced">{localize('Balanced')}</option>
              </select>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[540px] overflow-y-auto">
              {filteredDiets.map((d) => {
                const displayTitle = language === 'hi' ? d.titleHi : d.title;
                return (
                  <div key={d.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {localize(d.dayOfWeek)} · {localize(d.mealSlot)} · {d.suggestedTime} · {localize(d.dietType)}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold">{displayTitle}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                        {d.foodItems.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditDiet(d)}
                        aria-label={`${t('editLabel')} ${displayTitle}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteDialog({ kind: 'diet', id: d.id, label: displayTitle })}
                        aria-label={`${t('deleteLabel')} ${displayTitle}`}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MANAGE WORKOUT TEMPLATES */}
      {tab === 'workouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-display text-lg font-bold">
              {editingWorkoutId
                ? tx('Edit Workout Template', 'वर्कआउट टेम्पलेट संपादित करें')
                : tx('Add Workout Template', 'नया वर्कआउट टेम्पलेट जोड़ें')}
            </h2>
            {workoutError && (
              <div className="mt-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300">
                {workoutError}
              </div>
            )}
            <form onSubmit={handleSaveWorkout} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="aw-title" className="block text-xs font-semibold mb-1">
                  {tx('Exercise Name *', 'व्यायाम का नाम *')}
                </label>
                <input
                  id="aw-title"
                  type="text"
                  value={workoutForm.title}
                  onChange={(e) => setWorkoutForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={tx('e.g., Dumbbell Step-Ups & Core Hold', 'जैसे डंबल स्टेप-अप्स और कोर होल्ड')}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="aw-cat" className="block text-xs font-semibold mb-1">
                    {tx('Category', 'श्रेणी')}
                  </label>
                  <select
                    id="aw-cat"
                    value={workoutForm.category}
                    onChange={(e) =>
                      setWorkoutForm((f) => ({ ...f, category: e.target.value as WorkoutCategory }))
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                  >
                    {WORKOUT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{localize(c)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="aw-diff" className="block text-xs font-semibold mb-1">
                    {tx('Difficulty', 'कठिनाई स्तर')}
                  </label>
                  <select
                    id="aw-diff"
                    value={workoutForm.difficulty}
                    onChange={(e) =>
                      setWorkoutForm((f) => ({ ...f, difficulty: e.target.value as ExperienceLevel }))
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                  >
                    <option value="Beginner">{localize('Beginner')}</option>
                    <option value="Intermediate">{localize('Intermediate')}</option>
                    <option value="Advanced">{localize('Advanced')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="aw-day" className="block text-xs font-semibold mb-1">
                    {tx('Day', 'दिन')}
                  </label>
                  <select
                    id="aw-day"
                    value={workoutForm.dayOfWeek}
                    onChange={(e) => setWorkoutForm((f) => ({ ...f, dayOfWeek: e.target.value as DayOfWeek }))}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>{localize(d)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="aw-dur" className="block text-xs font-semibold mb-1">
                    {tx('Duration / Reps *', 'अवधि / रेप्स *')}
                  </label>
                  <input
                    id="aw-dur"
                    type="text"
                    value={workoutForm.durationOrReps}
                    onChange={(e) => setWorkoutForm((f) => ({ ...f, durationOrReps: e.target.value }))}
                    placeholder={tx('3 sets × 12 reps · 25 mins', '3 सेट × 12 रेप्स · 25 मिनट')}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="aw-muscle" className="block text-xs font-semibold mb-1">
                  {tx('Target Muscle *', 'लक्षित मांसपेशी *')}
                </label>
                <input
                  id="aw-muscle"
                  type="text"
                  value={workoutForm.targetMuscle}
                  onChange={(e) => setWorkoutForm((f) => ({ ...f, targetMuscle: e.target.value }))}
                  placeholder={tx('Quads, Glutes & Core', 'क्वाड्स, ग्लूट्स और कोर')}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="aw-desc" className="block text-xs font-semibold mb-1">
                  {tx('Description *', 'विवरण *')}
                </label>
                <textarea
                  id="aw-desc"
                  rows={2}
                  value={workoutForm.description}
                  onChange={(e) => setWorkoutForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={tx('Controlled tempo focusing on posture and steady breathing.', 'सही मुद्रा और स्थिर श्वास पर ध्यान केंद्रित करें।')}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#38BDF8] text-[#0F172A] text-sm font-bold hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingWorkoutId
                      ? tx('Update Workout', 'वर्कआउट अपडेट करें')
                      : tx('Add Workout Template', 'वर्कआउट टेम्पलेट जोड़ें')}
                  </span>
                </button>
                {editingWorkoutId && (
                  <button
                    type="button"
                    onClick={() => setEditingWorkoutId(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    {t('cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={workoutSearch}
                  onChange={(e) => setWorkoutSearch(e.target.value)}
                  placeholder={tx('Search workout templates...', 'वर्कआउट टेम्पलेट खोजें...')}
                  aria-label={tx('Search workout templates', 'वर्कआउट टेम्पलेट खोजें')}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <select
                aria-label={tx('Filter workouts by difficulty', 'कठिनाई स्तर से फ़िल्टर करें')}
                value={workoutDiffFilter}
                onChange={(e) => setWorkoutDiffFilter(e.target.value as ExperienceLevel | 'All')}
                className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs"
              >
                <option value="All">{tx('All Levels', 'सभी स्तर')}</option>
                <option value="Beginner">{localize('Beginner')}</option>
                <option value="Intermediate">{localize('Intermediate')}</option>
                <option value="Advanced">{localize('Advanced')}</option>
              </select>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[540px] overflow-y-auto">
              {filteredWorkouts.map((w) => {
                const displayTitle = language === 'hi' ? w.titleHi : w.title;
                return (
                  <div key={w.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {localize(w.dayOfWeek)} · {localize(w.category)} · {localize(w.difficulty)}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold">{displayTitle}</p>
                      <p className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {w.durationOrReps} · {w.targetMuscle}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditWorkout(w)}
                        aria-label={`${t('editLabel')} ${displayTitle}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteDialog({ kind: 'workout', id: w.id, label: displayTitle })}
                        aria-label={`${t('deleteLabel')} ${displayTitle}`}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MEMBER REPORTS */}
      {tab === 'members' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">
              {tx('Indian Branch Member Reports', 'भारतीय शाखा सदस्य रिपोर्ट')}
            </h2>
            <div className="relative w-64 max-w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder={tx('Search member or city...', 'सदस्य या शहर खोजें...')}
                aria-label={tx('Search members', 'सदस्य खोजें')}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500">
                  <th className="py-3 px-4">{tx('Member', 'सदस्य')}</th>
                  <th className="py-3 px-4">{tx('Branch', 'शाखा')}</th>
                  <th className="py-3 px-4">{tx('Plan', 'प्लान')}</th>
                  <th className="py-3 px-4 text-right">{tx('Age', 'आयु')}</th>
                  <th className="py-3 px-4 text-right">{tx('BMI (Adults)', 'BMI (वयस्क)')}</th>
                  <th className="py-3 px-4">{tx('Goal & Diet', 'लक्ष्य व आहार')}</th>
                  <th className="py-3 px-4 text-right">{tx('Logs', 'लॉग्स')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredMembers.map((m) => {
                  const bmi = evaluateBmi(m.heightCm, m.currentWeightKg, m.age);
                  return (
                    <tr key={m.uid}>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold">{m.fullName}</p>
                        <p className="text-xs text-slate-500">{m.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs">{m.branchCity}</td>
                      <td className="py-3.5 px-4 text-xs font-medium">{m.membershipPlan}</td>
                      <td className="py-3.5 px-4 font-mono text-right tabular-nums">{m.age}</td>
                      <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                        {bmi.isMinor
                          ? tx('Youth (<18)', 'युवा (<18)')
                          : `${bmi.bmi?.toFixed(1)} · ${localize(bmi.category || '')}`}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {localize(m.age < 18 ? 'General Fitness' : m.fitnessGoal)} · {localize(m.dietaryPreference)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right tabular-nums">{m.progressCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS */}
      {tab === 'settings' && (
        <div className="max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold">
            {tx('Trainer Console Settings', 'ट्रेनर कंसोल सेटिंग्स')}
          </h2>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {tx(
              'Restore all sample Indian members, diet templates, workout templates, and progress records back to their initial demonstration state.',
              'सभी सैंपल भारतीय सदस्यों, डाइट टेम्पलेट्स, वर्कआउट टेम्पलेट्स और प्रगति रिकॉर्ड्स को उनकी प्रारंभिक डेमो स्थिति में बहाल करें।'
            )}
          </p>
          <button
            type="button"
            onClick={() =>
              setDeleteDialog({
                kind: 'reset',
                label: tx(
                  'all demo data to initial Indian sample records',
                  'सभी डेमो डेटा को प्रारंभिक भारतीय सैंपल रिकॉर्ड में'
                ),
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{tx('Reset Demo Dataset', 'डेमो डेटासेट रीसेट करें')}</span>
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteDialog)}
        title={
          deleteDialog?.kind === 'reset'
            ? tx('Reset Demo Dataset?', 'डेमो डेटासेट रीसेट करें?')
            : tx('Confirm Deletion', 'हटाने की पुष्टि करें')
        }
        description={
          deleteDialog?.kind === 'reset'
            ? tx(
                'Are you sure you want to restore all demo data to initial Indian sample records? This action updates the live application state.',
                'क्या आप वाकई सभी डेमो डेटा को प्रारंभिक भारतीय सैंपल रिकॉर्ड में बहाल करना चाहते हैं? इससे लाइव ऐप स्थिति अपडेट हो जाएगी।'
              )
            : tx(
                `Are you sure you want to delete ${deleteDialog?.label}? This action updates the live application state.`,
                `क्या आप वाकई "${deleteDialog?.label}" को हटाना चाहते हैं? इससे लाइव ऐप स्थिति अपडेट हो जाएगी।`
              )
        }
        confirmLabel={
          deleteDialog?.kind === 'reset' ? tx('Reset Data', 'डेटा रीसेट करें') : t('deleteLabel')
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </AdminLayout>
  );
};
