import { AppData } from '../types';

export const seedData: AppData = {
  selectedYear: new Date().getFullYear(),
  employees: [
    { id: 'e1', name: 'Sanne de Vries', teamOrRole: 'Operations', fixedDaysOff: [3], notes: 'Werkt liefst vroeg.' },
    { id: 'e2', name: 'Jeroen Bakker', teamOrRole: 'Operations', fixedDaysOff: [5], notes: '' },
    { id: 'e3', name: 'Fatima El Amrani', teamOrRole: 'Customer Support', fixedDaysOff: [2], notes: 'Niet bereikbaar op dinsdagmiddag.' },
    { id: 'e4', name: 'Koen van Dijk', teamOrRole: 'Customer Support', fixedDaysOff: [], notes: '' },
    { id: 'e5', name: 'Lisa Jansen', teamOrRole: 'Planning', fixedDaysOff: [1], notes: 'Parttime op maandag vrij.' },
  ],
  vacations: [
    { id: 'v1', employeeId: 'e1', startDate: '2026-01-08', endDate: '2026-01-12', note: 'Wintersport' },
    { id: 'v2', employeeId: 'e2', startDate: '2026-03-02', endDate: '2026-03-06', note: '' },
    { id: 'v3', employeeId: 'e3', startDate: '2026-05-11', endDate: '2026-05-22', note: 'Familiebezoek' },
    { id: 'v4', employeeId: 'e4', startDate: '2026-07-27', endDate: '2026-08-07', note: 'Zomervakantie' },
    { id: 'v5', employeeId: 'e5', startDate: '2026-10-19', endDate: '2026-10-23', note: '' },
  ],
};
