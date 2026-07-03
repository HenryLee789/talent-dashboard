# 关键人才管理数据看板系统

关键人才管理数据看板系统是一个基于 React、TypeScript 和 Vite 构建的本地前端应用，用于基于 Excel 花名册生成关键人才数据看板、字段映射结果、数据质量提示、分析报告以及多格式导出文件。

本项目适用于 HR 人才盘点、关键岗位继任风险观察、人才结构分析和月度汇报材料准备。所有数据处理均在浏览器本地完成，项目不包含后端服务或远程数据库。

## 在线预览

GitHub Pages 地址：

```text
https://henrylee789.github.io/talent-dashboard/
```

如仓库尚未启用 GitHub Pages，可使用下方 Windows 一键启动方式在本地运行。

## 功能特性

- 导入 `.xlsx` 和 `.xls` 格式的 Excel 花名册。
- 根据中文字段、常见中文别名和英文别名执行字段映射。
- 展示关键人才总数、性别结构、平均年龄、学历结构、35 岁及以下占比和平均任职年限等指标。
- 展示年龄、学历、任职年限、绩效分布、人才九宫格和继任风险相关模块。
- 在字段缺失时显示清晰的数据质量提示，不生成虚构数据。
- 生成当前月分析报告。
- 将分析报告导出为 PPT、Word、PDF 和 Excel 报表。
- 下载标准 Excel 花名册模板。
- 打印当前数据看板、分析报告或数据录入摘要。
- 提供 Windows 一键启动器和环境部署脚本。

## 技术栈

- Vite
- React
- TypeScript
- Tailwind CSS
- ECharts
- lucide-react
- xlsx
- pptxgenjs
- docx
- jspdf
- html2canvas
- file-saver
- pnpm

## 快速开始

### Windows 一键启动

下载仓库 ZIP 并解压后，推荐双击根目录中的：

```text
START_HERE.bat
```

该脚本会检查 Node.js 和 pnpm。如果当前 Windows 环境缺少 Node.js，脚本会下载免安装版 Node.js 到项目本地 `.runtime` 目录；如果缺少 pnpm，脚本会通过 corepack 准备 pnpm。随后脚本会安装依赖并启动应用。

中文入口同样可用：

```text
一键部署环境并启动.bat
```

已配置 Node.js 和 pnpm 的环境，也可直接使用：

```text
启动人才看板.bat
```

启动成功后，浏览器会打开：

```text
http://127.0.0.1:5173/
```

### 手动启动

开发者可使用以下命令手动运行：

```bash
pnpm install
pnpm dev --host 127.0.0.1
```

生产构建命令：

```bash
pnpm build
```

## Excel 花名册模板

在应用页面点击“下载模板”，可下载：

```text
关键人才花名册模板.xlsx
```

模板包含三个 Sheet：

- `花名册`：填写正式导入数据。
- `填写示例`：提供字段填写示例，正式导入前应移除示例数据。
- `填写说明`：说明字段规则和支持的字段别名。

导入时，系统默认读取第一个 Sheet，并将第一行识别为字段名。字段名前不应增加标题行、说明行或空行。

## 字段自动映射

系统会将 Excel 表头映射为标准字段。例如：

- `员工姓名`、`人员姓名`、`Name` 映射为 `姓名`。
- `Gender`、`Sex` 映射为 `性别`。
- `Hire Date`、`Join Date` 映射为 `入职日期`。
- `Key Talent`、`Core Talent` 映射为 `是否关键人才`。

完整字段清单见 [docs/字段映射说明.md](docs/字段映射说明.md)。

## 缺失字段处理机制

Excel 花名册缺失字段不会阻断导入，系统不会生成虚构数据。

处理规则：

- 可由其他字段推导的指标会继续计算，例如由 `出生日期` 推导年龄、由 `入职日期` 推导任职年限。
- 无法计算的指标卡片会显示空状态。
- 无法生成的图表会显示无数据提示。
- 分析报告会列出受缺失字段影响的分析范围。
- PPT、Word、PDF 和 Excel 导出文件会复用当前分析报告和数据质量提示。

## 报告与导出

点击“生成报告”可生成当前月分析报告。报告内容包括：

