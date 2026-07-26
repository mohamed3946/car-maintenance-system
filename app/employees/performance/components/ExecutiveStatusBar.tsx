"use client";

import { AlertTriangle, CheckCircle2, Medal } from "lucide-react";
import { Platform, HungerRow, KeetaRow } from "../types";
import { batchToLevel } from "../utils";

type Props = {
  platform: Platform;
  isArabic: boolean;
  hungerRows: HungerRow[];
  keetaRows: KeetaRow[];
  reportsCompleted: boolean;
};

export default function ExecutiveStatusBar({
  platform,
  isArabic,
  hungerRows,
  keetaRows,
  reportsCompleted,
}: Props) {
  const data =
    platform === "hunger"
      ? getHungerStatus(hungerRows, reportsCompleted, isArabic)
      : getKeetaStatus(keetaRows, reportsCompleted, isArabic);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {data.map((item, index) => (
          <div
            key={index}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold ${item.className}`}
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getHungerStatus(
  rows: HungerRow[],
  reportsCompleted: boolean,
  isArabic: boolean
) {
  const levelF = rows.filter((r) => batchToLevel(r.batchNumber) === "F").length;
  const needAttention = rows.filter(
    (r) =>
      r.acceptanceRate < 80 ||
      r.noShowPercent >= 10 ||
      batchToLevel(r.batchNumber) === "F"
  ).length;

  const topRider = [...rows].sort(
    (a, b) => b.completedDeliveries - a.completedDeliveries
  )[0];

  return [
    {
      text: reportsCompleted
        ? isArabic
          ? "التقارير مكتملة"
          : "Reports Ready"
        : isArabic
          ? "التقارير ناقصة"
          : "Reports Missing",
      icon: reportsCompleted ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />,
      className: reportsCompleted
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-700",
    },
    {
      text: isArabic
        ? `يحتاج متابعة: ${needAttention}`
        : `Need Attention: ${needAttention}`,
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-orange-50 text-orange-700",
    },
    {
      text: topRider
        ? isArabic
          ? `أفضل مندوب: ${topRider.name} (${topRider.completedDeliveries})`
          : `Top Rider: ${topRider.name} (${topRider.completedDeliveries})`
        : "-",
      icon: <Medal className="h-4 w-4" />,
      className: "bg-blue-50 text-blue-700",
    },
    {
      text: `Level F: ${levelF}`,
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-red-50 text-red-700",
    },
  ];
}

function getKeetaStatus(
  rows: KeetaRow[],
  reportsCompleted: boolean,
  isArabic: boolean
) {
  const invalid = rows.filter((r) => r.status === "invalid").length;
  const needAttention = rows.filter(
    (r) => r.status === "invalid" || r.orders < 300
  ).length;

  const topRider = [...rows].sort((a, b) => b.orders - a.orders)[0];

  return [
    {
      text: reportsCompleted
        ? isArabic
          ? "التقرير مكتمل"
          : "Report Ready"
        : isArabic
          ? "التقرير ناقص"
          : "Report Missing",
      icon: reportsCompleted ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />,
      className: reportsCompleted
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-700",
    },
    {
      text: isArabic
        ? `يحتاج متابعة: ${needAttention}`
        : `Need Attention: ${needAttention}`,
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-orange-50 text-orange-700",
    },
    {
      text: topRider
        ? isArabic
          ? `أفضل مندوب: ${topRider.name} (${topRider.orders})`
          : `Top Rider: ${topRider.name} (${topRider.orders})`
        : "-",
      icon: <Medal className="h-4 w-4" />,
      className: "bg-blue-50 text-blue-700",
    },
    {
      text: isArabic ? `غير صالح: ${invalid}` : `Invalid: ${invalid}`,
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-red-50 text-red-700",
    },
  ];
}