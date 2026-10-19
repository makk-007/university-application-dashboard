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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      amount_history: {
        Row: {
          changed_at: string | null
          currency: string
          from_amount: number | null
          id: string
          scholarship_id: string | null
          to_amount: number
          university_id: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          currency: string
          from_amount?: number | null
          id?: string
          scholarship_id?: string | null
          to_amount: number
          university_id?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          currency?: string
          from_amount?: number | null
          id?: string
          scholarship_id?: string | null
          to_amount?: number
          university_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "amount_history_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amount_history_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      application_cycles: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          is_archived: boolean
          name: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      checklist: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          item: string
          sort_order: number
          university_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          item: string
          sort_order?: number
          university_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          item?: string
          sort_order?: number
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_checklist: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          item: string
          scholarship_id: string
          sort_order: number
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          item: string
          scholarship_id: string
          sort_order?: number
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          item?: string
          scholarship_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_checklist_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_universities: {
        Row: {
          id: string
          scholarship_id: string
          university_id: string
        }
        Insert: {
          id?: string
          scholarship_id: string
          university_id: string
        }
        Update: {
          id?: string
          scholarship_id?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_universities_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_universities_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number | null
          coverage: string | null
          created_at: string | null
          currency: string | null
          cycle_id: string | null
          deadline: string | null
          id: string
          link: string | null
          name: string
          notes: string | null
          start_date: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          coverage?: string | null
          created_at?: string | null
          currency?: string | null
          cycle_id?: string | null
          deadline?: string | null
          id?: string
          link?: string | null
          name: string
          notes?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          coverage?: string | null
          created_at?: string | null
          currency?: string | null
          cycle_id?: string | null
          deadline?: string | null
          id?: string
          link?: string | null
          name?: string
          notes?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "application_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      status_history: {
        Row: {
          changed_at: string | null
          from_status: string | null
          id: string
          scholarship_id: string | null
          to_status: string
          university_id: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          from_status?: string | null
          id?: string
          scholarship_id?: string | null
          to_status: string
          university_id?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          from_status?: string | null
          id?: string
          scholarship_id?: string | null
          to_status?: string
          university_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          application_link: string | null
          created_at: string | null
          currency: string | null
          cycle_id: string | null
          deadline: string | null
          id: string
          name: string
          notes: string | null
          region: string
          start_date: string | null
          status: string
          tuition: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_link?: string | null
          created_at?: string | null
          currency?: string | null
          cycle_id?: string | null
          deadline?: string | null
          id?: string
          name: string
          notes?: string | null
          region: string
          start_date?: string | null
          status?: string
          tuition?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_link?: string | null
          created_at?: string | null
          currency?: string | null
          cycle_id?: string | null
          deadline?: string | null
          id?: string
          name?: string
          notes?: string | null
          region?: string
          start_date?: string | null
          status?: string
          tuition?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "universities_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "application_cycles"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
