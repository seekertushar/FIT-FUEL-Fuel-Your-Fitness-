import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Info, CalendarCheck } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { DAYS_OF_WEEK, getTodayDayOfWeek } from '../services/dietService';
import { filterWorkoutTemplates, isRestDay, WORKOUT_CATEGORIES } from '../services/workoutService';
import { DayOfWeek, ExperienceLevel, WorkoutCategory } from '../types/fitfuel';
import { ASSETS } from '../data/sampleData';

export const WorkoutPlanPage: React.FC = () => {
  const { workoutTemplates, activityMap, toggleActivity } = useApp();
  const { language, t, tx, localize, dayShort } = useLanguage();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExperienceLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayDay = getTodayDayOfWeek();

  const filteredWorkouts = useMemo(
    () =>
      filterWorkoutTemplates({
        templates: workoutTemplates,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        day: selectedDay,
        searchQuery,
      }),
    [workoutTemplates, selectedCategory, selectedDifficulty, selectedDay, searchQuery]
  );

  const completedHistory = useMemo(
    () =>
      workoutTemplates.filter((w) =>
        Object.entries(activityMap).some(([k, v]) => v && k.endsWith(`:workout:${w.id}`))
      ),
    [workoutTemplates, activityMap]
  );

  const getWorkoutImage = (type: 'strength' | 'mobility' | 'gym') => {
    if (type === 'mobility') return ASSETS.mobilityWorkout;
    if (type === 'gym') return ASSETS.heroGym;
    return ASSETS.strengthWorkout;
  };

  return (
    <DashboardLayout
      title={t('sidebarWorkouts')}
      subtitle={tx(
        'Structured weekly workout templates across 6 categories and 3 levels, with Sunday recovery and completion tracking.',
        'सोमवार से रविवार तक 6 श्रेणियों और 3 कठिनाई स्तरों में सुरक्षित नियम-आधारित व्यायाम कार्यक्रम।'
      )}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* Weekly Schedule Strip */}
      <div className="mb-6 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-bold flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B]" />
            <span>{tx('Weekly Schedule (Mon–Sun)', 'साप्ताहिक वर्कआउट शेड्यूल (सोम–रवि)')}</span>
          </h2>
          <button
            type="button"
            onClick={() => setSelectedDay('All')}
            className={`text-xs font-semibold hover:underline ${
              selectedDay === 'All' ? 'text-[#15803D] dark:text-[#B6F23B]' : 'text-[#5B655D]'
            }`}
          >
            {tx('View All 7 Days', 'सभी 7 दिन देखें')}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const rest = isRestDay(day);
            const active = selectedDay === day;
            const count = workoutTemplates.filter((w) => w.dayOfWeek === day).length;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(active ? 'All' : day)}
                className={`rounded-xl p-3 text-left border transition-colors ${
                  active
                    ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] border-transparent'
                    : 'bg-[#F7F9F5] dark:bg-[#0E1113] border-[#E2E8DF] dark:border-[#262F35] hover:border-[#15191C]/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{dayShort(day)}</span>
                  {day === todayDay && (
                    <span className="text-[10px] underline">{t('today')}</span>
                  )}
                </div>
                <p
                  className={`mt-1 text-[11px] ${
                    active ? 'opacity-80' : 'text-[#5B655D] dark:text-[#9BA59D]'
                  }`}
                >
                  {rest
                    ? localize('Active Rest')
                    : tx(`${count} template${count === 1 ? '' : 's'}`, `${count} सत्र`)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category & Difficulty Filters */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]'
                : 'bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] text-[#5B655D] dark:text-[#C5CEC7]'
            }`}
          >
            {tx('All Categories', 'सभी श्रेणियाँ')}
          </button>
          {WORKOUT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]'
                  : 'bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] text-[#5B655D] dark:text-[#C5CEC7]'
              }`}
            >
              {localize(cat)}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] self-start">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedDifficulty(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedDifficulty === lvl
                  ? 'bg-[#B6F23B] text-[#15191C]'
                  : 'text-[#5B655D] dark:text-[#9BA59D]'
              }`}
            >
              {localize(lvl)}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards */}
      {filteredWorkouts.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-10 text-center">
          <p className="font-display font-bold">
            {tx('No workouts match these filters', 'इन फ़िल्टर से कोई वर्कआउट मेल नहीं खाता')}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setSelectedDay('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#B6F23B] text-[#15191C] text-xs font-bold"
          >
            {tx('Reset Filters', 'फ़िल्टर रीसेट करें')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkouts.map((w) => {
            const done = Boolean(activityMap[`${todayIso}:workout:${w.id}`]);
            return (
              <article
                key={w.id}
                className={`rounded-2xl bg-white dark:bg-[#161B1E] border overflow-hidden flex flex-col justify-between ${
                  done
                    ? 'border-[#15803D] dark:border-[#B6F23B]'
                    : 'border-[#E2E8DF] dark:border-[#262F35]'
                }`}
              >
                <div>
                  <div className="h-40 w-full bg-[#15191C] overflow-hidden">
                    <img
                      src={getWorkoutImage(w.imageType)}
                      alt={w.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                      {localize(w.dayOfWeek)} · {localize(w.category)} ·{' '}
                      <span className="font-semibold text-[#15803D] dark:text-[#B6F23B]">
                        {localize(w.difficulty)}
                      </span>
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#15191C] dark:text-[#F3F6F2]">
                      {language === 'hi' && w.titleHi ? w.titleHi : w.title}
                    </h3>
                    <p className="mt-1 text-xs font-mono text-[#15191C] dark:text-[#C5CEC7]">
                      {w.durationOrReps}
                    </p>
                    <p className="mt-2 text-xs text-[#5B655D] dark:text-[#9BA59D]">
                      {tx('Target:', 'लक्ष्य मांसपेशी:')}{' '}
                      <span className="font-medium text-[#202820] dark:text-[#E2E8DF]">{w.targetMuscle}</span>
                    </p>
                    <p className="mt-2.5 text-xs leading-relaxed text-[#5B655D] dark:text-[#9BA59D]">
                      {w.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    type="button"
                    onClick={() => toggleActivity(todayIso, 'workout', w.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                      done
                        ? 'bg-[#B6F23B] text-[#15191C]'
                        : 'bg-[#15191C] dark:bg-[#0E1113] text-white border border-transparent dark:border-[#262F35] hover:opacity-90'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    <span>{done ? t('completed') : t('markCompleted')}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Workout History + Safety Note */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <h3 className="font-display text-base font-bold">
            {tx('Completed Workout History', 'पूर्ण किए गए वर्कआउट')}
          </h3>
          {completedHistory.length === 0 ? (
            <p className="mt-2 text-xs text-[#5B655D] dark:text-[#9BA59D]">
              {tx(
                'Mark any exercise template above as completed to build your training log.',
                'अपना प्रशिक्षण लॉग बनाने के लिए ऊपर किसी भी व्यायाम को पूर्ण चिह्नित करें।'
              )}
            </p>
          ) : (
            <div className="mt-3 divide-y divide-[#E2E8DF] dark:divide-[#262F35]">
              {completedHistory.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#15191C] dark:text-[#F3F6F2]">
                      {language === 'hi' && item.titleHi ? item.titleHi : item.title}
                    </p>
                    <p className="text-[#5B655D] dark:text-[#9BA59D]">
                      {localize(item.dayOfWeek)} · {localize(item.category)} · {localize(item.difficulty)}
                    </p>
                  </div>
                  <span className="font-semibold text-[#15803D] dark:text-[#B6F23B]">{t('done')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <h3 className="font-display text-base font-bold flex items-center gap-2">
            <Info className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B]" />
            <span>{tx('Safe Movement Reminder', 'सुरक्षित व्यायाम अनुस्मारक')}</span>
          </h3>
          <p className="mt-2.5 text-xs leading-relaxed text-[#5B655D] dark:text-[#9BA59D]">
            {tx(
              'Warm up for 5–8 minutes before lifting and adjust weights, pace, or range of motion to match your current comfort and ability. Stop immediately if you experience sharp joint pain or dizziness, and seek guidance from a certified trainer or healthcare professional.',
              'व्यायाम से पहले 5–8 मिनट वार्म-अप करें और अपनी क्षमता के अनुसार वज़न व गति चुनें। जोड़ों में तेज़ दर्द या चक्कर आने पर तुरंत रुकें और प्रमाणित ट्रेनर या चिकित्सक से सलाह लें।'
            )}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