- 总体概览
- 人才结构分析
- 绩效分析
- 继任与流失风险提示
- 管理洞察
- 行动建议
- 缺失字段和数据质量提示

支持导出格式：

- PPT 报告
- Word 报告
- PDF 报告
- Excel 报表

## 项目结构

```text
.
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml
├─ docs/
│  ├─ 使用说明.md
│  ├─ User-Guide.en-US.md
│  ├─ 验收记录.md
│  ├─ Acceptance-Report.en-US.md
│  ├─ 字段映射说明.md
│  └─ Field-Mapping.en-US.md
├─ scripts/
│  ├─ launcher.cjs
│  └─ setup-and-launch.ps1
├─ src/
│  ├─ components/
│  ├─ hooks/
│  ├─ mock/
│  ├─ styles/
│  ├─ types/
│  └─ utils/
├─ START_HERE.bat
├─ 一键部署环境并启动.bat
├─ 启动人才看板.bat
├─ package.json
├─ pnpm-lock.yaml
├─ README.md
└─ vite.config.ts
```

## 常见问题

### Windows 一键启动器无法启动

优先使用 `START_HERE.bat`。该脚本会自动准备本地运行所需环境。若环境部署过程中下载失败，检查网络连接后重新运行脚本。

### 导入 Excel 后部分指标或图表为空

Excel 花名册缺少对应字段，或字段内容为空。可在“数据录入”页查看字段映射结果、缺失字段和数据质量提示。

### 是否可以使用自定义字段名

可以。系统支持常见中文别名和英文别名。完整字段清单见 [docs/字段映射说明.md](docs/字段映射说明.md)。

### 导出文件是否基于当前数据

是。PPT、Word、PDF 和 Excel 导出文件会复用当前数据看板、字段映射结果、数据质量提示和分析报告。

### 浏览器本地存储保存哪些数据

当前版本会在浏览器 localStorage 中保存最近一次导入的数据、字段映射结果、缺失字段、数据质量提示和生成的分析报告。使用“清空当前数据”可清除这些本地缓存。

## 数据安全说明

本项目为本地运行的前端工具。请勿将真实员工花名册、包含敏感个人信息的 Excel 文件或导出的分析报告提交到公开仓库。公开仓库应仅包含源码、示例说明和不含敏感信息的文档。

## License

当前仓库尚未选择开源许可证。复用、分发或商用前，应先补充明确的许可证文件。

---

# Talent Management Dashboard

Talent Management Dashboard is a local front-end application built with React, TypeScript, and Vite. It imports Excel roster files, maps roster fields to a standard schema, displays dashboard metrics, generates data quality notes and analysis reports, and exports report files in multiple formats.

The project is designed for HR talent reviews, succession risk review, workforce structure analysis, and monthly reporting preparation. Data processing runs locally in the browser. The project does not include a backend service or remote database.

## Live Demo

GitHub Pages URL:

```text
https://henrylee789.github.io/talent-dashboard/
```

If GitHub Pages has not been enabled for the repository, run the project locally with the Windows launcher.

## Features

- Import Excel roster files in `.xlsx` and `.xls` formats.
- Map Chinese headers, common Chinese aliases, and English aliases to standard fields.
- Display metrics such as key talent count, gender structure, average age, education structure, under-35 ratio, and average tenure.
- Display dashboard modules for age, education, tenure, performance, talent matrix, and succession risk.
- Show clear data quality notes when fields are missing, without fabricating data.
- Generate the current monthly analysis report.
- Export analysis reports as PPT, Word, PDF, and Excel files.
- Download a standard Excel roster template.
- Print the current dashboard, analysis report, or data-entry summary.
- Provide Windows launchers and an environment setup script.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- ECharts
- lucide-react
- xlsx
- pptxgenjs
- docx
- jspdf
- html2canvas
- file-saver
- pnpm

## Quick Start

### Windows Launcher

After downloading and extracting the repository ZIP package, double-click the launcher in the project root:

```text
START_HERE.bat
```

The script checks Node.js and pnpm. If Node.js is missing, it downloads a portable Node.js runtime into the local `.runtime` directory. If pnpm is missing, it prepares pnpm through corepack. It then installs dependencies and starts the application.

