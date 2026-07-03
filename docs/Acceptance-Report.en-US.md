# Acceptance Report

This document records the major acceptance checks completed for the current version.

## Build and Dependencies

- `pnpm build` passed.
- pnpm is used as the package manager.
- `package-lock.json` was not generated.
- `yarn.lock` was not generated.

## Excel Import and Field Handling

- Excel import passed for `.xlsx` and `.xls`.
- The first sheet is read by default.
- Header-row recognition passed.
- Automatic field alias mapping passed.
- Missing-field empty states passed.
- Missing fields do not block import.
- The app does not fabricate data when fields are missing.
- Invalid or incomplete data does not crash the page; data-quality notes are generated.

## Dashboard and Report

- Dynamic dashboard refresh passed.
- Core metric calculation passed.
- Age, education, tenure, and performance charts passed.
- Talent matrix and succession risk warnings passed.
- Report generation passed.
- Report content reuses the current dashboard and imported data.

## Export and Print

- PPT export passed.
- Word export passed.
- PDF export passed.
- Excel export passed.
- Excel template download passed.
- Print style passed; top buttons, tabs, import controls, and export menus are hidden during printing.

## Windows Launcher

- Windows one-click launcher passed.
- Node.js and pnpm checks passed.
- First-run dependency installation passed.
- Local development server startup passed.
- Browser auto-open after server readiness passed.

## Persistence

- localStorage persistence passed.
- The latest imported data and generated report can be restored after page refresh.
- The localStorage cache is cleared after using “清空当前数据”.

## Known Note

- Vite may show a bundle-size warning during build because PPT, Word, PDF, and Excel export libraries are relatively large. This warning does not affect build success, startup, or runtime behavior.
