import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Loader2,
  Presentation,
} from "lucide-react";
import type { ExportFormat, ExportStatus } from "../types/talent";

interface ExportMenuProps {
  status: ExportStatus;
  onGenerateReport: () => void;
  onExport: (format: ExportFormat) => void;
}

const exportItems: Array<{
  label: string;
  format: ExportFormat;
  icon: typeof Presentation;
}> = [
  { label: "导出 PPT", format: "ppt", icon: Presentation },
  { label: "导出 Word", format: "word", icon: FileText },
  { label: "导出 PDF", format: "pdf", icon: FileArchive },
  { label: "导出 Excel 报表", format: "excel", icon: FileSpreadsheet },
];

export function ExportMenu({ status, onGenerateReport, onExport }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const isBusy = status.loading;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={isBusy}
        className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-dashboard-blue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-400"
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        生成报告
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed right-[max(20px,calc((100vw-1200px)/2))] top-[74px] z-[12000] w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              onGenerateReport();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-dashboard-blue disabled:cursor-wait disabled:text-slate-300"
          >
            {status.loading && status.format === "report" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            生成当前月报告
          </button>

          <div className="my-1 border-t border-slate-100" />

          {exportItems.map((item) => {
            const Icon = item.icon;
            const active = status.loading && status.format === item.format;

            return (
              <button
                key={item.format}
                type="button"
                disabled={isBusy}
                onClick={() => onExport(item.format)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-dashboard-blue disabled:cursor-wait disabled:text-slate-300"
              >
                {active ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {item.label}
              </button>
            );
          })}

          {status.message && (
            <div
              className={`mt-2 rounded-md px-3 py-2 text-xs leading-5 ${
                status.type === "error"
                  ? "bg-red-50 text-red-700"
                  : status.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              {status.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
