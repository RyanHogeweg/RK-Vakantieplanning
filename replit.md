# RK Vakantieplanning

A Dutch vacation planning application for internal team scheduling with monthly and yearly overviews.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 6
- **Styling**: Custom CSS (app.css, print.css)
- **Libraries**: date-fns, lucide-react, xlsx, file-saver
- **Build Tool**: Vite with `@vitejs/plugin-react`

## Project Structure

```
src/
  App.tsx                 - Root application component
  main.tsx                - Entry point
  components/
    Dashboard.tsx         - Main dashboard view
    EmployeePanel.tsx     - Employee management panel
    PlanningBoard.tsx     - Vacation planning board
    VacationPanel.tsx     - Vacation period management
  data/
    holidays.ts           - Public holiday data
    seedData.ts           - Initial seed data
  styles/
    app.css               - Main styles
    print.css             - Print-specific styles
  types/
    index.ts              - TypeScript type definitions
  utils/
    dateUtils.ts          - Date utility functions
    excelExport.ts        - Excel export functionality
    storage.ts            - Local storage utilities
    validation.ts         - Input validation utilities
```

## Development

- Run: `npm run dev` (served on port 5000)
- Build: `npm run build`

## Deployment

Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `dist`
