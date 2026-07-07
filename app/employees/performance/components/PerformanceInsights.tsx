"use client";

import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { Platform, HungerRow, KeetaRow } from "../types";
import { batchToLevel } from "../utils";

type Props = {
  platform: Platform;
  isArabic: boolean;
  hungerRows: HungerRow[];
  keetaRows: KeetaRow[];
  reportsCompleted: boolean;
};

export default function PerformanceInsights({
  platform,
  isArabic,
  hungerRows,
  keetaRows,
  reportsCompleted,
}: Props) {
  const insights =
    platform === "hunger"
      ? buildHungerInsights(hungerRows, isArabic, reportsCompleted)
      : buildKeetaInsights(keetaRows, isArabic, reportsCompleted);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
          <Lightbulb className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-xl font-black text-[#0f2544]">
            {isArabic ? "تحليل الأداء" : "Performance Insights"}
          </h2>
          <p className="text-sm font-bold text-slate-500">
            {isArabic
              ? "ملخص سريع لأهم الملاحظات"
              : "Quick summary of key observations"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-bold ${item.className}`}
          >
            {item.type === "good" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : item.type === "warning" ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildHungerInsights(
  rows: HungerRow[],
  isArabic: boolean,
  reportsCompleted: boolean
) {
  const totalRiders = rows.length;
  const levelF = rows.filter((r) => batchToLevel(r.batchNumber) === "F").length;
  const lowAcceptance = rows.filter((r) => r.acceptanceRate < 80).length;
  const highNoShow = rows.filter((r) => r.noShowPercent >= 10).length;

  const topRider = [...rows].sort(
    (a, b) => b.completedDeliveries - a.completedDeliveries
  )[0];

  return [
    {
      type: reportsCompleted ? "good" : "warning",
      className: reportsCompleted
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-700",
      text: reportsCompleted
        ? isArabic
          ? "تم رفع جميع تقارير هنجر المطلوبة اليوم."
          : "All required HungerStation reports were uploaded today."
        : isArabic
          ? "يوجد تقارير هنجر ناقصة، لا تعتمد على البيانات قبل رفع جميع التقارير."
          : "Some HungerStation reports are missing. Do not rely on data before uploading all reports.",
    },
    {
      type: "info",
      className: "bg-blue-50 text-blue-700",
      text: isArabic
        ? `إجمالي مناديب هنجر في التقرير: ${totalRiders} مندوب.`
        : `Total HungerStation riders in report: ${totalRiders}.`,
    },
    {
      type: levelF > 0 ? "warning" : "good",
      className: levelF > 0 ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700",
      text: isArabic
        ? `عدد المناديب في Level F: ${levelF}.`
        : `Riders in Level F: ${levelF}.`,
    },
    {
      type: lowAcceptance > 0 || highNoShow > 0 ? "warning" : "good",
      className:
        lowAcceptance > 0 || highNoShow > 0
          ? "bg-red-50 text-red-700"
          : "bg-green-50 text-green-700",
      text: isArabic
        ? `يوجد ${lowAcceptance} مندوب قبولهم أقل من 80% و ${highNoShow} مندوب لديهم No Show مرتفع.`
        : `${lowAcceptance} riders have acceptance below 80%, and ${highNoShow} riders have high No Show.`,
    },
    {
      type: "good",
      className: "bg-green-50 text-green-700",
      text: topRider
        ? isArabic
          ? `أفضل مندوب حسب الطلبات: ${topRider.name} - ${topRider.completedDeliveries} طلب.`
          : `Top rider by deliveries: ${topRider.name} - ${topRider.completedDeliveries} orders.`
        : isArabic
          ? "لا توجد بيانات كافية لأفضل مندوب."
          : "Not enough data for top rider.",
    },
  ];
}

function buildKeetaInsights(
  rows: KeetaRow[],
  isArabic: boolean,
  reportsCompleted: boolean
) {
  const totalRiders = rows.length;
  const invalid = rows.filter((r) => r.status === "invalid").length;
  const lowOrders = rows.filter((r) => r.orders < 300).length;

  const topRider = [...rows].sort((a, b) => b.orders - a.orders)[0];

  return [
    {
      type: reportsCompleted ? "good" : "warning",
      className: reportsCompleted
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-700",
      text: reportsCompleted
        ? isArabic
          ? "تم رفع تقرير كيتا المطلوب اليوم."
          : "Required Keeta report was uploaded today."
        : isArabic
          ? "لم يتم رفع تقرير كيتا اليوم."
          : "Keeta report has not been uploaded today.",
    },
    {
      type: "info",
      className: "bg-blue-50 text-blue-700",
      text: isArabic
        ? `إجمالي مناديب كيتا في التقرير: ${totalRiders} مندوب.`
        : `Total Keeta riders in report: ${totalRiders}.`,
    },
    {
      type: invalid > 0 ? "warning" : "good",
      className: invalid > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700",
      text: isArabic
        ? `عدد المناديب غير الصالحين: ${invalid}.`
        : `Invalid riders: ${invalid}.`,
    },
    {
      type: lowOrders > 0 ? "warning" : "good",
      className: lowOrders > 0 ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700",
      text: isArabic
        ? `يوجد ${lowOrders} مندوب أقل من 300 طلب.`
        : `${lowOrders} riders are below 300 orders.`,
    },
    {
      type: "good",
      className: "bg-green-50 text-green-700",
      text: topRider
        ? isArabic
          ? `أفضل مندوب حسب الطلبات: ${topRider.name} - ${topRider.orders} طلب.`
          : `Top rider by orders: ${topRider.name} - ${topRider.orders} orders.`
        : isArabic
          ? "لا توجد بيانات كافية لأفضل مندوب."
          : "Not enough data for top rider.",
    },
  ];
}