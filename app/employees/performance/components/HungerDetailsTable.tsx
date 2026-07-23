"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, Search } from "lucide-react";
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

export default function HungerDetailsTable({ rows, text }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("ordersHigh");

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

    nameAZ: isArabic
      ? "الاسم من أ إلى ي"
      : "Name A to Z",

    nameZA: isArabic
      ? "الاسم من ي إلى أ"
      : "Name Z to A",

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
            onChange={(event) => setSortBy(event.target.value as SortOption)}
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
        <table className="w-full min-w-[1200px] text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 text-start">{text.rider}</th>
              <th className="p-4 text-start">{text.batchNumber}</th>
              <th className="p-4 text-start">{text.level}</th>
              <th className="p-4 text-start">{text.deliveries}</th>
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
                  colSpan={13}
                  className="p-10 text-center font-bold text-slate-400"
                >
                  {ui.noResults}
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-100 transition hover:bg-blue-50/40"
                >
                  <td className="p-4 font-black">{r.name}</td>

                  <td className="p-4 font-bold">
                    {formatInteger(r.batchNumber)}
                  </td>

                  <td className="p-4 font-bold">
                    {batchToLevel(r.batchNumber)}
                  </td>

                  <td className="p-4 font-bold">
                    {formatInteger(r.completedDeliveries)}
                  </td>

                  <td className="p-4 font-bold">
                    {formatNumber(r.attendanceRate)}%
                  </td>

                  <td className="p-4 font-bold">
                    {formatNumber(r.acceptanceRate)}%
                  </td>

                  <td className="p-4 font-bold">
                    {formatNumber(r.contactRate)}%
                  </td>

                  <td className="p-4 font-bold text-red-600">
                    {formatNumber(r.noShowPercent)}%
                  </td>

                  <td className="p-4 font-bold">
                    {formatNumber(r.workingHours)}
                  </td>

                  <td className="p-4 font-bold">
                    {formatNumber(r.totalKm)}
                  </td>

                  <td className="p-4 font-bold">
                    {formatNumber(r.payableKm)}
                  </td>

                  <td className="p-4 font-bold">
                    {formatNumber(r.avgKm)}
                  </td>

                  <td className="p-4 font-bold text-green-600">
                    {formatNumber(
                      r.completedDeliveries *
                        qualityBonusByBatch(r.batchNumber)
                    )}{" "}
                    SAR
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
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