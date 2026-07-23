import { cleanNumber, CsvRow, findColumn, parseCsv } from "./csvParser";
import { KeetaAnalyzeInput } from "../engine/keetaEngine";

export function parseKeetaPerformanceCsv(text: string): KeetaAnalyzeInput[] {
  const rows = parseCsv(text);

  if (!rows.length) return [];

  const sample = rows[0];

  const riderIdKey = findColumn(sample, [
    "Rider Id",
    "Rider ID",
    "Courier ID",
    "ID",
    "Driver ID",
  ]);

  const nameKey = findColumn(sample, [
    "Rider Name",
    "Courier Name",
    "Driver Name",
    "Name",
  ]);

  const ordersKey = findColumn(sample, [
    "Orders",
    "Completed Orders",
    "Total Orders",
    "Deliveries",
  ]);

  const validDaysKey = findColumn(sample, [
    "Valid Days",
    "Eligible Days",
    "Working Days",
  ]);

  const onTimeKey = findColumn(sample, [
    "On Time",
    "On-time",
    "On Time Rate",
    "OnTime",
  ]);

  const acceptanceKey = findColumn(sample, [
    "Acceptance",
    "Acceptance Rate",
  ]);

  if (!riderIdKey || !ordersKey) {
    throw new Error("MISSING_REQUIRED_KEETA_COLUMNS");
  }

  return rows.map((row: CsvRow) => ({
    riderPlatformId: String(row[riderIdKey] || "").trim(),
    riderName: nameKey ? String(row[nameKey] || "").trim() : "",
    orders: cleanNumber(row[ordersKey]),
    validDays: validDaysKey ? cleanNumber(row[validDaysKey]) : 0,
    onTime: onTimeKey ? cleanNumber(row[onTimeKey]) : 0,
    acceptance: acceptanceKey ? cleanNumber(row[acceptanceKey]) : 0,
  }));
}