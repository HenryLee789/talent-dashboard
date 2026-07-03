import { AlertTriangle, BarChart3, CheckCircle2, FileText, Sparkles } from "lucide-react";
import type {
  MetricCardData,
  TalentDashboardData,
  TalentReport,
  TalentReportItem,
  TalentReportSection,
} from "../types/talent";
import { EmptyState } from "./EmptyState";

interface ReportPanelProps {
  dashboard: TalentDashboardData;
  currentReport: TalentReport | null;
  employeeCount: number;
  onGenerateReport: () => void;
}

function formatGeneratedAt(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

function toneClass(level?: TalentReportItem["level"]) {
  if (level === "critical") {
    return "border-red-100 bg-red-50 text-red-700";
  }

  if (level === "warning") {
    return "border-amber-100 bg-amber-50 text-amber-800";
  }

  return "border-blue-100 bg-blue-50 text-blue-700";
}

function SectionCard({ section }: { section: TalentReportSection }) {
  return (
    <article className="dashboard-card rounded-[10px] p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-dashboard-ink">{section.title}</h3>
        <span
          className={`rounded px-2 py-1 text-xs font-semibold ${
            section.status === "ready"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {section.status === "ready" ? "已分析" : "暂无法分析"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{section.body}</p>
      <ul className="mt-4 space-y-2">
        {section.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2 text-sm leading-6 text-slate-600">
            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-dashboard-blue" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ItemList({
  items,
  type,
}: {
  items: TalentReportItem[];
  type: "risk" | "insight" | "suggestion";
}) {
  const Icon = type === "risk" ? AlertTriangle : type === "insight" ? Sparkles : CheckCircle2;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-lg border px-4 py-3 ${toneClass(item.level)}`}
        >
          <div className="flex gap-2">
            <Icon className="mt-0.5 h-4 w-4 flex-none" />
            <div>
              <div className="text-sm font-bold">{item.title}</div>
              <p className="mt-1 text-sm leading-6">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricReview({ metrics }: { metrics: MetricCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
        >
          <div className="text-xs font-semibold text-dashboard-muted">
            {metric.label}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={`text-xl font-bold ${
                metric.isEmpty ? "text-slate-300" : "text-dashboard-ink"
              }`}
            >
              {metric.value}
            </span>
            {metric.suffix && (
              <span className="text-sm font-semibold text-slate-600">
                {metric.suffix}
              </span>
            )}
          </div>
          {metric.isEmpty && metric.emptyLabel && (
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {metric.emptyLabel}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function ReportPanel({
  dashboard,
  currentReport,
  employeeCount,
  onGenerateReport,
}: ReportPanelProps) {
  return (
    <section
      id={currentReport ? "report-export-root" : undefined}
      className="space-y-5 pb-10"
    >
      <div className="dashboard-card rounded-[10px] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-dashboard-muted">
              {dashboard.currentMonthLabel}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-dashboard-ink">
              关键人才管理分析报告
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                数据来源：{dashboard.isMock ? "示例数据" : "Excel 花名册"}
              </span>
              <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
                有效数据人数：{employeeCount} 人
              </span>
              {currentReport && (
                <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                  生成时间：{formatGeneratedAt(currentReport.generatedAt)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onGenerateReport}
            className="print-hidden inline-flex h-10 items-center gap-1.5 rounded-lg bg-dashboard-blue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" />
            生成当前月报告
          </button>
        </div>

        {dashboard.isMock && (
          <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            当前为示例报告，请导入 Excel 后生成真实报告。
          </div>
        )}
      </div>

      {!currentReport && (
        <EmptyState
          title="暂无已生成报告"
          description="点击“生成当前月报告”后，系统会基于当前看板数据生成结构化 HR 管理分析报告。"
        />
      )}

      {currentReport && (
        <div className="space-y-5">
          <div className="dashboard-card rounded-[10px] p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-dashboard-blue" />
              <h3 className="text-base font-bold text-dashboard-ink">
                核心结论摘要
              </h3>
            </div>
            <ol className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {currentReport.summary.map((summary, index) => (
                <li
                  key={summary}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800"
                >
                  <span className="mr-2 font-bold">{index + 1}.</span>
                  {summary}
                </li>
              ))}
            </ol>
          </div>

          <div className="dashboard-card rounded-[10px] p-5">
            <h3 className="mb-4 text-base font-bold text-dashboard-ink">
              核心指标回顾
            </h3>
            <MetricReview metrics={currentReport.metrics} />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {currentReport.sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="dashboard-card rounded-[10px] p-5">
              <h3 className="mb-4 text-base font-bold text-dashboard-ink">
                主要风险
              </h3>
              <ItemList items={currentReport.risks} type="risk" />
            </div>

            <div className="dashboard-card rounded-[10px] p-5">
              <h3 className="mb-4 text-base font-bold text-dashboard-ink">
                管理洞察
              </h3>
              <ItemList items={currentReport.insights} type="insight" />
            </div>

            <div className="dashboard-card rounded-[10px] p-5">
              <h3 className="mb-4 text-base font-bold text-dashboard-ink">
                行动建议
              </h3>
              <ItemList items={currentReport.suggestions} type="suggestion" />
            </div>
          </div>

          <div className="dashboard-card rounded-[10px] p-5">
            <h3 className="text-base font-bold text-dashboard-ink">
              数据质量和缺失字段说明
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <div className="text-sm font-bold text-slate-700">
                  缺失分析说明
                </div>
                {currentReport.missingAnalysis.length === 0 ? (
                  <p className="mt-2 text-sm text-dashboard-muted">
                    暂无影响报告分析的缺失字段。
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {currentReport.missingAnalysis.map((item) => (
                      <li
                        key={item}
                        className="rounded bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="text-sm font-bold text-slate-700">
                  数据质量提示
                </div>
                {currentReport.dataQualityNotes.length === 0 ? (
                  <p className="mt-2 text-sm text-dashboard-muted">
                    暂无数据质量提示。
                  </p>
                ) : (
                  <ul className="mt-2 max-h-[260px] space-y-2 overflow-auto pr-1">
                    {currentReport.dataQualityNotes.map((item) => (
                      <li
                        key={item}
                        className="rounded bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
