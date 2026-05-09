// Azure AI Service — GPT-5.4 powered health assistant
// Uses Azure AI Foundry endpoint for chat completions

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface HealthContext {
  steps?: number;
  calories?: number;
  heartRate?: number;
  sleepHours?: number;
  sleepQuality?: number;
  stressLevel?: number;
  bloodOxygen?: number;
  recentActivity?: Array<{ date: string; steps: number; calories_burned: number }>;
  recentSleep?: Array<{ date: string; duration: number; quality: number }>;
  recentStress?: Array<{ date: string; stress_level: number }>;
  profile?: {
    age?: number;
    weight?: number;
    height?: number;
    gender?: string;
  };
}

const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_AI_ENDPOINT;
const AZURE_KEY = import.meta.env.VITE_AZURE_AI_KEY;
const AZURE_MODEL = import.meta.env.VITE_AZURE_AI_MODEL || 'gpt-5.4';

const HEALTH_SYSTEM_PROMPT = `You are HealthPulse AI, an expert health and wellness assistant integrated into a health tracking app. You have access to the user's real-time health data from their smart band and historical records.

Your role:
- Provide personalized health insights based on the user's actual data
- Give evidence-based wellness recommendations
- Analyze trends in activity, sleep, stress, and nutrition
- Be encouraging and supportive
- Flag any concerning patterns (e.g., consistently low sleep, high stress)
- Suggest actionable improvements

Guidelines:
- Be concise but thorough (2-4 paragraphs max per response)
- Use specific numbers from their data when available
- Don't diagnose medical conditions — recommend seeing a doctor for concerns
- Use a warm, professional tone
- Format with bullet points and bold text for readability using markdown`;

/**
 * Send a chat message to Azure AI and get a response
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  healthContext?: HealthContext
): Promise<string> {
  if (!AZURE_ENDPOINT || !AZURE_KEY) {
    throw new Error('Azure AI credentials not configured. Check your .env file.');
  }

  // Build system message with health context
  let systemContent = HEALTH_SYSTEM_PROMPT;
  
  if (healthContext) {
    systemContent += '\n\n--- CURRENT USER HEALTH DATA ---\n';
    
    if (healthContext.profile) {
      const p = healthContext.profile;
      systemContent += `Profile: Age ${p.age || 'N/A'}, Weight ${p.weight || 'N/A'}kg, Height ${p.height || 'N/A'}cm, Gender ${p.gender || 'N/A'}\n`;
    }
    
    if (healthContext.steps !== undefined) systemContent += `Today's Steps: ${healthContext.steps}\n`;
    if (healthContext.calories !== undefined) systemContent += `Calories Burned: ${healthContext.calories}\n`;
    if (healthContext.heartRate !== undefined) systemContent += `Current Heart Rate: ${healthContext.heartRate} bpm\n`;
    if (healthContext.bloodOxygen !== undefined) systemContent += `Blood Oxygen: ${healthContext.bloodOxygen}%\n`;
    if (healthContext.sleepHours !== undefined) systemContent += `Last Night Sleep: ${healthContext.sleepHours} hours\n`;
    if (healthContext.sleepQuality !== undefined) systemContent += `Sleep Quality: ${healthContext.sleepQuality}/10\n`;
    if (healthContext.stressLevel !== undefined) systemContent += `Current Stress Level: ${healthContext.stressLevel}/10\n`;
    
    if (healthContext.recentActivity && healthContext.recentActivity.length > 0) {
      systemContent += '\nRecent Activity (last 7 days):\n';
      healthContext.recentActivity.slice(-7).forEach(a => {
        systemContent += `  ${a.date}: ${a.steps} steps, ${a.calories_burned} kcal\n`;
      });
    }
    
    if (healthContext.recentSleep && healthContext.recentSleep.length > 0) {
      systemContent += '\nRecent Sleep (last 7 days):\n';
      healthContext.recentSleep.slice(-7).forEach(s => {
        systemContent += `  ${s.date}: ${Math.floor(s.duration / 60)}h ${s.duration % 60}m, Quality ${s.quality}/10\n`;
      });
    }
    
    if (healthContext.recentStress && healthContext.recentStress.length > 0) {
      systemContent += '\nRecent Stress (last 7 days):\n';
      healthContext.recentStress.slice(-7).forEach(s => {
        systemContent += `  ${s.date}: Level ${s.stress_level}/10\n`;
      });
    }
    
    systemContent += '\n--- END HEALTH DATA ---';
  }

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: systemContent },
    ...messages,
  ];

  const response = await fetch(AZURE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AZURE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AZURE_MODEL,
      messages: fullMessages,
      temperature: 0.7,
      max_completion_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Azure AI error:', errorText);
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}

/**
 * Generate AI health insights based on user data
 */
export async function generateHealthInsights(healthContext: HealthContext): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: 'Based on my recent health data, provide a comprehensive analysis with 3-4 personalized insights and actionable recommendations. Focus on trends, areas of improvement, and what I\'m doing well. Format with bullet points.',
    },
  ];

  return sendChatMessage(messages, healthContext);
}

/**
 * Generate AI stress analysis
 */
export async function generateStressAnalysis(
  stressLevel: number,
  symptoms: string[],
  healthContext: HealthContext
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `I just completed a stress assessment. My stress level is ${stressLevel}/10${symptoms.length > 0 ? ` and I'm experiencing: ${symptoms.join(', ')}` : ''}. Please analyze this in context of my recent health data and provide specific stress-reduction techniques that would work for me.`,
    },
  ];

  return sendChatMessage(messages, healthContext);
}

/**
 * Generate AI diet recommendations
 */
export async function generateDietRecommendations(
  recentMeals: Array<{ meal_type: string; total_calories: number; total_protein: number; total_carbs: number; total_fat: number }>,
  healthContext: HealthContext
): Promise<string> {
  let mealSummary = 'Recent meals:\n';
  recentMeals.slice(-10).forEach(m => {
    mealSummary += `  ${m.meal_type}: ${m.total_calories} kcal (P:${m.total_protein}g C:${m.total_carbs}g F:${m.total_fat}g)\n`;
  });

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `Analyze my recent diet and provide nutrition recommendations.\n\n${mealSummary}\nGive me specific suggestions for improving my nutrition balance, meal timing, and food choices.`,
    },
  ];

  return sendChatMessage(messages, healthContext);
}

/**
 * Generate AI sleep analysis
 */
export async function generateSleepAnalysis(healthContext: HealthContext): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: 'Analyze my recent sleep patterns and provide specific recommendations for improving my sleep quality. Consider my activity levels and stress data as well.',
    },
  ];

  return sendChatMessage(messages, healthContext);
}
