"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  IdCard,
  RefreshCw,
  Search,
  ShieldCheck,
  TimerReset,
  Users,
  X,
} from "lucide-react";

import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";

type Lang = "ar" | "en";

type Employee = {
  id: string;
  name: string;
  iqama: string;
  iqama_expiry_date: string | null;
  phone: string | null;
  nationality: string | null;
  job_title: string | null;
  work_location: string | null;
  status: string | null;
  photo_url: string | null;
};

type RenewalRecord = {
  id: string;
  employee_id: string;
  previous_expiry_date: string | null;
  renewal_months: number;
  new_expiry_date: string;
  renewed_at: string;
};

type FilterKey =
  | "all"
  | "valid"
  | "within30"
  | "within15"
  | "within7"
  | "expired";

type RenewalMonths = 3 | 6 | 9 | 12;

export default function IqamaExpiryPage() {
  return (
    <AppLayout system="employees">
      <IqamaExpiryContent />
    </AppLayout>
  );
}

function IqamaExpiryContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [renewals, setRenewals] = useState<RenewalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [search, setSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [renewalMonths, setRenewalMonths] =
    useState<RenewalMonths>(3);
  const [renewing, setRenewing] = useState(false);

  const t = {
    title: isAr ? "متابعة صلاحية الإقامات" : "Iqama Expiry Tracking",
    subtitle: isAr
      ? "متابعة تواريخ انتهاء الإقامات والتنبيهات وتجديد الإقامة من مكان واحد."
      : "Track Iqama expiry dates, alerts and renewals from one place.",

    total: isAr ? "إجمالي الموظفين" : "Total Employees",
    valid: isAr ? "إقامات سارية" : "Valid Iqamas",
    within30: isAr ? "خلال 30 يوم" : "Within 30 Days",
    within15: isAr ? "خلال 15 يوم" : "Within 15 Days",
    within7: isAr ? "خلال 7 أيام" : "Within 7 Days",
    expired: isAr ? "إقامات منتهية" : "Expired Iqamas",

    employee: isAr ? "الموظف" : "Employee",
    iqama: isAr ? "رقم الإقامة" : "Iqama Number",
    nationality: isAr ? "الجنسية" : "Nationality",
    expiryDate: isAr ? "تاريخ الانتهاء" : "Expiry Date",
    remaining: isAr ? "المدة المتبقية" : "Remaining",
    status: isAr ? "الحالة" : "Status",
    actions: isAr ? "الإجراءات" : "Actions",
    renew: isAr ? "تجديد الإقامة" : "Renew Iqama",
    details: isAr ? "التفاصيل" : "Details",

    searchPlaceholder: isAr
      ? "ابحث باسم الموظف أو رقم الإقامة..."
      : "Search by employee name or Iqama number...",

    historySearchPlaceholder: isAr
      ? "ابحث في سجل التجديدات باسم الموظف أو رقم الإقامة..."
      : "Search renewal history by employee or Iqama...",

    noResults: isAr ? "لا توجد نتائج مطابقة" : "No matching results",

    modalTitle: isAr ? "تجديد الإقامة" : "Renew Iqama",
    currentExpiry: isAr ? "تاريخ الانتهاء الحالي" : "Current Expiry Date",
    duration: isAr ? "مدة التجديد" : "Renewal Duration",
    newExpiry: isAr ? "تاريخ الانتهاء الجديد" : "New Expiry Date",
    confirmRenewal: isAr ? "تأكيد التجديد" : "Confirm Renewal",
    cancel: isAr ? "إلغاء" : "Cancel",

    month3: isAr ? "3 أشهر" : "3 Months",
    month6: isAr ? "6 أشهر" : "6 Months",
    month9: isAr ? "9 أشهر" : "9 Months",
    month12: isAr ? "12 شهر" : "12 Months",

    historyTitle: isAr ? "سجل تجديد الإقامات" : "Iqama Renewal History",
    historySubtitle: isAr
      ? "جميع عمليات التجديد السابقة مع المدة والتاريخ القديم والجديد."
      : "All previous renewals with duration, old expiry and new expiry.",
    previousExpiry: isAr ? "الانتهاء السابق" : "Previous Expiry",
    renewalPeriod: isAr ? "مدة التجديد" : "Renewal Period",
    renewedDate: isAr ? "تاريخ التجديد" : "Renewed At",

    loading: isAr ? "جاري تحميل بيانات الإقامات..." : "Loading Iqama data...",
  };

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([loadEmployees(), loadRenewalHistory()]);
  }

  async function loadEmployees() {
    setLoading(true);

    const { data, error } = await supabase
      .from("employees")
      .select(
        `
        id,
        name,
        iqama,
        iqama_expiry_date,
        phone,
        nationality,
        job_title,
        work_location,
        status,
        photo_url
      `
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("LOAD IQAMA EMPLOYEES ERROR:", error);
      setEmployees([]);
      setLoading(false);
      return;
    }

    setEmployees((data || []) as Employee[]);
    setLoading(false);
  }

  async function loadRenewalHistory() {
    setLoadingHistory(true);

    const { data, error } = await supabase
      .from("employee_iqama_renewals")
      .select(
        `
        id,
        employee_id,
        previous_expiry_date,
        renewal_months,
        new_expiry_date,
        renewed_at
      `
      )
      .order("renewed_at", { ascending: false });

    if (error) {
      console.error("LOAD IQAMA RENEWAL HISTORY ERROR:", error);
      setRenewals([]);
      setLoadingHistory(false);
      return;
    }

    setRenewals((data || []) as RenewalRecord[]);
    setLoadingHistory(false);
  }

  const employeeMap = useMemo(() => {
    return new Map(employees.map((employee) => [employee.id, employee]));
  }, [employees]);

  const stats = useMemo(() => {
    const total = employees.length;

    const valid = employees.filter((employee) => {
      const days = getDaysRemaining(employee.iqama_expiry_date);
      return days !== null && days > 30;
    }).length;

    const within30 = employees.filter((employee) => {
      const days = getDaysRemaining(employee.iqama_expiry_date);
      return days !== null && days >= 0 && days <= 30;
    }).length;

    const within15 = employees.filter((employee) => {
      const days = getDaysRemaining(employee.iqama_expiry_date);
      return days !== null && days >= 0 && days <= 15;
    }).length;

    const within7 = employees.filter((employee) => {
      const days = getDaysRemaining(employee.iqama_expiry_date);
      return days !== null && days >= 0 && days <= 7;
    }).length;

    const expired = employees.filter((employee) => {
      const days = getDaysRemaining(employee.iqama_expiry_date);
      return days !== null && days < 0;
    }).length;

    return {
      total,
      valid,
      within30,
      within15,
      within7,
      expired,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.name?.toLowerCase().includes(query) ||
        employee.iqama?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const days = getDaysRemaining(employee.iqama_expiry_date);

      switch (activeFilter) {
        case "valid":
          return days !== null && days > 30;

        case "within30":
          return days !== null && days >= 0 && days <= 30;

        case "within15":
          return days !== null && days >= 0 && days <= 15;

        case "within7":
          return days !== null && days >= 0 && days <= 7;

        case "expired":
          return days !== null && days < 0;

        default:
          return true;
      }
    });
  }, [employees, search, activeFilter]);

  const filteredRenewals = useMemo(() => {
    const query = historySearch.trim().toLowerCase();

    if (!query) return renewals;

    return renewals.filter((record) => {
      const employee = employeeMap.get(record.employee_id);

      return (
        employee?.name?.toLowerCase().includes(query) ||
        employee?.iqama?.toLowerCase().includes(query)
      );
    });
  }, [renewals, historySearch, employeeMap]);

  const newExpiryDate = useMemo(() => {
    if (!selectedEmployee?.iqama_expiry_date) return "";

    return addMonthsSafe(
      selectedEmployee.iqama_expiry_date,
      renewalMonths
    );
  }, [selectedEmployee, renewalMonths]);

  function openRenewal(employee: Employee) {
    setSelectedEmployee(employee);
    setRenewalMonths(3);
  }

  function closeRenewal() {
    if (renewing) return;
    setSelectedEmployee(null);
    setRenewalMonths(3);
  }

  async function confirmRenewal() {
    if (!selectedEmployee?.iqama_expiry_date) {
      alert(
        isAr
          ? "لا يوجد تاريخ انتهاء حالي لهذا الموظف."
          : "This employee has no current expiry date."
      );
      return;
    }

    if (!newExpiryDate) return;

    setRenewing(true);

    const previousExpiry = selectedEmployee.iqama_expiry_date;

    const { data: renewalData, error: historyError } = await supabase
      .from("employee_iqama_renewals")
      .insert({
        employee_id: selectedEmployee.id,
        previous_expiry_date: previousExpiry,
        renewal_months: renewalMonths,
        new_expiry_date: newExpiryDate,
      })
      .select(
        "id,employee_id,previous_expiry_date,renewal_months,new_expiry_date,renewed_at"
      )
      .single();

    if (historyError) {
      console.error("SAVE IQAMA RENEWAL HISTORY ERROR:", historyError);

      alert(
        isAr
          ? `تعذر تسجيل عملية التجديد: ${historyError.message}`
          : `Could not save renewal history: ${historyError.message}`
      );

      setRenewing(false);
      return;
    }

    const { error: employeeError } = await supabase
      .from("employees")
      .update({
        iqama_expiry_date: newExpiryDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedEmployee.id);

    if (employeeError) {
      console.error("UPDATE IQAMA EXPIRY ERROR:", employeeError);

      alert(
        isAr
          ? `تم تسجيل التجديد في السجل، لكن تعذر تحديث تاريخ الإقامة: ${employeeError.message}`
          : `Renewal was logged, but Iqama expiry could not be updated: ${employeeError.message}`
      );

      setRenewing(false);
      return;
    }

    setEmployees((current) =>
      current.map((employee) =>
        employee.id === selectedEmployee.id
          ? {
              ...employee,
              iqama_expiry_date: newExpiryDate,
            }
          : employee
      )
    );

    if (renewalData) {
      setRenewals((current) => [
        renewalData as RenewalRecord,
        ...current,
      ]);
    }

    setRenewing(false);
    setSelectedEmployee(null);

    alert(
      isAr
        ? `تم تجديد الإقامة لمدة ${renewalMonths} شهر بنجاح`
        : `Iqama renewed successfully for ${renewalMonths} months`
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[460px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-bold text-slate-600">
            {t.loading}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="space-y-5 pb-10"
      >
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          <div className="h-1 bg-gradient-to-l from-blue-600 via-cyan-500 to-indigo-600" />

          <div className="flex flex-col gap-5 px-5 py-5 md:px-7 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#102a4c] text-white shadow-sm md:flex">
                <IdCard className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#102a4c] md:text-3xl">
                  {t.title}
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  {t.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadAll}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                {isAr ? "تحديث" : "Refresh"}
              </button>

              <Link
                href="/employees/list"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Users className="h-4 w-4" />
                {isAr ? "قائمة الموظفين" : "Employees"}
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            title={t.total}
            value={stats.total}
            icon={<Users className="h-5 w-5" />}
            tone="blue"
          />

          <StatCard
            active={activeFilter === "valid"}
            onClick={() => setActiveFilter("valid")}
            title={t.valid}
            value={stats.valid}
            icon={<ShieldCheck className="h-5 w-5" />}
            tone="green"
          />

          <StatCard
            active={activeFilter === "within30"}
            onClick={() => setActiveFilter("within30")}
            title={t.within30}
            value={stats.within30}
            icon={<CalendarClock className="h-5 w-5" />}
            tone="blue"
          />

          <StatCard
            active={activeFilter === "within15"}
            onClick={() => setActiveFilter("within15")}
            title={t.within15}
            value={stats.within15}
            icon={<Clock3 className="h-5 w-5" />}
            tone="amber"
          />

          <StatCard
            active={activeFilter === "within7"}
            onClick={() => setActiveFilter("within7")}
            title={t.within7}
            value={stats.within7}
            icon={<AlertTriangle className="h-5 w-5" />}
            tone="red"
          />

          <StatCard
            active={activeFilter === "expired"}
            onClick={() => setActiveFilter("expired")}
            title={t.expired}
            value={stats.expired}
            icon={<TimerReset className="h-5 w-5" />}
            tone="red"
          />
        </section>

        {/* SEARCH */}
        <section className="rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative">
            <Search
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                isAr ? "right-4" : "left-4"
              }`}
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.searchPlaceholder}
              className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
                isAr ? "pr-11 pl-10" : "pl-11 pr-10"
              }`}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={`absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${
                  isAr ? "left-3" : "right-3"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* CURRENT IQAMAS */}
        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-black text-[#102a4c]">
                {isAr ? "سجل صلاحية الإقامات" : "Iqama Validity Register"}
              </h2>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                {isAr
                  ? "يعتمد التنبيه على تاريخ انتهاء الإقامة المسجل لكل موظف."
                  : "Alerts are calculated from each employee's stored Iqama expiry date."}
              </p>
            </div>

            <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-[#102a4c]">
              {filteredEmployees.length}
            </span>
          </div>

          {filteredEmployees.length === 0 ? (
            <EmptyState text={t.noResults} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <TableHead>{t.employee}</TableHead>
                    <TableHead>{t.iqama}</TableHead>
                    <TableHead>{t.nationality}</TableHead>
                    <TableHead>{t.expiryDate}</TableHead>
                    <TableHead>{t.remaining}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-center">
                      {t.actions}
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => {
                    const days = getDaysRemaining(
                      employee.iqama_expiry_date
                    );

                    const expiryState = getExpiryState(
                      employee.iqama_expiry_date,
                      lang
                    );

                    return (
                      <tr
                        key={employee.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-blue-50/30"
                      >
                        <td className="px-4 py-3.5">
                          <EmployeeCell employee={employee} lang={lang} />
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            dir="ltr"
                            className="text-sm font-bold text-slate-700"
                          >
                            {employee.iqama || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-sm font-bold text-slate-600">
                          {nationalityText(employee.nationality, lang)}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="text-sm font-black text-[#102a4c]">
                            {formatDate(
                              employee.iqama_expiry_date,
                              lang
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <RemainingDays
                            days={days}
                            lang={lang}
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <ExpiryBadge
                            state={expiryState}
                          />
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openRenewal(employee)}
                              disabled={!employee.iqama_expiry_date}
                              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              {t.renew}
                            </button>

                            <Link
                              href={`/employees/${employee.id}`}
                              className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50"
                            >
                              {t.details}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RENEWAL HISTORY */}
        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <History className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-base font-black text-[#102a4c]">
                    {t.historyTitle}
                  </h2>

                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    {t.historySubtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isAr ? "right-4" : "left-4"
                }`}
              />

              <input
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder={t.historySearchPlaceholder}
                className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
                  isAr ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
            </div>
          </div>

          {loadingHistory ? (
            <div className="p-8 text-center text-sm font-bold text-slate-500">
              {isAr ? "جاري تحميل سجل التجديدات..." : "Loading renewal history..."}
            </div>
          ) : filteredRenewals.length === 0 ? (
            <EmptyState
              text={
                isAr
                  ? "لا توجد عمليات تجديد مسجلة حتى الآن"
                  : "No renewal records yet"
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <TableHead>{t.employee}</TableHead>
                    <TableHead>{t.iqama}</TableHead>
                    <TableHead>{t.previousExpiry}</TableHead>
                    <TableHead>{t.renewalPeriod}</TableHead>
                    <TableHead>{t.newExpiry}</TableHead>
                    <TableHead>{t.renewedDate}</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredRenewals.map((record) => {
                    const employee = employeeMap.get(record.employee_id);

                    return (
                      <tr
                        key={record.id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3.5">
                          {employee ? (
                            <EmployeeCell employee={employee} lang={lang} compact />
                          ) : (
                            <span className="text-sm font-bold text-slate-400">
                              {isAr ? "موظف غير موجود" : "Employee unavailable"}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span dir="ltr" className="text-sm font-bold text-slate-700">
                            {employee?.iqama || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-sm font-bold text-slate-600">
                          {formatDate(record.previous_expiry_date, lang)}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
                            {isAr
                              ? `${record.renewal_months} شهر`
                              : `${record.renewal_months} Months`}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="text-sm font-black text-emerald-700">
                            {formatDate(record.new_expiry_date, lang)}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-sm font-bold text-slate-600">
                          {formatDateTime(record.renewed_at, lang)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* RENEWAL MODAL */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-black text-[#102a4c]">
                  {t.modalTitle}
                </h2>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  {selectedEmployee.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRenewal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DateCard
                  label={t.currentExpiry}
                  value={formatDate(
                    selectedEmployee.iqama_expiry_date,
                    lang
                  )}
                />

                <DateCard
                  label={t.newExpiry}
                  value={formatDate(newExpiryDate, lang)}
                  highlight
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-black text-[#102a4c]">
                  {t.duration}
                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { value: 3 as RenewalMonths, label: t.month3 },
                    { value: 6 as RenewalMonths, label: t.month6 },
                    { value: 9 as RenewalMonths, label: t.month9 },
                    { value: 12 as RenewalMonths, label: t.month12 },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRenewalMonths(option.value)}
                      className={`h-11 rounded-xl border text-sm font-extrabold transition ${
                        renewalMonths === option.value
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-start gap-3">
                  <History className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                  <p className="text-xs font-bold leading-6 text-blue-700">
                    {isAr
                      ? "عند التأكيد سيتم تسجيل عملية التجديد في سجل التجديدات، ثم تحديث تاريخ انتهاء الإقامة الجديد وبدء حساب التنبيهات من التاريخ الجديد."
                      : "On confirmation, the renewal will be stored in the renewal history, the new expiry date will be saved, and alerts will restart from the new date."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
              <button
                type="button"
                onClick={closeRenewal}
                disabled={renewing}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={confirmRenewal}
                disabled={renewing}
                className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {renewing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}

                {renewing
                  ? isAr
                    ? "جاري التجديد..."
                    : "Renewing..."
                  : t.confirmRenewal}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone,
  active,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone: "blue" | "green" | "amber" | "red";
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      value: "text-blue-700",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      value: "text-emerald-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      value: "text-amber-700",
    },
    red: {
      icon: "bg-red-50 text-red-700",
      value: "text-red-700",
    },
  };

  const current = tones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-blue-400 ring-4 ring-blue-50"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-slate-500">
            {title}
          </p>

          <p className={`mt-2 text-3xl font-black ${current.value}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${current.icon}`}
        >
          {icon}
        </div>
      </div>
    </button>
  );
}

function EmployeeCell({
  employee,
  lang,
  compact = false,
}: {
  employee: Employee;
  lang: Lang;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {employee.photo_url ? (
        <img
          src={employee.photo_url}
          alt={employee.name}
          className={`${compact ? "h-9 w-9" : "h-10 w-10"} rounded-xl object-cover ring-1 ring-slate-200`}
        />
      ) : (
        <div
          className={`flex ${compact ? "h-9 w-9" : "h-10 w-10"} items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700 ring-1 ring-blue-100`}
        >
          {getInitials(employee.name)}
        </div>
      )}

      <div className="min-w-0">
        <Link
          href={`/employees/${employee.id}`}
          className="block max-w-[230px] truncate text-sm font-black text-[#102a4c] hover:text-blue-600"
        >
          {employee.name}
        </Link>

        {!compact && (
          <p className="mt-0.5 text-[10px] font-bold text-slate-400">
            {workLocationText(employee.work_location, lang)}
          </p>
        )}
      </div>
    </div>
  );
}

function TableHead({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-start text-xs font-black text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

function RemainingDays({
  days,
  lang,
}: {
  days: number | null;
  lang: Lang;
}) {
  if (days === null) {
    return (
      <span className="text-xs font-bold text-slate-400">
        {lang === "ar" ? "غير مسجل" : "Not Set"}
      </span>
    );
  }

  if (days < 0) {
    return (
      <span className="text-sm font-black text-red-600">
        {lang === "ar"
          ? `منتهية منذ ${Math.abs(days)} يوم`
          : `Expired ${Math.abs(days)} days ago`}
      </span>
    );
  }

  if (days === 0) {
    return (
      <span className="text-sm font-black text-red-600">
        {lang === "ar" ? "تنتهي اليوم" : "Expires today"}
      </span>
    );
  }

  return (
    <span className="text-sm font-black text-[#102a4c]">
      {lang === "ar"
        ? `${days} يوم`
        : `${days} days`}
    </span>
  );
}

function ExpiryBadge({
  state,
}: {
  state: ReturnType<typeof getExpiryState>;
}) {
  const styles = {
    green:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    blue:
      "border-blue-100 bg-blue-50 text-blue-700",
    amber:
      "border-amber-100 bg-amber-50 text-amber-700",
    red:
      "border-red-100 bg-red-50 text-red-700",
    slate:
      "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-black ${styles[state.tone]}`}
    >
      {state.label}
    </span>
  );
}

function DateCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-xs font-bold text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-black ${
          highlight
            ? "text-blue-700"
            : "text-[#102a4c]"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Search className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-sm font-black text-[#102a4c]">
        {text}
      </h3>
    </div>
  );
}

function getDaysRemaining(value: string | null) {
  if (!value) return null;

  const expiry = new Date(`${value}T00:00:00`);

  if (Number.isNaN(expiry.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function getExpiryState(
  value: string | null,
  lang: Lang
) {
  const days = getDaysRemaining(value);
  const isAr = lang === "ar";

  if (days === null) {
    return {
      label: isAr ? "غير مسجل" : "Not Set",
      tone: "slate" as const,
    };
  }

  if (days < 0) {
    return {
      label: isAr ? "منتهية" : "Expired",
      tone: "red" as const,
    };
  }

  if (days <= 7) {
    return {
      label: isAr ? "تنبيه عاجل" : "Urgent",
      tone: "red" as const,
    };
  }

  if (days <= 15) {
    return {
      label: isAr ? "تنبيه مهم" : "Important",
      tone: "amber" as const,
    };
  }

  if (days <= 30) {
    return {
      label: isAr ? "تنبيه خفيف" : "Light Alert",
      tone: "blue" as const,
    };
  }

  return {
    label: isAr ? "سارية" : "Valid",
    tone: "green" as const,
  };
}

function addMonthsSafe(
  dateString: string,
  months: number
) {
  if (!dateString) return "";

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  if (!year || !month || !day) return "";

  const targetMonthIndex = month - 1 + months;

  const targetYear =
    year + Math.floor(targetMonthIndex / 12);

  const normalizedMonth =
    ((targetMonthIndex % 12) + 12) % 12;

  const lastDayOfTargetMonth = new Date(
    targetYear,
    normalizedMonth + 1,
    0
  ).getDate();

  const safeDay = Math.min(
    day,
    lastDayOfTargetMonth
  );

  const result = new Date(
    targetYear,
    normalizedMonth,
    safeDay
  );

  const yyyy = result.getFullYear();
  const mm = String(
    result.getMonth() + 1
  ).padStart(2, "0");
  const dd = String(
    result.getDate()
  ).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(
  value: string | null,
  lang: Lang
) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    lang === "ar" ? "ar-SA" : "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(value: string, lang: Lang) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(
    lang === "ar" ? "ar-SA" : "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function getInitials(
  name: string | null | undefined
) {
  if (!name) return "?";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0] || ""}${
    parts[1][0] || ""
  }`.toUpperCase();
}

function workLocationText(
  value: string | null,
  lang: Lang
) {
  if (!value) return "-";

  const map: Record<
    string,
    { ar: string; en: string }
  > = {
    Keeta: {
      ar: "كيتا",
      en: "Keeta",
    },

    HungerStation: {
      ar: "هنجرستيشن",
      en: "HungerStation",
    },

    KeetaAndHungerStation: {
      ar: "كيتا وهنجرستيشن",
      en: "Keeta & HungerStation",
    },

    management: {
      ar: "الإدارة",
      en: "Management",
    },

    maintenance: {
      ar: "الصيانة",
      en: "Maintenance",
    },
  };

  return map[value]?.[lang] || value;
}

function nationalityText(
  value: string | null,
  lang: Lang
) {
  if (!value) return "-";

  const map: Record<
    string,
    { ar: string; en: string }
  > = {
    Bangladesh: {
      ar: "بنجلاديش",
      en: "Bangladesh",
    },

    Pakistan: {
      ar: "باكستان",
      en: "Pakistan",
    },

    India: {
      ar: "الهند",
      en: "India",
    },

    Egypt: {
      ar: "مصر",
      en: "Egypt",
    },

    Sudan: {
      ar: "السودان",
      en: "Sudan",
    },

    Yemen: {
      ar: "اليمن",
      en: "Yemen",
    },

    "Saudi Arabia": {
      ar: "السعودية",
      en: "Saudi Arabia",
    },
  };

  return map[value]?.[lang] || value;
}
