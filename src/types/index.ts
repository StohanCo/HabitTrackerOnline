export interface Habit {
  id: string;
  name: string;
  description: string;
  purpose: string;
  finalGoal: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  frequencyDays?: number[]; // 0=Sun..6=Sat for weekly
  color: string;
  startDate: string; // ISO date string
  endDate?: string;
  completedDays: string[]; // ISO date strings when actually done
  createdAt: string;
}

export interface UserProfile {
  name: string;
  avatar: string; // URL or initials
  bio: string;
  goals: string[];
  email: string;
}

export interface SavingsStep {
  id: string;
  name: string;
  description: string;
  savingPerDay: number; // amount saved per planned day
  color: string;
  startDate: string;
  endDate?: string;
  skippedDays: string[]; // days when the saving was NOT made
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  monthlyBudget: number;
  confirmedDays: { date: string; amount: number }[];
}

export interface FinanceData {
  annualSavingsGoal: number;
  savingsSteps: SavingsStep[];
  expenseCategories: ExpenseCategory[];
}
