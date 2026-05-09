// Supabase Data Service — CRUD operations for all health data tables
import { supabase } from './supabase';

// ──────────────────────────── HEALTH PROFILES ────────────────────────────

export async function fetchHealthProfile(userId: string) {
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
}

export async function upsertHealthProfile(userId: string, profile: {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  activity_level?: string;
  health_goals?: string[];
  medical_conditions?: string[];
  smoking_status?: string;
}) {
  const { data, error } = await supabase
    .from('health_profiles')
    .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  return { data, error };
}

// ──────────────────────────── STRESS RECORDS ────────────────────────────

export async function fetchStressRecords(userId: string, limit = 180) {
  const { data, error } = await supabase
    .from('stress_records')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  return { data: data?.reverse() || [], error };
}

export async function saveStressRecord(userId: string, record: {
  stress_level: number;
  hrv_reading?: number;
  symptoms?: string[];
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('stress_records')
    .insert({ user_id: userId, ...record })
    .select()
    .single();
  return { data, error };
}

// ──────────────────────────── MEALS & FOOD ITEMS ────────────────────────────

export async function fetchMeals(userId: string, limit = 100) {
  const { data, error } = await supabase
    .from('meals')
    .select('*, food_items(*)')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function saveMeal(userId: string, meal: {
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes?: string;
  nutritional_score?: number;
  recorded_at?: string;
  foods?: Array<{
    name: string;
    portion: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}) {
  const { foods, ...mealData } = meal;

  // Insert meal
  const { data: mealRow, error: mealError } = await supabase
    .from('meals')
    .insert({ user_id: userId, ...mealData })
    .select()
    .single();

  if (mealError || !mealRow) return { data: null, error: mealError };

  // Insert food items
  if (foods && foods.length > 0) {
    const foodItems = foods.map(f => ({ meal_id: mealRow.id, ...f }));
    await supabase.from('food_items').insert(foodItems);
  }

  return { data: mealRow, error: null };
}

// ──────────────────────────── ACTIVITY RECORDS ────────────────────────────

export async function fetchActivityRecords(userId: string, limit = 180) {
  const { data, error } = await supabase
    .from('activity_records')
    .select('*, workouts(*)')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  return { data: data?.reverse() || [], error };
}

export async function saveActivityRecord(userId: string, record: {
  steps: number;
  distance: number;
  active_minutes: number;
  calories_burned: number;
  workouts?: Array<{
    activity_type: string;
    duration: number;
    calories_burned: number;
    intensity: string;
    notes?: string;
  }>;
}) {
  const { workouts, ...activityData } = record;

  const { data: activityRow, error: actError } = await supabase
    .from('activity_records')
    .insert({ user_id: userId, ...activityData })
    .select()
    .single();

  if (actError || !activityRow) return { data: null, error: actError };

  if (workouts && workouts.length > 0) {
    const workoutRows = workouts.map(w => ({ activity_record_id: activityRow.id, ...w }));
    await supabase.from('workouts').insert(workoutRows);
  }

  return { data: activityRow, error: null };
}

// ──────────────────────────── SLEEP RECORDS ────────────────────────────

export async function fetchSleepRecords(userId: string, limit = 180) {
  const { data, error } = await supabase
    .from('sleep_records')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  return { data: data?.reverse() || [], error };
}

export async function saveSleepRecord(userId: string, record: {
  bed_time: string;
  wake_time: string;
  duration: number;
  quality: number;
  deep_sleep_minutes: number;
  rem_sleep_minutes: number;
  light_sleep_minutes: number;
  awake_minutes: number;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('sleep_records')
    .insert({ user_id: userId, ...record })
    .select()
    .single();
  return { data, error };
}

// ──────────────────────────── HEART RISK ASSESSMENTS ────────────────────────────

export async function fetchHeartRiskAssessments(userId: string) {
  const { data, error } = await supabase
    .from('heart_risk_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(1);
  return { data: data?.[0] || null, error };
}

export async function saveHeartRiskAssessment(userId: string, record: {
  systolic_bp: number;
  diastolic_bp: number;
  cholesterol_total: number;
  cholesterol_hdl: number;
  cholesterol_ldl: number;
  triglycerides: number;
  blood_glucose: number;
  calculated_risk: number;
  recommendations: string[];
}) {
  const { data, error } = await supabase
    .from('heart_risk_assessments')
    .insert({ user_id: userId, ...record })
    .select()
    .single();
  return { data, error };
}

// ──────────────────────────── NOTIFICATIONS ────────────────────────────

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function markNotificationRead(notifId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId);
  return { error };
}

export async function deleteNotification(notifId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notifId);
  return { error };
}

export async function clearAllNotifications(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
  return { error };
}

export async function createNotification(userId: string, notif: {
  type: string;
  title: string;
  message: string;
  action_url?: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, ...notif })
    .select()
    .single();
  return { data, error };
}

// ──────────────────────────── SEED DEMO DATA ────────────────────────────

/**
 * Seeds initial health data for a newly registered user.
 * Only inserts if the user has no existing records.
 */
export async function seedUserData(userId: string) {
  // Check if user already has activity data
  const { data: existing } = await supabase
    .from('activity_records')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) return; // Already seeded

  const now = new Date();
  const DAYS = 180; // 6 months of data

  // Seed health profile
  await upsertHealthProfile(userId, {
    age: 28,
    gender: 'male',
    height: 175,
    weight: 68,
    activity_level: 'moderate',
    health_goals: ['fitness', 'weight_management', 'better_sleep'],
    medical_conditions: [],
    smoking_status: 'never',
  });

  // Seed 180 days of activity data (batch in chunks of 50)
  const activityInserts = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Simulate weekly patterns: lower on weekends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseSteps = isWeekend ? 4000 : 6000;
    activityInserts.push({
      user_id: userId,
      steps: baseSteps + Math.floor(Math.random() * 6000),
      distance: +(2 + Math.random() * 8).toFixed(2),
      active_minutes: (isWeekend ? 20 : 40) + Math.floor(Math.random() * 80),
      calories_burned: 1400 + Math.floor(Math.random() * 1100),
      recorded_at: date.toISOString(),
    });
  }
  // Batch insert in chunks of 50
  for (let c = 0; c < activityInserts.length; c += 50) {
    await supabase.from('activity_records').insert(activityInserts.slice(c, c + 50));
  }

  // Seed 180 days of sleep data
  const sleepInserts = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const bedHour = isWeekend ? 23 + Math.floor(Math.random() * 2) : 22 + Math.floor(Math.random() * 2);
    const bedTime = new Date(date);
    bedTime.setHours(bedHour, Math.floor(Math.random() * 60), 0, 0);
    const sleepDuration = 300 + Math.floor(Math.random() * 180); // 5-8 hours in minutes
    const wakeTime = new Date(bedTime.getTime() + sleepDuration * 60000);
    const deepPct = 0.15 + Math.random() * 0.10;
    const remPct = 0.20 + Math.random() * 0.05;
    const lightPct = 0.45 + Math.random() * 0.10;
    const awakePct = Math.max(0, 1 - deepPct - remPct - lightPct);

    sleepInserts.push({
      user_id: userId,
      bed_time: bedTime.toISOString(),
      wake_time: wakeTime.toISOString(),
      duration: sleepDuration,
      quality: 4 + Math.floor(Math.random() * 6),
      deep_sleep_minutes: Math.floor(sleepDuration * deepPct),
      rem_sleep_minutes: Math.floor(sleepDuration * remPct),
      light_sleep_minutes: Math.floor(sleepDuration * lightPct),
      awake_minutes: Math.floor(sleepDuration * awakePct),
      notes: '',
      recorded_at: date.toISOString(),
    });
  }
  for (let c = 0; c < sleepInserts.length; c += 50) {
    await supabase.from('sleep_records').insert(sleepInserts.slice(c, c + 50));
  }

  // Seed 180 days of stress data
  const stressInserts = [];
  const symptomOptions = ['fatigue', 'headache', 'irritability', 'trouble_sleeping', 'muscle_tension'];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;
    const baseStress = isWeekday ? 4 : 2;
    const stressLevel = baseStress + Math.floor(Math.random() * 5);
    const numSymptoms = stressLevel > 6 ? 1 + Math.floor(Math.random() * 2) : (Math.random() > 0.6 ? 1 : 0);
    const symptoms: string[] = [];
    for (let s = 0; s < numSymptoms; s++) {
      symptoms.push(symptomOptions[Math.floor(Math.random() * symptomOptions.length)]);
    }
    stressInserts.push({
      user_id: userId,
      stress_level: Math.min(stressLevel, 10),
      hrv_reading: 40 + Math.floor(Math.random() * 50),
      symptoms: [...new Set(symptoms)],
      notes: '',
      recorded_at: date.toISOString(),
    });
  }
  for (let c = 0; c < stressInserts.length; c += 50) {
    await supabase.from('stress_records').insert(stressInserts.slice(c, c + 50));
  }

  // Seed heart risk
  await saveHeartRiskAssessment(userId, {
    systolic_bp: 118,
    diastolic_bp: 76,
    cholesterol_total: 190,
    cholesterol_hdl: 55,
    cholesterol_ldl: 110,
    triglycerides: 140,
    blood_glucose: 95,
    calculated_risk: 8,
    recommendations: [
      'Maintain a heart-healthy diet rich in fruits, vegetables, and whole grains',
      'Aim for at least 150 minutes of moderate aerobic exercise weekly',
      'Limit sodium intake to 2,300mg per day',
      'Consider monitoring blood pressure regularly',
    ],
  });

  // Seed 180 days of meals (3 per day) — batch insert
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const foodDB = [
    { name: 'Oatmeal', portion: 100, calories: 150, protein: 5, carbs: 25, fat: 3 },
    { name: 'Scrambled Eggs', portion: 150, calories: 220, protein: 14, carbs: 2, fat: 16 },
    { name: 'Chicken Breast', portion: 150, calories: 240, protein: 42, carbs: 0, fat: 7 },
    { name: 'Brown Rice', portion: 150, calories: 160, protein: 3, carbs: 34, fat: 1 },
    { name: 'Salmon', portion: 150, calories: 280, protein: 30, carbs: 0, fat: 18 },
    { name: 'Greek Yogurt', portion: 150, calories: 130, protein: 17, carbs: 9, fat: 0 },
    { name: 'Broccoli', portion: 100, calories: 55, protein: 3, carbs: 11, fat: 0 },
    { name: 'Banana', portion: 120, calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: 'Paneer Tikka', portion: 120, calories: 260, protein: 18, carbs: 5, fat: 19 },
    { name: 'Dal Tadka', portion: 200, calories: 180, protein: 12, carbs: 24, fat: 6 },
    { name: 'Roti', portion: 40, calories: 104, protein: 3, carbs: 18, fat: 3 },
    { name: 'Mixed Vegetables', portion: 150, calories: 80, protein: 3, carbs: 15, fat: 1 },
    { name: 'Fruit Salad', portion: 200, calories: 120, protein: 2, carbs: 28, fat: 1 },
    { name: 'Protein Shake', portion: 300, calories: 200, protein: 30, carbs: 10, fat: 5 },
    { name: 'Almonds', portion: 30, calories: 170, protein: 6, carbs: 6, fat: 15 },
    { name: 'Egg White Omelette', portion: 150, calories: 120, protein: 18, carbs: 2, fat: 5 },
  ];

  // Pre-build all meal rows and their associated foods
  type MealInsert = { user_id: string; meal_type: string; total_calories: number; total_protein: number; total_carbs: number; total_fat: number; nutritional_score: number; notes: string; recorded_at: string; _foods: typeof foodDB };
  const allMealInserts: MealInsert[] = [];

  for (let i = DAYS - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    for (const mealType of mealTypes) {
      const foodCount = 2 + Math.floor(Math.random() * 2); // 2-3 items
      const foods = [];
      let totalCal = 0, totalProt = 0, totalCarb = 0, totalFat = 0;

      for (let f = 0; f < foodCount; f++) {
        const food = foodDB[Math.floor(Math.random() * foodDB.length)];
        foods.push(food);
        totalCal += food.calories;
        totalProt += food.protein;
        totalCarb += food.carbs;
        totalFat += food.fat;
      }

      allMealInserts.push({
        user_id: userId,
        meal_type: mealType,
        total_calories: totalCal,
        total_protein: totalProt,
        total_carbs: totalCarb,
        total_fat: totalFat,
        nutritional_score: 4 + Math.floor(Math.random() * 5),
        notes: '',
        recorded_at: date.toISOString(),
        _foods: foods,
      });
    }
  }

  // Insert meals in batches and collect IDs for food items
  for (let c = 0; c < allMealInserts.length; c += 30) {
    const batch = allMealInserts.slice(c, c + 30);
    const insertBatch = batch.map(({ _foods, ...rest }) => rest);
    const { data: mealRows } = await supabase.from('meals').insert(insertBatch).select('id');
    
    if (mealRows) {
      const foodBatch: Array<{ meal_id: string; name: string; portion: number; calories: number; protein: number; carbs: number; fat: number }> = [];
      mealRows.forEach((row: any, idx: number) => {
        batch[idx]._foods.forEach(f => {
          foodBatch.push({ meal_id: row.id, ...f });
        });
      });
      if (foodBatch.length > 0) {
        await supabase.from('food_items').insert(foodBatch);
      }
    }
  }

  // Seed notifications
  const notifInserts = [
    { user_id: userId, type: 'reminder', title: 'Time to log your meals', message: "Don't forget to record what you've eaten today for accurate nutrition tracking.", read: false },
    { user_id: userId, type: 'achievement', title: 'Step Goal Reached!', message: "Congratulations! You've reached your daily step goal of 10,000 steps.", read: false },
    { user_id: userId, type: 'insight', title: 'Sleep Pattern Analysis', message: 'Your sleep quality has improved by 15% this week. Keep maintaining your regular sleep schedule!', read: false, action_url: '/sleep' },
    { user_id: userId, type: 'alert', title: 'High Stress Detected', message: 'Your recent stress levels have been elevated. Consider trying some relaxation techniques.', read: false, action_url: '/stress' },
    { user_id: userId, type: 'achievement', title: '30-Day Streak!', message: "You've been logging your health data consistently for 30 days. Amazing dedication!", read: false },
    { user_id: userId, type: 'insight', title: 'Activity Trend', message: 'Your weekly step count has increased by 18% compared to last month. Great progress!', read: false, action_url: '/activity' },
  ];
  await supabase.from('notifications').insert(notifInserts);

  console.log('✅ 6 months of demo data seeded successfully for user:', userId);
}
