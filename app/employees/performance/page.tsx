"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileSpreadsheet,
  Gauge,
  MapPin,
  MapPinned,
  PackageCheck,
  RefreshCw,
  Route,
  Search,
  TrendingUp,
  Upload,
  UserCheck,
  UserX,
  Users,
  Wallet,
  X,
} from "lucide-react";


import HungerMiniTable from "./components/HungerMiniTable";
import KeetaMiniTable from "./components/KeetaMiniTable";

import {
  HungerRow,
  KeetaRow,
  PerformanceRecord,
  Platform,
} from "./types";

import { qualityBonusByBatch } from "./utils";

import {
  importPerformanceReport,
  loadHungerEmployees,
  loadPerformanceRecords,
  loadTodayReports,
} from "./performanceService";

type ReportItem = {
  id: string;
  platform: string;
  report_type: "performance" | "distance";
  report_date: string;
  file_name: string | null;
  records_count: number | null;
  uploaded_at: string;
};

type HungerEmployee = {
  id: string;
  name: string;
  platform_id: string;
  work_location: string | null;
  job_title: string | null;
  status: string | null;
};

type AggregatedRider = {
  id: number;
  name: string;

  batchNumber: number;
  latestReportDate: number;

  completedDeliveries: number;
  workingDays: number;
  workingHours: number;

  totalKm: number;
  payableKm: number;

  attendanceTotal: number;
  acceptanceTotal: number;
  contactTotal: number;
  noShowTotal: number;

  recordsCount: number;
  inReport: boolean;
};

export default function PerformancePage() {
  return (
    <AppLayout system="employees">
      <PerformanceContent />
    </AppLayout>
  );
}

