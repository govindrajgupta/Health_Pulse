import { addDays, subDays, format, subHours, addHours } from 'date-fns';
import {
  StressData,
  StressQuestion,
  MealEntry,
  FoodItem,
  ActivityData,
  Workout,
  SleepData,
  HeartRiskData,
  Notification,
  HealthSummary,
  ChartData
} from '../types';

// Helper function to get random number in range
const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Current date for reference
const today = new Date();

// Mock User ID
export const MOCK_USER_ID = 'user123';

// Mock stress questions
export const mockStressQuestions: StressQuestion[] = [
  {
    id: 'q1',
    question: 'How would you rate your stress level today?',
    options: [
      { value: 1, label: 'Very relaxed' },
      { value: 3, label: 'Somewhat relaxed' },
      { value: 5, label: 'Neutral' },
      { value: 7, label: 'Somewhat stressed' },
      { value: 10, label: 'Very stressed' }
    ]
  },
  {
    id: 'q2',
    question: 'How well have you been able to control irritations in your life?',
    options: [
      { value: 1, label: 'Very well' },
      { value: 3, label: 'Fairly well' },
      { value: 5, label: 'Sometimes well' },
      { value: 7, label: 'Not very well' },
      { value: 10, label: 'Not at all' }
    ]
  },
  {
    id: 'q3',
    question: 'How often have you felt that things were going your way?',
    options: [
      { value: 1, label: 'Very often' },
      { value: 3, label: 'Fairly often' },
      { value: 5, label: 'Sometimes' },
      { value: 7, label: 'Almost never' },
      { value: 10, label: 'Never' }
    ]
  },
  {
    id: 'q4',
    question: 'How often have you felt confident about your ability to handle personal problems?',
    options: [
      { value: 1, label: 'Very often' },
      { value: 3, label: 'Fairly often' },
      { value: 5, label: 'Sometimes' },
      { value: 7, label: 'Almost never' },
      { value: 10, label: 'Never' }
    ]
  },
  {
    id: 'q5',
    question: 'How often have you felt that you were on top of things?',
    options: [
      { value: 1, label: 'Very often' },
      { value: 3, label: 'Fairly often' },
      { value: 5, label: 'Sometimes' },
      { value: 7, label: 'Almost never' },
      { value: 10, label: 'Never' }
    ]
  }
];

// Generate mock stress data for the past week
export const generateMockStressData = (): StressData[] => {
  const stressData: StressData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    
    stressData.push({
      id: `stress-${i}`,
      userId: MOCK_USER_ID,
      date,
      level: getRandomNumber(3, 8),
      symptoms: getRandomNumber(0, 1) === 0 ? [] : ['headache', 'fatigue', 'irritability'].slice(0, getRandomNumber(1, 3)),
      hrvReading: getRandomNumber(50, 90),
      notes: ''
    });
  }
  
  return stressData.reverse();
};

// Generate mock food items 
const mockFoodItems: FoodItem[] = [
  { id: 'f1', name: 'Oatmeal', portion: 100, calories: 150, protein: 5, carbs: 25, fat: 3 },
  { id: 'f2', name: 'Banana', portion: 120, calories: 105, protein: 1, carbs: 27, fat: 0 },
  { id: 'f3', name: 'Scrambled Eggs', portion: 150, calories: 220, protein: 14, carbs: 2, fat: 16 },
  { id: 'f4', name: 'Whole Wheat Bread', portion: 50, calories: 130, protein: 4, carbs: 23, fat: 2 },
  { id: 'f5', name: 'Chicken Breast', portion: 150, calories: 240, protein: 42, carbs: 0, fat: 7 },
  { id: 'f6', name: 'Brown Rice', portion: 150, calories: 160, protein: 3, carbs: 34, fat: 1 },
  { id: 'f7', name: 'Broccoli', portion: 100, calories: 55, protein: 3, carbs: 11, fat: 0 },
  { id: 'f8', name: 'Salmon', portion: 150, calories: 280, protein: 30, carbs: 0, fat: 18 },
  { id: 'f9', name: 'Greek Yogurt', portion: 150, calories: 130, protein: 17, carbs: 9, fat: 0 },
  { id: 'f10', name: 'Apple', portion: 150, calories: 80, protein: 0, carbs: 21, fat: 0 },
  { id: 'f11', name: 'Almonds', portion: 30, calories: 180, protein: 6, carbs: 6, fat: 14 },
  { id: 'f12', name: 'Avocado', portion: 100, calories: 160, protein: 2, carbs: 8, fat: 15 }
];

