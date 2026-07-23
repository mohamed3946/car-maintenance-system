"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";
import Button from "@/ui/button/Button";

type EmployeeStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "vacation"
  | "terminated";

type EmployeeKind = "courier" | "employee";

type EmployeeListItem = {
  id: string;
  employeeNumber: string;
  nameAr: string;
  nameEn: string;
  iqamaNumber: string;
  phone: string;
  nationalityAr: string;
  nationalityEn: string;
  jobTitleAr: string;
  jobTitleEn: string;
  branchAr: string;
  branchEn: string;
  employeeKind: EmployeeKind;
  applications: string[];
  status: EmployeeStatus;
  joiningDate: string;
  photo?: string;
};

const employees: EmployeeListItem[] = [
  {
    id: "emp-001",
    employeeNumber: "EMP-0001",
    nameAr: "محمد أحمد علي",
    nameEn: "Mohammed Ahmed Ali",
    iqamaNumber: "2405123456",
    phone: "0551234567",
    nationalityAr: "مصري",
    nationalityEn: "Egyptian",
    jobTitleAr: "مندوب توصيل",
    jobTitleEn: "Delivery Courier",
    branchAr: "الرياض - الشمال",
    branchEn: "Riyadh - North",
    employeeKind: "courier",
    applications: ["HungerStation", "Keeta"],
    status: "active",
    joiningDate: "2025-01-15",
  },
  {
    id: "emp-002",
    employeeNumber: "EMP-0002",
    nameAr: "سمير محمد الحنفي",
    nameEn: "Samir Mohammed Alhanafi",
    iqamaNumber: "2309876543",
    phone: "0559874567",
    nationalityAr: "سوداني",
    nationalityEn: "Sudanese",
    jobTitleAr: "مندوب توصيل",
    jobTitleEn: "Delivery Courier",
    branchAr: "الرياض - الوسط",
    branchEn: "Riyadh - Central",
    employeeKind: "courier",
    applications: ["HungerStation"],
    status: "active",
    joiningDate: "2025-02-10",
  },
  {
    id: "emp-003",
    employeeNumber: "EMP-0003",
    nameAr: "أحمد محمود إبراهيم",
    nameEn: "Ahmed Mahmoud Ibrahim",
    iqamaNumber: "2406677889",
    phone: "0553456789",
    nationalityAr: "مصري",
    nationalityEn: "Egyptian",
    jobTitleAr: "مشرف عمليات",
    jobTitleEn: "Operations Supervisor",
    branchAr: "الرياض - الشمال",
    branchEn: "Riyadh - North",
    employeeKind: "employee",
    applications: [],
    status: "vacation",
    joiningDate: "2024-11-01",
  },
  {
    id: "emp-004",
    employeeNumber: "EMP-0004",
    nameAr: "عبدالله سعد الدوسري",
    nameEn: "Abdullah Saad Aldosari",
    iqamaNumber: "1098765432",
    phone: "0501122334",
    nationalityAr: "سعودي",
    nationalityEn: "Saudi",
    jobTitleAr: "مسؤول موارد بشرية",
    jobTitleEn: "HR Officer",
    branchAr: "الإدارة الرئيسية",
    branchEn: "Head Office",
    employeeKind: "employee",
    applications: [],
    status: "active",
    joiningDate: "2024-03-01",
  },
  {
    id: "emp-005",
    employeeNumber: "EMP-0005",
    nameAr: "شاهين مياح",
    nameEn: "Shahin Miah",
    iqamaNumber: "2388123456",
    phone: "0557766554",
    nationalityAr: "بنجلاديشي",
    nationalityEn: "Bangladeshi",
    jobTitleAr: "مندوب توصيل",
    jobTitleEn: "Delivery Courier",
    branchAr: "الرياض - الجنوب",
    branchEn: "Riyadh - South",
    employeeKind: "courier",
    applications: ["Keeta"],
    status: "suspended",
    joiningDate: "2024-06-18",
  },
];

type StatusFilter = "all" | EmployeeStatus;
type KindFilter = "all" | EmployeeKind;