The Chinese launcher is also available:

```text
一键部署环境并启动.bat
```

For environments where Node.js and pnpm are already configured, the original launcher can also be used:

```text
启动人才看板.bat
```

After startup, the browser opens:

```text
http://127.0.0.1:5173/
```

### Manual Setup

Developers can run the project manually:

```bash
pnpm install
pnpm dev --host 127.0.0.1
```

Production build:

```bash
pnpm build
```

## Excel Roster Template

Click “下载模板” in the application to download:

```text
关键人才花名册模板.xlsx
```

The template contains three sheets:

- `花名册`: official import data.
- `填写示例`: sample rows for reference; remove sample data before import.
- `填写说明`: field rules and supported aliases.

During import, the system reads the first sheet by default and treats the first row as headers. Do not add a title row, instruction row, or blank row before the headers.

## Field Mapping

The system maps Excel headers to standard fields. Examples:

- `员工姓名`, `人员姓名`, and `Name` map to `姓名`.
- `Gender` and `Sex` map to `性别`.
- `Hire Date` and `Join Date` map to `入职日期`.
- `Key Talent` and `Core Talent` map to `是否关键人才`.

See [docs/Field-Mapping.en-US.md](docs/Field-Mapping.en-US.md) for the full field list.

## Missing Field Handling

Missing fields in the Excel roster do not block import, and the system does not fabricate data.

Rules:

- Metrics that can be derived from other fields continue to work, such as age from `出生日期` and tenure from `入职日期`.
- Metrics that cannot be calculated show empty states.
- Charts that cannot be generated show no-data messages.
- The analysis report lists the analysis areas affected by missing fields.
- PPT, Word, PDF, and Excel exports reuse the current analysis report and data quality notes.

## Reports and Export

Click “生成报告” to generate the current monthly analysis report. The report includes:

- Executive overview
- Talent structure analysis
- Performance analysis
- Succession and attrition risk notes
- Management insights
- Action recommendations
- Missing field and data quality notes

Supported export formats:

- PPT report
- Word report
- PDF report
- Excel report

## Project Structure

```text
.
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml
├─ docs/
│  ├─ 使用说明.md
│  ├─ User-Guide.en-US.md
│  ├─ 验收记录.md
│  ├─ Acceptance-Report.en-US.md
│  ├─ 字段映射说明.md
│  └─ Field-Mapping.en-US.md
├─ scripts/
│  ├─ launcher.cjs
│  └─ setup-and-launch.ps1
├─ src/
│  ├─ components/
│  ├─ hooks/
│  ├─ mock/
│  ├─ styles/
│  ├─ types/
│  └─ utils/
├─ START_HERE.bat
├─ 一键部署环境并启动.bat
├─ 启动人才看板.bat
├─ package.json
├─ pnpm-lock.yaml
├─ README.md
└─ vite.config.ts
```

## FAQ

### The Windows launcher does not start

Use `START_HERE.bat` first. The script prepares the local runtime environment automatically. If a download fails during setup, check the network connection and run the script again.

### Some metrics or charts are empty after importing Excel

The Excel roster may be missing the required fields, or the mapped fields may contain no usable values. Open the “数据录入” tab to review field mapping results, missing fields, and data quality notes.

### Can custom field names be used

Yes. The system supports common Chinese and English aliases. See [docs/Field-Mapping.en-US.md](docs/Field-Mapping.en-US.md) for the full field list.

### Are exported files based on the current data

Yes. PPT, Word, PDF, and Excel exports reuse the current dashboard data, field mapping results, data quality notes, and analysis report.

### What is stored in browser localStorage

The current version stores the latest imported data, field mapping results, missing fields, data quality notes, and generated analysis report in browser localStorage. Use “清空当前数据” to clear the local cache.

## Data Privacy Notice

This project is designed to run locally in the browser. Do not commit real employee rosters, sensitive personal data, or generated reports to a public repository. A public repository should contain only source code, documentation, and non-sensitive examples.

## License

No open-source license has been selected for this repository. Add a license file before reuse, redistribution, or commercial use.
