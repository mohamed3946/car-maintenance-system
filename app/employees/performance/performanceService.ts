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

    // تقرير المسافات الآن يرجع صفًا لكل مندوب / يوم
    const dailyRows = parseHungerDistanceCsv(text);

    const { error: reportError } = await savePerformanceReport({
      platform,
      reportType,
      fileName: file.name,
      recordsCount: dailyRows.length,
    });

    if (reportError) throw reportError;

    // حذف التفاصيل اليومية القديمة لهذا الشهر
    const { error: deleteDailyError } = await supabase
      .from("hunger_daily_performance")
      .delete()
      .eq("report_month", reportMonth);

    if (deleteDailyError) throw deleteDailyError;

    // حفظ التفاصيل اليومية
    if (dailyRows.length > 0) {
      const dailyRecords = dailyRows.map((row) => ({
        report_month: reportMonth,
        rider_platform_id: row.riderPlatformId,
        work_date: row.workDate,
        completed_deliveries: Number(row.completedDeliveries || 0),
        total_km: Number(row.totalKm || 0),
        payable_km: Number(row.payableKm || 0),
        avg_km: Number(row.avgKm || 0),
        updated_at: new Date().toISOString(),
      }));

      const { error: dailyInsertError } = await supabase
        .from("hunger_daily_performance")
        .insert(dailyRecords);

      if (dailyInsertError) throw dailyInsertError;
    }

    // تجميع إجماليات كل مندوب للحفاظ على الداشبورد الحالي
    type AggregatedDistance = {
      riderPlatformId: string;
      totalKm: number;
      payableKm: number;
      completedDeliveries: number;
    };

    const ridersMap = new Map<string, AggregatedDistance>();

    dailyRows.forEach((row) => {
      const riderId = String(row.riderPlatformId || "").trim();
      if (!riderId) return;

      const existing = ridersMap.get(riderId);

      if (!existing) {
        ridersMap.set(riderId, {
          riderPlatformId: riderId,
          totalKm: Number(row.totalKm || 0),
          payableKm: Number(row.payableKm || 0),
          completedDeliveries: Number(row.completedDeliveries || 0),
        });
        return;
      }

      existing.totalKm += Number(row.totalKm || 0);
      existing.payableKm += Number(row.payableKm || 0);
      existing.completedDeliveries += Number(row.completedDeliveries || 0);
    });

    const aggregatedRows = Array.from(ridersMap.values()).map((rider) => ({
      ...rider,
      totalKm: Number(rider.totalKm.toFixed(3)),
      payableKm: Number(rider.payableKm.toFixed(3)),
      avgKm:
        rider.completedDeliveries > 0
          ? Number((rider.totalKm / rider.completedDeliveries).toFixed(3))
          : 0,
    }));

    let matchedCount = 0;

    for (const row of aggregatedRows) {
      const { data: riderRecords, error: fetchError } = await supabase
        .from("performance_records")
        .select("id")
        .eq("platform", "hunger")
        .eq("report_month", reportMonth)
        .eq("rider_platform_id", row.riderPlatformId)
        .order("report_date", { ascending: false })
        .order("id", { ascending: true });

      if (fetchError) throw fetchError;
      if (!riderRecords?.length) continue;

      const [primaryRecord, ...duplicateRecords] = riderRecords;

      const { error: updatePrimaryError } = await supabase
        .from("performance_records")
        .update({
          total_km: row.totalKm,
          payable_km: row.payableKm,
          avg_km: row.avgKm,
          updated_at: new Date().toISOString(),
        })
        .eq("id", primaryRecord.id);

      if (updatePrimaryError) throw updatePrimaryError;

      if (duplicateRecords.length > 0) {
        const duplicateIds = duplicateRecords.map((record) => record.id);

        const { error: resetDuplicatesError } = await supabase
          .from("performance_records")
          .update({
            total_km: 0,
            payable_km: 0,
            avg_km: 0,
            updated_at: new Date().toISOString(),
          })
          .in("id", duplicateIds);

        if (resetDuplicatesError) throw resetDuplicatesError;
      }

      matchedCount += 1;
    }

    return {
      recordsCount: dailyRows.length,
      matchedCount,
    };
  }


  let matchedCount = 0;
  const records: any[] = [];

