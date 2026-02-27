import React, { useMemo, useState } from 'react';
import {
  getDaysOfYear,
  toISO,
  hexToRgba,
  YEAR,
} from '../utils/dateUtils';
import type { Habit, JournalEntry } from '../types';
import { format, isFuture } from 'date-fns';

interface HabitCalendarProps {
  habits: Habit[];
  journalEntries?: JournalEntry[];
  year?: number;
  onToggleDay?: (habitId: string, date: string) => void;
}

const CELL_SIZE = 13;
const CELL_GAP = 2;
const WEEKS_IN_YEAR = 53;
const DAYS_IN_WEEK = 7;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const HabitCalendar: React.FC<HabitCalendarProps> = ({
  habits,
  journalEntries = [],
  year = YEAR,
  onToggleDay,
}) => {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    items: { name: string; color: string; type: 'habit' | 'journal' }[];
  } | null>(null);

  const days = useMemo(() => getDaysOfYear(year), [year]);

  // Build a map: dateISO -> array of finished habit entries + journal entries
  const dayMap = useMemo(() => {
    const map = new Map<
      string,
      { name: string; color: string; type: 'habit' | 'journal'; habitId?: string }[]
    >();

    days.forEach((day) => {
      const iso = toISO(day);
      const entries: { name: string; color: string; type: 'habit' | 'journal'; habitId?: string }[] = [];

      habits.forEach((h) => {
        if (h.completedDays.includes(iso)) {
          entries.push({ name: h.name, color: h.color, type: 'habit', habitId: h.id });
        }
      });

      journalEntries.forEach((j) => {
        if (j.date === iso) {
          entries.push({ name: j.title, color: j.color, type: 'journal' });
        }
      });

      if (entries.length > 0) map.set(iso, entries);
    });
    return map;
  }, [days, habits, journalEntries]);

  // Figure out column (week) for each day
  // Jan 1 of year → determine which weekday it falls on
  const jan1Weekday = days[0] ? days[0].getDay() : 0;

  // Compute month label positions
  const monthPositions = useMemo(() => {
    const positions: { month: number; col: number }[] = [];
    let lastMonth = -1;
    days.forEach((day, idx) => {
      const col = Math.floor((idx + jan1Weekday) / DAYS_IN_WEEK);
      const m = day.getMonth();
      if (m !== lastMonth) {
        positions.push({ month: m, col });
        lastMonth = m;
      }
    });
    return positions;
  }, [days, jan1Weekday]);

  const svgWidth = (WEEKS_IN_YEAR + 1) * (CELL_SIZE + CELL_GAP) + 30;
  const svgHeight = DAYS_IN_WEEK * (CELL_SIZE + CELL_GAP) + 40;

  const renderCell = (day: Date, idx: number) => {
    const iso = toISO(day);
    const col = Math.floor((idx + jan1Weekday) / DAYS_IN_WEEK);
    const row = (idx + jan1Weekday) % DAYS_IN_WEEK;
    const x = 30 + col * (CELL_SIZE + CELL_GAP);
    const y = 20 + row * (CELL_SIZE + CELL_GAP);

    const entries = dayMap.get(iso);
    const canToggle = onToggleDay && !isFuture(day);

    if (!entries || entries.length === 0) {
      return (
        <rect
          key={iso}
          x={x}
          y={y}
          width={CELL_SIZE}
          height={CELL_SIZE}
          rx={2}
          fill="#1e1e2e"
          stroke="#2d2d3f"
          strokeWidth={0.5}
          className="cursor-pointer"
          onMouseEnter={(e) =>
            setTooltip({
              x: e.clientX,
              y: e.clientY,
              date: format(day, 'MMM d, yyyy'),
              items: [],
            })
          }
          onMouseLeave={() => setTooltip(null)}
        />
      );
    }

    // Multi-habit: split cell into vertical stripes
    const stripeWidth = CELL_SIZE / entries.length;
    return (
      <g key={iso}>
        {entries.map((entry, i) => {
          const fill = hexToRgba(entry.color, 1);
          const isHabitEntry = entry.type === 'habit';
          return (
            <rect
              key={`${entry.type}-${entry.name}-${i}`}
              x={x + i * stripeWidth}
              y={y}
              width={stripeWidth}
              height={CELL_SIZE}
              rx={i === 0 ? 2 : 0}
              fill={fill}
              className={canToggle && isHabitEntry ? 'cursor-pointer' : 'cursor-default'}
              onClick={() => {
                if (canToggle && isHabitEntry && entry.habitId) {
                  onToggleDay(entry.habitId, iso);
                }
              }}
              onMouseEnter={(e) =>
                setTooltip({
                  x: e.clientX,
                  y: e.clientY,
                  date: format(day, 'MMM d, yyyy'),
                  items: entries.map((en) => ({
                    name: en.name,
                    color: en.color,
                    type: en.type,
                  })),
                })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </g>
    );
  };

  return (
    <div className="relative overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ fontFamily: 'sans-serif', fontSize: '10px' }}
      >
        {/* Month labels */}
        {monthPositions.map(({ month, col }) => (
          <text
            key={month}
            x={30 + col * (CELL_SIZE + CELL_GAP)}
            y={14}
            fill="#9ca3af"
            fontSize={10}
          >
            {MONTH_LABELS[month]}
          </text>
        ))}

        {/* Day-of-week labels */}
        {[1, 3, 5].map((d) => (
          <text
            key={d}
            x={0}
            y={20 + d * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
            fill="#9ca3af"
            fontSize={9}
          >
            {DAY_LABELS[d]}
          </text>
        ))}

        {/* Day cells */}
        {days.map((day, idx) => renderCell(day, idx))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="text-gray-300 font-semibold mb-1">{tooltip.date}</div>
          {tooltip.items.length === 0 ? (
            <div className="text-gray-500">No habits</div>
          ) : (
            tooltip.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-white">
                  {item.name} {item.type === 'journal' ? '(note)' : '✓'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Mini legend
export const HabitLegend: React.FC<{ habits: Habit[] }> = ({ habits }) => (
  <div className="flex flex-wrap gap-3 mt-3">
    {habits.map((h) => (
      <div key={h.id} className="flex items-center gap-1.5 text-sm text-gray-400">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ background: h.color }}
        />
        {h.name}
      </div>
    ))}
  </div>
);
