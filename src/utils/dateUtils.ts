import {
  format,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  getDay,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  getMonth,
} from 'date-fns';

export const YEAR = new Date().getFullYear();

export function getDaysOfYear(year: number = YEAR): Date[] {
  return eachDayOfInterval({
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 0, 1)),
  });
}

export function toISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function isHabitPlannedForDay(
  freq: 'daily' | 'weekly' | 'monthly',
  freqDays: number[] | undefined,
  date: Date,
  startDate: string,
  endDate?: string
): boolean {
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : endOfYear(new Date(YEAR, 0, 1));
  if (!isWithinInterval(date, { start, end })) return false;

  if (freq === 'daily') return true;
  if (freq === 'weekly') {
    const days = freqDays && freqDays.length > 0 ? freqDays : [1, 2, 3, 4, 5];
    return days.includes(getDay(date));
  }
  if (freq === 'monthly') {
    // First day of each month
    return date.getDate() === 1;
  }
  return false;
}

export function isSavingsPlannedForDay(
  date: Date,
  startDate: string,
  endDate?: string
): boolean {
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : endOfYear(new Date(YEAR, 0, 1));
  return isWithinInterval(date, { start, end });
}

export function getDaysInMonth(year: number, month: number): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(new Date(year, month, 1)),
    end: endOfMonth(new Date(year, month, 1)),
  });
}

export function getMonthName(month: number): string {
  return format(new Date(YEAR, month, 1), 'MMM');
}

export function getMonthsArray(): number[] {
  return Array.from({ length: 12 }, (_, i) => i);
}

export function getWeekdayOffset(year: number): number {
  return getDay(startOfYear(new Date(year, 0, 1)));
}

export const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  format(new Date(2024, i, 1), 'MMMM')
);

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function uuid(): string {
  return crypto.randomUUID();
}

export function getMonthFromDate(dateStr: string): number {
  return getMonth(parseISO(dateStr));
}
