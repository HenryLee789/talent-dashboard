import { useEffect, useMemo, useState } from "react";
import { talentDashboardMock } from "../mock/talentMock";
import type {
  DashboardTab,
  RosterParseResult,
  TalentDashboardData,
  TalentDashboardState,
  TalentReport,
} from "../types/talent";
import { buildDashboardChartData, buildRiskWarningData } from "../utils/chartData";
import { cleanRosterData, mergeDataQualityIssues } from "../utils/cleanRoster";
import { currentMonthLabel } from "../utils/formatters";
import { calculateDashboardMetrics } from "../utils/metrics";
import { currentMonthKey } from "../utils/monthlySummary";
import { generateTalentReport } from "../utils/report";

const STORAGE_KEY = "talent-dashboard-state-v1";
const REPORTS_STORAGE_KEY = "talent-dashboard-reports-v1";

const initialState: TalentDashboardState = {
  currentTab: "dashboard",
  rawRows: [],
  mappedRows: [],
  headers: [],
  rosterData: [],
  fieldMappings: [],
  missingFields: [],
  warnings: [],
  importStatus: {
    phase: "idle",
    message: "尚未导入 Excel 花名册",
    rowCount: 0,
  },
  importedAt: null,
  currentReport: null,
  generatedReports: {},
  reportGeneratedAt: null,
  monthlyReport: null,
};

function asChartData(data: TalentDashboardData["charts"]["ageDistribution"]["data"]) {
  return { data };
}

function getMockEmployeeCount() {
  const value = Number(
    talentDashboardMock.metrics.find((metric) => metric.id === "keyTalentTotal")
      ?.value ?? 0,
  );

  return Number.isFinite(value) ? value : 0;
}

function buildMockDashboard(): TalentDashboardData {
  return {
    currentMonthLabel: talentDashboardMock.currentMonthLabel,
    isMock: true,
    metrics: talentDashboardMock.metrics,
    charts: {
      ageDistribution: asChartData(
        Array.isArray(talentDashboardMock.charts.ageDistribution)
          ? talentDashboardMock.charts.ageDistribution
          : talentDashboardMock.charts.ageDistribution.data,
      ),
      educationDistribution: asChartData(
        Array.isArray(talentDashboardMock.charts.educationDistribution)
          ? talentDashboardMock.charts.educationDistribution
          : talentDashboardMock.charts.educationDistribution.data,
      ),
      tenureDistribution: asChartData(
        Array.isArray(talentDashboardMock.charts.tenureDistribution)
          ? talentDashboardMock.charts.tenureDistribution
          : talentDashboardMock.charts.tenureDistribution.data,
      ),
      performanceDistribution: asChartData(
        Array.isArray(talentDashboardMock.charts.performanceDistribution)
          ? talentDashboardMock.charts.performanceDistribution
          : talentDashboardMock.charts.performanceDistribution.data,
      ),
    },
    risks: {
      talentMatrix: {
        items: Array.isArray(talentDashboardMock.risks.talentMatrix)
          ? talentDashboardMock.risks.talentMatrix
          : talentDashboardMock.risks.talentMatrix.items,
      },
      successorRisk: {
        items: Array.isArray(talentDashboardMock.risks.successorRisk)
          ? talentDashboardMock.risks.successorRisk
          : talentDashboardMock.risks.successorRisk.items,
      },
    },
  };
}

function buildRealDashboard(
  mappedRows: Record<string, unknown>[],
  missingFields: string[],
): TalentDashboardData {
  const cleaned = cleanRosterData(mappedRows, missingFields);

  return {
    currentMonthLabel: currentMonthLabel(),
    isMock: false,
    metrics: calculateDashboardMetrics(cleaned),
    charts: buildDashboardChartData(cleaned),
    risks: buildRiskWarningData(cleaned),
  };
}

function loadReportFromLocalStorage() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(REPORTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TalentReport>) : {};
  } catch {
    return {};
  }
}

function saveReportToLocalStorage(reports: Record<string, TalentReport>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // Report cache persistence is optional; generation still succeeds without it.
  }
}

