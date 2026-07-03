[English](./README.md) | 简体中文

# 关键人才管理数据看板系统

关键人才管理数据看板系统是一个基于 React、TypeScript 和 Vite 构建的本地浏览器应用。系统支持导入 Excel 花名册、执行字段映射、展示数据看板、生成分析报告，并导出多种格式的报告文件。

本项目适用于人才盘点、人才结构分析、继任风险观察和 HR 月度汇报。数据处理在浏览器本地完成，仓库不包含后端服务或远程数据库。

## 在线预览

```text
https://henrylee789.github.io/talent-dashboard/
```

## 功能特性

- 导入 `.xlsx` 和 `.xls` 格式的 Excel 花名册。
- 将中文字段、常见中文别名和英文别名映射为标准字段。
- 展示人才结构、绩效、人才九宫格和继任风险等数据看板模块。
- 字段缺失时显示数据质量提示，不生成虚构数据。
- 生成月度分析报告。
- 将报告导出为 PPT、Word、PDF 和 Excel 文件。
- 下载标准 Excel 花名册模板。
- 打印数据看板、分析报告或数据录入摘要。
- 提供 Windows 一键启动器和环境部署脚本。

## 技术栈

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

## 快速开始

### Windows 一键启动器

下载仓库 ZIP 并解压后，双击：

```text
START_HERE.bat
```

该启动器会准备本地运行环境、安装依赖并启动应用。中文入口同样可用：

```text
一键部署环境并启动.bat
```

启动完成后，访问：

```text
http://127.0.0.1:5173/
```

完整步骤见 [使用说明](./docs/使用说明.md)。

### 手动启动

```bash
pnpm install
pnpm dev --host 127.0.0.1
```

生产构建命令：

```bash
pnpm build
```

## Excel 花名册模板

在应用中点击“下载模板”，可下载 `关键人才花名册模板.xlsx`。模板包含花名册、填写示例和填写说明。

## 字段自动映射

系统会根据内置别名字典将 Excel 表头映射为标准字段。例如，`Name` 映射为 `姓名`，`Gender` 映射为 `性别`，`Hire Date` 映射为 `入职日期`。

完整字段清单见 [字段映射说明](./docs/字段映射说明.md)。

## 报告与导出

分析报告包含总体指标、人才结构、绩效分析、风险提示、管理洞察和行动建议。报告可导出为 PPT、Word、PDF 和 Excel 文件。

## 项目结构

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

## 数据安全说明

本项目为本地运行的前端工具。请勿将真实员工花名册、包含敏感个人信息的 Excel 文件或导出的分析报告提交到公开仓库。

## 常见问题

### 导入后部分指标为空

Excel 花名册可能缺少必要字段，或字段内容没有可用值。可在“数据录入”Tab 查看字段映射结果和数据质量提示。

### 是否可以使用自定义字段名？

可以。系统支持常见中文别名和英文别名。详见 [字段映射说明](./docs/字段映射说明.md)。

### 是否有验收记录？

有。详见 [验收记录](./docs/验收记录.md)。

## License

当前仓库尚未选择开源许可证。复用、分发或商用前，应先补充明确的许可证文件。
