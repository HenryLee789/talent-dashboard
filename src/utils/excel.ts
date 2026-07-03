import * as XLSX from "xlsx";
import type { DataQualityIssue, RosterParseResult } from "../types/talent";
import {
  applyFieldMappings,
  buildMissingFieldWarnings,
  mapRosterFields,
} from "./fieldMapping";

const SUPPORTED_EXTENSIONS = [".xlsx", ".xls"];

function isBlankCell(value: unknown) {
  return value == null || String(value).trim() === "";
}

function isBlankRow(row: unknown[]) {
  return row.every(isBlankCell);
}

function normalizeCellValue(value: unknown) {
  if (value == null) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

function makeUniqueHeaders(headers: string[]) {
  const seen = new Map<string, number>();
  const warnings: DataQualityIssue[] = [];

  const uniqueHeaders = headers.map((header, index) => {
    const trimmed = header.trim();
    const fallback = trimmed || `未命名字段${index + 1}`;
    const count = seen.get(fallback) ?? 0;
    seen.set(fallback, count + 1);

    if (count === 0) {
      return fallback;
    }

    const uniqueHeader = `${fallback}_${count + 1}`;
    warnings.push({
      id: `duplicate-header-${index}`,
      level: "warning",
      message: `检测到重复字段“${fallback}”，已临时标记为“${uniqueHeader}”。`,
    });

    return uniqueHeader;
  });

  return {
    headers: uniqueHeaders,
    warnings,
  };
}

function rowsToObjects(headers: string[], rows: unknown[][]) {
  return rows.map((row) => {
    const record: Record<string, unknown> = {};

    headers.forEach((header, index) => {
      record[header] = normalizeCellValue(row[index]);
    });

    return record;
  });
}

function validateFileName(fileName: string) {
  const normalized = fileName.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((extension) =>
    normalized.endsWith(extension),
  );
}

export async function parseExcelRoster(file: File): Promise<RosterParseResult> {
  if (!validateFileName(file.name)) {
    throw new Error("请上传 .xlsx 或 .xls 文件");
  }

  const buffer = await file.arrayBuffer();
  return parseExcelRosterBuffer(buffer, file.name);
}

export function parseExcelRosterBuffer(
  buffer: ArrayBuffer,
  fileName = "roster.xlsx",
): RosterParseResult {
  if (!validateFileName(fileName)) {
    throw new Error("请上传 .xlsx 或 .xls 文件");
  }

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    raw: false,
  });

  if (workbook.SheetNames.length === 0) {
    throw new Error("未读取到有效员工数据");
  }

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const sheetRange = firstSheet["!ref"];

  if (!sheetRange) {
    throw new Error("未读取到有效员工数据");
  }

  const decodedRange = XLSX.utils.decode_range(sheetRange);

  if (decodedRange.s.r > 0) {
    throw new Error("未识别到字段名，请检查首行是否为表头");
  }

  const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
    header: 1,
    defval: "",
    blankrows: true,
    raw: false,
  });

  if (sheetRows.length === 0) {
    throw new Error("未读取到有效员工数据");
  }

  const headerRow = sheetRows[0] ?? [];

  if (isBlankRow(headerRow)) {
    throw new Error("未识别到字段名，请检查首行是否为表头");
  }

  const headerValues = headerRow.map((cell) => String(cell ?? "").trim());
  const { headers, warnings: headerWarnings } = makeUniqueHeaders(headerValues);
  const candidateRows = sheetRows.slice(1);
  const dataRows = candidateRows.filter((row) => !isBlankRow(row));
  const filteredBlankRowCount = candidateRows.length - dataRows.length;

  if (dataRows.length === 0) {
    throw new Error("未读取到有效员工数据行");
  }

  const rawRows = rowsToObjects(headers, dataRows);
  const { fieldMappings, missingFields } = mapRosterFields(headers);
  const mappedRows = applyFieldMappings(rawRows, fieldMappings);
  const rowWarnings: DataQualityIssue[] = [
    {
      id: "valid-row-count",
      level: "info",
      message: `有效数据行数量：${dataRows.length} 条`,
    },
  ];

  if (filteredBlankRowCount > 0) {
    rowWarnings.push({
      id: "blank-rows-filtered",
      level: "info",
      message: `空行已过滤：${filteredBlankRowCount} 行`,
    });
  }

  const warnings = [
    ...headerWarnings,
    ...rowWarnings,
    ...buildMissingFieldWarnings(missingFields),
  ];

  return {
    rawRows,
    headers,
    mappedRows,
    fieldMappings,
    missingFields,
    warnings,
  };
}
