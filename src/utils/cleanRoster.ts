import type { DataQualityIssue } from "../types/talent";
import {
  calculateAge,
  calculateTenureYears,
  isBlankValue,
  parseDateValue,
  parseNumber,
} from "./formatters";

export type EducationCategory = "专科" | "本科" | "硕士及以上" | "其他";
export type PerformanceCategory = "A/优" | "B/良" | "C/改进" | "其他";
export type TalentCategory =
  | "核心人才"
  | "中坚人才"
  | "合格人才"
  | "待激活"
  | "优化调整"
  | "其他";
export type SuccessorStatus = "有继任" | "需培养" | "无继任";

export interface CleanRosterRow {
  rowNumber: number;
  raw: Record<string, unknown>;
  isKeyTalent?: boolean;
  gender?: "男" | "女";
  age?: number;
  education?: EducationCategory;
  tenureYears?: number;
  performance?: PerformanceCategory;
  talentCategory?: TalentCategory;
  successorStatus?: SuccessorStatus;
}

export interface CleanRosterResult {
  rows: CleanRosterRow[];
  warnings: DataQualityIssue[];
  fieldAvailability: {
    hasKeyTalentField: boolean;
    hasTalentCategoryField: boolean;
    hasGenderField: boolean;
    hasAgeField: boolean;
    hasBirthDateField: boolean;
    hasEducationField: boolean;
    hasTenureField: boolean;
    hasHireDateField: boolean;
    hasPerformanceField: boolean;
    hasSuccessorField: boolean;
    hasSuccessorRiskField: boolean;
    hasSuccessorNameField: boolean;
  };
}

interface IssueBucket {
  id: string;
  level: DataQualityIssue["level"];
  title: string;
  count: number;
  samples: string[];
}

