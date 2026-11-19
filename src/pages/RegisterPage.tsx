import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from '../components/BrandLogo';
import { LanguageToggle } from '../components/LanguageToggle';
import { validateIndianMobile } from '../services/progressService';

export const RegisterPage: React.FC = () => {
  const { demoRegister, signInWithGoogle, authLoading } = useApp();
  const { t, tx } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.fullName.trim().length < 2) {
      errs.fullName = tx(
        'Please enter your full name (at least 2 characters).',
        'कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)।'
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = tx('Please enter a valid email address.', 'कृपया एक मान्य ईमेल पता दर्ज करें।');
    }
    if (!validateIndianMobile(form.mobile)) {
      errs.mobile = tx(
        'Enter a valid 10-digit Indian mobile number (e.g., +91 98450 12345).',
        'कृपया एक मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (जैसे +91 98450 12345)।'
      );
    }
    const ageNum = Number(form.age);
    if (!form.age || !Number.isInteger(ageNum) || ageNum < 10 || ageNum > 100) {
      errs.age = tx(
        'Please enter a valid age between 10 and 100.',
        'कृपया 10 से 100 वर्ष के बीच मान्य आयु दर्ज करें।'
      );
    }
    if (form.password.length < 8) {
      errs.password = tx(
        'Password must be at least 8 characters long.',
        'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।'
      );
    }
    if (form.confirmPassword !== form.password) {
      errs.confirmPassword = tx('Passwords do not match.', 'दोनों पासवर्ड मेल नहीं खाते।');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Passwords are validated in memory only and NEVER persisted in localStorage
    demoRegister({
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      age: Number(form.age),
      gender: form.gender || 'Prefer not to say',
    });
    navigate('/onboarding');
  };

  const handleGoogleSignIn = async () => {
    const ok = await signInWithGoogle();
    if (ok) navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F5] dark:bg-[#0E1113] flex flex-col">
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-[#E2E8DF] dark:border-[#262F35] bg-white dark:bg-[#15191C]">
        <Link to="/" aria-label="Back to FIT FUEL home">
          <BrandLogo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link to="/login" className="text-sm font-semibold text-[#15191C] dark:text-[#B6F23B] hover:underline whitespace-nowrap">
            {t('login')}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
            {tx('Create FIT FUEL Account', 'नया सदस्य पंजीकरण')}
          </p>
          <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
            {tx('Start Your Fitness Profile', 'अपनी फिटनेस यात्रा शुरू करें')}
          </h1>
          <p className="mt-2 text-sm text-[#5B655D] dark:text-[#9BA59D]">
            {tx(
              'Sign in with Google for Cloud SQL persistence, or complete the demo registration form below.',
              'Google से साइन-इन करें (Cloud SQL सिंक) या नीचे डेमो पंजीकरण फ़ॉर्म भरें।'
            )}
          </p>

          <button
            type="button"
            disabled={authLoading}
            onClick={handleGoogleSignIn}
            className="mt-5 w-full py-3 px-4 rounded-xl border border-[#E2E8DF] dark:border-[#262F35] bg-[#F7F9F5] dark:bg-[#0E1113] text-sm font-semibold text-[#15191C] dark:text-[#F3F6F2] hover:bg-[#EFF3EC] dark:hover:bg-[#1E252A] transition-colors flex items-center justify-center gap-2.5"
          >
            <span>{authLoading ? tx('Connecting...', 'कनेक्ट हो रहा है...') : t('continueWithGoogle')}</span>
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            <div className="h-px flex-1 bg-[#E2E8DF] dark:bg-[#262F35]" />
            <span>{tx('or demo registration', 'या डेमो पंजीकरण करें')}</span>
            <div className="h-px flex-1 bg-[#E2E8DF] dark:bg-[#262F35]" />
          </div>

          <div className="mb-5 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-3.5 flex items-start gap-2.5 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#15803D] dark:text-[#B6F23B] mt-0.5" />
            <span>
              {tx(
                'Demo registration runs locally in your browser without storing passwords in localStorage. Use Google Sign-In above for verified Firebase + Cloud SQL persistence.',
                'डेमो पंजीकरण आपके ब्राउज़र में स्थानीय रूप से चलता है और localStorage में पासवर्ड कभी सेव नहीं करता। क्लाउड सिंक के लिए ऊपर Google साइन-इन का उपयोग करें।'
              )}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold mb-1.5">
                  {tx('Full Name *', 'पूरा नाम *')}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder={tx('e.g., Meera Krishnan', 'जैसे, मीरा कृष्णन')}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
                {errors.fullName && <p role="alert" className="mt-1 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold mb-1.5">
                  {tx('Email Address *', 'ईमेल पता *')}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="meera@example.in"
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
                {errors.email && <p role="alert" className="mt-1 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label htmlFor="reg-mobile" className="block text-xs font-semibold mb-1.5">
                  {tx('Mobile (+91) *', 'मोबाइल (+91) *')}
                </label>
                <input
                  id="reg-mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                  placeholder="+91 98450 12345"
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
                {errors.mobile && <p role="alert" className="mt-1 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">{errors.mobile}</p>}
              </div>

              <div>
                <label htmlFor="reg-age" className="block text-xs font-semibold mb-1.5">
                  {tx('Age (Years) *', 'आयु (वर्ष) *')}
                </label>
                <input
                  id="reg-age"
                  type="number"
                  min={10}
                  max={100}
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  placeholder="26"
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
                {errors.age && <p role="alert" className="mt-1 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">{errors.age}</p>}
              </div>

              <div>
                <label htmlFor="reg-gender" className="block text-xs font-semibold mb-1.5">
                  {tx('Gender (Optional)', 'लिंग (वैकल्पिक)')}
                </label>
                <select
                  id="reg-gender"
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                >
                  <option value="">{tx('Prefer not to say', 'बताना नहीं चाहते')}</option>
                  <option value="Female">{tx('Female', 'महिला')}</option>
                  <option value="Male">{tx('Male', 'पुरुष')}</option>
                  <option value="Non-binary">{tx('Non-binary', 'नॉन-बाइनरी')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold mb-1.5">
                  {tx('Password *', 'पासवर्ड *')}
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder={tx('Min. 8 characters', 'कम से कम 8 अक्षर')}
                    className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? tx('Hide password', 'पासवर्ड छिपाएँ') : tx('Show password', 'पासवर्ड दिखाएँ')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B655D]"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p role="alert" className="mt-1 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold mb-1.5">
                  {tx('Confirm Password *', 'पासवर्ड की पुष्टि करें *')}
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder={tx('Re-enter password', 'पासवर्ड दोबारा दर्ज करें')}
                    className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? tx('Hide confirm password', 'पुष्टि पासवर्ड छिपाएँ') : tx('Show confirm password', 'पुष्टि पासवर्ड दिखाएँ')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B655D]"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p role="alert" className="mt-1 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#B6F23B] text-[#15191C] text-sm font-bold hover:bg-[#A4E028] transition-colors flex items-center justify-center gap-2"
            >
              <span>{tx('Create Demo Account & Continue', 'डेमो खाता बनाएँ और आगे बढ़ें')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#5B655D] dark:text-[#9BA59D]">
            {tx('Already registered?', 'पहले से पंजीकृत हैं?')}{' '}
            <Link to="/login" className="font-semibold text-[#15191C] dark:text-[#B6F23B] hover:underline">
              {tx('Log in here', 'यहाँ लॉगिन करें')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
