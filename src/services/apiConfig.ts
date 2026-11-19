export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  endpoints: {
    health: '/api/health',
    authMe: '/api/auth/me',
    profile: '/api/profile',
    progress: '/api/progress',
    activity: '/api/activity',
    payments: '/api/payments',
    dietTemplates: '/api/templates/diets',
    workoutTemplates: '/api/templates/workouts',
    adminMembers: '/api/admin/members',
    geminiAsk: '/api/gemini/ask',
  },
};

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  idToken?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data as T;
}
