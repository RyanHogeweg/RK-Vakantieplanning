import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Employee, VacationPeriod } from '../types';
import { isSchoolHoliday } from './dateUtils';
import { dutchSchoolHolidaysMidden } from '../data/holidays';

export const exportPlanningToExcel = (employees: Employee[], vacations: VacationPeriod[], year: number, month: number) => {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  const header = ['Medewerker', 'Team/Rol', ...days.map((d) => format(d, 'd EEE', { locale: nl }))];
  const legend = ['Legenda', '', 'V = Vakantie', 'R = Vaste roostervrije dag', 'S = Schoolvakantie (Midden)'];

  const rows = employees
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'nl'))
    .map((emp) => {
      const dayCells = days.map((day) => {
        const onVacation = vacations.some(
          (v) => v.employeeId === emp.id && parseISO(v.startDate) <= day && parseISO(v.endDate) >= day,
        );
        if (onVacation) return 'V';
        if (emp.fixedDaysOff.includes(day.getDay())) return 'R';
        if (isSchoolHoliday(dutchSchoolHolidaysMidden, day)) return 'S';
        return '';
      });
      return [emp.name, emp.teamOrRole, ...dayCells];
    });

  const sheetData = [[`Vakantieplanning ${format(start, 'MMMM yyyy', { locale: nl })}`], [], legend, [], header, ...rows];
  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  sheet['!cols'] = [{ wch: 22 }, { wch: 18 }, ...days.map(() => ({ wch: 5 }))];
  sheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Planning');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `vakantieplanning-${year}-${month + 1}.xlsx`);
};
