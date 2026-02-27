/* ─────────────────────────────────────────────────────────
   Database type definitions for Supabase.
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
        Insert: {
          id: string;
          name?: string | null;
          avatar?: string | null;
          bio?: string | null;
          email?: string | null;
          goals?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          avatar?: string | null;
          bio?: string | null;
          email?: string | null;
          goals?: string[] | null;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          purpose?: string | null;
          final_goal?: string | null;
          frequency?: string;
          frequency_days?: number[] | null;
          color?: string;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          purpose?: string | null;
          final_goal?: string | null;
          frequency?: string;
          frequency_days?: number[] | null;
          color?: string;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          completed_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          completed_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          completed_date?: string;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          color?: string;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          color?: string;
          date?: string;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          saving_per_day?: number;
          color?: string;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          saving_per_day?: number;
          color?: string;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
        };
      };
      savings_skipped_days: {
        Row: {
          id: string;
          step_id: string;
          skipped_date: string;
        };
        Insert: {
          id?: string;
          step_id: string;
          skipped_date: string;
        };
        Update: {
          id?: string;
          step_id?: string;
          skipped_date?: string;
        };
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
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          monthly_budget?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          monthly_budget?: number;
          created_at?: string;
        };
      };
      expense_entries: {
        Row: {
          id: string;
          category_id: string;
          date: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          date: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          date?: string;
          amount?: number;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          amount?: number;
          source: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          amount?: number;
          source?: string;
          description?: string | null;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          asset_type?: string;
          balance?: number;
          credit_limit?: number | null;
          institution?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          asset_type?: string;
          balance?: number;
          credit_limit?: number | null;
          institution?: string | null;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          goal_amount?: number;
          assigned_amount?: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          goal_amount?: number;
          assigned_amount?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      finance_settings: {
        Row: {
          user_id: string;
          annual_savings_goal: number;
        };
        Insert: {
          user_id: string;
          annual_savings_goal?: number;
        };
        Update: {
          user_id?: string;
          annual_savings_goal?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
