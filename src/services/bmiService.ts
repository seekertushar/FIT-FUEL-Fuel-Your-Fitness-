export type AdultBmiCategory =
  | 'Underweight'
  | 'Normal range'
  | 'Overweight'
  | 'Obesity range';

export interface BmiResult {
  valid: boolean;
  error?: string;
  bmi: number | null;
  isMinor: boolean;
  category: AdultBmiCategory | null;
  categoryHi: string | null;
  markerPercent: number;
  explanation: string;
  explanationHi: string;
  disclaimer: string;
  disclaimerHi: string;
}

export function validateBmiInputs(heightCm: number, weightKg: number): string | null {
  if (!Number.isFinite(heightCm) || heightCm < 80 || heightCm > 250) {
    return 'Enter a valid height between 80 cm and 250 cm.';
  }
  if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 300) {
    return 'Enter a valid weight between 20 kg and 300 kg.';
  }
  return null;
}

export function calculateBmiValue(heightCm: number, weightKg: number): number | null {
  if (validateBmiInputs(heightCm, weightKg) !== null) {
    return null;
  }
  const heightM = heightCm / 100;
  const raw = weightKg / (heightM * heightM);
  return Math.round(raw * 10) / 10;
}

export function classifyAdultBmi(bmi: number): {
  category: AdultBmiCategory;
  categoryHi: string;
  explanation: string;
  explanationHi: string;
} {
  if (bmi < 18.5) {
    return {
      category: 'Underweight',
      categoryHi: 'कम वज़न (Underweight)',
      explanation:
        'This value falls below the general adult reference range (18.5–24.9). Focus on nourishing, balanced meals and discuss personal nutrition needs with a qualified clinician.',
      explanationHi:
        'यह मान सामान्य वयस्क संदर्भ श्रेणी (18.5–24.9) से कम है। संतुलित पौष्टिक आहार पर ध्यान दें और व्यक्तिगत सलाह के लिए योग्य चिकित्सक से परामर्श करें।',
    };
  }
  if (bmi < 25) {
    return {
      category: 'Normal range',
      categoryHi: 'सामान्य श्रेणी (Normal range)',
      explanation:
        'This value sits within the standard adult reference range (18.5–24.9). Consistent movement, adequate protein, sleep, and hydration support long-term vitality.',
      explanationHi:
        'यह मान सामान्य वयस्क संदर्भ श्रेणी (18.5–24.9) के भीतर है। नियमित व्यायाम, संतुलित भोजन, नींद और पर्याप्त पानी स्वास्थ्य बनाए रखने में मदद करते हैं।',
    };
  }
  if (bmi < 30) {
    return {
      category: 'Overweight',
      categoryHi: 'अधिक वज़न (Overweight)',
      explanation:
        'This value is above the 18.5–24.9 adult reference range. Remember BMI does not distinguish between muscle mass and body fat—combine regular strength training with balanced home-cooked meals.',
      explanationHi:
        'यह मान 18.5–24.9 वयस्क संदर्भ श्रेणी से ऊपर है। ध्यान रखें कि BMI मांसपेशियों और शरीर की चर्बी में अंतर नहीं करता—नियमित व्यायाम और संतुलित घर के भोजन को प्राथमिकता दें।',
    };
  }
  return {
    category: 'Obesity range',
    categoryHi: 'मोटापा श्रेणी (Obesity range)',
    explanation:
      'This value falls in the 30+ adult reference range. Because BMI is only a general screening number, consider reviewing holistic health markers with a qualified healthcare professional.',
    explanationHi:
      'यह मान 30+ वयस्क संदर्भ श्रेणी में आता है। चूँकि BMI केवल एक सामान्य स्क्रीनिंग माप है, समग्र स्वास्थ्य मूल्यांकन के लिए किसी योग्य चिकित्सक से परामर्श लें।',
  };
}

export function evaluateBmi(heightCm: number, weightKg: number, age: number): BmiResult {
  const error = validateBmiInputs(heightCm, weightKg);
  const disclaimer =
    'BMI is a general screening measure, not a medical diagnosis. It does not measure body composition or overall health.';
  const disclaimerHi =
    'BMI एक सामान्य स्क्रीनिंग माप है, कोई चिकित्सीय निदान नहीं। यह शरीर की मांसपेशियों या समग्र स्वास्थ्य को नहीं मापता।';

  if (error) {
    return {
      valid: false,
      error,
      bmi: null,
      isMinor: age < 18,
      category: null,
      categoryHi: null,
      markerPercent: 0,
      explanation: '',
      explanationHi: '',
      disclaimer,
      disclaimerHi,
    };
  }

  const bmi = calculateBmiValue(heightCm, weightKg)!;

  if (age < 18) {
    return {
      valid: true,
      bmi,
      isMinor: true,
      category: null,
      categoryHi: null,
      markerPercent: 50,
      explanation:
        'For individuals under 18, adult BMI categories and weight-loss/weight-gain programs do not apply. Growth patterns vary significantly during childhood and adolescence—please discuss health and fitness goals with a pediatrician, qualified healthcare professional, and a trusted adult.',
      explanationHi:
        '18 वर्ष से कम आयु के उपयोगकर्ताओं के लिए वयस्क BMI श्रेणियाँ और वज़न घटाने/बढ़ाने के कार्यक्रम लागू नहीं होते। कृपया किसी योग्य चिकित्सक और विश्वसनीय अभिभावक के साथ व्यक्तिगत स्वास्थ्य लक्ष्यों पर चर्चा करें।',
      disclaimer:
        'Age-appropriate wellness guidance only. Adult BMI interpretation is disabled for members under 18.',
      disclaimerHi:
        'केवल आयु-उपयुक्त सामान्य स्वास्थ्य जानकारी। 18 वर्ष से कम आयु के लिए वयस्क BMI श्रेणी नहीं दिखाई जाती।',
    };
  }

  const classified = classifyAdultBmi(bmi);
  // Map BMI 14..38 onto 0..100% bar cleanly
  const clamped = Math.max(14, Math.min(38, bmi));
  const markerPercent = Math.round(((clamped - 14) / (38 - 14)) * 100);

  return {
    valid: true,
    bmi,
    isMinor: false,
    category: classified.category,
    categoryHi: classified.categoryHi,
    markerPercent,
    explanation: classified.explanation,
    explanationHi: classified.explanationHi,
    disclaimer,
    disclaimerHi,
  };
}
