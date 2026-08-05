"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout, { useLanguage } from "../../../components/AppLayout";

import Header from "./components/Header";
import PlatformTabs from "./components/PlatformTabs";
import DashboardCards from "./components/DashboardCards";
import UploadReports from "./components/UploadReports";
import LevelBonusTable from "./components/LevelBonusTable";
import LevelDistribution from "./components/LevelDistribution";
import HungerMiniTable from "./components/HungerMiniTable";
import KeetaMiniTable from "./components/KeetaMiniTable";
import HungerDetailsTable from "./components/HungerDetailsTable";
import KeetaDetailsTable from "./components/KeetaDetailsTable";

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
          ? Number(
              (
                rider.attendanceTotal / recordsCount
              ).toFixed(2)
            )
          : 0,

        acceptanceRate: rider.inReport
          ? Number(
              (
                rider.acceptanceTotal / recordsCount
              ).toFixed(2)
            )
          : 0,

        contactRate: rider.inReport
          ? Number(
              (
                rider.contactTotal / recordsCount
              ).toFixed(2)
            )
          : 0,

        noShowPercent: rider.inReport
          ? Number(
              (
                rider.noShowTotal / recordsCount
              ).toFixed(2)
            )
          : 0,

        workingHours: Number(rider.workingHours.toFixed(2)),
        totalKm: Number(rider.totalKm.toFixed(2)),
        payableKm: Number(rider.payableKm.toFixed(2)),

        avgKm:
          rider.completedDeliveries > 0
            ? Number(
                (
                  rider.totalKm /
                  rider.completedDeliveries
                ).toFixed(2)
              )
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
        orders: Number(record.orders || 0),
        validDays: Number(record.valid_days || 0),
        onTime: Number(record.on_time_rate || 0),
        acceptance: Number(record.acceptance_rate || 0),
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

      totalDeliveries,
      avgAttendance,
      avgAcceptance,
      totalHours,
      totalKm,
      payableKm,
      totalBonus,
      totalExpectedRevenue,
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

  const isLoading =
    loadingReports || loadingRecords || loadingEmployees;

  return (
    <div className="space-y-6">
      <Header isArabic={isArabic} />

      <PlatformTabs
        platform={platform}
        onChange={setPlatform}
        isArabic={isArabic}
      />

      <UploadReports
        platform={platform}
        isArabic={isArabic}
        reports={reports}
        onUpload={handleUploadReport}
      />

      {isLoading && (
        <div className="rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700">
          {isArabic
            ? "جاري تحديث البيانات..."
            : "Updating data..."}
        </div>
      )}

      <DashboardCards
        platform={platform}
        isArabic={isArabic}
        hungerStats={hungerStats}
        keetaStats={keetaStats}
      />

      {platform === "hunger" ? (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            <Card title={text.bonusTable}>
              <LevelBonusTable />
            </Card>

            <Card title={text.levelDistribution}>
              <LevelDistribution
                /*
                 * توزيع المستويات يعرض الموجودين
                 * في التقرير فقط.
                 */
                rows={hungerReportRows}
                isArabic={isArabic}
              />
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card title={text.topRiders}>
              <HungerMiniTable rows={topHungerRiders} />
            </Card>

            <Card title={text.weakRiders} danger>
              <HungerMiniTable rows={weakHungerRiders} />
            </Card>
          </div>

          <Card title={text.riderDetails}>
            {/*
             * جدول التفاصيل يعرض جميع المسجلين:
             * الموجودين في التقرير وغير الموجودين.
             */}
            <HungerDetailsTable
              rows={hungerRows}
              text={text}
            />
          </Card>
        </>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            <Card title={text.topRiders}>
              <KeetaMiniTable
                rows={keetaRows.filter(
                  (rider) => rider.status === "valid"
                )}
                text={text}
              />
            </Card>

            <Card title={text.weakRiders} danger>
              <KeetaMiniTable
                rows={keetaRows.filter(
                  (rider) => rider.status === "invalid"
                )}
                text={text}
              />
            </Card>
          </div>

          <Card title={text.riderDetails}>
            <KeetaDetailsTable
              rows={keetaRows}
              text={text}
            />
          </Card>
        </>
      )}
    </div>
  );
}

function Card({
  title,
  children,
  danger,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2
        className={`mb-5 text-xl font-black ${
          danger ? "text-red-600" : "text-[#0f2544]"
        }`}
      >
        {title}
      </h2>

      {children}
    </section>
  );
}