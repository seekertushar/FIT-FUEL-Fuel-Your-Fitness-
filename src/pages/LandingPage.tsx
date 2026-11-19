import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  Utensils,
  Dumbbell,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Check,
  ChevronDown,
  MapPin,
  Phone,
  Clock,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { BrandLogo } from '../components/BrandLogo';
import { LanguageToggle } from '../components/LanguageToggle';
import { ASSETS, INDIAN_BRANCHES, MEMBERSHIP_PLANS } from '../data/sampleData';
import { formatInr } from '../services/progressService';

const FAQS = [
  {
    q: 'Are FIT FUEL diet and workout plans rule-based and safe for everyday Indian routines?',
    qHi: 'क्या FIT FUEL के डाइट और वर्कआउट प्लान भारतीय दिनचर्या के लिए सुरक्षित और नियम-आधारित हैं?',
    a: 'Yes. Every diet and workout schedule is selected using structured, transparent rules based on your dietary preference (Vegetarian, Non-Vegetarian, Vegan, or Balanced), fitness experience, and allergies—featuring everyday Indian foods like poha, idli-sambar, dal-roti, paneer, and sprouts without extreme restrictions.',
    aHi: 'हाँ। प्रत्येक डाइट और वर्कआउट प्लान आपकी आहार पसंद (शाकाहारी, मांसाहारी, वीगन), अनुभव और एलर्जी के आधार पर पारदर्शी नियमों से चुना जाता है, जिसमें पोहा, इडली-सांभर, दाल-रोटी, पनीर और अंकुरित अनाज शामिल हैं।',
  },
  {
    q: 'How does FIT FUEL handle members under 18 years of age?',
    qHi: 'FIT FUEL 18 वर्ष से कम आयु के सदस्यों के लिए क्या सुरक्षा नियम अपनाता है?',
    a: 'For anyone under 18, FIT FUEL automatically disables adult BMI categories and weight-loss or weight-gain goals, providing only general age-appropriate wellness education and recommending guidance from a qualified doctor and trusted adult.',
    aHi: '18 वर्ष से कम आयु के सदस्यों के लिए वयस्क BMI श्रेणियाँ और वज़न घटाने/बढ़ाने के लक्ष्य स्वतः बंद रहते हैं। केवल सामान्य स्वास्थ्य जानकारी और योग्य चिकित्सक व अभिभावक से परामर्श की सलाह दी जाती है।',
  },
  {
    q: 'Which Indian payment methods are supported for gym memberships?',
    qHi: 'जिम मेंबरशिप के लिए कौन-से भारतीय भुगतान विकल्प उपलब्ध हैं?',
    a: 'You can pay in ₹ INR via UPI apps (Google Pay, PhonePe, Paytm), UPI ID, RuPay / Visa / Mastercard debit & credit cards, or Indian NetBanking (HDFC, SBI, ICICI), with an instant 18% GST breakdown receipt.',
    aHi: 'आप ₹ INR में UPI ऐप्स (Google Pay, PhonePe, Paytm), UPI ID, RuPay कार्ड या भारतीय नेटबैंकिंग (HDFC, SBI, ICICI) से भुगतान कर सकते हैं और तुरंत 18% GST चालान प्राप्त कर सकते हैं।',
  },
  {
    q: 'Can I switch the interface between English and Hindi anytime?',
    qHi: 'क्या मैं कभी भी अंग्रेज़ी और हिंदी भाषा के बीच बदल सकता हूँ?',
    a: 'Yes. Use the EN / हिंदी toggle in the top header or inside your dashboard to switch navigation, labels, meal titles, and membership details instantly.',
    aHi: 'हाँ। ऊपर दिए गए EN / हिंदी बटन से आप कभी भी नेविगेशन, डाइट शीर्षक और डैशबोर्ड भाषा तुरंत बदल सकते हैं।',
  },
];

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme, addToast, demoLogin, isAuthenticated } = useApp();
  const { language, t, tx } = useLanguage();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    city: INDIAN_BRANCHES[0].city,
    message: '',
  });
  const [contactError, setContactError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const features = [
    {
      icon: Calculator,
      num: '01',
      title: language === 'hi' ? 'BMI कैलकुलेटर' : 'BMI Calculator',
      desc:
        language === 'hi'
          ? 'आयु-सुरक्षित BMI गणना, वयस्क संदर्भ बार और स्पष्ट स्वास्थ्य अस्वीकरण के साथ।'
          : 'Instant metric BMI calculation with adult reference ranges, visual scale, and built-in under-18 safety rules.',
    },
    {
      icon: Utensils,
      num: '02',
      title: language === 'hi' ? 'भारतीय डाइट प्लान' : 'Indian Diet Plans',
      desc:
        language === 'hi'
          ? 'पोहा, इडली-सांभर, दाल-रोटी, पनीर और स्प्राउट्स के साथ 7-दिवसीय शाकाहारी, मांसाहारी व वीगन भोजन।'
          : 'Structured 7-day Indian meal plans—poha, idli-sambar, dal-roti, paneer, curd, and sprouts—filtered by preference and allergies.',
    },
    {
      icon: Dumbbell,
      num: '03',
      title: language === 'hi' ? 'वर्कआउट प्लानर' : 'Workout Planner',
      desc:
        language === 'hi'
          ? 'सोमवार से रविवार तक 6 श्रेणियों और 3 स्तरों में सुरक्षित प्रशिक्षण शेड्यूल।'
          : 'Six exercise categories across Beginner, Intermediate, and Advanced templates with dedicated Sunday active rest.',
    },
    {
      icon: TrendingUp,
      num: '04',
      title: language === 'hi' ? 'प्रगति ट्रैकिंग' : 'Progress Tracking',
      desc:
        language === 'hi'
          ? 'वज़न, कमर और माप का इतिहास संपादित करें और साप्ताहिक/मासिक ग्राफ़ देखें।'
          : 'Log periodic weight, body measurements, and notes synced directly into interactive Recharts weekly, monthly, and yearly graphs.',
    },
    {
      icon: LayoutDashboard,
      num: '05',
      title: language === 'hi' ? 'फ़िटनेस डैशबोर्ड' : 'Fitness Dashboard',
      desc:
        language === 'hi'
          ? 'आज के भोजन, वर्कआउट, साप्ताहिक कैलेंडर और प्रिंट करने योग्य रिपोर्ट का एकीकृत दृश्य।'
          : 'A unified member workspace showing BMI overview, daily meal/workout checklists, activity streaks, and printable reports.',
    },
    {
      icon: ShieldCheck,
      num: '06',
      title: language === 'hi' ? 'ट्रेनर व एडमिन प्रबंधन' : 'Trainer Management',
      desc:
        language === 'hi'
          ? 'ट्रेनर कंसोल से नए डाइट व वर्कआउट टेम्पलेट जोड़ें और सदस्य रिपोर्ट देखें।'
          : 'Dedicated trainer and admin console to add, edit, or delete diet and workout templates and review member summaries.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: language === 'hi' ? 'अपना खाता बनाएँ' : 'Create Your Account',
      desc:
        language === 'hi'
          ? 'Google साइन-इन या डेमो पंजीकरण से कुछ सेकंड में शुरुआत करें।'
          : 'Register with demo onboarding or sign in with Google to sync your records securely.',
    },
    {
      step: '02',
      title: language === 'hi' ? 'अपना फिटनेस विवरण दर्ज करें' : 'Enter Your Fitness Details',
      desc:
        language === 'hi'
          ? 'आयु, ऊँचाई (सेमी), वज़न (किग्रा), आहार पसंद और शहर की शाखा चुनें।'
          : 'Provide your age, height (cm), weight (kg), Indian city branch, dietary preference, and allergies.',
    },
    {
      step: '03',
      title: language === 'hi' ? 'अपना फिटनेस लक्ष्य चुनें' : 'Select Your Fitness Goal',
      desc:
        language === 'hi'
          ? 'संतुलित फिटनेस, वज़न प्रबंधन या स्ट्रेंथ लक्ष्य चुनें (18 से कम आयु के लिए सुरक्षित सुरक्षा)।'
          : 'Choose Weight Loss, Weight Gain, Maintenance, or General Fitness—with automatic under-18 safeguards.',
    },
    {
      step: '04',
      title: language === 'hi' ? 'प्लान अपनाएँ और प्रगति ट्रैक करें' : 'Follow Plans & Track Progress',
      desc:
        language === 'hi'
          ? 'दैनिक भोजन व वर्कआउट पूरे करें, माप दर्ज करें और UPI मेंबरशिप प्रबंधित करें।'
          : 'Check off daily Indian meals and workouts, chart weekly trends, and manage ₹ INR UPI memberships.',
    },
  ];

  const handleQuickDemoDashboard = () => {
    demoLogin('aarav.sharma@fitfuel.in', 'member', false);
    navigate('/dashboard');
  };

  const handleSelectPlanFromLanding = (planId: string) => {
    if (!isAuthenticated) {
      demoLogin('aarav.sharma@fitfuel.in', 'member', false);
    }
    navigate(`/membership?plan=${planId}`);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    if (!contactForm.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim()) || contactForm.message.trim().length < 10) {
      setContactError(
        language === 'hi'
          ? 'कृपया नाम, सही ईमेल और कम से कम 10 अक्षरों का संदेश दर्ज करें।'
          : 'Please enter your name, a valid email address, and a message of at least 10 characters.'
      );
      return;
    }
    setContactSubmitted(true);
    addToast('success', language === 'hi' ? 'आपका संदेश प्राप्त हुआ! हमारी टीम शीघ्र संपर्क करेगी।' : 'Inquiry received! Our branch team will reach out shortly.');
    setContactForm({ name: '', email: '', city: INDIAN_BRANCHES[0].city, message: '' });
  };

  return (
    <div id="top" className="min-h-screen bg-[#F7F9F5] dark:bg-[#0E1113] text-[#202820] dark:text-[#F3F6F2]">
      {/* Sticky Single-Row 3-Zone Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#15191C]/95 backdrop-blur border-b border-[#E2E8DF] dark:border-[#262F35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand */}
          <Link to="/" aria-label="FIT FUEL Home">
            <BrandLogo size="md" />
          </Link>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#5B655D] dark:text-[#C5CEC7]" aria-label="Main navigation">
            <a href="#top" className="hover:text-[#15191C] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              {t('navHome')}
            </a>
            <a href="#features" className="hover:text-[#15191C] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              {t('navFeatures')}
            </a>
            <a href="#how-it-works" className="hover:text-[#15191C] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              {t('navHowItWorks')}
            </a>
            <a href="#plans" className="hover:text-[#15191C] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              {t('navPlans')}
            </a>
            <a href="#about" className="hover:text-[#15191C] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              {t('navAbout')}
            </a>
            <a href="#contact" className="hover:text-[#15191C] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              {t('navContact')}
            </a>
          </nav>

          {/* Zone 3: Language + Auth CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <LanguageToggle />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden sm:inline-flex p-2 rounded-lg border border-[#E2E8DF] dark:border-[#262F35] text-[#202820] dark:text-[#F3F6F2] hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A] transition-colors shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex px-3.5 py-2 text-sm font-semibold text-[#15191C] dark:text-[#F3F6F2] hover:underline whitespace-nowrap shrink-0"
            >
              {t('login')}
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            >
              <span>{t('getStarted')}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle mobile menu"
              className="lg:hidden p-2 rounded-lg border border-[#E2E8DF] dark:border-[#262F35]"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-[#E2E8DF] dark:border-[#262F35] bg-white dark:bg-[#15191C] px-4 py-4 space-y-2">
            {[
              { href: '#top', label: t('navHome') },
              { href: '#features', label: t('navFeatures') },
              { href: '#how-it-works', label: t('navHowItWorks') },
              { href: '#plans', label: t('navPlans') },
              { href: '#about', label: t('navAbout') },
              { href: '#contact', label: t('navContact') },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-[#202820] dark:text-[#F3F6F2]"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 flex items-center gap-3 border-t border-[#E2E8DF] dark:border-[#262F35]">
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg border border-[#E2E8DF] dark:border-[#262F35] text-sm font-semibold"
              >
                {t('login')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  handleQuickDemoDashboard();
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#B6F23B] text-[#15191C] text-sm font-semibold"
              >
                {language === 'hi' ? 'डेमो डैशबोर्ड' : 'Try Demo'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#15191C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs sm:text-sm font-medium text-[#B6F23B] tracking-wide">
                {t('heroLocationNote')}
              </p>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight text-balance">
                {t('heroTitle')}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-[#C5CEC7] leading-relaxed max-w-xl">
                {t('heroSubtitle')}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#B6F23B] text-[#15191C] font-semibold text-sm sm:text-base hover:bg-[#A4E028] transition-colors whitespace-nowrap"
                >
                  <span>{t('getStarted')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-white/25 text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  <span>{t('exploreFeatures')}</span>
                </a>
                <button
                  type="button"
                  onClick={handleQuickDemoDashboard}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-[#B6F23B] hover:underline whitespace-nowrap"
                >
                  <span>{tx('Open Demo Dashboard', 'सीधे डेमो डैशबोर्ड खोलें')}</span>
                </button>
              </div>

              <p className="mt-6 text-xs text-[#9BA59D]">
                {t('tagline')}
              </p>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="relative w-full min-h-[280px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-white/10 bg-[#1E252A]">
                <img
                  src={ASSETS.heroGym}
                  alt="FIT FUEL modern Indian fitness studio with strength racks and natural daylight"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 sm:p-6">
                  <p className="text-xs text-[#B6F23B] font-medium">
                    {language === 'hi' ? 'इंदिरानगर, बेंगलुरु · बांद्रा, मुंबई · कनॉट प्लेस, दिल्ली' : 'Indiranagar, Bengaluru · Bandra West, Mumbai · Connaught Place, Delhi'}
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-semibold text-white">
                    {language === 'hi'
                      ? 'स्ट्रेंथ प्रशिक्षण, भारतीय घर का भोजन और वास्तविक प्रगति ट्रैकिंग'
                      : 'Strength coaching, balanced Indian meals, and measurable progress tracking'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quantified Proof Strip (Full-Width Row Below Split) */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-[#B6F23B] tabular-nums">
                {tx('5 Cities', '5 शहर')}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#C5CEC7]">
                {tx('Active Indian metro branches', 'प्रमुख भारतीय महानगर शाखाएँ')}
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {tx('35+ Meals', '35+ भोजन')}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#C5CEC7]">
                {tx('Indian Veg, Non-Veg & Vegan templates', 'भारतीय शाकाहारी, मांसाहारी व वीगन विकल्प')}
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">₹1,999+</p>
              <p className="mt-1 text-xs sm:text-sm text-[#C5CEC7]">
                {tx('Transparent INR plans with UPI & GST', 'पारदर्शी UPI व GST मेंबरशिप प्लान')}
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">EN / हिंदी</p>
              <p className="mt-1 text-xs sm:text-sm text-[#C5CEC7]">
                {tx('Full bilingual member & admin UI', 'पूर्ण द्विभाषी इंटरफ़ेस')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
            {tx('Core Platform Modules', 'मुख्य क्षमताएँ')}
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#15191C] dark:text-[#F3F6F2] text-balance">
            {t('featuresHeading')}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.num}
                className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 flex flex-col justify-between hover:border-[#15191C]/30 dark:hover:border-[#B6F23B]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F9F5] dark:bg-[#1E252A] flex items-center justify-center text-[#15191C] dark:text-[#B6F23B]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs text-[#5B655D] dark:text-[#9BA59D]">
                      {feat.num}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                    {feat.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#5B655D] dark:text-[#9BA59D]">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Editorial Feature Showcase */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] grid grid-cols-1 sm:grid-cols-5">
            <div className="sm:col-span-2 min-h-[200px]">
              <img
                src={ASSETS.indianMeal}
                alt="Balanced Indian fitness thali with paneer, moong dal, rotis, poha, and sprouts"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-3 p-6 flex flex-col justify-center">
              <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
                {language === 'hi' ? 'भारतीय रसोई आधारित आहार' : 'Everyday Indian Nutrition'}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                {language === 'hi' ? 'पोहा, दाल-रोटी और पनीर के साथ व्यावहारिक डाइट' : 'Practical Meals Built Around Real Indian Kitchens'}
              </h3>
              <p className="mt-2 text-sm text-[#5B655D] dark:text-[#9BA59D] leading-relaxed">
                {language === 'hi'
                  ? 'कोई चरम डाइटिंग नहीं—हर दिन के लिए 5 संतुलित भोजन स्लॉट, एलर्जी चेतावनी और पूर्णता ट्रैकिंग।'
                  : 'No extreme fasting or crash deficits. Switch Monday to Sunday, filter Veg/Non-Veg/Vegan, flag allergies, and mark meals done.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] grid grid-cols-1 sm:grid-cols-5">
            <div className="sm:col-span-2 min-h-[200px]">
              <img
                src={ASSETS.strengthWorkout}
                alt="Strength training dumbbells and kettlebells on dark gym flooring"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-3 p-6 flex flex-col justify-center">
              <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
                {language === 'hi' ? 'सोमवार से रविवार प्रशिक्षण' : 'Structured Weekly Splits'}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                {language === 'hi' ? 'शुरुआती से उन्नत स्तर तक सुरक्षित वर्कआउट' : 'Beginner to Advanced Routines With Rest Days'}
              </h3>
              <p className="mt-2 text-sm text-[#5B655D] dark:text-[#9BA59D] leading-relaxed">
                {language === 'hi'
                  ? 'फुल बॉडी, अपर बॉडी, लोअर बॉडी, कार्डियो, स्ट्रेंथ और सूर्य नमस्कार मोबिलिटी सत्र।'
                  : 'Clear sets, reps, target muscle groups, and Sunday active recovery built for sustainable long-term strength.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section id="how-it-works" className="bg-white dark:bg-[#161B1E] border-y border-[#E2E8DF] dark:border-[#262F35] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
              {language === 'hi' ? 'प्रक्रिया' : 'How It Works'}
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#15191C] dark:text-[#F3F6F2] text-balance">
              {t('howItWorksHeading')}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-6"
              >
                <span className="font-mono text-2xl font-bold text-[#15803D] dark:text-[#B6F23B]">
                  {s.step}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-[#15191C] dark:text-[#F3F6F2]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-[#5B655D] dark:text-[#9BA59D] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Indian ₹ INR Gym Membership Plans */}
      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
            {tx('Indian Gym Memberships · UPI / RuPay / GST', 'भारतीय जिम मेंबरशिप · UPI / RuPay / GST')}
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#15191C] dark:text-[#F3F6F2] text-balance">
            {t('plansHeading')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5B655D] dark:text-[#9BA59D]">
            {t('plansSubheading')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {MEMBERSHIP_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-7 flex flex-col justify-between border ${
                plan.popular
                  ? 'bg-[#15191C] text-white border-[#15191C]'
                  : 'bg-white dark:bg-[#161B1E] text-[#202820] dark:text-[#F3F6F2] border-[#E2E8DF] dark:border-[#262F35]'
              }`}
            >
              <div>
                <p
                  className={`text-xs font-semibold ${
                    plan.popular ? 'text-[#B6F23B]' : 'text-[#15803D] dark:text-[#B6F23B]'
                  }`}
                >
                  {language === 'hi' ? plan.audienceHi : plan.audience}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold">
                  {language === 'hi' ? plan.nameHi : plan.name}
                </h3>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold tabular-nums">
                    {formatInr(plan.priceInr)}
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs ${
                    plan.popular ? 'text-[#C5CEC7]' : 'text-[#5B655D] dark:text-[#9BA59D]'
                  }`}
                >
                  {language === 'hi' ? plan.billingLabelHi : plan.billingLabel}
                </p>

                <ul className="mt-6 space-y-3">
                  {(language === 'hi' ? plan.featuresHi : plan.features).map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm leading-snug">
                      <Check
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          plan.popular ? 'text-[#B6F23B]' : 'text-[#15803D] dark:text-[#B6F23B]'
                        }`}
                      />
                      <span className={plan.popular ? 'text-[#E2E8DF]' : ''}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPlanFromLanding(plan.id)}
                className={`mt-8 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                  plan.popular
                    ? 'bg-[#B6F23B] text-[#15191C] hover:bg-[#A4E028]'
                    : 'bg-[#15191C] dark:bg-white text-white dark:text-[#15191C] hover:opacity-90'
                }`}
              >
                {t('payWithUpi')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About & Testimonials */}
      <section id="about" className="bg-white dark:bg-[#161B1E] border-y border-[#E2E8DF] dark:border-[#262F35] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
              {tx('About FIT FUEL India', 'FIT FUEL के बारे में')}
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#15191C] dark:text-[#F3F6F2] text-balance">
              {tx(
                'Built for Sustainable Strength, Everyday Indian Meals, and Clear Data',
                'अनुशासित स्वास्थ्य प्रबंधन, भारत की जीवनशैली के अनुसार'
              )}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5B655D] dark:text-[#9BA59D] leading-relaxed">
              {tx(
                'FIT FUEL brings members and certified Indian gym trainers together around one clean source of truth. Rather than confusing fad diets, we organize practical home-cooked Indian templates, safe rule-based workout splits, and honest progress charts.',
                'FIT FUEL जिम सदस्यों और ट्रेनरों को एक पारदर्शी प्लेटफ़ॉर्म देता है—जहाँ BMI, भारतीय भोजन योजना, साप्ताहिक वर्कआउट और प्रगति चार्ट एक ही डेटा स्रोत से जुड़े हैं।'
              )}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-4">
                <p className="text-sm text-[#202820] dark:text-[#F3F6F2] leading-relaxed">
                  {tx(
                    '"Switching from random gym notes to FIT FUEL\'s Indiranagar plan helped me log 42 sessions in 12 weeks while sticking to simple South Indian vegetarian meals."',
                    '"FIT FUEL के इंदिरानगर प्लान से मैंने 12 सप्ताह में 42 वर्कआउट सत्र पूरे किए और सरल दक्षिण भारतीय शाकाहारी भोजन जारी रखा।"'
                  )}
                </p>
                <p className="mt-3 text-xs font-semibold text-[#15191C] dark:text-white">
                  {tx('Priya Nair · Product Manager, Bengaluru', 'प्रिया नायर · प्रोडक्ट मैनेजर, बेंगलुरु')}
                </p>
              </div>
              <div className="rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-4">
                <p className="text-sm text-[#202820] dark:text-[#F3F6F2] leading-relaxed">
                  {tx(
                    '"The Hindi interface and ₹4,999 UPI GST receipt made renewing our family membership in Pune effortless."',
                    '"हिंदी इंटरफ़ेस और ₹4,999 की UPI GST रसीद ने पुणे में हमारी पारिवारिक मेंबरशिप नवीनीकरण को बेहद आसान बना दिया।"'
                  )}
                </p>
                <p className="mt-3 text-xs font-semibold text-[#15191C] dark:text-white">
                  {tx('Rohan Deshmukh · Civil Engineer, Pune', 'रोहन देशमुख · सिविल इंजीनियर, पुणे')}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-[#E2E8DF] dark:border-[#262F35] aspect-[4/3]">
              <img
                src={ASSETS.mobilityWorkout}
                alt="Sunlit Indian wellness and mobility training studio with mat and foam roller"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h2 className="font-display text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
          {t('faqHeading')}
        </h2>
        <div className="mt-8 divide-y divide-[#E2E8DF] dark:divide-[#262F35] border-y border-[#E2E8DF] dark:border-[#262F35]">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-display font-semibold text-base text-[#15191C] dark:text-[#F3F6F2]">
                    {language === 'hi' ? faq.qHi : faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-[#5B655D] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm leading-relaxed text-[#5B655D] dark:text-[#9BA59D]">
                    {language === 'hi' ? faq.aHi : faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact & Indian Branches */}
      <section id="contact" className="bg-white dark:bg-[#161B1E] border-t border-[#E2E8DF] dark:border-[#262F35] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-3xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
              {t('contactHeading')}
            </h2>
            <p className="mt-3 text-sm text-[#5B655D] dark:text-[#9BA59D]">
              {language === 'hi'
                ? 'भारत के 5 प्रमुख शहरों में हमारी आधुनिक शाखाओं पर निःशुल्क ट्रायल बुक करें।'
                : 'Walk in for a complimentary equipment orientation or nutrition template review at any FIT FUEL India studio.'}
            </p>
            <div className="mt-6 space-y-4">
              {INDIAN_BRANCHES.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-4"
                >
                  <p className="font-display font-semibold text-sm text-[#15191C] dark:text-[#F3F6F2]">
                    {b.city}
                  </p>
                  <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{b.address}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#5B655D] dark:text-[#9BA59D]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {b.timings}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5" /> {b.phone}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-6 sm:p-8">
              <h3 className="font-display text-xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                {language === 'hi' ? 'संपर्क फ़ॉर्म' : 'Send an Inquiry'}
              </h3>
              {contactSubmitted && (
                <div className="mt-4 rounded-xl bg-[#DCFCE7] dark:bg-[#143321] border border-[#15803D]/30 p-3.5 text-sm text-[#15803D] dark:text-[#86EFAC]">
                  {language === 'hi'
                    ? 'धन्यवाद! आपकी पूछताछ दर्ज कर ली गई है।'
                    : 'Thank you! Your inquiry has been logged for our India branch desk.'}
                </div>
              )}
              {contactError && (
                <div className="mt-4 rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] p-3.5 text-sm text-[#B91C1C] dark:text-[#FCA5A5]">
                  {contactError}
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="mt-5 space-y-4" noValidate>
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold mb-1.5">
                    {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Siddharth Kulkarni"
                    className="w-full rounded-xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold mb-1.5">
                    {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="name@example.in"
                    className="w-full rounded-xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-branch" className="block text-xs font-semibold mb-1.5">
                    {language === 'hi' ? 'पसंदीदा शाखा' : 'Preferred Branch'}
                  </label>
                  <select
                    id="contact-branch"
                    value={contactForm.city}
                    onChange={(e) => setContactForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full rounded-xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                  >
                    {INDIAN_BRANCHES.map((b) => (
                      <option key={b.id} value={b.city}>
                        {b.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-msg" className="block text-xs font-semibold mb-1.5">
                    {language === 'hi' ? 'संदेश' : 'Message'}
                  </label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder={
                      language === 'hi'
                        ? 'अपना प्रश्न या ट्रायल अनुरोध लिखें...'
                        : 'Ask about membership schedules, corporate plans, or beginner induction...'
                    }
                    className="w-full rounded-xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {language === 'hi' ? 'संदेश भेजें' : 'Submit Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#15191C] text-[#C5CEC7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            <div className="md:col-span-2">
              <BrandLogo variant="light" size="md" />
              <p className="mt-3 text-sm text-[#9BA59D] max-w-md leading-relaxed">
                {t('tagline')}{' '}
                {tx(
                  'Built for Indian gym members and trainers with transparent rule-based nutrition, workout planning, and ₹ INR GST billing.',
                  'भारतीय जिम सदस्यों और ट्रेनरों के लिए नियम-आधारित पोषण, वर्कआउट प्लानिंग और ₹ INR GST बिलिंग के साथ निर्मित।'
                )}
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm">
                {tx('Platform', 'प्लेटफ़ॉर्म')}
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link to="/bmi" className="hover:text-white">{t('sidebarBmi')}</Link></li>
                <li><Link to="/diet" className="hover:text-white">{t('sidebarDiet')}</Link></li>
                <li><Link to="/workouts" className="hover:text-white">{t('sidebarWorkouts')}</Link></li>
                <li><Link to="/membership" className="hover:text-white">{t('sidebarMembership')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-sm">
                {tx('Access', 'खाता')}
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white">{t('register')}</Link></li>
                <li><Link to="/login" className="hover:text-white">{t('login')}</Link></li>
                <li><Link to="/admin" className="hover:text-white">{t('sidebarAdmin')}</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">{t('sidebarOverview')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#9BA59D]">
            <p>
              © {new Date().getFullYear()}{' '}
              {tx(
                'FIT FUEL Wellness India Pvt. Ltd. · General fitness & educational guidance only; not medical advice.',
                'FIT FUEL वेलनेस इंडिया प्रा. लि. · केवल सामान्य फिटनेस व शैक्षिक जानकारी; चिकित्सकीय सलाह नहीं।'
              )}
            </p>
            <p>{tx('GSTIN (Demo): 29AABCF1234K1Z5 · Bengaluru, India', 'GSTIN (डेमो): 29AABCF1234K1Z5 · बेंगलुरु, भारत')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
