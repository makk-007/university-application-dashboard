import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          region: string;
          tuition: number;
          currency: string;
          start_date: string | null;
          deadline: string | null;
          status: string;
          notes: string;
          application_link: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['universities']['Row'], 'id' | 'user_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['universities']['Insert']>;
      };
      scholarships: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          currency: string;
          coverage: string;
          status: string;
          notes: string;
          link: string;
          start_date: string | null;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['scholarships']['Row'], 'id' | 'user_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['scholarships']['Insert']>;
      };
      checklist: {
        Row: {
          id: string;
          university_id: string;
          item: string;
          completed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['checklist']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['checklist']['Insert']>;
      };
      scholarship_checklist: {
        Row: {
          id: string;
          scholarship_id: string;
          item: string;
          completed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['scholarship_checklist']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['scholarship_checklist']['Insert']>;
      };
      scholarship_universities: {
        Row: {
          id: string;
          scholarship_id: string;
          university_id: string;
        };
        Insert: Omit<Database['public']['Tables']['scholarship_universities']['Row'], 'id'>;
        Update: never;
      };
    };
  };
};
