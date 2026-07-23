import { supabase } from "../../lib/supabase";

import { analyzeHungerRider } from "./engine/hungerEngine";
import { analyzeKeetaRider } from "./engine/keetaEngine";
import { resolveEmployeeByPlatformId } from "./engine/employeeResolver";

import { parseHungerDistanceCsv } from "./parser/hungerDistanceParser";
import { parseHungerPerformanceCsv } from "./parser/hungerParser";
import { parseKeetaPerformanceCsv } from "./parser/keetaParser";

export type PerformanceReportType = "performance" | "distance";
export type PlatformType = "hunger" | "keeta";

export function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function getReportMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function loadTodayReports(platform: PlatformType) {
  return supabase
    .from("performance_reports")
    .select("*")
    .eq("platform", platform)
    .eq("report_date", getLocalDate())
    .order("uploaded_at", { ascending: false });
}

export async function savePerformanceReport({
  platform,
  reportType,
  fileName,
  recordsCount,
}: {
  platform: PlatformType;
  reportType: PerformanceReportType;
  fileName: string;
  recordsCount: number;
}) {
  return supabase
    .from("performance_reports")
    .insert({
      platform,
      report_type: reportType,
      report_date: getLocalDate(),
      file_name: fileName,
      uploaded_by: "system",
      records_count: recordsCount,
    })
    .select()
    .single();
}

export async function importPerformanceReport({
  platform,
  reportType,
  file,
}: {
  platform: PlatformType;
  reportType: PerformanceReportType;
  file: File;
}) {
  const text = await file.text();
  const reportMonth = getReportMonth();

  if (reportType === "distance") {
    if (platform !== "hunger") {
      throw new Error("DISTANCE_REPORT_ONLY_FOR_HUNGER");
    }

    const rows = parseHungerDistanceCsv(text);

    const { error } = await savePerformanceReport({
      platform,
      reportType,
      fileName: file.name,
      recordsCount: rows.length,
    });

    if (error) throw error;

    let matchedCount = 0;

    for (const row of rows) {
      const { error: updateError, count } = await supabase
        .from("performance_records")
        .update(
          {
            total_km: row.totalKm,
            payable_km: row.payableKm,
            avg_km: row.avgKm,
            updated_at: new Date().toISOString(),
          },
          { count: "exact" }
        )
        .eq("platform", "hunger")
        .eq("report_month", reportMonth)
        .eq("rider_platform_id", row.riderPlatformId);

      if (updateError) throw updateError;
      if ((count || 0) > 0) matchedCount += count || 0;
    }

    return {
      recordsCount: rows.length,
      matchedCount,
    };
  }

  let matchedCount = 0;
  const records: any[] = [];

  if (platform === "hunger") {
    const parsedRows = parseHungerPerformanceCsv(text);

    const { data: report, error: reportError } = await savePerformanceReport({
      platform,
      reportType,
      fileName: file.name,
      recordsCount: parsedRows.length,
    });

    if (reportError) throw reportError;

    await supabase
      .from("performance_records")
      .delete()
      .eq("platform", "hunger")
      .eq("report_month", reportMonth);

    for (const row of parsedRows) {
      const resolved = await resolveEmployeeByPlatformId("hunger", row.riderPlatformId);

      if (resolved.found) matchedCount++;

      const result = analyzeHungerRider({
        ...row,
        employeeId: resolved.employeeId || undefined,
        riderName: resolved.employeeName || row.riderName,
      });

      records.push({
        employee_id: result.employeeId || null,
        platform: result.platform,
        report_month: reportMonth,
        report_date: getLocalDate(),
        rider_platform_id: result.riderPlatformId,
        rider_name: result.riderName,
        orders: result.orders,
        working_hours: result.workingHours,
        attendance_rate: result.attendanceRate,
        acceptance_rate: result.acceptanceRate,
        contact_rate: result.contactRate,
        no_show_percent: result.noShowPercent,
        batch_number: result.batchNumber,
        level: result.level,
        total_km: 0,
        payable_km: 0,
        avg_km: 0,
        quality_bonus: result.qualityBonus,
        eligible: result.eligible,
        status: result.status,
        eligibility_reasons: result.reasons,
        source_report_id: report.id,
      });
    }
  }

  if (platform === "keeta") {
    const parsedRows = parseKeetaPerformanceCsv(text);

    const { data: report, error: reportError } = await savePerformanceReport({
      platform,
      reportType,
      fileName: file.name,
      recordsCount: parsedRows.length,
    });

    if (reportError) throw reportError;

    await supabase
      .from("performance_records")
      .delete()
      .eq("platform", "keeta")
      .eq("report_month", reportMonth);

    for (const row of parsedRows) {
      const resolved = await resolveEmployeeByPlatformId("keeta", row.riderPlatformId);

      if (resolved.found) matchedCount++;

      const result = analyzeKeetaRider({
        ...row,
        employeeId: resolved.employeeId || undefined,
        riderName: resolved.employeeName || row.riderName,
      });

      records.push({
        employee_id: result.employeeId || null,
        platform: result.platform,
        report_month: reportMonth,
        report_date: getLocalDate(),
        rider_platform_id: result.riderPlatformId,
        rider_name: result.riderName,
        orders: result.orders,
        valid_days: result.validDays,
        on_time_rate: result.onTime,
        acceptance_rate: result.acceptance,
        quality_bonus: 0,
        eligible: result.eligible,
        status: result.status,
        eligibility_reasons: result.reasons,
        source_report_id: report.id,
      });
    }
  }

  if (records.length > 0) {
    const { error } = await supabase.from("performance_records").insert(records);
    if (error) throw error;
  }

  return {
    recordsCount: records.length,
    matchedCount,
  };
}

export async function loadPerformanceRecords(platform: PlatformType) {
  return supabase
    .from("performance_records")
    .select("*")
    .eq("platform", platform)
    .eq("report_month", getReportMonth())
    .order("orders", { ascending: false });
}