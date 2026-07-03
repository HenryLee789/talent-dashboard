import type { MetricCardData } from "../types/talent";
import type { CleanRosterResult } from "./cleanRoster";
import { average, formatNumber, formatPercent } from "./formatters";

function emptyMetric(
  id: string,
  label: string,
  emptyLabel: string,
): MetricCardData {
  return {
    id,
    label,
    value: "--",
    isEmpty: true,
    emptyLabel,
  };
}

function metric(
  id: string,
  label: string,
  value: string,
  suffix?: string,
  secondary?: string,
): MetricCardData {
  return {
    id,
    label,
    value,
    suffix,
    secondary,
    trendLabel: "暂无上月数据",
    trendDirection: "neutral",
  };
}

export function calculateDashboardMetrics(cleaned: CleanRosterResult) {
  const { rows, fieldAvailability } = cleaned;
  const ages = rows
    .map((row) => row.age)
    .filter((value): value is number => typeof value === "number");
  const tenures = rows
    .map((row) => row.tenureYears)
    .filter((value): value is number => typeof value === "number");
  const educations = rows
    .map((row) => row.education)
    .filter(Boolean);

  const hasKeyTalentSource =
    fieldAvailability.hasKeyTalentField || fieldAvailability.hasTalentCategoryField;
  const keyTalentMetric = hasKeyTalentSource
    ? metric(
        "keyTalentTotal",
        "关键人才总数",
        String(rows.filter((row) => row.isKeyTalent).length),
        "人",
      )
    : emptyMetric(
        "keyTalentTotal",
        "关键人才总数",
        "缺少是否关键人才或人才分类字段，暂无关键人才数据",
      );

  const genderMetric = (() => {
    if (!fieldAvailability.hasGenderField) {
      return emptyMetric("genderRatio", "男/女性别比", "缺少性别字段，暂无性别数据");
    }

    const male = rows.filter((row) => row.gender === "男").length;
    const female = rows.filter((row) => row.gender === "女").length;
    const total = male + female;

    if (total === 0) {
      return emptyMetric("genderRatio", "男/女性别比", "字段已识别，但暂无有效数据");
    }

    return metric(
      "genderRatio",
      "男/女性别比",
      String(male),
      ` / ${female}`,
      `男性占比 ${formatPercent(male, total)}%`,
    );
  })();

  const averageAgeMetric = (() => {
    if (!fieldAvailability.hasAgeField && !fieldAvailability.hasBirthDateField) {
      return emptyMetric(
        "averageAge",
        "平均年龄",
        "缺少年龄或出生日期字段，暂无平均年龄数据",
      );
    }

    const avg = average(ages);

    if (avg == null) {
      return emptyMetric("averageAge", "平均年龄", "字段已识别，但暂无有效数据");
    }

    return metric("averageAge", "平均年龄", formatNumber(avg, 1), "岁");
  })();

  const masterAboveMetric = (() => {
    if (!fieldAvailability.hasEducationField) {
      return emptyMetric("masterAbove", "硕士及以上", "缺少学历字段，暂无学历数据");
    }

    if (educations.length === 0) {
      return emptyMetric("masterAbove", "硕士及以上", "字段已识别，但暂无有效数据");
    }

    const masterAbove = educations.filter((value) => value === "硕士及以上").length;

    return metric(
      "masterAbove",
      "硕士及以上",
      formatPercent(masterAbove, educations.length),
      "%",
    );
  })();

  const under35Metric = (() => {
    if (!fieldAvailability.hasAgeField && !fieldAvailability.hasBirthDateField) {
      return emptyMetric(
        "under35",
        "35岁及以下",
        "缺少年龄或出生日期字段，暂无年龄结构数据",
      );
    }

    if (ages.length === 0) {
      return emptyMetric("under35", "35岁及以下", "字段已识别，但暂无有效数据");
    }

    const under35 = ages.filter((age) => age <= 35).length;

    return metric("under35", "35岁及以下", formatPercent(under35, ages.length), "%");
  })();

  const averageTenureMetric = (() => {
    if (!fieldAvailability.hasTenureField && !fieldAvailability.hasHireDateField) {
      return emptyMetric(
        "averageTenure",
        "平均任职年限",
        "缺少任职年限或入职日期字段，暂无任职年限数据",
      );
    }

    const avg = average(tenures);

    if (avg == null) {
      return emptyMetric("averageTenure", "平均任职年限", "字段已识别，但暂无有效数据");
    }

    return metric("averageTenure", "平均任职年限", formatNumber(avg, 2), "年");
  })();

  return [
    keyTalentMetric,
    genderMetric,
    averageAgeMetric,
    masterAboveMetric,
    under35Metric,
    averageTenureMetric,
  ];
}
