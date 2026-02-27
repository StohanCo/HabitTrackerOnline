import React, { useState } from 'react';
import { useStore } from '../store';
import { HabitCalendar, HabitLegend } from '../components/HabitCalendar';
import { HabitForm } from '../components/HabitForm';
import { HabitCard } from '../components/HabitCard';
import type { Habit, JournalEntry } from '../types';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { YEAR, uuid, toISO } from '../utils/dateUtils';

export const HabitsPage: React.FC = () => {
  const {
    habits,
    journalEntries,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitDay,
    addJournalEntry,
    deleteJournalEntry,
  } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCalendar, setShowCalendar] = useState(true);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalDate, setJournalDate] = useState(toISO(new Date()));
  const [journalDesc, setJournalDesc] = useState('');
  const [journalColor, setJournalColor] = useState('#f472b6');

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

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim()) return;
    const entry: JournalEntry = {
      id: uuid(),
      title: journalTitle.trim(),
      description: journalDesc.trim() || undefined,
      date: journalDate,
      color: journalColor,
    };
    addJournalEntry(entry);
    setJournalTitle('');
    setJournalDesc('');
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
                <HabitCalendar
                  habits={habits}
                  journalEntries={journalEntries}
                  year={YEAR}
                  onToggleDay={toggleHabitDay}
                />
                <HabitLegend habits={habits} />
              </>
            )}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" />
                Done habit
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-pink-400" />
                Journal / one-off entry
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Journal / one-off activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold text-lg">
              Journal / one-off activity
            </h2>
            <p className="text-gray-500 text-sm">
              Log completed activities or notes not tied to a habit. They appear on the main calendar as stripes.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddJournal} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Title *"
            value={journalTitle}
            onChange={(e) => setJournalTitle(e.target.value)}
            required
          />
          <input
            type="date"
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={journalDate}
            max={toISO(new Date())}
            onChange={(e) => setJournalDate(e.target.value)}
            required
          />
          <input
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Description (optional)"
            value={journalDesc}
            onChange={(e) => setJournalDesc(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-12 h-10 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer"
              value={journalColor}
              onChange={(e) => setJournalColor(e.target.value)}
            />
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Add entry
            </button>
          </div>
        </form>

        {(journalEntries ?? []).length === 0 ? (
          <p className="text-gray-500 text-sm">No journal entries yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {[...journalEntries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: entry.color }}
                    />
                    <div>
                      <div className="text-white text-sm font-medium">
                        {entry.title}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {entry.date}
                        {entry.description ? ` · ${entry.description}` : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteJournalEntry(entry.id)}
                    className="text-gray-500 hover:text-red-400 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
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
              onToggleDay={toggleHabitDay}
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
