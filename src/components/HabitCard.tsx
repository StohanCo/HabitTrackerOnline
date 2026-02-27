import React, { useMemo, useState } from 'react';
import type { Habit } from '../types';
import { Pencil, Trash2, Target, Zap, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, toISO } from '../utils/dateUtils';
import { format, isFuture } from 'date-fns';

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
  onToggleDay?: (id: string, date: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onEdit,
  onDelete,
  onToggleDay,
}) => {
  const doneCount = habit.completedDays.length;
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [logDate, setLogDate] = useState(toISO(today));

  const monthDays = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const startOffset = monthDays.length > 0 ? monthDays[0].getDay() : 0;

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleToggle = (dateIso: string) => {
    if (!onToggleDay) return;
    if (isFuture(new Date(dateIso))) return;
    onToggleDay(habit.id, dateIso);
  };

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

      {/* Per-habit calendar & quick log */}
      <div className="mt-4 border-t border-gray-700 pt-3">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-300">
          <span>Calendar — {format(new Date(viewYear, viewMonth, 1), 'MMMM yyyy')}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-500 mb-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-[11px]">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {monthDays.map((day) => {
            const iso = toISO(day);
            const isDone = habit.completedDays.includes(iso);
            const disabled = isFuture(day) || !onToggleDay;
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => handleToggle(iso)}
                className={`h-7 rounded-sm border text-center ${
                  isDone
                    ? 'border-transparent text-white'
                    : 'border-gray-700 text-gray-400'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500'}`}
                style={{ background: isDone ? habit.color : '#111827' }}
                title={iso}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2 text-xs">
          <input
            type="date"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            value={logDate}
            max={toISO(new Date())}
            onChange={(e) => setLogDate(e.target.value)}
          />
          <button
            type="button"
            onClick={() => handleToggle(logDate)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-semibold"
            disabled={!onToggleDay}
          >
            Mark day
          </button>
        </div>
      </div>
    </div>
  );
};
