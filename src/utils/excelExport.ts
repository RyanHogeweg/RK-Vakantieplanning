import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Employee, VacationPeriod } from '../types';
import { isSchoolHoliday } from './dateUtils';
import { dutchSchoolHolidaysMidden } from '../data/holidays';

const withCell = (sheet: XLSX.WorkSheet, cell: string, value: string) => {
  sheet[cell] = { t: 's', v: value };
};

export const exportPlanningToExcel = (employees: Employee[], vacations: VacationPeriod[], year: number, month: number) => {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  const sortedEmployees = employees.slice().sort((a, b) => a.name.localeCompare(b.name, 'nl'));

  const reportHeader = [
    ['Vakantieplanning rapport'],
    [`Periode: ${format(start, 'MMMM yyyy', { locale: nl })}`],
    [`Gegenereerd op: ${format(new Date(), 'dd-MM-yyyy HH:mm')}`],
    [],
    ['Legenda', 'V = Vakantie', 'R = Vaste roostervrije dag', 'S = Schoolvakantie (Midden)'],
    [],
  ];

  const tableHeader = ['Medewerker', 'Team / Rol', ...days.map((d) => format(d, 'dd EEE', { locale: nl }))];

  const rows = sortedEmployees.map((employee) => {
    const dayCells = days.map((day) => {
      const onVacation = vacations.some(
        (vacation) => vacation.employeeId === employee.id && parseISO(vacation.startDate) <= day && parseISO(vacation.endDate) >= day,
      );
      if (onVacation) return 'V';
      if (employee.fixedDaysOff.includes(day.getDay())) return 'R';
      if (isSchoolHoliday(dutchSchoolHolidaysMidden, day)) return 'S';
      return '';
    });
    return [employee.name, employee.teamOrRole, ...dayCells];
  });

  const totals = [
    'Totaal',
    '',
    ...days.map(
      (day) =>
        sortedEmployees.filter((employee) =>
          vacations.some(
            (vacation) => vacation.employeeId === employee.id && parseISO(vacation.startDate) <= day && parseISO(vacation.endDate) >= day,
          ),
        ).length,
    ),
  ];

  const sheet = XLSX.utils.aoa_to_sheet([...reportHeader, tableHeader, ...rows, totals]);

  sheet['!cols'] = [{ wch: 26 }, { wch: 18 }, ...days.map(() => ({ wch: 5 }))];
  sheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
  ];
  sheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({ s: { r: reportHeader.length, c: 0 }, e: { r: reportHeader.length + rows.length, c: days.length + 1 } }),
  };
  sheet['!freeze'] = { xSplit: 2, ySplit: reportHeader.length + 1 };

  withCell(sheet, 'A1', 'Vakantieplanning rapport');

  const summary = XLSX.utils.json_to_sheet(
    sortedEmployees.map((employee) => {
      const employeeVacations = vacations.filter((vacation) => vacation.employeeId === employee.id);
      return {
        Medewerker: employee.name,
        Team: employee.teamOrRole,
        Aantal_periodes: employeeVacations.length,
        Vakantiedagen: employeeVacations.reduce(
          (total, vacation) =>
            total + eachDayOfInterval({ start: parseISO(vacation.startDate), end: parseISO(vacation.endDate) }).length,
          0,
        ),
      };
    }),
  );
  summary['!cols'] = [{ wch: 26 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Planning');
  XLSX.utils.book_append_sheet(workbook, summary, 'Samenvatting');

  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `vakantieplanning-rapport-${year}-${month + 1}.xlsx`);
};
