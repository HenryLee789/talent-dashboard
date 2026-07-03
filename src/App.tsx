import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { AppHeader } from "./components/AppHeader";
import { DashboardTabs } from "./components/DashboardTabs";
import { DashboardView } from "./components/DashboardView";
import { DataEntryPanel } from "./components/DataEntryPanel";
import { ReportPanel } from "./components/ReportPanel";
import { useTalentDashboard } from "./hooks/useTalentDashboard";
import type { ExportFormat, ExportStatus, TalentReport } from "./types/talent";
import { parseExcelRoster } from "./utils/excel";
import { exportExcelReport } from "./utils/exportExcel";
import { exportPdfReport } from "./utils/exportPdf";
import { buildExportPayload } from "./utils/exportPayload";
import { exportPptReport } from "./utils/exportPpt";
import { exportWordReport } from "./utils/exportWord";
import { exportRosterTemplate } from "./utils/template";

const initialExportStatus: ExportStatus = {
  format: null,
  loading: false,
  message: null,
  type: null,
};

function exportSuccessMessage(format: ExportFormat) {
  const labelMap: Record<ExportFormat, string> = {
    ppt: "PPT",
    word: "Word",
    pdf: "PDF",
    excel: "Excel 报表",
  };

  return `${labelMap[format]} 导出成功`;
}

function exportErrorMessage(format: ExportFormat) {
  const labelMap: Record<ExportFormat, string> = {
    ppt: "PPT 导出失败，请稍后重试。",
    word: "Word 导出失败，请稍后重试。",
    pdf: "PDF 导出失败，可能是页面截图失败。",
    excel: "Excel 报表导出失败，请检查数据格式。",
  };

  return labelMap[format];
}

export default function App() {
  const dashboard = useTalentDashboard();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [exportStatus, setExportStatus] =
    useState<ExportStatus>(initialExportStatus);

  const openImportDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const result = await parseExcelRoster(file);
      dashboard.importRoster(result, file.name);
    } catch (error) {
      dashboard.setImportError(
        error instanceof Error ? error.message : "导入失败，请检查文件内容",
        file.name,
      );
    }
  };

  const handleDownloadTemplate = () => {
    if (exportStatus.loading) {
      return;
    }

    setExportStatus({
      format: "template",
      loading: true,
      message: "正在生成 Excel 花名册模板...",
      type: "info",
    });

    try {
      exportRosterTemplate();
      setExportStatus({
        format: "template",
        loading: false,
        message: "Excel 花名册模板已下载",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setExportStatus({
        format: "template",
        loading: false,
        message: "模板下载失败，请稍后重试。",
        type: "error",
      });
    }
  };

  const handlePrint = () => {
    if (typeof window === "undefined" || typeof window.print !== "function") {
      setExportStatus({
        format: "print",
        loading: false,
        message: "当前浏览器不支持打印功能。",
        type: "error",
      });
      return;
    }

    setExportStatus({
      format: "print",
      loading: false,
      message: "正在打开打印窗口...",
      type: "info",
    });

    window.setTimeout(() => {
      try {
        window.print();
        setExportStatus({
          format: "print",
          loading: false,
          message: "打印窗口已打开",
          type: "success",
        });
      } catch (error) {
        console.error(error);
        setExportStatus({
          format: "print",
          loading: false,
          message: "打印失败，请检查浏览器打印权限。",
          type: "error",
        });
      }
    }, 120);
  };

  const makeExportPayload = (report: TalentReport) =>
    buildExportPayload({
      rawRows: dashboard.rawRows,
      mappedRows: dashboard.mappedRows,
      fieldMappings: dashboard.fieldMappings,
      missingFields: dashboard.missingFields,
      warnings: dashboard.warnings,
      dashboard: dashboard.dashboardData,
      currentReport: report,
    });

  const generateReportWithStatus = () => {
    if (exportStatus.loading) {
      return null;
    }

    setExportStatus({
      format: "report",
      loading: true,
      message: "正在生成当前月报告...",
      type: "info",
    });

    try {
      const report = dashboard.generateCurrentMonthReport();
      setExportStatus({
        format: "report",
        loading: false,
        message: "当前月报告已生成",
        type: "success",
      });
      return report;
    } catch {
      setExportStatus({
        format: "report",
        loading: false,
        message: "报告生成失败，请检查当前数据。",
        type: "error",
      });
      return null;
    }
  };

  const ensureReport = () => {
    return dashboard.currentReport ?? dashboard.generateCurrentMonthReport();
  };

  const handleExport = async (format: ExportFormat) => {
    if (exportStatus.loading) {
      return;
    }

    setExportStatus({
      format,
      loading: true,
      message: "未找到报告数据时会自动生成当前月报告...",
      type: "info",
    });

    try {
      const report = ensureReport();
      const payload = makeExportPayload(report);

      if (format === "ppt") {
        await exportPptReport(payload);
      } else if (format === "word") {
        await exportWordReport(payload);
      } else if (format === "pdf") {
        await exportPdfReport(
          payload,
          document.getElementById("report-export-root"),
        );
      } else {
        exportExcelReport(payload);
      }

      setExportStatus({
        format,
        loading: false,
        message: exportSuccessMessage(format),
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setExportStatus({
        format,
        loading: false,
        message: exportErrorMessage(format),
        type: "error",
      });
    }
  };

  const reportEmployeeCount = dashboard.dashboardData.isMock
    ? Number(
        dashboard.dashboardData.metrics.find(
          (metric) => metric.id === "keyTalentTotal",
        )?.value ?? 0,
      )
    : dashboard.mappedRows.length;

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-ink">
      <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-0">
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />
        <AppHeader
          monthLabel={dashboard.dashboardData.currentMonthLabel}
          onDownloadTemplate={handleDownloadTemplate}
          onImportClick={openImportDialog}
          onPrint={handlePrint}
          onGenerateReport={generateReportWithStatus}
          onExport={handleExport}
          exportStatus={exportStatus}
        />
        {exportStatus.message && (
          <div
            className={`print-hidden fixed right-6 top-24 z-[9000] max-w-sm rounded-lg border px-4 py-3 text-sm font-semibold shadow-xl ${
              exportStatus.type === "error"
                ? "border-red-100 bg-red-50 text-red-700"
                : exportStatus.type === "success"
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-blue-100 bg-blue-50 text-blue-700"
            }`}
          >
            {exportStatus.message}
          </div>
        )}
        <DashboardTabs
          activeTab={dashboard.currentTab}
          onChange={dashboard.setCurrentTab}
        />

        {dashboard.currentTab === "dashboard" && (
          <DashboardView dashboard={dashboard.dashboardData} />
        )}
        {dashboard.currentTab === "report" && (
          <ReportPanel
            dashboard={dashboard.dashboardData}
            currentReport={dashboard.currentReport}
            employeeCount={reportEmployeeCount}
            onGenerateReport={generateReportWithStatus}
          />
        )}
        {dashboard.currentTab === "entry" && (
          <DataEntryPanel
            rawRows={dashboard.rawRows}
            headers={dashboard.headers}
            fieldMappings={dashboard.fieldMappings}
            missingFields={dashboard.missingFields}
            warnings={dashboard.warnings}
            importStatus={dashboard.importStatus}
            importedAt={dashboard.importedAt}
            onImportClick={openImportDialog}
            onClearData={dashboard.clearImportedData}
          />
        )}
      </main>
    </div>
  );
}
