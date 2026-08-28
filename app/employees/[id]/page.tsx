"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
  User,
  Wallet,
} from "lucide-react";

type Lang = "ar" | "en";

type Employee = {
  id: string;
  name: string;
  iqama: string;
  iqama_expiry_date: string | null;
  phone: string | null;
  email: string | null;
  nationality: string | null;
  job_title: string | null;
  work_location: string | null;
  status: string | null;
  performance: string | null;
  start_date: string | null;
  base_salary: number | string | null;
  target: number | string | null;
  half_target: number | string | null;
  target_deductions: number | string | null;
  vehicle_number: string | null;
  platform_id: string | null;
  keeta_id: string | null;
  hunger_id: string | null;
  notes: string | null;

  photo_url: string | null;
  iqama_file_url: string | null;
  license_file_url: string | null;
  qiwa_file_url: string | null;
  custody_file_url: string | null;
  other_docs_url: string | null;
};

type EmployeeCase = {
  id: string;
  case_number: string;
  employee_id: string;
  violation_type: string;
  severity: string;
  status: string;
  current_action: string | null;
  description: string | null;
  created_at: string;
  is_closed: boolean;
};

type ExpiryState = {
  days: number | null;
  label: string;
  shortLabel: string;
  tone: "green" | "blue" | "amber" | "red" | "slate";
};

export default function EmployeeDetailsPage() {
  return (
    <AppLayout
      system="employees"
      titleKey="employeeDetails"
      subtitleKey="editEmployeeSubtitle"
    >
      <EmployeeDetailsContent />
    </AppLayout>
  );
}

function EmployeeDetailsContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const params = useParams();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeCases, setEmployeeCases] = useState<EmployeeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCases, setLoadingCases] = useState(true);

  const t = {
    back: isAr ? "الرجوع لقائمة الموظفين" : "Back To Employees",
    edit: isAr ? "تعديل بيانات الموظف" : "Edit Employee",
    loading: isAr ? "جاري تحميل بيانات الموظف..." : "Loading employee data...",
    notFound: isAr ? "لم يتم العثور على الموظف" : "Employee Not Found",

    personalInfo: isAr ? "البيانات الشخصية" : "Personal Information",
    workInfo: isAr ? "بيانات العمل" : "Work Information",
    salaryInfo: isAr ? "بيانات الراتب والتارجت" : "Salary & Target",
    documents: isAr ? "المستندات والمرفقات" : "Documents & Attachments",
    warnings: isAr ? "المخالفات والإنذارات" : "Cases & Warnings",
    notes: isAr ? "الملاحظات" : "Notes",

    status: isAr ? "حالة الموظف" : "Employee Status",
    iqamaValidity: isAr ? "صلاحية الإقامة" : "Iqama Validity",
    baseSalary: isAr ? "الراتب الأساسي" : "Base Salary",
    vehicle: isAr ? "المركبة" : "Vehicle",

    iqama: isAr ? "رقم الإقامة" : "Iqama Number",
    iqamaExpiry: isAr ? "تاريخ انتهاء الإقامة" : "Iqama Expiry Date",
    phone: isAr ? "رقم الجوال" : "Phone Number",
    email: isAr ? "البريد الإلكتروني" : "Email",
    nationality: isAr ? "الجنسية" : "Nationality",
    startDate: isAr ? "تاريخ بداية العمل" : "Start Date",

    jobTitle: isAr ? "المسمى الوظيفي" : "Job Title",
    workLocation: isAr ? "موقع العمل" : "Work Location",
    vehicleNumber: isAr ? "رقم المركبة / الدباب" : "Vehicle Number",
    platform: isAr ? "المنصة" : "Platform",
    keetaId: isAr ? "معرف كيتا" : "Keeta ID",
    hungerId: isAr ? "معرف هنجرستيشن" : "HungerStation ID",

    target: isAr ? "التارجت" : "Target",
    additionalTarget: isAr ? "إضافي التارجت" : "Additional Target",
    targetDeductions: isAr ? "استقطاعات التارجت" : "Target Deductions",

    noWarnings: isAr
      ? "لا توجد مخالفات أو إنذارات مسجلة على هذا الموظف."
      : "No cases or warnings are recorded for this employee.",
    openCase: isAr ? "فتح المخالفة" : "Open Case",

    notAttached: isAr ? "غير مرفق" : "Not Attached",
    view: isAr ? "عرض" : "View",
    empty: "-",
    sar: isAr ? "ريال" : "SAR",
    order: isAr ? "طلب" : "Orders",
  };

  useEffect(() => {
    loadEmployee();
  }, [params.id]);

  async function loadEmployee() {
    setLoading(true);

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("LOAD EMPLOYEE ERROR:", error);
      setEmployee(null);
      setLoading(false);
      return;
    }

    setEmployee(data as Employee);

    setLoadingCases(true);

    const { data: casesData, error: casesError } = await supabase
      .from("employee_cases")
      .select(
        "id,case_number,employee_id,violation_type,severity,status,current_action,description,created_at,is_closed"
      )
      .eq("employee_id", String(params.id))
      .order("created_at", { ascending: false })
      .limit(6);

    if (casesError) {
      console.error("LOAD EMPLOYEE CASES ERROR:", casesError);
      setEmployeeCases([]);
    } else {
      setEmployeeCases((casesData || []) as EmployeeCase[]);
    }

    setLoadingCases(false);
    setLoading(false);
  }

  const expiryState = useMemo(() => {
    if (!employee) {
      return {
        days: null,
        label: "-",
        shortLabel: "-",
        tone: "slate",
      } as ExpiryState;
    }

    return getIqamaExpiryState(employee.iqama_expiry_date, lang);
  }, [employee, lang]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-bold text-slate-600">
            {t.loading}
          </span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center font-black text-red-600">
        {t.notFound}
      </div>
    );
  }

  const isCourier = employee.job_title === "deliveryCourier";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-5 pb-10">
      {/* PROFILE HERO */}
      <section className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <div className="h-1 bg-gradient-to-l from-blue-600 via-cyan-500 to-indigo-600" />

        <div className="flex flex-col gap-5 px-5 py-5 md:px-7 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {employee.photo_url ? (
              <img
                src={employee.photo_url}
                alt={employee.name}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-blue-50"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <span className="text-2xl font-black">
                  {getInitials(employee.name)}
                </span>
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-black tracking-tight text-[#102a4c] md:text-3xl">
                  {employee.name || t.empty}
                </h1>

                <StatusPill status={employee.status} lang={lang} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                  {jobTitleText(employee.job_title, lang)}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {workLocationText(employee.work_location, lang)}
                </span>

                <span dir="ltr" className="inline-flex items-center gap-1.5">
                  <IdCard className="h-4 w-4 text-slate-400" />
                  {employee.iqama || "-"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {employee.hunger_id && (
                  <PlatformBadge
                    label={isAr ? "هنجرستيشن" : "HungerStation"}
                    value={employee.hunger_id}
                    tone="green"
                  />
                )}

                {employee.keeta_id && (
                  <PlatformBadge
                    label={isAr ? "كيتا" : "Keeta"}
                    value={employee.keeta_id}
                    tone="purple"
                  />
                )}

                {!employee.hunger_id &&
                  !employee.keeta_id &&
                  employee.platform_id && (
                    <PlatformBadge
                      label={
                        employee.work_location === "HungerStation"
                          ? isAr
                            ? "هنجرستيشن"
                            : "HungerStation"
                          : isAr
                            ? "كيتا"
                            : "Keeta"
                      }
                      value={employee.platform_id}
                      tone={
                        employee.work_location === "HungerStation"
                          ? "green"
                          : "purple"
                      }
                    />
                  )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/employees/list"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowRight
                className={`h-4 w-4 ${isAr ? "" : "rotate-180"}`}
              />
              {t.back}
            </Link>

            <Link
              href={`/employees/${employee.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              {t.edit}
            </Link>
          </div>
        </div>
      </section>

      {/* KPI ROW */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={t.status}
          value={statusText(employee.status, lang)}
          helper={
            employee.status === "active" || employee.status === "نشط"
              ? isAr
                ? "يعمل حاليًا"
                : "Currently working"
              : isAr
                ? "راجع حالة الموظف"
                : "Review employee status"
          }
          icon={<User className="h-5 w-5" />}
          tone={statusTone(employee.status)}
        />

        <SummaryCard
          title={t.iqamaValidity}
          value={expiryState.shortLabel}
          helper={expiryState.label}
          icon={<CalendarDays className="h-5 w-5" />}
          tone={expiryState.tone}
        />

        <SummaryCard
          title={t.baseSalary}
          value={formatMoney(employee.base_salary, t.sar)}
          helper={
            isCourier
              ? `${t.target}: ${employee.target || 0} ${t.order}`
              : isAr
                ? "راتب أساسي"
                : "Base salary"
          }
          icon={<Wallet className="h-5 w-5" />}
          tone="blue"
        />

        <SummaryCard
          title={t.vehicle}
          value={employee.vehicle_number || t.empty}
          helper={
            employee.vehicle_number
              ? isAr
                ? "مركبة الموظف الحالية"
                : "Current assigned vehicle"
              : isAr
                ? "لا توجد مركبة مسجلة"
                : "No vehicle assigned"
          }
          icon={<Car className="h-5 w-5" />}
          tone="slate"
        />
      </section>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <main className="space-y-5 xl:col-span-8">
          <DetailsSection
            title={t.personalInfo}
            subtitle={
              isAr
                ? "بيانات الهوية والتواصل وتاريخ الإقامة."
                : "Identity, contact and Iqama information."
            }
            icon={<IdCard className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow
                label={t.iqama}
                value={employee.iqama || t.empty}
                icon={<IdCard className="h-4 w-4" />}
                dir="ltr"
              />

              <InfoRow
                label={t.iqamaExpiry}
                value={formatDate(employee.iqama_expiry_date, lang)}
                icon={<CalendarDays className="h-4 w-4" />}
                extra={
                  employee.iqama_expiry_date ? (
                    <ExpiryBadge state={expiryState} />
                  ) : null
                }
              />

              <InfoRow
                label={t.phone}
                value={employee.phone || t.empty}
                icon={<Phone className="h-4 w-4" />}
                dir="ltr"
              />

              <InfoRow
                label={t.email}
                value={employee.email || t.empty}
                icon={<Mail className="h-4 w-4" />}
                dir="ltr"
              />

              <InfoRow
                label={t.nationality}
                value={nationalityText(employee.nationality, lang)}
                icon={<User className="h-4 w-4" />}
              />

              <InfoRow
                label={t.startDate}
                value={formatDate(employee.start_date, lang)}
                icon={<Clock3 className="h-4 w-4" />}
              />
            </div>
          </DetailsSection>

          <DetailsSection
            title={t.workInfo}
            subtitle={
              isAr
                ? "المسمى الوظيفي، موقع العمل، المركبة ومعرفات المنصات."
                : "Role, work location, vehicle and platform IDs."
            }
            icon={<BriefcaseBusiness className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow
                label={t.jobTitle}
                value={jobTitleText(employee.job_title, lang)}
                icon={<BriefcaseBusiness className="h-4 w-4" />}
              />

              <InfoRow
                label={t.workLocation}
                value={workLocationText(employee.work_location, lang)}
                icon={<MapPin className="h-4 w-4" />}
              />

              <InfoRow
                label={t.vehicleNumber}
                value={employee.vehicle_number || t.empty}
                icon={<Car className="h-4 w-4" />}
              />

              {employee.keeta_id && (
                <InfoRow
                  label={t.keetaId}
                  value={employee.keeta_id}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  dir="ltr"
                />
              )}

              {employee.hunger_id && (
                <InfoRow
                  label={t.hungerId}
                  value={employee.hunger_id}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  dir="ltr"
                />
              )}

              {!employee.keeta_id &&
                !employee.hunger_id &&
                employee.platform_id && (
                  <InfoRow
                    label={
                      employee.work_location === "HungerStation"
                        ? t.hungerId
                        : t.keetaId
                    }
                    value={employee.platform_id}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    dir="ltr"
                  />
                )}
            </div>
          </DetailsSection>

          <DetailsSection
            title={t.salaryInfo}
            subtitle={
              isCourier
                ? isAr
                  ? "بيانات الراتب والتارجت الخاصة بالمندوب."
                  : "Courier salary and target information."
                : isAr
                  ? "بيانات الراتب الأساسية للموظف."
                  : "Employee salary information."
            }
            icon={<Wallet className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <MetricBox
                label={t.baseSalary}
                value={formatMoney(employee.base_salary, t.sar)}
              />

              {isCourier && (
                <>
                  <MetricBox
                    label={t.target}
                    value={`${employee.target || 0} ${t.order}`}
                  />

                  <MetricBox
                    label={t.additionalTarget}
                    value={`${employee.half_target || 0} ${t.order}`}
                  />

                  <MetricBox
                    label={t.targetDeductions}
                    value={
                      employee.target_deductions
                        ? String(employee.target_deductions)
                        : t.empty
                    }
                  />
                </>
              )}
            </div>
          </DetailsSection>

          <DetailsSection
            title={t.warnings}
            subtitle={
              isAr
                ? "آخر المخالفات والإنذارات المسجلة على الموظف."
                : "Latest recorded cases and warnings."
            }
            icon={<Bell className="h-5 w-5" />}
          >
            {loadingCases ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
                {isAr ? "جاري تحميل المخالفات..." : "Loading cases..."}
              </div>
            ) : employeeCases.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-black text-emerald-700">
                    {isAr ? "السجل نظيف" : "Clear Record"}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-emerald-600">
                    {t.noWarnings}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {employeeCases.map((item) => (
                  <CaseRow
                    key={item.id}
                    item={item}
                    lang={lang}
                    openText={t.openCase}
                  />
                ))}
              </div>
            )}
          </DetailsSection>

          <DetailsSection
            title={t.notes}
            subtitle={
              isAr
                ? "ملاحظات إضافية مرتبطة بملف الموظف."
                : "Additional notes linked to this employee."
            }
            icon={<ShieldAlert className="h-5 w-5" />}
          >
            <div className="min-h-[90px] rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-600">
              {employee.notes || t.empty}
            </div>
          </DetailsSection>
        </main>

        <aside className="space-y-5 xl:col-span-4">
          <DetailsSection
            title={t.documents}
            subtitle={
              isAr
                ? "جميع الملفات والمستندات المرفقة بالموظف."
                : "All documents attached to this employee."
            }
            icon={<FileText className="h-5 w-5" />}
          >
            <div className="space-y-2.5">
              <DocumentRow
                title={isAr ? "صورة الهوية / الإقامة" : "ID / Iqama Image"}
                url={employee.iqama_file_url}
                notAttached={t.notAttached}
                openText={t.view}
              />

              <DocumentRow
                title={isAr ? "صورة رخصة القيادة" : "Driving License Image"}
                url={employee.license_file_url}
                notAttached={t.notAttached}
                openText={t.view}
              />

              <DocumentRow
                title={isAr ? "عقد قوى" : "Qiwa Contract"}
                url={employee.qiwa_file_url}
                notAttached={t.notAttached}
                openText={t.view}
              />

              <DocumentRow
                title={isAr ? "عهدة استلام مركبة" : "Vehicle Custody Form"}
                url={employee.custody_file_url}
                notAttached={t.notAttached}
                openText={t.view}
              />

              <DocumentRow
                title={isAr ? "مستندات أخرى" : "Other Documents"}
                url={employee.other_docs_url}
                notAttached={t.notAttached}
                openText={t.view}
              />
            </div>
          </DetailsSection>

          <DetailsSection
            title={isAr ? "ملخص الموظف" : "Employee Summary"}
            subtitle={
              isAr
                ? "أهم البيانات التي تحتاجها بسرعة."
                : "Key employee details at a glance."
            }
            icon={<User className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <QuickLine
                label={t.status}
                value={statusText(employee.status, lang)}
              />
              <QuickLine
                label={t.workLocation}
                value={workLocationText(employee.work_location, lang)}
              />
              <QuickLine
                label={t.iqamaValidity}
                value={expiryState.shortLabel}
              />
              <QuickLine
                label={t.vehicle}
                value={employee.vehicle_number || t.empty}
              />
              <QuickLine
                label={t.baseSalary}
                value={formatMoney(employee.base_salary, t.sar)}
              />
            </div>
          </DetailsSection>
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  icon,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  tone: "green" | "blue" | "amber" | "red" | "slate";
}) {
  const tones = {
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      value: "text-emerald-700",
    },
    blue: {
      icon: "bg-blue-50 text-blue-700",
      value: "text-blue-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      value: "text-amber-700",
    },
    red: {
      icon: "bg-red-50 text-red-700",
      value: "text-red-700",
    },
    slate: {
      icon: "bg-slate-100 text-slate-700",
      value: "text-[#102a4c]",
    },
  };

  const current = tones[tone];

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold text-slate-500">{title}</p>
          <p className={`mt-2 text-2xl font-black ${current.value}`}>
            {value}
          </p>
          <p className="mt-1 text-[11px] font-bold text-slate-400">
            {helper}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailsSection({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-black text-[#102a4c]">{title}</h2>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  icon,
  extra,
  dir,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex min-h-[76px] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-extrabold text-slate-400">{label}</p>
        <p
          dir={dir}
          className="mt-1 break-words text-sm font-black text-[#102a4c]"
        >
          {value}
        </p>
      </div>

      {extra}
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-[11px] font-extrabold text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-black text-[#102a4c]">{value}</p>
    </div>
  );
}

function PlatformBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "purple";
}) {
  const style =
    tone === "green"
      ? "border-green-100 bg-green-50 text-green-700"
      : "border-violet-100 bg-violet-50 text-violet-700";

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black ${style}`}
    >
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function StatusPill({
  status,
  lang,
}: {
  status: string | null;
  lang: Lang;
}) {
  const normalized = normalizeStatus(status);

  const styles: Record<string, string> = {
    active: "border-emerald-100 bg-emerald-50 text-emerald-700",
    stopped: "border-red-100 bg-red-50 text-red-700",
    vacation: "border-amber-100 bg-amber-50 text-amber-700",
    outOfService: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-black ${
        styles[normalized] || "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {statusText(status, lang)}
    </span>
  );
}

function ExpiryBadge({
  state,
}: {
  state: ExpiryState;
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black ${styles[state.tone]}`}>
      {state.shortLabel}
    </span>
  );
}

function DocumentRow({
  title,
  url,
  notAttached,
  openText,
}: {
  title: string;
  url: string | null;
  notAttached: string;
  openText: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <FileText className="h-4 w-4" />
        </div>

        <span className="truncate text-xs font-extrabold text-[#102a4c]">
          {title}
        </span>
      </div>

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          {openText}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-black text-slate-500">
          {notAttached}
        </span>
      )}
    </div>
  );
}

function CaseRow({
  item,
  lang,
  openText,
}: {
  item: EmployeeCase;
  lang: Lang;
  openText: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-[#102a4c]">
              {item.violation_type || "-"}
            </p>

            <CaseStatusBadge
              status={item.status}
              isClosed={item.is_closed}
              lang={lang}
            />
          </div>

          <p className="mt-1 text-xs font-bold text-slate-400">
            {item.case_number || "-"} • {formatCaseDate(item.created_at, lang)}
          </p>

          {item.description && (
            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
              {item.description}
            </p>
          )}
        </div>

        <Link
          href={`/employees/notices/${item.id}`}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-extrabold text-white hover:bg-blue-700"
        >
          {openText}
        </Link>
      </div>
    </div>
  );
}

function QuickLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <span className="text-sm font-black text-[#102a4c]">{value}</span>
    </div>
  );
}

function CaseStatusBadge({
  status,
  isClosed,
  lang,
}: {
  status: string;
  isClosed: boolean;
  lang: Lang;
}) {
  const normalizedStatus = isClosed ? "closed" : status;

  const labels: Record<string, { ar: string; en: string }> = {
    open: { ar: "مفتوحة", en: "Open" },
    follow_up: { ar: "قيد المتابعة", en: "Follow Up" },
    closed: { ar: "مغلقة", en: "Closed" },
  };

  const styles: Record<string, string> = {
    open: "bg-red-50 text-red-700",
    follow_up: "bg-amber-50 text-amber-700",
    closed: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
        styles[normalizedStatus] || "bg-slate-100 text-slate-700"
      }`}
    >
      {labels[normalizedStatus]?.[lang] || normalizedStatus || "-"}
    </span>
  );
}

function getIqamaExpiryState(
  value: string | null,
  lang: Lang
): ExpiryState {
  const isAr = lang === "ar";

  if (!value) {
    return {
      days: null,
      label: isAr ? "لم يتم تسجيل تاريخ الانتهاء" : "Expiry date not recorded",
      shortLabel: isAr ? "غير مسجل" : "Not Set",
      tone: "slate",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${value}T00:00:00`);

  if (Number.isNaN(expiry.getTime())) {
    return {
      days: null,
      label: isAr ? "تاريخ غير صالح" : "Invalid date",
      shortLabel: "-",
      tone: "slate",
    };
  }

  const days = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return {
      days,
      label: isAr
        ? `منتهية منذ ${Math.abs(days)} يوم`
        : `Expired ${Math.abs(days)} days ago`,
      shortLabel: isAr ? "منتهية" : "Expired",
      tone: "red",
    };
  }

  if (days === 0) {
    return {
      days,
      label: isAr ? "تنتهي اليوم" : "Expires today",
      shortLabel: isAr ? "اليوم" : "Today",
      tone: "red",
    };
  }

  if (days <= 7) {
    return {
      days,
      label: isAr ? `متبقي ${days} أيام` : `${days} days remaining`,
      shortLabel: `${days} ${isAr ? "يوم" : "days"}`,
      tone: "red",
    };
  }

  if (days <= 15) {
    return {
      days,
      label: isAr ? `متبقي ${days} يوم` : `${days} days remaining`,
      shortLabel: `${days} ${isAr ? "يوم" : "days"}`,
      tone: "amber",
    };
  }

  if (days <= 30) {
    return {
      days,
      label: isAr
        ? `تنبيه خفيف — متبقي ${days} يوم`
        : `Light alert — ${days} days remaining`,
      shortLabel: `${days} ${isAr ? "يوم" : "days"}`,
      tone: "blue",
    };
  }

  return {
    days,
    label: isAr ? `الإقامة سارية — متبقي ${days} يوم` : `Valid — ${days} days remaining`,
    shortLabel: isAr ? "سارية" : "Valid",
    tone: "green",
  };
}

function normalizeStatus(value: string | null) {
  if (!value) return "";

  const map: Record<string, string> = {
    active: "active",
    نشط: "active",
    stopped: "stopped",
    متوقف: "stopped",
    "غير نشط": "stopped",
    vacation: "vacation",
    إجازة: "vacation",
    outOfService: "outOfService",
    "خارج الخدمة": "outOfService",
  };

  return map[value] || value;
}

function statusTone(
  value: string | null
): "green" | "blue" | "amber" | "red" | "slate" {
  const normalized = normalizeStatus(value);

  if (normalized === "active") return "green";
  if (normalized === "vacation") return "amber";
  if (normalized === "stopped") return "red";
  return "slate";
}

function statusText(value: string | null, lang: Lang) {
  const normalized = normalizeStatus(value);

  const map: Record<string, { ar: string; en: string }> = {
    active: { ar: "نشط", en: "Active" },
    stopped: { ar: "غير نشط", en: "Inactive" },
    vacation: { ar: "إجازة", en: "Vacation" },
    outOfService: { ar: "خارج الخدمة", en: "Out Of Service" },
  };

  if (!value) return "-";
  return map[normalized]?.[lang] || value;
}

function workLocationText(value: string | null, lang: Lang) {
  const map: Record<string, { ar: string; en: string }> = {
    Keeta: { ar: "كيتا", en: "Keeta" },
    HungerStation: { ar: "هنجرستيشن", en: "HungerStation" },
    KeetaAndHungerStation: {
      ar: "كيتا وهنجرستيشن معًا",
      en: "Keeta & HungerStation",
    },
    management: { ar: "الإدارة", en: "Management" },
    maintenance: { ar: "الصيانة", en: "Maintenance" },
    الإدارة: { ar: "الإدارة", en: "Management" },
    الصيانة: { ar: "الصيانة", en: "Maintenance" },
  };

  if (!value) return "-";
  return map[value]?.[lang] || value;
}

function jobTitleText(value: string | null, lang: Lang) {
  const map: Record<string, { ar: string; en: string }> = {
    deliveryCourier: { ar: "مندوب توصيل", en: "Delivery Courier" },
    keetaCourier: { ar: "مندوب توصيل", en: "Delivery Courier" },
    hungerCourier: { ar: "مندوب توصيل", en: "Delivery Courier" },
    supervisor: { ar: "مشرف", en: "Supervisor" },
    accountant: { ar: "محاسب", en: "Accountant" },
    mechanic: { ar: "ميكانيكي", en: "Mechanic" },
    maintenanceOfficer: {
      ar: "مسؤول الصيانة",
      en: "Maintenance Officer",
    },
    "مندوب توصيل": { ar: "مندوب توصيل", en: "Delivery Courier" },
    "مندوب كيتا": { ar: "مندوب توصيل", en: "Delivery Courier" },
    "مندوب هنقرستيشن": { ar: "مندوب توصيل", en: "Delivery Courier" },
    "مندوب هنجرستيشن": { ar: "مندوب توصيل", en: "Delivery Courier" },
    مشرف: { ar: "مشرف", en: "Supervisor" },
    محاسب: { ar: "محاسب", en: "Accountant" },
    ميكانيكي: { ar: "ميكانيكي", en: "Mechanic" },
    "مسؤول الصيانة": {
      ar: "مسؤول الصيانة",
      en: "Maintenance Officer",
    },
  };

  if (!value) return "-";
  return map[value]?.[lang] || value;
}

function nationalityText(value: string | null, lang: Lang) {
  if (!value) return "-";

  const map: Record<string, { ar: string; en: string }> = {
    Bangladesh: { ar: "بنجلاديش", en: "Bangladesh" },
    BangladeshI: { ar: "بنجلاديش", en: "Bangladesh" },
    Pakistan: { ar: "باكستان", en: "Pakistan" },
    Pakistani: { ar: "باكستان", en: "Pakistan" },
    India: { ar: "الهند", en: "India" },
    Indian: { ar: "الهند", en: "India" },
    Egypt: { ar: "مصر", en: "Egypt" },
    Egyptian: { ar: "مصر", en: "Egypt" },
    Sudan: { ar: "السودان", en: "Sudan" },
    Sudanese: { ar: "السودان", en: "Sudan" },
    Yemen: { ar: "اليمن", en: "Yemen" },
    Yemeni: { ar: "اليمن", en: "Yemen" },
    "Saudi Arabia": { ar: "السعودية", en: "Saudi Arabia" },
    Saudi: { ar: "السعودية", en: "Saudi Arabia" },
  };

  return map[value]?.[lang] || value;
}

function formatDate(value: string | null, lang: Lang) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCaseDate(
  value: string | null | undefined,
  lang: Lang
) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMoney(
  value: number | string | null,
  currency: string
) {
  const amount = Number(value || 0);

  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}
