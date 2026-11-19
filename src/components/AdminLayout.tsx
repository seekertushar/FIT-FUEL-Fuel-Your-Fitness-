import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  UtensilsCrossed,
  Dumbbell,
  Users,
  Settings,
  LogOut,
  ArrowLeftRight,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { LanguageToggle } from './LanguageToggle';

export type AdminTab = 'overview' | 'diets' | 'workouts' | 'members' | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ activeTab, onSelectTab, children }) => {
  const { theme, toggleTheme, switchDemoRole, logout } = useApp();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: Array<{ id: AdminTab; label: string; labelHi: string; icon: React.ComponentType<any> }> = [
    { id: 'overview', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: LayoutGrid },
    { id: 'diets', label: 'Diet Templates', labelHi: 'डाइट टेम्पलेट्स', icon: UtensilsCrossed },
    { id: 'workouts', label: 'Workout Templates', labelHi: 'वर्कआउट टेम्पलेट्स', icon: Dumbbell },
    { id: 'members', label: 'Member Reports', labelHi: 'सदस्य रिपोर्ट्स', icon: Users },
    { id: 'settings', label: 'Settings', labelHi: 'सेटिंग्स', icon: Settings },
  ];

  const handleBackToMember = () => {
    switchDemoRole('member');
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#F1F5F9] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Distinct Slate-Blue Trainer/Admin Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-[#0F172A] text-white border-r border-slate-800">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <Link to="/" aria-label="FIT FUEL Home">
            <BrandLogo variant="admin" size="sm" />
          </Link>
        </div>
        <div className="px-5 py-3 border-b border-slate-800 text-xs text-sky-300 font-medium">
          {language === 'hi' ? 'ट्रेनर और एडमिन कंसोल (डेमो)' : 'Trainer & Admin Console (Demo)'}
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigation">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#38BDF8] text-[#0F172A] font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{language === 'hi' ? item.labelHi : item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={handleBackToMember}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#B6F23B] hover:bg-slate-800 whitespace-nowrap"
          >
            <ArrowLeftRight className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? 'मेंबर डैशबोर्ड' : 'Member Dashboard'}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-slate-800 whitespace-nowrap"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Admin Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-72 max-w-[82vw] bg-[#0F172A] text-white flex flex-col h-full">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
              <BrandLogo variant="admin" size="sm" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin menu"
                className="p-2 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium ${
                      active
                        ? 'bg-[#38BDF8] text-[#0F172A] font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{language === 'hi' ? item.labelHi : item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-slate-800 space-y-1.5">
              <button
                type="button"
                onClick={handleBackToMember}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-[#B6F23B] hover:bg-slate-800"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{language === 'hi' ? 'मेंबर डैशबोर्ड' : 'Member Dashboard'}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-300 hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {language === 'hi'
                  ? 'डेमो भूमिका नियंत्रण · सुरक्षित सर्वर-साइड RBAC के लिए तैयार'
                  : 'Demo Role View · Structured for Server-Side RBAC'}
              </p>
              <h1 className="font-display text-base sm:text-lg font-bold truncate">
                {language === 'hi' ? 'FIT FUEL ट्रेनर एवं एडमिन पोर्टल' : 'FIT FUEL Trainer & Admin Portal'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle variant="slate" />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};
