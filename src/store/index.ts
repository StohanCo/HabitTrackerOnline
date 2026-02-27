import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Habit,
  UserProfile,
  FinanceData,
  SavingsStep,
  ExpenseCategory,
  IncomeEntry,
  JournalEntry,
  Asset,
  TargetGoal,
} from '../types';
import * as sync from '../lib/sync';

interface AppState {
  habits: Habit[];
  profile: UserProfile;
  finance: FinanceData;
  journalEntries: JournalEntry[];

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

  // Journal
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;

  // Assets
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  // Targets
  addTarget: (target: TargetGoal) => void;
  updateTarget: (id: string, updates: Partial<TargetGoal>) => void;
  deleteTarget: (id: string) => void;

  // Income actions
  addIncomeEntry: (entry: IncomeEntry) => void;
  updateIncomeEntry: (id: string, updates: Partial<IncomeEntry>) => void;
  deleteIncomeEntry: (id: string) => void;

  // Cloud sync
  loadFromCloud: (userId: string) => Promise<void>;
  resetState: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
        incomeEntries: [],
        assets: [],
        targets: [],
      },
      journalEntries: [],

      addHabit: (habit) => {
        set((s) => ({ habits: [...s.habits, habit] }));
        sync.pushAddHabit(habit);
      },

      updateHabit: (id, updates) => {
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
        sync.pushUpdateHabit(id, updates);
      },

      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
        sync.pushDeleteHabit(id);
      },

      toggleHabitDay: (habitId, date) => {
        const habit = get().habits.find((h) => h.id === habitId);
        const wasDone = habit?.completedDays.includes(date) ?? false;
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
        }));
        sync.pushToggleHabitDay(habitId, date, !wasDone);
      },

      updateProfile: (updates) => {
        set((s) => ({ profile: { ...s.profile, ...updates } }));
        sync.pushUpdateProfile(updates);
      },

      updateAnnualGoal: (goal) => {
        set((s) => ({ finance: { ...s.finance, annualSavingsGoal: goal } }));
        sync.pushAnnualGoal(goal);
      },

      addSavingsStep: (step) => {
        set((s) => ({
          finance: {
            ...s.finance,
            savingsSteps: [...s.finance.savingsSteps, step],
          },
        }));
        sync.pushAddSavingsStep(step);
      },

      updateSavingsStep: (id, updates) => {
        set((s) => ({
          finance: {
            ...s.finance,
            savingsSteps: s.finance.savingsSteps.map((st) =>
              st.id === id ? { ...st, ...updates } : st
            ),
          },
        }));
        sync.pushUpdateSavingsStep(id, updates);
      },

      deleteSavingsStep: (id) => {
        set((s) => ({
          finance: {
            ...s.finance,
            savingsSteps: s.finance.savingsSteps.filter((st) => st.id !== id),
          },
        }));
        sync.pushDeleteSavingsStep(id);
      },

      toggleSavingsDay: (stepId, date) => {
        const step = get().finance.savingsSteps.find((st) => st.id === stepId);
        const wasSkipped = step?.skippedDays.includes(date) ?? false;
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
        }));
        sync.pushToggleSavingsDay(stepId, date, !wasSkipped);
      },

      addExpenseCategory: (cat) => {
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: [...s.finance.expenseCategories, cat],
          },
        }));
        sync.pushAddExpenseCategory(cat);
      },

      updateExpenseCategory: (id, updates) => {
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: s.finance.expenseCategories.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          },
        }));
        sync.pushUpdateExpenseCategory(id, updates);
      },

      deleteExpenseCategory: (id) => {
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: s.finance.expenseCategories.filter(
              (c) => c.id !== id
            ),
          },
        }));
        sync.pushDeleteExpenseCategory(id);
      },

      confirmExpenseDay: (catId, date, amount) => {
        set((s) => ({
          finance: {
            ...s.finance,
            expenseCategories: s.finance.expenseCategories.map((c) => {
              if (c.id !== catId) return c;
              const filtered = c.confirmedDays.filter((d) => d.date !== date);
              return { ...c, confirmedDays: [...filtered, { date, amount }] };
            }),
          },
        }));
        sync.pushConfirmExpenseDay(catId, date, amount);
      },

      removeExpenseDay: (catId, date) => {
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
        }));
        sync.pushRemoveExpenseDay(catId, date);
      },

      addJournalEntry: (entry) => {
        set((s) => ({ journalEntries: [...s.journalEntries, entry] }));
        sync.pushAddJournal(entry);
      },

      updateJournalEntry: (id, updates) =>
        set((s) => ({
          journalEntries: s.journalEntries.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        })),

      deleteJournalEntry: (id) => {
        set((s) => ({ journalEntries: s.journalEntries.filter((j) => j.id !== id) }));
        sync.pushDeleteJournal(id);
      },

      addAsset: (asset) => {
        set((s) => ({
          finance: {
            ...s.finance,
            assets: [...(s.finance.assets ?? []), asset],
          },
        }));
        sync.pushAddAsset(asset);
      },

      updateAsset: (id, updates) => {
        set((s) => ({
          finance: {
            ...s.finance,
            assets: (s.finance.assets ?? []).map((a) =>
              a.id === id ? { ...a, ...updates } : a
            ),
          },
        }));
        sync.pushUpdateAsset(id, updates);
      },

      deleteAsset: (id) => {
        set((s) => ({
          finance: {
            ...s.finance,
            assets: (s.finance.assets ?? []).filter((a) => a.id !== id),
          },
        }));
        sync.pushDeleteAsset(id);
      },

      addTarget: (target) => {
        set((s) => ({
          finance: {
            ...s.finance,
            targets: [...(s.finance.targets ?? []), target],
          },
        }));
        sync.pushAddTarget(target);
      },

      updateTarget: (id, updates) => {
        set((s) => ({
          finance: {
            ...s.finance,
            targets: (s.finance.targets ?? []).map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          },
        }));
        sync.pushUpdateTarget(id, updates);
      },

      deleteTarget: (id) => {
        set((s) => ({
          finance: {
            ...s.finance,
            targets: (s.finance.targets ?? []).filter((t) => t.id !== id),
          },
        }));
        sync.pushDeleteTarget(id);
      },

      addIncomeEntry: (entry) => {
        set((s) => ({
          finance: {
            ...s.finance,
            incomeEntries: [...(s.finance.incomeEntries ?? []), entry],
          },
        }));
        sync.pushAddIncome(entry);
      },

      updateIncomeEntry: (id, updates) =>
        set((s) => ({
          finance: {
            ...s.finance,
            incomeEntries: (s.finance.incomeEntries ?? []).map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          },
        })),

      deleteIncomeEntry: (id) => {
        set((s) => ({
          finance: {
            ...s.finance,
            incomeEntries: (s.finance.incomeEntries ?? []).filter(
              (e) => e.id !== id
            ),
          },
        }));
        sync.pushDeleteIncome(id);
      },

      // Cloud sync: load all data from Supabase into store
      loadFromCloud: async (userId: string) => {
        const data = await sync.pullAllData(userId);
        if (!data) return;
        set({
          habits: data.habits,
          journalEntries: data.journalEntries,
          finance: data.finance,
          ...(data.profile ? { profile: data.profile } : {}),
        });
      },

      // Reset to defaults (used on sign-out)
      resetState: () =>
        set({
          habits: [],
          journalEntries: [],
          profile: { name: 'Your Name', avatar: '', bio: '', goals: [], email: '' },
          finance: {
            annualSavingsGoal: 0,
            savingsSteps: [],
            expenseCategories: [],
            incomeEntries: [],
            assets: [],
            targets: [],
          },
        }),
    }),
    { name: 'habit-tracker-store' }
  )
);
