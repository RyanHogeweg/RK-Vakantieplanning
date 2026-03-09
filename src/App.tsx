import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Printer, Upload } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { EmployeePanel } from './components/EmployeePanel';
import { PlanningBoard } from './components/PlanningBoard';
import { VacationPanel } from './components/VacationPanel';
import { AppData, Employee, VacationPeriod } from './types';
import { upsertById } from './utils/collection';
import { exportPlanningToExcel } from './utils/excelExport';
import { exportBackupData, loadAppData, parseRestoreFile, saveAppData } from './utils/storage';
import './styles/app.css';
import './styles/print.css';

type BannerState = {
  kind: 'success' | 'error';
  text: string;
};

function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [banner, setBanner] = useState<BannerState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  const setEmployees = (updater: (employees: Employee[]) => Employee[]) => setData((previous) => ({ ...previous, employees: updater(previous.employees) }));
  const setVacations = (updater: (vacations: VacationPeriod[]) => VacationPeriod[]) =>
    setData((previous) => ({ ...previous, vacations: updater(previous.vacations) }));

  const saveEmployee = (employee: Employee) => setEmployees((existingEmployees) => upsertById(existingEmployees, employee));

  const deleteEmployee = (id: string) => {
    setEmployees((existingEmployees) => existingEmployees.filter((employee) => employee.id !== id));
    setVacations((existingVacations) => existingVacations.filter((vacation) => vacation.employeeId !== id));
  };

  const saveVacation = (vacation: VacationPeriod) => setVacations((existingVacations) => upsertById(existingVacations, vacation));

  const downloadBackup = () => {
    const blob = new Blob([exportBackupData(data)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `vakantieplanning-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBanner({ kind: 'success', text: 'Backupbestand gedownload.' });
  };

  const restoreBackup = async (file: File) => {
    try {
      const restored = await parseRestoreFile(file);
      setData(restored);
      setBanner({ kind: 'success', text: `Backup hersteld: ${restored.employees.length} medewerkers, ${restored.vacations.length} periodes.` });
    } catch (error) {
      setBanner({ kind: 'error', text: error instanceof Error ? error.message : 'Import mislukt. Gebruik een geldig backupbestand.' });
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Vakantieplanning</h1>
          <p>Interne teamplanning met maand- en jaaroverzicht</p>
        </div>
        <div className="actions-inline no-print">
          <button onClick={() => exportPlanningToExcel(data.employees, data.vacations, data.selectedYear, data.selectedMonth)}>
            <FileSpreadsheet size={16} /> Excel export
          </button>
          <button onClick={() => window.print()}>
            <Printer size={16} /> Print/PDF
          </button>
          <button onClick={downloadBackup}>
            <Download size={16} /> Backup
          </button>
          <button onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Herstel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              if (selectedFile) restoreBackup(selectedFile);
              event.target.value = '';
            }}
          />
        </div>
      </header>

      {banner && <p className={`info-banner ${banner.kind === 'error' ? 'error-banner' : ''}`}>{banner.text}</p>}

      <main>
        <Dashboard employees={data.employees} vacations={data.vacations} />
        <div className="two-col">
          <EmployeePanel employees={data.employees} onSave={saveEmployee} onDelete={deleteEmployee} />
          <VacationPanel
            employees={data.employees}
            vacations={data.vacations}
            onSave={saveVacation}
            onDelete={(id) => setVacations((existingVacations) => existingVacations.filter((vacation) => vacation.id !== id))}
            onCopy={(vacation) => setVacations((existingVacations) => [vacation, ...existingVacations])}
          />
        </div>
        <PlanningBoard
          employees={data.employees}
          vacations={data.vacations}
          selectedYear={data.selectedYear}
          selectedMonth={data.selectedMonth}
          onYearChange={(year) => setData((prev) => ({ ...prev, selectedYear: year }))}
          onMonthChange={(month) => setData((prev) => ({ ...prev, selectedMonth: month }))}
          onQuickAdd={(employeeId, date) =>
            saveVacation({ id: crypto.randomUUID(), employeeId, startDate: date, endDate: date, note: 'Snelle invoer via planning' })
          }
        />
      </main>
    </div>
  );
}

export default App;
