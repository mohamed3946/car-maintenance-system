"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import Button from "@/ui/button/Button";

export type ApplicationStatus = "active" | "inactive" | "draft";

export type ApplicationCardData = {
  id: string;
  nameAr: string;
  nameEn: string;
  shortName?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  logo?: string;
  primaryColor?: string;
  status: ApplicationStatus;
  ridersCount: number;
  workRulesCount: number;
  performanceRulesCount: number;
  evaluationLevelsCount: number;
};

type ApplicationCardProps = {
  application: ApplicationCardData;
  lang: "ar" | "en";
};

export default function ApplicationCard({
  application,
  lang,
}: ApplicationCardProps) {
  const isArabic = lang === "ar";

  const name = isArabic
    ? application.nameAr
    : application.nameEn;

  const secondaryName = isArabic
    ? application.nameEn
    : application.nameAr;

  const description = isArabic
    ? application.descriptionAr
    : application.descriptionEn;

  const statusData = {
    active: {
      label: isArabic ? "التطبيق نشط" : "Application Active",
      dotClass: "bg-emerald-500",
      ringClass: "ring-emerald-100",
      textClass: "text-emerald-700",
    },
    inactive: {
      label: isArabic ? "التطبيق متوقف" : "Application Inactive",
      dotClass: "bg-red-500",
      ringClass: "ring-red-100",
      textClass: "text-red-700",
    },
    draft: {
      label: isArabic ? "مسودة" : "Draft",
      dotClass: "bg-slate-400",
      ringClass: "ring-slate-100",
      textClass: "text-slate-600",
    },
  };

  const currentStatus = statusData[application.status];

  const metrics = [
    {
      label: isArabic ? "المناديب" : "Riders",
      value: application.ridersCount,
      icon: Users,
    },
    {
      label: isArabic ? "قواعد العمل" : "Work Rules",
      value: application.workRulesCount,
      icon: ClipboardList,
    },
    {
      label: isArabic ? "مستويات التقييم" : "Evaluation Levels",
      value: application.evaluationLevelsCount,
      icon: ShieldCheck,
    },
    {
      label: isArabic ? "قواعد الأداء" : "Performance Rules",
      value: application.performanceRulesCount,
      icon: Activity,
    },
  ];

  return (
    <article className="flex h-full min-h-[410px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-4 inline-flex items-center gap-3">
            <span
              className={[
                "h-4 w-4 rounded-full ring-4",
                currentStatus.dotClass,
                currentStatus.ringClass,
              ].join(" ")}
              aria-hidden="true"
            />

            <span
              className={`text-xs font-black ${currentStatus.textClass}`}
            >
              {currentStatus.label}
            </span>
          </div>

          <h3 className="truncate text-xl font-black text-slate-900">
            {name}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {secondaryName}
          </p>
        </div>

        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white text-xl font-black text-white shadow-sm"
          style={{
            backgroundColor: application.logo
              ? "#ffffff"
              : application.primaryColor || "#2563eb",
          }}
        >
          {application.logo ? (
            <img
              src={application.logo}
              alt={`${name} logo`}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            application.shortName ||
            name.slice(0, 2).toUpperCase()
          )}
        </div>
      </div>

      {description && (
        <p className="mt-5 line-clamp-2 min-h-[52px] text-sm font-medium leading-7 text-slate-500">
          {description}
        </p>
      )}

      <div className="mt-6 grid grid-cols-4 divide-x divide-slate-200 rtl:divide-x-reverse">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="flex min-w-0 flex-col items-center px-2 text-center"
            >
              <Icon className="h-5 w-5 text-slate-500" />

              <strong className="mt-2 text-xl font-black text-slate-900">
                {metric.value}
              </strong>

              <span className="mt-1 line-clamp-2 text-[11px] font-bold leading-5 text-slate-500">
                {metric.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-5">
        <Link
          href={`/v2/operations/apps/${application.id}`}
          className="min-w-0 flex-1"
        >
          <Button
            fullWidth
            iconEnd={<ArrowLeft className="h-4 w-4" />}
          >
            {isArabic
              ? "عرض التطبيق"
              : "View Application"}
          </Button>
        </Link>

        <Link
          href={`/v2/settings/apps/${application.id}/edit`}
        >
          <Button
            variant="outline"
            iconStart={<Settings className="h-4 w-4" />}
          >
            {isArabic ? "الإعدادات" : "Settings"}
          </Button>
        </Link>
      </div>
    </article>
  );
}