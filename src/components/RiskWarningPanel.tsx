import { Check, TriangleAlert, X } from "lucide-react";
import type {
  SuccessorRiskItem,
  TalentDashboardData,
  TalentMatrixItem,
} from "../types/talent";

interface RiskWarningPanelProps {
  risks: TalentDashboardData["risks"];
}

const matrixToneClass: Record<TalentMatrixItem["tone"], string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  teal: "border-teal-200 bg-teal-50 text-teal-700",
  orange: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-100 text-slate-600",
  red: "border-red-200 bg-red-50 text-red-600",
};

const successorToneClass: Record<SuccessorRiskItem["tone"], string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-600",
  red: "border-red-200 bg-red-50 text-red-600",
};

function SuccessorIcon({ tone }: { tone: SuccessorRiskItem["tone"] }) {
  if (tone === "green") {
    return <Check className="h-6 w-6 stroke-[3]" />;
  }

  if (tone === "amber") {
    return <TriangleAlert className="h-6 w-6 stroke-[2.5]" />;
  }

  return <X className="h-6 w-6 stroke-[3]" />;
}

function RiskEmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[126px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm leading-6 text-slate-500">
      {message}
    </div>
  );
}

export function RiskWarningPanel({ risks }: RiskWarningPanelProps) {
  return (
    <section className="dashboard-card rounded-[10px] p-5">
      <h2 className="mb-5 text-[17px] font-bold text-dashboard-ink">
        风险预警：人才九宫格与继任情况
      </h2>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.96fr]">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-dashboard-muted">
            人才九宫格分布
          </h3>
          {risks.talentMatrix.emptyMessage ? (
            <RiskEmptyState message={risks.talentMatrix.emptyMessage} />
          ) : (
            <div className="flex max-w-[560px] flex-wrap gap-3">
              {risks.talentMatrix.items.map((item) => (
                <div
                  key={item.id}
                  className={`inline-flex h-[52px] min-w-[126px] items-center justify-center gap-2 rounded-md border px-4 text-sm font-bold ${
                    matrixToneClass[item.tone]
                  }`}
                >
                  <span className="text-lg leading-none">{item.count}</span>
                  <span>人</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-dashboard-muted">
            继任风险预警 (Successor Risk)
          </h3>
          {risks.successorRisk.emptyMessage ? (
            <RiskEmptyState message={risks.successorRisk.emptyMessage} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {risks.successorRisk.items.map((item) => (
                <article
                  key={item.id}
                  className={`flex min-h-[126px] flex-col items-center justify-center rounded-md border text-center ${
                    successorToneClass[item.tone]
                  }`}
                >
                  <SuccessorIcon tone={item.tone} />
                  <div className="mt-3 text-xs font-semibold text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold leading-none">
                    {item.count}人
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
