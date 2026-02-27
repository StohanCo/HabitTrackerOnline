/**
 * Supabase ↔ Zustand sync layer.
 *
 * – On login: pull all user data from Supabase → write into Zustand.
 * – On each mutation: Zustand mutates locally first (fast UI),
 *   then we fire-and-forget a Supabase write for durability.
 *
 * If Supabase is not configured the app falls back to localStorage only.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Habit, JournalEntry, SavingsStep, ExpenseCategory, IncomeEntry, Asset, TargetGoal } from '../types';

// ──────────────────── PULL (DB → local state) ────────────────────

export async function pullAllData(userId: string) {
  if (!isSupabaseConfigured) return null;

  const [
    { data: profileRows },
    { data: habitRows },
    { data: completionRows },
    { data: journalRows },
    { data: finSettings },
    { data: savingsRows },
    { data: skippedRows },
    { data: expCatRows },
    { data: expEntryRows },
    { data: incomeRows },
    { data: assetRows },
    { data: targetRows },
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId),
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('habit_completions').select('*'),
    supabase.from('journal_entries').select('*').eq('user_id', userId),
    supabase.from('finance_settings').select('*').eq('user_id', userId),
    supabase.from('savings_steps').select('*').eq('user_id', userId),
    supabase.from('savings_skipped_days').select('*'),
    supabase.from('expense_categories').select('*').eq('user_id', userId),
    supabase.from('expense_entries').select('*'),
    supabase.from('income_entries').select('*').eq('user_id', userId),
    supabase.from('assets').select('*').eq('user_id', userId),
    supabase.from('targets').select('*').eq('user_id', userId),
  ]);

  // Build completedDays per habit
  const completionMap = new Map<string, string[]>();
  (completionRows ?? []).forEach((c) => {
    const list = completionMap.get(c.habit_id) ?? [];
    list.push(c.completed_date);
    completionMap.set(c.habit_id, list);
  });

  const habits: Habit[] = (habitRows ?? []).map((h) => ({
    id: h.id,
    name: h.name,
    description: h.description ?? '',
    purpose: h.purpose ?? '',
    finalGoal: h.final_goal ?? '',
    frequency: h.frequency as Habit['frequency'],
    frequencyDays: h.frequency_days ?? undefined,
    color: h.color,
    startDate: h.start_date,
    endDate: h.end_date ?? undefined,
    completedDays: completionMap.get(h.id) ?? [],
    createdAt: h.created_at,
  }));

  // Build skippedDays per savings step
  const skippedMap = new Map<string, string[]>();
  (skippedRows ?? []).forEach((s) => {
    const list = skippedMap.get(s.step_id) ?? [];
    list.push(s.skipped_date);
    skippedMap.set(s.step_id, list);
  });

  const savingsSteps: SavingsStep[] = (savingsRows ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    savingPerDay: Number(s.saving_per_day),
    color: s.color,
    startDate: s.start_date,
    endDate: s.end_date ?? undefined,
    skippedDays: skippedMap.get(s.id) ?? [],
    createdAt: s.created_at,
  }));

  // Build confirmedDays per expense category
  const expEntryMap = new Map<string, { date: string; amount: number }[]>();
  (expEntryRows ?? []).forEach((e) => {
    const list = expEntryMap.get(e.category_id) ?? [];
    list.push({ date: e.date, amount: Number(e.amount) });
    expEntryMap.set(e.category_id, list);
  });

  const expenseCategories: ExpenseCategory[] = (expCatRows ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    monthlyBudget: Number(c.monthly_budget),
    confirmedDays: expEntryMap.get(c.id) ?? [],
  }));

  const journalEntries: JournalEntry[] = (journalRows ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    description: j.description ?? undefined,
    color: j.color,
    date: j.date,
  }));

  const incomeEntries: IncomeEntry[] = (incomeRows ?? []).map((i) => ({
    id: i.id,
    date: i.date,
    amount: Number(i.amount),
    source: i.source,
    description: i.description ?? undefined,
  }));

  const assets: Asset[] = (assetRows ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    type: a.asset_type as Asset['type'],
    balance: Number(a.balance),
    creditLimit: a.credit_limit ? Number(a.credit_limit) : undefined,
    institution: a.institution ?? undefined,
  }));

  const targets: TargetGoal[] = (targetRows ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    goalAmount: Number(t.goal_amount),
    assignedAmount: Number(t.assigned_amount),
    description: t.description ?? undefined,
  }));

  const prof = profileRows?.[0];
  const profile = prof
    ? {
        name: prof.name ?? '',
        avatar: prof.avatar ?? '',
        bio: prof.bio ?? '',
        goals: prof.goals ?? [],
        email: prof.email ?? '',
      }
    : undefined;

  const annualSavingsGoal = Number(finSettings?.[0]?.annual_savings_goal ?? 0);

  return {
    habits,
    journalEntries,
    profile,
    finance: {
      annualSavingsGoal,
      savingsSteps,
      expenseCategories,
      incomeEntries,
      assets,
      targets,
    },
  };
}

// ──────────────────── PUSH helpers (local → DB) ────────────────────

function userId() {
  // Inline fast read — Supabase stores session in memory
  return supabase.auth.getUser().then(({ data }) => data.user?.id);
}

async function uid(): Promise<string> {
  const id = await userId();
  if (!id) throw new Error('Not authenticated');
  return id;
}

/** Guard: skip DB writes if Supabase not configured */
function guard() {
  return isSupabaseConfigured;
}

