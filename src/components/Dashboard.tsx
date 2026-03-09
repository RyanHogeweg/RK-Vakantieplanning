import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Employee, VacationPeriod } from '../types';
import { isVacationDay } from '../utils/dateUtils';

interface DashboardProps {
  employees: Employee[];
  vacations: VacationPeriod[];
}

export function Dashboard({ employees, vacations }: DashboardProps) {
  const today = new Date();
  const onVacationToday = employees.filter((employee) => isVacationDay(vacations, employee.id, today));

  return (
    <section className="card dashboard-grid">
      <div>
        <h3>Medewerkers</h3>
        <p className="metric">{employees.length}</p>
      </div>
      <div>
        <h3>Vakantieperiodes</h3>
        <p className="metric">{vacations.length}</p>
      </div>
      <div>
        <h3>Vandaag afwezig</h3>
        <p className="metric">{onVacationToday.length}</p>
      </div>
      <div>
        <h3>Op vakantie vandaag ({format(today, 'd MMMM', { locale: nl })})</h3>
        <p>{onVacationToday.length ? onVacationToday.map((e) => e.name).join(', ') : 'Niemand op vakantie.'}</p>
      </div>
    </section>
  );
}
