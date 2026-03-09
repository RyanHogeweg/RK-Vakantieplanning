import { useState } from 'react';
import { Employee, VacationPeriod } from '../types';
import { validateDateRange } from '../utils/validation';
import { shiftDays } from '../utils/dateUtils';

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
          <option value="">Kies medewerker</option>
          {employees.map((emp) => (
            <option value={emp.id} key={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
        <input placeholder="Notitie" value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <button type="submit">{form.id ? 'Opslaan' : 'Toevoegen'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="list-stack">
        {vacations.map((vac) => {
          const employee = employees.find((e) => e.id === vac.employeeId);
          return (
            <div className="list-item" key={vac.id}>
              <div>
                <strong>{employee?.name ?? 'Onbekend'}</strong>
                <p>
                  {vac.startDate} t/m {vac.endDate} {vac.note ? `• ${vac.note}` : ''}
                </p>
              </div>
              <div className="actions-inline">
                <button onClick={() => setForm(vac)}>Bewerk</button>
                <button onClick={() => onCopy({ ...vac, id: crypto.randomUUID(), startDate: shiftDays(vac.startDate, 7), endDate: shiftDays(vac.endDate, 7) })}>
                  Kopieer +1 week
                </button>
                <button className="danger" onClick={() => onDelete(vac.id)}>
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
