import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from '../components/BrandLogo';
import { LanguageToggle } from '../components/LanguageToggle';
import { storageService } from '../services/storageService';

export const LoginPage: React.FC = () => {
  const { demoLogin, signInWithGoogle, authLoading, addToast } = useApp();
  const { t, tx } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => storageService.getRememberedEmail() || 'aarav.sharma@fitfuel.in');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [roleSelection, setRoleSelection] = useState<'member' | 'admin'>('member');
  const [error, setError] = useState('');
  const [showForgotNote, setShowForgotNote] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(tx('Please enter a valid email address.', 'कृपया एक मान्य ईमेल पता दर्ज करें।'));
      return;
    }
    if (password.trim().length < 6) {
      setError(
        tx(
          'Please enter at least 6 characters for the demo login password.',
          'डेमो लॉगिन के लिए कम से कम 6 अक्षरों का पासवर्ड दर्ज करें।'
        )
      );
      return;
    }
    demoLogin(email.trim(), roleSelection, rememberMe);
    navigate(roleSelection === 'admin' ? '/admin' : '/dashboard');
  };

  const handleGoogleSignIn = async () => {
    const ok = await signInWithGoogle();
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F5] dark:bg-[#0E1113] flex flex-col">
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-[#E2E8DF] dark:border-[#262F35] bg-white dark:bg-[#15191C]">
        <Link to="/" aria-label="FIT FUEL Home">
          <BrandLogo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link to="/register" className="text-sm font-semibold text-[#15191C] dark:text-[#B6F23B] hover:underline whitespace-nowrap">
            {t('getStarted')}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
            {tx('Member & Trainer Sign In', 'सदस्य व ट्रेनर प्रवेश')}
          </p>
          <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
            {tx('Welcome Back to FIT FUEL', 'FIT FUEL में लॉगिन करें')}
          </h1>

          {/* Real Firebase Google Sign-In */}
          <button
            type="button"
            disabled={authLoading}
            onClick={handleGoogleSignIn}
            className="mt-5 w-full py-3 px-4 rounded-xl bg-[#15191C] dark:bg-white text-white dark:text-[#15191C] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {authLoading
              ? tx('Signing in...', 'लॉगिन हो रहा है...')
              : `${t('continueWithGoogle')} (Cloud SQL)`}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            <div className="h-px flex-1 bg-[#E2E8DF] dark:bg-[#262F35]" />
            <span>{tx('or Demo Login Flow', 'या डेमो लॉगिन चुनें')}</span>
            <div className="h-px flex-1 bg-[#E2E8DF] dark:bg-[#262F35]" />
          </div>

          {/* Demo Role Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35]">
            <button
              type="button"
              onClick={() => setRoleSelection('member')}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                roleSelection === 'member'
                  ? 'bg-white dark:bg-[#161B1E] text-[#15191C] dark:text-[#F3F6F2] shadow-sm'
                  : 'text-[#5B655D] dark:text-[#9BA59D]'
              }`}
            >
              {tx('Member Demo', 'सदस्य डेमो')}
            </button>
            <button
              type="button"
              onClick={() => setRoleSelection('admin')}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                roleSelection === 'admin'
                  ? 'bg-[#0F172A] text-[#38BDF8] shadow-sm'
                  : 'text-[#5B655D] dark:text-[#9BA59D]'
              }`}
            >
              {tx('Trainer / Admin Demo', 'ट्रेनर / एडमिन डेमो')}
            </button>
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] p-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold mb-1.5">
                {tx('Email Address', 'ईमेल पता')}
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav.sharma@fitfuel.in"
                className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold mb-1.5">
                {tx('Password (Demo Validation Only)', 'पासवर्ड (केवल डेमो सत्यापन)')}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tx('Enter any 6+ characters', 'कोई भी 6+ अक्षर दर्ज करें')}
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
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E2E8DF]"
                />
                <span className="text-[#5B655D] dark:text-[#9BA59D]">
                  {tx('Remember email (demo)', 'ईमेल याद रखें (डेमो)')}
                </span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotNote((v) => !v);
                  addToast(
                    'info',
                    tx(
                      'Demo mode does not store passwords. Enter any 6+ character password or use Google Sign-In.',
                      'डेमो मोड में पासवर्ड सेव नहीं होते। कोई भी 6+ अक्षरों का पासवर्ड दर्ज करें या Google साइन-इन उपयोग करें।'
                    )
                  );
                }}
                className="font-semibold text-[#15803D] dark:text-[#B6F23B] hover:underline"
              >
                {tx('Forgot Password?', 'पासवर्ड भूल गए?')}
              </button>
            </div>

            {showForgotNote && (
              <div className="rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-3 text-xs text-[#5B655D] dark:text-[#9BA59D] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D] dark:text-[#B6F23B]" />
                <span>
                  {tx(
                    'For this frontend demonstration, no passwords are saved. Enter any 6+ character password to enter Demo Mode, or sign in securely with Google.',
                    'इस डेमो में कोई पासवर्ड सेव नहीं होता। डेमो मोड में जाने के लिए कोई भी 6+ अक्षरों का पासवर्ड डालें या Google से साइन-इन करें।'
                  )}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#B6F23B] text-[#15191C] text-sm font-bold hover:bg-[#A4E028] transition-colors"
            >
              {roleSelection === 'admin'
                ? tx('Enter Trainer / Admin Demo', 'ट्रेनर / एडमिन डेमो खोलें')
                : tx('Login to Member Dashboard', 'सदस्य डैशबोर्ड में लॉगिन करें')}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#E2E8DF] dark:border-[#262F35] flex items-start gap-2 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D] dark:text-[#B6F23B]" />
            <span>
              {tx(
                'Demo role switching is for presentation only. Server-verified Firebase Auth tokens guard Cloud SQL API endpoints.',
                'डेमो भूमिका स्विच केवल प्रदर्शन के लिए है। Cloud SQL API एंडपॉइंट्स सत्यापित Firebase Auth टोकन द्वारा सुरक्षित हैं।'
              )}
            </span>
          </div>

          <p className="mt-5 text-center text-xs text-[#5B655D] dark:text-[#9BA59D]">
            {tx('New to FIT FUEL?', 'FIT FUEL पर नए हैं?')}{' '}
            <Link to="/register" className="font-semibold text-[#15191C] dark:text-[#B6F23B] hover:underline">
              {tx('Create an account', 'नया खाता बनाएँ')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
