import type {
  ChartDatum,
  DataQualityIssue,
  MetricCardData,
  TalentDashboardData,
  TalentReport,
  TalentReportItem,
  TalentReportSection,
} from "../types/talent";
import { currentMonthKey } from "./monthlySummary";

interface ReportInput {
  dashboard: TalentDashboardData;
  employeeCount: number;
  missingFields: string[];
  dataQualityIssues: DataQualityIssue[];
  generatedAt?: Date;
}

function metricById(metrics: MetricCardData[], id: string) {
  return metrics.find((metric) => metric.id === id);
}

function metricText(metrics: MetricCardData[], id: string) {
  const metric = metricById(metrics, id);

  if (!metric || metric.isEmpty) {
    return "暂无数据";
  }

  return `${metric.value}${metric.suffix ?? ""}`;
}

function numberFromMetric(metrics: MetricCardData[], id: string) {
  const metric = metricById(metrics, id);

  if (!metric || metric.isEmpty) {
    return null;
  }

  const value = Number(metric.value);
  return Number.isFinite(value) ? value : null;
}

function total(data: ChartDatum[]) {
  return data.reduce((sum, item) => sum + item.value, 0);
}

function percent(value: number, denominator: number) {
  if (denominator <= 0) {
    return "0.0%";
  }

  return `${((value / denominator) * 100).toFixed(1)}%`;
}

function topItem(data: ChartDatum[]) {
  return data.reduce<ChartDatum | null>(
    (top, item) => (!top || item.value > top.value ? item : top),
    null,
  );
}

function makeMissingSection(
  id: string,
  title: string,
  body: string,
  suggestion: string,
): TalentReportSection {
  return {
    id,
    title,
    status: "missing",
    body,
    bullets: [suggestion],
  };
}

export function generateExecutiveSummary(input: ReportInput) {
  const { dashboard, employeeCount } = input;
  const keyTalent = numberFromMetric(dashboard.metrics, "keyTalentTotal");
  const under35 = numberFromMetric(dashboard.metrics, "under35");
  const avgAge = numberFromMetric(dashboard.metrics, "averageAge");
  const masterAbove = numberFromMetric(dashboard.metrics, "masterAbove");
  const summary: string[] = [];

  if (dashboard.isMock) {
    summary.push("当前为示例报告，请导入 Excel 后生成真实报告。");
  } else {
    summary.push(`本月报告基于 Excel 花名册中的 ${employeeCount} 条有效员工数据生成。`);
  }

  if (keyTalent != null && employeeCount > 0) {
    summary.push(`当前识别关键人才 ${keyTalent} 人，占有效样本的 ${percent(keyTalent, employeeCount)}。`);
  }

  if (avgAge != null) {
    summary.push(
      under35 != null && under35 >= 40
        ? `平均年龄 ${avgAge.toFixed(1)} 岁，35 岁及以下占比较高，人才结构呈年轻化特征。`
        : `平均年龄 ${avgAge.toFixed(1)} 岁，管理经验结构相对成熟。`,
    );
  }

  if (masterAbove != null) {
    summary.push(
      masterAbove >= 35
        ? `硕士及以上占比 ${masterAbove.toFixed(1)}%，学历结构对中层管理岗位形成较好支撑。`
        : `硕士及以上占比 ${masterAbove.toFixed(1)}%，关键岗位学历结构仍有提升空间。`,
    );
  }

  const successor = dashboard.risks.successorRisk.items;
  if (successor.length > 0) {
    const successorTotal = successor.reduce((sum, item) => sum + item.count, 0);
    const uncovered = successor.find((item) => item.label === "无继任")?.count ?? 0;
    const developing = successor.find((item) => item.label === "需培养")?.count ?? 0;
    summary.push(
      uncovered > 0
        ? `继任覆盖存在缺口，无继任 ${uncovered} 人、需培养 ${developing} 人，需要纳入重点跟踪。`
        : "继任覆盖基础较好，后续重点在于提升继任者成熟度和关键岗位稳定性。",
    );
    if (successorTotal === 0) {
      summary.pop();
    }
  }

  return summary.slice(0, 5);
}

