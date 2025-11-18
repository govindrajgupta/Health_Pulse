// User types
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  healthProfile: HealthProfile | null;
}

export interface HealthProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  healthGoals: string[];
  medicalConditions: string[];
  smokingStatus: 'never' | 'former' | 'current';
}

// Stress Module types
export interface StressData {
  id: string;
  userId: string;
  date: Date;
  level: number; // 1-10 scale
  symptoms: string[];
  hrvReading: number | null; // Heart Rate Variability
  notes: string;
}

export interface StressQuestion {
  id: string;
  question: string;
  options: { value: number; label: string }[];
}

// Diet Module types
export interface MealEntry {
  id: string;
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  photoURL?: string;
  notes: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  nutritionalScore: number; // 1-10 health rating
}

export interface FoodItem {
  id: string;
  name: string;
  portion: number; // in grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Activity Module types
export interface ActivityData {
  id: string;
  userId: string;
  date: Date;
  steps: number;
  distance: number; // in km
  activeMinutes: number;
  caloriesBurned: number;
  workouts: Workout[];
}

export interface Workout {
  id: string;
  activityType: string;
  duration: number; // in minutes
  caloriesBurned: number;
  intensity: 'low' | 'moderate' | 'high';
  notes: string;
}

// Sleep Module types
export interface SleepData {
  id: string;
  userId: string;
  date: Date;
  bedTime: Date;
  wakeTime: Date;
  duration: number; // in minutes
  quality: number; // 1-10 scale
  deepSleepMinutes: number;
  remSleepMinutes: number;
  lightSleepMinutes: number;
  awakeMinutes: number;
  notes: string;
}

// Heart Risk Module types
export interface HeartRiskData {
  id: string;
  userId: string;
  date: Date;
  systolicBP: number;
  diastolicBP: number;
  cholesterolTotal: number;
  cholesterolHDL: number;
  cholesterolLDL: number;
  triglycerides: number;
  bloodGlucose: number;
  calculatedRisk: number; // percentage risk
  recommendations: string[];
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'alert' | 'achievement' | 'insight';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  actionURL?: string;
}

// Dashboard types
export interface HealthSummary {
  stressLevel: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  steps: number;
  sleepHours: number;
  heartRiskScore: number;
  insights: string[];
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}