"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileSpreadsheet,
  Users,
  UserCheck,
  UserX,
  Building2,
  Bike,
  UtensilsCrossed,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  ChevronDown,
  BriefcaseBusiness,
  Smartphone,
  CreditCard,
  X,
  Check,
  CircleOff,
} from "lucide-react";

import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx-js-style";

type Lang = "ar" | "en";

type Employee = {
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
  photo_url: string | null;
  platform_id: string | null;
  keeta_id: string | null;
  hunger_id: string | null;
  vehicle_number: string | null;
};

type EmployeeStatus = "active" | "stopped" | "vacation" | "outOfService";

export default function EmployeesListPage() {
  return (
    <AppLayout
      system="employees"
      titleKey="employeesList"
      subtitleKey="employeesListSubtitle"
    >
      <EmployeesListContent />
    </AppLayout>
  );
}

function EmployeesListContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const t = {
    title: isAr ? "قائمة الموظفين" : "Employees",
    subtitle: isAr
      ? "ابحث، فلتر، راجع وعدّل بيانات الموظفين من مكان واحد."
      : "Search, filter, review and update employee data from one place.",

    addEmployee: isAr ? "إضافة موظف" : "Add Employee",
    export: isAr ? "تصدير Excel" : "Export Excel",

    total: isAr ? "إجمالي الموظفين" : "Total Employees",
    active: isAr ? "الموظفون النشطون" : "Active Employees",
    inactive: isAr ? "الموظفون غير النشطين" : "Inactive Employees",
    outOfService: isAr ? "خارج الخدمة" : "Out of Service",
    management: isAr ? "موظفو الإدارة" : "Management Staff",
    hunger: isAr ? "موظفو هنجرستيشن" : "HungerStation Staff",
    keeta: isAr ? "موظفو كيتا" : "Keeta Staff",

    searchPlaceholder: isAr
      ? "ابحث باسم الموظف أو الإقامة أو الجوال أو ID المنصة..."
      : "Search by name, Iqama, phone or platform ID...",

    allStatuses: isAr ? "كل الحالات" : "All Statuses",
    allLocations: isAr ? "كل مواقع العمل" : "All Locations",
    allJobs: isAr ? "كل المسميات" : "All Job Titles",

    employee: isAr ? "الموظف" : "Employee",
    iqama: isAr ? "الإقامة" : "Iqama",
    phone: isAr ? "الجوال" : "Phone",
    nationality: isAr ? "الجنسية" : "Nationality",
    job: isAr ? "المسمى" : "Job Title",
    location: isAr ? "موقع العمل" : "Work Location",
    status: isAr ? "الحالة" : "Status",
    performance: isAr ? "الأداء" : "Performance",
    actions: isAr ? "الإجراءات" : "Actions",

    view: isAr ? "عرض التفاصيل" : "View Details",
    edit: isAr ? "تعديل" : "Edit",
    delete: isAr ? "حذف" : "Delete",

    deleteConfirm: isAr
      ? "هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن الحذف."
      : "Are you sure you want to delete this employee? This action cannot be undone.",

    deleteError: isAr
      ? "حدث خطأ أثناء حذف الموظف."
      : "An error occurred while deleting the employee.",

    statusUpdateError: isAr
      ? "تعذر تحديث حالة الموظف."
      : "Could not update employee status.",

    clearFilters: isAr ? "مسح الفلاتر" : "Clear Filters",
    noResults: isAr ? "لا توجد نتائج مطابقة" : "No matching employees found",
    results: isAr ? "عدد النتائج" : "Results",
    loading: isAr ? "جاري تحميل الموظفين..." : "Loading employees...",
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const closeMenus = () => {
      setOpenMenu(null);
      setOpenStatusMenu(null);
    };

    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  async function loadEmployees() {
    setLoading(true);

    const { data, error } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        iqama,
        phone,
        email,
        nationality,
        job_title,
        work_location,
        status,
        performance,
        start_date,
        photo_url,
        platform_id,
        keeta_id,
        hunger_id,
        vehicle_number
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("LOAD EMPLOYEES ERROR:", error);
      setEmployees([]);
      setLoading(false);
      return;
    }

    setEmployees((data || []) as Employee[]);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const total = employees.length;

    const active = employees.filter(
      (employee) => normalizeStatus(employee.status) === "active"
    ).length;

    const inactive = employees.filter(
      (employee) => normalizeStatus(employee.status) === "stopped"
    ).length;

    const outOfService = employees.filter(
      (employee) => normalizeStatus(employee.status) === "outOfService"
    ).length;

    const management = employees.filter((employee) => {
      const location = employee.work_location || "";
      return location === "management" || location === "الإدارة";
    }).length;

    const hunger = employees.filter((employee) => {
      const location = employee.work_location || "";
      return location === "HungerStation" || location === "KeetaAndHungerStation";
    }).length;

    const keeta = employees.filter((employee) => {
      const location = employee.work_location || "";
      return location === "Keeta" || location === "KeetaAndHungerStation";
    }).length;

    return {
      total,
      active,
      inactive,
      outOfService,
      management,
      hunger,
      keeta,
    };
  }, [employees]);

  const availableLocations = useMemo(() => {
    return Array.from(
      new Set(
        employees
          .map((employee) => employee.work_location)
          .filter(Boolean) as string[]
      )
    );
  }, [employees]);

  const availableJobs = useMemo(() => {
    return Array.from(
      new Set(
        employees
          .map((employee) => employee.job_title)
          .filter(Boolean) as string[]
      )
    );
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const searchableValues = [
        employee.name,
        employee.iqama,
        employee.phone,
        employee.email,
        employee.platform_id,
        employee.keeta_id,
        employee.hunger_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        query.length === 0 || searchableValues.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        normalizeStatus(employee.status) === statusFilter;

      const matchesLocation =
        locationFilter === "all" ||
        (locationFilter === "HungerStation"
          ? employee.work_location === "HungerStation" ||
            employee.work_location === "KeetaAndHungerStation"
          : locationFilter === "Keeta"
          ? employee.work_location === "Keeta" ||
            employee.work_location === "KeetaAndHungerStation"
          : employee.work_location === locationFilter);

      const matchesJob =
        jobFilter === "all" || employee.job_title === jobFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLocation &&
        matchesJob
      );
    });
  }, [
    employees,
    search,
    statusFilter,
    locationFilter,
    jobFilter,
  ]);

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    locationFilter !== "all" ||
    jobFilter !== "all";

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setLocationFilter("all");
    setJobFilter("all");
  }

  function applyStatFilter(
    type: "all" | "active" | "inactive" | "outOfService" | "management" | "hunger" | "keeta"
  ) {
    setSearch("");
    setJobFilter("all");
    setStatusFilter("all");
    setLocationFilter("all");

    if (type === "active") setStatusFilter("active");
    if (type === "inactive") setStatusFilter("stopped");
    if (type === "outOfService") setStatusFilter("outOfService");
    if (type === "management") setLocationFilter("management");
    if (type === "hunger") setLocationFilter("HungerStation");
    if (type === "keeta") setLocationFilter("Keeta");
  }

  function isStatCardActive(
    type: "all" | "active" | "inactive" | "outOfService" | "management" | "hunger" | "keeta"
  ) {
    if (type === "all") {
      return statusFilter === "all" && locationFilter === "all" && jobFilter === "all" && !search;
    }

    if (type === "active") return statusFilter === "active" && locationFilter === "all";
    if (type === "inactive") return statusFilter === "stopped" && locationFilter === "all";
    if (type === "outOfService") return statusFilter === "outOfService" && locationFilter === "all";
    if (type === "management") return locationFilter === "management" && statusFilter === "all";
    if (type === "hunger") return locationFilter === "HungerStation" && statusFilter === "all";
    if (type === "keeta") return locationFilter === "Keeta" && statusFilter === "all";

    return false;
  }

  async function updateEmployeeStatus(
    employee: Employee,
    newStatus: EmployeeStatus
  ) {
    if (normalizeStatus(employee.status) === newStatus) {
      setOpenStatusMenu(null);
      return;
    }

    setUpdatingStatusId(employee.id);

    const { error } = await supabase
      .from("employees")
      .update({ status: newStatus })
      .eq("id", employee.id);

    if (error) {
      console.error("UPDATE EMPLOYEE STATUS ERROR:", error);
      alert(t.statusUpdateError);
      setUpdatingStatusId(null);
      return;
    }

    setEmployees((current) =>
      current.map((item) =>
        item.id === employee.id
          ? { ...item, status: newStatus }
          : item
      )
    );

    setUpdatingStatusId(null);
    setOpenStatusMenu(null);
  }

  async function deleteEmployee(employee: Employee) {
    const ok = window.confirm(
      `${t.deleteConfirm}\n\n${employee.name}`
    );

    if (!ok) return;

    setDeletingId(employee.id);
    setOpenMenu(null);

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employee.id);

    if (error) {
      console.error("DELETE EMPLOYEE ERROR:", error);
      alert(t.deleteError);
      setDeletingId(null);
      return;
    }

    setEmployees((current) =>
      current.filter((item) => item.id !== employee.id)
    );

    setDeletingId(null);
  }

  function exportEmployees() {
    if (filteredEmployees.length === 0) return;

    const exportRows: Record<string, string | number>[] = [];

    filteredEmployees.forEach((employee) => {
      const common = {
        [isAr ? "اسم الموظف" : "Employee Name"]: employee.name || "-",
        [isAr ? "رقم الإقامة" : "Iqama"]: employee.iqama || "-",
        [isAr ? "رقم الجوال" : "Phone"]: employee.phone || "-",
        [isAr ? "الجنسية" : "Nationality"]: employee.nationality || "-",
        [isAr ? "المسمى الوظيفي" : "Job Title"]: jobTitleText(employee.job_title, lang),
        [isAr ? "موقع العمل" : "Work Location"]: workLocationText(employee.work_location, lang),
        [isAr ? "الحالة" : "Status"]: statusText(employee.status, lang),
        [isAr ? "الأداء" : "Performance"]: performanceText(employee.performance, lang),
        [isAr ? "رقم المركبة" : "Vehicle Number"]: employee.vehicle_number || "-",
      };

      const location = employee.work_location;

      if (location === "KeetaAndHungerStation") {
        exportRows.push({
          ...common,
          [isAr ? "التطبيق" : "Application"]: "HungerStation",
          [isAr ? "رقم ID" : "Platform ID"]: employee.hunger_id || "-",
        });

        exportRows.push({
          ...common,
          [isAr ? "التطبيق" : "Application"]: "Keeta",
          [isAr ? "رقم ID" : "Platform ID"]: employee.keeta_id || "-",
        });
        return;
      }

      if (location === "HungerStation") {
        exportRows.push({
          ...common,
          [isAr ? "التطبيق" : "Application"]: "HungerStation",
          [isAr ? "رقم ID" : "Platform ID"]:
            employee.hunger_id || employee.platform_id || "-",
        });
        return;
      }

      if (location === "Keeta") {
        exportRows.push({
          ...common,
          [isAr ? "التطبيق" : "Application"]: "Keeta",
          [isAr ? "رقم ID" : "Platform ID"]:
            employee.keeta_id || employee.platform_id || "-",
        });
        return;
      }

      // لو الموظف غير مرتبط بتطبيق توصيل، يتم تصديره كسطر واحد.
      exportRows.push({
        ...common,
        [isAr ? "التطبيق" : "Application"]: "-",
        [isAr ? "رقم ID" : "Platform ID"]: "-",
      });
    });

    const numberedRows = exportRows.map((row, index) => ({
      [isAr ? "م" : "#"]: index + 1,
      ...row,
    }));

    const worksheet = XLSX.utils.json_to_sheet(numberedRows);
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 34 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 23 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
    ];

    worksheet["!rows"] = [{ hpt: 28 }];
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    worksheet["!autofilter"] = { ref: worksheet["!ref"] || "A1:A1" };

    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: "0F2544" } },
        font: { color: { rgb: "FFFFFF" }, bold: true, sz: 11 },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        border: {
          top: { style: "thin", color: { rgb: "D9E2EF" } },
          bottom: { style: "thin", color: { rgb: "D9E2EF" } },
          left: { style: "thin", color: { rgb: "D9E2EF" } },
          right: { style: "thin", color: { rgb: "D9E2EF" } },
        },
      };
    }

    for (let R = 1; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
          font: {
            bold: C === 1 || C === 10 || C === 11,
            color: { rgb: "0F2544" },
          },
          alignment: {
            horizontal: C === 1 ? (isAr ? "right" : "left") : "center",
            vertical: "center",
          },
          fill: {
            fgColor: { rgb: R % 2 === 0 ? "F8FBFF" : "FFFFFF" },
          },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
          },
        };
      }
    }

    // تمييز أعمدة التطبيق و ID.
    for (let R = 1; R <= range.e.r; R++) {
      const appCell = XLSX.utils.encode_cell({ r: R, c: 10 });
      const idCell = XLSX.utils.encode_cell({ r: R, c: 11 });

      if (worksheet[appCell]) {
        worksheet[appCell].s = {
          ...worksheet[appCell].s,
          font: { bold: true, color: { rgb: "087A55" } },
          fill: { fgColor: { rgb: "EAF9F1" } },
        };
      }

      if (worksheet[idCell]) {
        worksheet[idCell].s = {
          ...worksheet[idCell].s,
          font: { bold: true, color: { rgb: "0F2544" } },
          fill: { fgColor: { rgb: "F1F5F9" } },
        };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      isAr ? "الموظفون" : "Employees"
    );

    XLSX.writeFile(
      workbook,
      `Employees-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

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

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="space-y-5 pb-8"
    >
      {/* PAGE HEADER */}
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#102a4c] md:text-3xl">
            {t.title}
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportEmployees}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            {t.export}
          </button>

          <Link
            href="/employees/add"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            {t.addEmployee}
          </Link>
        </div>
      </section>

      {/* CIRCULAR STATS - CLICK TO FILTER */}
      <section className="rounded-[24px] border border-slate-200 bg-white px-4 py-5 shadow-sm md:px-6">
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 xl:grid-cols-7">
          <CircleStatCard
            title={t.total}
            value={stats.total}
            tone="blue"
            icon={<Users className="h-5 w-5" />}
            active={isStatCardActive("all")}
            onClick={() => applyStatFilter("all")}
          />

          <CircleStatCard
            title={t.active}
            value={stats.active}
            tone="green"
            icon={<UserCheck className="h-5 w-5" />}
            active={isStatCardActive("active")}
            onClick={() => applyStatFilter("active")}
          />

          <CircleStatCard
            title={t.inactive}
            value={stats.inactive}
            tone="red"
            icon={<UserX className="h-5 w-5" />}
            active={isStatCardActive("inactive")}
            onClick={() => applyStatFilter("inactive")}
          />

          <CircleStatCard
            title={t.outOfService}
            value={stats.outOfService}
            tone="dark"
            icon={<CircleOff className="h-5 w-5" />}
            active={isStatCardActive("outOfService")}
            onClick={() => applyStatFilter("outOfService")}
          />

          <CircleStatCard
            title={t.management}
            value={stats.management}
            tone="slate"
            icon={<Building2 className="h-5 w-5" />}
            active={isStatCardActive("management")}
            onClick={() => applyStatFilter("management")}
          />

          <CircleStatCard
            title={t.hunger}
            value={stats.hunger}
            tone="hungerGreen"
            icon={<UtensilsCrossed className="h-5 w-5" />}
            active={isStatCardActive("hunger")}
            onClick={() => applyStatFilter("hunger")}
          />

          <CircleStatCard
            title={t.keeta}
            value={stats.keeta}
            tone="purple"
            icon={<Bike className="h-5 w-5" />}
            active={isStatCardActive("keeta")}
            onClick={() => applyStatFilter("keeta")}
          />
        </div>
      </section>

      {/* FILTERS */}
      <section className="rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
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

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            isAr={isAr}
          >
            <option value="all">{t.allStatuses}</option>
            <option value="active">
              {isAr ? "نشط" : "Active"}
            </option>
            <option value="stopped">
              {isAr ? "غير نشط" : "Inactive"}
            </option>
            <option value="vacation">
              {isAr ? "إجازة" : "Vacation"}
            </option>
            <option value="outOfService">
              {isAr ? "خارج الخدمة" : "Out Of Service"}
            </option>
          </FilterSelect>

          <FilterSelect
            value={locationFilter}
            onChange={setLocationFilter}
            isAr={isAr}
          >
            <option value="all">{t.allLocations}</option>

            {availableLocations.map((location) => (
              <option key={location} value={location}>
                {workLocationText(location, lang)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={jobFilter}
            onChange={setJobFilter}
            isAr={isAr}
          >
            <option value="all">{t.allJobs}</option>

            {availableJobs.map((job) => (
              <option key={job} value={job}>
                {jobTitleText(job, lang)}
              </option>
            ))}
          </FilterSelect>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              {t.clearFilters}
            </button>
          )}
        </div>
      </section>

      {/* TABLE */}
      <section className="overflow-visible rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
          <div>
            <h2 className="text-base font-black text-[#102a4c]">
              {isAr ? "سجل الموظفين" : "Employee Directory"}
            </h2>

            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {isAr
                ? "عرض وإدارة جميع الموظفين"
                : "View and manage all employees"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
            {t.results}:{" "}
            <span className="font-black text-[#102a4c]">
              {filteredEmployees.length}
            </span>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-black text-[#102a4c]">
              {t.noResults}
            </h3>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700 hover:bg-blue-100"
            >
              {t.clearFilters}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <TableHead className="min-w-[360px]">
                    {t.employee}
                  </TableHead>

                  <TableHead>{t.iqama}</TableHead>
                  <TableHead>{t.phone}</TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    {t.nationality}
                  </TableHead>

                  <TableHead className="hidden lg:table-cell">
                    {t.job}
                  </TableHead>

                  <TableHead>{t.location}</TableHead>
                  <TableHead>{t.status}</TableHead>

                  <TableHead className="hidden xl:table-cell">
                    {t.performance}
                  </TableHead>

                  <TableHead className="w-[90px] text-center">
                    {t.actions}
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className={`border-b border-slate-100 transition last:border-b-0 hover:bg-blue-50/30 ${
                      deletingId === employee.id
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <EmployeeCell
                        employee={employee}
                        lang={lang}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-400" />

                        <span
                          dir="ltr"
                          className="whitespace-nowrap text-sm font-semibold text-slate-700"
                        >
                          {employee.iqama || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-slate-400" />

                        <span
                          dir="ltr"
                          className="whitespace-nowrap text-sm font-semibold text-slate-700"
                        >
                          {employee.phone || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="hidden px-4 py-3 text-sm font-semibold text-slate-600 2xl:table-cell">
                      {employee.nationality || "-"}
                    </td>

                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-sm font-bold text-slate-700">
                        {jobTitleText(employee.job_title, lang)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <WorkLocationBadge
                        value={employee.work_location}
                        lang={lang}
                      />
                    </td>

                    <td className="relative px-4 py-3">
                      <StatusSelector
                        employee={employee}
                        lang={lang}
                        open={openStatusMenu === employee.id}
                        loading={updatingStatusId === employee.id}
                        onToggle={(event) => {
                          event.stopPropagation();
                          setOpenMenu(null);
                          setOpenStatusMenu((current) =>
                            current === employee.id
                              ? null
                              : employee.id
                          );
                        }}
                        onSelect={(status) =>
                          updateEmployeeStatus(employee, status)
                        }
                      />
                    </td>

                    <td className="hidden px-4 py-3 xl:table-cell">
                      <PerformanceBadge
                        performance={employee.performance}
                        lang={lang}
                      />
                    </td>

                    <td className="relative px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenStatusMenu(null);

                          setOpenMenu((current) =>
                            current === employee.id
                              ? null
                              : employee.id
                          );
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenu === employee.id && (
                        <div
                          onClick={(event) => event.stopPropagation()}
                          className={`absolute top-[46px] z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-start shadow-xl ${
                            isAr ? "left-4" : "right-4"
                          }`}
                        >
                          <Link
                            href={`/employees/${employee.id}`}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                            {t.view}
                          </Link>

                          <Link
                            href={`/employees/${employee.id}/edit`}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4 text-blue-600" />
                            {t.edit}
                          </Link>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => deleteEmployee(employee)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start text-sm font-extrabold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t.delete}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <p className="text-xs font-bold text-slate-500">
            {isAr ? "المعروض:" : "Showing:"}{" "}
            <span className="font-black text-slate-800">
              {filteredEmployees.length}
            </span>
          </p>

          <p className="text-xs font-bold text-slate-400">
            {isAr
              ? `من إجمالي ${employees.length} موظف`
              : `of ${employees.length} employees`}
          </p>
        </div>
      </section>
    </div>
  );
}

function CircleStatCard({
  title,
  value,
  tone,
  icon,
  active,
  onClick,
}: {
  title: string;
  value: number;
  tone:
    | "blue"
    | "green"
    | "red"
    | "dark"
    | "slate"
    | "hungerGreen"
    | "purple";
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    blue: {
      ring: "border-blue-200 bg-blue-50",
      number: "text-blue-700",
      icon: "bg-blue-100 text-blue-700",
      active: "ring-blue-200",
    },
    green: {
      ring: "border-emerald-200 bg-emerald-50",
      number: "text-emerald-700",
      icon: "bg-emerald-100 text-emerald-700",
      active: "ring-emerald-200",
    },
    red: {
      ring: "border-red-200 bg-red-50",
      number: "text-red-700",
      icon: "bg-red-100 text-red-700",
      active: "ring-red-200",
    },
    dark: {
      ring: "border-zinc-300 bg-zinc-100",
      number: "text-zinc-800",
      icon: "bg-zinc-200 text-zinc-800",
      active: "ring-zinc-300",
    },
    slate: {
      ring: "border-slate-300 bg-slate-50",
      number: "text-slate-700",
      icon: "bg-slate-200 text-slate-700",
      active: "ring-slate-300",
    },
    hungerGreen: {
      ring: "border-green-300 bg-green-50",
      number: "text-green-700",
      icon: "bg-green-100 text-green-700",
      active: "ring-green-200",
    },
    purple: {
      ring: "border-violet-200 bg-violet-50",
      number: "text-violet-700",
      icon: "bg-violet-100 text-violet-700",
      active: "ring-violet-200",
    },
  };

  const current = tones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl px-2 py-1 text-center outline-none transition ${
        active ? "bg-slate-50/80" : "hover:bg-slate-50/60"
      }`}
    >
      <div
        className={`relative flex h-[108px] w-[108px] items-center justify-center rounded-full border-[3px] shadow-[0_5px_14px_rgba(15,23,42,0.05)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-md ${
          current.ring
        } ${active ? `ring-4 ${current.active}` : ""}`}
      >
        <div
          className={`absolute top-2.5 flex h-7 w-7 items-center justify-center rounded-full ${current.icon}`}
        >
          {icon}
        </div>

        <span
          className={`mt-5 text-[30px] font-black leading-none ${current.number}`}
        >
          {value}
        </span>
      </div>

      <p className={`mt-2.5 min-h-[36px] max-w-[145px] text-center text-xs font-extrabold leading-5 ${
        active ? "text-blue-700" : "text-[#102a4c]"
      }`}>
        {title}
      </p>
    </button>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
  isAr,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  isAr: boolean;
}) {
  return (
    <div className="relative min-w-[185px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
          isAr ? "pr-4 pl-9" : "pl-4 pr-9"
        }`}
      >
        {children}
      </select>

      <ChevronDown
        className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
          isAr ? "left-3" : "right-3"
        }`}
      />
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

function EmployeeCell({
  employee,
  lang,
}: {
  employee: Employee;
  lang: Lang;
}) {
  const hungerId =
    employee.hunger_id ||
    (employee.work_location === "HungerStation"
      ? employee.platform_id
      : null);

  const keetaId =
    employee.keeta_id ||
    (employee.work_location === "Keeta"
      ? employee.platform_id
      : null);

  return (
    <div className="flex min-w-[330px] items-center gap-3">
      {employee.photo_url ? (
        <img
          src={employee.photo_url}
          alt={employee.name}
          className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700 ring-1 ring-blue-100">
          {getInitials(employee.name)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Link
          href={`/employees/${employee.id}`}
          className="block w-full whitespace-normal break-words text-sm font-black leading-5 text-[#102a4c] transition hover:text-blue-600"
        >
          {employee.name || "-"}
        </Link>

        <div
          dir="ltr"
          className="mt-1.5 flex min-h-[20px] flex-wrap items-center gap-1.5"
        >
          {hungerId && (
            <PlatformIdBadge
              label="HS"
              value={hungerId}
              tone="green"
            />
          )}

          {keetaId && (
            <PlatformIdBadge
              label="KEETA"
              value={keetaId}
              tone="purple"
            />
          )}

          {!hungerId && !keetaId && (
            <span className="text-[10px] font-semibold text-slate-400">
              {lang === "ar"
                ? "بدون معرف منصة"
                : "No platform ID"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PlatformIdBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "purple";
}) {
  const styles =
    tone === "green"
      ? "border-green-100 bg-green-50 text-green-700"
      : "border-violet-100 bg-violet-50 text-violet-700";

  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-md border px-2 text-[9px] font-black leading-none ${styles}`}
    >
      <span className="opacity-70">{label}</span>
      <span className="font-black">{value}</span>
    </span>
  );
}

function WorkLocationBadge({
  value,
  lang,
}: {
  value: string | null;
  lang: Lang;
}) {
  if (!value) {
    return <span className="text-slate-400">-</span>;
  }

  if (value === "KeetaAndHungerStation") {
    return (
      <div className="flex flex-wrap gap-1">
        <span className="rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
          Keeta
        </span>

        <span className="rounded-lg border border-green-100 bg-green-50 px-2.5 py-1 text-[11px] font-black text-green-700">
          HungerStation
        </span>
      </div>
    );
  }

  const style =
    value === "Keeta"
      ? "border-violet-100 bg-violet-50 text-violet-700"
      : value === "HungerStation"
      ? "border-green-100 bg-green-50 text-green-700"
      : value === "maintenance" || value === "الصيانة"
      ? "border-cyan-100 bg-cyan-50 text-cyan-700"
      : "border-blue-100 bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-black ${style}`}
    >
      {workLocationText(value, lang)}
    </span>
  );
}