export function generateStructureInsights(input: ReportInput): TalentReportSection[] {
  const { dashboard } = input;
  const age = dashboard.charts.ageDistribution;
  const education = dashboard.charts.educationDistribution;
  const sections: TalentReportSection[] = [];

  if (age.emptyMessage) {
    sections.push(
      makeMissingSection(
        "age-structure",
        "年龄结构分析",
        age.emptyMessage.includes("缺少")
          ? "由于缺少年龄或出生日期字段，本部分暂无法分析。"
          : "年龄字段已识别，但暂无有效年龄数据，本部分暂无法分析。",
        "建议补充年龄或出生日期字段，并校验异常年龄值。",
      ),
    );
  } else {
    const ageTotal = total(age.data);
    const top = topItem(age.data);
    const under35Count = age.data
      .filter((item) => ["25岁以下", "25-30岁", "31-35岁"].includes(item.name))
      .reduce((sum, item) => sum + item.value, 0);
    const under35Ratio = ageTotal > 0 ? (under35Count / ageTotal) * 100 : 0;

    sections.push({
      id: "age-structure",
      title: "年龄结构分析",
      status: "ready",
      body: `当前年龄分布中，${top?.name ?? "暂无"}人数最多，共 ${top?.value ?? 0} 人。35 岁及以下占比为 ${under35Ratio.toFixed(1)}%。`,
      bullets: [
        under35Ratio >= 40
          ? "年轻化特征明显，需要关注管理成熟度、关键岗位经验沉淀和梯队稳定性。"
          : "年龄结构相对成熟，需要持续关注后备梯队和组织活力。",
        age.data.some((item) => item.value === 0)
          ? "部分年龄段存在空档，建议结合关键岗位要求评估是否存在年龄断层。"
          : "各年龄段均有覆盖，年龄梯队连续性相对较好。",
      ],
    });
  }

  if (education.emptyMessage) {
    sections.push(
      makeMissingSection(
        "education-structure",
        "学历结构分析",
        "由于缺少学历字段，本部分暂无法分析。",
        "建议补充学历字段，便于评估关键人才专业基础和岗位胜任支撑。",
      ),
    );
  } else {
    const eduTotal = total(education.data);
    const master = education.data.find((item) => item.name === "硕士及以上")?.value ?? 0;
    const bachelor = education.data.find((item) => item.name === "本科")?.value ?? 0;
    const college = education.data.find((item) => item.name === "专科")?.value ?? 0;
    const other = education.data.find((item) => item.name === "其他")?.value ?? 0;
    const masterRatio = eduTotal > 0 ? (master / eduTotal) * 100 : 0;

    sections.push({
      id: "education-structure",
      title: "学历结构分析",
      status: "ready",
      body: `硕士及以上 ${master} 人，占 ${masterRatio.toFixed(1)}%；本科 ${bachelor} 人，专科 ${college} 人，其他 ${other} 人。`,
      bullets: [
        masterRatio >= 35
          ? "学历结构整体较好，但仍需结合绩效、岗位贡献和继任覆盖判断实际人才质量。"
          : "硕士及以上比例偏低，可结合关键岗位要求进行针对性引进或培养。",
        other > 0
          ? "存在其他或无法识别学历记录，建议统一学历字典，提升分析准确性。"
          : "学历分类较清晰，可继续用于后续人才盘点和岗位匹配分析。",
      ],
    });
  }

  return sections;
}

