export function isExcludedRiderStatus(status: string | null) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  return new Set([
    "stopped", "inactive", "notactive", "outofservice",
    "غيرنشط", "متوقف", "موقوف", "خارجالخدمة",
  ]).has(normalized);
}

export function ordersPerWorkingDay(orders: number, workingDays: number) {
  return workingDays > 0 ? orders / workingDays : 0;
}

export function batchToLevel(batch: number) {
  const map: Record<number, string> = {
    1: "A",
    2: "B",
    3: "C",
    4: "D",
    5: "E",
    6: "F",
  };

  return map[batch] || "-";
}

export function qualityBonusByBatch(batch: number) {
  const map: Record<number, number> = {
    1: 2.75,
    2: 2.25,
    3: 1.75,
    4: 1.25,
    5: 0.75,
    6: 0,
  };

  return map[batch] ?? 0;
}
