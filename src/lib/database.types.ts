export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      health_profiles: {
        Row: {
          id: string
          user_id: string
          age: number | null
          gender: string | null
          height: number | null
          weight: number | null
          activity_level: string | null
          health_goals: string[] | null
          medical_conditions: string[] | null
          smoking_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          health_goals?: string[] | null
          medical_conditions?: string[] | null
          smoking_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          health_goals?: string[] | null
          medical_conditions?: string[] | null
          smoking_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stress_records: {
        Row: {
          id: string
          user_id: string
          stress_level: number | null
          hrv_reading: number | null
          symptoms: string[] | null
          notes: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stress_level?: number | null
          hrv_reading?: number | null
          symptoms?: string[] | null
          notes?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stress_level?: number | null
          hrv_reading?: number | null
          symptoms?: string[] | null
          notes?: string | null
          recorded_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_type: string | null
          total_calories: number | null
          total_protein: number | null
          total_carbs: number | null
          total_fat: number | null
          photo_url: string | null
          notes: string | null
          nutritional_score: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_type?: string | null
          total_calories?: number | null
          total_protein?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          photo_url?: string | null
          notes?: string | null
          nutritional_score?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_type?: string | null
          total_calories?: number | null
          total_protein?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          photo_url?: string | null
          notes?: string | null
          nutritional_score?: number | null
          recorded_at?: string
        }
      }
      food_items: {
        Row: {
          id: string
          meal_id: string
          name: string | null
          portion: number | null
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
        }
        Insert: {
          id?: string
          meal_id: string
          name?: string | null
          portion?: number | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
        }
        Update: {
          id?: string
          meal_id?: string
          name?: string | null
          portion?: number | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
        }
      }
      activity_records: {
        Row: {
          id: string
          user_id: string
          steps: number | null
          distance: number | null
          active_minutes: number | null
          calories_burned: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          steps?: number | null
          distance?: number | null
          active_minutes?: number | null
          calories_burned?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          steps?: number | null
          distance?: number | null
          active_minutes?: number | null
          calories_burned?: number | null
          recorded_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          activity_record_id: string
          activity_type: string | null
          duration: number | null
          calories_burned: number | null
          intensity: string | null
          notes: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          activity_record_id: string
          activity_type?: string | null
          duration?: number | null
          calories_burned?: number | null
          intensity?: string | null
          notes?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
          activity_record_id?: string
          activity_type?: string | null
          duration?: number | null
          calories_burned?: number | null
          intensity?: string | null
          notes?: string | null
          recorded_at?: string
        }
      }
      sleep_records: {
        Row: {
          id: string
          user_id: string
          bed_time: string | null
          wake_time: string | null
          duration: number | null
          quality: number | null
          deep_sleep_minutes: number | null
          rem_sleep_minutes: number | null
          light_sleep_minutes: number | null
          awake_minutes: number | null
          notes: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bed_time?: string | null
          wake_time?: string | null
          duration?: number | null
          quality?: number | null
          deep_sleep_minutes?: number | null
          rem_sleep_minutes?: number | null
          light_sleep_minutes?: number | null
          awake_minutes?: number | null
          notes?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bed_time?: string | null
          wake_time?: string | null
          duration?: number | null
          quality?: number | null
          deep_sleep_minutes?: number | null
          rem_sleep_minutes?: number | null
          light_sleep_minutes?: number | null
          awake_minutes?: number | null
          notes?: string | null
          recorded_at?: string
        }
      }
      heart_risk_assessments: {
        Row: {
          id: string
          user_id: string
          systolic_bp: number | null
          diastolic_bp: number | null
          cholesterol_total: number | null
          cholesterol_hdl: number | null
          cholesterol_ldl: number | null
          triglycerides: number | null
          blood_glucose: number | null
          calculated_risk: number | null
          recommendations: string[] | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          systolic_bp?: number | null
          diastolic_bp?: number | null
          cholesterol_total?: number | null
          cholesterol_hdl?: number | null
          cholesterol_ldl?: number | null
          triglycerides?: number | null
          blood_glucose?: number | null
          calculated_risk?: number | null
          recommendations?: string[] | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          systolic_bp?: number | null
          diastolic_bp?: number | null
          cholesterol_total?: number | null
          cholesterol_hdl?: number | null
          cholesterol_ldl?: number | null
          triglycerides?: number | null
          blood_glucose?: number | null
          calculated_risk?: number | null
          recommendations?: string[] | null
          recorded_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string | null
          title: string | null
          message: string | null
          action_url: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: string | null
          title?: string | null
          message?: string | null
          action_url?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string | null
          title?: string | null
          message?: string | null
          action_url?: string | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}