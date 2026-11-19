import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Calculator,
  Utensils,
  Dumbbell,
  TrendingUp,
  CreditCard,
  Mic,
  Settings,
  LogOut,
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from './BrandLogo';
import { LanguageToggle } from './LanguageToggle';
import { ASSETS } from '../data/sampleData';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  headerAction,
  children,
}) => {
  const {
    user,
    theme,
    toggleTheme,
    notifications,
    markAllNotificationsRead,
    switchDemoRole,
    logout,
  } = useApp();
  const { language, t, tx } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { to: '/dashboard', label: t('sidebarOverview'), icon: LayoutDashboard },
    { to: '/profile', label: t('sidebarProfile'), icon: User },
    { to: '/bmi', label: t('sidebarBmi'), icon: Calculator },
    { to: '/diet', label: t('sidebarDiet'), icon: Utensils },
    { to: '/workouts', label: t('sidebarWorkouts'), icon: Dumbbell },
    { to: '/progress', label: t('sidebarProgress'), icon: TrendingUp },
    { to: '/membership', label: t('sidebarMembership'), icon: CreditCard },
    { to: '/coach', label: t('sidebarVoiceCoach'), icon: Mic },
  ];

  const todayFormatted = new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = (searchValue ?? localSearch).trim().toLowerCase();
    if (!q) return;
    if (q.includes('bmi')) navigate('/bmi');
    else if (q.includes('poha') || q.includes('dal') || q.includes('diet') || q.includes('paneer'))
      navigate('/diet');
    else if (q.includes('squat') || q.includes('workout') || q.includes('cardio'))
      navigate('/workouts');
    else if (q.includes('upi') || q.includes('plan') || q.includes('gst') || q.includes('pay'))
      navigate('/membership');
    else navigate('/progress');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleOpenAdmin = () => {
    switchDemoRole('admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex bg-[#F7F9F5] dark:bg-[#0E1113] text-[#202820] dark:text-[#F3F6F2]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-[#15191C] text-white border-r border-white/10 no-print">
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <Link to="/" aria-label="FIT FUEL Home">
            <BrandLogo variant="light" size="sm" />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Member navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#B6F23B] text-[#15191C] font-semibold'
                      : 'text-[#C5CEC7] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1.5">
          <button
            type="button"
            onClick={handleOpenAdmin}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#7DD3FC] hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('sidebarAdmin')}</span>
          </button>
          <NavLink
            to="/profile"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#C5CEC7] hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('sidebarSettings')}</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#FCA5A5] hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[82vw] bg-[#15191C] text-white flex flex-col h-full">
            <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <BrandLogo variant="light" size="sm" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-white/80 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#B6F23B] text-[#15191C] font-semibold'
                          : 'text-[#C5CEC7] hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/10 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenAdmin();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-[#7DD3FC] hover:bg-white/10"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('sidebarAdmin')}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-[#FCA5A5] hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#161B1E]/95 backdrop-blur border-b border-[#E2E8DF] dark:border-[#262F35] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[#E2E8DF] dark:border-[#262F35] text-[#202820] dark:text-[#F3F6F2]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-[#5B655D] dark:text-[#9BA59D] truncate">
                {todayFormatted} · {user.branchCity}
              </p>
              <h1 className="font-display text-base sm:text-lg font-bold text-[#15191C] dark:text-[#F3F6F2] truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <form onSubmit={handleGlobalSearchSubmit} className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-[#5B655D] dark:text-[#9BA59D] absolute left-3 pointer-events-none" />
              <input
                type="search"
                value={searchValue !== undefined ? searchValue : localSearch}
                onChange={(e) =>
                  onSearchChange ? onSearchChange(e.target.value) : setLocalSearch(e.target.value)
                }
                placeholder={language === 'hi' ? 'खोजें: पोहा, BMI, UPI...' : 'Search meals, BMI, UPI...'}
                aria-label="Search FIT FUEL"
                className="w-52 xl:w-64 pl-9 pr-3 py-1.5 text-sm rounded-lg bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] text-[#202820] dark:text-[#F3F6F2] placeholder:text-[#777F78] focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
              />
            </form>

            {/* EN / Hindi Switcher */}
            <LanguageToggle />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 rounded-lg border border-[#E2E8DF] dark:border-[#262F35] text-[#202820] dark:text-[#F3F6F2] hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Toggle notifications"
                className="relative p-2 rounded-lg border border-[#E2E8DF] dark:border-[#262F35] text-[#202820] dark:text-[#F3F6F2] hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] text-[10px] font-mono font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] shadow-xl p-4 z-40">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8DF] dark:border-[#262F35]">
                    <span className="font-display font-semibold text-sm">
                      {tx('Notifications', 'सूचनाएँ')}
                    </span>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-medium text-[#15803D] dark:text-[#B6F23B] hover:underline"
                    >
                      {tx('Mark all read', 'सभी पढ़ा चिह्नित करें')}
                    </button>
                  </div>
                  <div className="mt-2 divide-y divide-[#E2E8DF] dark:divide-[#262F35] max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[#15191C] dark:text-[#F3F6F2]">
                            {language === 'hi' ? n.titleHi : n.title}
                          </p>
                          <span className="text-[11px] text-[#5B655D] dark:text-[#9BA59D] shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D] leading-relaxed">
                          {language === 'hi' ? n.messageHi : n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Link */}
            <Link
              to="/profile"
              aria-label="Open my profile"
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A] transition-colors"
            >
              <img
                src={ASSETS.memberAvatar}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-cover border border-[#E2E8DF] dark:border-[#262F35]"
              />
              <span className="hidden xl:block text-sm font-semibold text-[#15191C] dark:text-[#F3F6F2] max-w-[120px] truncate">
                {user.fullName}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {(subtitle || headerAction) && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {subtitle && (
                <p className="text-sm text-[#5B655D] dark:text-[#9BA59D] max-w-2xl">{subtitle}</p>
              )}
              {headerAction && <div className="shrink-0">{headerAction}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
