export interface Employee {
  id: string;
  name: string;
  teamOrRole: string;
  fixedDaysOff: number[];
  notes: string;
}

export interface VacationPeriod {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface AppData {
  employees: Employee[];
  vacations: VacationPeriod[];
  selectedYear: number;
}

export type PlanningView = 'month' | 'year';
