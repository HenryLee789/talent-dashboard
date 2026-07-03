import type {
  ChartDataResult,
  RiskSectionResult,
  SuccessorRiskItem,
  TalentMatrixItem,
} from "../types/talent";
import type { CleanRosterResult } from "./cleanRoster";

function emptyChart(emptyMessage: string): ChartDataResult {
  return { data: [], emptyMessage };
}

function hasPositiveTotal(data: Array<{ value?: number; count?: number }>) {
  return data.some((item) => (item.value ?? item.count ?? 0) > 0);
}

export function buildAgeDistribution(cleaned: CleanRosterResult): ChartDataResult {
  const { rows, fieldAvailability } = cleaned;

  if (!fieldAvailability.hasAgeField && !fieldAvailability.hasBirthDateField) {
    return emptyChart("缺少年龄或出生日期字段，暂无年龄分布数据。");
  }

  const buckets = [
    { name: "25岁以下", min: Number.NEGATIVE_INFINITY, max: 24 },
    { name: "25-30岁", min: 25, max: 30 },
    { name: "31-35岁", min: 31, max: 35 },
    { name: "36-40岁", min: 36, max: 40 },
    { name: "41-45岁", min: 41, max: 45 },
    { name: "46-50岁", min: 46, max: 50 },
    { name: "50岁以上", min: 51, max: Number.POSITIVE_INFINITY },
  ];

  const data = buckets.map((bucket) => ({
    name: bucket.name,
    value: rows.filter(
      (row) =>
        typeof row.age === "number" && row.age >= bucket.min && row.age <= bucket.max,
    ).length,
  }));

  return hasPositiveTotal(data)
    ? { data }
    : emptyChart("字段已识别，但暂无有效数据。");
}

export function buildEducationDistribution(
  cleaned: CleanRosterResult,
): ChartDataResult {
  if (!cleaned.fieldAvailability.hasEducationField) {
    return emptyChart("缺少学历字段，暂无学历分布数据。");
  }

  const categories = ["专科", "本科", "硕士及以上", "其他"];
  const data = categories.map((category) => ({
    name: category,
    value: cleaned.rows.filter((row) => row.education === category).length,
  }));

  return hasPositiveTotal(data)
    ? { data }
    : emptyChart("字段已识别，但暂无有效数据。");
}

export function buildTenureDistribution(cleaned: CleanRosterResult): ChartDataResult {
  const { rows, fieldAvailability } = cleaned;

  if (!fieldAvailability.hasTenureField && !fieldAvailability.hasHireDateField) {
    return emptyChart("缺少任职年限或入职日期字段，暂无任职年限数据。");
  }

  const data = [
    {
      name: "≤1年",
      value: rows.filter(
        (row) => typeof row.tenureYears === "number" && row.tenureYears <= 1,
      ).length,
    },
    {
      name: "1-3年",
      value: rows.filter(
        (row) =>
          typeof row.tenureYears === "number" &&
          row.tenureYears > 1 &&
          row.tenureYears <= 3,
      ).length,
    },
    {
      name: "3-5年",
      value: rows.filter(
        (row) =>
          typeof row.tenureYears === "number" &&
          row.tenureYears > 3 &&
          row.tenureYears <= 5,
      ).length,
    },
    {
      name: ">5年",
      value: rows.filter(
        (row) => typeof row.tenureYears === "number" && row.tenureYears > 5,
      ).length,
    },
  ];

  return hasPositiveTotal(data)
    ? { data }
    : emptyChart("字段已识别，但暂无有效数据。");
}

export function buildPerformanceDistribution(
  cleaned: CleanRosterResult,
): ChartDataResult {
  if (!cleaned.fieldAvailability.hasPerformanceField) {
    return emptyChart("缺少绩效等级字段，暂无绩效表现数据。");
  }

  const categories = ["A/优", "B/良", "C/改进", "其他"];
  const data = categories.map((category) => ({
    name: category,
    value: cleaned.rows.filter((row) => row.performance === category).length,
  }));

  return hasPositiveTotal(data)
    ? { data }
    : emptyChart("字段已识别，但暂无有效数据。");
}

export function buildTalentMatrixDistribution(
  cleaned: CleanRosterResult,
): RiskSectionResult<TalentMatrixItem> {
  if (!cleaned.fieldAvailability.hasTalentCategoryField) {
    return { items: [], emptyMessage: "缺少人才分类字段，暂无人才九宫格数据。" };
  }

  const categories: TalentMatrixItem[] = [
    { id: "core", label: "核心人才", count: 0, tone: "blue" },
    { id: "backbone", label: "中坚人才", count: 0, tone: "teal" },
    { id: "qualified", label: "合格人才", count: 0, tone: "orange" },
    { id: "activation", label: "待激活", count: 0, tone: "slate" },
    { id: "optimize", label: "优化调整", count: 0, tone: "red" },
    { id: "other", label: "其他", count: 0, tone: "slate" },
  ];

  const items = categories.map((item) => ({
    ...item,
    count: cleaned.rows.filter((row) => row.talentCategory === item.label).length,
  }));

  return hasPositiveTotal(items)
    ? { items }
    : { items: [], emptyMessage: "字段已识别，但暂无有效数据。" };
}

export function buildSuccessorRiskDistribution(
  cleaned: CleanRosterResult,
): RiskSectionResult<SuccessorRiskItem> {
  const hasSource =
    cleaned.fieldAvailability.hasSuccessorField ||
    cleaned.fieldAvailability.hasSuccessorRiskField ||
    cleaned.fieldAvailability.hasSuccessorNameField;

  if (!hasSource) {
    return { items: [], emptyMessage: "缺少继任相关字段，暂无继任风险数据。" };
  }

  const items: SuccessorRiskItem[] = [
    {
      id: "covered",
      label: "有继任",
      count: cleaned.rows.filter((row) => row.successorStatus === "有继任").length,
      tone: "green",
    },
    {
      id: "developing",
      label: "需培养",
      count: cleaned.rows.filter((row) => row.successorStatus === "需培养").length,
      tone: "amber",
    },
    {
      id: "uncovered",
      label: "无继任",
      count: cleaned.rows.filter((row) => row.successorStatus === "无继任").length,
      tone: "red",
    },
  ];

  return hasPositiveTotal(items)
    ? { items }
    : { items: [], emptyMessage: "字段已识别，但暂无有效数据。" };
}

export function buildDashboardChartData(cleaned: CleanRosterResult) {
  return {
    ageDistribution: buildAgeDistribution(cleaned),
    educationDistribution: buildEducationDistribution(cleaned),
    tenureDistribution: buildTenureDistribution(cleaned),
    performanceDistribution: buildPerformanceDistribution(cleaned),
  };
}

export function buildRiskWarningData(cleaned: CleanRosterResult) {
  return {
    talentMatrix: buildTalentMatrixDistribution(cleaned),
    successorRisk: buildSuccessorRiskDistribution(cleaned),
  };
}
