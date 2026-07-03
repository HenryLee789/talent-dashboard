import * as XLSX from "xlsx";
import type { ChartDatum, ExportPayload } from "../types/talent";
import { exportFileBaseName } from "./exportPayload";
import { getMissingFieldImpacts } from "./fieldMapping";

function jsonSheet(rows: Record<string, unknown>[]) {
  return XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ 说明: "暂无数据" }]);
}

function chartRows(name: string, data: ChartDatum[], emptyMessage?: string) {
  if (emptyMessage || data.length === 0) {
    return [{ 图表名称: name, 分类: "暂无数据", 数值: "", 说明: emptyMessage ?? "暂无数据" }];
  }

  return data.map((item) => ({
    图表名称: name,
    分类: item.name,
    数值: item.value,
    说明: "",
  }));
}

export function exportExcelReport(payload: ExportPayload) {
  const workbook = XLSX.utils.book_new();
  const rawSheetName = payload.isMockMode ? "示例数据" : "原始导入数据";

  XLSX.utils.book_append_sheet(workbook, jsonSheet(payload.rawRows), rawSheetName);
  XLSX.utils.book_append_sheet(workbook, jsonSheet(payload.mappedRows), "标准化数据");
  XLSX.utils.book_append_sheet(
    workbook,
    jsonSheet(
      payload.fieldMappings.map((mapping) => ({
        原始字段: mapping.sourceField,
        标准字段: mapping.standardField || "未识别",
        是否识别: mapping.status === "mapped" ? "是" : "否",
        说明: mapping.status === "mapped" ? "" : "未识别字段，未参与标准字段计算",
      })),
    ),
    "字段映射结果",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    jsonSheet(
      payload.metrics.map((metric) => ({
        指标名称: metric.label,
        指标值: metric.isEmpty ? "暂无数据" : metric.value,
        单位: metric.suffix ?? "",
        状态: metric.isEmpty ? "空状态" : "正常",
        说明: metric.emptyLabel ?? metric.secondary ?? metric.trendLabel ?? "",
      })),
    ),
    "核心指标汇总",
  );

  const chartDataRows = [
    ...chartRows(
      "年龄分布",
      payload.charts.ageDistribution.data,
      payload.charts.ageDistribution.emptyMessage,
    ),
    ...chartRows(
      "学历分布",
      payload.charts.educationDistribution.data,
      payload.charts.educationDistribution.emptyMessage,
    ),
    ...chartRows(
      "任职年限分布",
      payload.charts.tenureDistribution.data,
      payload.charts.tenureDistribution.emptyMessage,
    ),
    ...chartRows(
      "绩效表现分布",
      payload.charts.performanceDistribution.data,
      payload.charts.performanceDistribution.emptyMessage,
    ),
    ...(payload.risks.talentMatrix.emptyMessage
      ? [
          {
            图表名称: "人才九宫格分布",
            分类: "暂无数据",
            数值: "",
            说明: payload.risks.talentMatrix.emptyMessage,
          },
        ]
      : payload.risks.talentMatrix.items.map((item) => ({
          图表名称: "人才九宫格分布",
          分类: item.label,
          数值: item.count,
          说明: "",
        }))),
    ...(payload.risks.successorRisk.emptyMessage
      ? [
          {
            图表名称: "继任风险分布",
            分类: "暂无数据",
            数值: "",
            说明: payload.risks.successorRisk.emptyMessage,
          },
        ]
      : payload.risks.successorRisk.items.map((item) => ({
          图表名称: "继任风险分布",
          分类: item.label,
          数值: item.count,
          说明: "",
        }))),
  ];
  XLSX.utils.book_append_sheet(workbook, jsonSheet(chartDataRows), "图表数据源");

  const missingRows = payload.missingFields.map((field) => ({
    类型: "缺失字段",
    字段或问题: field,
    影响模块: getMissingFieldImpacts([field]).join("、") || "待补充分析",
    建议: "补充该字段后重新导入并生成报告",
  }));
  const warningRows = payload.warnings.map((warning) => ({
    类型: "数据质量",
    字段或问题: warning.message,
    影响模块: "数据准确性",
    建议: "核对源花名册并统一字段字典",
  }));
  XLSX.utils.book_append_sheet(
    workbook,
    jsonSheet([...missingRows, ...warningRows]),
    "缺失字段和数据质量",
  );

  const adviceRows = [
    ...payload.report.risks.map((item) => ({
      类型: "风险",
      内容: `${item.title}：${item.description}`,
      优先级: item.level === "critical" ? "高" : item.level === "warning" ? "中" : "低",
    })),
    ...payload.report.insights.map((item) => ({
      类型: "洞察",
      内容: `${item.title}：${item.description}`,
      优先级: "中",
    })),
    ...payload.report.suggestions.map((item) => ({
      类型: "建议",
      内容: `${item.title}：${item.description}`,
      优先级: item.level === "critical" ? "高" : item.level === "warning" ? "中" : "低",
    })),
  ];
  XLSX.utils.book_append_sheet(workbook, jsonSheet(adviceRows), "管理建议摘要");

  workbook.Props = {
    Title: payload.title,
    Subject: payload.month,
    Author: "关键人才管理数据看板",
  };

  XLSX.writeFile(workbook, `${exportFileBaseName(payload)}.xlsx`);
}