// Generate mock meal entries for the past week
export const generateMockMealEntries = (): MealEntry[] => {
  const mealEntries: MealEntry[] = [];
  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    
    // Generate 3-4 meals per day
    for (let j = 0; j < getRandomNumber(3, 4); j++) {
      const mealType = mealTypes[j % 3]; // Ensure we have breakfast, lunch, dinner
      const foods = [];
      
      // Add 1-3 foods per meal
      for (let k = 0; k < getRandomNumber(1, 3); k++) {
        foods.push({...getRandomItem(mockFoodItems)});
      }
      
      // Calculate totals
      const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);
      const totalCarbs = foods.reduce((sum, food) => sum + food.carbs, 0);
      const totalFat = foods.reduce((sum, food) => sum + food.fat, 0);
      
      mealEntries.push({
        id: `meal-${i}-${j}`,
        userId: MOCK_USER_ID,
        date,
        mealType,
        foods,
        notes: '',
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        nutritionalScore: getRandomNumber(5, 9)
      });
    }
  }
  
  return mealEntries;
};

// Generate mock workout types
const workoutTypes = [
  'Running',
  'Cycling',
  'Swimming',
  'Weight Training',
  'Yoga',
  'HIIT',
  'Walking'
];

// Generate mock activity data for the past week
export const generateMockActivityData = (): ActivityData[] => {
  const activityData: ActivityData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    const steps = getRandomNumber(5000, 12000);
    const distance = +(steps / 1300).toFixed(2); // Approximate km based on steps
    const activeMinutes = getRandomNumber(30, 120);
    const basalCalories = getRandomNumber(1600, 1800); // Base metabolic rate calories
    const activityCalories = getRandomNumber(200, 600); // Activity calories
    
    // Generate 0-2 workouts for the day
    const workouts: Workout[] = [];
    const workoutCount = getRandomNumber(0, 2);
    
    for (let j = 0; j < workoutCount; j++) {
      const duration = getRandomNumber(20, 90);
      const intensity = getRandomItem(['low', 'moderate', 'high']) as 'low' | 'moderate' | 'high';
      const workoutCalories = intensity === 'high' ? duration * 10 : intensity === 'moderate' ? duration * 7 : duration * 4;
      
      workouts.push({
        id: `workout-${i}-${j}`,
        activityType: getRandomItem(workoutTypes),
        duration,
        caloriesBurned: workoutCalories,
        intensity,
        notes: ''
      });
    }
    
    // Add workout calories to total
    const workoutCalories = workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
    
    activityData.push({
      id: `activity-${i}`,
      userId: MOCK_USER_ID,
      date,
      steps,
      distance,
      activeMinutes,
      caloriesBurned: basalCalories + activityCalories + workoutCalories,
      workouts
    });
  }
  
  return activityData.reverse();
};

// Generate mock sleep data for the past week
export const generateMockSleepData = (): SleepData[] => {
  const sleepData: SleepData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    const bedTime = subHours(date, getRandomNumber(8, 10)); // 8-10 hours before wakeup
    const wakeTime = addHours(date, 7); // Around 7 AM
    const duration = Math.floor((wakeTime.getTime() - bedTime.getTime()) / (1000 * 60)); // Duration in minutes
    
    const quality = getRandomNumber(5, 9);
    const deepSleepPercentage = getRandomNumber(15, 25) / 100;
    const remSleepPercentage = getRandomNumber(20, 25) / 100;
    const lightSleepPercentage = getRandomNumber(45, 55) / 100;
    const awakePercentage = 1 - deepSleepPercentage - remSleepPercentage - lightSleepPercentage;
    
    sleepData.push({
      id: `sleep-${i}`,
      userId: MOCK_USER_ID,
      date,
      bedTime,
      wakeTime,
      duration,
      quality,
      deepSleepMinutes: Math.floor(duration * deepSleepPercentage),
      remSleepMinutes: Math.floor(duration * remSleepPercentage),
      lightSleepMinutes: Math.floor(duration * lightSleepPercentage),
      awakeMinutes: Math.floor(duration * awakePercentage),
      notes: ''
    });
  }
  
  return sleepData.reverse();
};

