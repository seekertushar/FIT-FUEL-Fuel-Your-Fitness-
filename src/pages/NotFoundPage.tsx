import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { tx } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F7F9F5] dark:bg-[#0E1113] flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/">
          <BrandLogo size="sm" />
        </Link>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-16">
        <BrandLogo size="lg" />
        <p className="mt-8 font-mono text-6xl font-bold text-[#15191C] dark:text-[#B6F23B]">404</p>
        <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
          {tx('Page Not Found', 'पृष्ठ नहीं मिला')}
        </h1>
        <p className="mt-2 max-w-md text-sm text-[#5B655D] dark:text-[#9BA59D]">
          {tx(
            'The FIT FUEL route you requested does not exist or may have been moved. Return to the homepage or open your dashboard.',
            'आपने जो FIT FUEL पृष्ठ माँगा है वह मौजूद नहीं है या स्थानांतरित हो गया है। होमपेज पर लौटें या अपना डैशबोर्ड खोलें।'
          )}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E2E8DF] dark:border-[#262F35] bg-white dark:bg-[#161B1E] text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tx('Back to Home', 'होम पर वापस जाएँ')}</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B6F23B] text-[#15191C] text-sm font-bold hover:bg-[#A4E028]"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{tx('Open Dashboard', 'डैशबोर्ड खोलें')}</span>
          </Link>
        </div>
      </main>
    </div>
  );
};
