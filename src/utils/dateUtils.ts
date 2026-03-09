import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import { nl } from 'date-fns/locale';
import { HolidayRange } from '../data/holidays';
import { VacationPeriod } from '../types';

export const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
export const formatMonthLabel = (date: Date) => format(date, 'MMMM yyyy', { locale: nl });
export const formatDateLabel = (date: Date) => format(date, 'EEE d MMM', { locale: nl });

export const daysInMonth = (year: number, month: number) => {
  const start = startOfMonth(new Date(year, month, 1));
  return eachDayOfInterval({ start, end: endOfMonth(start) });
};

export const daysInYear = (year: number) => eachDayOfInterval({ start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 0, 1)) });

export const dateRange = (startDate: string, endDate: string) => eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

export const overlapsDate = (date: Date, startDate: string, endDate: string) =>
  isWithinInterval(date, { start: parseISO(startDate), end: parseISO(endDate) });

export const isVacationDay = (vacations: VacationPeriod[], employeeId: string, date: Date) =>
  vacations.some((v) => v.employeeId === employeeId && overlapsDate(date, v.startDate, v.endDate));

export const isSchoolHoliday = (holidays: HolidayRange[], date: Date) =>
  holidays.find((h) => overlapsDate(date, h.startDate, h.endDate));

export const shiftDays = (dateString: string, days: number) => toDateKey(addDays(parseISO(dateString), days));
