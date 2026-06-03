"use client";

import Link from "next/link";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
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

const employee = {
  id: 1,
  name: "أحمد محمد",
  iqama: "251xxxxxxx",
  phone: "05xxxxxxxx",
  nationality: "مصري",
  jobTitle: "مندوب كيتا",
  workLocation: "Keeta",
  status: "نشط",
  performance: "جيد",
  startDate: "2024-01-15",
  baseSalary: "1300",
  target: "350",
  halfTarget: "175",
  targetDeductions: "حسب سياسة التطبيق",
  vehicleNumber: "ب ب 1254",
  platformId: "KT-1254",
  notes: "لا توجد ملاحظات",
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

  const t = {
    back: isAr ? "الرجوع لقائمة الموظفين" : "Back To Employees",
    edit: isAr ? "تعديل بيانات الموظف" : "Edit Employee",

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
  };

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
            {employeeNameText(employee.name, lang)}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {jobTitleText(employee.jobTitle, lang)} -{" "}
            {workLocationText(employee.workLocation, lang)}
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
        <StatCard title={t.status} value={statusText(employee.status, lang)} icon={<User />} color="green" />
        <StatCard title={t.performance} value={performanceText(employee.performance, lang)} icon={<BriefcaseBusiness />} color="blue" />
        <StatCard title={t.baseSalary} value={`${employee.baseSalary} ${t.sar}`} icon={<Wallet />} color="orange" />
        <StatCard title={t.vehicle} value={employee.vehicleNumber} icon={<Car />} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="space-y-6 xl:col-span-2">
          <Card title={t.basicInfo} icon={<IdCard className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Info label={t.iqama} value={employee.iqama} />
              <Info label={t.phone} value={employee.phone} />
              <Info label={t.nationality} value={nationalityText(employee.nationality, lang)} />
              <Info label={t.startDate} value={employee.startDate || "-"} />
            </div>
          </Card>

          <Card title={t.workInfo} icon={<BriefcaseBusiness className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Info label={t.jobTitle} value={jobTitleText(employee.jobTitle, lang)} />
              <Info label={t.workLocation} value={workLocationText(employee.workLocation, lang)} />
              <Info label={t.vehicleNumber} value={employee.vehicleNumber} />
              <Info label={t.platformId} value={employee.platformId} />
            </div>
          </Card>

          <Card title={t.salaryTarget} icon={<Wallet className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Info label={t.baseSalary} value={`${employee.baseSalary} ${t.sar}`} />
              <Info label={t.target} value={`${employee.target} ${t.order}`} />
              <Info label={t.halfTarget} value={`${employee.halfTarget} ${t.order}`} />
              <Info label={t.targetDeductions} value={targetDeductionsText(employee.targetDeductions, lang)} />
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
                {employeeNameText(employee.name, lang)}
              </h3>
              <p className="text-sm font-bold text-slate-500">
                {jobTitleText(employee.jobTitle, lang)}
              </p>
            </div>
          </Card>

          <Card title={t.documents} icon={<FileText className="h-5 w-5" />}>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <span className="text-sm font-extrabold text-[#0f2544]">
                    {documentText(doc, lang)}
                  </span>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                    {t.notAttached}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title={t.warnings} icon={<Bell className="h-5 w-5" />}>
            <div className="space-y-3">
              {alerts.map((item) => (
                <div key={item.type} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
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
              {notesText(employee.notes, lang)}
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function employeeNameText(value: string, lang: string) {
  const map: Record<string, string> = {
    "أحمد محمد": lang === "ar" ? "أحمد محمد" : "Ahmed Mohamed",
  };
  return map[value] || value;
}

function nationalityText(value: string, lang: string) {
  const map: Record<string, string> = {
    "مصري": lang === "ar" ? "مصري" : "Egyptian",
  };
  return map[value] || value;
}

function jobTitleText(value: string, lang: string) {
  const map: Record<string, string> = {
    "مندوب كيتا": lang === "ar" ? "مندوب كيتا" : "Keeta Courier",
    "مندوب هنقرستيشن": lang === "ar" ? "مندوب هنقرستيشن" : "HungerStation Courier",
    مشرف: lang === "ar" ? "مشرف" : "Supervisor",
    ميكانيكي: lang === "ar" ? "ميكانيكي" : "Mechanic",
    "مسؤول الصيانة": lang === "ar" ? "مسؤول الصيانة" : "Maintenance Officer",
  };
  return map[value] || value;
}

function workLocationText(value: string, lang: string) {
  const map: Record<string, string> = {
    Keeta: "Keeta",
    HungerStation: "HungerStation",
    الإدارة: lang === "ar" ? "الإدارة" : "Management",
    الصيانة: lang === "ar" ? "الصيانة" : "Maintenance",
  };
  return map[value] || value;
}

function statusText(value: string, lang: string) {
  const map: Record<string, string> = {
    نشط: lang === "ar" ? "نشط" : "Active",
    متوقف: lang === "ar" ? "متوقف" : "Stopped",
    إجازة: lang === "ar" ? "إجازة" : "Vacation",
    "خارج الخدمة": lang === "ar" ? "خارج الخدمة" : "Out Of Service",
  };
  return map[value] || value;
}

function performanceText(value: string, lang: string) {
  const map: Record<string, string> = {
    ممتاز: lang === "ar" ? "ممتاز" : "Excellent",
    جيد: lang === "ar" ? "جيد" : "Good",
    متوسط: lang === "ar" ? "متوسط" : "Average",
    ضعيف: lang === "ar" ? "ضعيف" : "Poor",
  };
  return map[value] || value;
}

function targetDeductionsText(value: string, lang: string) {
  const map: Record<string, string> = {
    "حسب سياسة التطبيق": lang === "ar" ? "حسب سياسة التطبيق" : "According to app policy",
  };
  return map[value] || value;
}

function attendanceStatusText(value: string, lang: string) {
  const map: Record<string, string> = {
    present: lang === "ar" ? "حاضر" : "Present",
    absent: lang === "ar" ? "غياب" : "Absent",
  };
  return map[value] || value;
}

function documentText(value: string, lang: string) {
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

function alertTypeText(value: string, lang: string) {
  const map: Record<string, string> = {
    absence: lang === "ar" ? "تغيب عن العمل" : "Work Absence",
    poorPerformance: lang === "ar" ? "سوء أداء" : "Poor Performance",
  };
  return map[value] || value;
}

function alertStatusText(value: string, lang: string) {
  const map: Record<string, string> = {
    sent: lang === "ar" ? "تم الإرسال" : "Sent",
    draft: lang === "ar" ? "مسودة" : "Draft",
  };
  return map[value] || value;
}

function notesText(value: string, lang: string) {
  const map: Record<string, string> = {
    "لا توجد ملاحظات": lang === "ar" ? "لا توجد ملاحظات" : "No notes",
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
              {row.map((cell) => (
                <td key={cell} className="p-3 text-start font-bold text-slate-600">
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