if (platform === "hunger") {
  const parsedRows = parseHungerPerformanceCsv(text);

  const { data: report, error: reportError } =
    await savePerformanceReport({
      platform,
      reportType,
      fileName: file.name,
      recordsCount: parsedRows.length,
    });

  if (reportError) throw reportError;

  // تجميع جميع صفوف كل مندوب في سجل واحد
  const ridersMap = new Map<string, any>();

parsedRows.forEach((row) => {
  const riderId = String(
    row.riderPlatformId || ""
  ).trim();

  if (!riderId) return;

  const existing = ridersMap.get(riderId);

  if (!existing) {
    ridersMap.set(riderId, {
      ...row,

      completedDeliveries: Number(
        row.completedDeliveries || 0
      ),
      workingDays: Number(row.workingDays || 0),
      workingHours: Number(row.workingHours || 0),

      attendanceTotal: Number(
        row.attendanceRate || 0
      ),

      acceptanceTotal: Number(
        row.acceptanceRate || 0
      ),

      contactTotal: Number(
        row.contactRate || 0
      ),

      noShowTotal: Number(
        row.noShowPercent || 0
      ),

      recordsCount: 1,
    });

    return;
  }

  // إجمالي الطلبات لكل صفوف المندوب
  existing.completedDeliveries += Number(
    row.completedDeliveries || 0
  );
  existing.workingDays += Number(row.workingDays || 0);
  existing.workingHours += Number(
    row.workingHours || 0
  );

  existing.attendanceTotal += Number(
    row.attendanceRate || 0
  );

  existing.acceptanceTotal += Number(
    row.acceptanceRate || 0
  );

  existing.contactTotal += Number(
    row.contactRate || 0
  );

  existing.noShowTotal += Number(
    row.noShowPercent || 0
  );

  existing.recordsCount += 1;

  // آخر Batch حسب آخر ظهور في ملف CSV
  existing.batchNumber = Number(
    row.batchNumber || 6
  );

  if (row.riderName) {
    existing.riderName = row.riderName;
  }
});

 const aggregatedRows = Array.from(
  ridersMap.values()
).map((row) => {
  const count = row.recordsCount || 1;

  return {
    ...row,

    completedDeliveries:
      row.completedDeliveries,

    attendanceRate: Number(
      (row.attendanceTotal / count).toFixed(2)
    ),

    acceptanceRate: Number(
      (row.acceptanceTotal / count).toFixed(2)
    ),

    contactRate: Number(
      (row.contactTotal / count).toFixed(2)
    ),

    noShowPercent: Number(
      (row.noShowTotal / count).toFixed(2)
    ),
  };
});
  // حذف سجلات هنجرستيشن القديمة لهذا الشهر
  const { error: deleteError } = await supabase
    .from("performance_records")
    .delete()
    .eq("platform", "hunger")
    .eq("report_month", reportMonth);

  if (deleteError) throw deleteError;

  // إنشاء سجل واحد فقط لكل مندوب
  for (const row of aggregatedRows) {
    const resolved = await resolveEmployeeByPlatformId(
      "hunger",
      row.riderPlatformId
    );

    if (resolved.found) {
      matchedCount++;
    }

    const result = analyzeHungerRider({
      ...row,
      employeeId: resolved.employeeId || undefined,
      riderName:
        resolved.employeeName || row.riderName,
    });

    records.push({
      employee_id: result.employeeId || null,
      platform: result.platform,
      report_month: reportMonth,
      report_date: getLocalDate(),

      rider_platform_id: result.riderPlatformId,
      rider_name: result.riderName,

      orders: result.orders,
      working_days: result.workingDays,
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
export async function loadHungerEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select(
      "id, name, platform_id, work_location, job_title, status"
    )
    .not("platform_id", "is", null);

  if (error) {
    return { data: null, error };
  }

  const hungerEmployees = (data || []).filter((employee: any) => {
    const platformId = String(employee.platform_id || "").trim();

    if (!platformId) return false;

    const workLocation = String(
      employee.work_location || ""
    ).toLowerCase();

    return (
      workLocation.includes("hunger") ||
      workLocation.includes("هنجر") ||
      workLocation.includes("both") ||
      workLocation.includes("الاثنين")
    );
  });

  return {
    data: hungerEmployees,
    error: null,
  };
}