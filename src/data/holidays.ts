export interface HolidayRange {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export const dutchSchoolHolidaysMidden: HolidayRange[] = [
  { id: 'spring-2025', name: 'Voorjaarsvakantie', startDate: '2025-02-15', endDate: '2025-02-23' },
  { id: 'may-2025', name: 'Meivakantie', startDate: '2025-04-26', endDate: '2025-05-04' },
  { id: 'summer-2025', name: 'Zomervakantie', startDate: '2025-07-19', endDate: '2025-08-31' },
  { id: 'autumn-2025', name: 'Herfstvakantie', startDate: '2025-10-18', endDate: '2025-10-26' },
  { id: 'christmas-2025', name: 'Kerstvakantie', startDate: '2025-12-20', endDate: '2026-01-04' },
  { id: 'spring-2026', name: 'Voorjaarsvakantie', startDate: '2026-02-21', endDate: '2026-03-01' },
  { id: 'may-2026', name: 'Meivakantie', startDate: '2026-04-25', endDate: '2026-05-03' },
  { id: 'summer-2026', name: 'Zomervakantie', startDate: '2026-07-18', endDate: '2026-08-30' },
  { id: 'autumn-2026', name: 'Herfstvakantie', startDate: '2026-10-17', endDate: '2026-10-25' },
  { id: 'christmas-2026', name: 'Kerstvakantie', startDate: '2026-12-19', endDate: '2027-01-03' },
];
