"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPinned,
  PackageCheck,
  Route,
  Search,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import { HungerRow } from "../types";
import { batchToLevel, qualityBonusByBatch } from "../utils";

type Props = {
  rows: HungerRow[];
  text: any;
};

type SortOption =
  | "levelBest"
  | "levelWeak"
  | "ordersHigh"
  | "ordersLow"
  | "nameAZ"
  | "nameZA"
  | "hoursHigh"
  | "hoursLow"
  | "totalKmHigh"
  | "totalKmLow";

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

export default function HungerDetailsTable({ rows, text }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("ordersHigh");
  const [expandedRiderId, setExpandedRiderId] = useState<number | null>(null);
  const [dailyRowsByRider, setDailyRowsByRider] = useState<
    Record<string, DailyDisplayRow[]>
  >({});
  const [loadingRiderId, setLoadingRiderId] = useState<number | null>(null);

  const isArabic = text?.rider !== "Rider";

  const ui = {
    searchPlaceholder: isArabic
      ? "ابحث باسم المندوب أو الآي دي أو المستوى..."
      : "Search by rider name, ID, or level...",

    resultsCount: isArabic ? "عدد النتائج" : "Results",
    clearSearch: isArabic ? "مسح البحث" : "Clear Search",
    noResults: isArabic
      ? "لا توجد نتائج مطابقة للبحث"
      : "No matching results found",

    ordersHigh: isArabic
      ? "الأعلى في عدد الطلبات"
      : "Highest Deliveries",

    ordersLow: isArabic
      ? "الأقل في عدد الطلبات"
      : "Lowest Deliveries",

    levelBest: isArabic
      ? "أفضل مستوى ثم أعلى طلبات"
      : "Best Level, Then Highest Deliveries",

    levelWeak: isArabic
      ? "أضعف مستوى ثم أقل طلبات"
      : "Weakest Level, Then Lowest Deliveries",

    nameAZ: isArabic ? "الاسم من أ إلى ي" : "Name A to Z",
    nameZA: isArabic ? "الاسم من ي إلى أ" : "Name Z to A",

    hoursHigh: isArabic
      ? "الأعلى في ساعات العمل"
      : "Highest Working Hours",

    hoursLow: isArabic
      ? "الأقل في ساعات العمل"
      : "Lowest Working Hours",

    totalKmHigh: isArabic
      ? "الأعلى في الكيلومترات"
      : "Highest Total KM",

    totalKmLow: isArabic
      ? "الأقل في الكيلومترات"
      : "Lowest Total KM",

    dailyPerformance: isArabic ? "الأداء اليومي" : "Daily Performance",
    workingDay: isArabic ? "عمل" : "Worked",
    absentDay: isArabic ? "غياب" : "Absent",
    deliveries: isArabic ? "طلب" : "Orders",
    totalKm: isArabic ? "إجمالي كم" : "Total KM",
    payableKm: isArabic ? "كم مستحق" : "Payable KM",

    loadingDaily: isArabic
      ? "جاري تحميل تفاصيل الأيام..."
      : "Loading daily details...",

    noDailyData: isArabic
      ? "لا توجد تفاصيل يومية لهذا المندوب"
      : "No daily details for this rider",
  };

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = rows.filter((row) => {
      if (!normalizedSearch) return true;

      return (
        String(row.name || "").toLowerCase().includes(normalizedSearch) ||
        String(row.id || "").toLowerCase().includes(normalizedSearch) ||
        String(row.completedDeliveries || "").includes(normalizedSearch) ||
        batchToLevel(row.batchNumber)
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "levelBest":
          if (a.batchNumber !== b.batchNumber) {
            return a.batchNumber - b.batchNumber;
          }
          return b.completedDeliveries - a.completedDeliveries;

        case "levelWeak":
          if (a.batchNumber !== b.batchNumber) {
            return b.batchNumber - a.batchNumber;
          }
          return a.completedDeliveries - b.completedDeliveries;

        case "ordersHigh":
          return b.completedDeliveries - a.completedDeliveries;

        case "ordersLow":
          return a.completedDeliveries - b.completedDeliveries;

        case "nameAZ":
          return String(a.name || "").localeCompare(
            String(b.name || ""),
            isArabic ? "ar" : "en"
          );

        case "nameZA":
          return String(b.name || "").localeCompare(
            String(a.name || ""),
            isArabic ? "ar" : "en"
          );

        case "hoursHigh":
          return b.workingHours - a.workingHours;

        case "hoursLow":
          return a.workingHours - b.workingHours;

        case "totalKmHigh":
          return b.totalKm - a.totalKm;

        case "totalKmLow":
          return a.totalKm - b.totalKm;

        default:
          return 0;
      }
    });
  }, [rows, search, sortBy, isArabic]);

  async function toggleRider(rider: HungerRow) {
    if (expandedRiderId === rider.id) {
      setExpandedRiderId(null);
      return;
    }

    setExpandedRiderId(rider.id);

    if (dailyRowsByRider[String(rider.id)]) {
      return;
    }

    await loadDailyRider(rider.id);
  }

  async function loadDailyRider(riderId: number) {
    setLoadingRiderId(riderId);

    try {
      const reportMonth = getCurrentReportMonth();

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

      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];

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

      const allDates = generateDateRange(firstDate, lastDate);

      const displayRows: DailyDisplayRow[] = allDates.map((date) => {
        const record = riderMap.get(date);
        const deliveries = Number(record?.completed_deliveries || 0);
        const worked = deliveries > 0;

        return {
          date,
          worked,
          completedDeliveries: deliveries,
          totalKm: Number(record?.total_km || 0),
          payableKm: Number(record?.payable_km || 0),
          avgKm: Number(record?.avg_km || 0),
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

  return (
    <div className="space-y-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative">
          <Search
            className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${
              isArabic ? "right-4" : "left-4"
            }`}
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={ui.searchPlaceholder}
            className={`w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              isArabic ? "pr-12 pl-4" : "pl-12 pr-4"
            }`}
          />
        </div>

        <div className="relative">
          <ArrowDownAZ
            className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${
              isArabic ? "right-4" : "left-4"
            }`}
          />

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as SortOption)
            }
            className={`w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              isArabic ? "pr-12 pl-4" : "pl-12 pr-4"
            }`}
          >
            <option value="ordersHigh">{ui.ordersHigh}</option>
            <option value="ordersLow">{ui.ordersLow}</option>
            <option value="levelBest">{ui.levelBest}</option>
            <option value="levelWeak">{ui.levelWeak}</option>
            <option value="nameAZ">{ui.nameAZ}</option>
            <option value="nameZA">{ui.nameZA}</option>
            <option value="hoursHigh">{ui.hoursHigh}</option>
            <option value="hoursLow">{ui.hoursLow}</option>
            <option value="totalKmHigh">{ui.totalKmHigh}</option>
            <option value="totalKmLow">{ui.totalKmLow}</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
        <span>
          {ui.resultsCount}: {filteredRows.length}
        </span>

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-blue-600 hover:text-blue-700"
          >
            {ui.clearSearch}
          </button>
        )}
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[1350px] text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 text-start">{text.rider}</th>
              <th className="p-4 text-start">{text.batchNumber}</th>
              <th className="p-4 text-start">{text.level}</th>
              <th className="p-4 text-start">{text.deliveries}</th>
              <th className="p-4 text-start">{text.workingDays}</th>
              <th className="p-4 text-start">{text.attendance}</th>
              <th className="p-4 text-start">{text.acceptance}</th>
              <th className="p-4 text-start">{text.contact}</th>
              <th className="p-4 text-start">{text.noShow}</th>
              <th className="p-4 text-start">{text.hours}</th>
              <th className="p-4 text-start">{text.totalKm}</th>
              <th className="p-4 text-start">{text.payableKm}</th>
              <th className="p-4 text-start">{text.avgKm}</th>
              <th className="p-4 text-start">{text.bonus}</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={14}
                  className="p-10 text-center font-bold text-slate-400"
                >
                  {ui.noResults}
                </td>
              </tr>
            ) : (
              filteredRows.map((rider) => {
                const isOpen = expandedRiderId === rider.id;

                return (
                  <Fragment key={rider.id}>
                    <tr className="border-t border-slate-100 transition hover:bg-blue-50/40">
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => toggleRider(rider)}
                          className="flex items-center gap-2 font-black text-[#0f2544] transition hover:text-blue-700"
                        >
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}

                          <span>{rider.name}</span>
                        </button>

                        <div className="mt-1 text-xs font-bold text-slate-400">
                          ID: {rider.id}
                        </div>
                      </td>

                      <td className="p-4 font-bold">
                        {rider.inReport
                          ? formatInteger(rider.batchNumber)
                          : "-"}
                      </td>

                      <td className="p-4 font-bold">
                        {rider.inReport
                          ? batchToLevel(rider.batchNumber)
                          : "-"}
                      </td>

                      <td className="p-4 font-bold">
                        {formatInteger(rider.completedDeliveries)}
                      </td>

                      <td className="p-4 font-bold">
                        {formatInteger(rider.workingDays)}
                      </td>

                      <td className="p-4 font-bold">
                        {formatNumber(rider.attendanceRate)}%
                      </td>

                      <td className="p-4 font-bold">
                        {formatNumber(rider.acceptanceRate)}%
                      </td>

                      <td className="p-4 font-bold">
                        {formatNumber(rider.contactRate)}%
                      </td>

                      <td className="p-4 font-bold text-red-600">
                        {formatNumber(rider.noShowPercent)}%
                      </td>

                      <td className="p-4 font-bold">
                        {formatNumber(rider.workingHours)}
                      </td>

                      <td className="p-4 font-bold">
                        {formatNumber(rider.totalKm)}
                      </td>

                      <td className="p-4 font-bold">
                        {formatNumber(rider.payableKm)}
                      </td>

                      <td className="p-4 font-bold">
                        {formatNumber(rider.avgKm)}
                      </td>

                      <td className="p-4 font-bold text-green-600">
                        {rider.inReport
                          ? formatNumber(
                              rider.completedDeliveries *
                                qualityBonusByBatch(rider.batchNumber)
                            )
                          : "0.00"}{" "}
                        SAR
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="border-t border-blue-100">
                        <td
                          colSpan={14}
                          className="bg-slate-50/80 p-0"
                        >
                          <DailyPerformancePanel
                            rows={
                              dailyRowsByRider[String(rider.id)] || []
                            }
                            loading={loadingRiderId === rider.id}
                            isArabic={isArabic}
                            ui={ui}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DailyPerformancePanel({
  rows,
  loading,
  isArabic,
  ui,
}: {
  rows: DailyDisplayRow[];
  loading: boolean;
  isArabic: boolean;
  ui: any;
}) {
  if (loading) {
    return (
      <div className="p-6 text-center font-bold text-blue-600">
        {ui.loadingDaily}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="p-6 text-center font-bold text-slate-400">
        {ui.noDailyData}
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
    <div className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-600" />

          <h4 className="text-sm font-black text-[#0f2544]">
            {ui.dailyPerformance}
          </h4>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-green-700">
            {isArabic
              ? `أيام العمل: ${workedDays}`
              : `Worked: ${workedDays}`}
          </span>

          <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-700">
            {isArabic
              ? `أيام الغياب: ${absentDays}`
              : `Absent: ${absentDays}`}
          </span>

          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">
            {isArabic
              ? `الطلبات: ${totalDeliveries}`
              : `Orders: ${totalDeliveries}`}
          </span>
        </div>
      </div>

      {/*
        كروت الأيام صغيرة جدًا:
        على الشاشات الكبيرة يأخذ الصف تقريبًا 15 كرت.
      */}
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        }}
      >
        {rows.map((row) => (
          <div
            key={row.date}
            className={`min-w-0 rounded-xl border p-2 shadow-sm ${
              row.worked
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span
                className={`truncate text-xs font-black ${
                  row.worked ? "text-green-800" : "text-red-700"
                }`}
              >
                {formatDailyDate(row.date, isArabic)}
              </span>

              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  row.worked ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>

            <div
              className={`mt-1 text-[11px] font-extrabold ${
                row.worked ? "text-green-700" : "text-red-600"
              }`}
            >
              {row.worked ? ui.workingDay : ui.absentDay}
            </div>

            <div className="mt-2 space-y-1 rounded-lg bg-white/80 p-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-500">
                  <PackageCheck className="h-3 w-3 shrink-0" />
                  {ui.deliveries}
                </span>

                <strong className="text-xs text-[#0f2544]">
                  {formatInteger(row.completedDeliveries)}
                </strong>
              </div>

              {row.worked && (
                <>
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-500">
                      <Route className="h-3 w-3 shrink-0" />
                      {ui.totalKm}
                    </span>

                    <strong className="text-[11px] text-slate-700">
                      {formatCompactNumber(row.totalKm)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-500">
                      <MapPinned className="h-3 w-3 shrink-0" />
                      {ui.payableKm}
                    </span>

                    <strong className="text-[11px] text-slate-700">
                      {formatCompactNumber(row.payableKm)}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCurrentReportMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function generateDateRange(startDate: string, endDate: string) {
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

function formatDailyDate(value: string, isArabic: boolean) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(isArabic ? "ar-SA" : "en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatInteger(value: number | string | null | undefined) {
  return Math.round(Number(value ?? 0)).toLocaleString("en-US");
}

function formatNumber(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCompactNumber(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}