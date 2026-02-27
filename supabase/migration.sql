-- ============================================================
-- HabitTrackerOnline — Supabase migration
-- Run this in Supabase SQL editor to set up the schema.
-- ============================================================

-- 1. User profiles (extends auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar text,
  bio text,
  email text,
  goals text[] default '{}',
  created_at timestamptz default now()
);

-- 2. Habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  purpose text,
  final_goal text,
  frequency text not null default 'daily',
  frequency_days int[],
  color text not null default '#6366f1',
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz default now()
);

-- 3. Habit completions (one row per habit+date)
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz default now(),
  unique(habit_id, completed_date)
);

-- 4. Journal entries
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text not null default '#f472b6',
  date date not null,
  created_at timestamptz default now()
);

-- 5. Finance settings (one row per user)
create table if not exists public.finance_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  annual_savings_goal numeric default 0
);

-- 6. Savings steps
create table if not exists public.savings_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  saving_per_day numeric not null default 0,
  color text not null default '#10b981',
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz default now()
);

-- 7. Savings skipped days
create table if not exists public.savings_skipped_days (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.savings_steps(id) on delete cascade,
  skipped_date date not null,
  unique(step_id, skipped_date)
);

-- 8. Expense categories
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#f59e0b',
  monthly_budget numeric not null default 0,
  created_at timestamptz default now()
);

-- 9. Expense entries
create table if not exists public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.expense_categories(id) on delete cascade,
  date date not null,
  amount numeric not null default 0,
  created_at timestamptz default now()
);

-- 10. Income entries
create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount numeric not null default 0,
  source text not null,
  description text,
  created_at timestamptz default now()
);

-- 11. Assets / accounts
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  asset_type text not null default 'account',
  balance numeric not null default 0,
  credit_limit numeric,
  institution text,
  created_at timestamptz default now()
);

-- 12. Targets / goals
create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_amount numeric not null default 0,
  assigned_amount numeric not null default 0,
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row-Level Security (RLS)
-- Every table is locked to the owning user.
-- ============================================================

alter table public.user_profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.finance_settings enable row level security;
alter table public.savings_steps enable row level security;
alter table public.savings_skipped_days enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expense_entries enable row level security;
alter table public.income_entries enable row level security;
alter table public.assets enable row level security;
alter table public.targets enable row level security;

-- user_profiles
create policy "user_profiles_select" on public.user_profiles for select using (auth.uid() = id);
create policy "user_profiles_insert" on public.user_profiles for insert with check (auth.uid() = id);
create policy "user_profiles_update" on public.user_profiles for update using (auth.uid() = id);

-- habits
create policy "habits_select" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update" on public.habits for update using (auth.uid() = user_id);
create policy "habits_delete" on public.habits for delete using (auth.uid() = user_id);

-- habit_completions (via habit owner)
create policy "completions_select" on public.habit_completions for select
  using (exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));
create policy "completions_insert" on public.habit_completions for insert
  with check (exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));
create policy "completions_delete" on public.habit_completions for delete
  using (exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid()));

-- journal_entries
create policy "journal_select" on public.journal_entries for select using (auth.uid() = user_id);
create policy "journal_insert" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "journal_update" on public.journal_entries for update using (auth.uid() = user_id);
create policy "journal_delete" on public.journal_entries for delete using (auth.uid() = user_id);

-- finance_settings
create policy "finsettings_select" on public.finance_settings for select using (auth.uid() = user_id);
create policy "finsettings_upsert" on public.finance_settings for insert with check (auth.uid() = user_id);
create policy "finsettings_update" on public.finance_settings for update using (auth.uid() = user_id);

-- savings_steps
create policy "savings_select" on public.savings_steps for select using (auth.uid() = user_id);
create policy "savings_insert" on public.savings_steps for insert with check (auth.uid() = user_id);
create policy "savings_update" on public.savings_steps for update using (auth.uid() = user_id);
create policy "savings_delete" on public.savings_steps for delete using (auth.uid() = user_id);

-- savings_skipped_days (via step owner)
create policy "skipped_select" on public.savings_skipped_days for select
  using (exists (select 1 from public.savings_steps s where s.id = step_id and s.user_id = auth.uid()));
create policy "skipped_insert" on public.savings_skipped_days for insert
  with check (exists (select 1 from public.savings_steps s where s.id = step_id and s.user_id = auth.uid()));
create policy "skipped_delete" on public.savings_skipped_days for delete
  using (exists (select 1 from public.savings_steps s where s.id = step_id and s.user_id = auth.uid()));

-- expense_categories
create policy "expcat_select" on public.expense_categories for select using (auth.uid() = user_id);
create policy "expcat_insert" on public.expense_categories for insert with check (auth.uid() = user_id);
create policy "expcat_update" on public.expense_categories for update using (auth.uid() = user_id);
create policy "expcat_delete" on public.expense_categories for delete using (auth.uid() = user_id);

-- expense_entries (via category owner)
create policy "expentry_select" on public.expense_entries for select
  using (exists (select 1 from public.expense_categories c where c.id = category_id and c.user_id = auth.uid()));
create policy "expentry_insert" on public.expense_entries for insert
  with check (exists (select 1 from public.expense_categories c where c.id = category_id and c.user_id = auth.uid()));
create policy "expentry_delete" on public.expense_entries for delete
  using (exists (select 1 from public.expense_categories c where c.id = category_id and c.user_id = auth.uid()));

-- income_entries
create policy "income_select" on public.income_entries for select using (auth.uid() = user_id);
create policy "income_insert" on public.income_entries for insert with check (auth.uid() = user_id);
create policy "income_update" on public.income_entries for update using (auth.uid() = user_id);
create policy "income_delete" on public.income_entries for delete using (auth.uid() = user_id);

-- assets
create policy "assets_select" on public.assets for select using (auth.uid() = user_id);
create policy "assets_insert" on public.assets for insert with check (auth.uid() = user_id);
create policy "assets_update" on public.assets for update using (auth.uid() = user_id);
create policy "assets_delete" on public.assets for delete using (auth.uid() = user_id);

-- targets
create policy "targets_select" on public.targets for select using (auth.uid() = user_id);
create policy "targets_insert" on public.targets for insert with check (auth.uid() = user_id);
create policy "targets_update" on public.targets for update using (auth.uid() = user_id);
create policy "targets_delete" on public.targets for delete using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile row on new user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  insert into public.finance_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
