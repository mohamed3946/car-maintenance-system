"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx-js-style";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  iqama: string | null;
  phone: string | null;
  job_title: string | null;
  work_location: string | null;
  photo_url?: string | null;
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
  notes: string | null;
  created_by: string | null;
  created_at: string;
  closed_at: string | null;
  is_closed: boolean;
  closed_reason: string | null;
  deduction_amount: number | null;
};

type CaseRow = {
  employee: Employee | null;
  caseItem: EmployeeCase;
};

export default function NoticesPage() {
  return (
    <AppLayout system="employees">
      <NoticesContent />
    </AppLayout>
  );
}

function NoticesContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cases, setCases] = useState<EmployeeCase[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const text = {
    title: isAr ? "الإشعارات والإنذارات" : "Notifications & Warnings",
    breadcrumb: isAr
      ? "الرئيسية / الإشعارات والإنذارات"
      : "Home / Notifications & Warnings",
    createCase: isAr ? "إنشاء مخالفة جديدة" : "Create New Case",
    exportExcel: isAr ? "تصدير التقرير" : "Export Report",
    search: isAr
      ? "ابحث برقم المخالفة أو اسم الموظف..."
      : "Search by case number or employee name...",

    totalCases: isAr ? "إجمالي المخالفات" : "Total Cases",
    openCases: isAr ? "مخالفات مفتوحة" : "Open Cases",
    followUpCases: isAr ? "قيد المتابعة" : "Follow Up",
    closedCases: isAr ? "المخالفات المغلقة" : "Closed Cases",

    no: isAr ? "#" : "#",
    caseNumber: isAr ? "رقم المخالفة" : "Case Number",
    employee: isAr ? "الموظف" : "Employee",
    violation: isAr ? "المخالفة" : "Violation",
    severity: isAr ? "الخطورة" : "Severity",
    status: isAr ? "الحالة" : "Status",
    currentAction: isAr ? "الإجراء الحالي" : "Current Action",
    deduction: isAr ? "قيمة الخصم" : "Deduction",
    createdAt: isAr ? "تاريخ الإنشاء" : "Created At",
    actions: isAr ? "الإجراءات" : "Actions",

    allStatus: isAr ? "كل الحالات" : "All Status",
    allSeverity: isAr ? "كل درجات الخطورة" : "All Severity",

    open: isAr ? "مفتوحة" : "Open",
    followUp: isAr ? "قيد المتابعة" : "Follow Up",
    closed: isAr ? "مغلقة" : "Closed",

    low: isAr ? "منخفضة" : "Low",
    medium: isAr ? "متوسطة" : "Medium",
    high: isAr ? "عالية" : "High",
    critical: isAr ? "جسيمة" : "Critical",

    firstWarning: isAr ? "إنذار أول" : "First Warning",
    secondWarning: isAr ? "إنذار ثاني" : "Second Warning",
    deductionAction: isAr ? "خصم" : "Deduction",
    finalWarning: isAr ? "إنذار نهائي" : "Final Warning",
    investigation: isAr ? "تحقيق" : "Investigation",
    closedAction: isAr ? "إغلاق" : "Closed",

    sar: isAr ? "ر.س" : "SAR",
    noData: isAr ? "لا توجد بيانات" : "No data",
    loading: isAr ? "جاري التحميل..." : "Loading...",
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: employeesData, error: employeesError } = await supabase
      .from("employees")
      .select("id,name,iqama,phone,job_title,work_location,photo_url")
      .order("created_at", { ascending: false });

    const { data: casesData, error: casesError } = await supabase
      .from("employee_cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (employeesError) {
      console.error("EMPLOYEES ERROR:", employeesError);
      setEmployees([]);
    } else {
      setEmployees((employeesData || []) as Employee[]);
    }

    if (casesError) {
      console.error("CASES ERROR:", casesError);
      setCases([]);
    } else {
      setCases((casesData || []) as EmployeeCase[]);
    }

    setLoading(false);
  }

  const rows: CaseRow[] = useMemo(() => {
    return cases.map((caseItem) => {
      const employee =
        employees.find((item) => item.id === caseItem.employee_id) || null;

      return { employee, caseItem };
    });
  }, [cases, employees]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter(({ employee, caseItem }) => {
      const matchesSearch =
        !term ||
        caseItem.case_number?.toLowerCase().includes(term) ||
        caseItem.violation_type?.toLowerCase().includes(term) ||
        employee?.name?.toLowerCase().includes(term) ||
        employee?.iqama?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || caseItem.status === statusFilter;

      const matchesSeverity =
        severityFilter === "all" || caseItem.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [rows, search, statusFilter, severityFilter]);

  const stats = useMemo(() => {
    const total = cases.length;
    const open = cases.filter((item) => item.status === "open").length;
    const followUp = cases.filter((item) => item.status === "follow_up").length;
    const closed = cases.filter(
      (item) => item.status === "closed" || item.is_closed
    ).length;

    return { total, open, followUp, closed };
  }, [cases]);

  function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(isAr ? "ar-SA" : "en-US");
  }

  function formatMoney(value?: number | null) {
    const amount = Number(value || 0);
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${text.sar}`;
  }

  function severityLabel(value?: string | null) {
    const map: Record<string, string> = {
      low: text.low,
      medium: text.medium,
      high: text.high,
      critical: text.critical,
    };

    return map[value || ""] || value || "-";
  }

  function statusLabel(value?: string | null) {
    const map: Record<string, string> = {
      open: text.open,
      follow_up: text.followUp,
      closed: text.closed,
    };

    return map[value || ""] || value || "-";
  }

  function actionLabel(value?: string | null) {
    const map: Record<string, string> = {
      first_warning: text.firstWarning,
      second_warning: text.secondWarning,
      deduction: text.deductionAction,
      final_warning: text.finalWarning,
      investigation: text.investigation,
      closed: text.closedAction,
      close_case: text.closedAction,
    };

    return map[value || ""] || value || "-";
  }

  function caseUrl(caseId: string) {
    return `/employees/notices/${caseId}`;
  }

  function createCaseUrl() {
    return "/employees/notices/new";
  }

  async function deleteCase(caseItem: EmployeeCase) {
    const ok = window.confirm(
      isAr ? "هل تريد حذف هذه المخالفة؟" : "Delete this case?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("employee_cases")
      .delete()
      .eq("id", caseItem.id);

    if (error) {
      console.error(error);
      alert(isAr ? "فشل حذف المخالفة" : "Failed to delete case");
      return;
    }

    await loadData();
  }

  function exportCasesExcel() {
    const exportRows = filteredRows.map((row, index) => {
      const employee = row.employee;
      const item = row.caseItem;

      return {
        "#": index + 1,
        [text.caseNumber]: item.case_number,
        [text.employee]: employee?.name || "-",
        [text.violation]: item.violation_type,
        [text.severity]: severityLabel(item.severity),
        [text.status]: statusLabel(item.status),
        [text.currentAction]: actionLabel(item.current_action),
        [text.deduction]: item.deduction_amount || 0,
        [text.createdAt]: formatDate(item.created_at),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
      { wch: 15 },
      { wch: 18 },
    ];

    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cell]) continue;

      worksheet[cell].s = {
        fill: { fgColor: { rgb: "0F2544" } },
        font: { color: { rgb: "FFFFFF" }, bold: true },
        alignment: { horizontal: "center", vertical: "center" },
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
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cell]) continue;

        worksheet[cell].s = {
          alignment: { horizontal: C === 2 ? "left" : "center" },
          fill: { fgColor: { rgb: R % 2 === 0 ? "F8FBFF" : "FFFFFF" } },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
          },
        };
      }
    }

    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      isAr ? "المخالفات" : "Cases"
    );

    XLSX.writeFile(
      workbook,
      `${isAr ? "تقرير-المخالفات" : "Cases-Report"}.xlsx`
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f2544]">
            {text.title}
          </h1>
          <p className="mt-1 text-sm font-bold text-slate-500">
            {text.breadcrumb}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={createCaseUrl()}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            {text.createCase}
          </Link>

          <button
            onClick={exportCasesExcel}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#0f2544] shadow-sm hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            {text.exportExcel}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={text.totalCases}
          value={String(stats.total)}
          icon={<Users className="h-7 w-7" />}
          color="blue"
        />
        <StatCard
          title={text.openCases}
          value={String(stats.open)}
          icon={<AlertTriangle className="h-7 w-7" />}
          color="red"
        />
        <StatCard
          title={text.followUpCases}
          value={String(stats.followUp)}
          icon={<Clock className="h-7 w-7" />}
          color="orange"
        />
        <StatCard
          title={text.closedCases}
          value={String(stats.closed)}
          icon={<CheckCircle className="h-7 w-7" />}
          color="green"
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-96">
            <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={text.search}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pe-4 ps-12 text-sm font-bold outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-[#0f2544] shadow-sm outline-none"
            >
              <option value="all">{text.allStatus}</option>
              <option value="open">{text.open}</option>
              <option value="follow_up">{text.followUp}</option>
              <option value="closed">{text.closed}</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-[#0f2544] shadow-sm outline-none"
            >
              <option value="all">{text.allSeverity}</option>
              <option value="low">{text.low}</option>
              <option value="medium">{text.medium}</option>
              <option value="high">{text.high}</option>
              <option value="critical">{text.critical}</option>
            </select>
          </div>
        </div>

        <div className="overflow-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <Th>{text.no}</Th>
                <Th>{text.caseNumber}</Th>
                <Th>{text.employee}</Th>
                <Th>{text.violation}</Th>
                <Th>{text.severity}</Th>
                <Th>{text.status}</Th>
                <Th>{text.currentAction}</Th>
                <Th>{text.deduction}</Th>
                <Th>{text.createdAt}</Th>
                <Th>{text.actions}</Th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-10 text-center font-bold text-slate-400"
                  >
                    {text.loading}
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-10 text-center font-bold text-slate-400"
                  >
                    {text.noData}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const employee = row.employee;
                  const item = row.caseItem;

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 transition hover:bg-blue-50/30"
                    >
                      <Td>{index + 1}</Td>

                      <Td>
                        <div>
                          <p className="font-black text-[#0f2544]">
                            {item.case_number}
                          </p>
                          <p className="text-xs font-bold text-slate-400">
                            #{index + 1}
                          </p>
                        </div>
                      </Td>

                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700">
                            {employee?.photo_url ? (
                              <img
                                src={employee.photo_url}
                                alt={employee.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>

                          <div>
                            <p className="font-black text-[#0f2544]">
                              {employee?.name || "-"}
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                              {employee?.iqama || "-"}
                            </p>
                          </div>
                        </div>
                      </Td>

                      <Td>{item.violation_type}</Td>

                      <Td>
                        <SeverityBadge
                          label={severityLabel(item.severity)}
                          severity={item.severity}
                        />
                      </Td>

                      <Td>
                        <CaseStatusBadge
                          label={statusLabel(item.status)}
                          status={item.status}
                        />
                      </Td>

                      <Td>{actionLabel(item.current_action)}</Td>
                      <Td>{formatMoney(item.deduction_amount)}</Td>
                      <Td>{formatDate(item.created_at)}</Td>

                      <Td>
                        <div className="flex items-center gap-2">
                          <Link
                            href={caseUrl(item.id)}
                            className="rounded-xl border border-blue-200 bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                            title={isAr ? "عرض" : "View"}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => deleteCase(item)}
                            className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            title={isAr ? "حذف" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between text-sm font-bold text-slate-500">
          <span>
            {isAr
              ? `عرض ${filteredRows.length} من أصل ${cases.length} مخالفة`
              : `Showing ${filteredRows.length} of ${cases.length} cases`}
          </span>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap border-b border-slate-100 p-4 text-start text-xs font-black">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`whitespace-nowrap p-4 font-bold text-[#0f2544] ${className}`}>
      {children}
    </td>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "red";
}) {
  const styles = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    green: "border-green-100 bg-green-50 text-green-700",
    orange: "border-orange-100 bg-orange-50 text-orange-700",
    red: "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${styles[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-extrabold opacity-80">{title}</p>
          <h3 className="mt-2 text-3xl font-black">{value}</h3>
        </div>
        <div className="rounded-2xl bg-white/70 p-3">{icon}</div>
      </div>
    </div>
  );
}

function SeverityBadge({
  label,
  severity,
}: {
  label: string;
  severity: string;
}) {
  const styles: Record<string, string> = {
    low: "bg-blue-50 text-blue-700",
    medium: "bg-orange-50 text-orange-700",
    high: "bg-red-50 text-red-700",
    critical: "bg-black text-white",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[severity] || "bg-slate-50 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

function CaseStatusBadge({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const styles: Record<string, string> = {
    open: "bg-red-50 text-red-700",
    follow_up: "bg-orange-50 text-orange-700",
    closed: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[status] || "bg-slate-50 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}