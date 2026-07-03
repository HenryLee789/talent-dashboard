# User Guide

This guide explains how to start Talent Management Dashboard on Windows, import an Excel roster, review the dashboard, generate analysis reports, and export report files.

## 1. Start the Application

After downloading and extracting the repository ZIP package, double-click the launcher in the project root:

```text
START_HERE.bat
```

The script checks the local runtime environment, prepares Node.js, pnpm, and project dependencies, and opens the browser after the application starts.

The Chinese launcher is also available:

```text
一键部署环境并启动.bat
```

For environments where Node.js and pnpm are already configured, the original launcher can also be used:

```text
启动人才看板.bat
```

After startup, the application runs at:

```text
http://127.0.0.1:5173/
```

Closing the launcher window stops the local service.

## 2. Download the Excel Roster Template

After opening the application, click “下载模板” in the top-right area. The application downloads:

```text
关键人才花名册模板.xlsx
```

The template contains:

- `花名册`: official import data.
- `填写示例`: sample rows for reference; remove sample data before import.
- `填写说明`: field rules and supported aliases.

## 3. Fill in the Roster

Fill employee records in the `花名册` sheet.

Rules:

- The first row must contain field headers.
- Do not add a title, instruction, or blank row before the headers.
- Each row represents one employee record.
- Sample data is for reference only and should not be imported as official data.
- Real employee rosters and generated reports should not be committed to a public repository.

## 4. Import Excel

Click “导入Excel” in the top-right area and select a completed `.xlsx` or `.xls` file.

After import, open the “数据录入” tab to review:

- Imported row count.
- Field mapping results.
- Missing fields.
- Data quality notes.

## 5. View the Dashboard

Open the “数据看板” tab to review metrics and analysis modules generated from the Excel roster:

- Key talent count.
- Male/female ratio.
- Average age.
- Master-degree-and-above ratio.
- Under-35 ratio.
- Average tenure.
- Age, education, tenure, and performance distributions.
- Talent matrix and succession risk warnings.

## 6. Generate an Analysis Report

Click “生成报告” and choose “生成当前月报告”.

The system generates an analysis report from the current Excel roster, including executive overview, talent structure analysis, performance analysis, risk notes, management insights, and action recommendations.

When no Excel roster has been imported, the system displays sample data and a sample report to demonstrate the page layout.

## 7. Export Reports

Use the “生成报告” dropdown to export:

- PPT report.
- Word report.
- PDF report.
- Excel report.

If no analysis report has been generated before export, the system generates the current monthly report first and then exports the selected file.

## 8. Print

Click “打印” to print the current page.

During printing, the system hides top buttons, tabs, import controls, and export menus, leaving only print-friendly content.

Printed content depends on the current tab:

- “数据看板” prints the dashboard.
- “分析报告” prints the analysis report.
- “数据录入” prints the data-entry summary.

## 9. Clear Data

Click “清空当前数据” to remove imported data, field mapping results, missing fields, data quality notes, and generated reports from browser localStorage.

This action only clears the current browser cache. It does not delete Excel files from the computer.

## 10. FAQ

### The Windows launcher does not start

Use `START_HERE.bat` first. The script prepares the local runtime environment automatically. If a download fails during setup, check the network connection and run the script again.

### Some metrics or charts are empty

The Excel roster is missing the required fields, or the mapped fields contain no usable data. Open the “数据录入” tab to review field mapping results, missing fields, and data quality notes.

### Can the Excel roster use different field names

Yes. The system supports common Chinese and English aliases. See [Field-Mapping.en-US.md](Field-Mapping.en-US.md) for the full field list.

### How should real employee data be handled

Talent Management Dashboard is designed to run locally in the browser. Real employee rosters, Excel files containing sensitive personal data, and generated reports should not be committed to a public repository.
