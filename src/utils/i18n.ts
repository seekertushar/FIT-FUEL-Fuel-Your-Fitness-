import { Language } from '../types/fitfuel';

export interface BilingualEntry {
  en: string;
  hi: string;
}

export const TRANSLATIONS: Record<string, BilingualEntry> = {
  // Brand & Top Nav
  tagline: {
    en: 'Fuel Your Fitness. Track Your Progress. Transform Your Lifestyle.',
    hi: 'अपनी फिटनेस को सही ऊर्जा दें। अपनी प्रगति ट्रैक करें। अपनी जीवनशैली बदलें।',
  },
  navHome: { en: 'Home', hi: 'होम' },
  navFeatures: { en: 'Features', hi: 'विशेषताएँ' },
  navHowItWorks: { en: 'How It Works', hi: 'कैसे काम करता है' },
  navPlans: { en: 'Plans (₹)', hi: 'प्लान्स (₹)' },
  navAbout: { en: 'About', hi: 'हमारे बारे में' },
  navContact: { en: 'Contact', hi: 'संपर्क' },
  login: { en: 'Login', hi: 'लॉगिन' },
  register: { en: 'Register', hi: 'पंजीकरण' },
  getStarted: { en: 'Get Started', hi: 'शुरू करें' },
  exploreFeatures: { en: 'Explore Features', hi: 'विशेषताएँ देखें' },

  // Hero & Landing
  heroTitle: {
    en: 'Your Fitness Journey, Powered by the Right Fuel.',
    hi: 'सही पोषण और प्रशिक्षण के साथ आपकी फिटनेस यात्रा।',
  },
  heroSubtitle: {
    en: 'Organize your Indian diet plans, structured gym workouts, BMI screening, body measurements, and UPI memberships in one focused workspace built for Indian fitness enthusiasts.',
    hi: 'भारतीय डाइट प्लान, व्यवस्थित जिम वर्कआउट, BMI जाँच, शरीर के माप और UPI मेंबरशिप को एक ही आधुनिक प्लेटफ़ॉर्म पर प्रबंधित करें।',
  },
  heroLocationNote: {
    en: 'Bengaluru · Mumbai · New Delhi · Hyderabad · Pune',
    hi: 'बेंगलुरु · मुंबई · नई दिल्ली · हैदराबाद · पुणे',
  },
  featuresHeading: {
    en: 'Everything needed for disciplined training and everyday Indian nutrition',
    hi: 'अनुशासित प्रशिक्षण और भारतीय पोषण के लिए हर ज़रूरी टूल',
  },
  howItWorksHeading: {
    en: 'Four structured steps from sign-up to measurable progress',
    hi: 'साइन-अप से मापने योग्य प्रगति तक चार सरल चरण',
  },
  plansHeading: {
    en: 'Transparent Indian Gym Memberships in ₹ INR',
    hi: 'पारदर्शी भारतीय जिम मेंबरशिप (₹ INR में)',
  },
  plansSubheading: {
    en: 'Instant UPI (GPay, PhonePe, Paytm), RuPay card, and NetBanking checkout with 18% GST tax invoice.',
    hi: 'तुरंत UPI (GPay, PhonePe, Paytm), RuPay कार्ड और नेटबैंकिंग भुगतान, 18% GST चालान के साथ।',
  },
  faqHeading: {
    en: 'Frequently Asked Questions',
    hi: 'अक्सर पूछे जाने वाले प्रश्न',
  },
  contactHeading: {
    en: 'Visit a FIT FUEL Branch or Write to Us',
    hi: 'FIT FUEL शाखा पर आएँ या हमसे संपर्क करें',
  },

  // Sidebar & Navigation
  sidebarOverview: { en: 'Overview', hi: 'डैशबोर्ड' },
  sidebarProfile: { en: 'My Profile', hi: 'मेरी प्रोफ़ाइल' },
  sidebarBmi: { en: 'BMI Calculator', hi: 'BMI कैलकुलेटर' },
  sidebarDiet: { en: 'Diet Plans', hi: 'डाइट प्लान' },
  sidebarWorkouts: { en: 'Workout Plans', hi: 'वर्कआउट प्लान' },
  sidebarProgress: { en: 'Progress Tracker', hi: 'प्रगति ट्रैकर' },
  sidebarMembership: { en: 'Membership & UPI', hi: 'मेंबरशिप व UPI' },
  sidebarVoiceCoach: { en: 'Live Voice Coach', hi: 'लाइव वॉइस कोच' },
  sidebarAdmin: { en: 'Trainer / Admin', hi: 'ट्रेनर / एडमिन' },
  sidebarSettings: { en: 'Settings', hi: 'सेटिंग्स' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },

  // Dashboard
  welcomeBack: { en: 'Welcome back', hi: 'वापसी पर स्वागत है' },
  currentBmi: { en: 'Current BMI', hi: 'वर्तमान BMI' },
  fitnessGoal: { en: 'Fitness Goal', hi: 'फिटनेस लक्ष्य' },
  latestWeight: { en: 'Latest Weight', hi: 'नवीनतम वज़न' },
  workoutsLogged: { en: 'Workouts Logged', hi: 'पूर्ण वर्कआउट' },
  progressRecords: { en: 'Progress Records', hi: 'प्रगति रिकॉर्ड' },
  todaysActivity: { en: "Today's Activity", hi: 'आज की गतिविधि' },
  todaysMeals: { en: "Today's Diet Preview", hi: 'आज का आहार शेड्यूल' },
  todaysWorkout: { en: "Today's Workout Preview", hi: 'आज का वर्कआउट' },
  quickActions: { en: 'Quick Actions', hi: 'त्वरित कार्य' },
  printReport: { en: 'Print Report', hi: 'रिपोर्ट प्रिंट करें' },
  weeklyActivity: { en: 'Weekly Activity Calendar', hi: 'साप्ताहिक गतिविधि कैलेंडर' },
  journeyTimeline: { en: 'Fitness Journey Timeline', hi: 'फिटनेस यात्रा टाइमलाइन' },
  profileCompletion: { en: 'Profile Completion', hi: 'प्रोफ़ाइल पूर्णता' },

  // Common Actions & Labels
  saveChanges: { en: 'Save Changes', hi: 'परिवर्तन सहेजें' },
  confirm: { en: 'Confirm', hi: 'पुष्टि करें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  deleteLabel: { en: 'Delete', hi: 'हटाएँ' },
  editLabel: { en: 'Edit', hi: 'संपादित करें' },
  backLabel: { en: 'Back', hi: 'पीछे' },
  continueLabel: { en: 'Continue', hi: 'आगे बढ़ें' },
  addRecord: { en: 'Add Progress Record', hi: 'नया रिकॉर्ड जोड़ें' },
  markCompleted: { en: 'Mark Completed', hi: 'पूर्ण चिह्नित करें' },
  completed: { en: 'Completed', hi: 'पूर्ण' },
  calculateBmi: { en: 'Calculate BMI', hi: 'BMI गणना करें' },
  payWithUpi: { en: 'Pay with UPI / Card', hi: 'UPI / कार्ड से भुगतान करें' },
  resetDemo: { en: 'Reset Demo Data', hi: 'डेमो डेटा रीसेट करें' },
  continueWithGoogle: { en: 'Continue with Google', hi: 'Google के साथ जारी रखें' },
  allDays: { en: 'All Days', hi: 'सभी दिन' },
  fullPlan: { en: 'Full Plan', hi: 'पूरा प्लान' },
  weekly: { en: 'Weekly', hi: 'साप्ताहिक' },
  monthly: { en: 'Monthly', hi: 'मासिक' },
  yearly: { en: 'Yearly', hi: 'वार्षिक' },
  today: { en: 'Today', hi: 'आज' },
  done: { en: 'Done', hi: 'पूर्ण' },
  all: { en: 'All', hi: 'सभी' },
  switchLanguageLabel: {
    en: 'Switch application language between English and Hindi',
    hi: 'ऐप की भाषा अंग्रेज़ी और हिंदी के बीच बदलें',
  },
  stepCounter: {
    en: 'Step {step} of {total}',
    hi: 'चरण {step} / {total}',
  },
};

const ENUM_TRANSLATIONS_HI: Record<string, string> = {
  // Days of week
  Monday: 'सोमवार',
  Tuesday: 'मंगलवार',
  Wednesday: 'बुधवार',
  Thursday: 'गुरुवार',
  Friday: 'शुक्रवार',
  Saturday: 'शनिवार',
  Sunday: 'रविवार',

  // Meal slots
  Breakfast: 'नाश्ता',
  'Mid-Morning': 'सुबह का अल्पाहार',
  Lunch: 'दोपहर का भोजन',
  'Evening Snack': 'शाम का नाश्ता',
  Dinner: 'रात का भोजन',

  // Dietary preferences
  All: 'सभी',
  Vegetarian: 'शाकाहारी',
  'Non-Vegetarian': 'मांसाहारी',
  Vegan: 'वीगन',
  Balanced: 'संतुलित',

  // Experience levels
  Beginner: 'शुरुआती',
  Intermediate: 'मध्यम',
  Advanced: 'उन्नत',

  // Fitness goals
  'Weight Loss': 'वज़न घटाना',
  'Weight Gain': 'वज़न बढ़ाना',
  'Weight Maintenance': 'वज़न संतुलन',
  'General Fitness': 'सामान्य फिटनेस',

  // Workout categories
  'Full Body Workout': 'फुल बॉडी वर्कआउट',
  'Upper Body': 'अपर बॉडी',
  'Lower Body': 'लोअर बॉडी',
  'Cardio / Endurance': 'कार्डियो / स्टैमिना',
  'Strength Training': 'स्ट्रेंथ ट्रेनिंग',
  'Flexibility & Mobility': 'लचीलापन व मोबिलिटी',
  'Active Rest': 'सक्रिय विश्राम',

  // BMI categories
  Underweight: 'कम वज़न',
  'Normal range': 'सामान्य श्रेणी',
  Overweight: 'अधिक वज़न',
  'Obesity range': 'मोटापा श्रेणी',

  // Gender & Activity
  'Prefer not to say': 'बताना नहीं चाहते',
  Female: 'महिला',
  Male: 'पुरुष',
  'Non-binary': 'नॉन-बाइनरी',
  'Sedentary (Desk routine)': 'कम सक्रिय (डेस्क दिनचर्या)',
  'Lightly Active (1–2 days/week)': 'हल्का सक्रिय (1–2 दिन/सप्ताह)',
  'Moderately Active (3–4 days/week)': 'मध्यम सक्रिय (3–4 दिन/सप्ताह)',
  'Very Active (5+ days/week)': 'अत्यधिक सक्रिय (5+ दिन/सप्ताह)',

  // Payment & status
  Paid: 'भुगतान पूर्ण',
  light: 'लाइट',
  dark: 'डार्क',
  idle: 'तैयार',
  connecting: 'कनेक्ट हो रहा है',
  connected: 'कनेक्टेड',
  error: 'त्रुटि',
};

const DAY_SHORT_HI: Record<string, string> = {
  Monday: 'सोम',
  Tuesday: 'मंगल',
  Wednesday: 'बुध',
  Thursday: 'गुरु',
  Friday: 'शुक्र',
  Saturday: 'शनि',
  Sunday: 'रवि',
};

export function translate(
  lang: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const entry = TRANSLATIONS[key];
  let text = entry ? entry[lang] || entry.en : key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

export function t(lang: Language, key: string, params?: Record<string, string | number>): string {
  return translate(lang, key, params);
}

export function localizeEnum(lang: Language, value: string): string {
  if (lang !== 'hi') return value;
  return ENUM_TRANSLATIONS_HI[value] || value;
}

export function localizeDayShort(lang: Language, day: string): string {
  if (lang === 'hi') {
    return DAY_SHORT_HI[day] || day.slice(0, 3);
  }
  return day.slice(0, 3);
}

export function getNextLanguage(lang: Language): Language {
  return lang === 'en' ? 'hi' : 'en';
}
