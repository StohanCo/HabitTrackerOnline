import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { FinanceCalendar } from '../components/FinanceCalendar';
import type { SavingsStep, ExpenseCategory } from '../types';
import {
  uuid,
  toISO,
  isSavingsPlannedForDay,
  getDaysOfYear,
  YEAR,
  MONTH_NAMES,
} from '../utils/dateUtils';
import {
  Plus, Pencil, Trash2, DollarSign, Target,
  TrendingDown, ChevronDown, ChevronUp,
} from 'lucide-react';
import { parseISO, getMonth } from 'date-fns';

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4',
];

// ────────────────────── Sub-components ──────────────────────

const SavingsStepForm: React.FC<{
  initial?: Partial<SavingsStep>;
  onSave: (s: SavingsStep) => void;
  onCancel: () => void;
}> = ({ initial, onSave, onCancel }) => {
  const today = toISO(new Date());
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(String(initial?.savingPerDay ?? ''));
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [startDate, setStartDate] = useState(initial?.startDate ?? today);
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    onSave({
      id: initial?.id ?? uuid(),
      name: name.trim(),
      description,
      savingPerDay: parseFloat(amount),
      color,
      startDate,
      endDate: endDate || undefined,
      skippedDays: initial?.skippedDays ?? [],
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Name *</label>
          <input
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Skip coffee"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Saving per day ($) *
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5.00"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <input
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Color</label>
        <div className="flex gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full"
              style={{
                background: c,
                outline: color === c ? '3px solid white' : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Start Date</label>
          <input
            type="date"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">End Date</label>
          <input
            type="date"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const ExpenseCategoryForm: React.FC<{
  initial?: Partial<ExpenseCategory>;
  onSave: (c: ExpenseCategory) => void;
  onCancel: () => void;
}> = ({ initial, onSave, onCancel }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [budget, setBudget] = useState(String(initial?.monthlyBudget ?? ''));
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !budget) return;
    onSave({
      id: initial?.id ?? uuid(),
      name: name.trim(),
      color,
      monthlyBudget: parseFloat(budget),
      confirmedDays: initial?.confirmedDays ?? [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Category *</label>
          <input
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Food, Rent"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Monthly Budget ($) *
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 500"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Color</label>
        <div className="flex gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full"
              style={{
                background: c,
                outline: color === c ? '3px solid white' : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ────────────────────── Main Page ──────────────────────

export const FinancePage: React.FC = () => {
  const {
    finance,
    updateAnnualGoal,
    addSavingsStep,
    updateSavingsStep,
    deleteSavingsStep,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    confirmExpenseDay,
  } = useStore();

  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(
    String(finance.annualSavingsGoal)
  );
  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStep, setEditingStep] = useState<SavingsStep | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<ExpenseCategory | null>(null);
  const [showCalendar, setShowCalendar] = useState(true);

  // For expense logging: select category + date + amount
  const [logCatId, setLogCatId] = useState('');
  const [logDate, setLogDate] = useState(toISO(new Date()));
  const [logAmount, setLogAmount] = useState('');

  // Savings summary
  const days = getDaysOfYear(YEAR);
  const savingsSummary = useMemo(() => {
    let planned = 0;
    let saved = 0;
    finance.savingsSteps.forEach((st) => {
      days.forEach((day) => {
        const iso = toISO(day);
        const isPlanned = isSavingsPlannedForDay(day, st.startDate, st.endDate);
        if (isPlanned) {
          planned += st.savingPerDay;
          if (!st.skippedDays.includes(iso)) {
            saved += st.savingPerDay;
          }
        }
      });
    });
    return { planned, saved };
  }, [finance.savingsSteps, days]);

  // Monthly expense totals
  const monthlyExpenseTotals = useMemo(() => {
    const result: Record<string, number[]> = {};
    finance.expenseCategories.forEach((cat) => {
      const totals = Array(12).fill(0);
      cat.confirmedDays.forEach(({ date, amount }) => {
        const m = getMonth(parseISO(date));
        totals[m] += amount;
      });
      result[cat.id] = totals;
    });
    return result;
  }, [finance.expenseCategories]);

  const currentMonth = new Date().getMonth();

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logCatId || !logAmount) return;
    confirmExpenseDay(logCatId, logDate, parseFloat(logAmount));
    setLogAmount('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance Tracker</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Savings & spending overview — {YEAR}
          </p>
        </div>
      </div>

      {/* Annual Goal */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Target size={18} className="text-indigo-400" />
            Annual Savings Goal
          </h2>
          <button
            onClick={() => {
              setGoalInput(String(finance.annualSavingsGoal));
              setEditGoal((v) => !v);
            }}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>

        {editGoal ? (
          <div className="flex gap-3">
            <input
              type="number"
              min={0}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Annual savings target ($)"
            />
            <button
              onClick={() => {
                updateAnnualGoal(parseFloat(goalInput) || 0);
                setEditGoal(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">
                ${finance.annualSavingsGoal.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Target</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">
                ${savingsSummary.saved.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Saved so far</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-indigo-400">
                ${savingsSummary.planned.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Planned (year)</div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {finance.annualSavingsGoal > 0 && !editGoal && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>
                {Math.min(
                  100,
                  Math.round(
                    (savingsSummary.saved / finance.annualSavingsGoal) * 100
                  )
                )}
                %
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (savingsSummary.saved / finance.annualSavingsGoal) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <button
          onClick={() => setShowCalendar((v) => !v)}
          className="flex items-center gap-2 text-white font-semibold text-base w-full text-left"
        >
          {showCalendar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          Finance Calendar — {YEAR}
        </button>
        {showCalendar && (
          <div className="mt-4">
            <FinanceCalendar
              savingsSteps={finance.savingsSteps}
              expenseCategories={finance.expenseCategories}
            />
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-green-500" />
                Savings (active)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-gray-500" />
                Savings (skipped)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-green-400" />
                Expense (on budget)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
                Expense (over budget)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Savings Steps */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <TrendingDown size={18} className="text-green-400" />
            Savings Steps
          </h2>
          <button
            onClick={() => {
              setEditingStep(null);
              setShowStepForm((v) => !v);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> Add Step
          </button>
        </div>

        {showStepForm && (
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <SavingsStepForm
              initial={editingStep ?? undefined}
              onSave={(s) => {
                if (editingStep) updateSavingsStep(s.id, s);
                else addSavingsStep(s);
                setShowStepForm(false);
                setEditingStep(null);
              }}
              onCancel={() => {
                setShowStepForm(false);
                setEditingStep(null);
              }}
            />
          </div>
        )}

        {finance.savingsSteps.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No savings steps yet. Add one to start tracking!
          </p>
        ) : (
          <div className="space-y-3">
            {finance.savingsSteps.map((st) => {
              const plannedDays = days.filter((d) =>
                isSavingsPlannedForDay(d, st.startDate, st.endDate)
              ).length;
              const savedDays = plannedDays - st.skippedDays.length;
              const totalSaved = savedDays * st.savingPerDay;
              const totalPotential = plannedDays * st.savingPerDay;

              return (
                <div
                  key={st.id}
                  className="bg-gray-900 rounded-lg p-3 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-block w-3 h-3 rounded-full mt-0.5"
                      style={{ background: st.color }}
                    />
                    <div>
                      <div className="text-white font-medium text-sm">
                        {st.name}
                      </div>
                      {st.description && (
                        <div className="text-gray-500 text-xs">
                          {st.description}
                        </div>
                      )}
                      <div className="text-gray-400 text-xs mt-1">
                        ${st.savingPerDay}/day · {savedDays}/{plannedDays} days ·{' '}
                        <span className="text-green-400">
                          ${totalSaved.toFixed(2)}
                        </span>{' '}
                        of ${totalPotential.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingStep(st);
                        setShowStepForm(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-indigo-400"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this savings step?'))
                          deleteSavingsStep(st.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <DollarSign size={18} className="text-yellow-400" />
            Expense Categories
          </h2>
          <button
            onClick={() => {
              setEditingCat(null);
              setShowCatForm((v) => !v);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>

        {showCatForm && (
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <ExpenseCategoryForm
              initial={editingCat ?? undefined}
              onSave={(c) => {
                if (editingCat) updateExpenseCategory(c.id, c);
                else addExpenseCategory(c);
                setShowCatForm(false);
                setEditingCat(null);
              }}
              onCancel={() => {
                setShowCatForm(false);
                setEditingCat(null);
              }}
            />
          </div>
        )}

        {finance.expenseCategories.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No categories yet. Add one to track your spending!
          </p>
        ) : (
          <div className="space-y-3">
            {finance.expenseCategories.map((cat) => {
              const monthTotal =
                monthlyExpenseTotals[cat.id]?.[currentMonth] ?? 0;
              const overBudget = monthTotal > cat.monthlyBudget;
              return (
                <div
                  key={cat.id}
                  className="bg-gray-900 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: cat.color }}
                    />
                    <div>
                      <div className="text-white font-medium text-sm">
                        {cat.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        Budget: ${cat.monthlyBudget}/mo · This month:{' '}
                        <span
                          className={
                            overBudget ? 'text-red-400' : 'text-green-400'
                          }
                        >
                          ${monthTotal.toFixed(2)}
                        </span>
                        {overBudget && (
                          <span className="text-red-400 ml-1">⚠ Over!</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingCat(cat);
                        setShowCatForm(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-indigo-400"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this category?'))
                          deleteExpenseCategory(cat.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Expense */}
      {finance.expenseCategories.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-orange-400" />
            Log Expense
          </h2>
          <form onSubmit={handleLogExpense} className="flex flex-wrap gap-3">
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={logCatId}
              onChange={(e) => setLogCatId(e.target.value)}
              required
            >
              <option value="">-- Select Category --</option>
              {finance.expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
            <input
              type="number"
              min={0}
              step={0.01}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 w-32"
              value={logAmount}
              onChange={(e) => setLogAmount(e.target.value)}
              placeholder="Amount ($)"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Log
            </button>
          </form>
        </div>
      )}

      {/* Monthly Expense Summary */}
      {finance.expenseCategories.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">
            Monthly Expense Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 pb-2 pr-4">
                    Category
                  </th>
                  {MONTH_NAMES.map((m, i) => (
                    <th
                      key={i}
                      className={`text-right pb-2 px-1 text-xs ${
                        i === currentMonth
                          ? 'text-indigo-400 font-bold'
                          : 'text-gray-500'
                      }`}
                    >
                      {m.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {finance.expenseCategories.map((cat) => {
                  const totals = monthlyExpenseTotals[cat.id] ?? Array(12).fill(0);
                  return (
                    <tr key={cat.id} className="border-t border-gray-700">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ background: cat.color }}
                          />
                          <span className="text-white">{cat.name}</span>
                          <span className="text-gray-500 text-xs">
                            (${cat.monthlyBudget}/mo)
                          </span>
                        </div>
                      </td>
                      {totals.map((total: number, i: number) => (
                        <td
                          key={i}
                          className={`text-right px-1 py-2 ${
                            total > cat.monthlyBudget
                              ? 'text-red-400 font-semibold'
                              : total > 0
                              ? 'text-green-400'
                              : 'text-gray-600'
                          }`}
                        >
                          {total > 0 ? `$${total.toFixed(0)}` : '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