function fieldExists(missingFields: string[], field: string) {
  return !missingFields.includes(field);
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeLower(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function createIssueCollector() {
  const buckets = new Map<string, IssueBucket>();

  function add(
    id: string,
    title: string,
    sample: string,
    level: DataQualityIssue["level"] = "warning",
  ) {
    const existing =
      buckets.get(id) ??
      ({
        id,
        level,
        title,
        count: 0,
        samples: [],
      } satisfies IssueBucket);

    existing.count += 1;
    if (existing.samples.length < 5) {
      existing.samples.push(sample);
    }

    buckets.set(id, existing);
  }

  function flush(): DataQualityIssue[] {
    return Array.from(buckets.values()).map((bucket) => ({
      id: bucket.id,
      level: bucket.level,
      message: `${bucket.title}（${bucket.count}处）：${bucket.samples.join("；")}${
        bucket.count > bucket.samples.length ? "；..." : ""
      }`,
    }));
  }

  return { add, flush };
}

export function normalizeGender(value: unknown) {
  const normalized = normalizeLower(value);

  if (["男", "男性", "m", "male"].includes(normalized)) {
    return "男" as const;
  }

  if (["女", "女性", "f", "female"].includes(normalized)) {
    return "女" as const;
  }

  return null;
}

export function normalizeEducation(value: unknown) {
  const normalized = normalizeLower(value);

  if (
    normalized.includes("硕士") ||
    normalized.includes("研究生") ||
    normalized.includes("mba") ||
    normalized.includes("博士") ||
    normalized.includes("phd") ||
    normalized.includes("master") ||
    normalized.includes("doctor")
  ) {
    return { category: "硕士及以上" as const, recognized: true };
  }

  if (
    normalized.includes("本科") ||
    normalized.includes("学士") ||
    normalized.includes("bachelor")
  ) {
    return { category: "本科" as const, recognized: true };
  }

  if (
    normalized.includes("专科") ||
    normalized.includes("大专") ||
    normalized.includes("college")
  ) {
    return { category: "专科" as const, recognized: true };
  }

  if (
    normalized.includes("高中") ||
    normalized.includes("中专") ||
    normalized.includes("其他")
  ) {
    return { category: "其他" as const, recognized: true };
  }

  return { category: "其他" as const, recognized: false };
}

export function normalizePerformance(value: unknown) {
  const normalized = normalizeLower(value);

  if (["a", "优秀", "优", "a/优", "excellent"].includes(normalized)) {
    return { category: "A/优" as const, recognized: true };
  }

  if (["b", "良好", "良", "b/良", "good"].includes(normalized)) {
    return { category: "B/良" as const, recognized: true };
  }

  if (
    ["c", "待改进", "改进", "c/改进", "needs improvement"].includes(normalized)
  ) {
    return { category: "C/改进" as const, recognized: true };
  }

  return { category: "其他" as const, recognized: false };
}

export function normalizeTalentCategory(value: unknown): TalentCategory | null {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  if (text.includes("核心") || text.includes("关键")) {
    return "核心人才";
  }

  if (text.includes("中坚")) {
    return "中坚人才";
  }

  if (text.includes("合格")) {
    return "合格人才";
  }

  if (text.includes("待激活")) {
    return "待激活";
  }

  if (text.includes("优化") || text.includes("调整")) {
    return "优化调整";
  }

  return "其他";
}

export function normalizeSuccessorStatus(value: unknown): SuccessorStatus | null {
  const normalized = normalizeLower(value);

  if (["是", "有", "y", "yes", "已覆盖", "有继任", "有继任者"].includes(normalized)) {
    return "有继任";
  }

  if (["培养中", "需培养", "储备中", "待培养"].includes(normalized)) {
    return "需培养";
  }

  if (["否", "无", "n", "no", "无继任", "无继任者"].includes(normalized)) {
    return "无继任";
  }

  return null;
}

function isKeyTalentValue(value: unknown) {
  const normalized = normalizeLower(value);

  return ["是", "y", "yes", "true", "1", "关键人才", "核心人才"].includes(
    normalized,
  );
}

export function cleanRosterData(
  mappedRows: Record<string, unknown>[],
  missingFields: string[],
  now = new Date(),
): CleanRosterResult {
  const issues = createIssueCollector();
  const fieldAvailability = {
    hasKeyTalentField: fieldExists(missingFields, "是否关键人才"),
    hasTalentCategoryField: fieldExists(missingFields, "人才分类"),
    hasGenderField: fieldExists(missingFields, "性别"),
    hasAgeField: fieldExists(missingFields, "年龄"),
    hasBirthDateField: fieldExists(missingFields, "出生日期"),
    hasEducationField: fieldExists(missingFields, "学历"),
    hasTenureField: fieldExists(missingFields, "任职年限"),
    hasHireDateField: fieldExists(missingFields, "入职日期"),
    hasPerformanceField: fieldExists(missingFields, "绩效等级"),
    hasSuccessorField: fieldExists(missingFields, "是否有继任者"),
    hasSuccessorRiskField: fieldExists(missingFields, "继任风险"),
    hasSuccessorNameField: fieldExists(missingFields, "继任者姓名"),
  };

  const rows = mappedRows.map((row, index) => {
    const rowNumber = index + 2;
    const cleanRow: CleanRosterRow = { rowNumber, raw: row };

    if (fieldAvailability.hasTalentCategoryField && !isBlankValue(row["人才分类"])) {
      cleanRow.talentCategory = normalizeTalentCategory(row["人才分类"]) ?? undefined;
    }

    if (fieldAvailability.hasKeyTalentField) {
      cleanRow.isKeyTalent = isKeyTalentValue(row["是否关键人才"]);
    } else if (cleanRow.talentCategory) {
      cleanRow.isKeyTalent = cleanRow.talentCategory === "核心人才";
    }

    if (fieldAvailability.hasGenderField && !isBlankValue(row["性别"])) {
      const gender = normalizeGender(row["性别"]);

      if (gender) {
        cleanRow.gender = gender;
      } else {
        issues.add(
          "invalid-gender",
          "性别字段存在无法识别值",
          `第${rowNumber}行=${normalizeText(row["性别"])}`,
        );
      }
    }

    if (fieldAvailability.hasAgeField) {
      if (!isBlankValue(row["年龄"])) {
        const age = parseNumber(row["年龄"]);

        if (age == null || age < 16 || age > 75) {
          issues.add(
            "invalid-age",
            "年龄字段存在异常值",
            `第${rowNumber}行=${normalizeText(row["年龄"])}`,
          );
        } else {
          cleanRow.age = Math.floor(age);
        }
      }
    } else if (fieldAvailability.hasBirthDateField && !isBlankValue(row["出生日期"])) {
      const birthDate = parseDateValue(row["出生日期"]);

      if (!birthDate) {
        issues.add(
          "invalid-birth-date",
          "出生日期无法解析",
          `第${rowNumber}行=${normalizeText(row["出生日期"])}`,
        );
      } else {
        const age = calculateAge(birthDate, now);

        if (age < 16 || age > 75) {
          issues.add(
            "invalid-age",
            "年龄字段存在异常值",
            `第${rowNumber}行=${age}`,
          );
        } else {
          cleanRow.age = age;
        }
      }
    }

    if (fieldAvailability.hasEducationField && !isBlankValue(row["学历"])) {
      const education = normalizeEducation(row["学历"]);
      cleanRow.education = education.category;

      if (!education.recognized) {
        issues.add(
          "unknown-education",
          "学历字段存在无法识别值",
          `第${rowNumber}行=${normalizeText(row["学历"])}`,
          "info",
        );
      }
    }

    if (fieldAvailability.hasTenureField) {
      if (!isBlankValue(row["任职年限"])) {
        const tenure = parseNumber(row["任职年限"]);

        if (tenure == null || tenure < 0 || tenure > 60) {
          issues.add(
            "invalid-tenure",
            "任职年限不是有效数字",
            `第${rowNumber}行=${normalizeText(row["任职年限"])}`,
          );
        } else {
          cleanRow.tenureYears = tenure;
        }
      }
    } else if (fieldAvailability.hasHireDateField && !isBlankValue(row["入职日期"])) {
      const hireDate = parseDateValue(row["入职日期"]);

      if (!hireDate) {
        issues.add(
          "invalid-hire-date",
          "入职日期无法解析",
          `第${rowNumber}行=${normalizeText(row["入职日期"])}`,
        );
      } else {
        const tenure = calculateTenureYears(hireDate, now);

        if (tenure == null) {
          issues.add(
            "invalid-hire-date",
            "入职日期无法解析",
            `第${rowNumber}行=${normalizeText(row["入职日期"])}`,
          );
        } else {
          cleanRow.tenureYears = tenure;
        }
      }
    }

    if (fieldAvailability.hasPerformanceField && !isBlankValue(row["绩效等级"])) {
      const performance = normalizePerformance(row["绩效等级"]);
      cleanRow.performance = performance.category;

      if (!performance.recognized) {
        issues.add(
          "unknown-performance",
          "绩效字段存在无法识别值",
          `第${rowNumber}行=${normalizeText(row["绩效等级"])}`,
          "info",
        );
      }
    }

    if (fieldAvailability.hasSuccessorField && !isBlankValue(row["是否有继任者"])) {
      cleanRow.successorStatus =
        normalizeSuccessorStatus(row["是否有继任者"]) ?? undefined;
    } else if (
      fieldAvailability.hasSuccessorRiskField &&
      !isBlankValue(row["继任风险"])
    ) {
      cleanRow.successorStatus =
        normalizeSuccessorStatus(row["继任风险"]) ?? undefined;
    } else if (
      fieldAvailability.hasSuccessorNameField &&
      !isBlankValue(row["继任者姓名"])
    ) {
      cleanRow.successorStatus = "有继任";
    }

    return cleanRow;
  });

  return {
    rows,
    fieldAvailability,
    warnings: [
      {
        id: "valid-row-count",
        level: "info",
        message: `有效数据行数量：${mappedRows.length} 条`,
      },
      ...issues.flush(),
    ],
  };
}

export function mergeDataQualityIssues(issues: DataQualityIssue[]) {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    const key = `${issue.id}:${issue.message}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
