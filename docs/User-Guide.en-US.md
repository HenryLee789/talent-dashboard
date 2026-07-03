# User Guide

This guide is written for regular users. No coding knowledge is required.

## Step 1: Start the App

Find this file in the project folder:

```text
启动人才看板.bat
```

Double-click it to start the app.

On first startup, the launcher may install dependencies automatically. This can take a few minutes. Keep the command window open.

After startup, the browser should open automatically. If it does not, visit:

```text
http://127.0.0.1:5173/
```

If startup fails, check whether Node.js and pnpm are installed.

To stop the app:

```text
Close the launcher command window.
```

To create a desktop shortcut:

1. Right-click `启动人才看板.bat`.
2. Choose “Send to > Desktop shortcut”.
3. Use the desktop shortcut next time.

## Step 2: Download the Excel Template

After opening the app, click “下载模板” in the top-right area. The app downloads:

```text
关键人才花名册模板.xlsx
```

The template has three sheets:

- `花名册`: fill official import data here.
- `填写示例`: examples only; do not keep them as official data.
- `填写说明`: field rules and supported aliases.

## Step 3: Fill in the Roster

Open the template and fill employee rows in the `花名册` sheet.

Notes:

- The first row must contain field headers.
- Do not add a title, note, or blank row before the header row.
- Each row represents one employee.
- The `填写示例` sheet is only for reference.
- Do not commit real sensitive employee data to a public GitHub repository.

## Step 4: Import Excel

Return to the app, click “导入Excel”, and choose your completed `.xlsx` or `.xls` file.

After import, open the “数据录入” tab to review:

- Imported row count.
- Field mapping results.
- Missing fields.
- Data-quality notes.

## Step 5: View the Dashboard

Open the “数据看板” tab to view the generated talent dashboard, including:

- Key talent count.
- Male/female ratio.
- Average age.
- Master-degree-and-above ratio.
- Under-35 ratio.
- Average tenure.
- Age, education, tenure, and performance charts.
- Talent matrix and succession risk warnings.

## Step 6: Generate the Report

Click the “生成报告” dropdown and choose “生成当前月报告”.

The app generates an analysis report from the current Excel data, including overview, structure analysis, performance analysis, risk notes, management insights, and action suggestions.

If no Excel file has been imported, the app generates a preview report clearly marked as sample content.

## Step 7: Export PPT / Word / PDF / Excel

Click the “生成报告” dropdown to export:

- PPT report.
- Word report.
- PDF report.
- Excel report.

If no report exists yet, the app generates the current monthly report first and then exports the selected file.

## Step 8: Print

Click “打印” to print the current page.

During printing, the app hides top buttons, tabs, import controls, and export menus, keeping only print-friendly content.

The printed content depends on the current tab:

- “数据看板” prints the dashboard.
- “分析报告” prints the report.
- “数据录入” prints the data-entry summary.

## Missing-Field Handling

Missing Excel fields do not block import, and the app does not fabricate data.

Examples:

- If `绩效等级` is missing, the performance chart shows no data.
- If `学历` is missing, education metrics and charts show empty states.
- If `是否关键人才` is missing but `人才分类` exists, the app uses available fields where possible.
- If `年龄` is missing but `出生日期` exists, the app can derive age where possible.
- If `任职年限` is missing but `入职日期` exists, the app can derive tenure where possible.

Reports and exports also explain which analyses cannot be generated because of missing fields.
