export type DashboardTab = "dashboard" | "report" | "entry";

export type TrendDirection = "up" | "down" | "neutral";

export interface MetricCardData {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  secondary?: string;
  trendLabel?: string;
  trendDirection?: TrendDirection;
  isEmpty?: boolean;
  emptyLabel?: string;
}

export interface ChartDatum {
  name: string;
  value: number;
}

export interface ChartDataResult {
  data: ChartDatum[];
  emptyMessage?: string;
}

export type MatrixTone = "blue" | "teal" | "orange" | "slate" | "red";

export interface TalentMatrixItem {
  id: string;
  label: string;
  count: number;
  tone: MatrixTone;
}

export interface SuccessorRiskItem {
  id: string;
  label: string;
  count: number;
  tone: "green" | "amber" | "red";
}

export interface TalentDashboardMock {
  currentMonthLabel: string;
  metrics: MetricCardData[];
  charts: {
    ageDistribution: ChartDatum[] | ChartDataResult;
    educationDistribution: ChartDatum[] | ChartDataResult;
    tenureDistribution: ChartDatum[] | ChartDataResult;
    performanceDistribution: ChartDatum[] | ChartDataResult;
  };
  risks: {
    talentMatrix: TalentMatrixItem[] | RiskSectionResult<TalentMatrixItem>;
    successorRisk: SuccessorRiskItem[] | RiskSectionResult<SuccessorRiskItem>;
  };
}

export interface RiskSectionResult<T> {
  items: T[];
  emptyMessage?: string;
}

export interface TalentDashboardData {
  currentMonthLabel: string;
  isMock: boolean;
  metrics: MetricCardData[];
  charts: {
    ageDistribution: ChartDataResult;
    educationDistribution: ChartDataResult;
    tenureDistribution: ChartDataResult;
    performanceDistribution: ChartDataResult;
  };
  risks: {
    talentMatrix: RiskSectionResult<TalentMatrixItem>;
    successorRisk: RiskSectionResult<SuccessorRiskItem>;
  };
}

export interface FieldMappingResult {
  sourceField: string;
  standardField: string;
  status: "mapped" | "unmapped";
}

export interface DataQualityIssue {
  id: string;
  level: "info" | "warning" | "error";
  message: string;
}

export type ReportSectionStatus = "ready" | "missing" | "empty";

export interface TalentReportSection {
  id: string;
  title: string;
  status: ReportSectionStatus;
  body: string;
  bullets: string[];
}

export interface TalentReportItem {
  id: string;
  title: string;
  description: string;
  level?: "info" | "warning" | "critical";
}

export interface TalentReport {
  reportId: string;
  month: string;
  monthKey: string;
  generatedAt: string;
  title: string;
  isMock: boolean;
  dataSource: string;
  employeeCount: number;
  summary: string[];
  metrics: MetricCardData[];
  sections: TalentReportSection[];
  insights: TalentReportItem[];
  risks: TalentReportItem[];
  suggestions: TalentReportItem[];
  missingAnalysis: string[];
  dataQualityNotes: string[];
}

export type ExportFormat = "ppt" | "word" | "pdf" | "excel";

export interface ExportStatus {
  format: ExportFormat | "report" | "template" | "print" | null;
  loading: boolean;
  message: string | null;
  type: "success" | "error" | "info" | null;
}

export interface ExportPayload {
  title: string;
  month: string;
  monthKey: string;
  generatedAt: string;
  dataSource: string;
  totalRows: number;
  isMockMode: boolean;
  metrics: MetricCardData[];
  charts: TalentDashboardData["charts"];
  risks: TalentDashboardData["risks"];
  report: TalentReport;
  rawRows: Record<string, unknown>[];
  mappedRows: Record<string, unknown>[];
  fieldMappings: FieldMappingResult[];
  missingFields: string[];
  warnings: DataQualityIssue[];
}

export type ImportPhase = "idle" | "success" | "error";

export interface ImportStatus {
  phase: ImportPhase;
  message: string;
  fileName?: string;
  rowCount: number;
}

export interface RosterParseResult {
  rawRows: Record<string, unknown>[];
  headers: string[];
  mappedRows: Record<string, unknown>[];
  fieldMappings: FieldMappingResult[];
  missingFields: string[];
  warnings: DataQualityIssue[];
}

export interface TalentDashboardState {
  currentTab: DashboardTab;
  rawRows: Record<string, unknown>[];
  mappedRows: Record<string, unknown>[];
  headers: string[];
  rosterData: Record<string, unknown>[];
  fieldMappings: FieldMappingResult[];
  missingFields: string[];
  warnings: DataQualityIssue[];
  importStatus: ImportStatus;
  importedAt: string | null;
  currentReport: TalentReport | null;
  generatedReports: Record<string, TalentReport>;
  reportGeneratedAt: string | null;
  monthlyReport: string | null;
}
