export function currentMonthKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function saveMonthlySnapshot<T>(key: string, snapshot: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      `talent-dashboard-monthly-${key}`,
      JSON.stringify(snapshot),
    );
  } catch {
    // localStorage may be unavailable or full; monthly snapshots are optional.
  }
}

export function getPreviousMonthSnapshot<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const [yearValue, monthValue] = key.split("-").map(Number);
  const date = new Date(yearValue, monthValue - 2, 1);
  const previousKey = currentMonthKey(date);
  try {
    const raw = window.localStorage.getItem(`talent-dashboard-monthly-${previousKey}`);

    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function compareWithPreviousMonth() {
  return {
    available: false,
    label: "暂无上月数据",
  };
}
