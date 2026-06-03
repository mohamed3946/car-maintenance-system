"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
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
type EmployeeStatus = "نشط" | "متوقف" | "إجازة" | "خارج الخدمة";
type WorkLocation = "Keeta" | "HungerStation" | "الإدارة" | "الصيانة";
type Performance = "ممتاز" | "جيد" | "متوسط" | "ضعيف";

type Employee = {
  id: number;
  name: string;
  iqama: string;
  phone: string;
  nationality: string;
  jobTitle: string;
  workLocation: WorkLocation;
  status: EmployeeStatus;
  performance: Performance;
};

const initialEmployees: Employee[] = [
  { id: 1, name: "أحمد محمد", iqama: "251xxxxxxx", phone: "05xxxxxxxx", nationality: "مصري", jobTitle: "مندوب كيتا", workLocation: "Keeta", status: "نشط", performance: "جيد" },
  { id: 2, name: "سالم الدوسري", iqama: "253xxxxxxx", phone: "05xxxxxxxx", nationality: "سعودي", jobTitle: "مندوب هنقرستيشن", workLocation: "HungerStation", status: "نشط", performance: "متوسط" },
  { id: 3, name: "محمد علي", iqama: "256xxxxxxx", phone: "05xxxxxxxx", nationality: "بنجلاديشي", jobTitle: "مشرف", workLocation: "الإدارة", status: "إجازة", performance: "ممتاز" },
  { id: 4, name: "خالد علي", iqama: "259xxxxxxx", phone: "05xxxxxxxx", nationality: "هندي", jobTitle: "مندوب كيتا", workLocation: "Keeta", status: "متوقف", performance: "ضعيف" },
  { id: 5, name: "فهد الحربي", iqama: "260xxxxxxx", phone: "05xxxxxxxx", nationality: "سعودي", jobTitle: "ميكانيكي", workLocation: "الصيانة", status: "نشط", performance: "جيد" },
];

