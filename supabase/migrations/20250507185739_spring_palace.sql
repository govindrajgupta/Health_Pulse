/*
  # Health Tracking Database Schema

  1. New Tables
    - health_profiles
      - User health profile data (age, gender, height, weight, etc.)
    - stress_records
      - Stress test results and HRV measurements
    - meals
      - Diet and nutrition records
    - food_items
      - Individual food items in meals
    - activity_records
      - Daily activity metrics (steps, distance, calories)
    - workouts
      - Specific workout sessions
    - sleep_records
      - Sleep duration and quality metrics
    - heart_risk_assessments
      - Cardiovascular health metrics and risk scores
    - notifications
      - User health notifications and reminders

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Health Profiles
CREATE TABLE IF NOT EXISTS health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  age int,
  gender text,
  height numeric,
  weight numeric,
  activity_level text,
  health_goals text[],
  medical_conditions text[],
  smoking_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Stress Records
CREATE TABLE IF NOT EXISTS stress_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stress_level int,
  hrv_reading numeric,
  symptoms text[],
  notes text,
  recorded_at timestamptz DEFAULT now()
);

-- Meals
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type text,
  total_calories numeric,
  total_protein numeric,
  total_carbs numeric,
  total_fat numeric,
  photo_url text,
  notes text,
  nutritional_score int,
  recorded_at timestamptz DEFAULT now()
);

-- Food Items
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid REFERENCES meals(id) ON DELETE CASCADE,
  name text,
  portion numeric,
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric
);

-- Activity Records
CREATE TABLE IF NOT EXISTS activity_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  steps int,
  distance numeric,
  active_minutes int,
  calories_burned numeric,
  recorded_at timestamptz DEFAULT now()
);

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_record_id uuid REFERENCES activity_records(id) ON DELETE CASCADE,
  activity_type text,
  duration int,
  calories_burned numeric,
  intensity text,
  notes text,
  recorded_at timestamptz DEFAULT now()
);

-- Sleep Records
CREATE TABLE IF NOT EXISTS sleep_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bed_time timestamptz,
  wake_time timestamptz,
  duration int,
  quality int,
  deep_sleep_minutes int,
  rem_sleep_minutes int,
  light_sleep_minutes int,
  awake_minutes int,
  notes text,
  recorded_at timestamptz DEFAULT now()
);

-- Heart Risk Assessments
CREATE TABLE IF NOT EXISTS heart_risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  systolic_bp int,
  diastolic_bp int,
  cholesterol_total numeric,
  cholesterol_hdl numeric,
  cholesterol_ldl numeric,
  triglycerides numeric,
  blood_glucose numeric,
  calculated_risk numeric,
  recommendations text[],
  recorded_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text,
  title text,
  message text,
  action_url text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE heart_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Health Profiles
CREATE POLICY "Users can view own health profile"
  ON health_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health profile"
  ON health_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health profile"
  ON health_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Stress Records
CREATE POLICY "Users can view own stress records"
  ON stress_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stress records"
  ON stress_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Meals
CREATE POLICY "Users can view own meals"
  ON meals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meals"
  ON meals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Food Items
CREATE POLICY "Users can view own food items"
  ON food_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meals
    WHERE meals.id = food_items.meal_id
    AND meals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own food items"
  ON food_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM meals
    WHERE meals.id = food_items.meal_id
    AND meals.user_id = auth.uid()
  ));

-- Activity Records
CREATE POLICY "Users can view own activity records"
  ON activity_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity records"
  ON activity_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Workouts
CREATE POLICY "Users can view own workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM activity_records
    WHERE activity_records.id = workouts.activity_record_id
    AND activity_records.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own workouts"
  ON workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM activity_records
    WHERE activity_records.id = workouts.activity_record_id
    AND activity_records.user_id = auth.uid()
  ));

-- Sleep Records
CREATE POLICY "Users can view own sleep records"
  ON sleep_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sleep records"
  ON sleep_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Heart Risk Assessments
CREATE POLICY "Users can view own heart risk assessments"
  ON heart_risk_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own heart risk assessments"
  ON heart_risk_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);