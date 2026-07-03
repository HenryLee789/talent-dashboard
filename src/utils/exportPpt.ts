import pptxgen from "pptxgenjs";
import type {
  ChartDataResult,
  ExportPayload,
  RiskSectionResult,
  SuccessorRiskItem,
  TalentMatrixItem,
  TalentReportItem,
  TalentReportSection,
} from "../types/talent";
import { exportFileBaseName } from "./exportPayload";

const BLUE = "2563EB";
const DARK = "162033";
const MUTED = "64748B";
const LINE = "E2E8F0";

function addTitle(slide: pptxgen.Slide, title: string, subtitle?: string) {
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 12.2,
    h: 0.35,
    fontFace: "Microsoft YaHei",
    fontSize: 20,
    bold: true,
    color: DARK,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.55,
      y: 0.78,
      w: 12.2,
      h: 0.25,
      fontFace: "Microsoft YaHei",
      fontSize: 9,
      color: MUTED,
    });
  }
  slide.addShape("line", {
    x: 0.55,
    y: 1.12,
    w: 12.2,
    h: 0,
    line: { color: LINE, width: 1 },
  });
}

function addBulletList(
  slide: pptxgen.Slide,
  items: string[],
  x: number,
  y: number,
  w: number,
  h: number,
  fontSize = 11,
) {
  slide.addText(
    items.map((item) => `• ${item}`).join("\n"),
    {
      x,
      y,
      w,
      h,
      fontFace: "Microsoft YaHei",
      fontSize,
      breakLine: false,
      fit: "shrink",
      color: DARK,
      valign: "top",
      paraSpaceAfter: 6,
    },
  );
}

function addMetricGrid(slide: pptxgen.Slide, payload: ExportPayload) {
  payload.metrics.forEach((metric, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 0.7 + col * 4.15;
    const y = 1.45 + row * 1.55;

    slide.addShape("roundRect", {
      x,
      y,
      w: 3.75,
      h: 1.15,
      rectRadius: 0.08,
      fill: { color: "F8FAFC" },
      line: { color: LINE, width: 1 },
    });
    slide.addText(metric.label, {
      x: x + 0.18,
      y: y + 0.16,
      w: 3.4,
      h: 0.22,
      fontFace: "Microsoft YaHei",
      fontSize: 9,
      color: MUTED,
      bold: true,
    });
    slide.addText(metric.isEmpty ? "暂无数据" : `${metric.value}${metric.suffix ?? ""}`, {
      x: x + 0.18,
      y: y + 0.5,
      w: 3.4,
      h: 0.34,
      fontFace: "Microsoft YaHei",
      fontSize: 18,
      color: metric.isEmpty ? "94A3B8" : DARK,
      bold: true,
    });
    if (metric.isEmpty && metric.emptyLabel) {
      slide.addText(metric.emptyLabel, {
        x: x + 0.18,
        y: y + 0.84,
        w: 3.4,
        h: 0.22,
        fontFace: "Microsoft YaHei",
        fontSize: 7,
        color: MUTED,
        fit: "shrink",
      });
    }
  });
}

function addDataTable(
  slide: pptxgen.Slide,
  title: string,
  chart: ChartDataResult,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  slide.addText(title, {
    x,
    y,
    w,
    h: 0.25,
    fontFace: "Microsoft YaHei",
    fontSize: 11,
    bold: true,
    color: BLUE,
  });

  if (chart.emptyMessage) {
    slide.addText(chart.emptyMessage, {
      x,
      y: y + 0.42,
      w,
      h: 0.6,
      fontFace: "Microsoft YaHei",
      fontSize: 10,
      color: MUTED,
      fit: "shrink",
    });
    return;
  }

  const rows = [["分类", "人数"], ...chart.data.map((item) => [item.name, String(item.value)])];
  slide.addTable(rows as unknown as pptxgen.TableRow[], {
    x,
    y: y + 0.38,
    w,
    h,
    border: { type: "solid", color: LINE, pt: 0.5 },
    fill: { color: "FFFFFF" },
    fontFace: "Microsoft YaHei",
    fontSize: 8,
    color: DARK,
    margin: 0.05,
  });
}

function addRiskTable<T extends TalentMatrixItem | SuccessorRiskItem>(
  slide: pptxgen.Slide,
  title: string,
  risk: RiskSectionResult<T>,
  x: number,
  y: number,
  w: number,
) {
  slide.addText(title, {
    x,
    y,
    w,
    h: 0.25,
    fontFace: "Microsoft YaHei",
    fontSize: 11,
    bold: true,
    color: BLUE,
  });

  if (risk.emptyMessage) {
    slide.addText(risk.emptyMessage, {
      x,
      y: y + 0.42,
      w,
      h: 0.6,
      fontFace: "Microsoft YaHei",
      fontSize: 10,
      color: MUTED,
    });
    return;
  }

  slide.addTable(
    ([["分类", "人数"], ...risk.items.map((item) => [item.label, String(item.count)])] as unknown) as pptxgen.TableRow[],
    {
      x,
      y: y + 0.38,
      w,
      h: 1.9,
      border: { type: "solid", color: LINE, pt: 0.5 },
      fontFace: "Microsoft YaHei",
      fontSize: 8,
      color: DARK,
      margin: 0.05,
    },
  );
}

