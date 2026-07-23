import { cleanNumber, CsvRow, findColumn, parseCsv } from "./csvParser";

export type HungerDistanceRow = {
  riderPlatformId: string;
  totalKm: number;
  payableKm: number;
  avgKm: number;
  completedDeliveries: number;
};

export function parseHungerDistanceCsv(text: string): HungerDistanceRow[] {
  const rows = parseCsv(text);

  if (!rows.length) return [];

  const sample = rows[0];

  const riderIdKey = findColumn(sample, ["Rider Id", "Rider ID", "ID"]);
  const totalKmKey = findColumn(sample, ["Total KM", "Total Km", "total_km"]);
  const payableKmKey = findColumn(sample, ["Payable KM", "Payable Km", "payable_km"]);
  const avgKmKey = findColumn(sample, ["AVG KM", "Avg KM", "Average KM", "avg_km"]);
  const deliveriesKey = findColumn(sample, ["Completed Deliveries", "Deliveries"]);

  if (!riderIdKey || !totalKmKey) {
    throw new Error("MISSING_REQUIRED_HUNGER_DISTANCE_COLUMNS");
  }

  return rows.map((row: CsvRow) => ({
    riderPlatformId: String(row[riderIdKey] || "").trim(),
    totalKm: cleanNumber(row[totalKmKey]),
    payableKm: payableKmKey ? cleanNumber(row[payableKmKey]) : 0,
    avgKm: avgKmKey ? cleanNumber(row[avgKmKey]) : 0,
    completedDeliveries: deliveriesKey ? cleanNumber(row[deliveriesKey]) : 0,
  }));
}