import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured in server secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function askFitnessCoach(params: {
  question: string;
  mode: 'deep' | 'fast';
  language: 'en' | 'hi';
  userContext?: {
    age?: number;
    fitnessGoal?: string;
    dietaryPreference?: string;
    experience?: string;
    allergies?: string;
  };
}) {
  const ai = createGeminiClient();
  const isMinor = typeof params.userContext?.age === 'number' && params.userContext.age < 18;

  const langInstruction =
    params.language === 'hi'
      ? 'Respond clearly in natural Hindi (Devanagari script) with Indian dietary and gym context.'
      : 'Respond clearly in concise, practical English tailored to Indian gym members and Indian home-cooked foods.';

  const safetyInstruction = isMinor
    ? 'IMPORTANT SAFETY RULE: The member is under 18. Do NOT give weight-loss, weight-gain, calorie-deficit, or adult BMI advice. Give only general, positive age-appropriate movement and balanced nutrition education, and recommend speaking with a qualified doctor or trusted adult.'
    : 'Provide general educational fitness and Indian nutrition guidance only. Never prescribe extreme calorie deficits, fasting protocols, medical diagnoses, or supplements. Always respect allergies and dietary preferences.';

  const contextSummary = params.userContext
    ? `Member context: Age ${params.userContext.age ?? 'unknown'}, Experience ${params.userContext.experience ?? 'Beginner'}, Diet ${params.userContext.dietaryPreference ?? 'Vegetarian'}, Goal ${isMinor ? 'General Wellness' : params.userContext.fitnessGoal ?? 'General Fitness'}, Allergies: ${params.userContext.allergies || 'None'}.`
    : '';

  const systemInstruction = `You are a helpful FIT FUEL Indian fitness and nutrition educator. ${safetyInstruction} ${langInstruction} ${contextSummary} Keep answers structured, concise (under 220 words), and practical.`;

  if (params.mode === 'fast') {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: params.question,
      config: {
        systemInstruction,
      },
    });
    return {
      text: response.text ?? '',
      model: 'gemini-3.1-flash-lite',
    };
  }

  // Deep thinking mode using free-tier gemini-4-hydrogen with ThinkingLevel.HIGH (no maxOutputTokens)
  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: params.question,
    config: {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  return {
    text: response.text ?? '',
    model: 'gemini-4-hydrogen',
  };
}
