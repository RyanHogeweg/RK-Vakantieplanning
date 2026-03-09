import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Printer, Upload } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { EmployeePanel } from './components/EmployeePanel';
import { PlanningBoard } from './components/PlanningBoard';
import { VacationPanel } from './components/VacationPanel';
import { AppData, Employee, VacationPeriod } from './types';
import { exportPlanningToExcel } from './utils/excelExport';
import { exportBackupData, loadAppData, parseRestoreFile, saveAppData } from './utils/storage';
import './styles/app.css';
import './styles/print.css';

type AppPage = 'overzicht' | 'medewerkers' | 'vakanties' | 'planning' | 'beheer';

function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [message, setMessage] = useState('');
  const [activePage, setActivePage] = useState<AppPage>('overzicht');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const setEmployees = (updater: (employees: Employee[]) => Employee[]) =>
    setData((prev) => ({ ...prev, employees: updater(prev.employees) }));
  const setVacations = (updater: (vacations: VacationPeriod[]) => VacationPeriod[]) =>
    setData((prev) => ({ ...prev, vacations: updater(prev.vacations) }));

  const saveEmployee = (employee: Employee) => {
    setEmployees((existing) => {
      const found = existing.some((e) => e.id === employee.id);
      return found ? existing.map((e) => (e.id === employee.id ? employee : e)) : [...existing, employee];
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees((existing) => existing.filter((e) => e.id !== id));
    setVacations((existing) => existing.filter((v) => v.employeeId !== id));
  };

  const saveVacation = (vacation: VacationPeriod) => {
    setVacations((existing) => {
      const found = existing.some((v) => v.id === vacation.id);
      return found ? existing.map((v) => (v.id === vacation.id ? vacation : v)) : [...existing, vacation];
    });
  };

  const downloadBackup = () => {
    const blob = new Blob([exportBackupData(data)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vakantieplanning-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (file: File) => {
    try {
      const restored = await parseRestoreFile(file);
      setData(restored);
      setMessage('Backup succesvol hersteld.');
    } catch {
      setMessage('Import mislukt. Gebruik een geldig backupbestand.');
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Vakantieplanning</h1>
          <p>Interne teamplanning met maand- en jaaroverzicht</p>
        </div>
      </header>

      <nav className="page-nav no-print" aria-label="Hoofdmenu">
        <button className={activePage === 'overzicht' ? 'nav-link active' : 'nav-link'} onClick={() => setActivePage('overzicht')}>Overzicht</button>
        <button className={activePage === 'medewerkers' ? 'nav-link active' : 'nav-link'} onClick={() => setActivePage('medewerkers')}>Medewerkers</button>
        <button className={activePage === 'vakanties' ? 'nav-link active' : 'nav-link'} onClick={() => setActivePage('vakanties')}>Vakanties</button>
        <button className={activePage === 'planning' ? 'nav-link active' : 'nav-link'} onClick={() => setActivePage('planning')}>Planning</button>
        <button className={activePage === 'beheer' ? 'nav-link active' : 'nav-link'} onClick={() => setActivePage('beheer')}>Beheer</button>
      </nav>

      {message && <p className="info-banner">{message}</p>}

      <main>
        {activePage === 'overzicht' && <Dashboard employees={data.employees} vacations={data.vacations} />}

        {activePage === 'medewerkers' && <EmployeePanel employees={data.employees} onSave={saveEmployee} onDelete={deleteEmployee} />}

        {activePage === 'vakanties' && (
          <VacationPanel
            employees={data.employees}
            vacations={data.vacations}
            onSave={saveVacation}
            onDelete={(id) => setVacations((existing) => existing.filter((v) => v.id !== id))}
            onCopy={(vacation) => setVacations((existing) => [vacation, ...existing])}
          />
        )}

        {activePage === 'planning' && (
          <PlanningBoard
            employees={data.employees}
            vacations={data.vacations}
            selectedYear={data.selectedYear}
            onYearChange={(year) => setData((prev) => ({ ...prev, selectedYear: year }))}
            onQuickAdd={(employeeId, date) =>
              saveVacation({ id: crypto.randomUUID(), employeeId, startDate: date, endDate: date, note: 'Snelle invoer via planning' })
            }
          />
        )}

        {activePage === 'beheer' && (
          <section className="card">
            <h2>Bestandsbeheer</h2>
            <p className="empty">Exporteer de planning, maak een backup of herstel een eerder bestand.</p>
            <div className="actions-inline">
              <button onClick={() => exportPlanningToExcel(data.employees, data.vacations, data.selectedYear, new Date().getMonth())}><FileSpreadsheet size={16} /> Excel export</button>
              <button onClick={() => window.print()}><Printer size={16} /> Print/PDF</button>
              <button onClick={downloadBackup}><Download size={16} /> Backup</button>
              <button onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Herstel</button>
              <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && restoreBackup(e.target.files[0])} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
