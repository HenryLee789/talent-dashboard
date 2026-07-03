import type { TalentDashboardMock } from "../types/talent";

function getCurrentMonthLabel() {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月`;
}

export const talentDashboardMock: TalentDashboardMock = {
  currentMonthLabel: getCurrentMonthLabel(),
  metrics: [
    {
      id: "keyTalentTotal",
      label: "关键人才总数",
      value: "27",
      suffix: "人",
      trendLabel: "+2 较上月",
      trendDirection: "up",
    },
    {
      id: "genderRatio",
      label: "男/女性别比",
      value: "15",
      suffix: "/12",
      secondary: "男性占比 56%",
      trendDirection: "neutral",
    },
    {
      id: "averageAge",
      label: "平均年龄",
      value: "36.8",
      suffix: "岁",
      trendLabel: "-0.3 较上月",
      trendDirection: "down",
    },
    {
      id: "masterAbove",
      label: "硕士及以上",
      value: "33.3",
      suffix: "%",
      trendLabel: "+2.1% 较上月",
      trendDirection: "up",
    },
    {
      id: "under35",
      label: "35岁及以下",
      value: "40.7",
      suffix: "%",
      trendLabel: "+1.5% 较上月",
      trendDirection: "up",
    },
    {
      id: "averageTenure",
      label: "平均任职年限",
      value: "1.90",
      suffix: "年",
      trendLabel: "-0.1 较上月",
      trendDirection: "down",
    },
  ],
  charts: {
    ageDistribution: [
      { name: "31-35岁", value: 11 },
      { name: "36-40岁", value: 9 },
      { name: "41-45岁", value: 5 },
      { name: "46-50岁", value: 2 },
    ],
    educationDistribution: [
      { name: "专科", value: 3 },
      { name: "本科", value: 15 },
      { name: "硕士及以上", value: 9 },
    ],
    tenureDistribution: [
      { name: "≤1年", value: 3 },
      { name: "1-3年", value: 14 },
      { name: "3-5年", value: 7 },
      { name: ">5年", value: 3 },
    ],
    performanceDistribution: [
      { name: "A(优)", value: 11 },
      { name: "B(良)", value: 12 },
      { name: "C(改进)", value: 4 },
    ],
  },
  risks: {
    talentMatrix: [
      { id: "core", label: "核心人才", count: 11, tone: "blue" },
      { id: "backbone", label: "中坚人才", count: 8, tone: "teal" },
      { id: "qualified", label: "合格人才", count: 4, tone: "orange" },
      { id: "activation", label: "待激活", count: 2, tone: "slate" },
      { id: "optimize", label: "优化调整", count: 2, tone: "red" },
    ],
    successorRisk: [
      { id: "covered", label: "有继任", count: 18, tone: "green" },
      { id: "developing", label: "需培养", count: 7, tone: "amber" },
      { id: "uncovered", label: "无继任", count: 2, tone: "red" },
    ],
  },
};
