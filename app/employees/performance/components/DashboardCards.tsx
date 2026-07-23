"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock,
  MapPinned,
  Medal,
  Route,
  Users,
  Wallet,
  AlertTriangle,
} from "lucide-react";

import { Platform } from "../types";

type Props = {
  platform: Platform;
  isArabic: boolean;
  hungerStats: any;
  keetaStats: any;
};

export default function DashboardCards({
  platform,
  isArabic,
  hungerStats,
  keetaStats,
}: Props) {
  if (platform === "hunger") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-black text-[#0f2544]">
          {isArabic ? "ملخص الأداء العام - هنجرستيشن" : "General Performance Summary - HungerStation"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Kpi title={isArabic ? "إجمالي المناديب" : "Total Riders"} value={String(hungerStats.totalRiders)} icon={<Users />} />
          <Kpi title={isArabic ? "إجمالي الطلبات" : "Total Deliveries"} value={hungerStats.totalDeliveries.toLocaleString()} icon={<BarChart3 />} />
          <Kpi title={isArabic ? "متوسط الحضور" : "Average Attendance"} value={`${hungerStats.avgAttendance}%`} icon={<CheckCircle2 />} />
          <Kpi title={isArabic ? "متوسط القبول" : "Average Acceptance"} value={`${hungerStats.avgAcceptance}%`} icon={<Medal />} />
          <Kpi title={isArabic ? "إجمالي ساعات العمل" : "Total Working Hours"} value={formatNumber(hungerStats.totalHours)} icon={<Clock />}/>
          <Kpi title={isArabic ? "إجمالي الكيلومترات" : "Total KM"} value={formatNumber(hungerStats.totalKm)} icon={<Route />} />
           <Kpi title={isArabic ? "الكيلومترات المستحقة" : "Payable KM"} value={formatNumber(hungerStats.payableKm)} icon={<MapPinned />}/>
          <Kpi title={isArabic ? "إجمالي مكافأة الجودة" : "Total Quality Bonus"} value={`${formatNumber(hungerStats.totalBonus)} SAR`} icon={<Wallet />}/>
        </div>
      </section>
    );
  }
  function formatNumber(value: number | string | null | undefined) {
  const number = Number(value ?? 0);

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-black text-[#0f2544]">
        {isArabic ? "ملخص الأداء العام - كيتا" : "General Performance Summary - Keeta"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Kpi title={isArabic ? "إجمالي المناديب" : "Total Riders"} value={String(keetaStats.totalRiders)} icon={<Users />} />
        <Kpi title={isArabic ? "إجمالي الطلبات" : "Total Deliveries"} value={String(keetaStats.totalOrders)} icon={<BarChart3 />} />
        <Kpi title={isArabic ? "صالح" : "Valid"} value={String(keetaStats.valid)} icon={<CheckCircle2 />} />
        <Kpi title={isArabic ? "غير صالح" : "Invalid"} value={String(keetaStats.invalid)} icon={<AlertTriangle />} />
        <Kpi title={isArabic ? "التسليم في الوقت" : "On Time"} value={`${keetaStats.avgOnTime}%`} icon={<Clock />} />
        <Kpi title={isArabic ? "القبول" : "Acceptance"} value={`${keetaStats.avgAcceptance}%`} icon={<Medal />} />
      </div>
    </section>
  );
}

function Kpi({ title, value, icon }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        {icon}
      </div>

      <p className="text-sm font-extrabold text-slate-500">{title}</p>

      <h3 className="mt-2 text-3xl font-black text-[#0f2544]">
        {value}
      </h3>
    </div>
  );
}