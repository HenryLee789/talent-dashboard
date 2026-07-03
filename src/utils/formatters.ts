export function isBlankValue(value: unknown) {
  return value == null || String(value).trim() === "";
}

export function parseNumber(value: unknown) {
  if (isBlankValue(value)) {
    return null;
  }

  const normalized = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/年|岁|%/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export function formatNumber(value: number, fractionDigits = 1) {
  return value.toFixed(fractionDigits);
}

export function formatPercent(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return "0.0";
  }

  return ((numerator / denominator) * 100).toFixed(1);
}

export function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function parseDateValue(value: unknown) {
  if (isBlankValue(value)) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const date = new Date(excelEpoch + value * 24 * 60 * 60 * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const raw = String(value).trim();
  const normalized = raw
    .replace(/[年月.]/g, "-")
    .replace(/日/g, "")
    .replace(/\//g, "-");
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateAge(birthDate: Date, now = new Date()) {
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function calculateTenureYears(hireDate: Date, now = new Date()) {
  const diff = now.getTime() - hireDate.getTime();

  if (diff < 0) {
    return null;
  }

  return diff / (365.25 * 24 * 60 * 60 * 1000);
}

export function currentMonthLabel(now = new Date()) {
  return `${now.getFullYear()}年${now.getMonth() + 1}月`;
}
