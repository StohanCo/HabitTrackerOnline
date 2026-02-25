import React, { useState } from 'react';
import type { Habit } from '../types';
import { uuid, toISO } from '../utils/dateUtils';

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

const FREQ_OPTIONS: { value: Habit['frequency']; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly (choose days)' },
  { value: 'monthly', label: 'Monthly (1st of month)' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitFormProps {
  initial?: Partial<Habit>;
  onSave: (h: Habit) => void;
  onCancel: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  initial,
  onSave,
  onCancel,
}) => {
  const today = toISO(new Date());
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [purpose, setPurpose] = useState(initial?.purpose ?? '');
  const [finalGoal, setFinalGoal] = useState(initial?.finalGoal ?? '');
  const [frequency, setFrequency] = useState<Habit['frequency']>(
    initial?.frequency ?? 'daily'
  );
  const [freqDays, setFreqDays] = useState<number[]>(
    initial?.frequencyDays ?? [1, 2, 3, 4, 5]
  );
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [startDate, setStartDate] = useState(initial?.startDate ?? today);
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');

  const toggleDay = (d: number) =>
    setFreqDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const habit: Habit = {
      id: initial?.id ?? uuid(),
      name: name.trim(),
      description,
      purpose,
      finalGoal,
      frequency,
      frequencyDays: frequency === 'weekly' ? freqDays : undefined,
      color,
      startDate,
      endDate: endDate || undefined,
      completedDays: initial?.completedDays ?? [],
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(habit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Habit Name *</label>
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning Run"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Purpose</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Improve endurance"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Final Goal</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            value={finalGoal}
            onChange={(e) => setFinalGoal(e.target.value)}
            placeholder="e.g. Stay Fit"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Frequency</label>
        <select
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Habit['frequency'])}
        >
          {FREQ_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {frequency === 'weekly' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Days of Week</label>
          <div className="flex gap-2">
            {WEEKDAYS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  freqDays.includes(i)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Color</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
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
            className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
            title="Custom color"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Start Date</label>
          <input
            type="date"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            End Date (optional)
          </label>
          <input
            type="date"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Save Habit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
