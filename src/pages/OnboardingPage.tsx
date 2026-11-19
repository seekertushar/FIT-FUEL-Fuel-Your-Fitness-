import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from '../components/BrandLogo';
import { LanguageToggle } from '../components/LanguageToggle';
import { DietaryPreference, ExperienceLevel, FitnessGoal } from '../types/fitfuel';
import { INDIAN_BRANCHES } from '../data/sampleData';

export const OnboardingPage: React.FC = () => {
  const { user, updateProfile, addToast } = useApp();
  const { t, tx, localize } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [age, setAge] = useState(String(user.age || 25));
  const [heightCm, setHeightCm] = useState(String(user.heightCm || 172));
  const [currentWeightKg, setCurrentWeightKg] = useState(String(user.currentWeightKg || 70));
  const [targetWeightKg, setTargetWeightKg] = useState(String(user.targetWeightKg || 68));
  const [gender, setGender] = useState(user.gender || 'Prefer not to say');
  const [branchCity, setBranchCity] = useState(user.branchCity || INDIAN_BRANCHES[0].city);

  const [experience, setExperience] = useState<ExperienceLevel>(user.experience || 'Beginner');
  const [activityLevel, setActivityLevel] = useState(
    user.activityLevel || 'Moderately Active (3–4 days/week)'
  );
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(
    user.dietaryPreference || 'Vegetarian'
  );
  const [allergies, setAllergies] = useState(user.allergies === 'None' ? '' : user.allergies || '');

  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(user.fitnessGoal || 'General Fitness');
  const [error, setError] = useState('');

  const ageNum = Number(age);
  const isMinor = Number.isFinite(ageNum) && ageNum > 0 && ageNum < 18;

  const validateStep1 = () => {
    const h = Number(heightCm);
    const w = Number(currentWeightKg);
    if (!Number.isInteger(ageNum) || ageNum < 10 || ageNum > 100) {
      setError(tx('Enter a valid age between 10 and 100.', '10 से 100 वर्ष के बीच मान्य आयु दर्ज करें।'));
      return false;
    }
    if (!Number.isFinite(h) || h < 80 || h > 250) {
      setError(tx('Enter a valid height between 80 cm and 250 cm.', '80 सेमी से 250 सेमी के बीच मान्य ऊँचाई दर्ज करें।'));
      return false;
    }
    if (!Number.isFinite(w) || w < 20 || w > 300) {
      setError(tx('Enter a valid weight between 20 kg and 300 kg.', '20 किग्रा से 300 किग्रा के बीच मान्य वज़न दर्ज करें।'));
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    const finalGoal: FitnessGoal = isMinor ? 'General Fitness' : fitnessGoal;
    await updateProfile({
      age: ageNum,
      heightCm: Number(heightCm),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: isMinor ? Number(currentWeightKg) : Number(targetWeightKg) || Number(currentWeightKg),
      gender,
      branchCity,
      experience,
      activityLevel,
      dietaryPreference,
      allergies: allergies.trim() || 'None',
      fitnessGoal: finalGoal,
      onboardingComplete: true,
    });
    addToast(
      'success',
      tx(
        'Fitness profile saved! Welcome to your FIT FUEL Dashboard.',
        'फिटनेस प्रोफ़ाइल सहेजी गई! आपके FIT FUEL डैशबोर्ड में स्वागत है।'
      )
    );
    navigate('/dashboard');
  };

  const allGoals: Array<{ id: FitnessGoal; desc: string; adultOnly?: boolean }> = [
    {
      id: 'Weight Loss',
      desc: tx(
        'Steady, balanced home meals and regular cardio + strength habits (Adults 18+ only).',
        'संतुलित घर का भोजन और नियमित कार्डियो व स्ट्रेंथ अभ्यास (केवल 18+ वयस्कों के लिए)।'
      ),
      adultOnly: true,
    },
    {
      id: 'Weight Gain',
      desc: tx(
        'Progressive strength routines paired with nutrient-dense Indian meals (Adults 18+ only).',
        'प्रगतिशील स्ट्रेंथ वर्कआउट और पोषक भारतीय भोजन (केवल 18+ वयस्कों के लिए)।'
      ),
      adultOnly: true,
    },
    {
      id: 'Weight Maintenance',
      desc: tx(
        'Preserve strength, stamina, and steady body composition week after week.',
        'शक्ति, स्टैमिना और संतुलित शरीर संरचना को नियमित बनाए रखें।'
      ),
    },
    {
      id: 'General Fitness',
      desc: tx(
        'Build mobility, daily energy, posture, and balanced nutrition habits.',
        'लचीलापन, दैनिक ऊर्जा, सही मुद्रा और संतुलित आहार की आदतें विकसित करें।'
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F5] dark:bg-[#0E1113] flex flex-col">
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[#E2E8DF] dark:border-[#262F35] bg-white dark:bg-[#15191C]">
        <Link to="/" aria-label="FIT FUEL Home">
          <BrandLogo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <span className="font-mono text-xs font-semibold text-[#5B655D] dark:text-[#9BA59D] whitespace-nowrap">
            {t('stepCounter', { step, total: 3 })}
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 sm:p-8 shadow-sm">
          {/* Step Progress Bar */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { num: 1, label: tx('Body Metrics', 'शरीर के माप') },
              { num: 2, label: tx('Lifestyle & Diet', 'जीवनशैली व आहार') },
              { num: 3, label: tx('Fitness Goal', 'फिटनेस लक्ष्य') },
            ].map((s) => (
              <div key={s.num}>
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    step >= s.num ? 'bg-[#B6F23B]' : 'bg-[#E2E8DF] dark:bg-[#262F35]'
                  }`}
                />
                <p
                  className={`mt-2 text-xs font-semibold ${
                    step >= s.num ? 'text-[#15191C] dark:text-[#F3F6F2]' : 'text-[#5B655D] dark:text-[#9BA59D]'
                  }`}
                >
                  0{s.num}. {s.label}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] p-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
              {error}
            </div>
          )}

          <form onSubmit={handleComplete}>
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                    {tx('Tell us about your baseline metrics', 'अपने प्रारंभिक फिटनेस माप दर्ज करें')}
                  </h1>
                  <p className="mt-1 text-sm text-[#5B655D] dark:text-[#9BA59D]">
                    {tx(
                      'Used by rule-based formulas to calculate BMI (adults 18+) and organize your dashboard.',
                      'वयस्कों (18+) के लिए BMI गणना और आपका डैशबोर्ड तैयार करने हेतु नियम-आधारित सूत्रों में उपयोग होता है।'
                    )}
                  </p>
                </div>

                {isMinor && (
                  <div className="rounded-xl bg-[#FEF3C7] dark:bg-[#33270E] border border-[#C2410C]/30 p-4 flex items-start gap-3 text-xs text-[#9A3412] dark:text-[#FCD34D]">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {tx('Under-18 Wellness Safeguard Active', '18 वर्ष से कम आयु सुरक्षा मोड सक्रिय')}
                      </p>
                      <p className="mt-1 leading-relaxed">
                        {tx(
                          'FIT FUEL does not offer weight-loss, weight-gain, or adult BMI categories to users under 18. You will receive general age-appropriate movement and nutrition education only. Always discuss fitness goals with a qualified healthcare professional and a trusted adult.',
                          'FIT FUEL 18 वर्ष से कम आयु के उपयोगकर्ताओं के लिए वज़न घटाने, वज़न बढ़ाने या वयस्क BMI श्रेणियाँ प्रदर्शित नहीं करता। केवल आयु-उपयुक्त सामान्य स्वास्थ्य जानकारी प्रदान की जाती है।'
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="ob-age" className="block text-xs font-semibold mb-1.5">
                      {tx('Age (Years) *', 'आयु (वर्ष) *')}
                    </label>
                    <input
                      id="ob-age"
                      type="number"
                      min={10}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                    />
                  </div>
                  <div>
                    <label htmlFor="ob-height" className="block text-xs font-semibold mb-1.5">
                      {tx('Height (cm) *', 'ऊँचाई (सेमी) *')}
                    </label>
                    <input
                      id="ob-height"
                      type="number"
                      min={80}
                      max={250}
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                    />
                  </div>
                  <div>
                    <label htmlFor="ob-weight" className="block text-xs font-semibold mb-1.5">
                      {tx('Current Weight (kg) *', 'वर्तमान वज़न (किग्रा) *')}
                    </label>
                    <input
                      id="ob-weight"
                      type="number"
                      step="0.1"
                      min={20}
                      max={300}
                      value={currentWeightKg}
                      onChange={(e) => setCurrentWeightKg(e.target.value)}
                      className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {!isMinor && (
                    <div>
                      <label htmlFor="ob-target" className="block text-xs font-semibold mb-1.5">
                        {tx('Target Weight (kg)', 'लक्ष्य वज़न (किग्रा)')}
                      </label>
                      <input
                        id="ob-target"
                        type="number"
                        step="0.1"
                        value={targetWeightKg}
                        onChange={(e) => setTargetWeightKg(e.target.value)}
                        className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="ob-gender" className="block text-xs font-semibold mb-1.5">
                      {tx('Gender (Optional)', 'लिंग (वैकल्पिक)')}
                    </label>
                    <select
                      id="ob-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                    >
                      <option value="Prefer not to say">{localize('Prefer not to say')}</option>
                      <option value="Female">{localize('Female')}</option>
                      <option value="Male">{localize('Male')}</option>
                      <option value="Non-binary">{localize('Non-binary')}</option>
                    </select>
                  </div>
                  <div className={isMinor ? 'sm:col-span-2' : ''}>
                    <label htmlFor="ob-branch" className="block text-xs font-semibold mb-1.5">
                      {tx('Preferred Indian Branch', 'पसंदीदा भारतीय शाखा')}
                    </label>
                    <select
                      id="ob-branch"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                    >
                      {INDIAN_BRANCHES.map((b) => (
                        <option key={b.id} value={b.city}>
                          {b.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                    {tx('Training Experience & Indian Diet Preferences', 'प्रशिक्षण अनुभव और भारतीय आहार पसंद')}
                  </h1>
                  <p className="mt-1 text-sm text-[#5B655D] dark:text-[#9BA59D]">
                    {tx(
                      'We match structured Indian meals and workout templates using these selections.',
                      'इन विकल्पों के आधार पर आपके लिए भारतीय भोजन और वर्कआउट टेम्पलेट्स चुने जाते हैं।'
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">
                    {tx('Fitness Experience', 'फिटनेस अनुभव स्तर')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperience(lvl)}
                        className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-colors ${
                          experience === lvl
                            ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] border-transparent'
                            : 'bg-[#F7F9F5] dark:bg-[#0E1113] border-[#E2E8DF] dark:border-[#262F35]'
                        }`}
                      >
                        {localize(lvl)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="ob-activity" className="block text-xs font-semibold mb-1.5">
                    {tx('General Activity Level', 'सामान्य गतिविधि स्तर')}
                  </label>
                  <select
                    id="ob-activity"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm"
                  >
                    <option value="Sedentary (Desk routine)">{localize('Sedentary (Desk routine)')}</option>
                    <option value="Lightly Active (1–2 days/week)">{localize('Lightly Active (1–2 days/week)')}</option>
                    <option value="Moderately Active (3–4 days/week)">{localize('Moderately Active (3–4 days/week)')}</option>
                    <option value="Very Active (5+ days/week)">{localize('Very Active (5+ days/week)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">
                    {tx('Dietary Preference', 'आहार पसंद')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Balanced'] as DietaryPreference[]).map(
                      (pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => setDietaryPreference(pref)}
                          className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${
                            dietaryPreference === pref
                              ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] border-transparent'
                              : 'bg-[#F7F9F5] dark:bg-[#0E1113] border-[#E2E8DF] dark:border-[#262F35]'
                          }`}
                        >
                          {localize(pref)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="ob-allergies" className="block text-xs font-semibold mb-1.5">
                    {tx('Food Allergies or Dietary Restrictions (Optional)', 'खाद्य एलर्जी या परहेज़ (वैकल्पिक)')}
                  </label>
                  <input
                    id="ob-allergies"
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder={tx('e.g., peanuts, lactose, gluten', 'जैसे, मूँगफली, लैक्टोज़, ग्लूटेन')}
                    className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h1 className="font-display text-2xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                    {tx('Select Your Fitness Goal', 'अपना फिटनेस लक्ष्य चुनें')}
                  </h1>
                  <p className="mt-1 text-sm text-[#5B655D] dark:text-[#9BA59D]">
                    {isMinor
                      ? tx(
                          'Because you are under 18, only age-appropriate General Fitness guidance is enabled.',
                          'चूँकि आपकी आयु 18 वर्ष से कम है, केवल आयु-उपयुक्त सामान्य फिटनेस मार्गदर्शन सक्षम है।'
                        )
                      : tx(
                          'Choose the primary focus for your structured diet and workout templates.',
                          'अपने डाइट और वर्कआउट टेम्पलेट्स के लिए मुख्य लक्ष्य चुनें।'
                        )}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {allGoals.map((g) => {
                    const disabled = isMinor && g.adultOnly;
                    const selected = (isMinor ? 'General Fitness' : fitnessGoal) === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setFitnessGoal(g.id)}
                        className={`text-left rounded-2xl p-4 border transition-colors ${
                          disabled
                            ? 'opacity-45 cursor-not-allowed bg-[#F7F9F5] dark:bg-[#0E1113] border-[#E2E8DF] dark:border-[#262F35]'
                            : selected
                            ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] border-transparent'
                            : 'bg-[#F7F9F5] dark:bg-[#0E1113] border-[#E2E8DF] dark:border-[#262F35] hover:border-[#15191C]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-base">{localize(g.id)}</span>
                          {selected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        </div>
                        <p
                          className={`mt-1.5 text-xs leading-relaxed ${
                            selected
                              ? 'text-white/80 dark:text-[#15191C]/80'
                              : 'text-[#5B655D] dark:text-[#9BA59D]'
                          }`}
                        >
                          {g.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-[#E2E8DF] dark:border-[#262F35] flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E2E8DF] dark:border-[#262F35] text-sm font-semibold hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A]"
                >
                  <ArrowLeft className="w-4 h-4" /> {t('backLabel')}
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] text-sm font-semibold"
                >
                  {t('continueLabel')} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#B6F23B] text-[#15191C] text-sm font-bold hover:bg-[#A4E028]"
                >
                  {tx('Save Profile & Go to Dashboard', 'प्रोफ़ाइल सहेजें और डैशबोर्ड खोलें')}{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
