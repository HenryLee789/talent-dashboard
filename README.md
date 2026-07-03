# 关键人才管理数据看板系统

关键人才管理数据看板系统是一个基于 React + TypeScript 的纯前端 HR 分析工具。它支持导入 Excel 花名册，自动识别常见字段别名，生成关键人才结构看板、风险预警、月度分析报告，并导出 PPT、Word、PDF 和 Excel 报表。

> 免责声明：本仓库仅用于系统展示和二次开发，请勿将真实员工花名册、身份证号、手机号、薪酬、绩效明细、组织敏感数据或任何真实公司数据提交到公开仓库。

## 别人怎么使用

### 方式一：在线使用

GitHub Pages 部署完成后，可以直接打开：

```text
https://henrylee789.github.io/talent-dashboard/
```

这是最适合分享给普通使用者的方式。用户在浏览器里打开页面后，可以下载 Excel 模板、导入本地 Excel、查看看板、生成报告并导出文件。

### 方式二：下载源码 ZIP 后一键部署运行

在 GitHub 仓库页面点击绿色 `Code` 按钮，然后选择 `Download ZIP`。下载后解压文件夹，双击：

```text
START_HERE.bat
```

或者双击中文入口：

```text
一键部署环境并启动.bat
```

首次启动会检查 Node.js 和 pnpm；如果没有 Node.js，会下载免安装版 Node.js 到项目本地 `.runtime` 目录；如果没有 pnpm，会通过 corepack 自动准备。随后脚本会安装项目依赖并启动系统。

如果你的电脑已经配置好 Node.js 和 pnpm，也可以直接双击：

```text
启动人才看板.bat
```

### 方式三：用 Git 克隆后运行

```bash
git clone https://github.com/HenryLee789/talent-dashboard.git
cd talent-dashboard
pnpm install
pnpm dev --host 127.0.0.1
```

## 功能亮点

- Excel 花名册导入，支持 `.xlsx` 和 `.xls`。
- 字段自动映射，支持中文字段、常见中文别名和英文别名。
- 缺字段不会阻断导入，相关指标会显示空状态提示。
- 基于真实导入数据驱动看板、图表、风险预警和报告。
- 支持关键人才总数、性别比、平均年龄、学历占比、35 岁及以下占比、平均任职年限等核心指标。
- 支持年龄、学历、任职年限、绩效分布、人才九宫格和继任风险分析。
- 支持生成当前月 HR 分析报告。
- 支持导出 PPT、Word、PDF、Excel 报表。
- 支持下载标准 Excel 花名册模板。
- 支持打印当前看板、报告或数据录入摘要。
- 提供 Windows 一键启动器，适合非技术使用者。

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

## 适用场景

- HR 关键人才盘点与月度汇报。
- 组织人才结构分析。
- 继任风险和人才梯队观察。
- 通过 Excel 快速搭建轻量级人才数据看板。
- 用于内部演示、原型验证或二次开发。

## 快速开始

如果你只是使用系统，推荐双击根目录中的：

```text
START_HERE.bat
```

启动成功后，浏览器会自动打开：

```text
http://127.0.0.1:5173/
```

如果浏览器没有自动打开，可以手动访问上面的地址。

## Windows 一键启动器使用方式

项目根目录提供 `启动人才看板.bat`。

使用方式：

1. 双击 `启动人才看板.bat`。
2. 启动器会检查 Node.js 和 pnpm。
3. 如果 `node_modules` 不存在，会自动执行依赖安装。
4. 启动器会启动本地开发服务。
5. 服务启动后会自动打开浏览器。

请不要关闭启动器弹出的命令行窗口。关闭该窗口后，本地服务会停止。

## 手动启动方式

技术人员也可以手动启动：

```bash
pnpm install
pnpm dev --host 127.0.0.1
```

启动后访问：

```text
http://127.0.0.1:5173/
```

## Excel 模板说明

打开系统后，点击右上角“下载模板”按钮，系统会下载：

```text
关键人才花名册模板.xlsx
```

模板包含三个 Sheet：

- `花名册`：正式导入数据应填写在这里。
- `填写示例`：仅用于参考，请不要保留为正式员工数据。
- `填写说明`：列出字段填写规则和字段别名。

导入时，系统默认读取第一个 Sheet，并把第一行识别为字段名。请不要在字段名前增加标题行、说明行或空行。

## 字段自动映射说明

系统会把 Excel 表头自动映射为标准字段。例如：

- `员工姓名`、`人员姓名`、`Name` 会映射为 `姓名`。
- `Gender`、`Sex` 会映射为 `性别`。
- `Hire Date`、`Join Date` 会映射为 `入职日期`。
- `Key Talent`、`Core Talent` 会映射为 `是否关键人才`。

