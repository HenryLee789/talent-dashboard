import {
  CalendarDays,
  Clock3,
  GraduationCap,
  LineChart,
  Users,
  VenusAndMars,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MetricCardData, TrendDirection } from "../types/talent";

interface MetricCardsProps {
  metrics: MetricCardData[];
}

const iconMap: Record<string, LucideIcon> = {
  keyTalentTotal: Users,
  genderRatio: VenusAndMars,
  averageAge: CalendarDays,
  masterAbove: GraduationCap,
  under35: LineChart,
  averageTenure: Clock3,
};

const iconColorMap: Record<string, string> = {
  keyTalentTotal: "text-blue-500",
  genderRatio: "text-teal-500",
  averageAge: "text-rose-500",
  masterAbove: "text-amber-500",
  under35: "text-sky-500",
  averageTenure: "text-slate-400",
};

function trendClass(direction?: TrendDirection) {
  if (direction === "down") {
    return "bg-red-50 text-red-600";
  }

  if (direction === "up") {
    return "bg-emerald-50 text-emerald-700";
  }

  return "bg-slate-100 text-slate-500";
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.id] ?? Users;

        return (
          <article
            key={metric.id}
            className="dashboard-card min-h-[126px] rounded-[10px] px-5 py-5"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-dashboard-muted">
              <Icon
                className={`h-4 w-4 ${iconColorMap[metric.id] ?? "text-blue-500"}`}
              />
              <span>{metric.label}</span>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span
                className={`text-[29px] font-bold leading-none tracking-normal ${
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

            {metric.isEmpty ? (
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">
                {metric.emptyLabel}
              </p>
            ) : (
              (metric.trendLabel || metric.secondary) && (
                <div className="mt-3">
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-bold ${trendClass(
                      metric.trendDirection,
                    )}`}
                  >
                    {metric.trendLabel ?? metric.secondary}
                  </span>
                </div>
              )
            )}
          </article>
        );
      })}
    </section>
  );
}