// ── Habits ──

export async function pushAddHabit(habit: Habit) {
  if (!guard()) return;
  const user_id = await uid();
  await supabase.from('habits').insert({
    id: habit.id,
    user_id,
    name: habit.name,
    description: habit.description || null,
    purpose: habit.purpose || null,
    final_goal: habit.finalGoal || null,
    frequency: habit.frequency,
    frequency_days: habit.frequencyDays ?? null,
    color: habit.color,
    start_date: habit.startDate,
    end_date: habit.endDate ?? null,
  });
}

export async function pushUpdateHabit(id: string, updates: Partial<Habit>) {
  if (!guard()) return;
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.purpose !== undefined) mapped.purpose = updates.purpose;
  if (updates.finalGoal !== undefined) mapped.final_goal = updates.finalGoal;
  if (updates.frequency !== undefined) mapped.frequency = updates.frequency;
  if (updates.frequencyDays !== undefined) mapped.frequency_days = updates.frequencyDays;
  if (updates.color !== undefined) mapped.color = updates.color;
  if (updates.startDate !== undefined) mapped.start_date = updates.startDate;
  if (updates.endDate !== undefined) mapped.end_date = updates.endDate;
  if (Object.keys(mapped).length > 0) {
    await supabase.from('habits').update(mapped).eq('id', id);
  }
}

export async function pushDeleteHabit(id: string) {
  if (!guard()) return;
  await supabase.from('habits').delete().eq('id', id);
}

export async function pushToggleHabitDay(habitId: string, date: string, nowDone: boolean) {
  if (!guard()) return;
  if (nowDone) {
    await supabase.from('habit_completions').insert({ habit_id: habitId, completed_date: date });
  } else {
    await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitId)
      .eq('completed_date', date);
  }
}

// ── Journal ──

export async function pushAddJournal(entry: JournalEntry) {
  if (!guard()) return;
  const user_id = await uid();
  await supabase.from('journal_entries').insert({
    id: entry.id,
    user_id,
    title: entry.title,
    description: entry.description ?? null,
    color: entry.color,
    date: entry.date,
  });
}

export async function pushDeleteJournal(id: string) {
  if (!guard()) return;
  await supabase.from('journal_entries').delete().eq('id', id);
}

// ── Profile ──

export async function pushUpdateProfile(updates: Record<string, unknown>) {
  if (!guard()) return;
  const id = await uid();
  await supabase.from('user_profiles').update(updates).eq('id', id);
}

// ── Finance settings ──

export async function pushAnnualGoal(goal: number) {
  if (!guard()) return;
  const id = await uid();
  await supabase
    .from('finance_settings')
    .upsert({ user_id: id, annual_savings_goal: goal });
}

// ── Savings steps ──

export async function pushAddSavingsStep(step: SavingsStep) {
  if (!guard()) return;
  const user_id = await uid();
  await supabase.from('savings_steps').insert({
    id: step.id,
    user_id,
    name: step.name,
    description: step.description || null,
    saving_per_day: step.savingPerDay,
    color: step.color,
    start_date: step.startDate,
    end_date: step.endDate ?? null,
  });
}

export async function pushUpdateSavingsStep(id: string, updates: Partial<SavingsStep>) {
  if (!guard()) return;
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.savingPerDay !== undefined) mapped.saving_per_day = updates.savingPerDay;
  if (updates.color !== undefined) mapped.color = updates.color;
  if (updates.startDate !== undefined) mapped.start_date = updates.startDate;
  if (updates.endDate !== undefined) mapped.end_date = updates.endDate;
  if (Object.keys(mapped).length > 0) {
    await supabase.from('savings_steps').update(mapped).eq('id', id);
  }
}

