import React, { useState } from 'react';
import { useStore } from '../store';
import { HabitCalendar, HabitLegend } from '../components/HabitCalendar';
import { HabitForm } from '../components/HabitForm';
import { HabitCard } from '../components/HabitCard';
import type { Habit } from '../types';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { YEAR } from '../utils/dateUtils';

export const HabitsPage: React.FC = () => {
  const { habits, addHabit, updateHabit, deleteHabit } =
    useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCalendar, setShowCalendar] = useState(true);

  const handleSave = (habit: Habit) => {
    if (editingHabit) {
      updateHabit(habit.id, habit);
    } else {
      addHabit(habit);
    }
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this habit?')) deleteHabit(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Habits</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Track your daily progress — {YEAR}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingHabit(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          {showForm && !editingHabit ? (
            <>
              <X size={16} /> Close
            </>
          ) : (
            <>
              <Plus size={16} /> Add Habit
            </>
          )}
        </button>
      </div>

      {/* Habit Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-4">
            {editingHabit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <HabitForm
            initial={editingHabit ?? undefined}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingHabit(null);
            }}
          />
        </div>
      )}

      {/* Calendar Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <button
          onClick={() => setShowCalendar((v) => !v)}
          className="flex items-center gap-2 text-white font-semibold text-base w-full text-left"
        >
          {showCalendar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          Calendar — {YEAR}
        </button>

        {showCalendar && (
          <div className="mt-4">
            {habits.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No habits yet. Add one to see your calendar!
              </p>
            ) : (
              <>
                <HabitCalendar habits={habits} year={YEAR} />
                <HabitLegend habits={habits} />
              </>
            )}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" />
                Done
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ background: 'rgba(99,102,241,0.4)' }}
                />
                Planned (40% opacity)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Habit Cards */}
      {habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={() => handleEdit(habit)}
              onDelete={() => handleDelete(habit.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No habits tracked yet</p>
          <p className="text-sm">Click "Add Habit" to get started!</p>
        </div>
      )}
    </div>
  );
};
