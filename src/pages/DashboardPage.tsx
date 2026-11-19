import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Calculator,
  Plus,
  Utensils,
  Dumbbell,
  CheckCircle2,
  Circle,
  Printer,
  ArrowRight,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { evaluateBmi } from '../services/bmiService';
import { filterDietTemplates, getTodayDayOfWeek } from '../services/dietService';
import { getSuggestedDailyWorkout, isRestDay } from '../services/workoutService';
import {
  calculateProfileCompletion,
  ChartRange,
  filterProgressByRange,
  getLatestWeight,
  sortProgressByDateDesc,
} from '../services/progressService';

export const DashboardPage: React.FC = () => {
  const {
    user,
    progressRecords,
    dietTemplates,
    workoutTemplates,
    activityMap,
    payments,
    toggleActivity,
  } = useApp();
  const { language, t, tx, localize } = useLanguage();

  const [chartRange, setChartRange] = useState<ChartRange>('monthly');

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayDay = getTodayDayOfWeek();

  const latestWeight = useMemo(
    () => getLatestWeight(progressRecords, user.currentWeightKg),
    [progressRecords, user.currentWeightKg]
  );

  const bmi = useMemo(
    () => evaluateBmi(user.heightCm, latestWeight, user.age),
    [user.heightCm, latestWeight, user.age]
  );

  const profileCompletion = useMemo(() => calculateProfileCompletion(user), [user]);

  const chartData = useMemo(() => {
    const filtered = filterProgressByRange(progressRecords, chartRange);
    return filtered.map((r) => ({
      date: r.recordDate.slice(5),
      fullDate: r.recordDate,
      weight: r.weightKg,
      waist: r.waistCm,
    }));
  }, [progressRecords, chartRange]);

  const todaysMeals = useMemo(
    () =>
      filterDietTemplates({
        templates: dietTemplates,
        day: todayDay,
        dietFilter: user.dietaryPreference,
      }).slice(0, 4),
    [dietTemplates, todayDay, user.dietaryPreference]
  );

  const todaysWorkouts = useMemo(
    () =>
      getSuggestedDailyWorkout(
        workoutTemplates,
        todayDay,
        user.experience,
        user.fitnessGoal,
        user.age
      ).slice(0, 3),
    [workoutTemplates, todayDay, user.experience, user.fitnessGoal, user.age]
  );

  const completedWorkoutCount = useMemo(
    () =>
      Object.entries(activityMap).filter(
        ([key, val]) => val && (key.includes(':workout:') || key.includes(':daily:'))
      ).length,
    [activityMap]
  );

  const dailyDone = Boolean(activityMap[`${todayIso}:daily:today`]);

  // Weekly activity calendar (last 7 days)
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().slice(0, 10);
      const shortDay = d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday: 'short',
      });
      const dateNum = d.getDate();
      const active =
        Boolean(activityMap[`${iso}:daily:today`]) ||
        Object.entries(activityMap).some(([k, v]) => v && k.startsWith(`${iso}:`));
      return { iso, shortDay, dateNum, active, isToday: iso === todayIso };
    });
  }, [activityMap, language, todayIso]);

  const timelineItems = useMemo(() => {
    const latest = sortProgressByDateDesc(progressRecords)[0];
    const lastPay = payments[0];
    return [
      {
        date: todayIso,
        title: dailyDone
          ? tx('Daily movement check-in completed', 'दैनिक गतिविधि चेक-इन पूर्ण')
          : tx('Ready for today’s fitness session', 'आज के फिटनेस सत्र के लिए तैयार'),
        detail: `${localize(todayDay)} · ${
          (language === 'hi' && todaysWorkouts[0]?.titleHi) ||
          todaysWorkouts[0]?.title ||
          tx('Active mobility walk', 'सक्रिय मोबिलिटी वॉक')
        }`,
      },
      latest
        ? {
            date: latest.recordDate,
            title: tx(
              `Progress check-in logged (${latest.weightKg ?? '—'} kg)`,
              `प्रगति चेक-इन दर्ज (${latest.weightKg ?? '—'} किग्रा)`
            ),
            detail: latest.notes || tx('Body measurement snapshot recorded.', 'शरीर के माप का रिकॉर्ड सहेजा गया।'),
          }
        : null,
      lastPay
        ? {
            date: lastPay.paidAt,
            title: tx(
              `${lastPay.planName} membership confirmed`,
              `${lastPay.planName} मेंबरशिप पुष्टि`
            ),
            detail: tx(
              `Invoice ${lastPay.invoiceNumber} · ₹${lastPay.totalInr.toLocaleString('en-IN')} via ${lastPay.paymentMethod}`,
              `चालान ${lastPay.invoiceNumber} · ₹${lastPay.totalInr.toLocaleString('en-IN')} (${lastPay.paymentMethod})`
            ),
          }
        : null,
      {
        date: user.joinedDate,
        title: tx(`Joined FIT FUEL (${user.branchCity})`, `FIT FUEL से जुड़े (${user.branchCity})`),
        detail: tx(
          `Profile initialized with ${user.dietaryPreference} meal templates.`,
          `प्रोफ़ाइल ${localize(user.dietaryPreference)} आहार टेम्पलेट्स के साथ सेटअप की गई।`
        ),
      },
    ].filter(Boolean) as Array<{ date: string; title: string; detail: string }>;
  }, [dailyDone, language, localize, payments, progressRecords, todayDay, todayIso, todaysWorkouts, tx, user]);

  return (
    <DashboardLayout
      title={`${t('welcomeBack')}, ${user.fullName.split(' ')[0]}`}
      subtitle={`${user.membershipPlan} · ${user.branchCity}`}
      headerAction={
        <div className="flex items-center gap-2.5 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E2E8DF] dark:border-[#262F35] bg-white dark:bg-[#161B1E] text-xs font-semibold hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A] whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printReport')}</span>
          </button>
          <Link
            to="/progress"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B6F23B] text-[#15191C] text-xs font-bold hover:bg-[#A4E028] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addRecord')}</span>
          </Link>
        </div>
      }
    >
      {/* Profile Completion Strip */}
      <div className="mb-6 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span>{t('profileCompletion')}</span>
            <span className="font-mono tabular-nums">{profileCompletion}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#EFF3EC] dark:bg-[#1E252A] overflow-hidden">
            <div
              className="h-full bg-[#15803D] dark:bg-[#B6F23B] rounded-full transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
        <Link
          to="/profile"
          className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B] hover:underline whitespace-nowrap shrink-0"
        >
          {tx('Manage Profile →', 'प्रोफ़ाइल देखें →')}
        </Link>
      </div>

      {/* 5 Summary KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6" aria-label="Dashboard summary metrics">
        <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-5">
          <p className="text-xs font-medium text-[#5B655D] dark:text-[#9BA59D]">
            {t('currentBmi')}
          </p>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2] tabular-nums">
            {bmi.isMinor ? tx('Youth', 'युवा') : bmi.bmi ? bmi.bmi.toFixed(1) : '—'}
          </p>
          <p className="mt-1 text-xs text-[#15803D] dark:text-[#B6F23B] truncate">
            {bmi.isMinor
              ? tx('Age-appropriate mode', 'आयु-उपयुक्त मोड')
              : language === 'hi'
              ? bmi.categoryHi
              : bmi.category}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-5">
          <p className="text-xs font-medium text-[#5B655D] dark:text-[#9BA59D]">
            {t('fitnessGoal')}
          </p>
          <p className="mt-2 font-display text-lg sm:text-xl font-bold text-[#15191C] dark:text-[#F3F6F2] leading-tight">
            {localize(user.age < 18 ? 'General Fitness' : user.fitnessGoal)}
          </p>
          <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            {localize(user.experience)} · {localize(user.dietaryPreference)}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-5">
          <p className="text-xs font-medium text-[#5B655D] dark:text-[#9BA59D]">
            {t('latestWeight')}
          </p>
          <p
            data-testid="dashboard-latest-weight"
            className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2] tabular-nums"
          >
            {latestWeight.toFixed(1)} <span className="text-sm font-normal">{tx('kg', 'किग्रा')}</span>
          </p>
          <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            {user.age < 18
              ? tx('Wellness tracking', 'स्वास्थ्य ट्रैकिंग')
              : tx(`Target ${user.targetWeightKg} kg`, `लक्ष्य ${user.targetWeightKg} किग्रा`)}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-5">
          <p className="text-xs font-medium text-[#5B655D] dark:text-[#9BA59D]">
            {t('workoutsLogged')}
          </p>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2] tabular-nums">
            {completedWorkoutCount}
          </p>
          <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            {tx('Completed check-ins', 'सक्रिय सत्र पूर्ण')}
          </p>
        </div>

        <div className="col-span-2 lg:col-span-1 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-5">
          <p className="text-xs font-medium text-[#5B655D] dark:text-[#9BA59D]">
            {t('progressRecords')}
          </p>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2] tabular-nums">
            {progressRecords.length}
          </p>
          <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            {tx('Saved history entries', 'कुल दर्ज प्रविष्टियाँ')}
          </p>
        </div>
      </section>

      {/* Main Row: Weight Progress Chart + BMI & Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Progress Line Chart */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-[#15191C] dark:text-[#F3F6F2]">
                {language === 'hi' ? 'वज़न प्रगति चार्ट (kg)' : 'Weight Progress History (kg)'}
              </h2>
              <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                {language === 'hi'
                  ? 'प्रगति ट्रैकर के साथ लाइव सिंक'
                  : 'Synced directly with your Progress Tracker entries'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] self-start">
              {(['weekly', 'monthly', 'yearly'] as ChartRange[]).map((rng) => (
                <button
                  key={rng}
                  type="button"
                  onClick={() => setChartRange(rng)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    chartRange === rng
                      ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]'
                      : 'text-[#5B655D] dark:text-[#9BA59D] hover:text-[#15191C] dark:hover:text-white'
                  }`}
                >
                  {t(rng)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ffWeightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B6F23B" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#B6F23B" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8DF" opacity={0.45} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#777F78" />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} stroke="#777F78" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#15191C',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} kg`, 'Weight']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#15803D"
                    strokeWidth={2.5}
                    fill="url(#ffWeightGrad)"
                    isAnimationActive={false}
                    dot={{ r: 4, fill: '#15191C', stroke: '#B6F23B', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#5B655D]">
                No weight records yet. Log your first entry in Progress Tracker.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: BMI Overview + Today's Activity */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">
                {language === 'hi' ? 'BMI सारांश' : 'BMI Overview'}
              </h2>
              <Link to="/bmi" className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B] hover:underline">
                {language === 'hi' ? 'पुनः गणना' : 'Recalculate'}
              </Link>
            </div>

            {bmi.isMinor ? (
              <p className="mt-3 text-xs leading-relaxed text-[#5B655D] dark:text-[#9BA59D]">
                Under-18 mode active. Adult BMI categories are hidden; focus on balanced movement and consult a qualified doctor.
              </p>
            ) : (
              <>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-bold tabular-nums">
                    {bmi.bmi?.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
                    {language === 'hi' ? bmi.categoryHi : bmi.category}
                  </span>
                </div>
                <div className="mt-4 relative h-2.5 rounded-full overflow-hidden flex">
                  <div className="w-[18.75%] bg-[#38BDF8]" />
                  <div className="w-[27.08%] bg-[#22C55E]" />
                  <div className="w-[20.83%] bg-[#F59E0B]" />
                  <div className="flex-1 bg-[#EF4444]" />
                </div>
                <div className="relative h-3">
                  <div
                    style={{ left: `${bmi.markerPercent}%` }}
                    className="absolute -top-3 -translate-x-1/2 w-2.5 h-3.5 rounded-full bg-[#15191C] dark:bg-white border border-white dark:border-[#15191C]"
                  />
                </div>
                <p className="mt-2 text-xs text-[#5B655D] dark:text-[#9BA59D] leading-relaxed">
                  {language === 'hi' ? bmi.disclaimerHi : bmi.disclaimer}
                </p>
              </>
            )}
          </div>

          {/* Today's Suggested Activity Toggle */}
          <div className="rounded-2xl bg-[#15191C] text-white p-6">
            <p className="text-xs font-semibold text-[#B6F23B]">
              {t('todaysActivity')} · {localize(todayDay)}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold">
              {isRestDay(todayDay)
                ? tx('Active Rest: 20-Min Morning Walk & Stretching', 'सक्रिय विश्राम: 20 मिनट सुबह की सैर व स्ट्रेचिंग')
                : (language === 'hi' && todaysWorkouts[0]?.titleHi) ||
                  todaysWorkouts[0]?.title ||
                  tx('30-Min Balanced Strength & Mobility', '30 मिनट संतुलित स्ट्रेंथ व मोबिलिटी')}
            </h3>
            <p className="mt-1.5 text-xs text-[#C5CEC7]">
              {isRestDay(todayDay)
                ? tx('Gentle recovery day to restore joints and energy.', 'जोड़ों और ऊर्जा की रिकवरी के लिए हल्का विश्राम दिवस।')
                : todaysWorkouts[0]?.durationOrReps || tx('3 sets · Moderate pace', '3 सेट · मध्यम गति')}
            </p>
            <button
              type="button"
              onClick={() => toggleActivity(todayIso, 'daily', 'today')}
              className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                dailyDone
                  ? 'bg-[#B6F23B] text-[#15191C]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {dailyDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span>{dailyDone ? t('completed') : t('markCompleted')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Activity Calendar + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B]" />
              <span>{t('weeklyActivity')}</span>
            </h2>
            <span className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
              {last7Days.filter((d) => d.active).length}/7 {tx('active days', 'सक्रिय दिन')}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {last7Days.map((d) => (
              <button
                key={d.iso}
                type="button"
                onClick={() => toggleActivity(d.iso, 'daily', 'today')}
                aria-label={`Toggle activity for ${d.iso}`}
                className={`rounded-xl py-3 px-1 flex flex-col items-center justify-center border transition-colors ${
                  d.active
                    ? 'bg-[#B6F23B] text-[#15191C] border-[#B6F23B] font-bold'
                    : d.isToday
                    ? 'bg-[#F7F9F5] dark:bg-[#1E252A] border-[#15191C] dark:border-[#B6F23B]'
                    : 'bg-[#F7F9F5] dark:bg-[#0E1113] border-[#E2E8DF] dark:border-[#262F35] text-[#5B655D] dark:text-[#9BA59D]'
                }`}
              >
                <span className="text-[11px]">{d.shortDay}</span>
                <span className="mt-1 font-mono text-sm tabular-nums">{d.dateNum}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <h2 className="font-display text-base font-bold mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/bmi"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] hover:border-[#15191C]/40 text-xs font-semibold"
            >
              <Calculator className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B] shrink-0" />
              <span>{t('calculateBmi')}</span>
            </Link>
            <Link
              to="/progress"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] hover:border-[#15191C]/40 text-xs font-semibold"
            >
              <Plus className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B] shrink-0" />
              <span>{t('addRecord')}</span>
            </Link>
            <Link
              to="/diet"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] hover:border-[#15191C]/40 text-xs font-semibold"
            >
              <Utensils className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B] shrink-0" />
              <span>{t('sidebarDiet')}</span>
            </Link>
            <Link
              to="/membership"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] hover:border-[#15191C]/40 text-xs font-semibold"
            >
              <CreditCard className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B] shrink-0" />
              <span>{tx('UPI & Plans (₹)', 'UPI व प्लान्स (₹)')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Diet Preview + Workout Preview + Journey Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-bold">{t('todaysMeals')}</h2>
            <Link to="/diet" className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B] inline-flex items-center gap-1 hover:underline">
              <span>{t('allDays')}</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E2E8DF] dark:divide-[#262F35]">
            {todaysMeals.map((meal) => {
              const done = Boolean(activityMap[`${todayIso}:meal:${meal.id}`]);
              return (
                <div key={meal.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                      {localize(meal.mealSlot)} · {meal.suggestedTime} · {localize(meal.dietType)}
                    </p>
                    <p className={`mt-0.5 text-sm font-semibold ${done ? 'line-through opacity-60' : ''}`}>
                      {language === 'hi' && meal.titleHi ? meal.titleHi : meal.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActivity(todayIso, 'meal', meal.id)}
                    aria-label={`Toggle completion for ${meal.title}`}
                    className={`p-1.5 rounded-lg shrink-0 ${
                      done
                        ? 'text-[#15803D] dark:text-[#B6F23B]'
                        : 'text-[#777F78] hover:text-[#15191C] dark:hover:text-white'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-bold">{t('todaysWorkout')}</h2>
            <Link to="/workouts" className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B] inline-flex items-center gap-1 hover:underline">
              <span>{t('fullPlan')}</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {todaysWorkouts.map((w) => {
              const done = Boolean(activityMap[`${todayIso}:workout:${w.id}`]);
              return (
                <div
                  key={w.id}
                  className="rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                      {localize(w.difficulty)} · {localize(w.category)}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {language === 'hi' && w.titleHi ? w.titleHi : w.title}
                    </p>
                    <p className="mt-1 text-xs font-mono text-[#5B655D] dark:text-[#9BA59D]">
                      {w.durationOrReps}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActivity(todayIso, 'workout', w.id)}
                    aria-label={`Toggle workout ${w.title}`}
                    className={`p-1.5 rounded-lg shrink-0 ${
                      done ? 'text-[#15803D] dark:text-[#B6F23B]' : 'text-[#777F78]'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <h2 className="font-display text-base font-bold mb-4">{t('journeyTimeline')}</h2>
          <ol className="space-y-4">
            {timelineItems.map((item, idx) => (
              <li key={idx} className="relative pl-4 border-l border-[#E2E8DF] dark:border-[#262F35]">
                <p className="font-mono text-[11px] text-[#5B655D] dark:text-[#9BA59D]">{item.date}</p>
                <p className="mt-0.5 text-xs font-semibold text-[#15191C] dark:text-[#F3F6F2]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-[#5B655D] dark:text-[#9BA59D] leading-snug">
                  {item.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
};
