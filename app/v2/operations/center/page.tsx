"use client";

import Link from "next/link";
import {
  Activity,
  Banknote,
  Bike,
  CheckCircle2,
  Clock3,
  PackageCheck,
  PackageX,
  Route,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";
import { MainLayout } from "@/shared/layout";

export default function OperationsCenterPage() {
  const { lang } = useSystem();
  const isArabic = lang === "ar";

  const tabs = [
    {
      key: "orders",
      labelAr: "الطلبات",
      labelEn: "Orders",
      href: "/v2/operations/orders",
    },
    {
      key: "riders",
      labelAr: "المناديب",
      labelEn: "Riders",
      href: "/v2/operations/riders",
    },
    {
      key: "cash",
      labelAr: "الكاش والتسويات",
      labelEn: "Cash & Settlements",
      href: "/v2/operations/cash-settlements",
    },
    {
      key: "performance",
      labelAr: "الأداء",
      labelEn: "Performance",
      href: "/v2/operations/performance",
    },
    {
      key: "shifts",
      labelAr: "الورديات",
      labelEn: "Shifts",
      href: "/v2/operations/shifts",
    },
  ];

  return (
    <MainLayout
      title={isArabic ? "مركز العمليات" : "Operations Center"}
      subtitle={
        isArabic
          ? "متابعة التشغيل اليومي من شاشة مركزية واحدة"
          : "Monitor daily operations from one central screen"
      }
    >
      <div className="space-y-5">
        <nav className="flex gap-2 overflow-x-auto rounded-[20px] border border-slate-200 bg-white p-2 shadow-sm">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className="shrink-0 rounded-2xl px-5 py-3 text-[15px] font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {isArabic ? tab.labelAr : tab.labelEn}
            </Link>
          ))}
        </nav>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={isArabic ? "إجمالي الطلبات اليوم" : "Total Orders Today"}
            value="0"
            icon={PackageCheck}
            color="blue"
          />

          <StatCard
            title={isArabic ? "الطلبات الجارية" : "Active Orders"}
            value="0"
            icon={Route}
            color="orange"
          />

          <StatCard
            title={isArabic ? "الطلبات المكتملة" : "Completed Orders"}
            value="0"
            icon={CheckCircle2}
            color="green"
          />

          <StatCard
            title={isArabic ? "الطلبات الملغاة" : "Cancelled Orders"}
            value="0"
            icon={PackageX}
            color="red"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-[21px] font-black text-slate-950">
                  {isArabic
                    ? "حالة التشغيل المباشرة"
                    : "Live Operations Status"}
                </h2>

                <p className="mt-1 text-[14px] font-medium text-slate-500">
                  {isArabic
                    ? "متابعة الطلبات والمناديب والورديات"
                    : "Monitor orders, riders, and shifts"}
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-4 py-2 text-[12px] font-black text-green-700">
                {isArabic ? "مباشر" : "Live"}
              </span>
            </div>

            <div className="mt-5 grid min-h-[290px] place-items-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50">
              <div className="text-center">
                <Activity className="mx-auto h-10 w-10 text-slate-400" />

                <p className="mt-3 text-[15px] font-bold text-slate-500">
                  {isArabic
                    ? "ستظهر بيانات التشغيل المباشرة هنا"
                    : "Live operations data will appear here"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#10182d] p-5 text-white shadow-sm">
            <h2 className="text-[21px] font-black">
              {isArabic ? "ملخص اليوم" : "Today Summary"}
            </h2>

            <div className="mt-5 space-y-3">
              <SummaryRow
                icon={Bike}
                label={isArabic ? "المناديب النشطون" : "Active Riders"}
                value="0"
              />

              <SummaryRow
                icon={Clock3}
                label={isArabic ? "الورديات المفتوحة" : "Open Shifts"}
                value="0"
              />

              <SummaryRow
                icon={Banknote}
                label={isArabic ? "الكاش قيد التسوية" : "Cash Pending"}
                value="0 SAR"
              />

              <SummaryRow
                icon={Activity}
                label={isArabic ? "متوسط الأداء" : "Average Performance"}
                value="0%"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-[21px] font-black text-slate-950">
                {isArabic ? "آخر العمليات" : "Latest Operations"}
              </h2>

              <p className="mt-1 text-[14px] font-medium text-slate-500">
                {isArabic
                  ? "آخر الطلبات والتحديثات التشغيلية"
                  : "Latest orders and operational updates"}
              </p>
            </div>

            <Link
              href="/v2/operations/orders"
              className="rounded-xl bg-blue-600 px-5 py-3 text-[14px] font-black text-white transition hover:bg-blue-700"
            >
              {isArabic ? "عرض كل الطلبات" : "View All Orders"}
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[800px] text-[14px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-4 text-start font-black">
                    {isArabic ? "رقم الطلب" : "Order ID"}
                  </th>

                  <th className="px-4 py-4 text-start font-black">
                    {isArabic ? "الشركة" : "Company"}
                  </th>

                  <th className="px-4 py-4 text-start font-black">
                    {isArabic ? "المندوب" : "Rider"}
                  </th>

                  <th className="px-4 py-4 text-start font-black">
                    {isArabic ? "الحالة" : "Status"}
                  </th>

                  <th className="px-4 py-4 text-start font-black">
                    {isArabic ? "الوقت" : "Time"}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center font-bold text-slate-400"
                  >
                    {isArabic
                      ? "لا توجد عمليات مسجلة حاليًا"
                      : "No operations recorded yet"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

type IconType = React.ComponentType<{
  className?: string;
}>;

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: IconType;
  color: "blue" | "orange" | "green" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-600",
  };

  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className={`rounded-2xl p-3 ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="text-[30px] font-black text-slate-950">
          {value}
        </h3>
      </div>

      <p className="mt-4 text-[15px] font-bold text-slate-500">
        {title}
      </p>
    </article>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/25 text-blue-300">
          <Icon className="h-5 w-5" />
        </div>

        <span className="truncate text-[14px] font-bold text-slate-200">
          {label}
        </span>
      </div>

      <strong className="shrink-0 text-[17px] font-black">
        {value}
      </strong>
    </div>
  );
}