function PerformanceContent() {
  const { lang } = useLanguage();
  const isArabic = lang === "ar";

  const [platform, setPlatform] = useState<Platform>("hunger");

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [hungerEmployees, setHungerEmployees] = useState<HungerEmployee[]>([]);

  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [riderSearch, setRiderSearch] = useState("");
  const [detailsMode, setDetailsMode] = useState<"all" | "top" | "weak">("all");

  useEffect(() => {
    loadReports();
    loadRecords();

    if (platform === "hunger") {
      loadRegisteredHungerEmployees();
    } else {
      setHungerEmployees([]);
    }
  }, [platform]);

  async function loadReports() {
    setLoadingReports(true);

    const { data, error } = await loadTodayReports(platform);

    if (error) {
      console.error(error);

      alert(
        isArabic
          ? "فشل تحميل حالة التقارير"
          : "Failed to load reports"
      );
    } else {
      setReports((data || []) as ReportItem[]);
    }

    setLoadingReports(false);
  }

  async function loadRecords() {
    setLoadingRecords(true);

    const { data, error } = await loadPerformanceRecords(platform);

    if (error) {
      console.error(error);

      alert(
        isArabic
          ? "فشل تحميل بيانات الأداء"
          : "Failed to load performance data"
      );
    } else {
      setRecords((data || []) as PerformanceRecord[]);
    }

    setLoadingRecords(false);
  }

  async function loadRegisteredHungerEmployees() {
    setLoadingEmployees(true);

    const { data, error } = await loadHungerEmployees();

    if (error) {
      console.error("Failed to load HungerStation employees:", error);
      setHungerEmployees([]);
    } else {
      setHungerEmployees((data || []) as HungerEmployee[]);
    }

    setLoadingEmployees(false);
  }

  async function handleUploadReport(
    reportType: "performance" | "distance",
    file: File
  ) {
    try {
      const result = await importPerformanceReport({
        platform,
        reportType,
        file,
      });

      alert(
        isArabic
          ? `تم استيراد التقرير بنجاح\nعدد السجلات: ${result.recordsCount}\nتمت المطابقة: ${result.matchedCount}`
          : `Report imported successfully\nRecords: ${result.recordsCount}\nMatched: ${result.matchedCount}`
      );

      await loadReports();
      await loadRecords();

      if (platform === "hunger") {
        await loadRegisteredHungerEmployees();
      }
    } catch (error: any) {
      console.error(error);

      alert(
        isArabic
          ? "فشل استيراد التقرير"
          : "Failed to import report"
      );
    }
  }


  async function refreshAllPerformanceData() {
    await Promise.all([
      loadReports(),
      loadRecords(),
      platform === "hunger"
        ? loadRegisteredHungerEmployees()
        : Promise.resolve(),
    ]);
  }


  /*
   * هنجرستيشن:
   * - تجميع أي سجلات مكررة لنفس Hunger ID.
   * - آخر Batch حسب أحدث report_date.
   * - إضافة الموظفين المسجل لهم Hunger ID وغير الموجودين في التقرير.
   */
  const hungerRows: HungerRow[] = useMemo(() => {
    const ridersMap = new Map<string, AggregatedRider>();

    records.forEach((record) => {
      const riderPlatformId = String(
        record.rider_platform_id || ""
      ).trim();

      if (!riderPlatformId) return;

      const parsedReportDate = record.report_date
        ? new Date(`${record.report_date}T00:00:00`).getTime()
        : 0;

      const reportDateTimestamp = Number.isNaN(parsedReportDate)
        ? 0
        : parsedReportDate;

      const existingRider = ridersMap.get(riderPlatformId);

      if (!existingRider) {
        ridersMap.set(riderPlatformId, {
          id: Number(riderPlatformId),
          name: record.rider_name || "-",

          batchNumber: Number(record.batch_number || 6),
          latestReportDate: reportDateTimestamp,

          completedDeliveries: Number(record.orders || 0),
          workingDays: Number(record.working_days || 0),
          workingHours: Number(record.working_hours || 0),

          totalKm: Number(record.total_km || 0),
          payableKm: Number(record.payable_km || 0),

          attendanceTotal: Number(record.attendance_rate || 0),
          acceptanceTotal: Number(record.acceptance_rate || 0),
          contactTotal: Number(record.contact_rate || 0),
          noShowTotal: Number(record.no_show_percent || 0),

          recordsCount: 1,
          inReport: true,
        });

        return;
      }

      existingRider.completedDeliveries += Number(record.orders || 0);
      existingRider.workingDays += Number(record.working_days || 0);
      existingRider.workingHours += Number(record.working_hours || 0);

      existingRider.totalKm += Number(record.total_km || 0);
      existingRider.payableKm += Number(record.payable_km || 0);

      existingRider.attendanceTotal += Number(
        record.attendance_rate || 0
      );

      existingRider.acceptanceTotal += Number(
        record.acceptance_rate || 0
      );

      existingRider.contactTotal += Number(record.contact_rate || 0);

      existingRider.noShowTotal += Number(
        record.no_show_percent || 0
      );

      existingRider.recordsCount += 1;

      if (record.rider_name) {
        existingRider.name = record.rider_name;
      }

      /*
       * آخر Batch حسب أحدث report_date.
       * بعد تجميع التقرير قبل الحفظ، يفترض وجود سجل واحد لكل مندوب.
       */
      if (reportDateTimestamp >= existingRider.latestReportDate) {
        existingRider.batchNumber = Number(
          record.batch_number || 6
        );

        existingRider.latestReportDate = reportDateTimestamp;
      }
    });

    /*
     * إضافة الموظفين المسجل لهم Hunger ID،
     * حتى إذا لم يظهروا في تقرير الأداء.
     */
    hungerEmployees.forEach((employee) => {
      const hungerId = String(employee.platform_id || "").trim();

      if (!hungerId || ridersMap.has(hungerId)) {
        return;
      }

      ridersMap.set(hungerId, {
        id: Number(hungerId),
        name: employee.name || "-",

        /*
         * صفر يعني أن الموظف ليس له Batch؛
         * لأنه لم يظهر في التقرير.
         */
        batchNumber: 0,
        latestReportDate: 0,

        completedDeliveries: 0,
        workingDays: 0,
        workingHours: 0,

        totalKm: 0,
        payableKm: 0,

        attendanceTotal: 0,
        acceptanceTotal: 0,
        contactTotal: 0,
        noShowTotal: 0,

        recordsCount: 1,
        inReport: false,
      });
    });

    return Array.from(ridersMap.values()).map((rider) => {
      const recordsCount = rider.recordsCount || 1;

      return {
        id: rider.id,
        name: rider.name,

        batchNumber: rider.batchNumber,
        completedDeliveries: rider.completedDeliveries,
        workingDays: rider.workingDays,

        attendanceRate: rider.inReport
          ? Math.round(rider.attendanceTotal / recordsCount)
          : 0,

        acceptanceRate: rider.inReport
          ? Math.round(rider.acceptanceTotal / recordsCount)
          : 0,

        contactRate: rider.inReport
          ? Math.round(rider.contactTotal / recordsCount)
          : 0,

        noShowPercent: rider.inReport
          ? Math.round(rider.noShowTotal / recordsCount)
          : 0,

        workingHours: Math.round(rider.workingHours),
        totalKm: Math.round(rider.totalKm),
        payableKm: Math.round(rider.payableKm),

        avgKm:
          rider.completedDeliveries > 0
            ? Math.round(rider.totalKm / rider.completedDeliveries)
            : 0,

        inReport: rider.inReport,
      };
    });
  }, [records, hungerEmployees]);

  /*
   * المناديب الموجودون فعليًا في تقرير هنجرستيشن.
   * نستخدمهم فقط في المستويات والمكافأة والدخل والإحصائيات التشغيلية.
   */
  const hungerReportRows = useMemo(() => {
    return hungerRows.filter((rider) => rider.inReport);
  }, [hungerRows]);

  const keetaRows: KeetaRow[] = useMemo(
    () =>
      records.map((record) => ({
        id: Number(record.rider_platform_id || 0),
        name: record.rider_name || "-",
        orders: Math.round(Number(record.orders || 0)),
        validDays: Math.round(Number(record.valid_days || 0)),
        onTime: Math.round(Number(record.on_time_rate || 0)),
        acceptance: Math.round(Number(record.acceptance_rate || 0)),
        status: record.eligible ? "valid" : "invalid",
      })),
    [records]
  );

  const topHungerRiders = useMemo(() => {
    return [...hungerReportRows]
      .sort((a, b) => {
        if (a.batchNumber !== b.batchNumber) {
          return a.batchNumber - b.batchNumber;
        }

        return b.completedDeliveries - a.completedDeliveries;
      })
      .slice(0, 5);
  }, [hungerReportRows]);

  const weakHungerRiders = useMemo(() => {
    return [...hungerReportRows]
      .sort((a, b) => {
        if (a.batchNumber !== b.batchNumber) {
          return b.batchNumber - a.batchNumber;
        }

        return a.completedDeliveries - b.completedDeliveries;
      })
      .slice(0, 5);
  }, [hungerReportRows]);

  const text = {
    rider: isArabic ? "المندوب" : "Rider",
    batchNumber: "Batch Number",
    level: isArabic ? "المستوى" : "Level",
    deliveries: isArabic ? "الطلبات" : "Deliveries",
    workingDays: isArabic ? "أيام العمل" : "Working Days",

    attendance: isArabic ? "الحضور" : "Attendance",
    acceptance: isArabic ? "القبول" : "Acceptance",
    contact: isArabic ? "التواصل" : "Contact",
    noShow: "No Show",

    hours: isArabic ? "الساعات" : "Hours",
    bonus: isArabic ? "المكافأة" : "Bonus",

    totalKm: isArabic
      ? "إجمالي الكيلومترات"
      : "Total KM",

    payableKm: isArabic
      ? "الكيلومترات المستحقة"
      : "Payable KM",

    avgKm: isArabic
      ? "متوسط كم / طلب"
      : "Avg KM / Order",

    validDays: isArabic
      ? "الأيام الصالحة"
      : "Valid Days",

    onTime: isArabic
      ? "التسليم في الوقت"
      : "On Time",

    status: isArabic ? "الحالة" : "Status",
    valid: isArabic ? "صالح" : "Valid",
    invalid: isArabic ? "غير صالح" : "Invalid",

    topRiders: isArabic
      ? "أفضل المناديب"
      : "Top Riders",

    weakRiders: isArabic
      ? "أضعف المناديب"
      : "Weak Riders",

    riderDetails: isArabic
      ? "تفاصيل أداء المناديب"
      : "Riders Performance Details",

    bonusTable: isArabic
      ? "مكافأة الجودة حسب المستوى"
      : "Quality Bonus By Level",

    levelDistribution: isArabic
      ? "توزيع المستويات"
      : "Level Distribution",

    reportStatus: isArabic
      ? "حالة التقرير"
      : "Report Status",
  };

  const hungerStats = useMemo(() => {
    const reportRidersCount = hungerReportRows.length;

    const safeReportRidersCount =
      reportRidersCount > 0 ? reportRidersCount : 1;

    const totalDeliveries = hungerReportRows.reduce(
      (sum, rider) => sum + rider.completedDeliveries,
      0
    );

    const avgAttendance =
      reportRidersCount > 0
        ? Math.round(
            hungerReportRows.reduce(
              (sum, rider) => sum + rider.attendanceRate,
              0
            ) / safeReportRidersCount
          )
        : 0;

    const avgAcceptance =
      reportRidersCount > 0
        ? Math.round(
            hungerReportRows.reduce(
              (sum, rider) => sum + rider.acceptanceRate,
              0
            ) / safeReportRidersCount
          )
        : 0;

    const totalHours = hungerReportRows.reduce(
      (sum, rider) => sum + rider.workingHours,
      0
    );

    const totalKm = hungerReportRows.reduce(
      (sum, rider) => sum + rider.totalKm,
      0
    );

    const payableKm = hungerReportRows.reduce(
      (sum, rider) => sum + rider.payableKm,
      0
    );

    const totalBonus = hungerReportRows.reduce(
      (sum, rider) =>
        sum +
        rider.completedDeliveries *
          qualityBonusByBatch(rider.batchNumber),
      0
    );

    const totalExpectedRevenue = hungerReportRows.reduce(
      (total, rider) => {
        const isLevelF = rider.batchNumber === 6;

        const orderRate = isLevelF ? 6 : 8;
        const kmRate = isLevelF ? 0.9 : 1.15;

        const riderQualityBonus =
          rider.completedDeliveries *
          qualityBonusByBatch(rider.batchNumber);

        const riderExpectedRevenue =
          rider.completedDeliveries * orderRate +
          rider.payableKm * kmRate +
          riderQualityBonus;

        return total + riderExpectedRevenue;
      },
      0
    );

    const missingRiders =
      hungerRows.length - hungerReportRows.length;

    return {
      /*
       * إجمالي المناديب المسجلين في النظام،
       * وليس الموجودين في التقرير فقط.
       */
      totalRiders: hungerRows.length,

      appearedRiders: hungerReportRows.length,
      missingRiders,

      totalDeliveries: Math.round(totalDeliveries),
      avgAttendance: Math.round(avgAttendance),
      avgAcceptance: Math.round(avgAcceptance),
      totalHours: Math.round(totalHours),
      totalKm: Math.round(totalKm),
      payableKm: Math.round(payableKm),
      totalBonus: Math.round(totalBonus),
      totalExpectedRevenue: Math.round(totalExpectedRevenue),
    };
  }, [hungerRows, hungerReportRows]);

  const keetaStats = useMemo(() => {
    const totalRiders = keetaRows.length;
    const safeTotalRiders = totalRiders > 0 ? totalRiders : 1;

    const totalOrders = keetaRows.reduce(
      (sum, rider) => sum + rider.orders,
      0
    );

    const valid = keetaRows.filter(
      (rider) => rider.status === "valid"
    ).length;

    const invalid = keetaRows.length - valid;

    const avgOnTime =
      totalRiders > 0
        ? Math.round(
            keetaRows.reduce(
              (sum, rider) => sum + rider.onTime,
              0
            ) / safeTotalRiders
          )
        : 0;

    const avgAcceptance =
      totalRiders > 0
        ? Math.round(
            keetaRows.reduce(
              (sum, rider) => sum + rider.acceptance,
              0
            ) / safeTotalRiders
          )
        : 0;

    return {
      totalRiders,
      totalOrders,
      valid,
      invalid,
      avgOnTime,
      avgAcceptance,
    };
  }, [keetaRows]);


  const latestReportDate = useMemo(() => {
    const dates = reports
      .map((report) => String(report.report_date || ""))
      .filter(Boolean)
      .sort();

    return dates.length > 0 ? dates[dates.length - 1] : null;
  }, [reports]);

  const uploadedReportTypes = useMemo(() => {
    return new Set(
      reports.map((report) => String(report.report_type || ""))
    );
  }, [reports]);

  const reportsCompleted =
    uploadedReportTypes.has("performance") &&
    uploadedReportTypes.has("distance");

  const visibleHungerRows = useMemo(() => {
    const query = riderSearch.trim().toLowerCase();

    let source = [...hungerRows];

    if (detailsMode === "top") {
      source = source
        .filter((rider) => rider.inReport)
        .sort((a, b) => {
          if (a.batchNumber !== b.batchNumber) {
            return a.batchNumber - b.batchNumber;
          }

          return b.completedDeliveries - a.completedDeliveries;
        })
        .slice(0, 10);
    }

    if (detailsMode === "weak") {
      source = source
        .sort((a, b) => {
          if (a.inReport !== b.inReport) {
            return a.inReport ? -1 : 1;
          }

          if (a.batchNumber !== b.batchNumber) {
            return b.batchNumber - a.batchNumber;
          }

          return a.completedDeliveries - b.completedDeliveries;
        })
        .slice(0, 10);
    }

    if (!query) return source;

    return source.filter((rider) => {
      return (
        String(rider.name || "").toLowerCase().includes(query) ||
        String(rider.id || "").toLowerCase().includes(query) ||
        String(rider.batchNumber || "").toLowerCase().includes(query)
      );
    });
  }, [hungerRows, riderSearch, detailsMode]);

  const visibleKeetaRows = useMemo(() => {
    const query = riderSearch.trim().toLowerCase();

    let source = [...keetaRows];

    if (detailsMode === "top") {
      source = source
        .filter((rider) => rider.status === "valid")
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 10);
    }

    if (detailsMode === "weak") {
      source = source
        .sort((a, b) => {
          if (a.status !== b.status) {
            return a.status === "invalid" ? -1 : 1;
          }

          return a.orders - b.orders;
        })
        .slice(0, 10);
    }

    if (!query) return source;

    return source.filter((rider) => {
      return (
        String(rider.name || "").toLowerCase().includes(query) ||
        String(rider.id || "").toLowerCase().includes(query)
      );
    });
  }, [keetaRows, riderSearch, detailsMode]);

  const isLoading =
    loadingReports || loadingRecords || loadingEmployees;

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="space-y-5 pb-10">
      {/* EXECUTIVE HEADER */}
      <section className="relative overflow-hidden rounded-[30px] bg-[#0b2340] text-white shadow-[0_20px_55px_rgba(15,35,64,0.22)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative p-5 md:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
                <Activity className="h-7 w-7" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black md:text-3xl">
                    {isArabic ? "مركز قيادة الأداء" : "Performance Command Center"}
                  </h1>

                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black text-cyan-100">
                    LIVE
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                  {isArabic
                    ? "صورة تشغيلية واضحة لأداء المناديب والتقارير والمستويات والإيرادات في شاشة واحدة."
                    : "A clear operational view of rider performance, reports, levels and revenue in one screen."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-slate-200">
                    <CalendarDays className="h-4 w-4 text-cyan-300" />
                    {latestReportDate
                      ? `${isArabic ? "آخر تقرير:" : "Latest report:"} ${formatPerformanceDate(latestReportDate, lang)}`
                      : isArabic
                        ? "لا يوجد تقرير مرفوع"
                        : "No report uploaded"}
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${
                      reportsCompleted
                        ? "bg-emerald-400/15 text-emerald-200"
                        : "bg-amber-400/15 text-amber-200"
                    }`}
                  >
                    {reportsCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {uploadedReportTypes.size}/2{" "}
                    {isArabic ? "تقارير مكتملة" : "reports ready"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <div className="grid min-w-[300px] grid-cols-2 rounded-2xl border border-white/10 bg-white/10 p-1.5 backdrop-blur">
                <button
                  type="button"
                  onClick={() => {
                    setPlatform("hunger");
                    setRiderSearch("");
                    setDetailsMode("all");
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    platform === "hunger"
                      ? "bg-white text-[#0b2340] shadow-lg"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  HungerStation
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlatform("keeta");
                    setRiderSearch("");
                    setDetailsMode("all");
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                    platform === "keeta"
                      ? "bg-white text-[#0b2340] shadow-lg"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Keeta
                </button>
              </div>

              <button
                type="button"
                onClick={refreshAllPerformanceData}
                disabled={isLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-extrabold text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isArabic ? "تحديث البيانات" : "Refresh Data"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REPORT HEALTH */}
      <section className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-black text-[#102a4c]">
                {isArabic ? "جاهزية البيانات" : "Data Readiness"}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {isArabic
                  ? "ارفع التقريرين وسيتم تحديث المؤشرات تلقائيًا."
                  : "Upload both reports and KPIs will refresh automatically."}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                reportsCompleted
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {reportsCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <FileSpreadsheet className="h-5 w-5" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
            <PremiumReportUpload
              title={isArabic ? "تقرير الأداء" : "Performance Report"}
              uploaded={uploadedReportTypes.has("performance")}
              report={getLatestReport(reports, "performance")}
              loading={loadingReports || loadingRecords}
              isArabic={isArabic}
              onUpload={(file) => handleUploadReport("performance", file)}
            />

            <PremiumReportUpload
              title={isArabic ? "تقرير الكيلومترات" : "Distance Report"}
              uploaded={uploadedReportTypes.has("distance")}
              report={getLatestReport(reports, "distance")}
              loading={loadingReports || loadingRecords}
              isArabic={isArabic}
              onUpload={(file) => handleUploadReport("distance", file)}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-400">
                {isArabic ? "حالة التحديث" : "Update Status"}
              </p>
              <h3 className="mt-1 text-lg font-black text-[#102a4c]">
                {isLoading
                  ? isArabic
                    ? "جاري معالجة البيانات"
                    : "Processing data"
                  : reportsCompleted
                    ? isArabic
                      ? "البيانات جاهزة للتحليل"
                      : "Data ready for analysis"
                    : isArabic
                      ? "بانتظار استكمال التقارير"
                      : "Waiting for reports"}
              </h3>
            </div>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isLoading
                  ? "bg-blue-50 text-blue-600"
                  : reportsCompleted
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
              }`}
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : reportsCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Clock3 className="h-5 w-5" />
              )}
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                reportsCompleted ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min(100, (uploadedReportTypes.size / 2) * 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>
              {isArabic ? "اكتمال التقارير" : "Report completion"}
            </span>
            <span className="text-[#102a4c]">
              {uploadedReportTypes.size}/2
            </span>
          </div>
        </div>
      </section>

      {/* EXECUTIVE KPI CARDS */}
      {platform === "hunger" ? (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-4">
            <ExecutiveKpi
              label={isArabic ? "إجمالي المناديب" : "Total Riders"}
              value={integerFormat(hungerStats.totalRiders)}
              icon={<Users className="h-5 w-5" />}
              accent="blue"
              foot={`${integerFormat(hungerStats.appearedRiders)} ${isArabic ? "ظهروا بالتقرير" : "in report"}`}
            />

            <ExecutiveKpi
              label={isArabic ? "إجمالي الطلبات" : "Total Deliveries"}
              value={integerFormat(hungerStats.totalDeliveries)}
              icon={<BarChart3 className="h-5 w-5" />}
              accent="indigo"
              foot={
                hungerStats.appearedRiders > 0
                  ? `${integerFormat(
                      hungerStats.totalDeliveries / hungerStats.appearedRiders
                    )} ${isArabic ? "طلب/مندوب" : "orders/rider"}`
                  : "-"
              }
            />

            <ExecutiveKpi
              label={isArabic ? "متوسط الحضور" : "Avg Attendance"}
              value={`${integerFormat(hungerStats.avgAttendance)}%`}
              icon={<UserCheck className="h-5 w-5" />}
              accent={hungerStats.avgAttendance >= 90 ? "green" : "amber"}
              foot={isArabic ? "متوسط التقرير" : "Report average"}
            />

            <ExecutiveKpi
              label={isArabic ? "متوسط القبول" : "Avg Acceptance"}
              value={`${integerFormat(hungerStats.avgAcceptance)}%`}
              icon={<Gauge className="h-5 w-5" />}
              accent={hungerStats.avgAcceptance >= 90 ? "green" : "amber"}
              foot={isArabic ? "قبول الطلبات" : "Order acceptance"}
            />
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <CompactMetric
              label={isArabic ? "غير موجودين" : "Missing"}
              value={integerFormat(hungerStats.missingRiders)}
              tone={hungerStats.missingRiders > 0 ? "red" : "green"}
            />
            <CompactMetric
              label={isArabic ? "إجمالي KM" : "Total KM"}
              value={integerFormat(hungerStats.totalKm)}
              tone="blue"
            />
            <CompactMetric
              label={isArabic ? "KM مستحق" : "Payable KM"}
              value={integerFormat(hungerStats.payableKm)}
              tone="green"
            />
            <CompactMetric
              label={isArabic ? "ساعات العمل" : "Work Hours"}
              value={integerFormat(hungerStats.totalHours)}
              tone="slate"
            />
            <CompactMetric
              label={isArabic ? "مكافأة الجودة" : "Quality Bonus"}
              value={`SAR ${integerFormat(hungerStats.totalBonus)}`}
              tone="indigo"
            />
            <CompactMetric
              label={isArabic ? "الدخل المتوقع" : "Expected Revenue"}
              value={`SAR ${integerFormat(hungerStats.totalExpectedRevenue)}`}
              tone="green"
            />
          </section>
        </>
      ) : (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <ExecutiveKpi
            label={isArabic ? "إجمالي المناديب" : "Total Riders"}
            value={integerFormat(keetaStats.totalRiders)}
            icon={<Users className="h-5 w-5" />}
            accent="blue"
            foot={isArabic ? "في التقرير الحالي" : "Current report"}
          />
          <ExecutiveKpi
            label={isArabic ? "إجمالي الطلبات" : "Total Orders"}
            value={integerFormat(keetaStats.totalOrders)}
            icon={<BarChart3 className="h-5 w-5" />}
            accent="indigo"
            foot={isArabic ? "طلبات التقرير" : "Report orders"}
          />
          <ExecutiveKpi
            label={isArabic ? "صالحون" : "Valid Riders"}
            value={integerFormat(keetaStats.valid)}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="green"
            foot={isArabic ? "محققون للشروط" : "Meeting conditions"}
          />
          <ExecutiveKpi
            label={isArabic ? "غير صالحين" : "Invalid Riders"}
            value={integerFormat(keetaStats.invalid)}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent={keetaStats.invalid > 0 ? "red" : "green"}
            foot={isArabic ? "يحتاجون متابعة" : "Need attention"}
          />
          <ExecutiveKpi
            label={isArabic ? "الالتزام بالوقت" : "Avg On-Time"}
            value={`${integerFormat(keetaStats.avgOnTime)}%`}
            icon={<Clock3 className="h-5 w-5" />}
            accent={keetaStats.avgOnTime >= 90 ? "green" : "amber"}
            foot={isArabic ? "التسليم في الوقت" : "On-time delivery"}
          />
          <ExecutiveKpi
            label={isArabic ? "متوسط القبول" : "Avg Acceptance"}
            value={`${integerFormat(keetaStats.avgAcceptance)}%`}
            icon={<Gauge className="h-5 w-5" />}
            accent={keetaStats.avgAcceptance >= 90 ? "green" : "amber"}
            foot={isArabic ? "قبول الطلبات" : "Order acceptance"}
          />
        </section>
      )}

      {/* TOP / WEAK */}
      {platform === "hunger" ? (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            <PremiumPanel
              title={text.topRiders}
              subtitle={
                isArabic
                  ? "أفضل 5 مناديب حسب المستوى ثم عدد الطلبات"
                  : "Top 5 riders by level then deliveries"
              }
              icon={<TrendingUp className="h-5 w-5" />}
              tone="green"
            >
              <HungerMiniTable rows={topHungerRiders} />
            </PremiumPanel>

            <PremiumPanel
              title={text.weakRiders}
              subtitle={
                isArabic
                  ? "أضعف 5 مناديب ويحتاجون متابعة تشغيلية"
                  : "Weakest 5 riders needing operational attention"
              }
              icon={<AlertTriangle className="h-5 w-5" />}
              tone="red"
            >
              <HungerMiniTable rows={weakHungerRiders} />
            </PremiumPanel>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <PremiumPanel
              title={text.bonusTable}
              subtitle={
                isArabic
                  ? "قيمة مكافأة الجودة حسب مستوى المندوب"
                  : "Quality bonus value by rider level"
              }
              icon={<Wallet className="h-5 w-5" />}
              tone="blue"
            >
              <PremiumLevelBonus isArabic={isArabic} />
            </PremiumPanel>

            <PremiumPanel
              title={text.levelDistribution}
              subtitle={
                isArabic
                  ? "توزيع المستويات للموجودين في التقرير"
                  : "Level distribution for riders in report"
              }
              icon={<BarChart3 className="h-5 w-5" />}
              tone="blue"
            >
              <PremiumLevelDistribution
                rows={hungerReportRows}
                isArabic={isArabic}
              />
            </PremiumPanel>
          </div>
        </>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <PremiumPanel
            title={text.topRiders}
            subtitle={
              isArabic
                ? "المناديب المحققون للشروط"
                : "Riders meeting conditions"
            }
            icon={<TrendingUp className="h-5 w-5" />}
            tone="green"
          >
            <KeetaMiniTable
              rows={keetaRows.filter((rider) => rider.status === "valid")}
              text={text}
            />
          </PremiumPanel>

          <PremiumPanel
            title={text.weakRiders}
            subtitle={
              isArabic
                ? "المناديب غير المحققين للشروط"
                : "Riders needing attention"
            }
            icon={<AlertTriangle className="h-5 w-5" />}
            tone="red"
          >
            <KeetaMiniTable
              rows={keetaRows.filter((rider) => rider.status === "invalid")}
              text={text}
            />
          </PremiumPanel>
        </div>
      )}

      {/* DETAILS */}
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#102a4c]">
              {text.riderDetails}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {isArabic
                ? "بحث سريع وترتيب مباشر مع الحفاظ على البيانات الأصلية."
                : "Fast search and ranking while preserving source data."}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <FilterButton
                active={detailsMode === "all"}
                onClick={() => setDetailsMode("all")}
                label={isArabic ? "الكل" : "All"}
              />
              <FilterButton
                active={detailsMode === "top"}
                onClick={() => setDetailsMode("top")}
                label={isArabic ? "الأفضل" : "Top"}
              />
              <FilterButton
                active={detailsMode === "weak"}
                onClick={() => setDetailsMode("weak")}
                label={isArabic ? "الأضعف" : "Weak"}
              />
            </div>

            <div className="relative min-w-[280px]">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isArabic ? "right-3.5" : "left-3.5"
                }`}
              />

              <input
                value={riderSearch}
                onChange={(event) => setRiderSearch(event.target.value)}
                placeholder={
                  isArabic ? "ابحث بالاسم أو ID..." : "Search name or ID..."
                }
                className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
                  isArabic ? "pr-10 pl-9" : "pl-10 pr-9"
                }`}
              />

              {riderSearch && (
                <button
                  type="button"
                  onClick={() => setRiderSearch("")}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 ${
                    isArabic ? "left-3" : "right-3"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>
                {isArabic ? "عدد النتائج:" : "Results:"}
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 font-black text-[#102a4c] shadow-sm">
                {platform === "hunger"
                  ? visibleHungerRows.length
                  : visibleKeetaRows.length}
              </span>
            </div>

            <div className="text-[11px] font-bold text-slate-400">
              {detailsMode === "all"
                ? isArabic
                  ? "عرض جميع المناديب"
                  : "Showing all riders"
                : detailsMode === "top"
                  ? isArabic
                    ? "أفضل 10 مناديب"
                    : "Top 10 riders"
                  : isArabic
                    ? "أضعف 10 مناديب"
                    : "Weakest 10 riders"}
            </div>
          </div>

          {platform === "hunger" ? (
            <PremiumHungerDetailsTable
              rows={visibleHungerRows}
              isArabic={isArabic}
            />
          ) : (
            <PremiumKeetaDetailsTable
              rows={visibleKeetaRows}
              isArabic={isArabic}
            />
          )}
        </div>
      </section>
    </div>
  );
}


function PremiumHungerDetailsTable({
  rows,
  isArabic,
}: {
  rows: HungerRow[];
  isArabic: boolean;
}) {
  type DailyRecord = {
    work_date: string;
    completed_deliveries: number;
    total_km: number;
    payable_km: number;
    avg_km: number;
  };

  type DailyDisplayRow = {
    date: string;
    worked: boolean;
    completedDeliveries: number;
    totalKm: number;
    payableKm: number;
    avgKm: number;
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dailyRowsByRider, setDailyRowsByRider] = useState<
    Record<string, DailyDisplayRow[]>
  >({});
  const [loadingRiderId, setLoadingRiderId] = useState<number | null>(null);

  async function toggleRider(rider: HungerRow) {
    if (expandedId === rider.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(rider.id);

    if (dailyRowsByRider[String(rider.id)]) {
      return;
    }

    await loadDailyRider(rider.id);
  }

  async function loadDailyRider(riderId: number) {
    setLoadingRiderId(riderId);

    try {
      const reportMonth = getCurrentPerformanceMonth();

      const { data: riderData, error: riderError } = await supabase
        .from("hunger_daily_performance")
        .select(
          "work_date, completed_deliveries, total_km, payable_km, avg_km"
        )
        .eq("report_month", reportMonth)
        .eq("rider_platform_id", String(riderId))
        .order("work_date", { ascending: true });

      if (riderError) throw riderError;

      const { data: reportDates, error: datesError } = await supabase
        .from("hunger_daily_performance")
        .select("work_date")
        .eq("report_month", reportMonth)
        .order("work_date", { ascending: true });

      if (datesError) throw datesError;

      const dates = (reportDates || [])
        .map((row: any) => String(row.work_date || ""))
        .filter(Boolean);

      if (!dates.length) {
        setDailyRowsByRider((current) => ({
          ...current,
          [String(riderId)]: [],
        }));
        return;
      }

      const uniqueDates = Array.from(new Set(dates)).sort();
      const firstDate = uniqueDates[0];
      const lastDate = uniqueDates[uniqueDates.length - 1];

      const riderMap = new Map<string, DailyRecord>();

      (riderData || []).forEach((row: any) => {
        riderMap.set(String(row.work_date), {
          work_date: String(row.work_date),
          completed_deliveries: Number(row.completed_deliveries || 0),
          total_km: Number(row.total_km || 0),
          payable_km: Number(row.payable_km || 0),
          avg_km: Number(row.avg_km || 0),
        });
      });

      const allDates = generatePerformanceDateRange(firstDate, lastDate);

      const displayRows: DailyDisplayRow[] = allDates.map((date) => {
        const record = riderMap.get(date);
        const deliveries = Number(record?.completed_deliveries || 0);

        return {
          date,
          worked: deliveries > 0,
          completedDeliveries: Math.round(deliveries),
          totalKm: Math.round(Number(record?.total_km || 0)),
          payableKm: Math.round(Number(record?.payable_km || 0)),
          avgKm: Math.round(Number(record?.avg_km || 0)),
        };
      });

      setDailyRowsByRider((current) => ({
        ...current,
        [String(riderId)]: displayRows,
      }));
    } catch (error) {
      console.error("LOAD DAILY HUNGER PERFORMANCE ERROR:", error);

      setDailyRowsByRider((current) => ({
        ...current,
        [String(riderId)]: [],
      }));
    } finally {
      setLoadingRiderId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
        <Search className="h-6 w-6 text-slate-300" />
        <p className="mt-3 text-sm font-black text-slate-500">
          {isArabic ? "لا توجد نتائج مطابقة" : "No matching riders"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#102a4c] text-white">
              <PremiumTh className="min-w-[330px]">{isArabic ? "المندوب" : "Rider"}</PremiumTh>
              <PremiumTh align="center">Batch</PremiumTh>
              <PremiumTh align="center">{isArabic ? "المستوى" : "Level"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "الطلبات" : "Orders"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "أيام العمل" : "Days"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "الحضور" : "Attendance"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "القبول" : "Acceptance"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "التواصل" : "Contact"}</PremiumTh>
              <PremiumTh align="center">No Show</PremiumTh>
              <PremiumTh align="center">{isArabic ? "الساعات" : "Hours"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "إجمالي KM" : "Total KM"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "KM مستحق" : "Payable KM"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "متوسط KM" : "Avg KM"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "المكافأة" : "Bonus"}</PremiumTh>
            </tr>
          </thead>

          <tbody>
            {rows.map((rider, index) => {
              const level = getHungerLevel(rider.batchNumber);
              const bonus = Math.round(
                rider.completedDeliveries *
                  qualityBonusByBatch(rider.batchNumber)
              );
              const isExpanded = expandedId === rider.id;
              const dailyRows = dailyRowsByRider[String(rider.id)] || [];

              return (
                <Fragment key={rider.id}>
                  <tr
                    className={`border-b border-slate-100 transition ${
                      !rider.inReport
                        ? "bg-red-50/35"
                        : index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/45"
                    } hover:bg-blue-50/50`}
                  >
                    <td className="min-w-[330px] px-4 py-3.5 align-middle">
                      <button
                        type="button"
                        onClick={() => toggleRider(rider)}
                        className="flex w-full items-start gap-3 text-start"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <ChevronDown
                            className={`h-4 w-4 transition ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </span>

                        <span className="min-w-0">
                          <span className="block max-w-[300px] whitespace-normal break-words text-sm font-black leading-5 text-[#102a4c]">
                            {rider.name}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-bold text-slate-400">
                            ID: {integerFormat(rider.id)}
                          </span>
                        </span>
                      </button>
                    </td>

                    <PremiumTd strong align="center">
                      {rider.batchNumber > 0
                        ? integerFormat(rider.batchNumber)
                        : "-"}
                    </PremiumTd>

                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`inline-flex min-w-8 justify-center rounded-lg px-2 py-1 text-[11px] font-black ${levelClass(
                          level
                        )}`}
                      >
                        {level}
                      </span>
                    </td>

                    <PremiumTd strong align="center">
                      {integerFormat(rider.completedDeliveries)}
                    </PremiumTd>
                    <PremiumTd align="center">
                      {integerFormat(rider.workingDays)}
                    </PremiumTd>
                    <RateCell value={rider.attendanceRate} />
                    <RateCell value={rider.acceptanceRate} />
                    <RateCell value={rider.contactRate} />
                    <RateCell value={rider.noShowPercent} inverse />
                    <PremiumTd align="center">
                      {integerFormat(rider.workingHours)}
                    </PremiumTd>
                    <PremiumTd align="center">
                      {integerFormat(rider.totalKm)}
                    </PremiumTd>
                    <PremiumTd strong align="center">
                      {integerFormat(rider.payableKm)}
                    </PremiumTd>
                    <PremiumTd align="center">
                      {integerFormat(rider.avgKm)}
                    </PremiumTd>

                    <td className="px-3 py-3.5 text-center">
                      <span className="font-black text-emerald-600">
                        SAR {integerFormat(bonus)}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="border-b border-blue-100 bg-[#f7fbff]">
                      <td colSpan={14} className="p-0">
                        <DailyPerformancePremium
                          rows={dailyRows}
                          loading={loadingRiderId === rider.id}
                          isArabic={isArabic}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DailyPerformancePremium({
  rows,
  loading,
  isArabic,
}: {
  rows: {
    date: string;
    worked: boolean;
    completedDeliveries: number;
    totalKm: number;
    payableKm: number;
    avgKm: number;
  }[];
  loading: boolean;
  isArabic: boolean;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[170px] items-center justify-center gap-3 p-5 text-sm font-black text-blue-700">
        <RefreshCw className="h-4 w-4 animate-spin" />
        {isArabic ? "جاري تحميل الأداء اليومي..." : "Loading daily performance..."}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="p-8 text-center text-sm font-black text-slate-400">
        {isArabic
          ? "لا توجد تفاصيل يومية لهذا المندوب"
          : "No daily details for this rider"}
      </div>
    );
  }

  const workedDays = rows.filter((row) => row.worked).length;
  const absentDays = rows.length - workedDays;
  const totalDeliveries = rows.reduce(
    (sum, row) => sum + row.completedDeliveries,
    0
  );

  return (
    <div className="p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <h4 className="text-sm font-black text-[#102a4c]">
              {isArabic ? "الأداء اليومي للمندوب" : "Rider Daily Performance"}
            </h4>
            <p className="mt-0.5 text-[10px] font-bold text-slate-400">
              {isArabic
                ? "الأيام من أول تاريخ حتى آخر تاريخ موجود في التقرير"
                : "Days from first to latest report date"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <DailySummaryChip
            label={isArabic ? "عمل" : "Worked"}
            value={workedDays}
            tone="green"
          />
          <DailySummaryChip
            label={isArabic ? "غياب" : "Absent"}
            value={absentDays}
            tone="red"
          />
          <DailySummaryChip
            label={isArabic ? "طلبات" : "Orders"}
            value={totalDeliveries}
            tone="blue"
          />
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))",
        }}
      >
        {rows.map((row) => (
          <div
            key={row.date}
            className={`rounded-2xl border p-2.5 shadow-sm transition ${
              row.worked
                ? "border-emerald-200 bg-emerald-50/75"
                : "border-red-200 bg-red-50/70"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[11px] font-black ${
                  row.worked ? "text-emerald-800" : "text-red-700"
                }`}
              >
                {formatDailyPerformanceDate(row.date, isArabic)}
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  row.worked ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
            </div>

            <p
              className={`mt-1 text-[10px] font-black ${
                row.worked ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {row.worked
                ? isArabic
                  ? "عمل"
                  : "Worked"
                : isArabic
                  ? "غياب"
                  : "Absent"}
            </p>

            <div className="mt-2 space-y-1.5 rounded-xl bg-white/90 p-2">
              <DailyLine
                icon={<PackageCheck className="h-3 w-3" />}
                label={isArabic ? "طلب" : "Orders"}
                value={integerFormat(row.completedDeliveries)}
              />

              {row.worked && (
                <>
                  <DailyLine
                    icon={<Route className="h-3 w-3" />}
                    label={isArabic ? "إجمالي KM" : "Total KM"}
                    value={integerFormat(row.totalKm)}
                  />
                  <DailyLine
                    icon={<MapPinned className="h-3 w-3" />}
                    label={isArabic ? "KM مستحق" : "Payable KM"}
                    value={integerFormat(row.payableKm)}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailySummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "blue";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div className={`rounded-xl border px-3 py-2 text-center ${tones[tone]}`}>
      <p className="text-[9px] font-black opacity-70">{label}</p>
      <p className="mt-0.5 text-sm font-black">{integerFormat(value)}</p>
    </div>
  );
}

function DailyLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
        {icon}
        {label}
      </span>
      <strong className="text-[10px] text-[#102a4c]">{value}</strong>
    </div>
  );
}

function getCurrentPerformanceMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function generatePerformanceDateRange(
  startDate: string,
  endDate: string
) {
  const result: string[] = [];

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return result;
  }

  const current = new Date(start);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");

    result.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return result;
}

function formatDailyPerformanceDate(
  value: string,
  isArabic: boolean
) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(isArabic ? "ar-SA" : "en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function PremiumKeetaDetailsTable({
  rows,
  isArabic,
}: {
  rows: KeetaRow[];
  isArabic: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
        <Search className="h-6 w-6 text-slate-300" />
        <p className="mt-3 text-sm font-black text-slate-500">
          {isArabic ? "لا توجد نتائج مطابقة" : "No matching riders"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#102a4c] text-white">
              <PremiumTh className="min-w-[330px]">{isArabic ? "المندوب" : "Rider"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "الطلبات" : "Orders"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "الأيام الصالحة" : "Valid Days"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "في الوقت" : "On Time"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "القبول" : "Acceptance"}</PremiumTh>
              <PremiumTh align="center">{isArabic ? "الحالة" : "Status"}</PremiumTh>
            </tr>
          </thead>

          <tbody>
            {rows.map((rider, index) => (
              <tr
                key={rider.id}
                className={`border-b border-slate-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/45"
                } hover:bg-blue-50/50`}
              >
                <td className="min-w-[330px] px-4 py-3.5">
                  <p className="max-w-[300px] whitespace-normal break-words text-sm font-black leading-5 text-[#102a4c]">
                    {rider.name}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                    ID: {integerFormat(rider.id)}
                  </p>
                </td>
                <PremiumTd strong align="center">
                  {integerFormat(rider.orders)}
                </PremiumTd>
                <PremiumTd align="center">
                  {integerFormat(rider.validDays)}
                </PremiumTd>
                <RateCell value={rider.onTime} />
                <RateCell value={rider.acceptance} />
                <td className="px-3 py-3.5 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${
                      rider.status === "valid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {rider.status === "valid"
                      ? isArabic
                        ? "صالح"
                        : "Valid"
                      : isArabic
                        ? "غير صالح"
                        : "Invalid"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PremiumTh({
  children,
  align = "start",
  className = "",
}: {
  children: React.ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-3.5 text-[11px] font-black ${
        align === "center" ? "text-center" : "text-start"
      } ${className}`}
    >
      {children}
    </th>
  );
}

function PremiumTd({
  children,
  strong = false,
  align = "start",
}: {
  children: React.ReactNode;
  strong?: boolean;
  align?: "start" | "center";
}) {
  return (
    <td
      className={`whitespace-nowrap px-3 py-3.5 text-sm ${
        strong ? "font-black text-[#102a4c]" : "font-bold text-slate-600"
      } ${align === "center" ? "text-center" : "text-start"}`}
    >
      {children}
    </td>
  );
}

function RateCell({
  value,
  inverse = false,
}: {
  value: number;
  inverse?: boolean;
}) {
  const rounded = Math.round(Number(value || 0));

  const good = inverse ? rounded <= 1 : rounded >= 95;
  const warning = inverse
    ? rounded > 1 && rounded <= 3
    : rounded >= 85 && rounded < 95;

  const cls = good
    ? "text-emerald-600"
    : warning
      ? "text-amber-600"
      : "text-red-600";

  return (
    <td className={`px-3 py-3.5 text-center text-sm font-black ${cls}`}>
      {integerFormat(rounded)}%
    </td>
  );
}

function MiniDetail({
  label,
  value,
  good = false,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white bg-white/80 px-3 py-2.5 shadow-sm">
      <p className="text-[10px] font-bold text-slate-400">{label}</p>
      <p
        className={`mt-1 text-sm font-black ${
          good ? "text-emerald-700" : "text-[#102a4c]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function getHungerLevel(batchNumber: number) {
  const map: Record<number, string> = {
    1: "A",
    2: "B",
    3: "C",
    4: "D",
    5: "E",
    6: "F",
  };

  return map[Math.round(Number(batchNumber || 0))] || "-";
}

function levelClass(level: string) {
  const map: Record<string, string> = {
    A: "bg-emerald-50 text-emerald-700",
    B: "bg-blue-50 text-blue-700",
    C: "bg-cyan-50 text-cyan-700",
    D: "bg-amber-50 text-amber-700",
    E: "bg-orange-50 text-orange-700",
    F: "bg-red-50 text-red-700",
  };

  return map[level] || "bg-slate-100 text-slate-600";
}

function PremiumLevelBonus({
  isArabic,
}: {
  isArabic: boolean;
}) {
  const levels = [
    { level: "A", batch: 1, bonus: 2.75 },
    { level: "B", batch: 2, bonus: 2.25 },
    { level: "C", batch: 3, bonus: 1.75 },
    { level: "D", batch: 4, bonus: 1.25 },
    { level: "E", batch: 5, bonus: 0.75 },
    { level: "F", batch: 6, bonus: 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {levels.map((item) => (
        <div
          key={item.level}
          className="group rounded-2xl border border-slate-100 bg-slate-50/80 p-3 transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${levelClass(
                item.level
              )}`}
            >
              {item.level}
            </span>

            <span className="text-[9px] font-black text-slate-400">
              Batch {item.batch}
            </span>
          </div>

          <p className="mt-3 text-[10px] font-bold text-slate-400">
            {isArabic ? "مكافأة لكل طلب" : "Bonus / order"}
          </p>

          <p className="mt-1 text-xl font-black text-emerald-700">
            {item.bonus.toFixed(2)}{" "}
            <span className="text-[10px]">SAR</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function PremiumLevelDistribution({
  rows,
  isArabic,
}: {
  rows: HungerRow[];
  isArabic: boolean;
}) {
  const levels = ["A", "B", "C", "D", "E", "F"];

  const distribution = levels.map((level) => {
    const count = rows.filter(
      (rider) => getHungerLevel(rider.batchNumber) === level
    ).length;

    return {
      level,
      count,
      percentage:
        rows.length > 0 ? Math.round((count / rows.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {distribution.map((item) => (
          <div
            key={item.level}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center"
          >
            <span
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${levelClass(
                item.level
              )}`}
            >
              {item.level}
            </span>

            <p className="mt-2 text-xl font-black text-[#102a4c]">
              {integerFormat(item.count)}
            </p>

            <p className="mt-0.5 text-[9px] font-bold text-slate-400">
              {item.percentage}%
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-3">
          {distribution.map((item) =>
            item.percentage > 0 ? (
              <div
                key={item.level}
                style={{ width: `${item.percentage}%` }}
                className={levelBarClass(item.level)}
                title={`${item.level}: ${item.count}`}
              />
            ) : null
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
        <span>
          {isArabic ? "إجمالي المناديب في التقرير" : "Riders in report"}
        </span>
        <span className="font-black text-[#102a4c]">
          {integerFormat(rows.length)}
        </span>
      </div>
    </div>
  );
}

function levelBarClass(level: string) {
  const map: Record<string, string> = {
    A: "bg-emerald-500",
    B: "bg-blue-500",
    C: "bg-cyan-500",
    D: "bg-amber-500",
    E: "bg-orange-500",
    F: "bg-red-500",
  };

  return map[level] || "bg-slate-400";
}

function PremiumReportUpload({
  title,
  uploaded,
  report,
  loading,
  isArabic,
  onUpload,
}: {
  title: string;
  uploaded: boolean;
  report?: ReportItem;
  loading: boolean;
  isArabic: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div
      className={`group rounded-[20px] border p-4 transition ${
        uploaded
          ? "border-emerald-100 bg-emerald-50/50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
            uploaded
              ? "bg-white text-emerald-600"
              : "bg-white text-blue-600"
          }`}
        >
          {uploaded ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <FileSpreadsheet className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-black text-[#102a4c]">
              {title}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                uploaded
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {uploaded
                ? isArabic
                  ? "مرفوع"
                  : "Uploaded"
                : isArabic
                  ? "مطلوب"
                  : "Required"}
            </span>
          </div>

          <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
            {report?.file_name ||
              (isArabic ? "لم يتم رفع ملف بعد" : "No file uploaded yet")}
          </p>

          {report && (
            <p className="mt-1 text-[10px] font-extrabold text-slate-500">
              {integerFormat(Number(report.records_count || 0))}{" "}
              {isArabic ? "سجل" : "records"}
            </p>
          )}
        </div>

        <label
          className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[11px] font-black transition ${
            loading
              ? "pointer-events-none bg-slate-200 text-slate-400"
              : uploaded
                ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          {uploaded
            ? isArabic
              ? "استبدال"
              : "Replace"
            : isArabic
              ? "رفع التقرير"
              : "Upload"}

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUpload(file);
                event.currentTarget.value = "";
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}

function ExecutiveKpi({
  label,
  value,
  foot,
  icon,
  accent,
}: {
  label: string;
  value: string;
  foot: string;
  icon: React.ReactNode;
  accent: "blue" | "indigo" | "green" | "amber" | "red" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black text-slate-400">
            {label}
          </p>
          <p className="mt-2 truncate text-[28px] font-black tracking-tight text-[#102a4c]">
            {value}
          </p>
          <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
            {foot}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${tones[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function CompactMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "indigo" | "green" | "red" | "slate";
}) {
  const tones = {
    blue: "text-blue-700",
    indigo: "text-indigo-700",
    green: "text-emerald-700",
    red: "text-red-700",
    slate: "text-slate-700",
  };

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-black text-slate-400">{label}</p>
      <p className={`mt-1.5 truncate text-xl font-black ${tones[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function PremiumPanel({
  title,
  subtitle,
  icon,
  children,
  tone,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone: "blue" | "green" | "red";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-black text-[#102a4c]">{title}</h2>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition ${
        active
          ? "bg-white text-blue-700 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function getLatestReport(
  reports: ReportItem[],
  type: "performance" | "distance"
) {
  return [...reports]
    .filter((report) => report.report_type === type)
    .sort((a, b) =>
      String(b.uploaded_at || "").localeCompare(
        String(a.uploaded_at || "")
      )
    )[0];
}

function formatPerformanceDate(
  value: string,
  lang: "ar" | "en"
) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    lang === "ar" ? "ar-SA" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function integerFormat(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);

  return Math.round(numberValue).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}
