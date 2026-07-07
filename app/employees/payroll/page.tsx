"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx-js-style";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  MessageCircle,
  Pencil,
  Printer,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
  WalletCards,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  iqama: string | null;
  phone: string | null;
  job_title: string | null;
  base_salary: number | null;
  photo_url?: string | null;
  keeta_id?: string | null;
  hunger_id?: string | null;
};

type Penalty = {
  reason: string;
  amount: number;
};

type Payroll = {
  id: string;
  employee_id: string;
  month: string;
  job_title: string | null;
  base_salary: number;
  orders_count: number;
  target_orders: number;
  order_bonus: number;
  target_deduction: number;
  extra_bonus: number;
  penalties_total: number;
  penalties: Penalty[] | null;
  delivery_company_deductions: number;
  advances: number;
  payment_method: string;
  salary_status: string;
  received_date: string | null;
  net_salary: number;
  notes: string | null;
};

type PayrollRow = {
  employee: Employee;
  payroll: Payroll | null;
};

export default function PayrollPage() {
    
  return (
    <AppLayout system="employees">
      <PayrollContent />
    </AppLayout>
  );
}

function PayrollContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [month, setMonth] = useState("2026-06");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const text = {
    title: isAr ? "سجل الرواتب" : "Payroll Register",
    breadcrumb: isAr ? "الرئيسية / الرواتب" : "Home / Payroll",
    addPayroll: isAr ? "إضافة راتب" : "Add Payroll",
    exportExcel: isAr ? "تصدير Excel" : "Export Excel",
    search: isAr ? "ابحث عن موظف..." : "Search employee...",
    month: isAr ? "الشهر" : "Month",

    totalEmployees: isAr ? "إجمالي الموظفين" : "Total Employees",
    calculated: isAr ? "تم احتساب الرواتب" : "Calculated",
    remaining: isAr ? "عدد المتبقية" : "Remaining",
    totalNet: isAr ? "إجمالي الرواتب المستحقة" : "Total Net Salaries",

    no: isAr ? "#" : "#",
    employee: isAr ? "الموظف" : "Employee",
    job: isAr ? "المهنة" : "Job Title",
    baseSalary: isAr ? "الراتب الأساسي" : "Base Salary",
    orders: isAr ? "الطلبات" : "Orders",
    target: isAr ? "التارجت" : "Target",
    orderBonus: isAr ? "بونص الطلبات" : "Order Bonus",
    targetDeduction: isAr ? "خصم نقص التارجت" : "Target Deduction",
    extraBonus: isAr ? "حوافز" : "Bonus",
    penalties: isAr ? "العقوبات" : "Penalties",
    deliveryDeductions: isAr ? "خصومات شركة التوصيل" : "Delivery Deductions",
    advances: isAr ? "سلف" : "Advances",
    netSalary: isAr ? "صافي الراتب" : "Net Salary",
    paymentMethod: isAr ? "طريقة الدفع" : "Payment Method",
    salaryStatus: isAr ? "حالة الراتب" : "Salary Status",
    receivedDate: isAr ? "تاريخ الاستلام" : "Received Date",
    actions: isAr ? "الإجراءات" : "Actions",

    bank: isAr ? "تحويل بنكي" : "Bank Transfer",
    cash: isAr ? "كاش" : "Cash",
    calculatedStatus: isAr ? "تم الاحتساب" : "Calculated",
    notCalculated: isAr ? "لم يتم الحساب" : "Not Calculated",
    paid: isAr ? "تم الصرف" : "Paid",
    notPaid: isAr ? "لم يتم الصرف" : "Not Paid",

    sar: isAr ? "ر.س" : "SAR",
    noData: isAr ? "لا توجد بيانات" : "No data",
  };

  useEffect(() => {
    loadData();
  }, [month]);

  async function loadData() {
    setLoading(true);

    const { data: employeesData, error: employeesError } = await supabase
      .from("employees")
      .select(
        "id,name,iqama,phone,job_title,base_salary,photo_url,keeta_id,hunger_id"
      )
      .order("created_at", { ascending: false });

    const { data: payrollsData, error: payrollsError } = await supabase
      .from("employee_payrolls")
.select("*")
.eq("month", month)
.order("updated_at", { ascending: false });
    if (employeesError) {
      console.error("EMPLOYEES ERROR:", employeesError);
      setEmployees([]);
    } else {
      setEmployees((employeesData || []) as Employee[]);
    }

    if (payrollsError) {
      console.error("PAYROLLS ERROR:", payrollsError);
      setPayrolls([]);
    } else {
      setPayrolls((payrollsData || []) as Payroll[]);
    }

    setLoading(false);
  }

  const rows: PayrollRow[] = useMemo(() => {
    return employees.map((employee) => {
      const payroll =
        payrolls.find((item) => item.employee_id === employee.id) || null;

      return { employee, payroll };
    });
  }, [employees, payrolls]);

 const filteredRows = useMemo(() => {
  const term = search.trim().toLowerCase();

  return rows.filter(({ employee, payroll }) => {
    const matchesSearch =
      !term ||
      employee.name?.toLowerCase().includes(term) ||
      employee.iqama?.toLowerCase().includes(term) ||
      employee.phone?.toLowerCase().includes(term);

    const matchesJob =
      jobFilter === "all" || employee.job_title === jobFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "calculated" && payroll) ||
      (statusFilter === "notCalculated" && !payroll);

    const matchesPayment =
      paymentFilter === "all" || payroll?.payment_method === paymentFilter;

    return matchesSearch && matchesJob && matchesStatus && matchesPayment;
  });
}, [rows, search, jobFilter, statusFilter, paymentFilter]);

  function exportPayrollExcel() {
    function sendWhatsApp(employee: Employee, payroll: Payroll | null) {
  if (!employee.phone) {
    alert("رقم الجوال غير موجود");
    return;
  }

  const message = `
نمو التوصيل للخدمات اللوجستية

تفاصيل الراتب

الموظف: ${employee.name}

الراتب الأساسي: ${payroll?.base_salary || 0} ريال
بونص الطلبات: ${payroll?.order_bonus || 0} ريال
الحوافز: ${payroll?.extra_bonus || 0} ريال
الاستقطاعات: ${payroll?.penalties_total || 0} ريال
السلف: ${payroll?.advances || 0} ريال

صافي الراتب: ${payroll?.net_salary || 0} ريال
`;

  let phone = employee.phone.replace(/\D/g, "");

  if (phone.startsWith("05")) {
    phone = "966" + phone.substring(1);
  }

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}
  const exportRows = filteredRows.map((row, index) => {
    const employee = row.employee;
    const payroll = row.payroll;

    return {
      "#": index + 1,
      Employee: employee.name,
      Job: employee.job_title,
      BaseSalary: payroll?.base_salary || employee.base_salary || 0,
      Orders: payroll?.orders_count || 0,
      Target: payroll?.target_orders || 0,
      OrderBonus: payroll?.order_bonus || 0,
      TargetDeduction: payroll?.target_deduction || 0,
      ExtraBonus: payroll?.extra_bonus || 0,
      Deductions: payroll?.penalties_total || 0,
      Advances: payroll?.advances || 0,
      NetSalary: payroll?.net_salary || 0,
      PaymentMethod: payroll?.payment_method || "-",
      ReceivedDate: payroll?.received_date || "-"
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");

// عرض الأعمدة
worksheet["!cols"] = [
  { wch: 5 },
  { wch: 35 },
  { wch: 22 },
  { wch: 15 },
  { wch: 12 },
  { wch: 12 },
  { wch: 16 },
  { wch: 18 },
  { wch: 16 },
  { wch: 16 },
  { wch: 14 },
  { wch: 16 },
  { wch: 18 },
  { wch: 18 },
];

// تنسيق الهيدر
for (let C = range.s.c; C <= range.e.c; C++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
  if (!worksheet[cellAddress]) continue;

  worksheet[cellAddress].s = {
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

// تنسيق باقي الجدول
for (let R = 1; R <= range.e.r; R++) {
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: C === 1 || C === 11 },
      alignment: { horizontal: C === 1 ? "left" : "center", vertical: "center" },
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

// تلوين صافي الراتب
for (let R = 1; R <= range.e.r; R++) {
  const netSalaryCell = XLSX.utils.encode_cell({ r: R, c: 11 });
  if (worksheet[netSalaryCell]) {
    worksheet[netSalaryCell].s = {
      ...worksheet[netSalaryCell].s,
      font: { bold: true, color: { rgb: "008A3D" } },
      fill: { fgColor: { rgb: "EAFBF0" } },
    };
  }
}

// تجميد أول صف
worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  worksheet["!cols"] = [
  { wch: 5 },   // #
  { wch: 35 },  // Employee
  { wch: 20 },  // Job
  { wch: 15 },  // BaseSalary
  { wch: 12 },  // Orders
  { wch: 12 },  // Target
  { wch: 15 },  // OrderBonus
  { wch: 18 },  // TargetDeduction
  { wch: 15 },  // ExtraBonus
  { wch: 15 },  // Deductions
  { wch: 12 },  // Advances
  { wch: 15 },  // NetSalary
  { wch: 18 },  // PaymentMethod
  { wch: 18 },  // ReceivedDate
];
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Payroll"
  );

  XLSX.writeFile(
    workbook,
    `Payroll-${month}.xlsx`
  );
}

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const calculated = rows.filter((row) => row.payroll).length;
    const remaining = Math.max(totalEmployees - calculated, 0);
    const totalNet = rows.reduce(
      (sum, row) => sum + Number(row.payroll?.net_salary || 0),
      0
    );

    return { totalEmployees, calculated, remaining, totalNet };
  }, [employees, rows]);

  function changeMonth(direction: "prev" | "next") {
    const [year, m] = month.split("-").map(Number);
    const date = new Date(year, m - 1, 1);

    if (direction === "prev") {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }

    const newMonth = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    setMonth(newMonth);
  }

  function formatMonth(value: string) {
    const [year, m] = value.split("-");
    const monthNamesAr = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    const monthNamesEn = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const index = Number(m) - 1;
    return isAr
      ? `${monthNamesAr[index]} ${year}`
      : `${monthNamesEn[index]} ${year}`;
  }

  function formatMoney(value: number | null | undefined) {
    const amount = Number(value || 0);
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${text.sar}`;
  }

  function jobLabel(jobTitle?: string | null) {
    const map: Record<string, string> = {
      keetaCourier: isAr ? "مندوب كيتا" : "Keeta Courier",
      hungerCourier: isAr ? "مندوب هنجرستيشن" : "HungerStation Courier",
      supervisor: isAr ? "مشرف" : "Supervisor",
      mechanic: isAr ? "ميكانيكي" : "Mechanic",
      maintenanceOfficer: isAr ? "مسؤول صيانة" : "Maintenance Officer",
    };

    return map[jobTitle || ""] || jobTitle || "-";
  }

  function paymentLabel(method?: string | null) {
    if (method === "cash") return text.cash;
    if (method === "bank") return text.bank;
    return "-";
  }

  function salaryStatusLabel(payroll: Payroll | null) {
    if (!payroll) return text.notCalculated;
    if (payroll.salary_status === "paid") return text.paid;
    return text.calculatedStatus;
  }

  function employeePayrollUrl(employeeId: string) {
    return `/employees/payroll/${employeeId}?month=${month}`;
  }

  function receiptUrl(employeeId: string) {
    return `/employees/payroll/${employeeId}/receipt?month=${month}`;
  }

  function normalizeSaudiPhone(phone?: string | null) {
    if (!phone) return "";

    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("966")) return cleaned;
    if (cleaned.startsWith("0")) return `966${cleaned.slice(1)}`;
    if (cleaned.startsWith("5")) return `966${cleaned}`;

    return cleaned;
  }

  function buildWhatsappMessage(row: PayrollRow) {
    const { employee, payroll } = row;
console.log("PAYROLL NOTES:", payroll?.notes);
    if (!payroll) return "";

    const penaltiesList =
      payroll.penalties && payroll.penalties.length > 0
        ? payroll.penalties
            .map((p) => `• ${p.reason}: ${p.amount} ${text.sar}`)
            .join("\n")
        : isAr
          ? "لا يوجد"
          : "None";

    if (isAr) {
      return `السلام عليكم

تفاصيل راتب ${formatMonth(month)}

الاسم: ${employee.name}
رقم الإقامة: ${employee.iqama || "-"}

الراتب الأساسي: ${formatMoney(payroll.base_salary)}

عدد الطلبات: ${payroll.orders_count || 0}
التارجت: ${payroll.target_orders || 0}

بونص الطلبات: +${formatMoney(payroll.order_bonus)}
خصم نقص التارجت: -${formatMoney(payroll.target_deduction)}
الحوافز الإضافية: +${formatMoney(payroll.extra_bonus)}

تفاصيل الاستقطاعات:
${penaltiesList}

إجمالي الاستقطاعات: -${formatMoney(payroll.penalties_total)}
إجمالي العقوبات: -${formatMoney(payroll.penalties_total)}
خصومات شركة التوصيل: -${formatMoney(payroll.delivery_company_deductions)}
السلف: -${formatMoney(payroll.advances)}

ملاحظات:
${row.payroll?.notes && row.payroll.notes.trim() ? row.payroll.notes : "لا توجد ملاحظات"}

صافي الراتب المستحق:
${formatMoney(payroll.net_salary)}

طريقة الدفع:
${paymentLabel(payroll.payment_method)}

نمو التوصيل للخدمات اللوجستية`;
    }

    return `Hello,

Salary Details for ${formatMonth(month)}

Employee Name: ${employee.name}
Iqama Number: ${employee.iqama || "-"}

Base Salary: ${formatMoney(payroll.base_salary)}

Total Orders: ${payroll.orders_count || 0}
Target: ${payroll.target_orders || 0}

Order Bonus: +${formatMoney(payroll.order_bonus)}
Target Deduction: -${formatMoney(payroll.target_deduction)}
Additional Incentives: +${formatMoney(payroll.extra_bonus)}

Penalties:
${penaltiesList}

Total Penalties: -${formatMoney(payroll.penalties_total)}
Delivery Company Deductions: -${formatMoney(payroll.delivery_company_deductions)}
Advances: -${formatMoney(payroll.advances)}

Net Salary:
${formatMoney(payroll.net_salary)}

Payment Method:
${paymentLabel(payroll.payment_method)}

Nmo Delivery Logistics Services`;
  }

  function openWhatsapp(row: PayrollRow) {
    if (!row.payroll) {
      alert(isAr ? "لم يتم احتساب راتب الموظف" : "Salary not calculated");
      return;
    }

    const phone = normalizeSaudiPhone(row.employee.phone);

    if (!phone) {
      alert(isAr ? "رقم جوال الموظف غير موجود" : "Employee phone is missing");
      return;
    }

    const message = buildWhatsappMessage(row);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

  async function deletePayroll(row: PayrollRow) {
    if (!row.payroll) return;

    const confirmDelete = window.confirm(
      isAr ? "هل تريد حذف راتب هذا الموظف؟" : "Delete this payroll?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("employee_payrolls")
      .delete()
      .eq("id", row.payroll.id);

    if (error) {
      console.error(error);
      alert(isAr ? "فشل حذف الراتب" : "Failed to delete payroll");
      return;
    }

    await loadData();
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

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <button
            onClick={() => changeMonth("prev")}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="flex min-w-40 items-center justify-center gap-2 text-sm font-black text-[#0f2544]">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            {formatMonth(month)}
          </div>

          <button
            onClick={() => changeMonth("next")}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={text.totalEmployees}
          value={String(stats.totalEmployees)}
          icon={<Users className="h-7 w-7" />}
          color="blue"
        />
        <StatCard
          title={text.calculated}
          value={String(stats.calculated)}
          icon={<UserCheck className="h-7 w-7" />}
          color="green"
        />
        <StatCard
          title={text.remaining}
          value={String(stats.remaining)}
          icon={<UserX className="h-7 w-7" />}
          color="orange"
        />
        <StatCard
          title={text.totalNet}
          value={formatMoney(stats.totalNet)}
          icon={<WalletCards className="h-7 w-7" />}
          color="green"
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/employees/payroll/new?month=${month}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700"
            >
              + {text.addPayroll}
            </Link>

            <button
            onClick={exportPayrollExcel}
             className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#0f2544] shadow-sm hover:bg-slate-50">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              {text.exportExcel}
            </button>
          </div>

          <div className="relative w-full xl:w-80">
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
    value={jobFilter}
    onChange={(e) => setJobFilter(e.target.value)}
    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-[#0f2544] shadow-sm outline-none"
  >
    <option value="all">{isAr ? "كل المهن" : "All Jobs"}</option>
    <option value="keetaCourier">{isAr ? "مندوب كيتا" : "Keeta Courier"}</option>
    <option value="hungerCourier">{isAr ? "مندوب هنجرستيشن" : "HungerStation Courier"}</option>
    <option value="supervisor">{isAr ? "مشرف" : "Supervisor"}</option>
    <option value="mechanic">{isAr ? "ميكانيكي" : "Mechanic"}</option>
    <option value="maintenanceOfficer">{isAr ? "مسؤول صيانة" : "Maintenance Officer"}</option>
  </select>

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-[#0f2544] shadow-sm outline-none"
  >
    <option value="all">{isAr ? "كل الحالات" : "All Status"}</option>
    <option value="calculated">{isAr ? "تم الاحتساب" : "Calculated"}</option>
    <option value="notCalculated">{isAr ? "لم يتم الاحتساب" : "Not Calculated"}</option>
  </select>

  <select
    value={paymentFilter}
    onChange={(e) => setPaymentFilter(e.target.value)}
    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-[#0f2544] shadow-sm outline-none"
  >
    <option value="all">{isAr ? "كل طرق الدفع" : "All Payment Methods"}</option>
    <option value="bank">{isAr ? "تحويل بنكي" : "Bank Transfer"}</option>
    <option value="cash">{isAr ? "كاش" : "Cash"}</option>
  </select>
</div>
        </div>

        <div className="overflow-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[1500px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <Th>{text.no}</Th>
                <Th>{text.employee}</Th>
                <Th>{text.job}</Th>
                <Th>{text.baseSalary}</Th>
                <Th>{text.orders}</Th>
                <Th>{text.target}</Th>
                <Th>{text.orderBonus}</Th>
                <Th>{text.targetDeduction}</Th>
                <Th>{text.extraBonus}</Th>
                <Th>{text.penalties}</Th>
                <Th>{text.deliveryDeductions}</Th>
                <Th>{text.advances}</Th>
                <Th>{text.netSalary}</Th>
                <Th>{text.paymentMethod}</Th>
                <Th>{text.salaryStatus}</Th>
                <Th>{text.receivedDate}</Th>
                <Th>{text.actions}</Th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={17}
                    className="p-10 text-center font-bold text-slate-400"
                  >
                    {isAr ? "جاري التحميل..." : "Loading..."}
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={17}
                    className="p-10 text-center font-bold text-slate-400"
                  >
                    {text.noData}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const employee = row.employee;
                  const payroll = row.payroll;

                  return (
                    <tr
                      key={employee.id}
                      onDoubleClick={() => {
                        window.location.href = employeePayrollUrl(employee.id);
                      }}
                      className="border-t border-slate-100 transition hover:bg-blue-50/30"
                    >
                      <Td>{index + 1}</Td>

                      <Td>
                        <button
                          onClick={() => {
                            window.location.href = employeePayrollUrl(
                              employee.id
                            );
                          }}
                          className="flex items-center gap-3 text-start"
                        >
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700">
                            {employee.photo_url ? (
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
                              {employee.name}
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                              {employee.keeta_id ||
                                employee.hunger_id ||
                                employee.iqama ||
                                "-"}
                            </p>
                          </div>
                        </button>
                      </Td>

                      <Td>{jobLabel(employee.job_title)}</Td>
                      <Td>{formatMoney(payroll?.base_salary ?? employee.base_salary ?? 0)}</Td>
                      <Td>{payroll?.orders_count || "-"}</Td>
                      <Td>{payroll?.target_orders || "-"}</Td>
                      <Td className="font-black text-green-600">
                        {payroll ? formatMoney(payroll.order_bonus) : "-"}
                      </Td>
                      <Td className="font-black text-red-600">
                        {payroll ? formatMoney(payroll.target_deduction) : "-"}
                      </Td>
                      <Td>{payroll ? formatMoney(payroll.extra_bonus) : "-"}</Td>
                      <Td className="font-black text-red-600">
                        {payroll ? formatMoney(payroll.penalties_total) : "-"}
                      </Td>
                      <Td>
                        {payroll
                          ? formatMoney(payroll.delivery_company_deductions)
                          : "-"}
                      </Td>
                      <Td className="font-black text-red-600">
                        {payroll ? formatMoney(payroll.advances) : "-"}
                      </Td>
                      <Td className="font-black text-green-700">
                        {payroll ? formatMoney(payroll.net_salary) : "-"}
                      </Td>
                      <Td>{payroll ? paymentLabel(payroll.payment_method) : "-"}</Td>
                      <Td>
                        <StatusBadge
                          label={salaryStatusLabel(payroll)}
                          type={
                            !payroll
                              ? "danger"
                              : payroll.salary_status === "paid"
                                ? "blue"
                                : "success"
                          }
                        />
                      </Td>
                      <Td>{payroll?.received_date || "-"}</Td>

                      <Td>
                        <div className="flex items-center gap-2">
                          <Link
                            href={employeePayrollUrl(employee.id)}
                            className="rounded-xl border border-blue-200 bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                            title={isAr ? "تسجيل / تعديل" : "Edit"}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          <Link
                            href={receiptUrl(employee.id)}
                            className={`rounded-xl border p-2 ${
                              payroll
                                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "pointer-events-none border-slate-100 bg-slate-50 text-slate-300"
                            }`}
                            title={isAr ? "طباعة السند" : "Print Receipt"}
                          >
                            <Printer className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => openWhatsapp(row)}
                            className={`rounded-xl border p-2 ${
                              payroll
                                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                : "border-slate-100 bg-slate-50 text-slate-300"
                            }`}
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>

                          <Link
                            href={employeePayrollUrl(employee.id)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                            title={isAr ? "عرض" : "View"}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {payroll && (
                            <button
                              onClick={() => deletePayroll(row)}
                              className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                              title={isAr ? "حذف" : "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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
              ? `عرض ${filteredRows.length} من أصل ${employees.length} موظف`
              : `Showing ${filteredRows.length} of ${employees.length} employees`}
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
  color: "blue" | "green" | "orange";
}) {
  const styles = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    green: "border-green-100 bg-green-50 text-green-700",
    orange: "border-orange-100 bg-orange-50 text-orange-700",
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

function StatusBadge({
  label,
  type,
}: {
  label: string;
  type: "success" | "danger" | "blue";
}) {
  const styles = {
    success: "bg-green-50 text-green-700",
    danger: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[type]}`}>
      {label}
    </span>
  );
}