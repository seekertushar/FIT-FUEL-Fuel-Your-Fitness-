import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { BmiCalculatorPage } from './pages/BmiCalculatorPage';
import { DashboardPage } from './pages/DashboardPage';
import { DietPlanPage } from './pages/DietPlanPage';
import { WorkoutPlanPage } from './pages/WorkoutPlanPage';
import { ProgressTrackerPage } from './pages/ProgressTrackerPage';
import { MembershipPaymentPage } from './pages/MembershipPaymentPage';
import { VoiceCoachPage } from './pages/VoiceCoachPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/bmi" element={<BmiCalculatorPage />} />
            <Route path="/diet" element={<DietPlanPage />} />
            <Route path="/workouts" element={<WorkoutPlanPage />} />
            <Route path="/progress" element={<ProgressTrackerPage />} />
            <Route path="/membership" element={<MembershipPaymentPage />} />
            <Route path="/coach" element={<VoiceCoachPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </AppProvider>
    </LanguageProvider>
  );
}