function StatusSelector({
  employee,
  lang,
  open,
  loading,
  onToggle,
  onSelect,
}: {
  employee: Employee;
  lang: Lang;
  open: boolean;
  loading: boolean;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSelect: (status: EmployeeStatus) => void;
}) {
  const current = normalizeStatus(employee.status);

  const options: {
    value: EmployeeStatus;
    ar: string;
    en: string;
    dot: string;
    hover: string;
  }[] = [
    {
      value: "active",
      ar: "نشط",
      en: "Active",
      dot: "bg-emerald-500",
      hover: "hover:bg-emerald-50",
    },
    {
      value: "stopped",
      ar: "غير نشط",
      en: "Inactive",
      dot: "bg-red-500",
      hover: "hover:bg-red-50",
    },
    {
      value: "vacation",
      ar: "إجازة",
      en: "Vacation",
      dot: "bg-amber-500",
      hover: "hover:bg-amber-50",
    },
    {
      value: "outOfService",
      ar: "خارج الخدمة",
      en: "Out Of Service",
      dot: "bg-slate-500",
      hover: "hover:bg-slate-50",
    },
  ];

  const styles: Record<string, string> = {
    active:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    stopped:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    vacation:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    outOfService:
      "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200",
  };

  const dots: Record<string, string> = {
    active: "bg-emerald-500",
    stopped: "bg-red-500",
    vacation: "bg-amber-500",
    outOfService: "bg-slate-500",
  };

  return (
    <div
      className="relative inline-block"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={loading}
        className={`inline-flex min-w-[112px] items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-black shadow-sm transition ${
          styles[current] ||
          "border-slate-200 bg-slate-50 text-slate-700"
        } ${loading ? "cursor-wait opacity-60" : ""}`}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <span
            className={`h-2 w-2 rounded-full ${
              dots[current] || "bg-slate-400"
            }`}
          />
        )}

        <span>{statusText(employee.status, lang)}</span>

        <ChevronDown
          className={`h-3.5 w-3.5 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-[46px] z-[70] w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.16)] ${
            lang === "ar" ? "right-0" : "left-0"
          }`}
        >
          {options.map((option) => {
            const selected = current === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start text-xs font-extrabold text-slate-700 transition ${option.hover}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${option.dot}`} />
                  {lang === "ar" ? option.ar : option.en}
                </span>

                {selected && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PerformanceBadge({
  performance,
  lang,
}: {
  performance: string | null;
  lang: Lang;
}) {
  const normalized = normalizePerformance(performance);

  const styles: Record<string, string> = {
    excellent: "bg-emerald-50 text-emerald-700",
    good: "bg-blue-50 text-blue-700",
    average: "bg-amber-50 text-amber-700",
    weak: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-lg px-3 py-1.5 text-[11px] font-black ${
        styles[normalized] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {performanceText(performance, lang)}
    </span>
  );
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${
    parts[1][0] || ""
  }`.toUpperCase();
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

function normalizePerformance(value: string | null) {
  if (!value) return "";

  const map: Record<string, string> = {
    excellent: "excellent",
    ممتاز: "excellent",

    good: "good",
    جيد: "good",

    average: "average",
    متوسط: "average",

    weak: "weak",
    ضعيف: "weak",
  };

  return map[value] || value;
}

function statusText(
  value: string | null,
  lang: Lang
) {
  if (!value) return "-";

  const normalized = normalizeStatus(value);

  const map: Record<
    string,
    { ar: string; en: string }
  > = {
    active: {
      ar: "نشط",
      en: "Active",
    },

    stopped: {
      ar: "غير نشط",
      en: "Inactive",
    },

    vacation: {
      ar: "إجازة",
      en: "Vacation",
    },

    outOfService: {
      ar: "خارج الخدمة",
      en: "Out Of Service",
    },
  };

  return map[normalized]?.[lang] || value;
}

function performanceText(
  value: string | null,
  lang: Lang
) {
  if (!value) return "-";

  const normalized = normalizePerformance(value);

  const map: Record<
    string,
    { ar: string; en: string }
  > = {
    excellent: {
      ar: "ممتاز",
      en: "Excellent",
    },

    good: {
      ar: "جيد",
      en: "Good",
    },

    average: {
      ar: "متوسط",
      en: "Average",
    },

    weak: {
      ar: "ضعيف",
      en: "Poor",
    },
  };

  return map[normalized]?.[lang] || value;
}

function jobTitleText(
  value: string | null,
  lang: Lang
) {
  if (!value) return "-";

  const map: Record<
    string,
    { ar: string; en: string }
  > = {
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

    supervisor: {
      ar: "مشرف",
      en: "Supervisor",
    },

    mechanic: {
      ar: "ميكانيكي",
      en: "Mechanic",
    },

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

    مشرف: {
      ar: "مشرف",
      en: "Supervisor",
    },

    ميكانيكي: {
      ar: "ميكانيكي",
      en: "Mechanic",
    },

    "مسؤول الصيانة": {
      ar: "مسؤول الصيانة",
      en: "Maintenance Officer",
    },
  };

  return map[value]?.[lang] || value;
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

    الإدارة: {
      ar: "الإدارة",
      en: "Management",
    },

    الصيانة: {
      ar: "الصيانة",
      en: "Maintenance",
    },
  };

  return map[value]?.[lang] || value;
}
