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
  const displayDays = days;
  const days = useMemo(
    () => (view === 'month' ? daysInMonth(selectedYear, selectedMonth) : daysInYear(selectedYear)),
    [view, selectedYear, selectedMonth],
  );
  const displayDays = view === 'year' ? days.filter((_, i) => i % 7 === 0) : days;
  const years = [selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2];

  return (
    <section className="card planning-card">
      <div className="planning-toolbar no-print">
        <h2>Planning</h2>
        <div className="actions-inline">
          <select value={selectedYear} onChange={(e) => onYearChange(Number(e.target.value))}>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select value={view} onChange={(e) => setView(e.target.value as PlanningView)}>
            <option value="month">Maand</option>
            <option value="year">Jaar</option>
          </select>
          {view === 'month' && (
            <select value={selectedMonth} onChange={(e) => onMonthChange(Number(e.target.value))}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx} value={idx}>{format(new Date(selectedYear, idx, 1), 'MMMM', { locale: nl })}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="legend">
        <span><i className="swatch vacation"/> Vakantie</span>
        <span><i className="swatch fixed"/> Vaste vrije dag</span>
        <span><i className="swatch holiday"/> Schoolvakantie Midden</span>
      </div>

      <div className="planning-grid-wrapper">
        <table className={`planning-grid ${view === 'year' ? 'year-view' : ''}`}>
          <thead>
            <tr>
              <th>Medewerker</th>
              {displayDays.map((day) => (
                <th key={day.toISOString()} className={view === 'year' && day.getDate() === 1 ? 'month-start' : ''}>
                  {view === 'month' ? format(day, 'd EEE', { locale: nl }) : format(day, 'd MMM', { locale: nl })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="name-cell">{employee.name}</td>
                {displayDays.map((day) => {
                  const isVac = isVacationDay(vacations, employee.id, day);
                  const isFixed = employee.fixedDaysOff.includes(day.getDay());
                  const holiday = isSchoolHoliday(dutchSchoolHolidaysMidden, day);
                  return (
                    <td
                      key={day.toISOString()}
                      className={`${isVac ? 'cell-vacation' : ''} ${!isVac && isFixed ? 'cell-fixed' : ''} ${!isVac && !isFixed && holiday ? 'cell-holiday' : ''} ${view === 'year' && day.getDate() === 1 ? 'month-start' : ''}`}
                      title={holiday ? holiday.name : ''}
                      onDoubleClick={() => onQuickAdd(employee.id, format(day, 'yyyy-MM-dd'))}
                    >
                      {isVac ? 'V' : isFixed ? 'R' : ''}
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
