"use client";

import Link from "next/link";
import {
  Activity,
  Banknote,
  Building2,
  ClipboardList,
  Clock3,
  MapPinned,
  Route,
  Users,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";
import { MainLayout } from "@/shared/layout";

export default function OperationsPage() {
  const { lang, t } = useSystem();
  const isArabic = lang === "ar";

  const sections = [
    {
      titleAr: "الطلبات",
      titleEn: "Orders",
      descriptionAr: "متابعة وإدارة جميع طلبات التوصيل.",
      descriptionEn: "Track and manage all delivery orders.",
      route: "/v2/operations/orders",
      icon: ClipboardList,
    },
    {
      titleAr: "المناديب",
      titleEn: "Riders",
      descriptionAr: "متابعة المناديب وحالتهم التشغيلية.",
      descriptionEn: "Manage riders and their operational status.",
      route: "/v2/operations/riders",
      icon: Users,
    },
    {
      titleAr: "الشركات المتعاقد معها",
      titleEn: "Partner Companies",
      descriptionAr: "إدارة منصات وشركات التوصيل المتعاقد معها.",
      descriptionEn: "Manage contracted delivery platforms.",
      route: "/v2/operations/partners",
      icon: Building2,
    },
    {
      titleAr: "المناطق",
      titleEn: "Zones",
      descriptionAr: "إدارة مناطق التشغيل وتوزيع المناديب.",
      descriptionEn: "Manage operating zones and rider allocation.",
      route: "/v2/operations/zones",
      icon: MapPinned,
    },
    {
      titleAr: "الورديات",
      titleEn: "Shifts",
      descriptionAr: "تنظيم الورديات وساعات العمل.",
      descriptionEn: "Organize shifts and working hours.",
      route: "/v2/operations/shifts",
      icon: Clock3,
    },
    {
      titleAr: "الأداء",
      titleEn: "Performance",
      descriptionAr: "تحليل أداء المناديب وتحقيق المستهدفات.",
      descriptionEn: "Analyze rider performance and targets.",
      route: "/v2/operations/performance",
      icon: Activity,
    },
    {
      titleAr: "الكاش والتسويات",
      titleEn: "Cash & Settlements",
      descriptionAr: "متابعة الكاش والمحافظ والتسويات المالية.",
      descriptionEn: "Track cash, wallets, and settlements.",
      route: "/v2/operations/cash-settlements",
      icon: Banknote,
    },
    {
      titleAr: "مركز العمليات",
      titleEn: "Operations Center",
      descriptionAr: "متابعة التشغيل اليومي من شاشة مركزية.",
      descriptionEn: "Monitor daily operations from one center.",
      route: "/v2/operations/center",
      icon: Route,
    },
  ];

  return (
    <MainLayout
      title={t.operations}
      subtitle={
        isArabic
          ? "إدارة ومتابعة عمليات التوصيل اليومية"
          : "Manage and monitor daily delivery operations"
      }
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.route}
              href={section.route}
              className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-[20px] font-black text-slate-950">
                    {isArabic ? section.titleAr : section.titleEn}
                  </h2>

                  <p className="mt-2 text-[15px] font-medium leading-7 text-slate-500">
                    {isArabic
                      ? section.descriptionAr
                      : section.descriptionEn}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </MainLayout>
  );
}