// Generate mock heart risk data
export const generateMockHeartRiskData = (): HeartRiskData => {
  return {
    id: 'heart-risk-1',
    userId: MOCK_USER_ID,
    date: today,
    systolicBP: getRandomNumber(110, 140),
    diastolicBP: getRandomNumber(70, 90),
    cholesterolTotal: getRandomNumber(150, 220),
    cholesterolHDL: getRandomNumber(40, 60),
    cholesterolLDL: getRandomNumber(90, 130),
    triglycerides: getRandomNumber(100, 180),
    bloodGlucose: getRandomNumber(80, 120),
    calculatedRisk: getRandomNumber(5, 15),
    recommendations: [
      'Maintain a heart-healthy diet rich in fruits, vegetables, and whole grains',
      'Aim for at least 150 minutes of moderate aerobic exercise weekly',
      'Limit sodium intake to 2,300mg per day',
      'Consider monitoring blood pressure regularly'
    ]
  };
};

// Generate mock notifications
export const generateMockNotifications = (): Notification[] => {
  return [
    {
      id: 'notif-1',
      userId: MOCK_USER_ID,
      type: 'reminder',
      title: 'Time to log your meals',
      message: "Don't forget to record what you've eaten today for accurate nutrition tracking.",
      date: subHours(new Date(), 2),
      read: false
    },
    {
      id: 'notif-2',
      userId: MOCK_USER_ID,
      type: 'achievement',
      title: 'Step Goal Reached!',
      message: "Congratulations! You've reached your daily step goal of 10,000 steps.",
      date: subHours(new Date(), 5),
      read: true
    },
    {
      id: 'notif-3',
      userId: MOCK_USER_ID,
      type: 'insight',
      title: 'Sleep Pattern Analysis',
      message: "Your sleep quality has improved by 15% this week. Keep maintaining your regular sleep schedule!",
      date: subDays(new Date(), 1),
      read: false,
      actionURL: '/sleep'
    },
    {
      id: 'notif-4',
      userId: MOCK_USER_ID,
      type: 'alert',
      title: 'High Stress Detected',
      message: "Your recent stress levels have been elevated. Consider trying some relaxation techniques.",
      date: subHours(new Date(), 12),
      read: false,
      actionURL: '/stress'
    }
  ];
};

// Generate mock health summary for dashboard
export const generateMockHealthSummary = (): HealthSummary => {
  return {
    stressLevel: getRandomNumber(3, 7),
    caloriesConsumed: getRandomNumber(1800, 2400),
    caloriesBurned: getRandomNumber(2000, 2600),
    steps: getRandomNumber(7000, 12000),
    sleepHours: getRandomNumber(6, 8),
    heartRiskScore: getRandomNumber(5, 15),
    insights: [
      'Your stress levels have decreased by 12% compared to last week',
      'You consumed 15% more protein than your weekly average',
      'Your sleep quality is improving based on recent trends',
      'Consider increasing your water intake for better hydration'
    ]
  };
};

// Generate mock chart data for different metrics
export const generateMockChartData = (metric: string): ChartData => {
  // Generate labels for the past 7 days
  const labels = Array.from({ length: 7 }, (_, i) => 
    format(subDays(today, 6 - i), 'MMM d')
  );
  
  let data: number[] = [];
  let label = '';
  let borderColor = '';
  
  switch(metric) {
    case 'stress':
      label = 'Stress Level';
      data = Array.from({ length: 7 }, () => getRandomNumber(3, 8));
      borderColor = '#ef4444'; // red
      break;
    case 'calories':
      label = 'Calories';
      data = Array.from({ length: 7 }, () => getRandomNumber(1800, 2400));
      borderColor = '#f59e0b'; // amber
      break;
    case 'steps':
      label = 'Steps';
      data = Array.from({ length: 7 }, () => getRandomNumber(5000, 12000));
      borderColor = '#3b82f6'; // blue
      break;
    case 'sleep':
      label = 'Sleep Hours';
      data = Array.from({ length: 7 }, () => getRandomNumber(5, 9));
      borderColor = '#8b5cf6'; // purple
      break;
    case 'heartRate':
      label = 'Resting Heart Rate';
      data = Array.from({ length: 7 }, () => getRandomNumber(60, 80));
      borderColor = '#ef4444'; // red
      break;
    default:
      label = 'Value';
      data = Array.from({ length: 7 }, () => getRandomNumber(0, 100));
      borderColor = '#3b82f6'; // blue
  }
  
  return {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor,
        backgroundColor: borderColor + '20', // Add transparency
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };
};