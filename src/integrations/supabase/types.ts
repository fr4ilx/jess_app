// This file shape mirrors what `supabase gen types typescript` would output
// for the schema in supabase/migrations/20260510120000_profiles_init.sql.
// Regenerate it via the Supabase CLI once installed; until then maintain it by hand
// alongside the migration.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          date_of_birth: string | null
          sex_at_birth: "male" | "female" | "intersex" | "prefer_not_to_say" | null
          height_cm: number | null
          weight_kg: number | null
          activity_level: "sedentary" | "light" | "moderate" | "high" | null
          goal: "lose" | "maintain" | "gain" | null
          glp1_question_answered: boolean
          glp1_medication: string | null
          glp1_brand: string | null
          glp1_dose_mg: number | null
          glp1_start_date: string | null
          glp1_schedule: "daily" | "weekly" | "biweekly" | "monthly" | null
          cardiovascular_conditions: string[]
          comorbidities: string[]
          other_medications: string[]
          dietary_restrictions: string[]
          food_allergies: string[]
          cardiac_step_completed_at: string | null
          custom_calories_target: number | null
          custom_protein_target: number | null
          custom_carbs_target: number | null
          custom_fat_target: number | null
          custom_saturated_fat_target: number | null
          custom_sodium_target: number | null
          custom_fiber_target: number | null
          custom_added_sugars_target: number | null
          goals_step_completed_at: string | null
          onboarding_completed_at: string | null
          allow_image_storage: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          date_of_birth?: string | null
          sex_at_birth?: "male" | "female" | "intersex" | "prefer_not_to_say" | null
          height_cm?: number | null
          weight_kg?: number | null
          activity_level?: "sedentary" | "light" | "moderate" | "high" | null
          goal?: "lose" | "maintain" | "gain" | null
          glp1_question_answered?: boolean
          glp1_medication?: string | null
          glp1_brand?: string | null
          glp1_dose_mg?: number | null
          glp1_start_date?: string | null
          glp1_schedule?: "daily" | "weekly" | "biweekly" | "monthly" | null
          cardiovascular_conditions?: string[]
          comorbidities?: string[]
          other_medications?: string[]
          dietary_restrictions?: string[]
          food_allergies?: string[]
          cardiac_step_completed_at?: string | null
          custom_calories_target?: number | null
          custom_protein_target?: number | null
          custom_carbs_target?: number | null
          custom_fat_target?: number | null
          custom_saturated_fat_target?: number | null
          custom_sodium_target?: number | null
          custom_fiber_target?: number | null
          custom_added_sugars_target?: number | null
          goals_step_completed_at?: string | null
          onboarding_completed_at?: string | null
          allow_image_storage?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date_of_birth?: string | null
          sex_at_birth?: "male" | "female" | "intersex" | "prefer_not_to_say" | null
          height_cm?: number | null
          weight_kg?: number | null
          activity_level?: "sedentary" | "light" | "moderate" | "high" | null
          goal?: "lose" | "maintain" | "gain" | null
          glp1_question_answered?: boolean
          glp1_medication?: string | null
          glp1_brand?: string | null
          glp1_dose_mg?: number | null
          glp1_start_date?: string | null
          glp1_schedule?: "daily" | "weekly" | "biweekly" | "monthly" | null
          cardiovascular_conditions?: string[]
          comorbidities?: string[]
          other_medications?: string[]
          dietary_restrictions?: string[]
          food_allergies?: string[]
          cardiac_step_completed_at?: string | null
          custom_calories_target?: number | null
          custom_protein_target?: number | null
          custom_carbs_target?: number | null
          custom_fat_target?: number | null
          custom_saturated_fat_target?: number | null
          custom_sodium_target?: number | null
          custom_fiber_target?: number | null
          custom_added_sugars_target?: number | null
          goals_step_completed_at?: string | null
          onboarding_completed_at?: string | null
          allow_image_storage?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