export async function pushDeleteSavingsStep(id: string) {
  if (!guard()) return;
  await supabase.from('savings_steps').delete().eq('id', id);
}

export async function pushToggleSavingsDay(stepId: string, date: string, nowSkipped: boolean) {
  if (!guard()) return;
  if (nowSkipped) {
    await supabase.from('savings_skipped_days').insert({ step_id: stepId, skipped_date: date });
  } else {
    await supabase
      .from('savings_skipped_days')
      .delete()
      .eq('step_id', stepId)
      .eq('skipped_date', date);
  }
}

// ── Expense categories ──

export async function pushAddExpenseCategory(cat: ExpenseCategory) {
  if (!guard()) return;
  const user_id = await uid();
  await supabase.from('expense_categories').insert({
    id: cat.id,
    user_id,
    name: cat.name,
    color: cat.color,
    monthly_budget: cat.monthlyBudget,
  });
}

export async function pushUpdateExpenseCategory(id: string, updates: Partial<ExpenseCategory>) {
  if (!guard()) return;
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.color !== undefined) mapped.color = updates.color;
  if (updates.monthlyBudget !== undefined) mapped.monthly_budget = updates.monthlyBudget;
  if (Object.keys(mapped).length > 0) {
    await supabase.from('expense_categories').update(mapped).eq('id', id);
  }
}

export async function pushDeleteExpenseCategory(id: string) {
  if (!guard()) return;
  await supabase.from('expense_categories').delete().eq('id', id);
}

export async function pushConfirmExpenseDay(catId: string, date: string, amount: number) {
  if (!guard()) return;
  // Delete existing entry for this category+date, then insert
  await supabase.from('expense_entries').delete().eq('category_id', catId).eq('date', date);
  await supabase.from('expense_entries').insert({ category_id: catId, date, amount });
}

export async function pushRemoveExpenseDay(catId: string, date: string) {
  if (!guard()) return;
  await supabase.from('expense_entries').delete().eq('category_id', catId).eq('date', date);
}

// ── Income ──

export async function pushAddIncome(entry: IncomeEntry) {
  if (!guard()) return;
  const user_id = await uid();
  await supabase.from('income_entries').insert({
    id: entry.id,
    user_id,
    date: entry.date,
    amount: entry.amount,
    source: entry.source,
    description: entry.description ?? null,
  });
}

export async function pushDeleteIncome(id: string) {
  if (!guard()) return;
  await supabase.from('income_entries').delete().eq('id', id);
}

// ── Assets ──

export async function pushAddAsset(asset: Asset) {
  if (!guard()) return;
  const user_id = await uid();
  await supabase.from('assets').insert({
    id: asset.id,
    user_id,
    name: asset.name,
    asset_type: asset.type,
    balance: asset.balance,
    credit_limit: asset.creditLimit ?? null,
    institution: asset.institution ?? null,
  });
}

export async function pushUpdateAsset(id: string, updates: Partial<Asset>) {
  if (!guard()) return;
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.type !== undefined) mapped.asset_type = updates.type;
  if (updates.balance !== undefined) mapped.balance = updates.balance;
  if (updates.creditLimit !== undefined) mapped.credit_limit = updates.creditLimit;
  if (updates.institution !== undefined) mapped.institution = updates.institution;
  if (Object.keys(mapped).length > 0) {
    await supabase.from('assets').update(mapped).eq('id', id);
  }
}

export async function pushDeleteAsset(id: string) {
  if (!guard()) return;
  await supabase.from('assets').delete().eq('id', id);
}

// ── Targets ──

export async function pushAddTarget(target: TargetGoal) {
  if (!guard()) return;
  const user_id = await uid();
  await supabase.from('targets').insert({
    id: target.id,
    user_id,
    name: target.name,
    goal_amount: target.goalAmount,
    assigned_amount: target.assignedAmount,
    description: target.description ?? null,
  });
}

export async function pushUpdateTarget(id: string, updates: Partial<TargetGoal>) {
  if (!guard()) return;
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.goalAmount !== undefined) mapped.goal_amount = updates.goalAmount;
  if (updates.assignedAmount !== undefined) mapped.assigned_amount = updates.assignedAmount;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (Object.keys(mapped).length > 0) {
    await supabase.from('targets').update(mapped).eq('id', id);
  }
}

export async function pushDeleteTarget(id: string) {
  if (!guard()) return;
  await supabase.from('targets').delete().eq('id', id);
}
