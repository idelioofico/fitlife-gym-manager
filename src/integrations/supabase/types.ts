export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          name: string
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      checkins: {
        Row: {
          check_time: string | null
          check_type: string
          created_at: string | null
          id: string
          member_id: string
        }
        Insert: {
          check_time?: string | null
          check_type: string
          created_at?: string | null
          id?: string
          member_id: string
        }
        Update: {
          check_time?: string | null
          check_type?: string
          created_at?: string | null
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          color: string | null
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          instructor: string
          max_participants: number | null
          start_time: string
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          instructor: string
          max_participants?: number | null
          start_time: string
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          instructor?: string
          max_participants?: number | null
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          muscle_group: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          muscle_group: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          muscle_group?: string
          name?: string
        }
        Relationships: []
      }
      member_workouts: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          id: string
          member_id: string
          progress: number | null
          workout_id: string
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string
          member_id: string
          progress?: number | null
          workout_id: string
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string
          member_id?: string
          progress?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_workouts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_workouts_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          end_date: string | null
          id: string
          join_date: string | null
          name: string
          phone: string | null
          plan: string | null
          plan_id: string | null
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          end_date?: string | null
          id?: string
          join_date?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          plan_id?: string | null
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          end_date?: string | null
          id?: string
          join_date?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          plan_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          class_reminders: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: number
          marketing_messages: boolean | null
          payment_reminders: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
        }
        Insert: {
          class_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: number
          marketing_messages?: boolean | null
          payment_reminders?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
        }
        Update: {
          class_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: number
          marketing_messages?: boolean | null
          payment_reminders?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          member_id: string
          method: string
          payment_date: string | null
          plan: string
          reference_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          member_id: string
          method: string
          payment_date?: string | null
          plan: string
          reference_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          member_id?: string
          method?: string
          payment_date?: string | null
          plan?: string
          reference_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          member_id: string
          status: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          member_id: string
          status?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          member_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          address: string | null
          auto_backup: boolean | null
          business_hours: string | null
          cash_enabled: boolean | null
          created_at: string | null
          email: string | null
          emola_enabled: boolean | null
          emola_number: string | null
          gym_name: string | null
          id: number
          mpesa_enabled: boolean | null
          mpesa_number: string | null
          netshop_enabled: boolean | null
          netshop_id: string | null
          payment_reminder_days: number | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          auto_backup?: boolean | null
          business_hours?: string | null
          cash_enabled?: boolean | null
          created_at?: string | null
          email?: string | null
          emola_enabled?: boolean | null
          emola_number?: string | null
          gym_name?: string | null
          id?: number
          mpesa_enabled?: boolean | null
          mpesa_number?: string | null
          netshop_enabled?: boolean | null
          netshop_id?: string | null
          payment_reminder_days?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          auto_backup?: boolean | null
          business_hours?: string | null
          cash_enabled?: boolean | null
          created_at?: string | null
          email?: string | null
          emola_enabled?: boolean | null
          emola_number?: string | null
          gym_name?: string | null
          id?: number
          mpesa_enabled?: boolean | null
          mpesa_number?: string | null
          netshop_enabled?: boolean | null
          netshop_id?: string | null
          payment_reminder_days?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          reps: string | null
          sets: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          reps?: string | null
          sets?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          reps?: string | null
          sets?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
