import type {
  DataQualityIssue,
  ExportPayload,
  FieldMappingResult,
  TalentDashboardData,
  TalentReport,
} from "../types/talent";

interface BuildExportPayloadInput {
  rawRows: Record<string, unknown>[];
  mappedRows: Record<string, unknown>[];
  fieldMappings: FieldMappingResult[];
  missingFields: string[];
  warnings: DataQualityIssue[];
  dashboard: TalentDashboardData;
  currentReport: TalentReport;
}

export function buildExportPayload({
  rawRows,
  mappedRows,
  fieldMappings,
  missingFields,
  warnings,
  dashboard,
  currentReport,
}: BuildExportPayloadInput): ExportPayload {
  return {
    title: currentReport.title,
    month: currentReport.month,
    monthKey: currentReport.monthKey,
    generatedAt: currentReport.generatedAt,
    dataSource: currentReport.dataSource,
    totalRows: currentReport.employeeCount,
    isMockMode: dashboard.isMock,
    metrics: dashboard.metrics,
    charts: dashboard.charts,
    risks: dashboard.risks,
    report: currentReport,
    rawRows,
    mappedRows,
    fieldMappings,
    missingFields,
    warnings,
  };
}

export function exportFileBaseName(payload: ExportPayload) {
  return `关键人才管理分析报告_${payload.monthKey}`;
}
