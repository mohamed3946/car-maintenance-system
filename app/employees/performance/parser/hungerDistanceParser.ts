import {
  cleanNumber,
  CsvRow,
  findColumn,
  parseCsv,
} from "./csvParser";

export type HungerDistanceRow = {
  riderPlatformId: string;
  totalKm: number;
  payableKm: number;
  avgKm: number;
  completedDeliveries: number;
  workingDays: number;
};

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

  const deliveriesKey = findColumn(sample, [
    "Completed Deliveries",
    "Deliveries",
    "Completed Orders",
  ]);

  if (!riderIdKey || !totalKmKey) {
    throw new Error(
      "MISSING_REQUIRED_HUNGER_DISTANCE_COLUMNS"
    );
  }

  type AggregatedDistance = {
    riderPlatformId: string;
    totalKm: number;
    payableKm: number;
    completedDeliveries: number;
    dates: Set<string>;
  };

  const ridersMap = new Map<string, AggregatedDistance>();

  rows.forEach((row: CsvRow) => {
    const riderPlatformId = String(
      row[riderIdKey] || ""
    ).trim();

    if (!riderPlatformId) return;

    const totalKm = cleanNumber(row[totalKmKey]);

    const payableKm = payableKmKey
      ? cleanNumber(row[payableKmKey])
      : 0;

    const completedDeliveries = deliveriesKey
      ? cleanNumber(row[deliveriesKey])
      : 0;

    const workDate = dateKey
      ? String(row[dateKey] || "").trim()
      : "";

    const existing = ridersMap.get(riderPlatformId);

    if (!existing) {
      ridersMap.set(riderPlatformId, {
        riderPlatformId,
        totalKm,
        payableKm,
        completedDeliveries,
        dates: new Set(workDate ? [workDate] : []),
      });

      return;
    }

    existing.totalKm += totalKm;
    existing.payableKm += payableKm;
    existing.completedDeliveries += completedDeliveries;

    if (workDate) {
      existing.dates.add(workDate);
    }
  });

  return Array.from(ridersMap.values()).map((rider) => ({
    riderPlatformId: rider.riderPlatformId,

    totalKm: Number(rider.totalKm.toFixed(3)),

    payableKm: Number(rider.payableKm.toFixed(3)),

    completedDeliveries: rider.completedDeliveries,

    avgKm:
      rider.completedDeliveries > 0
        ? Number(
            (
              rider.totalKm /
              rider.completedDeliveries
            ).toFixed(3)
          )
        : 0,

    workingDays: rider.dates.size,
  }));
}