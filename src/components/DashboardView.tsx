import type { EChartsOption } from "echarts";
import { Info } from "lucide-react";
import { ChartPanel } from "./ChartPanel";
import { MetricCards } from "./MetricCards";
import { RiskWarningPanel } from "./RiskWarningPanel";
import type { ChartDatum, TalentDashboardData } from "../types/talent";

interface DashboardViewProps {
  dashboard: TalentDashboardData;
}

function buildBarOption(data: ChartDatum[], color: string): EChartsOption {
  return {
    color: [color],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `${value}人`,
    },
    grid: { left: 28, right: 10, top: 18, bottom: 28 },
    xAxis: {
      type: "category",
      data: data.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#d9e2ef" } },
      axisLabel: { color: "#46566c", fontSize: 11, interval: 0 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitNumber: 3,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#46566c", fontSize: 11 },
      splitLine: { lineStyle: { color: "#e8eef6" } },
    },
    series: [
      {
        type: "bar",
        data: data.map((item) => item.value),
        barWidth: 32,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color,
          borderColor: color,
          borderWidth: 1,
          opacity: 0.86,
        },
        emphasis: { itemStyle: { opacity: 1 } },
      },
    ],
  };
}

function buildDonutOption(data: ChartDatum[]): EChartsOption {
  return {
    color: ["#9aa8ba", "#2563eb", "#7c3aed", "#f59e0b"],
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}人 ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: 4,
      top: "center",
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: "#46566c", fontSize: 12 },
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        center: ["41%", "50%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
        })),
      },
    ],
  };
}

export function DashboardView({ dashboard }: DashboardViewProps) {
  return (
    <div>
      {dashboard.isMock && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          <Info className="mt-0.5 h-4 w-4 flex-none" />
          当前为示例数据，请导入 Excel 花名册生成真实人才看板。
        </div>
      )}

      <MetricCards metrics={dashboard.metrics} />

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <ChartPanel
          panelId="structure-analysis-panel"
          title="结构分析：年龄与学历分布"
          accentColor="#2563eb"
          charts={[
            {
              id: "age-distribution-chart",
              option: dashboard.charts.ageDistribution.emptyMessage
                ? undefined
                : buildBarOption(dashboard.charts.ageDistribution.data, "#7db6f5"),
              emptyMessage: dashboard.charts.ageDistribution.emptyMessage,
            },
            {
              id: "education-distribution-chart",
              option: dashboard.charts.educationDistribution.emptyMessage
                ? undefined
                : buildDonutOption(dashboard.charts.educationDistribution.data),
              emptyMessage: dashboard.charts.educationDistribution.emptyMessage,
            },
          ]}
        />

        <ChartPanel
          panelId="development-performance-panel"
          title="发展与绩效：任职年限与绩效表现"
          accentColor="#0f9d8a"
          charts={[
            {
              id: "tenure-distribution-chart",
              option: dashboard.charts.tenureDistribution.emptyMessage
                ? undefined
                : buildBarOption(dashboard.charts.tenureDistribution.data, "#47d7c5"),
              emptyMessage: dashboard.charts.tenureDistribution.emptyMessage,
            },
            {
              id: "performance-distribution-chart",
              option: dashboard.charts.performanceDistribution.emptyMessage
                ? undefined
                : buildBarOption(
                    dashboard.charts.performanceDistribution.data,
                    "#ffb15e",
                  ),
              emptyMessage: dashboard.charts.performanceDistribution.emptyMessage,
            },
          ]}
        />
      </div>

      <RiskWarningPanel risks={dashboard.risks} />
    </div>
  );
}
