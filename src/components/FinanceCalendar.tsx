import React, { useMemo, useState } from 'react';
import {
  getDaysOfYear,
  toISO,
  isSavingsPlannedForDay,
  YEAR,
} from '../utils/dateUtils';
import type { SavingsStep, ExpenseCategory, IncomeEntry } from '../types';
import { format, getMonth, parseISO, isFuture } from 'date-fns';

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CELL_SIZE = 13;
const CELL_GAP = 2;
const WEEKS_IN_YEAR = 53;
const DAYS_IN_WEEK = 7;
const DAY_LABELS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface FinanceCalendarProps {
  savingsSteps: SavingsStep[];
  expenseCategories: ExpenseCategory[];
  incomeEntries?: IncomeEntry[];
  year?: number;
  onToggleSavingsDay?: (stepId: string, date: string) => void;
}

export const FinanceCalendar: React.FC<FinanceCalendarProps> = ({
  savingsSteps,
  expenseCategories,
  incomeEntries = [],
  year = YEAR,
  onToggleSavingsDay,
}) => {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    items: { name: string; color: string; label: string }[];
  } | null>(null);

  const days = useMemo(() => getDaysOfYear(year), [year]);
  const jan1Weekday = days[0] ? days[0].getDay() : 0;

  // Compute monthly totals per expense category
  const monthlyTotals = useMemo(() => {
    const map = new Map<string, number[]>(); // catId -> [jan..dec]
    expenseCategories.forEach((cat) => {
      const totals = Array(12).fill(0);
      cat.confirmedDays.forEach(({ date, amount }) => {
        const m = getMonth(parseISO(date));
        totals[m] += amount;
      });
      map.set(cat.id, totals);
    });
    return map;
  }, [expenseCategories]);

  const dayMap = useMemo(() => {
    const map = new Map<
      string,
      { name: string; color: string; label: string; stepId?: string }[]
    >();

    days.forEach((day) => {
      const iso = toISO(day);
      const items: { name: string; color: string; label: string; stepId?: string }[] = [];

      // Savings steps
      savingsSteps.forEach((st) => {
        const planned = isSavingsPlannedForDay(day, st.startDate, st.endDate);
        if (planned) {
          const skipped = st.skippedDays.includes(iso);
          items.push({
            name: st.name,
            color: skipped ? '#6b7280' : st.color,
            label: skipped
              ? `${st.name}: skipped (-$${st.savingPerDay})`
              : `${st.name}: +$${st.savingPerDay} saved`,
            stepId: st.id,
          });
        }
      });

      // Expense categories
      expenseCategories.forEach((cat) => {
        const confirmed = cat.confirmedDays.find((d) => d.date === iso);
        if (confirmed) {
          const month = getMonth(parseISO(iso));
          const monthTotal = monthlyTotals.get(cat.id)?.[month] ?? 0;
          const overBudget = monthTotal > cat.monthlyBudget;
          items.push({
            name: cat.name,
            color: overBudget ? '#ef4444' : '#22c55e',
            label: `${cat.name}: $${confirmed.amount} (${
              overBudget ? 'over budget!' : 'on track'
            })`,
          });
        }
      });

      // Income entries
      (incomeEntries ?? []).forEach((entry) => {
        if (entry.date === iso) {
          items.push({
            name: entry.source,
            color: '#38bdf8', // sky blue for income
            label: `Income: +$${entry.amount} (${entry.source})`,
          });
        }
      });

      if (items.length > 0) map.set(iso, items);
    });
    return map;
  }, [days, savingsSteps, expenseCategories, incomeEntries, monthlyTotals]);

  // Month label positions
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

    const items = dayMap.get(iso);
    const canToggle = onToggleSavingsDay && !isFuture(day);

    if (!items || items.length === 0) {
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

    const stripeWidth = CELL_SIZE / items.length;
    return (
      <g key={iso}>
        {items.map((item, i) => (
          <rect
            key={i}
            x={x + i * stripeWidth}
            y={y}
            width={stripeWidth}
            height={CELL_SIZE}
            rx={i === 0 ? 2 : 0}
            fill={item.color}
            className={canToggle && item.stepId ? 'cursor-pointer' : 'cursor-default'}
            onClick={() => {
              if (canToggle && item.stepId) {
                onToggleSavingsDay(item.stepId, iso);
              }
            }}
            onMouseEnter={(e) =>
              setTooltip({
                x: e.clientX,
                y: e.clientY,
                date: format(day, 'MMM d, yyyy'),
                items,
              })
            }
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
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
        {monthPositions.map(({ month, col }) => (
          <text
            key={month}
            x={30 + col * (CELL_SIZE + CELL_GAP)}
            y={14}
            fill="#9ca3af"
            fontSize={10}
          >
            {MONTH_NAMES_SHORT[month]}
          </text>
        ))}

        {[1, 3, 5].map((d) => (
          <text
            key={d}
            x={0}
            y={20 + d * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
            fill="#9ca3af"
            fontSize={9}
          >
            {DAY_LABELS_SHORT[d]}
          </text>
        ))}

        {days.map((day, idx) => renderCell(day, idx))}
      </svg>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="text-gray-300 font-semibold mb-1">{tooltip.date}</div>
          {tooltip.items.length === 0 ? (
            <div className="text-gray-500">No activity</div>
          ) : (
            tooltip.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-gray-300">{item.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
