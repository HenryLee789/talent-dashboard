import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Table2,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import type {
  DataQualityIssue,
  FieldMappingResult,
  ImportStatus,
} from "../types/talent";
import { EmptyState } from "./EmptyState";
import { getMissingFieldImpacts } from "../utils/fieldMapping";

interface DataEntryPanelProps {
  rawRows: Record<string, unknown>[];
  headers: string[];
  fieldMappings: FieldMappingResult[];
  missingFields: string[];
  warnings: DataQualityIssue[];
  importStatus: ImportStatus;
  importedAt: string | null;
  onImportClick: () => void;
  onClearData: () => void;
}

export function DataEntryPanel({
  rawRows,
  headers,
  fieldMappings,
  missingFields,
  warnings,
  importStatus,
  importedAt,
  onImportClick,
  onClearData,
}: DataEntryPanelProps) {
  const hasRows = rawRows.length > 0;
  const previewRows = rawRows.slice(0, 50);
  const mappedFields = fieldMappings.filter(
    (mapping) => mapping.status === "mapped",
  );
  const unmappedFields = fieldMappings.filter(
    (mapping) => mapping.status === "unmapped",
  );
  const impactedModules = getMissingFieldImpacts(missingFields);

  return (
    <section className="space-y-5 pb-10">
      <div className="dashboard-card rounded-[10px] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              {importStatus.phase === "success" && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              )}
              {importStatus.phase === "error" && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {importStatus.phase === "idle" && (
                <Info className="h-5 w-5 text-dashboard-blue" />
              )}
              <h2 className="text-lg font-bold text-dashboard-ink">
                Excel 花名册导入
              </h2>
            </div>
            <p
              className={`mt-2 text-sm font-semibold ${
                importStatus.phase === "error"
                  ? "text-red-600"
                  : "text-dashboard-muted"
              }`}
            >
              {importStatus.message}
            </p>
            {(importStatus.fileName || importedAt) && (
              <p className="mt-1 text-xs text-dashboard-muted">
                {importStatus.fileName && `文件：${importStatus.fileName}`}
                {importStatus.fileName && importedAt && " · "}
                {importedAt &&
                  `导入时间：${new Date(importedAt).toLocaleString("zh-CN")}`}
              </p>
            )}
          </div>

          <div className="print-hidden flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onImportClick}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
            >
              {hasRows ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {hasRows ? "重新导入" : "导入 Excel"}
            </button>
            <button
              type="button"
              onClick={onClearData}
              disabled={!hasRows && importStatus.phase !== "error"}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 disabled:hover:bg-white"
            >
              <Trash2 className="h-4 w-4" />
              清空当前数据
            </button>
          </div>
        </div>
      </div>

      {!hasRows && (
        <EmptyState
          title="请先导入 Excel 花名册"
          description="支持 .xlsx 和 .xls 文件，系统会默认读取第一个 Sheet，并将首行作为字段名。"
        />
      )}

      {hasRows && (
        <div className="dashboard-card overflow-hidden rounded-[10px]">
          <div className="flex flex-col gap-2 border-b border-dashboard-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Table2 className="h-5 w-5 text-dashboard-blue" />
              <h2 className="text-base font-bold text-dashboard-ink">
                原始导入数据
              </h2>
            </div>
            <p className="text-xs font-semibold text-dashboard-muted">
              共 {rawRows.length} 条
              {rawRows.length > 50 ? "，仅预览前 50 条" : ""}
            </p>
          </div>
          <div className="max-h-[430px] overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap border-b border-dashboard-line px-4 py-3 text-xs font-bold text-slate-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIndex) => (
                  <tr
                    key={`row-${rowIndex}`}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    {headers.map((header) => (
                      <td
                        key={`${rowIndex}-${header}`}
                        className="max-w-[180px] truncate whitespace-nowrap px-4 py-3 text-xs text-slate-700"
                        title={String(row[header] ?? "")}
                      >
                        {String(row[header] ?? "") || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="dashboard-card rounded-[10px] p-5">
          <h2 className="text-base font-bold text-dashboard-ink">
            字段映射结果
          </h2>
          <p className="mt-2 text-xs text-dashboard-muted">
            已识别 {mappedFields.length} 个字段，未识别 {unmappedFields.length}{" "}
            个字段
          </p>
          <div className="mt-4 max-h-[260px] space-y-2 overflow-auto pr-1">
            {fieldMappings.length === 0 && (
              <p className="text-sm text-dashboard-muted">暂无字段映射结果。</p>
            )}
            {mappedFields.map((mapping) => (
              <div
                key={`${mapping.sourceField}-${mapping.standardField}`}
                className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
              >
                原始字段：{mapping.sourceField} → 标准字段：
                {mapping.standardField}
              </div>
            ))}
            {unmappedFields.map((mapping) => (
              <div
                key={mapping.sourceField}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
              >
                未识别字段：{mapping.sourceField}
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card rounded-[10px] p-5">
          <h2 className="text-base font-bold text-dashboard-ink">
            缺失字段提示
          </h2>
          {missingFields.length === 0 ? (
            <p className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              标准字段已全部识别。
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {missingFields.map((field) => (
                  <span
                    key={field}
                    className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                  >
                    {field}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-md border border-amber-100 bg-amber-50 px-3 py-3 text-xs leading-6 text-amber-800">
                <div className="font-bold">影响：</div>
                {impactedModules.length > 0
                  ? `${impactedModules.join("、")}暂无法生成或完整展示。`
                  : "暂无关键模块受影响。"}
              </div>
            </>
          )}
        </div>

        <div className="dashboard-card rounded-[10px] p-5">
          <h2 className="text-base font-bold text-dashboard-ink">
            数据质量提示
          </h2>
          <div className="mt-4 space-y-2">
            {warnings.length === 0 && (
              <p className="text-sm text-dashboard-muted">暂无数据质量提示。</p>
            )}
            {warnings.map((warning) => (
              <div
                key={`${warning.id}-${warning.message}`}
                className={`flex gap-2 rounded-md border px-3 py-2 text-xs leading-5 ${
                  warning.level === "error"
                    ? "border-red-100 bg-red-50 text-red-700"
                    : warning.level === "warning"
                      ? "border-amber-100 bg-amber-50 text-amber-800"
                      : "border-blue-100 bg-blue-50 text-blue-700"
                }`}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
