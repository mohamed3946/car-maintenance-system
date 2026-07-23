"use client";

import {
  Activity,
  ArrowUpRight,
  Car,
  CheckCircle2,
  Clock3,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";
import { MainLayout } from "@/shared/layout";

export default function DashboardPage() {
  const { lang, t } = useSystem();
  const isArabic = lang === "ar";

  const subtitle = isArabic
    ? "نظرة تنفيذية شاملة على أداء الشركة اليوم"
    : "Executive overview of company performance today";

  return (
    <MainLayout title={t.dashboard} subtitle={subtitle}>
      <div className="space-y-5">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={t.totalRevenue}
            value="425,000 SAR"
            change="+14%"
            positive
            icon={Wallet}
          />

          <StatCard
            title={t.totalRiders}
            value="214"
            change="+8%"
            positive
            icon={Users}
          />

          <StatCard
            title={t.totalVehicles}
            value="128"
            change="+3%"
            positive
            icon={Car}
          />

          <StatCard
            title={t.openMaintenance}
            value="17"
            change="-6%"
            positive={false}
            icon={Wrench}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_2fr]">
          <div className="rounded-[24px] bg-[#10182d] p-5 text-white shadow-sm">
            <div>
              <h2 className="text-[22px] font-black">
                {isArabic ? "رؤى الذكاء الاصطناعي" : "AI Insights"}
              </h2>

              <p className="mt-1 text-[14px] font-medium text-slate-400">
                {isArabic
                  ? "أهم الملاحظات والتنبيهات اليوم"
                  : "Key observations and alerts today"}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <InsightItem
                text={
                  isArabic
                    ? "انخفض صافي التشغيل بنسبة 8% بسبب زيادة تكاليف الصيانة."
                    : "Operating profit decreased by 8% due to maintenance costs."
                }
              />

              <InsightItem
                text={
                  isArabic
                    ? "3 مركبات تحتاج إلى متابعة خلال 48 ساعة."
                    : "3 vehicles require follow-up within 48 hours."
                }
              />

              <InsightItem
                text={
                  isArabic
                    ? "أداء الأسطول مستقر خلال هذا الأسبوع."
                    : "Fleet performance is stable this week."
                }
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[21px] font-black text-slate-950">
                  {isArabic
                    ? "أداء التشغيل"
                    : "Operations Performance"}
                </h2>

                <p className="mt-1 text-[14px] font-medium text-slate-500">
                  {isArabic
                    ? "الطلبات والمناديب ونشاط الأسطول"
                    : "Orders, riders and fleet activity"}
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-4 py-2 text-[12px] font-black text-blue-700">
                {isArabic ? "مباشر" : "Live"}
              </span>
            </div>

            <div className="mt-5 h-[280px] overflow-hidden rounded-[20px] bg-gradient-to-b from-blue-50/70 to-slate-50 p-4">
              <svg
                viewBox="0 0 800 250"
                className="h-full w-full"
                preserveAspectRatio="none"
                aria-label={
                  isArabic
                    ? "رسم أداء التشغيل"
                    : "Operations performance chart"
                }
              >
                <defs>
                  <linearGradient
                    id="dashboardArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[40, 90, 140, 190].map((y) => (
                  <line
                    key={y}
                    x1="20"
                    y1={y}
                    x2="780"
                    y2={y}
                    stroke="#dbe4f0"
                    strokeWidth="1"
                    strokeDasharray="5 6"
                  />
                ))}

                <path
                  d="M20 190 C100 175, 130 125, 210 145 C290 165, 330 105, 410 120 C500 135, 530 90, 610 105 C680 115, 720 45, 780 55 L780 230 L20 230 Z"
                  fill="url(#dashboardArea)"
                />

                <path
                  d="M20 190 C100 175, 130 125, 210 145 C290 165, 330 105, 410 120 C500 135, 530 90, 610 105 C680 115, 720 45, 780 55"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <DashboardPanel
            title={isArabic ? "اعتمادات معلقة" : "Pending Approvals"}
            description={
              isArabic
                ? "لا توجد طلبات معلقة حاليًا."
                : "No pending requests."
            }
            icon={Clock3}
            iconClassName="bg-amber-50 text-amber-600"
          />

          <DashboardPanel
            title={isArabic ? "النشاطات الأخيرة" : "Recent Activity"}
            description={
              isArabic
                ? "لا توجد نشاطات حديثة."
                : "No recent activity."
            }
            icon={Activity}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <DashboardPanel
            title={isArabic ? "إجراءات سريعة" : "Quick Actions"}
            description={
              isArabic
                ? "ستظهر الإجراءات المتاحة حسب صلاحيات المستخدم."
                : "Available actions will appear based on permissions."
            }
            icon={Zap}
            iconClassName="bg-green-50 text-green-600"
          />
        </section>
      </div>
    </MainLayout>
  );
}

type IconComponent = React.ComponentType<{
  className?: string;
}>;

function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: IconComponent;
}) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-black ${
            positive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {change}
        </span>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <p className="mt-5 text-[14px] font-bold text-slate-500">
        {title}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <h3 className="text-[29px] font-black leading-none text-slate-950">
          {value}
        </h3>

        <ArrowUpRight
          className={`h-5 w-5 ${
            positive ? "text-green-600" : "rotate-90 text-red-600"
          }`}
        />
      </div>
    </article>
  );
}

function InsightItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

      <p className="text-[14px] font-semibold leading-6 text-slate-100">
        {text}
      </p>
    </div>
  );
}

function DashboardPanel({
  title,
  description,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  description: string;
  icon: IconComponent;
  iconClassName: string;
}) {
  return (
    <article className="flex min-h-[110px] items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div className="min-w-0">
        <h3 className="text-[17px] font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-[13px] font-medium leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}