export function generatePerformanceInsights(input: ReportInput): TalentReportSection[] {
  const { dashboard } = input;
  const tenure = dashboard.charts.tenureDistribution;
  const performance = dashboard.charts.performanceDistribution;
  const sections: TalentReportSection[] = [];

  if (tenure.emptyMessage) {
    sections.push(
      makeMissingSection(
        "tenure-analysis",
        "任职年限分析",
        "由于缺少任职年限或入职日期字段，本部分暂无法分析。",
        "建议补充任职年限或入职日期字段，便于判断岗位稳定性和经验沉淀。",
      ),
    );
  } else {
    const top = topItem(tenure.data);
    const shortTenure = tenure.data.find((item) => item.name === "≤1年")?.value ?? 0;
    const tenureTotal = total(tenure.data);
    const shortRatio = tenureTotal > 0 ? (shortTenure / tenureTotal) * 100 : 0;

    sections.push({
      id: "tenure-analysis",
      title: "任职年限分析",
      status: "ready",
      body: `任职年限分布中，${top?.name ?? "暂无"}人数最多，共 ${top?.value ?? 0} 人。≤1 年人员占比 ${shortRatio.toFixed(1)}%。`,
      bullets: [
        shortRatio >= 30
          ? "新晋管理人员占比较高，需要关注管理成熟度、岗位适配和上手周期。"
          : "任职年限结构较稳定，有利于岗位经验沉淀和管理连续性。",
      ],
    });
  }

  if (performance.emptyMessage) {
    sections.push(
      makeMissingSection(
        "performance-analysis",
        "绩效表现分析",
        "由于缺少绩效等级字段，本部分暂无法分析。",
        "建议补充绩效等级字段，确保关键人才评价能够结合实际贡献。",
      ),
    );
  } else {
    const perfTotal = total(performance.data);
    const aCount = performance.data.find((item) => item.name === "A/优")?.value ?? 0;
    const bCount = performance.data.find((item) => item.name === "B/良")?.value ?? 0;
    const cCount = performance.data.find((item) => item.name === "C/改进")?.value ?? 0;
    const other = performance.data.find((item) => item.name === "其他")?.value ?? 0;
    const cRatio = perfTotal > 0 ? (cCount / perfTotal) * 100 : 0;
    const aRatio = perfTotal > 0 ? (aCount / perfTotal) * 100 : 0;

    sections.push({
      id: "performance-analysis",
      title: "绩效表现分析",
      status: "ready",
      body: `绩效分布为 A/优 ${aCount} 人、B/良 ${bCount} 人、C/改进 ${cCount} 人、其他 ${other} 人。`,
      bullets: [
        aRatio >= 30
          ? "高绩效人才基础较好，应关注激励、保留和关键岗位承接。"
          : "A 类人才占比不高，需要结合岗位贡献识别可加速发展的关键对象。",
        cRatio >= 15
          ? "C/改进人员占比需要关注，建议开展绩效辅导、岗位适配评估或优化调整。"
          : "绩效改善压力整体可控，但仍需跟踪低绩效人员的改善进展。",
      ],
    });
  }

  return sections;
}

