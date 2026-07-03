English | [简体中文](./验收记录.md)

# Acceptance Report

This document records the major acceptance checks completed for the current version.

## Build and Dependencies

- `pnpm build` passed.
- pnpm is used as the package manager.
- `package-lock.json` was not generated.
- `yarn.lock` was not generated.

## Excel Import and Field Handling

- Excel roster import passed for `.xlsx` and `.xls`.
- The first sheet is read by default.
- Header-row recognition passed.
- Automatic field alias mapping passed.
- Missing field notes passed.
- Missing fields do not block import.
- The system does not fabricate data when fields are missing.
- Invalid or incomplete data generates data quality notes and does not crash the page.

## Dashboard and Analysis Report

- Dashboard refresh passed.
- Core metric calculation passed.
- Age, education, tenure, and performance charts passed.
- Talent matrix and succession risk warnings passed.
- Analysis report generation passed.
- The analysis report reuses the current dashboard and imported data.

## Export and Print

- PPT export passed.
- Word export passed.
- PDF export passed.
- Excel export passed.
- Excel roster template download passed.
- Print styles passed. Top buttons, tabs, import controls, and export menus are hidden during printing.

## Windows Launcher

- Windows launcher passed.
- The setup script checks Node.js and pnpm.
- The setup script prepares pnpm through corepack when pnpm is missing.
- The setup script downloads portable Node.js into the local `.runtime` directory when Node.js is missing.
- First-run dependency installation passed.
- Local development server startup passed.
- Browser auto-open after server readiness passed.
- `START_HERE.bat` is available as the recommended launcher for ZIP downloads.

## Local Persistence

- localStorage persistence passed.
- The latest imported data and generated analysis report can be restored after page refresh.
- The localStorage cache is cleared after using “清空当前数据”.

## Known Note

- Vite reports that some chunks exceed the default size threshold during build because PPT, Word, PDF, and Excel export dependencies are relatively large. This message does not affect build success, startup, or runtime behavior.
