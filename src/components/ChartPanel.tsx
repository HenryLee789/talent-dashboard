import { useRef } from "react";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";

interface ChartItem {
  id: string;
  option?: EChartsOption;
  emptyMessage?: string;
  height?: number;
}

interface ChartPanelProps {
  panelId: string;
  title: string;
  accentColor: string;
  charts: ChartItem[];
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[205px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm leading-6 text-slate-500">
      {message}
    </div>
  );
}

export function ChartPanel({
  panelId,
  title,
  accentColor,
  charts,
}: ChartPanelProps) {
  const chartRefs = useRef<Record<string, unknown>>({});

  return (
    <section
      id={panelId}
      className="dashboard-card rounded-[10px] p-5"
      data-export-panel-id={panelId}
    >
      <header className="mb-4 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <h2 className="text-[16px] font-bold text-dashboard-ink">{title}</h2>
      </header>

      <div
        className={`grid gap-4 ${
          charts.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {charts.map((chart) => (
          <div
            key={chart.id}
            id={chart.id}
            className="chart-canvas min-w-0"
            data-export-chart-id={chart.id}
          >
            {chart.emptyMessage || !chart.option ? (
              <ChartEmptyState message={chart.emptyMessage ?? "暂无数据"} />
            ) : (
              <ReactECharts
                ref={(instance) => {
                  chartRefs.current[chart.id] = instance;
                }}
                option={chart.option}
                style={{ height: chart.height ?? 205, width: "100%" }}
                notMerge
                lazyUpdate
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
