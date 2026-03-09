import { seedData } from '../data/seedData';
import { AppData } from '../types';

const STORAGE_KEY = 'rk-vakantieplanning-data-v1';

const isValidData = (input: unknown): input is AppData => {
  if (!input || typeof input !== 'object') return false;
  const data = input as AppData;
  return Array.isArray(data.employees) && Array.isArray(data.vacations) && typeof data.selectedYear === 'number';
};

export const loadAppData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw);
    if (!isValidData(parsed)) return seedData;
    return parsed;
  } catch {
    return seedData;
  }
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const exportBackupData = (data: AppData) => JSON.stringify(data, null, 2);

export const parseRestoreFile = async (file: File): Promise<AppData> => {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!isValidData(parsed)) {
    throw new Error('Bestandstructuur ongeldig.');
  }
  return parsed;
};