完整字段说明见 [docs/字段映射说明.md](docs/字段映射说明.md)。

## 缺字段处理说明

Excel 缺少字段不会导致导入失败，系统不会编造假数据。

缺字段时的处理方式：

- 对应指标卡片会显示空状态。
- 对应图表会显示“暂无数据”提示。
- 继任风险、人才九宫格等模块会根据可用字段展示。
- 分析报告会说明哪些分析因字段缺失暂无法生成。
- PPT、Word、PDF、Excel 导出内容会复用当前报告和缺字段提示。

## 报告和导出功能说明

点击“生成报告”可以生成当前月分析报告。报告内容包括：

- 总体情况
- 结构分析
- 绩效分析
- 风险提示
- 管理洞察
- 行动建议
- 缺字段和数据质量提示

导出格式包括：

- PPT 报告
- Word 报告
- PDF 报告
- Excel 报表

如果导出前尚未生成报告，系统会先自动生成当前月报告，再导出文件。

## 项目目录结构

```text
.
├─ docs/
│  ├─ 使用说明.md
│  ├─ User-Guide.en-US.md
│  ├─ 验收记录.md
│  ├─ Acceptance-Report.en-US.md
│  ├─ 字段映射说明.md
│  └─ Field-Mapping.en-US.md
├─ scripts/
│  └─ launcher.cjs
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

## 构建命令

```bash
pnpm build
```

## 常见问题

### 启动器打不开怎么办？

请确认电脑已经安装 Node.js 和 pnpm。安装 Node.js 后，也可以执行 `corepack enable` 启用 pnpm。

### 导入 Excel 后为什么有些图表为空？

通常是因为 Excel 缺少对应字段，或字段内容为空。可以在“数据录入”页查看字段映射结果和缺字段提示。

### 可以使用自己的字段名吗？

可以。系统支持常见中文别名和英文别名。完整列表见 [docs/字段映射说明.md](docs/字段映射说明.md)。

### 导出的报告是不是基于当前数据？

是。PPT、Word、PDF 和 Excel 导出都会复用当前看板数据、字段映射结果、缺字段提示和当前月报告。

### localStorage 会保存什么？

当前为纯前端版本，最近一次导入的数据、字段映射结果、缺字段提示、数据质量提示和生成的月度报告会保存在浏览器 localStorage 中。点击“清空当前数据”后会清除这些本地缓存。

## 已知提示

执行 `pnpm build` 时，Vite 可能提示部分 chunk 体积较大。这是因为 PPT、Word、PDF、Excel 导出库体积较大，不影响系统启动、构建和运行。

## 公开仓库安全提示

请不要提交以下内容：

- `node_modules`
- `dist`
- 临时导出的 PPT、Word、PDF、Excel 文件
- 真实员工花名册
- 真实公司数据
- 浏览器缓存或 localStorage 导出文件
- `.env`、token、密钥、账号密码
- 系统临时文件

---

# Key Talent Management Dashboard

Key Talent Management Dashboard is a React + TypeScript front-end HR analytics tool. It imports Excel roster files, automatically maps common field aliases, generates a talent dashboard, risk warnings, monthly HR reports, and exports PPT, Word, PDF, and Excel deliverables.

> Disclaimer: This repository is for product demonstration and further development only. Do not commit real employee rosters, identity numbers, phone numbers, compensation data, detailed performance records, sensitive organization data, or any real company data to a public repository.

## How Others Can Use It

### Option 1: Use It Online

After GitHub Pages deployment completes, open:

```text
https://henrylee789.github.io/talent-dashboard/
```

This is the best option for non-technical users. They can open the app in a browser, download the Excel template, import a local Excel file, view the dashboard, generate reports, and export files.

### Option 2: Download the Source ZIP and Run with One Click

On the GitHub repository page, click the green `Code` button and choose `Download ZIP`. After extracting the folder, double-click:

```text
START_HERE.bat
```

Or double-click the Chinese launcher:

```text
一键部署环境并启动.bat
```

On first startup, the script checks Node.js and pnpm. If Node.js is missing, it downloads a portable Node.js runtime into the local `.runtime` folder. If pnpm is missing, it prepares pnpm through corepack. It then installs dependencies and starts the app.

If Node.js and pnpm are already configured on your computer, you can also double-click:

```text
启动人才看板.bat
```

### Option 3: Clone with Git

```bash
git clone https://github.com/HenryLee789/talent-dashboard.git
cd talent-dashboard
pnpm install
pnpm dev --host 127.0.0.1
```

## Features

- Excel roster import for `.xlsx` and `.xls` files.
- Automatic field mapping for Chinese headers, common Chinese aliases, and English aliases.
- Missing fields do not block import; affected metrics show empty states.
- Dashboard, charts, risk warnings, and reports are driven by imported data.
- Core metrics include key talent count, gender ratio, average age, education ratio, under-35 ratio, and average tenure.
- Charts cover age, education, tenure, performance distribution, talent matrix, and succession risk.
- Monthly HR analysis report generation.
- PPT, Word, PDF, and Excel export.
- Standard Excel roster template download.
- Print support for the current dashboard, report, or data-entry summary.
- Windows one-click launcher for non-technical users.

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

## Use Cases

- Key talent review and monthly HR reporting.
- Workforce and organization structure analysis.
- Succession risk and talent pipeline review.
- Lightweight dashboard setup from Excel data.
- Internal demos, prototypes, and further development.

## Quick Start

For regular users, double-click the launcher in the project root:

```text
启动人才看板.bat
```

After startup, the browser opens:

```text
http://127.0.0.1:5173/
```

If the browser does not open automatically, visit the URL manually.

## Windows Launcher

The project root includes `启动人才看板.bat`.

How it works:

1. Double-click `启动人才看板.bat`.
2. The launcher checks Node.js and pnpm.
3. If `node_modules` does not exist, dependencies are installed automatically.
4. The local development server starts.
5. The browser opens after the app is ready.

Keep the launcher command window open. Closing it stops the local service.

## Manual Startup

Developers can start the app manually:

```bash
pnpm install
pnpm dev --host 127.0.0.1
```

Then open:

```text
http://127.0.0.1:5173/
```

## Excel Template

Click “下载模板” in the app to download:

```text
关键人才花名册模板.xlsx
```

The template contains three sheets:

- `花名册`: fill official import data here.
- `填写示例`: example only; remove sample rows before using real data.
- `填写说明`: field rules and aliases.

During import, the app reads the first sheet by default and treats the first row as field headers. Do not add a title row, instruction row, or blank row before the headers.

## Field Mapping

The app maps Excel headers to standard fields automatically. Examples:

- `员工姓名`, `人员姓名`, and `Name` map to `姓名`.
- `Gender` and `Sex` map to `性别`.
- `Hire Date` and `Join Date` map to `入职日期`.
- `Key Talent` and `Core Talent` map to `是否关键人才`.

See [docs/Field-Mapping.en-US.md](docs/Field-Mapping.en-US.md) for the full list.

## Missing-Field Handling

Missing fields do not block import, and the app does not fabricate data.

When fields are missing:

- Affected metric cards show empty states.
- Affected charts show no-data messages.
- Talent matrix and succession risk modules use the available fields.
- The analysis report explains which sections cannot be generated.
- PPT, Word, PDF, and Excel exports reuse the current report and missing-field notes.

## Report and Export Features

Click “生成报告” to generate the current monthly report. The report includes:

- Executive summary
- Structure analysis
- Performance analysis
- Risk warnings
- Management insights
- Action suggestions
- Missing-field and data-quality notes

Export formats:

- PPT report
- Word report
- PDF report
- Excel report

If no report exists before export, the app generates the current monthly report first.

## Project Structure

```text
.
├─ docs/
│  ├─ 使用说明.md
│  ├─ User-Guide.en-US.md
│  ├─ 验收记录.md
│  ├─ Acceptance-Report.en-US.md
│  ├─ 字段映射说明.md
│  └─ Field-Mapping.en-US.md
├─ scripts/
│  └─ launcher.cjs
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