export function generateRiskInsights(input: ReportInput): TalentReportSection[] {
  const { dashboard } = input;
  const matrix = dashboard.risks.talentMatrix;
  const successor = dashboard.risks.successorRisk;
  const sections: TalentReportSection[] = [];

  if (matrix.emptyMessage) {
    sections.push(
      makeMissingSection(
        "talent-matrix",
        "人才九宫格分析",
        "由于缺少人才分类字段，本部分暂无法分析。",
        "建议补充人才分类或九宫格字段，提升关键人才盘点完整性。",
      ),
    );
  } else {
    const core = matrix.items.find((item) => item.label === "核心人才")?.count ?? 0;
    const backbone = matrix.items.find((item) => item.label === "中坚人才")?.count ?? 0;
    const activation = matrix.items.find((item) => item.label === "待激活")?.count ?? 0;
    const optimize = matrix.items.find((item) => item.label === "优化调整")?.count ?? 0;
    const matrixTotal = matrix.items.reduce((sum, item) => sum + item.count, 0);

    sections.push({
      id: "talent-matrix",
      title: "人才九宫格分析",
      status: "ready",
      body: `人才分类中，核心人才 ${core} 人，中坚人才 ${backbone} 人，待激活 ${activation} 人，优化调整 ${optimize} 人。`,
      bullets: [
        matrixTotal > 0 && core / matrixTotal < 0.2
          ? "核心人才储备偏少，需要关注人才识别、培养和外部引进。"
          : "核心及中坚人才具备一定基础，可作为关键岗位承接和组织能力建设重点。",
        activation + optimize > 0
          ? "待激活和优化调整人员需要专项动作，包括发展辅导、岗位调整或绩效改善。"
          : "暂无明显待激活或优化调整压力，后续可聚焦保留和梯队发展。",
      ],
    });
  }

  if (successor.emptyMessage) {
    sections.push(
      makeMissingSection(
        "successor-risk",
        "继任风险分析",
        "由于缺少继任相关字段，本部分暂无法分析。",
        "建议补充是否有继任者、继任风险或继任状态字段。",
      ),
    );
  } else {
    const successorTotal = successor.items.reduce((sum, item) => sum + item.count, 0);
    const covered = successor.items.find((item) => item.label === "有继任")?.count ?? 0;
    const developing = successor.items.find((item) => item.label === "需培养")?.count ?? 0;
    const uncovered = successor.items.find((item) => item.label === "无继任")?.count ?? 0;

    sections.push({
      id: "successor-risk",
      title: "继任风险分析",
      status: "ready",
      body: `继任覆盖情况为有继任 ${covered} 人、需培养 ${developing} 人、无继任 ${uncovered} 人。无继任占比 ${percent(uncovered, successorTotal)}。`,
      bullets: [
        uncovered > 0
          ? "无继任人员存在关键岗位连续性风险，需要尽快建立继任者名单和培养计划。"
          : "无继任风险较低，后续重点在于提升继任者质量和成熟度。",
        developing > covered
          ? "需培养人群较多，继任梯队正在建设但成熟度不足，需要设置阶段性培养目标。"
          : "继任梯队具备一定覆盖基础，应持续验证候选人的岗位胜任度。",
      ],
    });
  }

  return sections;
}

export function generateManagementSuggestions(
  input: ReportInput,
  sections: TalentReportSection[],
): TalentReportItem[] {
  const suggestions: TalentReportItem[] = [];
  const { dashboard, missingFields, dataQualityIssues } = input;
  const performance = dashboard.charts.performanceDistribution.data;
  const successor = dashboard.risks.successorRisk.items;
  const matrix = dashboard.risks.talentMatrix.items;
  const age35 = numberFromMetric(dashboard.metrics, "under35");

  const cCount = performance.find((item) => item.name === "C/改进")?.value ?? 0;
  const uncovered = successor.find((item) => item.label === "无继任")?.count ?? 0;
  const developing = successor.find((item) => item.label === "需培养")?.count ?? 0;
  const core = matrix.find((item) => item.label === "核心人才")?.count ?? 0;
  const activation =
    (matrix.find((item) => item.label === "待激活")?.count ?? 0) +
    (matrix.find((item) => item.label === "优化调整")?.count ?? 0);

  if (uncovered > 0) {
    suggestions.push({
      id: "successor-plan",
      title: "建立关键岗位继任名单",
      description: "对无继任岗位制定 3-6 个月继任者识别和培养计划，并纳入月度跟踪。",
      level: "critical",
    });
  } else if (developing > 0) {
    suggestions.push({
      id: "successor-development",
      title: "推进继任者培养成熟",
      description: "对需培养人员设置阶段性能力目标、导师机制和岗位历练安排。",
      level: "warning",
    });
  }

  if (cCount > 0) {
    suggestions.push({
      id: "performance-coaching",
      title: "开展绩效辅导和岗位适配评估",
      description: "对 C/改进人员进行绩效面谈、辅导计划和岗位匹配复盘。",
      level: "warning",
    });
  }

  if (age35 != null && age35 >= 40) {
    suggestions.push({
      id: "young-manager-development",
      title: "加强年轻管理者训练",
      description: "对高潜年轻人才强化管理能力、跨部门协同和关键项目历练。",
      level: "info",
    });
  }

  if (core <= 2 && !dashboard.isMock) {
    suggestions.push({
      id: "core-talent-pipeline",
      title: "补强核心人才储备",
      description: "结合人才盘点结果建立核心人才识别、培养和外部引进机制。",
      level: "warning",
    });
  }

  if (activation > 0) {
    suggestions.push({
      id: "activation-actions",
      title: "推进待激活和优化调整专项动作",
      description: "对待激活人员设置发展辅导，对优化调整人员开展岗位调整或退出评估。",
      level: "warning",
    });
  }

  if (missingFields.length > 0 || dataQualityIssues.length > 3) {
    suggestions.push({
      id: "data-governance",
      title: "完善花名册字段和数据治理",
      description: "补齐缺失字段，统一性别、学历、绩效、继任状态等字段字典。",
      level: "info",
    });
  }

  sections
    .filter((section) => section.status === "missing")
    .forEach((section) => {
      if (suggestions.length < 6) {
        suggestions.push({
          id: `fix-${section.id}`,
          title: `补充${section.title.replace("分析", "")}数据`,
          description: section.bullets[0] ?? "建议完善相关字段后重新生成报告。",
          level: "info",
        });
      }
    });

  if (suggestions.length === 0) {
    suggestions.push({
      id: "retain-core-talent",
      title: "建立核心人才保留和激励机制",
      description: "围绕关键人才建立差异化激励、发展路径和关键岗位承接安排。",
      level: "info",
    });
  }

  return suggestions.slice(0, 6);
}

