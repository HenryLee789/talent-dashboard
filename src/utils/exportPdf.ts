import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { ExportPayload, TalentReportItem, TalentReportSection } from "../types/talent";
import { exportFileBaseName } from "./exportPayload";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function sectionHtml(section: TalentReportSection) {
  return `
    <section class="pdf-card">
      <h3>${escapeHtml(section.title)}</h3>
      <p>${escapeHtml(section.body)}</p>
      ${list(section.bullets)}
    </section>
  `;
}

function itemHtml(title: string, items: TalentReportItem[]) {
  return `
    <section class="pdf-card">
      <h3>${escapeHtml(title)}</h3>
      ${items
        .map(
          (item) =>
            `<div class="pdf-item"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(
              item.description,
            )}</p></div>`,
        )
        .join("")}
    </section>
  `;
}

function createTemporaryReportRoot(payload: ExportPayload) {
  const root = document.createElement("div");
  root.id = "temporary-report-export-root";
  root.innerHTML = `
    <style>
      #temporary-report-export-root {
        width: 920px;
        padding: 34px;
        background: #f8fafc;
        color: #162033;
        font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
        line-height: 1.6;
      }
      #temporary-report-export-root h1 { margin: 0; font-size: 28px; }
      #temporary-report-export-root h2 { margin: 24px 0 12px; font-size: 18px; color: #2563eb; }
      #temporary-report-export-root h3 { margin: 0 0 8px; font-size: 16px; }
      #temporary-report-export-root p { margin: 0 0 8px; font-size: 13px; }
      #temporary-report-export-root ul { margin: 8px 0 0 18px; padding: 0; font-size: 13px; }
      #temporary-report-export-root li { margin: 5px 0; }
      #temporary-report-export-root .pdf-card {
        margin-top: 14px;
        padding: 16px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #ffffff;
      }
      #temporary-report-export-root .pdf-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      #temporary-report-export-root .pdf-metric {
        padding: 12px;
        border-radius: 8px;
        background: #f1f5f9;
        font-size: 12px;
      }
      #temporary-report-export-root .pdf-metric strong {
        display: block;
        margin-top: 6px;
        font-size: 20px;
      }
      #temporary-report-export-root .pdf-item {
        margin-top: 10px;
        padding: 10px;
        border-radius: 8px;
        background: #f8fafc;
      }
    </style>
    <h1>${escapeHtml(payload.title)}</h1>
    <p>月份：${escapeHtml(payload.month)} · 生成时间：${escapeHtml(
      new Date(payload.generatedAt).toLocaleString("zh-CN"),
    )} · 数据来源：${escapeHtml(payload.dataSource)} · 有效数据人数：${payload.totalRows} 人</p>
    ${payload.isMockMode ? "<p><strong>当前为示例报告，请导入 Excel 花名册后生成真实报告。</strong></p>" : ""}
    <section class="pdf-card">
      <h2>核心结论摘要</h2>
      ${list(payload.report.summary)}
    </section>
    <section class="pdf-card">
      <h2>核心指标回顾</h2>
      <div class="pdf-grid">
        ${payload.metrics
          .map(
            (metric) => `
              <div class="pdf-metric">
                ${escapeHtml(metric.label)}
                <strong>${escapeHtml(metric.isEmpty ? "暂无数据" : `${metric.value}${metric.suffix ?? ""}`)}</strong>
                <span>${escapeHtml(metric.emptyLabel ?? metric.secondary ?? "")}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
    ${payload.report.sections.map(sectionHtml).join("")}
    ${itemHtml("主要风险", payload.report.risks)}
    ${itemHtml("管理洞察", payload.report.insights)}
    ${itemHtml("行动建议", payload.report.suggestions)}
    <section class="pdf-card">
      <h2>数据质量和缺失字段说明</h2>
      ${list([
        ...(payload.report.missingAnalysis.length > 0
          ? payload.report.missingAnalysis
          : ["暂无影响报告分析的缺失字段。"]),
        ...(payload.report.dataQualityNotes.length > 0
          ? payload.report.dataQualityNotes
          : ["暂无数据质量提示。"]),
      ])}
    </section>
  `;
  root.style.position = "fixed";
  root.style.left = "-10000px";
  root.style.top = "0";
  root.style.zIndex = "-1";
  document.body.appendChild(root);
  return root;
}

function cloneReportRootForExport(reportRoot: HTMLElement) {
  const clone = reportRoot.cloneNode(true) as HTMLElement;
  const width = Math.max(reportRoot.offsetWidth, 920);

  clone.id = "cloned-report-export-root";
  clone.querySelectorAll("button,input,.print-hidden").forEach((element) => {
    element.remove();
  });
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.width = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.background = "#f8fafc";
  clone.style.zIndex = "-1";
  clone.style.padding = "0";
  document.body.appendChild(clone);

  return clone;
}

async function addCanvasToPdf(canvas: HTMLCanvasElement, pdf: jsPDF) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const pageCanvasHeight = Math.floor((canvas.width * usableHeight) / usableWidth);
  let renderedHeight = 0;
  let pageIndex = 0;

  while (renderedHeight < canvas.height) {
    const sliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const context = pageCanvas.getContext("2d");

    if (!context) {
      throw new Error("PDF 导出失败，无法创建页面截图。");
    }

    context.drawImage(
      canvas,
      0,
      renderedHeight,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    if (pageIndex > 0) {
      pdf.addPage();
    }

    const imageData = pageCanvas.toDataURL("image/png", 0.95);
    const imageHeight = (sliceHeight * usableWidth) / canvas.width;
    pdf.addImage(imageData, "PNG", margin, margin, usableWidth, imageHeight);

    renderedHeight += sliceHeight;
    pageIndex += 1;
  }
}

export async function exportPdfReport(payload: ExportPayload, reportRoot?: HTMLElement | null) {
  let temporaryRoot: HTMLElement | null = null;

  try {
    const target = reportRoot
      ? cloneReportRootForExport(reportRoot)
      : createTemporaryReportRoot(payload);
    temporaryRoot = target;
    const canvas = await html2canvas(target, {
      backgroundColor: "#f8fafc",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const pdf = new jsPDF("p", "mm", "a4");
    await addCanvasToPdf(canvas, pdf);
    pdf.save(`${exportFileBaseName(payload)}.pdf`);
  } finally {
    temporaryRoot?.remove();
  }
}
