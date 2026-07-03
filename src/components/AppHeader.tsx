import {
  Download,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import type { ExportFormat, ExportStatus } from "../types/talent";
import { ExportMenu } from "./ExportMenu";

interface AppHeaderProps {
  monthLabel: string;
  onDownloadTemplate: () => void;
  onImportClick: () => void;
  onPrint: () => void;
  onGenerateReport: () => void;
  onExport: (format: ExportFormat) => void;
  exportStatus: ExportStatus;
}

export function AppHeader({
  monthLabel,
  onDownloadTemplate,
  onImportClick,
  onPrint,
  onGenerateReport,
  onExport,
  exportStatus,
}: AppHeaderProps) {
  return (
    <header className="print-hidden mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-[26px] font-bold leading-tight tracking-normal text-dashboard-ink">
          关键人才管理数据看板
        </h1>
        <p className="mt-2 text-sm font-medium text-dashboard-muted">
          中层管理人员版 · {monthLabel}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-4 text-sm font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50"
        >
          <Download className="h-4 w-4" />
          下载模板
        </button>
        <button
          type="button"
          onClick={onImportClick}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/40 px-4 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
        >
          <FileSpreadsheet className="h-4 w-4" />
          导入Excel
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-slate-600 transition hover:bg-white"
        >
          <Printer className="h-4 w-4" />
          打印
        </button>
        <ExportMenu
          status={exportStatus}
          onGenerateReport={onGenerateReport}
          onExport={onExport}
        />
      </div>
    </header>
  );
}