## Build Command

```bash
pnpm build
```

## FAQ

### What if the launcher does not start?

Make sure Node.js and pnpm are installed. After installing Node.js, you can also run `corepack enable` to enable pnpm.

### Why are some charts empty after import?

The imported Excel file may be missing the required fields, or the mapped fields may contain no usable values. Check the “数据录入” tab for mapping results and missing-field messages.

### Can I use my own field names?

Yes. The app supports common Chinese and English aliases. See [docs/Field-Mapping.en-US.md](docs/Field-Mapping.en-US.md).

### Are exported reports based on the current data?

Yes. PPT, Word, PDF, and Excel exports reuse the current dashboard data, field mappings, missing-field notes, and monthly report.

### What is stored in localStorage?

The front-end version stores the latest imported data, field mappings, missing-field notes, data-quality messages, and generated monthly reports in browser localStorage. Use “清空当前数据” to clear the local cache.

## Known Note

`pnpm build` may show a Vite bundle-size warning. This is expected because PPT, Word, PDF, and Excel export libraries are relatively large. The warning does not affect startup, build success, or runtime behavior.

## Public Repository Safety

Do not commit:

- `node_modules`
- `dist`
- Temporary exported PPT, Word, PDF, or Excel files
- Real employee rosters
- Real company data
- Browser cache or localStorage export files
- `.env`, tokens, secrets, account names, or passwords
- System temporary files
