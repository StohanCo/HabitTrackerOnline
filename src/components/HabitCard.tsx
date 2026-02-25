import React from 'react';
import type { Habit } from '../types';
import { Pencil, Trash2, Target, Zap, Calendar } from 'lucide-react';

const FREQ_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface HabitCardProps {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onEdit,
  onDelete,
}) => {
  const doneCount = habit.completedDays.length;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: habit.color }}
          />
          <h3 className="text-white font-semibold text-base">{habit.name}</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors rounded"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-gray-400 text-sm mb-3">{habit.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Calendar size={12} />
          <span>{FREQ_LABELS[habit.frequency]}</span>
          {habit.frequency === 'weekly' && habit.frequencyDays && (
            <span className="text-gray-500">
              ({habit.frequencyDays.map((d) => WEEKDAY_SHORT[d]).join(',')})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Zap size={12} />
          <span>{doneCount} done</span>
        </div>
        {habit.purpose && (
          <div className="flex items-center gap-1.5 text-gray-400 col-span-2">
            <span className="text-gray-500">Purpose:</span>
            <span>{habit.purpose}</span>
          </div>
        )}
        {habit.finalGoal && (
          <div className="flex items-center gap-1.5 text-indigo-400 col-span-2">
            <Target size={12} />
            <span>{habit.finalGoal}</span>
          </div>
        )}
      </div>
    </div>
  );
};
