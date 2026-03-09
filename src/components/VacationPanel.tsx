import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Employee, VacationPeriod } from '../types';
import { shiftDays } from '../utils/dateUtils';
import { validateDateRange } from '../utils/validation';

interface Props {
  employees: Employee[];
  vacations: VacationPeriod[];
  onSave: (vacation: VacationPeriod) => void;
  onDelete: (id: string) => void;
  onCopy: (vacation: VacationPeriod) => void;
}

const emptyVacation: VacationPeriod = { id: '', employeeId: '', startDate: '', endDate: '', note: '' };

export function VacationPanel({ employees, vacations, onSave, onDelete, onCopy }: Props) {
  const [form, setForm] = useState<VacationPeriod>(emptyVacation);
  const [error, setError] = useState('');

  const sortedVacations = useMemo(
    () => vacations.slice().sort((first, second) => first.startDate.localeCompare(second.startDate)),
    [vacations],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateDateRange(form.startDate, form.endDate);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!form.employeeId) {
      setError('Selecteer een medewerker.');
      return;
    }

    onSave({ ...form, id: form.id || crypto.randomUUID() });
    setForm(emptyVacation);
    setError('');
  };

  return (
    <section className="card">
      <h2>Vakantieperiodes</h2>
      <form className="form-grid" onSubmit={submit}>
        <div className="form-row two-up">
          <label>
            Medewerker
            <select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} required>
              <option value="">Kies medewerker</option>
              {employees
                .slice()
                .sort((first, second) => first.name.localeCompare(second.name, 'nl'))
                .map((employee) => (
                  <option value={employee.id} key={employee.id}>
                    {employee.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Notitie
            <input placeholder="Optioneel" value={form.note || ''} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          </label>
        </div>

        <div className="form-row two-up">
          <label>
            Startdatum
            <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
          </label>
          <label>
            Einddatum
            <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
          </label>
        </div>

        <div className="actions-inline">
          <button type="submit">{form.id ? 'Wijzigingen opslaan' : 'Periode toevoegen'}</button>
          {form.id && (
            <button type="button" onClick={() => setForm(emptyVacation)}>
              Annuleren
            </button>
          )}
        </div>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="list-stack">
        {sortedVacations.map((vacation) => {
          const employee = employees.find((currentEmployee) => currentEmployee.id === vacation.employeeId);
          return (
            <div className="list-item" key={vacation.id}>
              <div>
                <strong>{employee?.name ?? 'Onbekend'}</strong>
                <p>
                  {format(parseISO(vacation.startDate), 'dd MMM yyyy', { locale: nl })} t/m{' '}
                  {format(parseISO(vacation.endDate), 'dd MMM yyyy', { locale: nl })}
                  {vacation.note ? ` • ${vacation.note}` : ''}
                </p>
              </div>
              <div className="actions-inline">
                <button onClick={() => setForm(vacation)}>Bewerk</button>
                <button
                  onClick={() =>
                    onCopy({
                      ...vacation,
                      id: crypto.randomUUID(),
                      startDate: shiftDays(vacation.startDate, 7),
                      endDate: shiftDays(vacation.endDate, 7),
                    })
                  }
                >
                  Kopieer +1 week
                </button>
                <button className="danger" onClick={() => onDelete(vacation.id)}>
                  Verwijder
                </button>
              </div>
            </div>
          );
        })}
        {!vacations.length && <p className="empty">Nog geen vakantieperiodes.</p>}
      </div>
    </section>
  );
}
