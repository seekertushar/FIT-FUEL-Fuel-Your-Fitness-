import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RotateCcw, LogOut, ShieldAlert } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useApp } from '../context/AppContext';
import { INDIAN_BRANCHES } from '../data/sampleData';
import { DietaryPreference, ExperienceLevel, FitnessGoal } from '../types/fitfuel';
import { validateIndianMobile } from '../services/progressService';
import { useLanguage } from '../context/LanguageContext';

export const ProfileSettingsPage: React.FC = () => {
  const {
    user,
    theme,
    updateProfile,
    setLanguage: setAppLanguage,
    toggleTheme,
    resetDemoData,
    logout,
    addToast,
  } = useApp();
  const { language, t, tx, localize } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    age: String(user.age),
    gender: user.gender,
    heightCm: String(user.heightCm),
    currentWeightKg: String(user.currentWeightKg),
    targetWeightKg: String(user.targetWeightKg),
    experience: user.experience as ExperienceLevel,
    activityLevel: user.activityLevel,
    dietaryPreference: user.dietaryPreference as DietaryPreference,
    allergies: user.allergies === 'None' ? '' : user.allergies,
    fitnessGoal: user.fitnessGoal as FitnessGoal,
    branchCity: user.branchCity,
    notificationsEnabled: user.notificationsEnabled,
  });
  const [error, setError] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const ageNum = Number(form.age);
  const isMinor = Number.isFinite(ageNum) && ageNum > 0 && ageNum < 18;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.fullName.trim().length < 2) {
      setError(tx('Full name must be at least 2 characters.', 'पूरा नाम कम से कम 2 अक्षरों का होना चाहिए।'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError(tx('Enter a valid email address.', 'कृपया वैध ईमेल पता दर्ज करें।'));
      return;
    }
    if (form.mobile.trim() && !validateIndianMobile(form.mobile)) {
      setError(tx('Enter a valid Indian 10-digit mobile number.', 'कृपया वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।'));
      return;
    }
    if (!Number.isInteger(ageNum) || ageNum < 10 || ageNum > 100) {
      setError(tx('Enter a valid age between 10 and 100.', 'कृपया 10 से 100 के बीच वैध आयु दर्ज करें।'));
      return;
    }
    const h = Number(form.heightCm);
    const w = Number(form.currentWeightKg);
    if (!Number.isFinite(h) || h < 80 || h > 250) {
      setError(tx('Height must be between 80 and 250 cm.', 'ऊँचाई 80 से 250 सेमी के बीच होनी चाहिए।'));
      return;
    }
    if (!Number.isFinite(w) || w < 20 || w > 300) {
      setError(tx('Weight must be between 20 and 300 kg.', 'वज़न 20 से 300 किग्रा के बीच होना चाहिए।'));
      return;
    }

    await updateProfile({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      age: ageNum,
      gender: form.gender,
      heightCm: h,
      currentWeightKg: w,
      targetWeightKg: isMinor ? w : Number(form.targetWeightKg) || w,
      experience: form.experience,
      activityLevel: form.activityLevel,
      dietaryPreference: form.dietaryPreference,
      allergies: form.allergies.trim() || 'None',
      fitnessGoal: isMinor ? 'General Fitness' : form.fitnessGoal,
      branchCity: form.branchCity,
      notificationsEnabled: form.notificationsEnabled,
    });
    addToast('success', tx('Profile and preferences updated.', 'प्रोफ़ाइल और प्राथमिकताएँ अपडेट की गईं।'));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <DashboardLayout
      title={t('sidebarProfile')}
      subtitle={tx(
        'Update your fitness profile, Indian branch, theme, language, and demo data preferences.',
        'अपना व्यक्तिगत फिटनेस विवरण, भाषा, थीम और सूचना प्राथमिकताएँ प्रबंधित करें।'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Form */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <h2 className="font-display text-lg font-bold">
            {tx('Fitness Profile Details', 'प्रोफ़ाइल जानकारी')}
          </h2>

          {error && (
            <div role="alert" className="mt-4 rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] p-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
              {error}
            </div>
          )}

          {isMinor && (
            <div className="mt-4 rounded-xl bg-[#FEF3C7] dark:bg-[#33270E] p-3.5 text-xs text-[#9A3412] dark:text-[#FCD34D] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {tx(
                  'Under-18 protection active: Weight-loss and weight-gain goals are disabled. General Fitness guidance applies.',
                  '18 वर्ष से कम सुरक्षा सक्रिय: वज़न घटाने और वज़न बढ़ाने के लक्ष्य अक्षम हैं। सामान्य फिटनेस मार्गदर्शन लागू है।'
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleSave} className="mt-5 space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pf-name" className="block text-xs font-semibold mb-1.5">
                  {tx('Full Name', 'पूरा नाम')}
                </label>
                <input
                  id="pf-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="pf-email" className="block text-xs font-semibold mb-1.5">
                  {tx('Email Address', 'ईमेल पता')}
                </label>
                <input
                  id="pf-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf-mobile" className="block text-xs font-semibold mb-1.5">
                  {tx('Mobile (+91)', 'मोबाइल (+91)')}
                </label>
                <input
                  id="pf-mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono"
                />
              </div>
              <div>
                <label htmlFor="pf-age" className="block text-xs font-semibold mb-1.5">
                  {tx('Age (Years)', 'आयु (वर्ष)')}
                </label>
                <input
                  id="pf-age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono"
                />
              </div>
              <div>
                <label htmlFor="pf-height" className="block text-xs font-semibold mb-1.5">
                  {tx('Height (cm)', 'ऊँचाई (सेमी)')}
                </label>
                <input
                  id="pf-height"
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf-weight" className="block text-xs font-semibold mb-1.5">
                  {tx('Current Weight (kg)', 'वर्तमान वज़न (किग्रा)')}
                </label>
                <input
                  id="pf-weight"
                  type="number"
                  step="0.1"
                  value={form.currentWeightKg}
                  onChange={(e) => setForm((f) => ({ ...f, currentWeightKg: e.target.value }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono"
                />
              </div>
              {!isMinor && (
                <div>
                  <label htmlFor="pf-target" className="block text-xs font-semibold mb-1.5">
                    {tx('Target Weight (kg)', 'लक्ष्य वज़न (किग्रा)')}
                  </label>
                  <input
                    id="pf-target"
                    type="number"
                    step="0.1"
                    value={form.targetWeightKg}
                    onChange={(e) => setForm((f) => ({ ...f, targetWeightKg: e.target.value }))}
                    className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono"
                  />
                </div>
              )}
              <div>
                <label htmlFor="pf-branch" className="block text-xs font-semibold mb-1.5">
                  {tx('Indian Gym Branch', 'भारतीय जिम शाखा')}
                </label>
                <select
                  id="pf-branch"
                  value={form.branchCity}
                  onChange={(e) => setForm((f) => ({ ...f, branchCity: e.target.value }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm"
                >
                  {INDIAN_BRANCHES.map((b) => (
                    <option key={b.id} value={b.city}>{b.city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf-exp" className="block text-xs font-semibold mb-1.5">
                  {tx('Experience', 'अनुभव स्तर')}
                </label>
                <select
                  id="pf-exp"
                  value={form.experience}
                  onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value as ExperienceLevel }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm"
                >
                  <option value="Beginner">{localize('Beginner')}</option>
                  <option value="Intermediate">{localize('Intermediate')}</option>
                  <option value="Advanced">{localize('Advanced')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="pf-diet" className="block text-xs font-semibold mb-1.5">
                  {tx('Dietary Preference', 'आहार प्राथमिकता')}
                </label>
                <select
                  id="pf-diet"
                  value={form.dietaryPreference}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dietaryPreference: e.target.value as DietaryPreference }))
                  }
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm"
                >
                  <option value="Vegetarian">{localize('Vegetarian')}</option>
                  <option value="Non-Vegetarian">{localize('Non-Vegetarian')}</option>
                  <option value="Vegan">{localize('Vegan')}</option>
                  <option value="Balanced">{localize('Balanced')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="pf-goal" className="block text-xs font-semibold mb-1.5">
                  {tx('Fitness Goal', 'फिटनेस लक्ष्य')}
                </label>
                <select
                  id="pf-goal"
                  disabled={isMinor}
                  value={isMinor ? 'General Fitness' : form.fitnessGoal}
                  onChange={(e) => setForm((f) => ({ ...f, fitnessGoal: e.target.value as FitnessGoal }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm disabled:opacity-60"
                >
                  <option value="General Fitness">{localize('General Fitness')}</option>
                  <option value="Weight Maintenance">{localize('Weight Maintenance')}</option>
                  {!isMinor && <option value="Weight Loss">{localize('Weight Loss')}</option>}
                  {!isMinor && <option value="Weight Gain">{localize('Weight Gain')}</option>}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="pf-allergies" className="block text-xs font-semibold mb-1.5">
                {tx('Food Allergies / Restrictions', 'खाद्य एलर्जी / प्रतिबंध')}
              </label>
              <input
                id="pf-allergies"
                type="text"
                value={form.allergies}
                onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
                placeholder={tx('e.g., peanuts, lactose', 'जैसे मूँगफली, लैक्टोज़')}
                className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B6F23B] text-[#15191C] text-sm font-bold hover:bg-[#A4E028]"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveChanges')}</span>
            </button>
          </form>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 space-y-5">
            <h2 className="font-display text-lg font-bold">
              {tx('App Preferences', 'ऐप प्राथमिकताएँ')}
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{tx('Language / भाषा', 'भाषा / Language')}</p>
                <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                  {tx('English or Hindi UI', 'अंग्रेज़ी या हिंदी इंटरफ़ेस')}
                </p>
              </div>
              <div className="inline-flex p-1 rounded-lg bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35]">
                <button
                  type="button"
                  onClick={() => setAppLanguage('en')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    language === 'en' ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]' : 'text-[#5B655D]'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setAppLanguage('hi')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    language === 'hi' ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]' : 'text-[#5B655D]'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8DF] dark:border-[#262F35]">
              <div>
                <p className="text-sm font-semibold">{tx('Theme', 'थीम')}</p>
                <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                  {tx('Current:', 'वर्तमान:')} {localize(theme)}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3.5 py-2 rounded-lg border border-[#E2E8DF] dark:border-[#262F35] text-xs font-semibold"
              >
                {theme === 'dark'
                  ? tx('Switch to Light', 'लाइट मोड चुनें')
                  : tx('Switch to Dark', 'डार्क मोड चुनें')}
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8DF] dark:border-[#262F35]">
              <div>
                <p className="text-sm font-semibold">{tx('Reminders & Alerts', 'रिमाइंडर और अलर्ट')}</p>
                <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                  {tx('Weekly check-in prompts', 'साप्ताहिक चेक-इन अनुस्मारक')}
                </p>
              </div>
              <input
                type="checkbox"
                aria-label={tx('Enable weekly check-in notifications', 'साप्ताहिक चेक-इन सूचनाएँ सक्षम करें')}
                checked={form.notificationsEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setForm((f) => ({ ...f, notificationsEnabled: val }));
                  updateProfile({ notificationsEnabled: val });
                }}
                className="w-4 h-4 accent-[#15803D]"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 space-y-3">
            <h2 className="font-display text-base font-bold">
              {tx('Account & Demo Data', 'खाता और डेमो डेटा')}
            </h2>
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8DF] dark:border-[#262F35] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('resetDemo')}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] text-[#B91C1C] dark:text-[#FCA5A5] text-xs font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        title={tx('Reset Demo Data?', 'डेमो डेटा रीसेट करें?')}
        description={tx(
          'This restores the default Indian sample profile, diet templates, workouts, and progress history.',
          'इससे डिफ़ॉल्ट भारतीय सैंपल प्रोफ़ाइल, डाइट टेम्पलेट, वर्कआउट और प्रगति इतिहास बहाल हो जाएगा।'
        )}
        confirmLabel={tx('Restore Defaults', 'डिफ़ॉल्ट बहाल करें')}
        onConfirm={() => {
          resetDemoData();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </DashboardLayout>
  );
};
