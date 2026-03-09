import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { dutchSchoolHolidaysMidden } from '../data/holidays';
import { Employee, PlanningView, VacationPeriod } from '../types';
import { daysInMonth, daysInYear, isSchoolHoliday, isVacationDay } from '../utils/dateUtils';

interface Props {
  employees: Employee[];
  vacations: VacationPeriod[];
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onQuickAdd: (employeeId: string, date: string) => void;
}

const viewOptions: Array<{ value: PlanningView; label: string }> = [
  { value: 'month', label: 'Maand' },
  { value: 'year', label: 'Jaar (weekoverzicht)' },
];

export function PlanningBoard({ employees, vacations, selectedYear, onYearChange, onQuickAdd }: Props) {
export function PlanningBoard({
  employees,
  vacations,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onQuickAdd,
}: Props) {
  const [view, setView] = useState<PlanningView>('month');

  const days = useMemo(() => (view === 'month' ? daysInMonth(selectedYear, month) : daysInYear(selectedYear)), [view, selectedYear, month]);
  const displayDays = useMemo(() => (view === 'year' ? days.filter((_, index) => index % 7 === 0) : days), [days, view]);
  const days = useMemo(
    () => (view === 'month' ? daysInMonth(selectedYear, selectedMonth) : daysInYear(selectedYear)),
    [view, selectedYear, selectedMonth],
  );
  const displayDays = view === 'year' ? days.filter((_, i) => i % 7 === 0) : days;
  const years = [selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2];

  const sortedEmployees = useMemo(
    () => employees.slice().sort((first, second) => first.teamOrRole.localeCompare(second.teamOrRole, 'nl') || first.name.localeCompare(second.name, 'nl')),
    [employees],
  );

  return (
    <section className="card planning-card">
      <div className="planning-toolbar no-print">
        <div>
          <h2>Planning</h2>
          <p className="subtle">Dubbelklik op een cel voor snelle invoer van 1 dag.</p>
        </div>
        <div className="actions-inline">
          <select aria-label="Selecteer jaar" value={selectedYear} onChange={(event) => onYearChange(Number(event.target.value))}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select aria-label="Selecteer weergave" value={view} onChange={(event) => setView(event.target.value as PlanningView)}>
            {viewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {view === 'month' && (
            <select aria-label="Selecteer maand" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {Array.from({ length: 12 }).map((_, index) => (
                <option key={index} value={index}>
                  {format(new Date(selectedYear, index, 1), 'MMMM', { locale: nl })}
                </option>
            <select value={selectedMonth} onChange={(e) => onMonthChange(Number(e.target.value))}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx} value={idx}>{format(new Date(selectedYear, idx, 1), 'MMMM', { locale: nl })}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="legend">
        <span>
          <i className="swatch vacation" /> Vakantie
        </span>
        <span>
          <i className="swatch fixed" /> Vaste vrije dag
        </span>
        <span>
          <i className="swatch holiday" /> Schoolvakantie Midden
        </span>
      </div>

      <div className="planning-grid-wrapper">
        <table className="planning-grid">
          <thead>
            <tr>
              <th>Medewerker</th>
              {displayDays.map((day) => (
                <th key={day.toISOString()} className={day.getDay() === 0 || day.getDay() === 6 ? 'weekend' : ''}>
                  {view === 'month' ? format(day, 'd EEE', { locale: nl }) : format(day, 'd MMM', { locale: nl })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="name-cell">
                  <strong>{employee.name}</strong>
                  <small>{employee.teamOrRole}</small>
                </td>
                {displayDays.map((day) => {
                  const isVacation = isVacationDay(vacations, employee.id, day);
                  const isFixedDay = employee.fixedDaysOff.includes(day.getDay());
                  const holiday = isSchoolHoliday(dutchSchoolHolidaysMidden, day);
                  const cellClass = [
                    isVacation ? 'cell-vacation' : '',
                    !isVacation && isFixedDay ? 'cell-fixed' : '',
                    !isVacation && !isFixedDay && holiday ? 'cell-holiday' : '',
                    day.getDay() === 0 || day.getDay() === 6 ? 'weekend' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <td
                      key={day.toISOString()}
                      className={cellClass}
                      title={holiday ? holiday.name : ''}
                      onDoubleClick={() => onQuickAdd(employee.id, format(day, 'yyyy-MM-dd'))}
                    >
                      {isVacation ? 'V' : isFixedDay ? 'R' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
