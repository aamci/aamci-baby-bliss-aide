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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      child_parents: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_id: string
          role: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
          role?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_parents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          birth_date: string
          birth_height: number | null
          birth_weight: number | null
          blood_type: string | null
          created_at: string
          doctor_name: string | null
          first_name: string
          gender: string | null
          id: string
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          birth_date: string
          birth_height?: number | null
          birth_weight?: number | null
          blood_type?: string | null
          created_at?: string
          doctor_name?: string | null
          first_name: string
          gender?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          birth_date?: string
          birth_height?: number | null
          birth_weight?: number | null
          blood_type?: string | null
          created_at?: string
          doctor_name?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      co_parent_invites: {
        Row: {
          child_id: string
          created_at: string
          expires_at: string
          id: string
          invite_email: string | null
          invite_phone: string | null
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          child_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invite_email?: string | null
          invite_phone?: string | null
          invited_by: string
          status?: string
          token?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invite_email?: string | null
          invite_phone?: string | null
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "co_parent_invites_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          child_id: string
          created_at: string
          id: string
          measured_at: string
          measurement_type: string
          recorded_by: string | null
          value: number
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          measured_at?: string
          measurement_type: string
          recorded_by?: string | null
          value: number
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          measured_at?: string
          measurement_type?: string
          recorded_by?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "measurements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          acquired: boolean
          acquired_at: string | null
          child_id: string
          created_at: string
          domain: string
          expected_age: string | null
          id: string
          name: string
        }
        Insert: {
          acquired?: boolean
          acquired_at?: string | null
          child_id: string
          created_at?: string
          domain: string
          expected_age?: string | null
          id?: string
          name: string
        }
        Update: {
          acquired?: boolean
          acquired_at?: string | null
          child_id?: string
          created_at?: string
          domain?: string
          expected_age?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          blood_type: string | null
          created_at: string
          doctor_name: string | null
          first_name: string
          id: string
          last_name: string
          medical_history: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          doctor_name?: string | null
          first_name?: string
          id: string
          last_name?: string
          medical_history?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          doctor_name?: string | null
          first_name?: string
          id?: string
          last_name?: string
          medical_history?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_articles: {
        Row: {
          article_author: string | null
          article_category: string | null
          article_slug: string
          article_title: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_author?: string | null
          article_category?: string | null
          article_slug: string
          article_title: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_author?: string | null
          article_category?: string | null
          article_slug?: string
          article_title?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      vaccines: {
        Row: {
          administered_at: string | null
          child_id: string
          created_at: string
          dose_number: number | null
          id: string
          name: string
          recommended_age: string | null
          status: string
        }
        Insert: {
          administered_at?: string | null
          child_id: string
          created_at?: string
          dose_number?: number | null
          id?: string
          name: string
          recommended_age?: string | null
          status?: string
        }
        Update: {
          administered_at?: string | null
          child_id?: string
          created_at?: string
          dose_number?: number | null
          id?: string
          name?: string
          recommended_age?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccines_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          child_id: string
          created_at: string
          doctor_name: string | null
          id: string
          name: string
          notes: string | null
          status: string
          visit_date: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          doctor_name?: string | null
          id?: string
          name: string
          notes?: string | null
          status?: string
          visit_date?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          doctor_name?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_child_parent: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
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
