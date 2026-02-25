import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, UserProfile, FinanceData, SavingsStep, ExpenseCategory } from '../types';

interface AppState {
  habits: Habit[];
  profile: UserProfile;
  finance: FinanceData;

  // Habit actions
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (habitId: string, date: string) => void;

  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Finance actions
  updateAnnualGoal: (goal: number) => void;
  addSavingsStep: (step: SavingsStep) => void;
  updateSavingsStep: (id: string, updates: Partial<SavingsStep>) => void;
  deleteSavingsStep: (id: string) => void;
  toggleSavingsDay: (stepId: string, date: string) => void;
  addExpenseCategory: (cat: ExpenseCategory) => void;
  updateExpenseCategory: (id: string, updates: Partial<ExpenseCategory>) => void;
  deleteExpenseCategory: (id: string) => void;
  confirmExpenseDay: (catId: string, date: string, amount: number) => void;
  removeExpenseDay: (catId: string, date: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      habits: [],
      profile: {
        name: 'Your Name',
        avatar: '',
        bio: '',
        goals: [],
        email: '',
      },
      finance: {
        annualSavingsGoal: 0,
        savingsSteps: [],
        expenseCategories: [],
      },

      addHabit: (habit) =>
        set((s) => ({ habits: [...s.habits, habit] })),

      updateHabit: (id, updates) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      toggleHabitDay: (habitId, date) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId) return h;
            const done = h.completedDays.includes(date);
            return {
              ...h,
              completedDays: done
                ? h.completedDays.filter((d) => d !== date)
                : [...h.completedDays, date],
            };
          }),
        })),

      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      updateAnnualGoal: (goal) =>
        set((s) => ({ finance: { ...s.finance, annualSavingsGoal: goal } })),

      addSavingsStep: (step) =>
        set((s) => ({
          finance: {
            ...s.finance,
            savingsSteps: [...s.finance.savingsSteps, step],
          },
        })),

      updateSavingsStep: (id, updates) =>
        set((s) => ({
          finance: {
            ...s.finance,
            savingsSteps: s.finance.savingsSteps.map((st) =>
              st.id === id ? { ...st, ...updates } : st
            ),
          },
        })),

      deleteSavingsStep: (id) =>
        set((s) => ({
          finance: {
            ...s.finance,
            savingsSteps: s.finance.savingsSteps.filter((st) => st.id !== id),
          },
        })),

      toggleSavingsDay: (stepId, date) =>
        set((s) => ({
          finance: {
            ...s.finance,
            savingsSteps: s.finance.savingsSteps.map((st) => {
              if (st.id !== stepId) return st;
              const skipped = st.skippedDays.includes(date);
              return {
                ...st,
                skippedDays: skipped
                  ? st.skippedDays.filter((d) => d !== date)
                  : [...st.skippedDays, date],
              };
            }),
          },
        })),

      addExpenseCategory: (cat) =>
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: [...s.finance.expenseCategories, cat],
          },
        })),

      updateExpenseCategory: (id, updates) =>
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: s.finance.expenseCategories.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          },
        })),

      deleteExpenseCategory: (id) =>
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: s.finance.expenseCategories.filter(
              (c) => c.id !== id
            ),
          },
        })),

      confirmExpenseDay: (catId, date, amount) =>
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: s.finance.expenseCategories.map((c) => {
              if (c.id !== catId) return c;
              const filtered = c.confirmedDays.filter((d) => d.date !== date);
              return { ...c, confirmedDays: [...filtered, { date, amount }] };
            }),
          },
        })),

      removeExpenseDay: (catId, date) =>
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: s.finance.expenseCategories.map((c) => {
              if (c.id !== catId) return c;
              return {
                ...c,
                confirmedDays: c.confirmedDays.filter((d) => d.date !== date),
              };
            }),
          },
        })),
    }),
    { name: 'habit-tracker-store' }
  )
);
