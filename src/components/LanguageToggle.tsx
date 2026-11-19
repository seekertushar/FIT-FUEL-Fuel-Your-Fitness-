import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
  variant?: 'default' | 'slate';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'default',
  className = '',
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  const wrapperClass =
    variant === 'slate'
      ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80'
      : 'border-[#E2E8DF] dark:border-[#262F35] bg-[#F7F9F5] dark:bg-[#0E1113]';

  const activeClass =
    variant === 'slate'
      ? 'bg-[#0F172A] dark:bg-[#38BDF8] text-white dark:text-[#0F172A]'
      : 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]';

  const inactiveClass =
    variant === 'slate'
      ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      : 'text-[#5B655D] dark:text-[#9BA59D] hover:text-[#15191C] dark:hover:text-white';

  return (
    <div
      role="group"
      aria-label={t('switchLanguageLabel')}
      data-testid="navbar-language-toggle"
      className={`inline-flex items-center gap-1 p-0.5 rounded-lg border shrink-0 whitespace-nowrap ${wrapperClass} ${className}`}
    >
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={t('switchLanguageLabel')}
        title={language === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
        className="pl-2 pr-1 py-1 text-[#5B655D] dark:text-[#9BA59D] hover:text-[#15191C] dark:hover:text-white transition-colors"
      >
        <Languages className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        data-testid="lang-btn-en"
        className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
          language === 'en' ? activeClass : inactiveClass
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        aria-pressed={language === 'hi'}
        data-testid="lang-btn-hi"
        className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
          language === 'hi' ? activeClass : inactiveClass
        }`}
      >
        हिंदी
      </button>
    </div>
  );
};
