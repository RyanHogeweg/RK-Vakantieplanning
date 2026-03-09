import { seedData } from '../data/seedData';
import { AppData, Employee, VacationPeriod } from '../types';
import { validateDateRange } from './validation';

const STORAGE_KEY = 'rk-vakantieplanning-data-v1';
const MAX_BACKUP_SIZE_BYTES = 2 * 1024 * 1024;

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const isValidEmployee = (input: unknown): input is Employee => {
  if (!input || typeof input !== 'object') return false;
  const employee = input as Employee;
  return (
    isNonEmptyString(employee.id) &&
    isNonEmptyString(employee.name) &&
    isNonEmptyString(employee.teamOrRole) &&
    typeof employee.notes === 'string' &&
    Array.isArray(employee.fixedDaysOff) &&
    employee.fixedDaysOff.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)
  );
};

const isValidVacation = (input: unknown): input is VacationPeriod => {
  if (!input || typeof input !== 'object') return false;
  const vacation = input as VacationPeriod;
  return (
    isNonEmptyString(vacation.id) &&
    isNonEmptyString(vacation.employeeId) &&
    isNonEmptyString(vacation.startDate) &&
    isNonEmptyString(vacation.endDate) &&
    typeof (vacation.note ?? '') === 'string' &&
    !validateDateRange(vacation.startDate, vacation.endDate)
  );
};

const normalizeData = (input: AppData): AppData => {
  const employees = input.employees
    .map((employee) => ({ ...employee, name: employee.name.trim(), teamOrRole: employee.teamOrRole.trim(), notes: employee.notes ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'nl'));
  const employeeIds = new Set(employees.map((employee) => employee.id));
  const vacations = input.vacations
    .filter((vacation) => employeeIds.has(vacation.employeeId))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return {
    employees,
    vacations,
    selectedYear: Number.isInteger(input.selectedYear) ? input.selectedYear : new Date().getFullYear(),
  };
};

const isValidData = (input: unknown): input is AppData => {
  if (!input || typeof input !== 'object') return false;
  const data = input as AppData;
  return (
    Array.isArray(data.employees) &&
    data.employees.every(isValidEmployee) &&
    Array.isArray(data.vacations) &&
    data.vacations.every(isValidVacation) &&
    typeof data.selectedYear === 'number'
    Array.isArray(data.vacations) &&
    typeof data.selectedYear === 'number' &&
    typeof data.selectedMonth === 'number'
  );
};

export const loadAppData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return seedData;
    if ('selectedYear' in parsed && !('selectedMonth' in parsed)) {
      return { ...(parsed as AppData), selectedMonth: new Date().getMonth() };
    }
    if (!isValidData(parsed)) return seedData;
    return normalizeData(parsed);
  } catch {
    return seedData;
  }
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const exportBackupData = (data: AppData) =>
  JSON.stringify(
    {
      ...data,
      metadata: {
        exportedAt: new Date().toISOString(),
        app: 'RK Vakantieplanning',
      },
    },
    null,
    2,
  );

export const parseRestoreFile = async (file: File): Promise<AppData> => {
  if (file.size > MAX_BACKUP_SIZE_BYTES) {
    throw new Error('Bestand is te groot. Gebruik een backup tot maximaal 2 MB.');
  }
  if (!file.name.toLowerCase().endsWith('.json')) {
    throw new Error('Alleen JSON-backupbestanden zijn toegestaan.');
  }

  const text = await file.text();
  const parsed = JSON.parse(text) as AppData;
  if (!isValidData(parsed)) {
    throw new Error('Bestandstructuur ongeldig. Controleer of dit een export uit deze applicatie is.');
  }

  const normalized = normalizeData(parsed);
  if (!normalized.employees.length) {
    throw new Error('Backup bevat geen medewerkers en kan niet worden hersteld.');
  }
  return normalized;
};
