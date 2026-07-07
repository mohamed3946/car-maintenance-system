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
  notes: string | null;
};

const documents = [
  "idImage",
  "licenseImage",
  "employeeImage",
  "qiwaContract",
  "vehicleCustody",
  "otherDocs",
];

const alerts = [
  { type: "absence", date: "2026-05-10", status: "sent" },
  { type: "poorPerformance", date: "2026-05-12", status: "draft" },
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
  const [loading, setLoading] = useState(true);

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
    nationality: isAr ? "الجنسية" : "Nationality",
    startDate: isAr ? "تاريخ بداية العمل" : "Start Date",

    workInfo: isAr ? "بيانات العمل" : "Work Information",
    jobTitle: isAr ? "المسمى الوظيفي" : "Job Title",
    workLocation: isAr ? "موقع العمل" : "Work Location",
    vehicleNumber: isAr ? "رقم المركبة / الدباب" : "Vehicle Number",
    platformId: isAr ? "رقم هوية كيتا / هنقر" : "Keeta / Hunger ID",

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
              <Info label={t.nationality} value={employee.nationality || t.empty} />
              <Info label={t.startDate} value={employee.start_date || t.empty} />
            </div>
          </Card>

          <Card title={t.workInfo} icon={<BriefcaseBusiness className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Info label={t.jobTitle} value={jobTitleText(employee.job_title, lang)} />
              <Info label={t.workLocation} value={workLocationText(employee.work_location, lang)} />
              <Info label={t.vehicleNumber} value={employee.vehicle_number || t.empty} />
              <Info label={t.platformId} value={employee.platform_id || t.empty} />
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
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User className="h-16 w-16" />
              </div>
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
            <div className="space-y-3">
              {alerts.map((item) => (
                <div
                  key={item.type}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="font-extrabold text-[#0f2544]">
                    {alertTypeText(item.type, lang)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {item.date} - {alertStatusText(item.status, lang)}
                  </p>
                </div>
              ))}
            </div>
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
    Keeta: { ar: "Keeta", en: "Keeta" },
    HungerStation: { ar: "HungerStation", en: "HungerStation" },
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
    keetaCourier: { ar: "مندوب كيتا", en: "Keeta Courier" },
    hungerCourier: { ar: "مندوب هنجرستيشن", en: "HungerStation Courier" },
    supervisor: { ar: "مشرف", en: "Supervisor" },
    mechanic: { ar: "ميكانيكي", en: "Mechanic" },
    maintenanceOfficer: { ar: "مسؤول الصيانة", en: "Maintenance Officer" },
    "مندوب كيتا": { ar: "مندوب كيتا", en: "Keeta Courier" },
    "مندوب هنقرستيشن": { ar: "مندوب هنجرستيشن", en: "HungerStation Courier" },
    "مندوب هنجرستيشن": { ar: "مندوب هنجرستيشن", en: "HungerStation Courier" },
    مشرف: { ar: "مشرف", en: "Supervisor" },
    ميكانيكي: { ar: "ميكانيكي", en: "Mechanic" },
    "مسؤول الصيانة": { ar: "مسؤول الصيانة", en: "Maintenance Officer" },
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