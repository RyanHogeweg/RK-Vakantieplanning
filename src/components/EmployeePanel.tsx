import { useMemo, useState } from 'react';
import { Employee } from '../types';
import { weekdayOptions } from '../utils/constants';

interface Props {
  employees: Employee[];
  onSave: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

const emptyEmployee: Employee = { id: '', name: '', teamOrRole: '', fixedDaysOff: [], notes: '' };

export function EmployeePanel({ employees, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Employee>(emptyEmployee);

  const groupedEmployees = useMemo(() => {
    const grouped = employees.reduce<Record<string, Employee[]>>((result, employee) => {
      const groupKey = employee.teamOrRole || 'Onbekend';
      result[groupKey] = [...(result[groupKey] || []), employee];
      return result;
    }, {});

    Object.keys(grouped).forEach((groupKey) => grouped[groupKey].sort((first, second) => first.name.localeCompare(second.name, 'nl')));
    return grouped;
  }, [employees]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, id: form.id || crypto.randomUUID(), teamOrRole: form.teamOrRole.trim() || 'Algemeen' });
    setForm(emptyEmployee);
  };

  const toggleFixedDay = (day: number) => {
    setForm((current) => ({
      ...current,
      fixedDaysOff: current.fixedDaysOff.includes(day)
        ? current.fixedDaysOff.filter((existingDay) => existingDay !== day)
        : [...current.fixedDaysOff, day].sort((a, b) => a - b),
    }));
  };

  return (
    <section className="card">
      <h2>Medewerkers</h2>
      <form className="form-grid" onSubmit={submit}>
        <div className="form-row two-up">
          <label>
            Naam
            <input placeholder="Bijv. Roos Kuiper" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Team / rol
            <input
              placeholder="Bijv. Planning"
              value={form.teamOrRole}
              onChange={(event) => setForm({ ...form, teamOrRole: event.target.value })}
              required
            />
          </label>
        </div>
        <label>
          Notities
          <input placeholder="Optioneel" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </label>
        <fieldset>
          <legend>Vaste vrije dagen</legend>
          <div className="chip-row">
            {weekdayOptions.map((day) => (
              <label key={day.value} className="chip">
                <input type="checkbox" checked={form.fixedDaysOff.includes(day.value)} onChange={() => toggleFixedDay(day.value)} />
                {day.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="actions-inline">
          <button type="submit">{form.id ? 'Wijzigingen opslaan' : 'Medewerker toevoegen'}</button>
          {form.id && (
            <button type="button" onClick={() => setForm(emptyEmployee)}>
              Annuleren
            </button>
          )}
        </div>
      </form>

      <div className="list-stack">
        {Object.entries(groupedEmployees).map(([group, list]) => (
          <div key={group}>
            <h3>{group}</h3>
            {list.map((employee) => (
              <div className="list-item" key={employee.id}>
                <div>
                  <strong>{employee.name}</strong>
                  <p>{employee.notes || 'Geen notities'}</p>
                </div>
                <div className="actions-inline">
                  <button onClick={() => setForm(employee)}>Bewerk</button>
                  <button className="danger" onClick={() => onDelete(employee.id)}>
                    Verwijder
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {!employees.length && <p className="empty">Nog geen medewerkers.</p>}
      </div>
    </section>
  );
}
