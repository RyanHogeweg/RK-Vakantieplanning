# RK Vakantieplanning

Desktop webapp voor interne vakantieplanning van een team, gebouwd met React + TypeScript + Vite en lokale opslag.

## Run in Replit / lokaal

```bash
npm install
npm run dev
```

Open daarna de getoonde URL (standaard `http://localhost:5173`).

## Folderstructuur

- `src/components` – UI-secties (dashboard, medewerkers, vakanties, planning)
- `src/types` – centrale TypeScript-modellen
- `src/utils` – datumfuncties, opslag, validatie, Excel-export
- `src/data` – seed data en schoolvakanties (Midden)
- `src/styles` – app- en print-styling

## Architectuurkeuzes

- **Eén centrale App-state** (`AppData`) om gedrag voorspelbaar en eenvoudig uitbreidbaar te houden.
- **Pure utilities** voor datumberekeningen, validatie en storage/parsing zodat componenten licht blijven.
- **Lokaal persistent** met `localStorage`, inclusief fail-safe fallback naar seed data bij corrupte data.
- **Productiegerichte exports**:
  - Excel-export met legenda en planningmatrix.
  - Browser print-stylesheet voor nette PDF-uitvoer.
- **Uitbreidbaar teammodel** met `teamOrRole`-groepering en alfabetische sortering.