function loadState(): TalentDashboardState {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const generatedReports = loadReportFromLocalStorage();

    if (!raw) {
      return {
        ...initialState,
        generatedReports,
        currentReport: generatedReports[currentMonthKey()] ?? null,
        reportGeneratedAt: generatedReports[currentMonthKey()]?.generatedAt ?? null,
      };
    }

    const parsedState = JSON.parse(raw) as Partial<TalentDashboardState>;

    return {
      ...initialState,
      ...parsedState,
      generatedReports: {
        ...generatedReports,
        ...parsedState.generatedReports,
      },
      importStatus: {
        ...initialState.importStatus,
        ...parsedState.importStatus,
      },
    };
  } catch {
    return initialState;
  }
}

function persistState(state: TalentDashboardState) {
  if (typeof window === "undefined") {
    return;
  }

  const shouldPersist =
    state.rawRows.length > 0 ||
    Boolean(state.importedAt) ||
    Boolean(state.monthlyReport) ||
    Boolean(state.currentReport);

  try {
    if (!shouldPersist) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Dashboard data remains in memory when localStorage is unavailable or full.
  }
}

export function useTalentDashboard() {
  const [state, setState] = useState<TalentDashboardState>(() => loadState());

  useEffect(() => {
    persistState(state);
  }, [state]);

  const dashboardData = useMemo(() => {
    if (state.mappedRows.length === 0) {
      return buildMockDashboard();
    }

    return buildRealDashboard(state.mappedRows, state.missingFields);
  }, [state.mappedRows, state.missingFields]);

  const calculatedWarnings = useMemo(() => {
    if (state.mappedRows.length === 0) {
      return state.warnings;
    }

    const cleaned = cleanRosterData(state.mappedRows, state.missingFields);
    return mergeDataQualityIssues([...state.warnings, ...cleaned.warnings]);
  }, [state.mappedRows, state.missingFields, state.warnings]);

  const actions = useMemo(
    () => ({
      setCurrentTab: (currentTab: DashboardTab) => {
        setState((previous) => ({ ...previous, currentTab }));
      },
      importRoster: (result: RosterParseResult, fileName: string) => {
        const cleaned = cleanRosterData(result.mappedRows, result.missingFields);
        const warnings = mergeDataQualityIssues([
          ...result.warnings,
          ...cleaned.warnings,
        ]);

        setState((previous) => ({
          ...previous,
          rawRows: result.rawRows,
          mappedRows: result.mappedRows,
          headers: result.headers,
          rosterData: result.rawRows,
          fieldMappings: result.fieldMappings,
          missingFields: result.missingFields,
          warnings,
          importStatus: {
            phase: "success",
            message: `成功导入 ${result.rawRows.length} 条员工数据`,
            fileName,
            rowCount: result.rawRows.length,
          },
          importedAt: new Date().toISOString(),
          currentReport: null,
          reportGeneratedAt: null,
          currentTab: "entry",
        }));
      },
      setImportError: (message: string, fileName?: string) => {
        setState((previous) => ({
          ...previous,
          importStatus: {
            phase: "error",
            message,
            fileName,
            rowCount: previous.rawRows.length,
          },
          currentTab: "entry",
        }));
      },
      generateCurrentMonthReport: () => {
        const generatedAt = new Date();
        const employeeCount = dashboardData.isMock
          ? getMockEmployeeCount()
          : state.mappedRows.length;
        const report = generateTalentReport({
          dashboard: dashboardData,
          employeeCount,
          missingFields: state.missingFields,
          dataQualityIssues: calculatedWarnings,
          generatedAt,
        });

        setState((previous) => {
          const generatedReports = {
            ...previous.generatedReports,
            [report.monthKey]: report,
          };

          saveReportToLocalStorage(generatedReports);

          return {
            ...previous,
            currentReport: report,
            generatedReports,
            reportGeneratedAt: report.generatedAt,
            currentTab: "report",
          };
        });

        return report;
      },
      clearImportedData: () => {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(STORAGE_KEY);
            window.localStorage.removeItem(REPORTS_STORAGE_KEY);
          } catch {
            // Clearing in-memory state is still sufficient for the current session.
          }
        }

        setState({
          ...initialState,
          currentTab: "entry",
        });
      },
      resetDashboardState: () => {
        setState(initialState);
      },
    }),
    [calculatedWarnings, dashboardData, state.mappedRows.length, state.missingFields],
  );

  return {
    ...state,
    warnings: calculatedWarnings,
    ...actions,
    dashboardData,
    mockDashboard: talentDashboardMock,
  };
}
