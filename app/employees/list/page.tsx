"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";
import {
  Download,
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  Save,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

type Lang = "ar" | "en";

type Employee = {
  id: string;
  name: string;
  iqama: string;
  phone: string;
  nationality: string;
  jobTitle: string;
  workLocation: string;
  status: string;
  performance: string;
};

export default function EmployeesListPage() {
  return (
    <AppLayout
      system="employees"
      title="قائمة الموظفين"
      subtitle="إدارة وعرض جميع بيانات الموظفين والمناديب"
    >
      <EmployeesListContent />
    </AppLayout>
  );
}

function EmployeesListContent() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [workLocation, setWorkLocation] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadEmployees() {
    setLoading(true);

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD EMPLOYEES ERROR:", error);
      alert(isAr ? "حدث خطأ أثناء تحميل الموظفين" : "Error loading employees");
      setLoading(false);
      return;
    }

    const employeesData: Employee[] =
      data?.map((item: any) => ({
        id: item.id,
        name: item.name || "",
        iqama: item.iqama || "",
        phone: item.phone || "",
        nationality: item.nationality || "",
        jobTitle: item.job_title || "",
        workLocation: item.work_location || "",
        status: item.status || "active",
        performance: item.performance || "good",
      })) || [];

    setEmployees(employeesData);
    setLoading(false);
  }

  const text = {
    title: isAr ? "قائمة الموظفين" : "Employees List",
    desc: isAr
      ? "ابحث، فلتر، راجع، وعدّل بيانات الموظفين من مكان واحد."
      : "Search, filter, review, and edit employees from one place.",
    add: isAr ? "إضافة موظف" : "Add Employee",
    export: isAr ? "تصدير" : "Export",
    search: isAr ? "ابحث عن موظف..." : "Search employee...",
    allStatuses: isAr ? "كل الحالات" : "All Statuses",
    allLocations: isAr ? "كل مواقع العمل" : "All Work Locations",
    total: isAr ? "إجمالي الموظفين" : "Total Employees",
    active: isAr ? "النشطين" : "Active",
    stopped: isAr ? "المتوقفين" : "Stopped",
    employee: isAr ? "الموظف" : "Employee",
    iqama: isAr ? "الإقامة" : "Iqama",
    phone: isAr ? "الجوال" : "Phone",
    nationality: isAr ? "الجنسية" : "Nationality",
    job: isAr ? "المسمى" : "Job Title",
    location: isAr ? "موقع العمل" : "Work Location",
    empStatus: isAr ? "الحالة" : "Status",
    performance: isAr ? "الأداء" : "Performance",
    actions: isAr ? "الإجراءات" : "Actions",
    viewDetails: isAr ? "عرض التفاصيل" : "View Details",
    edit: isAr ? "تعديل" : "Edit",
    stop: isAr ? "إيقاف" : "Stop",
    reactivate: isAr ? "إعادة تفعيل" : "Reactivate",
    delete: isAr ? "حذف" : "Delete",
    save: isAr ? "حفظ التعديل" : "Save Changes",
    cancel: isAr ? "إلغاء" : "Cancel",
    loading: isAr ? "جاري تحميل البيانات..." : "Loading data...",
    noData: isAr ? "لا توجد بيانات موظفين" : "No employees found",
  };

  const filtered = useMemo(() => {
    return employees.filter((employee) => {
      const searchText = [
        employee.name,
        employee.iqama,
        employee.phone,
        employee.nationality,
        jobTitleText(employee.jobTitle, lang),
        workLocationText(employee.workLocation, lang),
        statusText(employee.status, lang),
        performanceText(employee.performance, lang),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesStatus = status === "all" || employee.status === status;
      const matchesLocation =
        workLocation === "all" || employee.workLocation === workLocation;

      return matchesQuery && matchesStatus && matchesLocation;
    });
  }, [employees, query, status, workLocation, lang]);

  async function saveEdit() {
    if (!editingEmployee) return;

    if (!editingEmployee.name.trim()) {
      alert(isAr ? "اكتب اسم الموظف" : "Enter employee name");
      return;
    }

    const { error } = await supabase
      .from("employees")
      .update({
        name: editingEmployee.name,
        iqama: editingEmployee.iqama,
        phone: editingEmployee.phone,
        nationality: editingEmployee.nationality,
        job_title: editingEmployee.jobTitle,
        work_location: editingEmployee.workLocation,
        status: editingEmployee.status,
        performance: editingEmployee.performance,
      })
      .eq("id", editingEmployee.id);

    if (error) {
      console.error("UPDATE EMPLOYEE ERROR:", error);
      alert(isAr ? "فشل تعديل الموظف" : "Failed to update employee");
      return;
    }

    setEditingEmployee(null);
    await loadEmployees();
  }

  async function toggleEmployeeStatus(employee: Employee) {
    const nextStatus = employee.status === "stopped" ? "active" : "stopped";

    const message =
      employee.status === "stopped"
        ? isAr
          ? `هل تريد إعادة ${employee.name} للعمل؟`
          : `Reactivate ${employee.name}?`
        : isAr
          ? `هل تريد إيقاف ${employee.name}؟`
          : `Stop ${employee.name}?`;

    if (!confirm(message)) return;

    const { error } = await supabase
      .from("employees")
      .update({ status: nextStatus })
      .eq("id", employee.id);

    if (error) {
      console.error("TOGGLE EMPLOYEE STATUS ERROR:", error);
      alert(isAr ? "فشل تغيير حالة الموظف" : "Failed to change employee status");
      return;
    }

    setOpenMenuId(null);
    await loadEmployees();
  }

  async function deleteEmployee(employee: Employee) {
    const message = isAr
      ? `هل أنت متأكد من حذف ${employee.name}؟`
      : `Are you sure you want to delete ${employee.name}?`;

    if (!confirm(message)) return;

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employee.id);

    if (error) {
      console.error("DELETE EMPLOYEE ERROR:", error);
      alert(isAr ? "فشل حذف الموظف" : "Failed to delete employee");
      return;
    }

    setOpenMenuId(null);
    await loadEmployees();
  }

  function exportEmployees() {
    const headers = isAr
      ? ["الاسم", "الإقامة", "الجوال", "الجنسية", "المسمى الوظيفي", "موقع العمل", "الحالة", "الأداء"]
      : ["Name", "Iqama", "Phone", "Nationality", "Job Title", "Work Location", "Status", "Performance"];

    const rows = filtered.map((employee) => [
      employee.name,
      employee.iqama,
      employee.phone,
      employee.nationality,
      jobTitleText(employee.jobTitle, lang),
      workLocationText(employee.workLocation, lang),
      statusText(employee.status, lang),
      performanceText(employee.performance, lang),
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = isAr
      ? `سجل-الموظفين-${new Date().toISOString().slice(0, 10)}.csv`
      : `employees-list-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f2544]">
            {text.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{text.desc}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/employees/add"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            {text.add}
          </Link>

          <button
            onClick={exportEmployees}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-5 w-5" />
            {text.export}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title={text.total} value={employees.length} icon={<Users className="h-7 w-7" />} color="blue" />
        <StatCard title={text.active} value={employees.filter((e) => e.status === "active").length} icon={<Users className="h-7 w-7" />} color="green" />
        <StatCard title={text.stopped} value={employees.filter((e) => e.status === "stopped").length} icon={<ShieldAlert className="h-7 w-7" />} color="red" />
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="relative">
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={text.search}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 text-sm font-bold outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 text-sm font-bold outline-none focus:border-blue-500"
            >
              <option value="all">{text.allStatuses}</option>
              <option value="active">{statusText("active", lang)}</option>
              <option value="stopped">{statusText("stopped", lang)}</option>
              <option value="vacation">{statusText("vacation", lang)}</option>
              <option value="outOfService">{statusText("outOfService", lang)}</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <select
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 text-sm font-bold outline-none focus:border-blue-500"
            >
              <option value="all">{text.allLocations}</option>
              <option value="Keeta">Keeta</option>
              <option value="HungerStation">HungerStation</option>
              <option value="management">{workLocationText("management", lang)}</option>
              <option value="maintenance">{workLocationText("maintenance", lang)}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center font-bold text-slate-500">{text.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center font-bold text-slate-500">{text.noData}</div>
        ) : (
          <table dir={isAr ? "rtl" : "ltr"} className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 text-start">{text.employee}</th>
                <th className="p-4 text-start">{text.iqama}</th>
                <th className="p-4 text-start">{text.phone}</th>
                <th className="p-4 text-start">{text.nationality}</th>
                <th className="p-4 text-start">{text.job}</th>
                <th className="p-4 text-start">{text.location}</th>
                <th className="p-4 text-start">{text.empStatus}</th>
                <th className="p-4 text-start">{text.performance}</th>
                <th className="p-4 text-start">{text.actions}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((employee) => (
                <tr key={employee.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-extrabold text-[#0f2544]">
                    <Link href={`/employees/${employee.id}`} className="hover:text-blue-700 hover:underline">
                      {employee.name}
                    </Link>
                  </td>
                  <td className="p-4 font-bold text-slate-600">{employee.iqama}</td>
                  <td className="p-4 font-bold text-slate-600">{employee.phone}</td>
                  <td className="p-4 font-bold text-slate-600">{employee.nationality}</td>
                  <td className="p-4 font-bold text-slate-600">{jobTitleText(employee.jobTitle, lang)}</td>
                  <td className="p-4 font-bold text-slate-600">{workLocationText(employee.workLocation, lang)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(employee.status)}`}>
                      {statusText(employee.status, lang)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${performanceClass(employee.performance)}`}>
                      {performanceText(employee.performance, lang)}
                    </span>
                  </td>
                  <td className="relative p-4">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === employee.id ? null : employee.id)}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {openMenuId === employee.id && (
                      <div ref={menuRef} className="absolute left-4 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                        <Link href={`/employees/${employee.id}`} className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                          <Eye className="h-4 w-4" />
                          {text.viewDetails}
                        </Link>

                        <Link
  href={`/employees/${employee.id}/edit`}
  onClick={() => setOpenMenuId(null)}
  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
>
  <Edit className="h-4 w-4" />
  {text.edit}
</Link>

                        <button onClick={() => toggleEmployeeStatus(employee)} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700">
                          {employee.status === "stopped" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          {employee.status === "stopped" ? text.reactivate : text.stop}
                        </button>

                        <button onClick={() => deleteEmployee(employee)} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                          {text.delete}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>


    </>
  );
}

function statusText(status: string, lang: Lang) {
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
  return map[status]?.[lang] || status;
}

function performanceText(performance: string, lang: Lang) {
  const map: Record<string, { ar: string; en: string }> = {
    excellent: { ar: "ممتاز", en: "Excellent" },
    good: { ar: "جيد", en: "Good" },
    average: { ar: "متوسط", en: "Average" },
    weak: { ar: "ضعيف", en: "Poor" },
    "ممتاز": { ar: "ممتاز", en: "Excellent" },
    "جيد": { ar: "جيد", en: "Good" },
    "متوسط": { ar: "متوسط", en: "Average" },
    "ضعيف": { ar: "ضعيف", en: "Poor" },
  };
  return map[performance]?.[lang] || performance;
}

function workLocationText(location: string, lang: Lang) {
  const map: Record<string, { ar: string; en: string }> = {
    Keeta: { ar: "Keeta", en: "Keeta" },
    HungerStation: { ar: "HungerStation", en: "HungerStation" },
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
    "مندوب كيتا": { ar: "مندوب كيتا", en: "Keeta Courier" },
    "مندوب هنقرستيشن": { ar: "مندوب هنجرستيشن", en: "HungerStation Courier" },
    "مندوب هنجرستيشن": { ar: "مندوب هنجرستيشن", en: "HungerStation Courier" },
    "مشرف": { ar: "مشرف", en: "Supervisor" },
    "ميكانيكي": { ar: "ميكانيكي", en: "Mechanic" },
    "مسؤول الصيانة": { ar: "مسؤول الصيانة", en: "Maintenance Officer" },
  };
  return map[jobTitle]?.[lang] || jobTitle;
}

function statusClass(status: string) {
  if (status === "active" || status === "نشط") return "bg-green-50 text-green-700";
  if (status === "stopped" || status === "متوقف") return "bg-red-50 text-red-700";
  if (status === "vacation" || status === "إجازة") return "bg-orange-50 text-orange-700";
  return "bg-slate-100 text-slate-700";
}

function performanceClass(performance: string) {
  if (performance === "excellent" || performance === "ممتاز") return "bg-green-50 text-green-700";
  if (performance === "good" || performance === "جيد") return "bg-blue-50 text-blue-700";
  if (performance === "average" || performance === "متوسط") return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

function jobOptions(lang: Lang) {
  return [
    { value: "keetaCourier", label: jobTitleText("keetaCourier", lang) },
    { value: "hungerCourier", label: jobTitleText("hungerCourier", lang) },
    { value: "supervisor", label: jobTitleText("supervisor", lang) },
    { value: "mechanic", label: jobTitleText("mechanic", lang) },
    { value: "maintenanceOfficer", label: jobTitleText("maintenanceOfficer", lang) },
  ];
}

function locationOptions(lang: Lang) {
  return [
    { value: "Keeta", label: "Keeta" },
    { value: "HungerStation", label: "HungerStation" },
    { value: "management", label: workLocationText("management", lang) },
    { value: "maintenance", label: workLocationText("maintenance", lang) },
  ];
}

function statusOptions(lang: Lang) {
  return [
    { value: "active", label: statusText("active", lang) },
    { value: "stopped", label: statusText("stopped", lang) },
    { value: "vacation", label: statusText("vacation", lang) },
    { value: "outOfService", label: statusText("outOfService", lang) },
  ];
}

function performanceOptions(lang: Lang) {
  return [
    { value: "excellent", label: performanceText("excellent", lang) },
    { value: "good", label: performanceText("good", lang) },
    { value: "average", label: performanceText("average", lang) },
    { value: "weak", label: performanceText("weak", lang) },
  ];
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-2 text-4xl font-extrabold text-[#0f2544]">{value}</h3>
        </div>
      </div>
    </div>
  );
}