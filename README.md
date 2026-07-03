English | [简体中文](./README.zh-CN.md)

# Talent Management Dashboard

Talent Management Dashboard is a local browser-based HR analytics application built with React, TypeScript, and Vite. It imports Excel roster files, maps common field aliases, displays dashboard metrics, generates analysis reports, and exports report files in multiple formats.

The project is designed for talent review, workforce structure analysis, succession risk review, and monthly HR reporting. Data processing runs locally in the browser; the repository does not include a backend service or remote database.

## Live Demo

```text
https://henrylee789.github.io/talent-dashboard/
```

## Features

- Import Excel roster files in `.xlsx` and `.xls` formats.
- Map Chinese headers, common Chinese aliases, and English aliases to standard fields.
- Display dashboard metrics and modules for talent structure, performance, talent matrix, and succession risk.
- Show data quality notes when fields are missing, without fabricating data.
- Generate monthly analysis reports.
- Export reports as PPT, Word, PDF, and Excel files.
- Download a standard Excel roster template.
- Print the dashboard, analysis report, or data-entry summary.
- Start locally with Windows launchers and an environment setup script.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- ECharts
- xlsx
- pptxgenjs
- docx
- jspdf
- html2canvas
- pnpm

## Quick Start

### Windows Launcher

After downloading and extracting the repository ZIP package, double-click:

```text
START_HERE.bat
```

The launcher prepares the local runtime environment, installs dependencies, and starts the application. A Chinese launcher is also available:

```text
一键部署环境并启动.bat
```

After startup, open:

```text
http://127.0.0.1:5173/
```

For complete instructions, see [User Guide](./docs/User-Guide.en-US.md).

### Manual Setup

```bash
pnpm install
pnpm dev --host 127.0.0.1
```

Production build:

```bash
pnpm build
```

## Excel Roster Template

Click “下载模板” in the application to download `关键人才花名册模板.xlsx`. The template includes a roster sheet, sample rows, and field instructions.

## Field Mapping

The application maps Excel headers to standard fields using a built-in alias dictionary. For example, `Name` maps to `姓名`, `Gender` maps to `性别`, and `Hire Date` maps to `入职日期`.

See [Field Mapping](./docs/Field-Mapping.en-US.md) for the full field list.

## Reports and Export

The analysis report includes overview metrics, talent structure, performance, risk notes, management insights, and action recommendations. Reports can be exported as PPT, Word, PDF, and Excel files.

## Project Structure

```text
.
├─ .github/workflows/
├─ docs/
├─ scripts/
├─ src/
├─ START_HERE.bat
├─ 一键部署环境并启动.bat
├─ 启动人才看板.bat
├─ package.json
├─ pnpm-lock.yaml
├─ README.md
├─ README.zh-CN.md
└─ vite.config.ts
```

## Data Privacy Notice

This project is designed to run locally in the browser. Do not commit real employee rosters, sensitive personal data, or generated reports to a public repository.

## FAQ

### Why are some metrics empty after import?

The Excel roster may be missing required fields, or the mapped fields may not contain usable values. Review the field mapping and data quality notes in the “数据录入” tab.

### Can custom field names be used?

Yes. Common Chinese and English aliases are supported. See [Field Mapping](./docs/Field-Mapping.en-US.md).

### Is there an acceptance report?

Yes. See [Acceptance Report](./docs/Acceptance-Report.en-US.md).

## License

No open-source license has been selected for this repository. Add a license file before reuse, redistribution, or commercial use.
