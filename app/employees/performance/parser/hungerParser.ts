import { cleanNumber, CsvRow, findColumn, parseCsv } from "./csvParser";
import { HungerAnalyzeInput } from "../engine/hungerEngine";

function percentValue(value: any) {
  const n = cleanNumber(value);

  if (n > 0 && n <= 1) return Number((n * 100).toFixed(2));

  return Number(n.toFixed(2));
}

export function parseHungerPerformanceCsv(text: string): HungerAnalyzeInput[] {
  const rows = parseCsv(text);

  if (!rows.length) return [];

  const sample = rows[0];

  const riderIdKey = findColumn(sample, ["Rider Id", "Rider ID", "rider_id", "ID"]);
  const nameKey = findColumn(sample, ["Rider Name", "Name", "Courier Name"]);
  const batchKey = findColumn(sample, ["Batch Number", "Batch", "batch_number"]);

  const deliveriesKey = findColumn(sample, [
    "Completed Deliveries",
    "Deliveries",
    "Completed Orders",
    "Orders",
  ]);

  const attendanceKey = findColumn(sample, ["Attendance Rate", "Attendance"]);
  const acceptanceKey = findColumn(sample, ["Acceptance Rate", "Acceptance"]);
  const contactKey = findColumn(sample, ["Contact Rate", "Contact"]);

  const noShowKey = findColumn(sample, [
    "No Show %",
    "No Show",
    "No Show Percent",
    "NoShow",
  ]);

  const hoursKey = findColumn(sample, [
    "Actual Working Hours",
    "Working Hours",
    "Hours",
  ]);
  const workingDaysKey = findColumn(sample, [
  "Working Days",
  "Worked Days",
  "Active Days",
  "Days",
]);

  if (!riderIdKey || !deliveriesKey) {
    throw new Error("MISSING_REQUIRED_HUNGER_COLUMNS");
  }

  return rows.map((row: CsvRow) => {
    const batchNumber = batchKey ? cleanNumber(row[batchKey]) : 6;

    return {
      riderPlatformId: String(row[riderIdKey] || "").trim(),
      riderName: nameKey ? String(row[nameKey] || "").trim() : "",
      batchNumber: batchNumber > 0 ? batchNumber : 6,
      completedDeliveries: cleanNumber(row[deliveriesKey]),
      workingDays: workingDaysKey
  ? cleanNumber(row[workingDaysKey])
  : 0,
      attendanceRate: attendanceKey ? percentValue(row[attendanceKey]) : 0,
      acceptanceRate: acceptanceKey ? percentValue(row[acceptanceKey]) : 0,
      contactRate: contactKey ? percentValue(row[contactKey]) : 0,
      noShowPercent: noShowKey ? percentValue(row[noShowKey]) : 0,
      workingHours: hoursKey ? cleanNumber(row[hoursKey]) : 0,
      
    };
  });
}