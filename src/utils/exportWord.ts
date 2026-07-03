import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import type { ChartDataResult, ExportPayload, TalentReportItem } from "../types/talent";
import { exportFileBaseName } from "./exportPayload";

function paragraph(text: string, bold = false) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [
      new TextRun({
        text,
        bold,
        font: "Microsoft YaHei",
        size: 22,
      }),
    ],
  });
}

function heading(text: string, level = HeadingLevel.HEADING_2) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 260, after: 120 },
  });
}

function bullet(text: string) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function cell(text: string, bold = false) {
  return new TableCell({
    margins: { top: 90, bottom: 90, left: 110, right: 110 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            font: "Microsoft YaHei",
            size: 20,
          }),
        ],
      }),
    ],
  });
}

function table(headers: string[], rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((header) => cell(header, true)),
      }),
      ...(rows.length > 0
        ? rows.map(
            (row) =>
              new TableRow({
                children: row.map((item) => cell(item)),
              }),
          )
        : [
            new TableRow({
              children: [cell("暂无数据")],
            }),
          ]),
    ],
  });
}

function chartTable(chart: ChartDataResult) {
  if (chart.emptyMessage) {
    return table(["说明"], [[chart.emptyMessage]]);
  }

  return table(
    ["分类", "数值"],
    chart.data.map((item) => [item.name, String(item.value)]),
  );
}

function itemParagraphs(items: TalentReportItem[]) {
  return items.flatMap((item) => [
    paragraph(`${item.title}：${item.description}`),
  ]);
}

export async function exportWordReport(payload: ExportPayload) {
  const children = [
    new Paragraph({
      text: payload.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
    paragraph(`月份：${payload.month}`),
    paragraph(`生成时间：${new Date(payload.generatedAt).toLocaleString("zh-CN")}`),
    paragraph(`数据来源：${payload.dataSource}`),
    paragraph(`有效数据人数：${payload.totalRows} 人`),
    ...(payload.isMockMode
      ? [paragraph("当前为示例报告，请导入 Excel 花名册后生成真实报告。", true)]
      : []),

    heading("核心结论摘要"),
    ...payload.report.summary.map((item) => bullet(item)),

    heading("核心指标回顾"),
    table(
      ["指标", "数值", "说明"],
      payload.metrics.map((metric) => [
        metric.label,
        metric.isEmpty ? "暂无数据" : `${metric.value}${metric.suffix ?? ""}`,
        metric.emptyLabel ?? metric.secondary ?? metric.trendLabel ?? "",
      ]),
    ),

    heading("年龄结构分析"),
    ...payload.report.sections
      .filter((section) => section.id === "age-structure")
      .flatMap((section) => [paragraph(section.body), ...section.bullets.map(bullet)]),
    chartTable(payload.charts.ageDistribution),

    heading("学历结构分析"),
    ...payload.report.sections
      .filter((section) => section.id === "education-structure")
      .flatMap((section) => [paragraph(section.body), ...section.bullets.map(bullet)]),
    chartTable(payload.charts.educationDistribution),

    heading("任职年限分析"),
    ...payload.report.sections
      .filter((section) => section.id === "tenure-analysis")
      .flatMap((section) => [paragraph(section.body), ...section.bullets.map(bullet)]),
    chartTable(payload.charts.tenureDistribution),

    heading("绩效表现分析"),
    ...payload.report.sections
      .filter((section) => section.id === "performance-analysis")
      .flatMap((section) => [paragraph(section.body), ...section.bullets.map(bullet)]),
    chartTable(payload.charts.performanceDistribution),

    heading("人才九宫格分析"),
    ...payload.report.sections
      .filter((section) => section.id === "talent-matrix")
      .flatMap((section) => [paragraph(section.body), ...section.bullets.map(bullet)]),
    table(
      ["分类", "人数"],
      payload.risks.talentMatrix.emptyMessage
        ? [["暂无数据", payload.risks.talentMatrix.emptyMessage]]
        : payload.risks.talentMatrix.items.map((item) => [item.label, String(item.count)]),
    ),

    heading("继任风险分析"),
    ...payload.report.sections
      .filter((section) => section.id === "successor-risk")
      .flatMap((section) => [paragraph(section.body), ...section.bullets.map(bullet)]),
    table(
      ["分类", "人数"],
      payload.risks.successorRisk.emptyMessage
        ? [["暂无数据", payload.risks.successorRisk.emptyMessage]]
        : payload.risks.successorRisk.items.map((item) => [item.label, String(item.count)]),
    ),

    heading("主要风险"),
    ...itemParagraphs(payload.report.risks),

    heading("管理洞察"),
    ...itemParagraphs(payload.report.insights),

    heading("行动建议"),
    ...itemParagraphs(payload.report.suggestions),

    heading("数据质量和缺失字段说明"),
    ...(payload.report.missingAnalysis.length > 0
      ? payload.report.missingAnalysis.map((item) => bullet(item))
      : [paragraph("暂无影响报告分析的缺失字段。")]),
    ...(payload.report.dataQualityNotes.length > 0
      ? payload.report.dataQualityNotes.map((item) => bullet(item))
      : [paragraph("暂无数据质量提示。")]),
  ];

  const document = new Document({
    creator: "关键人才管理数据看板",
    title: payload.title,
    description: payload.month,
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(document);
  saveAs(blob, `${exportFileBaseName(payload)}.docx`);
}
