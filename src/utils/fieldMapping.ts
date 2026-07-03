import type { DataQualityIssue, FieldMappingResult } from "../types/talent";

export const STANDARD_FIELD_ALIASES: Record<string, string[]> = {
  姓名: ["姓名", "员工姓名", "人员姓名", "员工", "Name", "Employee Name"],
  性别: ["性别", "Gender", "Sex"],
  年龄: ["年龄", "Age"],
  出生日期: ["出生日期", "生日", "Birth Date", "Birthday"],
  部门: ["部门", "组织", "所属部门", "Department", "Org", "Organization"],
  岗位: ["岗位", "职位", "职务", "Position", "Job Title", "Role"],
  职级: ["职级", "等级", "Level", "Grade"],
  学历: ["学历", "最高学历", "Education", "Degree"],
  入职日期: ["入职日期", "入司日期", "入职时间", "Hire Date", "Join Date"],
  任职年限: ["任职年限", "司龄", "工作年限", "Tenure", "Years of Service"],
  绩效等级: ["绩效", "绩效等级", "绩效结果", "Performance", "Performance Rating"],
  是否关键人才: ["是否关键人才", "关键人才", "Key Talent", "Core Talent"],
  人才分类: ["人才分类", "人才九宫格", "九宫格", "Talent Category", "Talent Matrix"],
  是否有继任者: ["是否有继任者", "继任者", "有无继任", "Successor", "Has Successor"],
  继任者姓名: ["继任者姓名", "继任人", "继任者", "Successor Name"],
  继任风险: ["继任风险", "继任状态", "Successor Risk", "Succession Risk"],
  离职风险: ["离职风险", "流失风险", "Attrition Risk", "Turnover Risk"],
  发展潜力: ["发展潜力", "潜力", "Potential"],
  培训状态: ["培训状态", "培养状态", "Training Status", "Development Status"],
  备注: ["备注", "说明", "Remark", "Notes"],
};

export const STANDARD_FIELDS = Object.keys(STANDARD_FIELD_ALIASES);

const REQUIRED_FIELD_IMPACTS: Record<string, string[]> = {
  性别: ["男/女性别比"],
  年龄: ["平均年龄", "35岁及以下", "年龄分布"],
  出生日期: ["平均年龄", "35岁及以下", "年龄分布"],
  学历: ["硕士及以上", "学历分布"],
  入职日期: ["平均任职年限", "任职年限分布"],
  任职年限: ["平均任职年限", "任职年限分布"],
  绩效等级: ["绩效表现图"],
  是否关键人才: ["关键人才总数"],
  人才分类: ["人才九宫格"],
  是否有继任者: ["继任风险"],
  继任风险: ["继任风险"],
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[：:]+$/g, "")
    .toLowerCase();
}

const aliasLookup = new Map<string, string>();

for (const [standardField, aliases] of Object.entries(STANDARD_FIELD_ALIASES)) {
  aliases.forEach((alias) => {
    const normalizedAlias = normalizeHeader(alias);

    if (!aliasLookup.has(normalizedAlias)) {
      aliasLookup.set(normalizedAlias, standardField);
    }
  });
}

export function mapHeaderToStandardField(header: string) {
  return aliasLookup.get(normalizeHeader(header)) ?? null;
}

export function mapRosterFields(headers: string[]) {
  const usedStandardFields = new Set<string>();

  const fieldMappings: FieldMappingResult[] = headers.map((sourceField) => {
    const standardField = mapHeaderToStandardField(sourceField);

    if (!standardField || usedStandardFields.has(standardField)) {
      return {
        sourceField,
        standardField: "",
        status: "unmapped",
      };
    }

    usedStandardFields.add(standardField);

    return {
      sourceField,
      standardField,
      status: "mapped",
    };
  });

  const missingFields = STANDARD_FIELDS.filter(
    (field) => !usedStandardFields.has(field),
  );

  return {
    fieldMappings,
    missingFields,
  };
}

export function applyFieldMappings(
  rawRows: Record<string, unknown>[],
  fieldMappings: FieldMappingResult[],
) {
  const mappedFields = fieldMappings.filter(
    (mapping) => mapping.status === "mapped" && mapping.standardField,
  );

  return rawRows.map((row) => {
    const mappedRow: Record<string, unknown> = {};

    mappedFields.forEach((mapping) => {
      mappedRow[mapping.standardField] = row[mapping.sourceField];
    });

    return mappedRow;
  });
}

export function buildMissingFieldWarnings(
  missingFields: string[],
): DataQualityIssue[] {
  const impacts = getMissingFieldImpacts(missingFields);

  if (missingFields.length === 0) {
    return [];
  }

  const warnings: DataQualityIssue[] = [
    {
      id: "missing-fields",
      level: "warning",
      message: `缺少字段：${missingFields.join("、")}`,
    },
  ];

  if (impacts.length > 0) {
    warnings.push({
      id: "missing-field-impacts",
      level: "info",
      message: `影响：${impacts.join("、")}暂无法生成或完整展示`,
    });
  }

  return warnings;
}

export function getMissingFieldImpacts(missingFields: string[]) {
  const impactSet = new Set<string>();

  missingFields.forEach((field) => {
    REQUIRED_FIELD_IMPACTS[field]?.forEach((impact) => impactSet.add(impact));
  });

  if (missingFields.includes("年龄") && !missingFields.includes("出生日期")) {
    impactSet.delete("平均年龄");
    impactSet.delete("35岁及以下");
    impactSet.delete("年龄分布");
  }

  if (missingFields.includes("出生日期") && !missingFields.includes("年龄")) {
    impactSet.delete("平均年龄");
    impactSet.delete("35岁及以下");
    impactSet.delete("年龄分布");
  }

  if (missingFields.includes("任职年限") && !missingFields.includes("入职日期")) {
    impactSet.delete("平均任职年限");
    impactSet.delete("任职年限分布");
  }

  if (missingFields.includes("入职日期") && !missingFields.includes("任职年限")) {
    impactSet.delete("平均任职年限");
    impactSet.delete("任职年限分布");
  }

  if (
    missingFields.includes("是否有继任者") &&
    !missingFields.includes("继任风险")
  ) {
    impactSet.delete("继任风险");
  }

  if (
    missingFields.includes("继任风险") &&
    !missingFields.includes("是否有继任者")
  ) {
    impactSet.delete("继任风险");
  }

  return Array.from(impactSet);
}