function generateRisks(input: ReportInput): TalentReportItem[] {
  const { dashboard, missingFields, dataQualityIssues } = input;
  const risks: TalentReportItem[] = [];
  const successor = dashboard.risks.successorRisk.items;
  const performance = dashboard.charts.performanceDistribution.data;
  const age35 = numberFromMetric(dashboard.metrics, "under35");
  const core = dashboard.risks.talentMatrix.items.find((item) => item.label === "核心人才")?.count ?? 0;
  const uncovered = successor.find((item) => item.label === "无继任")?.count ?? 0;
  const developing = successor.find((item) => item.label === "需培养")?.count ?? 0;
  const cCount = performance.find((item) => item.name === "C/改进")?.value ?? 0;

  risks.push({
    id: "successor-risk",
    title: "继任风险",
    description:
      successor.length === 0
        ? "继任相关字段缺失，当前无法判断关键岗位继任覆盖情况。"
        : uncovered > 0
          ? `存在 ${uncovered} 人无继任、${developing} 人需培养，岗位连续性需要重点关注。`
          : "无继任风险暂不突出，但仍需持续校验继任候选人成熟度。",
    level: uncovered > 0 || successor.length === 0 ? "critical" : "info",
  });

  risks.push({
    id: "performance-risk",
    title: "绩效风险",
    description:
      performance.length === 0
        ? "绩效字段缺失，无法结合绩效表现判断关键人才质量。"
        : cCount > 0
          ? `存在 ${cCount} 名 C/改进人员，需要绩效辅导或岗位适配评估。`
          : "低绩效风险暂不突出，建议持续关注绩效变化。",
    level: cCount > 0 || performance.length === 0 ? "warning" : "info",
  });

  risks.push({
    id: "age-pipeline-risk",
    title: "年龄结构风险",
    description:
      age35 == null
        ? "年龄字段缺失，无法判断年龄结构和梯队连续性。"
        : age35 >= 45
          ? "35 岁及以下占比较高，年轻化明显，需要关注管理成熟度和经验沉淀。"
          : "年龄结构相对成熟，需要关注后备梯队和组织活力。",
    level: age35 == null || age35 >= 45 ? "warning" : "info",
  });

  if (core <= 2 && !dashboard.isMock) {
    risks.push({
      id: "core-concentration-risk",
      title: "核心人才储备风险",
      description: "核心人才数量偏少，关键岗位承接和组织能力稳定性存在压力。",
      level: "warning",
    });
  }

  if (missingFields.length > 0 || dataQualityIssues.length > 3) {
    risks.push({
      id: "data-quality-risk",
      title: "数据质量风险",
      description: "花名册字段或数据质量仍有缺口，可能影响人才判断准确性。",
      level: "warning",
    });
  }

  return risks.slice(0, Math.max(3, Math.min(6, risks.length)));
}

