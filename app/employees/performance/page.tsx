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

import { HungerRow, KeetaRow, PerformanceRecord, Platform } from "./types";
import { qualityBonusByBatch } from "./utils";
import {
  importPerformanceReport,
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
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    loadReports();
    loadRecords();
  }, [platform]);

  async function loadReports() {
    setLoadingReports(true);
    const { data, error } = await loadTodayReports(platform);

    if (error) {
      console.error(error);
      alert(isArabic ? "فشل تحميل حالة التقارير" : "Failed to load reports");
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
      alert(isArabic ? "فشل تحميل بيانات الأداء" : "Failed to load performance data");
    } else {
      setRecords((data || []) as PerformanceRecord[]);
    }

    setLoadingRecords(false);
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
    } catch (error: any) {
      console.error(error);
      alert(isArabic ? "فشل استيراد التقرير" : "Failed to import report");
    }
  }

  const hungerRows: HungerRow[] = useMemo(
    () =>
      records.map((r) => ({
        id: Number(r.rider_platform_id || 0),
        name: r.rider_name || "-",
        batchNumber: Number(r.batch_number || 6),
        completedDeliveries: Number(r.orders || 0),
        attendanceRate: Number(r.attendance_rate || 0),
        acceptanceRate: Number(r.acceptance_rate || 0),
        contactRate: Number(r.contact_rate || 0),
        noShowPercent: Number(r.no_show_percent || 0),
        workingHours: Number(r.working_hours || 0),
        totalKm: Number(r.total_km || 0),
        payableKm: Number(r.payable_km || 0),
        avgKm: Number(r.avg_km || 0),
      })),
    [records]
  );

  const keetaRows: KeetaRow[] = useMemo(
    () =>
      records.map((r) => ({
        id: Number(r.rider_platform_id || 0),
        name: r.rider_name || "-",
        orders: Number(r.orders || 0),
        validDays: Number(r.valid_days || 0),
        onTime: Number(r.on_time_rate || 0),
        acceptance: Number(r.acceptance_rate || 0),
        status: r.eligible ? "valid" : "invalid",
      })),
    [records]
  );

  const text = {
    rider: isArabic ? "المندوب" : "Rider",
    batchNumber: "Batch Number",
    level: isArabic ? "المستوى" : "Level",
    deliveries: isArabic ? "الطلبات" : "Deliveries",
    attendance: isArabic ? "الحضور" : "Attendance",
    acceptance: isArabic ? "القبول" : "Acceptance",
    contact: isArabic ? "التواصل" : "Contact",
    noShow: "No Show",
    hours: isArabic ? "الساعات" : "Hours",
    bonus: isArabic ? "المكافأة" : "Bonus",
    totalKm: isArabic ? "إجمالي الكيلومترات" : "Total KM",
    payableKm: isArabic ? "الكيلومترات المستحقة" : "Payable KM",
    avgKm: isArabic ? "متوسط كم / طلب" : "Avg KM / Order",
    validDays: isArabic ? "الأيام الصالحة" : "Valid Days",
    onTime: isArabic ? "التسليم في الوقت" : "On Time",
    status: isArabic ? "الحالة" : "Status",
    valid: isArabic ? "صالح" : "Valid",
    invalid: isArabic ? "غير صالح" : "Invalid",
    topRiders: isArabic ? "أفضل المناديب" : "Top Riders",
    weakRiders: isArabic ? "أضعف المناديب" : "Weak Riders",
    riderDetails: isArabic ? "تفاصيل أداء المناديب" : "Riders Performance Details",
    bonusTable: isArabic ? "مكافأة الجودة حسب المستوى" : "Quality Bonus By Level",
    levelDistribution: isArabic ? "توزيع المستويات" : "Level Distribution",
  };

  const hungerStats = useMemo(() => {
    const totalRiders = hungerRows.length || 1;
    const totalDeliveries = hungerRows.reduce((sum, r) => sum + r.completedDeliveries, 0);
    const avgAttendance = Math.round(hungerRows.reduce((sum, r) => sum + r.attendanceRate, 0) / totalRiders);
    const avgAcceptance = Math.round(hungerRows.reduce((sum, r) => sum + r.acceptanceRate, 0) / totalRiders);
    const totalHours = hungerRows.reduce((sum, r) => sum + r.workingHours, 0);
    const totalKm = hungerRows.reduce((sum, r) => sum + r.totalKm, 0);
    const payableKm = hungerRows.reduce((sum, r) => sum + r.payableKm, 0);
    const totalBonus = hungerRows.reduce(
      (sum, r) => sum + r.completedDeliveries * qualityBonusByBatch(r.batchNumber),
      0
    );

    return {
      totalRiders: hungerRows.length,
      totalDeliveries,
      avgAttendance,
      avgAcceptance,
      totalHours,
      totalKm,
      payableKm,
      totalBonus,
    };
  }, [hungerRows]);

  const keetaStats = useMemo(() => {
    const totalRiders = keetaRows.length || 1;
    const totalOrders = keetaRows.reduce((sum, r) => sum + r.orders, 0);
    const valid = keetaRows.filter((r) => r.status === "valid").length;
    const invalid = keetaRows.length - valid;
    const avgOnTime = Math.round(keetaRows.reduce((sum, r) => sum + r.onTime, 0) / totalRiders);
    const avgAcceptance = Math.round(keetaRows.reduce((sum, r) => sum + r.acceptance, 0) / totalRiders);

    return {
      totalRiders: keetaRows.length,
      totalOrders,
      valid,
      invalid,
      avgOnTime,
      avgAcceptance,
    };
  }, [keetaRows]);

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

      {(loadingReports || loadingRecords) && (
        <div className="rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700">
          {isArabic ? "جاري تحديث البيانات..." : "Updating data..."}
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
              <LevelDistribution isArabic={isArabic} />
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card title={text.topRiders}>
              <HungerMiniTable rows={hungerRows.slice(0, 3)} />
            </Card>

            <Card title={text.weakRiders} danger>
              <HungerMiniTable
                rows={[...hungerRows]
                  .sort((a, b) => b.noShowPercent - a.noShowPercent)
                  .slice(0, 3)}
              />
            </Card>
          </div>

          <Card title={text.riderDetails}>
            <HungerDetailsTable rows={hungerRows} text={text} />
          </Card>
        </>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            <Card title={text.topRiders}>
              <KeetaMiniTable
                rows={keetaRows.filter((r) => r.status === "valid")}
                text={text}
              />
            </Card>

            <Card title={text.weakRiders} danger>
              <KeetaMiniTable
                rows={keetaRows.filter((r) => r.status === "invalid")}
                text={text}
              />
            </Card>
          </div>

          <Card title={text.riderDetails}>
            <KeetaDetailsTable rows={keetaRows} text={text} />
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