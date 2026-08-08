import {
  cleanNumber,
  CsvRow,
  findColumn,
  parseCsv,
} from "./csvParser";

export type HungerDistanceRow = {
  riderPlatformId: string;

  workDate: string;

  totalKm: number;
  payableKm: number;
  avgKm: number;

  completedDeliveries: number;
};

function normalizeDate(value: any): string {
  const raw = String(value || "").trim();

  if (!raw) return "";

  // لو التاريخ بالفعل YYYY-MM-DD
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    return raw;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseHungerDistanceCsv(
  text: string
): HungerDistanceRow[] {
  const rows = parseCsv(text);

  if (!rows.length) return [];

  const sample = rows[0];

  const riderIdKey = findColumn(sample, [
    "Rider Id",
    "Rider ID",
    "RiderId",
    "ID",
  ]);

  const dateKey = findColumn(sample, [
    "Created Date",
    "Date",
    "Report Date",
  ]);

  const totalKmKey = findColumn(sample, [
    "Total KM",
    "Total Km",
    "total_km",
  ]);

  const payableKmKey = findColumn(sample, [
    "Payable KM",
    "Payable Km",
    "payable_km",
  ]);

  const avgKmKey = findColumn(sample, [
    "AVG KM",
    "Avg KM",
    "Average KM",
    "avg_km",
  ]);

  const deliveriesKey = findColumn(sample, [
    "Completed Deliveries",
    "Deliveries",
    "Completed Orders",
    "Orders",
  ]);

  if (!riderIdKey || !dateKey || !totalKmKey) {
    throw new Error(
      "MISSING_REQUIRED_HUNGER_DISTANCE_COLUMNS"
    );
  }

  return rows
    .map((row: CsvRow) => {
      const riderPlatformId = String(
        row[riderIdKey] || ""
      ).trim();

      const workDate = normalizeDate(
        row[dateKey]
      );

      return {
        riderPlatformId,

        workDate,

        totalKm: cleanNumber(
          row[totalKmKey]
        ),

        payableKm: payableKmKey
          ? cleanNumber(row[payableKmKey])
          : 0,

        avgKm: avgKmKey
          ? cleanNumber(row[avgKmKey])
          : 0,

        completedDeliveries: deliveriesKey
          ? cleanNumber(row[deliveriesKey])
          : 0,
      };
    })
    .filter(
      (row) =>
        row.riderPlatformId &&
        row.workDate
    );
}