function generateInsights(input: ReportInput): TalentReportItem[] {
  const { dashboard } = input;
  const insights: TalentReportItem[] = [];
  const master = numberFromMetric(dashboard.metrics, "masterAbove");
  const avgAge = numberFromMetric(dashboard.metrics, "averageAge");
  const under35 = numberFromMetric(dashboard.metrics, "under35");
  const keyTalent = numberFromMetric(dashboard.metrics, "keyTalentTotal");
  const successor = dashboard.risks.successorRisk.items;
  const uncovered = successor.find((item) => item.label === "无继任")?.count ?? 0;

  if (keyTalent != null) {
    insights.push({
      id: "key-talent-base",
      title: "关键人才基础",
      description: `当前关键人才识别结果为 ${keyTalent} 人，需要结合绩效、潜力和继任覆盖持续校准。`,
      level: "info",
    });
  }

  if (avgAge != null && under35 != null) {
    insights.push({
      id: "age-insight",
      title: "年龄梯队特征",
      description:
        under35 >= 40
          ? "年轻化趋势明显，组织需要加快管理能力训练和关键岗位历练。"
          : "管理经验沉淀相对稳定，但仍需要关注后备梯队建设。",
      level: "info",
    });
  }

  if (master != null) {
    insights.push({
      id: "education-insight",
      title: "学历结构判断",
      description:
        master >= 35
          ? "学历结构较好，但人才质量仍需通过绩效贡献和岗位承担进行验证。"
          : "学历结构仍有提升空间，可结合关键岗位要求开展引进和培养。",
      level: "info",
    });
  }

  if (successor.length > 0) {
    insights.push({
      id: "successor-insight",
      title: "继任覆盖判断",
      description:
        uncovered > 0
          ? "继任覆盖存在缺口，短期内应优先处理无继任岗位的候选人识别。"
          : "继任覆盖基础较好，后续重点是提升继任候选人的成熟度。",
      level: uncovered > 0 ? "warning" : "info",
    });
  }

  insights.push({
    id: "management-closed-loop",
    title: "管理闭环要求",
    description: "建议将关键人才盘点、绩效复盘、继任计划和培养行动纳入同一月度管理闭环。",
    level: "info",
  });

  return insights.slice(0, 6);
}

export function buildReportSections(input: ReportInput) {
  return [
    ...generateStructureInsights(input),
    ...generatePerformanceInsights(input),
    ...generateRiskInsights(input),
  ];
}

export function generateTalentReport(input: ReportInput): TalentReport {
  const generatedAt = input.generatedAt ?? new Date();
  const monthKey = currentMonthKey(generatedAt);
  const sections = buildReportSections(input);
  const missingAnalysis = sections
    .filter((section) => section.status === "missing")
    .map((section) => `${section.title}：${section.body}`);
  const dataQualityNotes = input.dataQualityIssues.map((issue) => issue.message);
  const risks = generateRisks(input);
  const insights = generateInsights(input);
  const suggestions = generateManagementSuggestions(input, sections);

  return {
    reportId: `talent-report-${monthKey}-${generatedAt.getTime()}`,
    month: input.dashboard.currentMonthLabel,
    monthKey,
    generatedAt: generatedAt.toISOString(),
    title: "关键人才管理分析报告",
    isMock: input.dashboard.isMock,
    dataSource: input.dashboard.isMock ? "示例数据" : "Excel 花名册",
    employeeCount: input.employeeCount,
    summary: generateExecutiveSummary(input),
    metrics: input.dashboard.metrics,
    sections,
    insights,
    risks,
    suggestions,
    missingAnalysis,
    dataQualityNotes,
  };
}