export default function EmployeesPage() {
  const { lang } = useSystem();
  const isArabic = lang === "ar";

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [kindFilter, setKindFilter] =
    useState<KindFilter>("all");

  const filteredEmployees = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.nameAr.toLowerCase().includes(query) ||
        employee.nameEn.toLowerCase().includes(query) ||
        employee.iqamaNumber.includes(query) ||
        employee.employeeNumber.toLowerCase().includes(query) ||
        employee.phone.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        employee.status === statusFilter;

      const matchesKind =
        kindFilter === "all" ||
        employee.employeeKind === kindFilter;

      return matchesSearch && matchesStatus && matchesKind;
    });
  }, [searchValue, statusFilter, kindFilter]);

  const statistics = useMemo(() => {
    return {
      total: employees.length,
      active: employees.filter(
        (employee) => employee.status === "active"
      ).length,
      couriers: employees.filter(
        (employee) => employee.employeeKind === "courier"
      ).length,
      suspended: employees.filter(
        (employee) => employee.status === "suspended"
      ).length,
    };
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Users className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {isArabic ? "قائمة الموظفين" : "Employees"}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {isArabic
                  ? "إدارة بيانات الموظفين والمناديب وربطهم بالتطبيقات والفروع."
                  : "Manage employees, couriers, applications, and branch assignments."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              iconStart={<Download className="h-4 w-4" />}
            >
              {isArabic ? "تصدير Excel" : "Export Excel"}
            </Button>

            <Link href="/v2/hr/employees/new">
              <Button
                size="lg"
                iconStart={<Plus className="h-5 w-5" />}
              >
                {isArabic ? "إضافة موظف" : "Add Employee"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EmployeeStatCard
          title={isArabic ? "إجمالي الموظفين" : "Total Employees"}
          value={statistics.total}
          note={isArabic ? "جميع الموظفين المسجلين" : "All registered employees"}
          icon={<Users className="h-6 w-6" />}
          iconClass="bg-blue-50 text-blue-700"
        />

        <EmployeeStatCard
          title={isArabic ? "الموظفون النشطون" : "Active Employees"}
          value={statistics.active}
          note={isArabic ? "على رأس العمل حاليًا" : "Currently active"}
          icon={<UserCheck className="h-6 w-6" />}
          iconClass="bg-emerald-50 text-emerald-700"
        />

        <EmployeeStatCard
          title={isArabic ? "مناديب التوصيل" : "Delivery Couriers"}
          value={statistics.couriers}
          note={isArabic ? "مرتبطون بتطبيقات التوصيل" : "Assigned to delivery apps"}
          icon={<BriefcaseBusiness className="h-6 w-6" />}
          iconClass="bg-violet-50 text-violet-700"
        />

        <EmployeeStatCard
          title={isArabic ? "الموقوفون" : "Suspended"}
          value={statistics.suspended}
          note={isArabic ? "موظفون موقوفون عن العمل" : "Suspended employees"}
          icon={<ShieldAlert className="h-6 w-6" />}
          iconClass="bg-red-50 text-red-700"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

  {/* Search */}
  <div className="relative flex-1">
    <Search className="pointer-events-none absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

    <input
      type="search"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      placeholder={
        isArabic
          ? "بحث بالاسم أو الإقامة أو الرقم الوظيفي أو الجوال..."
          : "Search by name, ID, employee number or phone..."
      }
      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pe-12 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  </div>

  {/* Employee Type */}
  <select
    value={kindFilter}
    onChange={(e) =>
      setKindFilter(e.target.value as KindFilter)
    }
    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold xl:w-56"
  >
    <option value="all">
      {isArabic
        ? "كل أنواع الموظفين"
        : "All Employee Types"}
    </option>

    <option value="courier">
      {isArabic ? "مندوب توصيل" : "Courier"}
    </option>

    <option value="employee">
      {isArabic ? "موظف" : "Employee"}
    </option>
  </select>

  {/* Status */}
  <select
    value={statusFilter}
    onChange={(e) =>
      setStatusFilter(e.target.value as StatusFilter)
    }
    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold xl:w-52"
  >
    <option value="all">
      {isArabic ? "كل الحالات" : "All Statuses"}
    </option>

    <option value="active">
      {isArabic ? "نشط" : "Active"}
    </option>

    <option value="inactive">
      {isArabic ? "غير نشط" : "Inactive"}
    </option>

    <option value="vacation">
      {isArabic ? "إجازة" : "Vacation"}
    </option>

    <option value="suspended">
      {isArabic ? "موقوف" : "Suspended"}
    </option>

    <option value="terminated">
      {isArabic ? "منتهي الخدمة" : "Terminated"}
    </option>
  </select>

  {/* Clear */}
  <Button
    variant="secondary"
    className="h-12 xl:w-44"
    iconStart={<Filter className="h-4 w-4" />}
    onClick={() => {
      setSearchValue("");
      setKindFilter("all");
      setStatusFilter("all");
    }}
  >
    {isArabic ? "إلغاء التصفية" : "Clear"}
  </Button>

</div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <TableHeading value="#" />
                <TableHeading
                  value={isArabic ? "الموظف" : "Employee"}
                />
                <TableHeading
                  value={isArabic ? "رقم الإقامة" : "ID Number"}
                />
                <TableHeading
                  value={isArabic ? "الوظيفة" : "Job Title"}
                />
                <TableHeading
                  value={isArabic ? "التطبيقات" : "Applications"}
                />
                <TableHeading
                  value={isArabic ? "الفرع" : "Branch"}
                />
                <TableHeading
                  value={isArabic ? "الحالة" : "Status"}
                />
                <TableHeading
                  value={isArabic ? "تاريخ المباشرة" : "Joining Date"}
                />
                <TableHeading
                  value={isArabic ? "الإجراءات" : "Actions"}
                  centered
                />
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee, index) => {
                const name = isArabic
                  ? employee.nameAr
                  : employee.nameEn;

                const secondaryName = isArabic
                  ? employee.nameEn
                  : employee.nameAr;

                return (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-blue-50/30"
                  >
                    <TableCell>
                      <span className="font-black text-slate-400">
                        {index + 1}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar
                          name={name}
                          photo={employee.photo}
                        />

                        <div className="min-w-0">
                          <Link
                            href={`/v2/hr/employees/${employee.id}`}
                            className="block truncate text-sm font-black text-slate-900 hover:text-blue-700"
                          >
                            {name}
                          </Link>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                            {secondaryName}
                          </p>

                          <p
                            className="mt-1 text-[11px] font-bold text-slate-400"
                            dir="ltr"
                          >
                            {employee.employeeNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p
                        className="text-sm font-black text-slate-800"
                        dir="ltr"
                      >
                        {employee.iqamaNumber}
                      </p>

                      <p
                        className="mt-1 text-xs font-semibold text-slate-500"
                        dir="ltr"
                      >
                        {employee.phone}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm font-black text-slate-800">
                        {isArabic
                          ? employee.jobTitleAr
                          : employee.jobTitleEn}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {isArabic
                          ? employee.nationalityAr
                          : employee.nationalityEn}
                      </p>
                    </TableCell>

                    <TableCell>
                      {employee.applications.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {employee.applications.map(
                            (application) => (
                              <span
                                key={application}
                                className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700"
                              >
                                {application}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          —
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-bold text-slate-700">
                        {isArabic
                          ? employee.branchAr
                          : employee.branchEn}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={employee.status}
                        isArabic={isArabic}
                      />
                    </TableCell>

                    <TableCell>
                      <span
                        className="text-sm font-bold text-slate-700"
                        dir="ltr"
                      >
                        {employee.joiningDate}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/v2/hr/employees/${employee.id}`}
                          aria-label={
                            isArabic
                              ? "عرض الموظف"
                              : "View employee"
                          }
                          className={actionButtonClassName}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/v2/hr/employees/${employee.id}/edit`}
                          aria-label={
                            isArabic
                              ? "تعديل الموظف"
                              : "Edit employee"
                          }
                          className={actionButtonClassName}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          aria-label={
                            isArabic
                              ? "المزيد من الخيارات"
                              : "More options"
                          }
                          className={actionButtonClassName}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="px-6 py-16 text-center">
            <UserRound className="mx-auto h-12 w-12 text-slate-300" />

            <h2 className="mt-4 text-lg font-black text-slate-900">
              {isArabic
                ? "لا توجد نتائج مطابقة"
                : "No Matching Employees"}
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-500">
              {isArabic
                ? "غيّر كلمات البحث أو ألغِ عوامل التصفية."
                : "Change the search query or clear the filters."}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-500">
            {isArabic
              ? `عرض ${filteredEmployees.length} من أصل ${employees.length} موظف`
              : `Showing ${filteredEmployees.length} of ${employees.length} employees`}
          </p>

          <div className="flex items-center gap-2">
            <button className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-blue-600 bg-blue-600 px-3 text-sm font-black text-white">
              1
            </button>

            <button className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600">
              2
            </button>

            <button className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600">
              3
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

type EmployeeStatCardProps = {
  title: string;
  value: number;
  note: string;
  icon: React.ReactNode;
  iconClass: string;
};

function EmployeeStatCard({
  title,
  value,
  note,
  icon,
  iconClass,
}: EmployeeStatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-slate-600">
            {title}
          </p>

          <strong className="mt-3 block text-3xl font-black text-slate-900">
            {value}
          </strong>

          <p className="mt-2 text-xs font-semibold text-slate-400">
            {note}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

function EmployeeAvatar({
  name,
  photo,
}: {
  name: string;
  photo?: string;
}) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
      {initials}
    </div>
  );
}

function StatusBadge({
  status,
  isArabic,
}: {
  status: EmployeeStatus;
  isArabic: boolean;
}) {
  const data: Record<
    EmployeeStatus,
    {
      ar: string;
      en: string;
      className: string;
      dotClass: string;
    }
  > = {
    active: {
      ar: "نشط",
      en: "Active",
      className: "bg-emerald-50 text-emerald-700",
      dotClass: "bg-emerald-500",
    },
    inactive: {
      ar: "غير نشط",
      en: "Inactive",
      className: "bg-slate-100 text-slate-600",
      dotClass: "bg-slate-400",
    },
    suspended: {
      ar: "موقوف",
      en: "Suspended",
      className: "bg-red-50 text-red-700",
      dotClass: "bg-red-500",
    },
    vacation: {
      ar: "إجازة",
      en: "Vacation",
      className: "bg-amber-50 text-amber-700",
      dotClass: "bg-amber-500",
    },
    terminated: {
      ar: "منتهي الخدمة",
      en: "Terminated",
      className: "bg-rose-50 text-rose-700",
      dotClass: "bg-rose-500",
    },
  };

  const current = data[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${current.className}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${current.dotClass}`}
      />

      {isArabic ? current.ar : current.en}
    </span>
  );
}

function TableHeading({
  value,
  centered = false,
}: {
  value: string;
  centered?: boolean;
}) {
  return (
    <th
      className={`px-4 py-4 text-xs font-black text-slate-600 ${
        centered ? "text-center" : "text-start"
      }`}
    >
      {value}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-4 py-4 align-middle">
      {children}
    </td>
  );
}

const selectClassName =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

const actionButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";