"use client";

import Link from "next/link";
import {
  AppWindow,
  CircleCheck,
  CirclePause,
  Edit3,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";
import Button from "@/ui/button/Button";
import { applications } from "../../../apps/mock/applications";

export default function AppsSettingsPage() {
  const { lang } = useSystem();
  const isArabic = lang === "ar";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <AppWindow className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {isArabic
                  ? "إعدادات التطبيقات"
                  : "Application Settings"}
              </h1>

              <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                {isArabic
                  ? "إضافة تطبيقات التوصيل وإدارة الشعار والحالة وقواعد العمل والأداء والتقييم."
                  : "Add delivery applications and manage logos, status, work rules, performance rules, and evaluations."}
              </p>
            </div>
          </div>

          <Link href="/v2/settings/apps/new">
            <Button
              size="lg"
              iconStart={<Plus className="h-5 w-5" />}
            >
              {isArabic ? "إضافة تطبيق" : "Add Application"}
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {applications.map((application) => {
          const name = isArabic
            ? application.nameAr
            : application.nameEn;

          const secondaryName = isArabic
            ? application.nameEn
            : application.nameAr;

          const active = application.status === "active";
          const draft = application.status === "draft";

          return (
            <article
              key={application.id}
              className="flex min-h-[290px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 text-lg font-black text-white shadow-sm"
                    style={{
                      backgroundColor: application.logo
                        ? "#ffffff"
                        : application.primaryColor || "#2563eb",
                    }}
                  >
                    {application.logo ? (
                      <img
                        src={application.logo}
                        alt={name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      application.shortName ||
                      name.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-slate-900">
                      {name}
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {secondaryName}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2">
                      <span
                        className={[
                          "h-3.5 w-3.5 rounded-full",
                          active
                            ? "bg-emerald-500"
                            : draft
                            ? "bg-slate-400"
                            : "bg-red-500",
                        ].join(" ")}
                      />

                      <span
                        className={[
                          "text-xs font-black",
                          active
                            ? "text-emerald-700"
                            : draft
                            ? "text-slate-600"
                            : "text-red-700",
                        ].join(" ")}
                      >
                        {active
                          ? isArabic
                            ? "نشط"
                            : "Active"
                          : draft
                          ? isArabic
                            ? "مسودة"
                            : "Draft"
                          : isArabic
                          ? "متوقف"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {active ? (
                  <CircleCheck className="h-6 w-6 shrink-0 text-emerald-500" />
                ) : (
                  <CirclePause className="h-6 w-6 shrink-0 text-slate-400" />
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <strong className="block text-xl font-black text-slate-900">
                    {application.workRulesCount}
                  </strong>
                  <span className="mt-1 block text-[11px] font-bold text-slate-500">
                    {isArabic ? "قواعد العمل" : "Work Rules"}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <strong className="block text-xl font-black text-slate-900">
                    {application.performanceRulesCount}
                  </strong>
                  <span className="mt-1 block text-[11px] font-bold text-slate-500">
                    {isArabic
                      ? "قواعد الأداء"
                      : "Performance Rules"}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <strong className="block text-xl font-black text-slate-900">
                    {application.evaluationLevelsCount}
                  </strong>
                  <span className="mt-1 block text-[11px] font-bold text-slate-500">
                    {isArabic ? "مستويات التقييم" : "Evaluation"}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={`/v2/settings/apps/${application.id}/edit`}
                  className="min-w-0 flex-1"
                >
                  <Button
                    fullWidth
                    variant="outline"
                    iconStart={<Edit3 className="h-4 w-4" />}
                  >
                    {isArabic ? "تعديل" : "Edit"}
                  </Button>
                </Link>

                <Link
                  href={`/v2/settings/apps/${application.id}/rules`}
                >
                  <Button
                    variant="secondary"
                    iconStart={<ShieldCheck className="h-4 w-4" />}
                  >
                    {isArabic ? "القواعد" : "Rules"}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  aria-label={isArabic ? "خيارات التطبيق" : "App options"}
                  iconStart={<Settings2 className="h-4 w-4" />}
                >
                  {isArabic ? "خيارات" : "Options"}
                </Button>
              </div>
            </article>
          );
        })}
      </section>

      {applications.length === 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <AppWindow className="mx-auto h-12 w-12 text-slate-400" />

          <h2 className="mt-4 text-xl font-black text-slate-900">
            {isArabic
              ? "لا توجد تطبيقات مضافة"
              : "No applications added"}
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {isArabic
              ? "ابدأ بإضافة أول تطبيق توصيل للنظام."
              : "Start by adding the first delivery application."}
          </p>

          <div className="mt-5">
            <Link href="/v2/settings/apps/new">
              <Button iconStart={<Plus className="h-5 w-5" />}>
                {isArabic ? "إضافة تطبيق" : "Add Application"}
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}