function sectionText(sections: TalentReportSection[], ids: string[]) {
  return sections
    .filter((section) => ids.includes(section.id))
    .flatMap((section) => [section.body, ...section.bullets])
    .slice(0, 5);
}

function itemTexts(items: TalentReportItem[]) {
  return items.map((item) => `${item.title}：${item.description}`);
}

export async function exportPptReport(payload: ExportPayload) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "关键人才管理数据看板";
  pptx.subject = payload.month;
  pptx.title = payload.title;
  pptx.company = "关键人才管理数据看板";
  pptx.theme = {
    headFontFace: "Microsoft YaHei",
    bodyFontFace: "Microsoft YaHei",
  };

  const cover = pptx.addSlide();
  cover.background = { color: "F8FAFC" };
  cover.addText(payload.title, {
    x: 0.85,
    y: 1.25,
    w: 11.4,
    h: 0.6,
    fontFace: "Microsoft YaHei",
    fontSize: 30,
    bold: true,
    color: DARK,
  });
  cover.addText(`中层管理人员版 · ${payload.month}`, {
    x: 0.9,
    y: 2.05,
    w: 11,
    h: 0.35,
    fontFace: "Microsoft YaHei",
    fontSize: 16,
    color: BLUE,
  });
  cover.addText(
    `生成时间：${new Date(payload.generatedAt).toLocaleString("zh-CN")}\n数据来源：${payload.dataSource}\n有效数据人数：${payload.totalRows} 人${payload.isMockMode ? "\n当前为示例报告，请导入 Excel 花名册后生成真实报告。" : ""}`,
    {
      x: 0.9,
      y: 2.75,
      w: 9.6,
      h: 1.2,
      fontFace: "Microsoft YaHei",
      fontSize: 12,
      color: MUTED,
      breakLine: false,
    },
  );

  const metrics = pptx.addSlide();
  addTitle(metrics, "核心指标总览", `${payload.month} · ${payload.dataSource}`);
  addMetricGrid(metrics, payload);
  addBulletList(metrics, payload.report.summary, 0.7, 4.85, 12, 1.6, 11);

  const structure = pptx.addSlide();
  addTitle(structure, "年龄与学历结构分析", payload.month);
  addDataTable(structure, "年龄分布", payload.charts.ageDistribution, 0.7, 1.35, 5.1, 2.1);
  addDataTable(structure, "学历分布", payload.charts.educationDistribution, 6.4, 1.35, 5.1, 2.1);
  addBulletList(
    structure,
    sectionText(payload.report.sections, ["age-structure", "education-structure"]),
    0.7,
    4.1,
    12,
    2.2,
    10,
  );

  const performance = pptx.addSlide();
  addTitle(performance, "任职年限与绩效表现分析", payload.month);
  addDataTable(performance, "任职年限分布", payload.charts.tenureDistribution, 0.7, 1.35, 5.1, 2.1);
  addDataTable(performance, "绩效表现分布", payload.charts.performanceDistribution, 6.4, 1.35, 5.1, 2.1);
  addBulletList(
    performance,
    sectionText(payload.report.sections, ["tenure-analysis", "performance-analysis"]),
    0.7,
    4.1,
    12,
    2.2,
    10,
  );

  const risks = pptx.addSlide();
  addTitle(risks, "人才九宫格与继任风险", payload.month);
  addRiskTable(risks, "人才九宫格分布", payload.risks.talentMatrix, 0.7, 1.35, 5.1);
  addRiskTable(risks, "继任风险分布", payload.risks.successorRisk, 6.4, 1.35, 5.1);
  addBulletList(risks, itemTexts(payload.report.risks).slice(0, 4), 0.7, 4.25, 12, 1.8, 10);

  const actions = pptx.addSlide();
  addTitle(actions, "管理洞察与行动建议", payload.month);
  actions.addText("管理洞察", {
    x: 0.7,
    y: 1.35,
    w: 5.5,
    h: 0.3,
    fontFace: "Microsoft YaHei",
    fontSize: 13,
    bold: true,
    color: BLUE,
  });
  addBulletList(actions, itemTexts(payload.report.insights), 0.7, 1.8, 5.6, 3.5, 10);
  actions.addText("行动建议", {
    x: 6.75,
    y: 1.35,
    w: 5.5,
    h: 0.3,
    fontFace: "Microsoft YaHei",
    fontSize: 13,
    bold: true,
    color: BLUE,
  });
  addBulletList(actions, itemTexts(payload.report.suggestions), 6.75, 1.8, 5.6, 3.5, 10);
  addBulletList(
    actions,
    [...payload.report.missingAnalysis, ...payload.report.dataQualityNotes].slice(0, 4),
    0.7,
    5.65,
    11.6,
    1.0,
    8,
  );

  await pptx.writeFile({ fileName: `${exportFileBaseName(payload)}.pptx` });
}
