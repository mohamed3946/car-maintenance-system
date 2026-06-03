"use client";

import AppLayout, { useLanguage } from "../../components/AppLayout";
import {
  Users,
  UserCheck,
  ShieldAlert,
  FileWarning,
  CalendarDays,
} from "lucide-react";

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

  const text = {
    title: isAr ? "لوحة تحكم الموظفين" : "Employees Dashboard",
    subtitle: isAr
      ? "إدارة الموظفين والمناديب من مكان واحد"
      : "Manage employees and couriers from one place",

    totalEmployees: isAr ? "إجمالي الموظفين" : "Total Employees",
    activeEmployees: isAr ? "الموظفون النشطون" : "Active Employees",
    stoppedEmployees: isAr ? "الموظفون الموقوفون" : "Stopped Employees",
    warnings: isAr ? "المخالفات / الإنذارات" : "Warnings / Violations",
    iqamaExpiry: isAr ? "إقامات قرب الانتهاء" : "Iqama Expiring Soon",

    performanceTitle: isAr
      ? "أداء المناديب هذا الشهر"
      : "Couriers Performance This Month",
    performanceAverage: isAr ? "متوسط الأداء" : "Average Performance",

    employeeStatus: isAr ? "حالة الموظفين" : "Employees Status",
    active: isAr ? "نشط" : "Active",
    stopped: isAr ? "موقوف" : "Stopped",
    vacation: isAr ? "إجازة" : "Vacation",

    employeesByJob: isAr
      ? "الموظفون حسب المسمى الوظيفي"
      : "Employees By Job Title",

    keetaCourier: isAr ? "مندوب كيتا" : "Keeta Courier",
    hungerCourier: isAr ? "مندوب هنجرستيشن" : "HungerStation Courier",
    supervisor: isAr ? "مشرف" : "Supervisor",
    maintenanceOfficer: isAr ? "مسؤول الصيانة" : "Maintenance Officer",

    latestNotifications: isAr
      ? "أحدث الإشعارات والإنذارات"
      : "Latest Notifications & Warnings",

    absenceWarning: isAr
      ? "تم تجهيز إشعار تغيب عن العمل"
      : "Absence warning has been prepared",

    rejectionWarning: isAr
      ? "تم تجهيز إنذار رفض طلب"
      : "Order rejection warning has been prepared",

    employeesList: isAr ? "قائمة الموظفين" : "Employees List",
    employee: isAr ? "الموظف" : "Employee",
    jobTitle: isAr ? "المسمى" : "Job Title",
    workLocation: isAr ? "موقع العمل" : "Work Location",
    status: isAr ? "الحالة" : "Status",

    employee1: isAr ? "أحمد محمد" : "Ahmed Mohamed",
    employee2: isAr ? "سالم الدوسري" : "Salem Al-Dossary",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              {text.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{text.subtitle}</p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title={text.totalEmployees} value="128" icon={<Users className="h-7 w-7 text-blue-600" />} bg="bg-blue-50" />
        <StatCard title={text.activeEmployees} value="98" icon={<UserCheck className="h-7 w-7 text-green-600" />} bg="bg-green-50" />
        <StatCard title={text.stoppedEmployees} value="12" icon={<ShieldAlert className="h-7 w-7 text-red-600" />} bg="bg-red-50" />
        <StatCard title={text.warnings} value="8" icon={<FileWarning className="h-7 w-7 text-orange-600" />} bg="bg-orange-50" />
        <StatCard title={text.iqamaExpiry} value="9" icon={<CalendarDays className="h-7 w-7 text-yellow-600" />} bg="bg-yellow-50" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">
            {text.performanceTitle}
          </h3>

          <div className="mt-8 flex items-center justify-center">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[16px] border-green-500">
              <div className="text-center">
                <h2 className="text-5xl font-black text-slate-900">72%</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {text.performanceAverage}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">
            {text.employeeStatus}
          </h3>

          <div className="mt-8 space-y-5">
            <StatusBar title={text.active} value="98" width="78%" color="bg-green-500" />
            <StatusBar title={text.stopped} value="12" width="25%" color="bg-red-500" />
            <StatusBar title={text.vacation} value="8" width="18%" color="bg-orange-500" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">
            {text.employeesByJob}
          </h3>

          <div className="mt-8 space-y-4 text-sm font-bold text-slate-700">
            <JobRow title={text.keetaCourier} value="62" />
            <JobRow title={text.hungerCourier} value="28" />
            <JobRow title={text.supervisor} value="12" />
            <JobRow title={text.maintenanceOfficer} value="6" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">
            {text.latestNotifications}
          </h3>

          <div className="mt-6 space-y-4">
            <NotificationCard title={text.absenceWarning} name={text.employee1} />
            <NotificationCard title={text.rejectionWarning} name={text.employee2} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">
            {text.employeesList}
          </h3>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4">{text.employee}</th>
                  <th className="p-4">{text.jobTitle}</th>
                  <th className="p-4">{text.workLocation}</th>
                  <th className="p-4">{text.status}</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="p-4 font-bold">{text.employee1}</td>
                  <td className="p-4">{text.keetaCourier}</td>
                  <td className="p-4">Keeta</td>
                  <td className="p-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      {text.active}
                    </span>
                  </td>
                </tr>

                <tr className="border-t border-slate-100">
                  <td className="p-4 font-bold">{text.employee2}</td>
                  <td className="p-4">{text.hungerCourier}</td>
                  <td className="p-4">HungerStation</td>
                  <td className="p-4">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      {text.stopped}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h2 className="mt-3 text-5xl font-black text-slate-900">{value}</h2>
        </div>
        <div className={`rounded-2xl ${bg} p-4`}>{icon}</div>
      </div>
    </div>
  );
}

function StatusBar({ title, value, width, color }: any) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{title}</span>
        <span>{value}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

function JobRow({ title, value }: any) {
  return (
    <div className="flex justify-between">
      <span>{title}</span>
      <span>{value}</span>
    </div>
  );
}

function NotificationCard({ title, name }: any) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <p className="font-bold text-slate-800">{title}</p>
      <span className="mt-2 block text-sm text-slate-500">{name}</span>
    </div>
  );
}