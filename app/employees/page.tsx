"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout, { useLanguage } from "../../components/AppLayout";
import { supabase } from "../lib/supabase";
import {
  Users,
  UserCheck,
  ShieldAlert,
  CalendarDays,
  UserPlus,
  BriefcaseBusiness,
  MapPin,
  Activity,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

type Lang = "ar" | "en";

type EmployeeRow = {
  id: string;
  name: string | null;
  iqama: string | null;
  phone: string | null;
  nationality: string | null;
  job_title: string | null;
  work_location: string | null;
  status: string | null;
  performance: string | null;
  created_at: string | null;
};

export default function EmployeesPage() {
  return (
    <AppLayout system="employees">
      <EmployeesDashboardContent />
    </AppLayout>
  );
}

function EmployeesDashboardContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("employees")
      .select(
        "id, name, iqama, phone, nationality, job_title, work_location, status, performance, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("EMPLOYEES DASHBOARD ERROR:", error);
      setEmployees([]);
      setErrorMessage(
        isAr
          ? "تعذر تحميل بيانات الموظفين. راجع اتصال Supabase وصلاحيات جدول employees."
          : "Could not load employees. Check Supabase connection and employees table permissions."
      );
      setLoading(false);
      return;
    }

    setEmployees((data || []) as EmployeeRow[]);
    setLoading(false);
  }

  const text = {
    title: isAr ? "لوحة تحكم الموظفين" : "Employees Dashboard",
    subtitle: isAr
      ? "نظرة مباشرة على بيانات الموظفين والمناديب المسجلة في النظام"
      : "A live overview of employees and couriers registered in the system",

    totalEmployees: isAr ? "إجمالي الموظفين" : "Total Employees",
    activeEmployees: isAr ? "الموظفون النشطون" : "Active Employees",
    stoppedEmployees: isAr ? "الموظفون الموقوفون" : "Stopped Employees",
    vacationEmployees: isAr ? "الموظفون في إجازة" : "Employees on Vacation",
    newThisMonth: isAr ? "المضافون هذا الشهر" : "Added This Month",

    performanceTitle: isAr
      ? "مؤشر أداء الموظفين"
      : "Employees Performance Indicator",
    performanceAverage: isAr ? "متوسط الأداء المسجل" : "Recorded Performance Average",

    employeeStatus: isAr ? "حالة الموظفين" : "Employees Status",
    active: isAr ? "نشط" : "Active",
    stopped: isAr ? "موقوف" : "Stopped",
    vacation: isAr ? "إجازة" : "Vacation",
    outOfService: isAr ? "خارج الخدمة" : "Out of Service",

    employeesByJob: isAr
      ? "الموظفون حسب المسمى الوظيفي"
      : "Employees by Job Title",

    employeesByLocation: isAr
      ? "الموظفون حسب موقع العمل"
      : "Employees by Work Location",

    latestEmployees: isAr
      ? "أحدث الموظفين المضافين"
      : "Recently Added Employees",

    employee: isAr ? "الموظف" : "Employee",
    jobTitle: isAr ? "المسمى الوظيفي" : "Job Title",
    workLocation: isAr ? "موقع العمل" : "Work Location",
    status: isAr ? "الحالة" : "Status",
    addedDate: isAr ? "تاريخ الإضافة" : "Added Date",

    viewAll: isAr ? "عرض جميع الموظفين" : "View All Employees",
    noEmployees: isAr ? "لا توجد بيانات موظفين حتى الآن" : "No employee data yet",
    loading: isAr ? "جاري تحميل بيانات الموظفين..." : "Loading employees data...",
    retry: isAr ? "إعادة المحاولة" : "Retry",
    noJobTitle: isAr ? "غير محدد" : "Not Specified",
    noLocation: isAr ? "غير محدد" : "Not Specified",
  };

  const normalizedEmployees = useMemo(
    () =>
      employees.map((employee) => ({
        ...employee,
        normalizedStatus: normalizeStatus(employee.status),
        normalizedPerformance: normalizePerformance(employee.performance),
      })),
    [employees]
  );

  const stats = useMemo(() => {
    const now = new Date();

    return {
      total: normalizedEmployees.length,
      active: normalizedEmployees.filter(
        (employee) => employee.normalizedStatus === "active"
      ).length,
      stopped: normalizedEmployees.filter(
        (employee) => employee.normalizedStatus === "stopped"
      ).length,
      vacation: normalizedEmployees.filter(
        (employee) => employee.normalizedStatus === "vacation"
      ).length,
      outOfService: normalizedEmployees.filter(
        (employee) => employee.normalizedStatus === "outOfService"
      ).length,
      newThisMonth: normalizedEmployees.filter((employee) =>
        isSameMonth(employee.created_at, now)
      ).length,
    };
  }, [normalizedEmployees]);

  const performanceAverage = useMemo(() => {
    const scoredEmployees = normalizedEmployees
      .map((employee) => performanceScore(employee.normalizedPerformance))
      .filter((score): score is number => score !== null);

    if (scoredEmployees.length === 0) return 0;

    return Math.round(
      scoredEmployees.reduce((sum, score) => sum + score, 0) /
        scoredEmployees.length
    );
  }, [normalizedEmployees]);

  const jobData = useMemo(
    () =>
      buildGroupedData(
        employees,
        (employee) => employee.job_title || "",
        (value) => jobTitleText(value, lang),
        text.noJobTitle
      ),
    [employees, lang, text.noJobTitle]
  );

  const locationData = useMemo(
    () =>
      buildGroupedData(
        employees,
        (employee) => employee.work_location || "",
        (value) => workLocationText(value, lang),
        text.noLocation
      ),
    [employees, lang, text.noLocation]
  );

  const latestEmployees = employees.slice(0, 6);

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              {text.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{text.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {loading && (
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                {text.loading}
              </span>
            )}

            <div className="rounded-2xl bg-blue-50 p-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <p className="font-bold text-red-700">{errorMessage}</p>
          <button
            onClick={loadEmployees}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            {text.retry}
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title={text.totalEmployees}
          value={stats.total}
          icon={<Users className="h-7 w-7 text-blue-600" />}
          bg="bg-blue-50"
        />
        <StatCard
          title={text.activeEmployees}
          value={stats.active}
          icon={<UserCheck className="h-7 w-7 text-green-600" />}
          bg="bg-green-50"
        />
        <StatCard
          title={text.stoppedEmployees}
          value={stats.stopped}
          icon={<ShieldAlert className="h-7 w-7 text-red-600" />}
          bg="bg-red-50"
        />
        <StatCard
          title={text.vacationEmployees}
          value={stats.vacation}
          icon={<CalendarDays className="h-7 w-7 text-orange-600" />}
          bg="bg-orange-50"
        />
        <StatCard
          title={text.newThisMonth}
          value={stats.newThisMonth}
          icon={<UserPlus className="h-7 w-7 text-purple-600" />}
          bg="bg-purple-50"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">
              {text.performanceTitle}
            </h3>
            <Activity className="h-6 w-6 text-green-600" />
          </div>

          <div className="mt-8 flex items-center justify-center">
            <div
              className="relative flex h-48 w-48 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#22c55e ${performanceAverage}%, #e2e8f0 ${performanceAverage}% 100%)`,
              }}
            >
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <h2 className="text-5xl font-black text-slate-900">
                    {performanceAverage}%
                  </h2>
                  <p className="mt-2 px-3 text-xs font-bold text-slate-500">
                    {text.performanceAverage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">
            {text.employeeStatus}
          </h3>

          <div className="mt-8 space-y-5">
            <StatusBar
              title={text.active}
              value={stats.active}
              percentage={getPercentage(stats.active, stats.total)}
              color="bg-green-500"
            />
            <StatusBar
              title={text.stopped}
              value={stats.stopped}
              percentage={getPercentage(stats.stopped, stats.total)}
              color="bg-red-500"
            />
            <StatusBar
              title={text.vacation}
              value={stats.vacation}
              percentage={getPercentage(stats.vacation, stats.total)}
              color="bg-orange-500"
            />
            <StatusBar
              title={text.outOfService}
              value={stats.outOfService}
              percentage={getPercentage(stats.outOfService, stats.total)}
              color="bg-slate-500"
            />
          </div>
        </div>

        <DistributionCard
          title={text.employeesByJob}
          icon={<BriefcaseBusiness className="h-6 w-6 text-blue-600" />}
          rows={jobData}
          emptyText={text.noEmployees}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DistributionCard
          title={text.employeesByLocation}
          icon={<MapPin className="h-6 w-6 text-orange-600" />}
          rows={locationData}
          emptyText={text.noEmployees}
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-black text-slate-900">
              {text.latestEmployees}
            </h3>

            <Link
              href="/employees/list"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700 hover:bg-blue-100"
            >
              {text.viewAll}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
            {latestEmployees.length === 0 ? (
              <div className="p-10 text-center font-bold text-slate-400">
                {loading ? text.loading : text.noEmployees}
              </div>
            ) : (
              <table
                dir={isAr ? "rtl" : "ltr"}
                className="w-full min-w-[760px] text-sm"
              >
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4 text-start">{text.employee}</th>
                    <th className="p-4 text-start">{text.jobTitle}</th>
                    <th className="p-4 text-start">{text.workLocation}</th>
                    <th className="p-4 text-start">{text.status}</th>
                    <th className="p-4 text-start">{text.addedDate}</th>
                  </tr>
                </thead>

                <tbody>
                  {latestEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4 font-extrabold text-[#0f2544]">
                        <Link
                          href={`/employees/${employee.id}`}
                          className="hover:text-blue-700 hover:underline"
                        >
                          {employee.name || "-"}
                        </Link>
                      </td>
                      <td className="p-4 font-bold text-slate-600">
                        {jobTitleText(employee.job_title || "", lang) ||
                          text.noJobTitle}
                      </td>
                      <td className="p-4 font-bold text-slate-600">
                        {workLocationText(employee.work_location || "", lang) ||
                          text.noLocation}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            employee.status || ""
                          )}`}
                        >
                          {statusText(employee.status || "", lang)}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-500">
                        {formatDate(employee.created_at, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  bg,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h2 className="mt-3 text-5xl font-black text-slate-900">{value}</h2>
        </div>
        <div className={`rounded-2xl ${bg} p-4`}>{icon}</div>
      </div>
    </div>
  );
}

function StatusBar({
  title,
  value,
  percentage,
  color,
}: {
  title: string;
  value: number;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{title}</span>
        <span>
          {value} ({percentage}%)
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function DistributionCard({
  title,
  icon,
  rows,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { title: string; value: number }[];
  emptyText: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900">{title}</h3>
        {icon}
      </div>

      <div className="mt-7 space-y-4">
        {rows.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-400">
            {emptyText}
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.title}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
            >
              <span className="font-bold text-slate-700">{row.title}</span>
              <span className="rounded-xl bg-white px-3 py-1 font-black text-[#0f2544] shadow-sm">
                {row.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function buildGroupedData(
  employees: EmployeeRow[],
  getValue: (employee: EmployeeRow) => string,
  getLabel: (value: string) => string,
  emptyLabel: string
) {
  const counts = new Map<string, number>();

  employees.forEach((employee) => {
    const originalValue = getValue(employee).trim();
    const label = originalValue ? getLabel(originalValue) : emptyLabel;
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([title, value]) => ({ title, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function normalizeStatus(status: string | null) {
  const value = String(status || "").trim().toLowerCase();

  if (["active", "نشط"].includes(value)) return "active";
  if (["stopped", "متوقف", "موقوف"].includes(value)) return "stopped";
  if (["vacation", "إجازة", "اجازة"].includes(value)) return "vacation";
  if (
    ["outofservice", "out_of_service", "out of service", "خارج الخدمة"].includes(
      value
    )
  ) {
    return "outOfService";
  }

  return value || "unknown";
}

function normalizePerformance(performance: string | null) {
  const value = String(performance || "").trim().toLowerCase();

  if (["excellent", "ممتاز"].includes(value)) return "excellent";
  if (["good", "جيد"].includes(value)) return "good";
  if (["average", "متوسط"].includes(value)) return "average";
  if (["weak", "poor", "ضعيف"].includes(value)) return "weak";

  return "unknown";
}

function performanceScore(performance: string) {
  const scores: Record<string, number> = {
    excellent: 100,
    good: 75,
    average: 50,
    weak: 25,
  };

  return scores[performance] ?? null;
}

function getPercentage(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function isSameMonth(dateValue: string | null, targetDate: Date) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth()
  );
}

function formatDate(dateValue: string | null, lang: Lang) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function statusText(status: string, lang: Lang) {
  const normalized = normalizeStatus(status);

  const map: Record<string, { ar: string; en: string }> = {
    active: { ar: "نشط", en: "Active" },
    stopped: { ar: "موقوف", en: "Stopped" },
    vacation: { ar: "إجازة", en: "Vacation" },
    outOfService: { ar: "خارج الخدمة", en: "Out of Service" },
    unknown: { ar: "غير محدد", en: "Not Specified" },
  };

  return map[normalized]?.[lang] || status || map.unknown[lang];
}

function statusClass(status: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "active") return "bg-green-50 text-green-700";
  if (normalized === "stopped") return "bg-red-50 text-red-700";
  if (normalized === "vacation") return "bg-orange-50 text-orange-700";
  if (normalized === "outOfService") return "bg-slate-200 text-slate-700";

  return "bg-slate-100 text-slate-600";
}

function workLocationText(location: string, lang: Lang) {
  const map: Record<string, { ar: string; en: string }> = {
    Keeta: { ar: "كيتا", en: "Keeta" },
    keeta: { ar: "كيتا", en: "Keeta" },
    HungerStation: { ar: "هنجرستيشن", en: "HungerStation" },
    hungerstation: { ar: "هنجرستيشن", en: "HungerStation" },
    management: { ar: "الإدارة", en: "Management" },
    maintenance: { ar: "الصيانة", en: "Maintenance" },
    "الإدارة": { ar: "الإدارة", en: "Management" },
    "الصيانة": { ar: "الصيانة", en: "Maintenance" },
  };

  return map[location]?.[lang] || location;
}

function jobTitleText(jobTitle: string, lang: Lang) {
  const map: Record<string, { ar: string; en: string }> = {
    keetaCourier: { ar: "مندوب كيتا", en: "Keeta Courier" },
    hungerCourier: { ar: "مندوب هنجرستيشن", en: "HungerStation Courier" },
    supervisor: { ar: "مشرف", en: "Supervisor" },
    mechanic: { ar: "ميكانيكي", en: "Mechanic" },
    maintenanceOfficer: { ar: "مسؤول الصيانة", en: "Maintenance Officer" },
    fleetManager: { ar: "مدير الأسطول", en: "Fleet Manager" },
    admin: { ar: "إداري", en: "Administrator" },

    "مندوب كيتا": { ar: "مندوب كيتا", en: "Keeta Courier" },
    "مندوب هنقرستيشن": {
      ar: "مندوب هنجرستيشن",
      en: "HungerStation Courier",
    },
    "مندوب هنجرستيشن": {
      ar: "مندوب هنجرستيشن",
      en: "HungerStation Courier",
    },
    "مشرف": { ar: "مشرف", en: "Supervisor" },
    "ميكانيكي": { ar: "ميكانيكي", en: "Mechanic" },
    "مسؤول الصيانة": {
      ar: "مسؤول الصيانة",
      en: "Maintenance Officer",
    },
    "مدير الأسطول": { ar: "مدير الأسطول", en: "Fleet Manager" },
    "إداري": { ar: "إداري", en: "Administrator" },
  };

  return map[jobTitle]?.[lang] || jobTitle;
}