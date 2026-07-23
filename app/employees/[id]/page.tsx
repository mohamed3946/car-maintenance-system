"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  FileText,
  IdCard,
  Pencil,
  ShieldAlert,
  User,
  Wallet,
} from "lucide-react";

type Lang = "ar" | "en";

type Employee = {
  photo_url: string | null;
iqama_file_url: string | null;
license_file_url: string | null;
qiwa_file_url: string | null;
custody_file_url: string | null;
other_docs_url: string | null;
  id: string;
  name: string;
  iqama: string;
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


const documents = [
  "idImage",
  "licenseImage",
  "employeeImage",
  "qiwaContract",
  "vehicleCustody",
  "otherDocs",
];



const attendance = [
  { date: "2026-05-20", status: "present", orders: 18 },
  { date: "2026-05-21", status: "present", orders: 21 },
  { date: "2026-05-22", status: "absent", orders: 0 },
];

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

    status: isAr ? "الحالة" : "Status",
    performance: isAr ? "الأداء" : "Performance",
    baseSalary: isAr ? "الراتب الأساسي" : "Base Salary",
    vehicle: isAr ? "المركبة" : "Vehicle",

    basicInfo: isAr ? "البيانات الأساسية" : "Basic Information",
    iqama: isAr ? "رقم الإقامة" : "Iqama Number",
    phone: isAr ? "رقم الجوال" : "Phone Number",
    email: isAr ? "البريد الإلكتروني" : "Email",
    nationality: isAr ? "الجنسية" : "Nationality",
    startDate: isAr ? "تاريخ بداية العمل" : "Start Date",

    workInfo: isAr ? "بيانات العمل" : "Work Information",
    jobTitle: isAr ? "المسمى الوظيفي" : "Job Title",
    workLocation: isAr ? "موقع العمل" : "Work Location",
    vehicleNumber: isAr ? "رقم المركبة / الدباب" : "Vehicle Number",
    keetaId: "Keeta ID",
    hungerId: "HungerStation ID",

    salaryTarget: isAr ? "بيانات الراتب والتارجت" : "Salary & Target",
    target: isAr ? "التارجت" : "Target",
    halfTarget: isAr ? "نصف التارجت" : "Half Target",
    targetDeductions: isAr ? "استقطاعات التارجت" : "Target Deductions",

    attendanceSummary: isAr ? "سجل الحضور المختصر" : "Attendance Summary",
    date: isAr ? "التاريخ" : "Date",
    orders: isAr ? "الطلبات" : "Orders",

    employeePhoto: isAr ? "صورة الموظف" : "Employee Photo",
    documents: isAr ? "المستندات" : "Documents",
    notAttached: isAr ? "غير مرفق" : "Not Attached",
    warnings: isAr ? "الإشعارات والإنذارات" : "Warnings & Notifications",
    noWarnings: isAr ? "لا توجد إشعارات أو مخالفات لهذا الموظف" : "No warnings or cases for this employee",
    openCase: isAr ? "فتح المخالفة" : "Open Case",
    notes: isAr ? "ملاحظات" : "Notes",

    sar: isAr ? "ريال" : "SAR",
    order: isAr ? "طلب" : "Orders",
    empty: "-",
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
      .limit(5);

    if (casesError) {
      console.error("LOAD EMPLOYEE CASES ERROR:", casesError);
      setEmployeeCases([]);
    } else {
      setEmployeeCases((casesData || []) as EmployeeCase[]);
    }

    setLoadingCases(false);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center font-bold text-slate-500 shadow-sm">
        {t.loading}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center font-bold text-red-500 shadow-sm">
        {t.notFound}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link
            href="/employees/list"
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowRight className="h-4 w-4" />
            {t.back}
          </Link>

          <h1 className="text-3xl font-extrabold text-[#0f2544]">
            {employee.name || t.empty}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {jobTitleText(employee.job_title, lang)} -{" "}
            {workLocationText(employee.work_location, lang)}
          </p>
        </div>

        <Link
          href={`/employees/${employee.id}/edit`}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700"
        >
          <Pencil className="h-5 w-5" />
          {t.edit}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t.status}
          value={statusText(employee.status, lang)}
          icon={<User />}
          color="green"
        />
        <StatCard
          title={t.performance}
          value={performanceText(employee.performance, lang)}
          icon={<BriefcaseBusiness />}
          color="blue"
        />
        <StatCard
          title={t.baseSalary}
          value={`${employee.base_salary || 0} ${t.sar}`}
          icon={<Wallet />}
          color="orange"
        />
        <StatCard
          title={t.vehicle}
          value={employee.vehicle_number || t.empty}
          icon={<Car />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="space-y-6 xl:col-span-2">
          <Card title={t.basicInfo} icon={<IdCard className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Info label={t.iqama} value={employee.iqama || t.empty} />
              <Info label={t.phone} value={employee.phone || t.empty} />
              <Info label={t.email} value={employee.email || t.empty} />
              <Info label={t.nationality} value={employee.nationality || t.empty} />
              <Info label={t.startDate} value={employee.start_date || t.empty} />
            </div>
          </Card>

          <Card title={t.workInfo} icon={<BriefcaseBusiness className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Info
                label={t.jobTitle}
                value={jobTitleText(employee.job_title, lang)}
              />

              <Info
                label={t.workLocation}
                value={workLocationText(employee.work_location, lang)}
              />

              <Info
                label={t.vehicleNumber}
                value={employee.vehicle_number || t.empty}
              />

              {employee.keeta_id && (
                <Info label={t.keetaId} value={employee.keeta_id} />
              )}

              {employee.hunger_id && (
                <Info label={t.hungerId} value={employee.hunger_id} />
              )}

              {!employee.keeta_id &&
                !employee.hunger_id &&
                employee.platform_id && (
                  <Info
                    label={
                      employee.work_location === "HungerStation"
                        ? t.hungerId
                        : t.keetaId
                    }
                    value={employee.platform_id}
                  />
                )}
            </div>
          </Card>

          <Card title={t.salaryTarget} icon={<Wallet className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Info label={t.baseSalary} value={`${employee.base_salary || 0} ${t.sar}`} />
              <Info label={t.target} value={`${employee.target || 0} ${t.order}`} />
              <Info label={t.halfTarget} value={`${employee.half_target || 0} ${t.order}`} />
              <Info
                label={t.targetDeductions}
                value={
                  employee.target_deductions
                    ? String(employee.target_deductions)
                    : t.empty
                }
              />
            </div>
          </Card>

          <Card title={t.attendanceSummary} icon={<CalendarDays className="h-5 w-5" />}>
            <Table
              headers={[t.date, t.status, t.orders]}
              rows={attendance.map((item) => [
                item.date,
                attendanceStatusText(item.status, lang),
                String(item.orders),
              ])}
            />
          </Card>
        </section>

        <aside className="space-y-6">
          <Card title={t.employeePhoto} icon={<User className="h-5 w-5" />}>
            <div className="flex flex-col items-center rounded-3xl bg-slate-50 p-6 text-center">
              {employee.photo_url ? (
                <img
                  src={employee.photo_url}
                  alt={employee.name || t.employeePhoto}
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-blue-100"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <User className="h-16 w-16" />
                </div>
              )}
              <h3 className="mt-4 text-xl font-extrabold text-[#0f2544]">
                {employee.name || t.empty}
              </h3>
              <p className="text-sm font-bold text-slate-500">
                {jobTitleText(employee.job_title, lang)}
              </p>
            </div>
          </Card>

          <Card title={t.documents} icon={<FileText className="h-5 w-5" />}>
  <div className="space-y-3">
    <DocumentRow
      title={isAr ? "صورة الهوية / الإقامة" : "ID / Iqama Image"}
      url={employee.iqama_file_url}
      notAttached={t.notAttached}
      openText={isAr ? "عرض" : "View"}
    />

    <DocumentRow
      title={isAr ? "صورة رخصة القيادة" : "Driving License Image"}
      url={employee.license_file_url}
      notAttached={t.notAttached}
      openText={isAr ? "عرض" : "View"}
    />

    <DocumentRow
      title={isAr ? "عقد قوى" : "Qiwa Contract"}
      url={employee.qiwa_file_url}
      notAttached={t.notAttached}
      openText={isAr ? "عرض" : "View"}
    />

    <DocumentRow
      title={isAr ? "عهدة استلام مركبة" : "Vehicle Custody Form"}
      url={employee.custody_file_url}
      notAttached={t.notAttached}
      openText={isAr ? "عرض" : "View"}
    />

    <DocumentRow
      title={isAr ? "مستندات أخرى" : "Other Documents"}
      url={employee.other_docs_url}
      notAttached={t.notAttached}
      openText={isAr ? "عرض" : "View"}
    />
  </div>
</Card>

          <Card title={t.warnings} icon={<Bell className="h-5 w-5" />}>
            {loadingCases ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                {isAr ? "جاري تحميل المخالفات..." : "Loading cases..."}
              </div>
            ) : employeeCases.length === 0 ? (
              <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
                <p className="font-extrabold text-green-700">{t.noWarnings}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employeeCases.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-[#0f2544]">
                          {item.violation_type || "-"}
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {item.case_number || "-"}
                        </p>
                      </div>

                      <CaseStatusBadge
                        status={item.status}
                        isClosed={item.is_closed}
                        lang={lang}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-500">
                        {formatCaseDate(item.created_at, lang)}
                      </span>

                      <Link
                        href={`/employees/notices/${item.id}`}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-blue-700"
                      >
                        {t.openCase}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={t.notes} icon={<ShieldAlert className="h-5 w-5" />}>
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
              {employee.notes || t.empty}
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function statusText(value: string | null, lang: Lang) {
  const map: Record<string, { ar: string; en: string }> = {
    active: { ar: "نشط", en: "Active" },
    stopped: { ar: "متوقف", en: "Stopped" },
    vacation: { ar: "إجازة", en: "Vacation" },
    outOfService: { ar: "خارج الخدمة", en: "Out Of Service" },
    "نشط": { ar: "نشط", en: "Active" },
    "متوقف": { ar: "متوقف", en: "Stopped" },
    "إجازة": { ar: "إجازة", en: "Vacation" },
    "خارج الخدمة": { ar: "خارج الخدمة", en: "Out Of Service" },
  };
  if (!value) return "-";
  return map[value]?.[lang] || value;
}

function performanceText(value: string | null, lang: Lang) {
  const map: Record<string, { ar: string; en: string }> = {
    excellent: { ar: "ممتاز", en: "Excellent" },
    good: { ar: "جيد", en: "Good" },
    average: { ar: "متوسط", en: "Average" },
    weak: { ar: "ضعيف", en: "Poor" },
    ممتاز: { ar: "ممتاز", en: "Excellent" },
    جيد: { ar: "جيد", en: "Good" },
    متوسط: { ar: "متوسط", en: "Average" },
    ضعيف: { ar: "ضعيف", en: "Poor" },
  };
  if (!value) return "-";
  return map[value]?.[lang] || value;
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
    deliveryCourier: {
      ar: "مندوب توصيل",
      en: "Delivery Courier",
    },
    keetaCourier: {
      ar: "مندوب توصيل",
      en: "Delivery Courier",
    },
    hungerCourier: {
      ar: "مندوب توصيل",
      en: "Delivery Courier",
    },
    supervisor: { ar: "مشرف", en: "Supervisor" },
    mechanic: { ar: "ميكانيكي", en: "Mechanic" },
    maintenanceOfficer: {
      ar: "مسؤول الصيانة",
      en: "Maintenance Officer",
    },
    "مندوب توصيل": {
      ar: "مندوب توصيل",
      en: "Delivery Courier",
    },
    "مندوب كيتا": {
      ar: "مندوب توصيل",
      en: "Delivery Courier",
    },
    "مندوب هنقرستيشن": {
      ar: "مندوب توصيل",
      en: "Delivery Courier",
    },
    "مندوب هنجرستيشن": {
      ar: "مندوب توصيل",
      en: "Delivery Courier",
    },
    مشرف: { ar: "مشرف", en: "Supervisor" },
    ميكانيكي: { ar: "ميكانيكي", en: "Mechanic" },
    "مسؤول الصيانة": {
      ar: "مسؤول الصيانة",
      en: "Maintenance Officer",
    },
  };

  if (!value) return "-";
  return map[value]?.[lang] || value;
}

function attendanceStatusText(value: string, lang: Lang) {
  const map: Record<string, string> = {
    present: lang === "ar" ? "حاضر" : "Present",
    absent: lang === "ar" ? "غياب" : "Absent",
  };
  return map[value] || value;
}

function documentText(value: string, lang: Lang) {
  const map: Record<string, string> = {
    idImage: lang === "ar" ? "صورة الهوية / الإقامة" : "ID / Iqama Image",
    licenseImage: lang === "ar" ? "صورة رخصة القيادة" : "Driving License Image",
    employeeImage: lang === "ar" ? "صورة الموظف" : "Employee Photo",
    qiwaContract: lang === "ar" ? "عقد قوى" : "Qiwa Contract",
    vehicleCustody: lang === "ar" ? "عهدة استلام مركبة" : "Vehicle Custody Form",
    otherDocs: lang === "ar" ? "مستندات أخرى" : "Other Documents",
  };
  return map[value] || value;
}

function alertTypeText(value: string, lang: Lang) {
  const map: Record<string, string> = {
    absence: lang === "ar" ? "تغيب عن العمل" : "Work Absence",
    poorPerformance: lang === "ar" ? "سوء أداء" : "Poor Performance",
  };
  return map[value] || value;
}

function alertStatusText(value: string, lang: Lang) {
  const map: Record<string, string> = {
    sent: lang === "ar" ? "تم الإرسال" : "Sent",
    draft: lang === "ar" ? "مسودة" : "Draft",
  };
  return map[value] || value;
}


function formatCaseDate(value: string | null | undefined, lang: Lang) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
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
    follow_up: "bg-orange-50 text-orange-700",
    closed: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[normalizedStatus] || "bg-slate-100 text-slate-700"
      }`}
    >
      {labels[normalizedStatus]?.[lang] || normalizedStatus || "-"}
    </span>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-[#0f2544]">{title}</h2>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>
      </div>
      {children}
    </section>
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
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <span className="text-sm font-extrabold text-[#0f2544]">
        {title}
      </span>

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 hover:bg-green-100"
        >
          {openText}
        </a>
      ) : (
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
          {notAttached}
        </span>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-words text-lg font-extrabold text-[#0f2544]">
        {value}
      </p>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-auto rounded-2xl border border-slate-100">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="p-3 text-start font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-t border-slate-100">
              {row.map((cell, index) => (
                <td
                  key={`${cell}-${index}`}
                  className="p-3 text-start font-bold text-slate-600"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}
        >
          {icon}
        </div>
        <div className="text-start">
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-extrabold text-[#0f2544]">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}