function statusClass(status: EmployeeStatus) {
  switch (status) {
    case "نشط": return "bg-green-50 text-green-700";
    case "متوقف": return "bg-red-50 text-red-700";
    case "إجازة": return "bg-orange-50 text-orange-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

function performanceClass(performance: Performance) {
  switch (performance) {
    case "ممتاز": return "bg-green-50 text-green-700";
    case "جيد": return "bg-blue-50 text-blue-700";
    case "متوسط": return "bg-orange-50 text-orange-700";
    default: return "bg-red-50 text-red-700";
  }
}

function statusText(status: EmployeeStatus, lang: Lang) {
  const map: Record<EmployeeStatus, string> = {
    "نشط": lang === "ar" ? "نشط" : "Active",
    "متوقف": lang === "ar" ? "متوقف" : "Stopped",
    "إجازة": lang === "ar" ? "إجازة" : "Vacation",
    "خارج الخدمة": lang === "ar" ? "خارج الخدمة" : "Out of Service",
  };
  return map[status];
}

function performanceText(performance: Performance, lang: Lang) {
  const map: Record<Performance, string> = {
    "ممتاز": lang === "ar" ? "ممتاز" : "Excellent",
    "جيد": lang === "ar" ? "جيد" : "Good",
    "متوسط": lang === "ar" ? "متوسط" : "Average",
    "ضعيف": lang === "ar" ? "ضعيف" : "Poor",
  };
  return map[performance];
}

function workLocationText(location: WorkLocation, lang: Lang) {
  if (location === "الإدارة") return lang === "ar" ? "الإدارة" : "Management";
  if (location === "الصيانة") return lang === "ar" ? "الصيانة" : "Maintenance";
  return location;
}

function jobTitleText(jobTitle: string, lang: Lang) {
  if (lang === "ar") return jobTitle;
  const map: Record<string, string> = {
    "مندوب كيتا": "Keeta Courier",
    "مندوب هنقرستيشن": "HungerStation Courier",
    "مشرف": "Supervisor",
    "ميكانيكي": "Mechanic",
    "مسؤول الصيانة": "Maintenance Officer",
  };
  return map[jobTitle] || jobTitle;
}

export default function EmployeesListPage() {
  return (
    <AppLayout system="employees" title="قائمة الموظفين" subtitle="إدارة وعرض جميع بيانات الموظفين والمناديب">
      <EmployeesListContent />
    </AppLayout>
  );
}

function EmployeesListContent() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [workLocation, setWorkLocation] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  function handleClickOutside(event: any) {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target)
    ) {
      setOpenMenuId(null);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const text = {
    title: t.employeesList,
    desc: isAr ? "ابحث، فلتر، راجع، وعدّل بيانات الموظفين من مكان واحد." : "Search, filter, review, and edit employees from one place.",
    add: t.addEmployee,
    export: isAr ? "تصدير" : "Export",
    search: t.searchEmployee,
    allStatuses: isAr ? "كل الحالات" : "All Statuses",
    allLocations: isAr ? "كل مواقع العمل" : "All Work Locations",
    total: isAr ? "إجمالي الموظفين" : "Total Employees",
    active: isAr ? "النشطين" : "Active",
    stopped: isAr ? "المتوقفين" : "Stopped",
    employee: t.employee,
    iqama: isAr ? "الإقامة" : "Iqama",
    phone: isAr ? "الجوال" : "Phone",
    nationality: isAr ? "الجنسية" : "Nationality",
    job: isAr ? "المسمى" : "Job Title",
    location: isAr ? "موقع العمل" : "Work Location",
    empStatus: isAr ? "الحالة" : "Status",
    performance: isAr ? "الأداء" : "Performance",
    actions: isAr ? "الإجراءات" : "Actions",
    viewDetails: t.viewDetails,
    edit: t.editEmployee,
    stop: t.stopEmployee,
    reactivate: t.reactivateEmployee,
    delete: t.deleteEmployee,
    save: isAr ? "حفظ التعديل" : "Save Changes",
    cancel: isAr ? "إلغاء" : "Cancel",
    confirmDelete: isAr ? "هل أنت متأكد من حذف" : "Are you sure you want to delete",
    confirmStop: isAr ? "هل تريد إيقاف" : "Stop",
    confirmReactivate: isAr ? "هل تريد إعادة" : "Reactivate",
    toWork: isAr ? "للعمل؟" : "?",
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
      ].join(" ").toLowerCase();

      const matchesQuery = searchText.includes(query.toLowerCase());
      const matchesStatus = status === "all" || employee.status === status;
      const matchesLocation = workLocation === "all" || employee.workLocation === workLocation;

      return matchesQuery && matchesStatus && matchesLocation;
    });
  }, [employees, query, status, workLocation, lang]);

  function goToAddEmployee() {
    window.location.href = "/employees/add";
  }

  function openEdit(employee: Employee) {
    setEditingEmployee(employee);
    setOpenMenuId(null);
  }

  function saveEdit() {
    if (!editingEmployee) return;
    if (!editingEmployee.name.trim()) {
      alert(isAr ? "اكتب اسم الموظف" : "Enter employee name");
      return;
    }

    setEmployees((prev) => prev.map((item) => item.id === editingEmployee.id ? editingEmployee : item));
    setEditingEmployee(null);
  }

  function toggleEmployeeStatus(employee: Employee) {
    const nextStatus = employee.status === "متوقف" ? "نشط" : "متوقف";
    const message = employee.status === "متوقف"
      ? `${text.confirmReactivate} ${employee.name} ${text.toWork}`
      : `${text.confirmStop} ${employee.name}؟`;

    if (!confirm(message)) return;

    setEmployees((prev) => prev.map((item) => item.id === employee.id ? { ...item, status: nextStatus } : item));
    setOpenMenuId(null);
  }

  function deleteEmployee(employee: Employee) {
    const message = isAr
      ? `${text.confirmDelete} ${employee.name}؟`
      : `${text.confirmDelete} ${employee.name}?`;

    if (!confirm(message)) return;

    setEmployees((prev) => prev.filter((item) => item.id !== employee.id));
    setOpenMenuId(null);
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
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
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
          <h1 className="text-3xl font-extrabold text-[#0f2544]">{text.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{text.desc}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={goToAddEmployee} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            {text.add}
          </button>

          <button onClick={exportEmployees} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50">
            <Download className="h-5 w-5" />
            {text.export}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title={text.total} value={employees.length} icon={<Users className="h-7 w-7" />} color="blue" />
        <StatCard title={text.active} value={employees.filter((e) => e.status === "نشط").length} icon={<Users className="h-7 w-7" />} color="green" />
        <StatCard title={text.stopped} value={employees.filter((e) => e.status === "متوقف").length} icon={<ShieldAlert className="h-7 w-7" />} color="red" />
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="relative">
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={text.search} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 text-sm font-bold outline-none focus:border-blue-500" />
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 text-sm font-bold outline-none focus:border-blue-500">
              <option value="all">{text.allStatuses}</option>
              <option value="نشط">{statusText("نشط", lang)}</option>
              <option value="متوقف">{statusText("متوقف", lang)}</option>
              <option value="إجازة">{statusText("إجازة", lang)}</option>
              <option value="خارج الخدمة">{statusText("خارج الخدمة", lang)}</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <select value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 text-sm font-bold outline-none focus:border-blue-500">
              <option value="all">{text.allLocations}</option>
              <option value="Keeta">Keeta</option>
              <option value="HungerStation">HungerStation</option>
              <option value="الإدارة">{workLocationText("الإدارة", lang)}</option>
              <option value="الصيانة">{workLocationText("الصيانة", lang)}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm">
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
                <td className="p-4 text-right font-extrabold text-[#0f2544]">
                  <Link href={`/employees/${employee.id}`} className="hover:text-blue-700 hover:underline">
                    {employee.name}
                  </Link>
                </td>
                <td className="p-4 font-bold text-slate-600">{employee.iqama}</td>
                <td className="p-4 font-bold text-slate-600">{employee.phone}</td>
                <td className="p-4 font-bold text-slate-600">{employee.nationality}</td>
                <td className="p-4 font-bold text-slate-600">{jobTitleText(employee.jobTitle, lang)}</td>
                <td className="p-4 font-bold text-slate-600">{workLocationText(employee.workLocation, lang)}</td>
                <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(employee.status)}`}>{statusText(employee.status, lang)}</span></td>
                <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${performanceClass(employee.performance)}`}>{performanceText(employee.performance, lang)}</span></td>
                <td className="relative p-4">
                  <button onClick={() => setOpenMenuId(openMenuId === employee.id ? null : employee.id)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50">
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {openMenuId === employee.id && (
                    <div 
                    ref={menuRef}
                    className="absolute left-4 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                      <Link href={`/employees/${employee.id}`} className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                        <Eye className="h-4 w-4" />
                        {text.viewDetails}
                      </Link>

                      <button onClick={() => openEdit(employee)} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-green-50 hover:text-green-700">
                        <Edit className="h-4 w-4" />
                        {text.edit}
                      </button>

                      <button onClick={() => toggleEmployeeStatus(employee)} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700">
                        {employee.status === "متوقف" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        {employee.status === "متوقف" ? text.reactivate : text.stop}
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
      </div>

      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#0f2544]">{text.edit}</h2>
              <button onClick={() => setEditingEmployee(null)} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label={text.employee} value={editingEmployee.name} onChange={(value) => setEditingEmployee({ ...editingEmployee, name: value })} />
              <Input label={text.iqama} value={editingEmployee.iqama} onChange={(value) => setEditingEmployee({ ...editingEmployee, iqama: value })} />
              <Input label={text.phone} value={editingEmployee.phone} onChange={(value) => setEditingEmployee({ ...editingEmployee, phone: value })} />
              <Input label={text.nationality} value={editingEmployee.nationality} onChange={(value) => setEditingEmployee({ ...editingEmployee, nationality: value })} />
              <Input label={text.job} value={jobTitleText(editingEmployee.jobTitle, lang)} onChange={(value) => setEditingEmployee({ ...editingEmployee, jobTitle: value })} />
              <Select label={text.location} value={editingEmployee.workLocation} onChange={(value) => setEditingEmployee({ ...editingEmployee, workLocation: value as WorkLocation })} options={["Keeta", "HungerStation", "الإدارة", "الصيانة"]} lang={lang} type="location" />
              <Select label={text.empStatus} value={editingEmployee.status} onChange={(value) => setEditingEmployee({ ...editingEmployee, status: value as EmployeeStatus })} options={["نشط", "متوقف", "إجازة", "خارج الخدمة"]} lang={lang} type="status" />
              <Select label={text.performance} value={editingEmployee.performance} onChange={(value) => setEditingEmployee({ ...editingEmployee, performance: value as Performance })} options={["ممتاز", "جيد", "متوسط", "ضعيف"]} lang={lang} type="performance" />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingEmployee(null)} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-extrabold hover:bg-slate-50">{text.cancel}</button>
              <button onClick={saveEdit} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700">
                <Save className="h-5 w-5" />
                {text.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" />
    </label>
  );
}

function Select({ label, value, onChange, options, lang, type }: { label: string; value: string; onChange: (value: string) => void; options: string[]; lang: Lang; type: "location" | "status" | "performance" }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500">
        {options.map((option) => {
          let labelText = option;
          if (type === "location") labelText = workLocationText(option as WorkLocation, lang);
          if (type === "status") labelText = statusText(option as EmployeeStatus, lang);
          if (type === "performance") labelText = performanceText(option as Performance, lang);
          return <option key={option} value={option}>{labelText}</option>;
        })}
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
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}>{icon}</div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-2 text-4xl font-extrabold text-[#0f2544]">{value}</h3>
        </div>
      </div>
    </div>
  );
}
