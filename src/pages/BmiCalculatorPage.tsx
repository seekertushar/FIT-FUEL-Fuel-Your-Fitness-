import React, { useState } from 'react';
import { Calculator, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { evaluateBmi } from '../services/bmiService';

export const BmiCalculatorPage: React.FC = () => {
  const { user, updateProfile, addToast } = useApp();
  const { language, t, tx, localize } = useLanguage();

  const [heightInput, setHeightInput] = useState(String(user.heightCm));
  const [weightInput, setWeightInput] = useState(String(user.currentWeightKg));
  const [ageInput, setAgeInput] = useState(String(user.age));
  const [result, setResult] = useState(() =>
    evaluateBmi(user.heightCm, user.currentWeightKg, user.age)
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(heightInput);
    const w = Number(weightInput);
    const a = Number(ageInput);
    if (!Number.isInteger(a) || a < 5 || a > 120) {
      setResult({
        ...evaluateBmi(h, w, 25),
        valid: false,
        error: 'Please enter a valid age between 5 and 120 years.',
        bmi: null,
      });
      return;
    }
    setResult(evaluateBmi(h, w, a));
  };

  const handleSyncToProfile = async () => {
    const h = Number(heightInput);
    const w = Number(weightInput);
    const a = Number(ageInput);
    const check = evaluateBmi(h, w, a);
    if (!check.valid) {
      addToast('error', check.error || 'Enter valid height and weight first.');
      return;
    }
    await updateProfile({ heightCm: h, currentWeightKg: w, age: a });
    addToast('success', 'Height, weight, and age updated on your FIT FUEL profile.');
  };

  return (
    <DashboardLayout
      title={t('sidebarBmi')}
      subtitle={tx(
        'Metric formula BMI = Weight (kg) / Height (m)² with adult reference ranges and automatic under-18 safeguards.',
        'सटीक मेट्रिक फ़ॉर्मूला BMI = वज़न (kg) / ऊँचाई (m)² के साथ वयस्क संदर्भ स्केल और आयु-सुरक्षा जाँच।'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Card */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-[#15803D] dark:text-[#B6F23B]" />
            <h2 className="font-display text-lg font-bold">
              {language === 'hi' ? 'अपना माप दर्ज करें' : 'Enter Measurements'}
            </h2>
          </div>

          <form onSubmit={handleCalculate} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="bmi-age" className="block text-xs font-semibold mb-1.5">
                {language === 'hi' ? 'आयु (वर्ष)' : 'Age (Years)'}
              </label>
              <input
                id="bmi-age"
                type="number"
                min={5}
                max={120}
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
              />
            </div>

            <div>
              <label htmlFor="bmi-height" className="block text-xs font-semibold mb-1.5">
                {language === 'hi' ? 'ऊँचाई (सेमी / cm)' : 'Height (cm)'}
              </label>
              <input
                id="bmi-height"
                type="number"
                step="0.5"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                placeholder="176"
                className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
              />
            </div>

            <div>
              <label htmlFor="bmi-weight" className="block text-xs font-semibold mb-1.5">
                {language === 'hi' ? 'वज़न (किग्रा / kg)' : 'Weight (kg)'}
              </label>
              <input
                id="bmi-weight"
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="73.2"
                className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
              />
            </div>

            {!result.valid && result.error && (
              <div
                role="alert"
                className="rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] p-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]"
              >
                {result.error}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-[#B6F23B] text-[#15191C] text-sm font-bold hover:bg-[#A4E028] transition-colors whitespace-nowrap"
              >
                {t('calculateBmi')}
              </button>
              <button
                type="button"
                onClick={handleSyncToProfile}
                className="py-3 px-4 rounded-xl border border-[#E2E8DF] dark:border-[#262F35] text-sm font-semibold hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A] transition-colors whitespace-nowrap"
              >
                {tx('Save to Profile', 'प्रोफ़ाइल अपडेट करें')}
              </button>
            </div>
          </form>

          <p className="mt-5 pt-4 border-t border-[#E2E8DF] dark:border-[#262F35] text-xs font-mono text-[#5B655D] dark:text-[#9BA59D]">
            {tx('Formula: BMI = Weight (kg) ÷ [Height (m)]²', 'सूत्र: BMI = वज़न (किग्रा) ÷ [ऊँचाई (मीटर)]²')}
          </p>
        </div>

        {/* Right Result & Horizontal Gauge */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 sm:p-8">
            {!result.valid ? (
              <div className="py-10 text-center text-sm text-[#5B655D] dark:text-[#9BA59D]">
                {tx(
                  'Enter valid height (80–250 cm) and weight (20–300 kg) to compute your BMI.',
                  'BMI गणना के लिए मान्य ऊँचाई (80–250 सेमी) और वज़न (20–300 किग्रा) दर्ज करें।'
                )}
              </div>
            ) : result.isMinor ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#FEF3C7] dark:bg-[#33270E] text-[#C2410C] dark:text-[#FCD34D]">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                      {tx(
                        'Age-Appropriate Assessment Required (Under 18)',
                        '18 वर्ष से कम आयु के लिए विशेष सूचना'
                      )}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#5B655D] dark:text-[#9BA59D]">
                      {language === 'hi' ? result.explanationHi : result.explanation}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-4 text-xs text-[#5B655D] dark:text-[#9BA59D]">
                  <p className="font-semibold text-[#15191C] dark:text-[#F3F6F2]">
                    {tx('General Youth Wellness Focus:', 'सामान्य स्वास्थ्य सुझाव:')}
                  </p>
                  <p className="mt-1">
                    {tx(
                      'Enjoy balanced home-cooked meals, outdoor sports or active play, 8–9 hours of sleep, and hydration. Adult BMI categories are intentionally hidden.',
                      'संतुलित घर का भोजन, बाहरी खेल या सक्रिय गतिविधि, 8–9 घंटे की नींद और पर्याप्त पानी पर ध्यान दें। वयस्क BMI श्रेणियाँ जानबूझकर छिपाई गई हैं।'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#5B655D] dark:text-[#9BA59D]">
                      {language === 'hi' ? 'आपका गणना किया गया BMI (वयस्क)' : 'Calculated Adult BMI'}
                    </p>
                    <p
                      data-testid="bmi-value"
                      className="mt-1 font-mono text-5xl font-bold text-[#15191C] dark:text-[#F3F6F2] tabular-nums"
                    >
                      {result.bmi?.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                      {language === 'hi' ? 'वयस्क संदर्भ श्रेणी' : 'Adult Reference Category'}
                    </p>
                    <p
                      data-testid="bmi-category"
                      className={`mt-1 font-display text-xl font-bold ${
                        result.category === 'Normal range'
                          ? 'text-[#15803D] dark:text-[#4ADE80]'
                          : result.category === 'Overweight'
                          ? 'text-[#C2410C] dark:text-[#FB923C]'
                          : result.category === 'Obesity range'
                          ? 'text-[#B91C1C] dark:text-[#F87171]'
                          : 'text-[#0284C7] dark:text-[#38BDF8]'
                      }`}
                    >
                      {language === 'hi' ? result.categoryHi : result.category}
                    </p>
                  </div>
                </div>

                {/* Horizontal BMI Range Bar */}
                <div className="mt-8">
                  <div className="relative h-4 rounded-full overflow-hidden flex">
                    <div className="w-[18.75%] bg-[#38BDF8]" title="Underweight (<18.5)" />
                    <div className="w-[27.08%] bg-[#22C55E]" title="Normal range (18.5-24.9)" />
                    <div className="w-[20.83%] bg-[#F59E0B]" title="Overweight (25-29.9)" />
                    <div className="flex-1 bg-[#EF4444]" title="Obesity range (30+)" />
                  </div>
                  <div className="relative h-6 mt-1">
                    <div
                      style={{ left: `${result.markerPercent}%` }}
                      className="absolute -translate-x-1/2 -top-5 flex flex-col items-center transition-all duration-300"
                    >
                      <div className="w-3.5 h-6 rounded-full bg-[#15191C] dark:bg-white border-2 border-white dark:border-[#15191C] shadow" />
                      <span className="mt-1 font-mono text-[11px] font-bold text-[#15191C] dark:text-[#F3F6F2]">
                        {result.bmi?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#F7F9F5] dark:bg-[#0E1113]">
                      <p className="font-mono font-semibold text-[#0284C7] dark:text-[#38BDF8]">&lt; 18.5</p>
                      <p className="text-[#5B655D] dark:text-[#9BA59D]">{localize('Underweight')}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F7F9F5] dark:bg-[#0E1113]">
                      <p className="font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">18.5 – 24.9</p>
                      <p className="text-[#5B655D] dark:text-[#9BA59D]">{localize('Normal range')}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F7F9F5] dark:bg-[#0E1113]">
                      <p className="font-mono font-semibold text-[#C2410C] dark:text-[#FB923C]">25.0 – 29.9</p>
                      <p className="text-[#5B655D] dark:text-[#9BA59D]">{localize('Overweight')}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F7F9F5] dark:bg-[#0E1113]">
                      <p className="font-mono font-semibold text-[#B91C1C] dark:text-[#F87171]">30.0+</p>
                      <p className="text-[#5B655D] dark:text-[#9BA59D]">{localize('Obesity range')}</p>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-[#202820] dark:text-[#F3F6F2]">
                  {language === 'hi' ? result.explanationHi : result.explanation}
                </p>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-[#E2E8DF] dark:border-[#262F35] flex items-start gap-2.5 text-xs text-[#5B655D] dark:text-[#9BA59D]">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D] dark:text-[#B6F23B]" />
              <span>{language === 'hi' ? result.disclaimerHi : result.disclaimer}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
            <h3 className="font-display text-base font-bold text-[#15191C] dark:text-[#F3F6F2] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#B6F23B]" />
              <span>{tx('Balanced Context Beyond BMI', 'व्यावहारिक स्वास्थ्य टिप्स')}</span>
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#5B655D] dark:text-[#9BA59D]">
              <li>
                ·{' '}
                {tx(
                  'Track waist circumference, strength progression, sleep quality, and energy alongside weight.',
                  'वज़न के साथ कमर का माप, स्ट्रेंथ प्रगति, नींद की गुणवत्ता और दैनिक ऊर्जा को भी ट्रैक करें।'
                )}
              </li>
              <li>
                ·{' '}
                {tx(
                  'Athletic individuals with higher muscle mass may show a higher BMI while staying metabolically fit.',
                  'अधिक मांसपेशी वाले एथलीटों का BMI अधिक दिख सकता है, जबकि वे पूरी तरह स्वस्थ रहते हैं।'
                )}
              </li>
              <li>
                ·{' '}
                {tx(
                  'Consult a qualified Indian physician or registered dietitian for clinical assessments.',
                  'चिकित्सीय मूल्यांकन के लिए योग्य भारतीय चिकित्सक या पंजीकृत आहार विशेषज्ञ से परामर्श लें।'
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
