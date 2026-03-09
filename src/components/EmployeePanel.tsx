import { useMemo, useState } from 'react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  onSave: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

const weekdayOptions = [
  { label: 'Zon', value: 0 },
  { label: 'Maa', value: 1 },
  { label: 'Din', value: 2 },
  { label: 'Woe', value: 3 },
  { label: 'Don', value: 4 },
  { label: 'Vrij', value: 5 },
  { label: 'Zat', value: 6 },
];

const emptyEmployee: Employee = { id: '', name: '', teamOrRole: '', fixedDaysOff: [], notes: '' };

export function EmployeePanel({ employees, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Employee>(emptyEmployee);

  const groupedEmployees = useMemo(() => {
    const grouped = employees.reduce<Record<string, Employee[]>>((acc, emp) => {
      const key = emp.teamOrRole || 'Onbekend';
      acc[key] = [...(acc[key] || []), emp];
      return acc;
    }, {});
    Object.keys(grouped).forEach((k) => grouped[k].sort((a, b) => a.name.localeCompare(b.name, 'nl')));
    return grouped;
  }, [employees]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, id: form.id || crypto.randomUUID(), teamOrRole: form.teamOrRole || 'Algemeen' });
    setForm(emptyEmployee);
  };

  return (
    <section className="card">
      <h2>Medewerkers</h2>
      <form className="form-grid" onSubmit={submit}>
        <input placeholder="Naam" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Team / rol" value={form.teamOrRole} onChange={(e) => setForm({ ...form, teamOrRole: e.target.value })} required />
        <input placeholder="Notities" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div className="chip-row">
          {weekdayOptions.map((day) => (
            <label key={day.value} className="chip">
              <input
                type="checkbox"
                checked={form.fixedDaysOff.includes(day.value)}
                onChange={() =>
                  setForm({
                    ...form,
                    fixedDaysOff: form.fixedDaysOff.includes(day.value)
                      ? form.fixedDaysOff.filter((d) => d !== day.value)
                      : [...form.fixedDaysOff, day.value],
                  })
                }
              />
              {day.label}
            </label>
          ))}
        </div>
        <button type="submit">{form.id ? 'Opslaan' : 'Toevoegen'}</button>
      </form>

      <div className="list-stack">
        {Object.entries(groupedEmployees).map(([group, list]) => (
          <div key={group}>
            <h3>{group}</h3>
            {list.map((emp) => (
              <div className="list-item" key={emp.id}>
                <div>
                  <strong>{emp.name}</strong>
                  <p>{emp.notes || 'Geen notities'}</p>
                </div>
                <div className="actions-inline">
                  <button onClick={() => setForm(emp)}>Bewerk</button>
                  <button className="danger" onClick={() => onDelete(emp.id)}>
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
