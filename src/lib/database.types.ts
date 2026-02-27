/* ─────────────────────────────────────────────────────────
   Generated Database type definitions for Supabase.
   Keep in sync with supabase/migration.sql.
   ───────────────────────────────────────────────────────── */

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string | null;
          avatar: string | null;
          bio: string | null;
          email: string | null;
          goals: string[] | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['user_profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          purpose: string | null;
          final_goal: string | null;
          frequency: string;
          frequency_days: number[] | null;
          color: string;
          start_date: string;
          end_date: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['habits']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['habits']['Row']>;
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          completed_date: string;
          created_at: string;
        };
        Insert: { habit_id: string; completed_date: string };
        Update: Partial<Database['public']['Tables']['habit_completions']['Row']>;
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          color: string;
          date: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['journal_entries']['Row']> & { user_id: string; title: string };
        Update: Partial<Database['public']['Tables']['journal_entries']['Row']>;
      };
      savings_steps: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          saving_per_day: number;
          color: string;
          start_date: string;
          end_date: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['savings_steps']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['savings_steps']['Row']>;
      };
      savings_skipped_days: {
        Row: {
          id: string;
          step_id: string;
          skipped_date: string;
        };
        Insert: { step_id: string; skipped_date: string };
        Update: Partial<Database['public']['Tables']['savings_skipped_days']['Row']>;
      };
      expense_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          monthly_budget: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['expense_categories']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['expense_categories']['Row']>;
      };
      expense_entries: {
        Row: {
          id: string;
          category_id: string;
          date: string;
          amount: number;
          created_at: string;
        };
        Insert: { category_id: string; date: string; amount: number };
        Update: Partial<Database['public']['Tables']['expense_entries']['Row']>;
      };
      income_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          source: string;
          description: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['income_entries']['Row']> & { user_id: string; source: string };
        Update: Partial<Database['public']['Tables']['income_entries']['Row']>;
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          asset_type: string;
          balance: number;
          credit_limit: number | null;
          institution: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['assets']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['assets']['Row']>;
      };
      targets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          goal_amount: number;
          assigned_amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['targets']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['targets']['Row']>;
      };
      finance_settings: {
        Row: {
          user_id: string;
          annual_savings_goal: number;
        };
        Insert: { user_id: string; annual_savings_goal?: number };
        Update: Partial<Database['public']['Tables']['finance_settings']['Row']>;
      };
    };
  };
}
