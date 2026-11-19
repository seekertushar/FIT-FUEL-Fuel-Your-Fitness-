import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, AlertTriangle, Info, Clock } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { DAYS_OF_WEEK, filterDietTemplates, findAllergyMatches, getTodayDayOfWeek } from '../services/dietService';
import { DayOfWeek, DietaryPreference } from '../types/fitfuel';
import { ASSETS } from '../data/sampleData';

export const DietPlanPage: React.FC = () => {
  const { user, dietTemplates, activityMap, toggleActivity } = useApp();
  const { language, t, tx, localize, dayShort } = useLanguage();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getTodayDayOfWeek());
  const [dietFilter, setDietFilter] = useState<DietaryPreference | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const todayIso = new Date().toISOString().slice(0, 10);

  const filteredMeals = useMemo(
    () =>
      filterDietTemplates({
        templates: dietTemplates,
        day: selectedDay,
        dietFilter,
        searchQuery,
      }),
    [dietTemplates, selectedDay, dietFilter, searchQuery]
  );

  const completedCount = filteredMeals.filter(
    (m) => activityMap[`${todayIso}:meal:${m.id}`]
  ).length;

  const nutritionTips = [
    tx(
      'Pair whole grains (roti, brown rice, ragi, jowar) with a steady protein source like moong dal, paneer, curd, sprouts, tofu, or eggs.',
      'हर मुख्य भारतीय भोजन में दाल, पनीर, दही, अंडे या अंकुरित अनाज के रूप में प्रोटीन शामिल करें।'
    ),
    tx(
      'Stay hydrated across warm Indian climates with 2.5–3L water, unsweetened buttermilk (chaas), or fresh coconut water.',
      'दिन भर में 2.5–3 लीटर पानी, नींबू पानी या बिना चीनी की छाछ पिएँ।'
    ),
    tx(
      'Avoid extreme deficits or crash diets. Sustainable home-cooked portions with seasonal vegetables and fruits deliver consistent energy.',
      'अत्यधिक उपवास या कठोर कैलोरी कटौती से बचें—नियमित संतुलित घर का भोजन दीर्घकालिक परिणाम देता है।'
    ),
  ];

  return (
    <DashboardLayout
      title={t('sidebarDiet')}
      subtitle={tx(
        'Structured 7-day Indian meal plans tailored by dietary preference and allergy checks. Educational wellness guidance only.',
        'संतुलित भारतीय भोजन टेम्पलेट्स (सोमवार से रविवार) · आपकी आहार पसंद और एलर्जी के अनुसार।'
      )}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* Top Banner + Visual Header */}
      <div className="mb-6 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
              {localize(user.dietaryPreference)} ·{' '}
              {user.age < 18 ? tx('Youth General Wellness', 'युवा सामान्य स्वास्थ्य') : localize(user.fitnessGoal)}
            </p>
            <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
              {localize(selectedDay)} — {tx('Balanced Indian Meal Schedule', 'भारतीय संतुलित आहार योजना')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5B655D] dark:text-[#9BA59D]">
              {tx('Meals marked completed for this view:', 'आज के पूर्ण भोजन:')}{' '}
              <span className="font-mono font-bold text-[#15191C] dark:text-[#B6F23B]">
                {completedCount}/{filteredMeals.length}
              </span>
            </p>
          </div>

          {user.allergies && user.allergies.toLowerCase() !== 'none' && (
            <div className="mt-4 rounded-xl bg-[#FEF3C7] dark:bg-[#33270E] px-3.5 py-2.5 text-xs text-[#9A3412] dark:text-[#FCD34D] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {tx('Active allergy alert on profile:', 'प्रोफ़ाइल पर सक्रिय एलर्जी चेतावनी:')}{' '}
                <strong>{user.allergies}</strong>.{' '}
                {tx('Matching meals below are flagged.', 'संबंधित भोजन नीचे चिह्नित किए गए हैं।')}
              </span>
            </div>
          )}
        </div>
        <div className="lg:col-span-4 min-h-[160px] max-h-[210px]">
          <img
            src={ASSETS.indianMeal}
            alt="Balanced Indian meal spread with dal, roti, paneer, poha, sprouts, and curd"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls: Day Switcher + Diet Preference Filter */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Days of Week */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Days of the week">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={selectedDay === day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedDay === day
                  ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]'
                  : 'bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] text-[#5B655D] dark:text-[#C5CEC7] hover:text-[#15191C] dark:hover:text-white'
              }`}
            >
              {dayShort(day)}
            </button>
          ))}
        </div>

        {/* Dietary Preference Filter */}
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35]">
          {(['All', 'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Balanced'] as const).map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setDietFilter(pref)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                dietFilter === pref
                  ? 'bg-[#B6F23B] text-[#15191C]'
                  : 'text-[#5B655D] dark:text-[#9BA59D] hover:text-[#15191C] dark:hover:text-white'
              }`}
            >
              {pref === 'All'
                ? tx('All Meals', 'सभी भोजन')
                : pref === 'Balanced'
                ? tx('General Balanced', 'सामान्य संतुलित')
                : localize(pref)}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Cards Grid */}
      {filteredMeals.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-10 text-center">
          <p className="font-display font-bold text-base">
            {tx(
              `No meal templates match this filter for ${selectedDay}`,
              `${localize(selectedDay)} के लिए इस फ़िल्टर से कोई भोजन मेल नहीं खाता`
            )}
          </p>
          <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            {tx('Try selecting "All Meals" or clearing your search query.', '"सभी भोजन" चुनें या खोज शब्द हटाएँ।')}
          </p>
          <button
            type="button"
            onClick={() => {
              setDietFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#B6F23B] text-[#15191C] text-xs font-bold"
          >
            {tx(`Show All ${selectedDay} Meals`, `${localize(selectedDay)} के सभी भोजन दिखाएँ`)}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMeals.map((meal) => {
            const done = Boolean(activityMap[`${todayIso}:meal:${meal.id}`]);
            const allergyHits = findAllergyMatches(meal, user.allergies);
            return (
              <article
                key={meal.id}
                className={`rounded-2xl bg-white dark:bg-[#161B1E] border p-5 flex flex-col justify-between transition-colors ${
                  done
                    ? 'border-[#15803D] dark:border-[#B6F23B]'
                    : 'border-[#E2E8DF] dark:border-[#262F35]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#5B655D] dark:text-[#9BA59D]">
                    <span className="font-semibold text-[#15191C] dark:text-[#F3F6F2]">
                      {localize(meal.mealSlot)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" /> {meal.suggestedTime}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#15803D] dark:text-[#B6F23B] font-medium">
                    {localize(meal.dietType)} · ~{meal.caloriesApprox} {tx('kcal', 'कैलोरी')} · {meal.proteinGrams}g {tx('protein', 'प्रोटीन')}
                  </p>

                  <h3 className="mt-2.5 font-display text-lg font-bold text-[#15191C] dark:text-[#F3F6F2]">
                    {language === 'hi' && meal.titleHi ? meal.titleHi : meal.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5B655D] dark:text-[#9BA59D]">
                    {meal.description}
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-[#202820] dark:text-[#E2E8DF]">
                    {meal.foodItems.map((item, i) => (
                      <li key={i}>· {item}</li>
                    ))}
                  </ul>

                  {allergyHits.length > 0 && (
                    <div className="mt-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3A1618] px-3 py-2 text-xs text-[#B91C1C] dark:text-[#FCA5A5] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {tx('Contains flagged allergen:', 'चिह्नित एलर्जी तत्व शामिल:')}{' '}
                        {allergyHits.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleActivity(todayIso, 'meal', meal.id)}
                  className={`mt-5 w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    done
                      ? 'bg-[#B6F23B] text-[#15191C]'
                      : 'bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] text-[#15191C] dark:text-[#F3F6F2] hover:bg-[#EFF3EC] dark:hover:bg-[#1E252A]'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  <span>{done ? t('completed') : t('markCompleted')}</span>
                </button>
              </article>
            );
          })}
        </div>
      )}

      {/* General Nutrition Tips & Disclaimer */}
      <div className="mt-8 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
        <h3 className="font-display text-base font-bold flex items-center gap-2">
          <Info className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B]" />
          <span>{tx('General Nutrition Guidance', 'सामान्य भारतीय पोषण सुझाव')}</span>
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[#5B655D] dark:text-[#9BA59D]">
          {nutritionTips.map((tip, idx) => (
            <li key={idx}>· {tip}</li>
          ))}
        </ul>
        <p className="mt-4 pt-3 border-t border-[#E2E8DF] dark:border-[#262F35] text-xs text-[#5B655D] dark:text-[#9BA59D]">
          {tx(
            'Disclaimer: FIT FUEL diet templates provide general educational meal structure only—not clinical prescriptions, medical nutrition therapy, or supplement plans. Adjust portions to hunger, activity, and personal medical advice.',
            'अस्वीकरण: FIT FUEL डाइट टेम्पलेट्स केवल सामान्य शैक्षिक भोजन संरचना प्रदान करते हैं—ये चिकित्सकीय परामर्श या चिकित्सा पोषण थेरेपी नहीं हैं।'
          )}
        </p>
      </div>
    </DashboardLayout>
  );
};
