"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AppLayout, { useLanguage } from "../../../../components/AppLayout";
import { supabase } from "../../../lib/supabase";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  MessageCircle,
  Plus,
  Printer,
  Save,
  Trash2,
  User,
  Wallet,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  iqama: string | null;
  phone: string | null;
  job_title: string | null;
  base_salary: number | null;
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
  penalties: Penalty[];
  penalties_total: number;
  delivery_company_deductions: number;
  advances: number;
  payment_method: string;
  salary_status: string;
  received_date: string | null;
  net_salary: number;
  notes: string | null;
};

export default function EmployeePayrollPage() {
  return (
    <AppLayout system="employees">
      <EmployeePayrollContent />
    </AppLayout>
  );
}

function EmployeePayrollContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const employeeId = String(params.employeeId);
  const selectedMonth = searchParams.get("month") || "2026-06";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payrollId, setPayrollId] = useState<string | null>(null);

  const [baseSalary, setBaseSalary] = useState("0");
  const [ordersCount, setOrdersCount] = useState("0");
  const [targetOrders, setTargetOrders] = useState("450");
  const [extraBonus, setExtraBonus] = useState("0");
  const [deliveryDeductions, setDeliveryDeductions] = useState("0");
  const [advances, setAdvances] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cash">("bank");
  const [salaryStatus, setSalaryStatus] = useState<"calculated" | "paid">(
    "calculated"
  );
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");

  const [penalties, setPenalties] = useState<Penalty[]>([
    { reason: "", amount: 0 },
  ]);

  const text = {
    title: isAr ? "تسجيل راتب الموظف" : "Employee Payroll",
    breadcrumb: isAr ? "الرئيسية / الرواتب / تسجيل راتب" : "Home / Payroll / Register",
    back: isAr ? "العودة إلى سجل الرواتب" : "Back To Payroll Register",
    employeeData: isAr ? "بيانات الموظف" : "Employee Details",
    basicData: isAr ? "البيانات الأساسية" : "Basic Details",
    performance: isAr ? "أداء الطلبات" : "Orders Performance",
    additions: isAr ? "الحوافز والعقوبات" : "Bonuses & Penalties",
    deductions: isAr ? "الخصومات والسلف" : "Deductions & Advances",
    summary: isAr ? "ملخص الراتب" : "Salary Summary",

    employeeName: isAr ? "اسم الموظف" : "Employee Name",
    iqama: isAr ? "رقم الإقامة" : "Iqama Number",
    phone: isAr ? "رقم الجوال" : "Phone",
    job: isAr ? "المهنة" : "Job Title",
    month: isAr ? "الشهر" : "Month",

    baseSalary: isAr ? "الراتب الأساسي" : "Base Salary",
    ordersCount: isAr ? "عدد الطلبات" : "Orders Count",
    target: isAr ? "التارجت الشهري" : "Monthly Target",
    orderBonus: isAr ? "بونص الطلبات" : "Order Bonus",
    targetDeduction: isAr ? "خصم نقص التارجت" : "Target Deduction",
    extraBonus: isAr ? "حوافز إضافية" : "Extra Bonus",

    penalties: isAr ? "الاستقطاعات" : "Deductions",
    penaltyReason: isAr ? "سبب الاستقطاع" : "Deduction Reason",
    penaltyAmount: isAr ? "المبلغ" : "Amount",
    addPenalty: isAr ? "إضافة استقطاع" : "Add Deduction",
    totalPenalties: isAr ? "إجمالي الاستقطاعات" : "Total Deductions",

    deliveryDeductions: isAr
      ? "خصومات شركة التوصيل"
      : "Delivery Company Deductions",
    advances: isAr ? "السلف" : "Advances",

    paymentMethod: isAr ? "طريقة الدفع" : "Payment Method",
    bank: isAr ? "تحويل بنكي" : "Bank Transfer",
    cash: isAr ? "كاش" : "Cash",

    salaryStatus: isAr ? "حالة الراتب" : "Salary Status",
    calculated: isAr ? "تم الاحتساب" : "Calculated",
    paid: isAr ? "تم الصرف" : "Paid",

    receivedDate: isAr ? "تاريخ الاستلام" : "Received Date",
    notes: isAr ? "ملاحظات" : "Notes",

    netSalary: isAr ? "صافي الراتب المستحق" : "Net Salary",
    save: isAr ? "حفظ الراتب" : "Save Payroll",
    print: isAr ? "طباعة سند الاستلام" : "Print Receipt",
    whatsapp: isAr ? "واتساب" : "WhatsApp",
    clear: isAr ? "مسح البيانات" : "Clear",
    sar: isAr ? "ر.س" : "SAR",
  };

  const isCourier =
    employee?.job_title === "keetaCourier" ||
    employee?.job_title === "hungerCourier";

  useEffect(() => {
    loadData();
  }, [employeeId, selectedMonth]);

  async function loadData() {
    setLoading(true);

    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .select("id,name,iqama,phone,job_title,base_salary,keeta_id,hunger_id")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employeeData) {
      console.error(employeeError);
      alert(isAr ? "لم يتم العثور على الموظف" : "Employee not found");
      setLoading(false);
      return;
    }

    setEmployee(employeeData as Employee);
    setBaseSalary(String(employeeData.base_salary || 0));

    const { data: payrollData, error: payrollError } = await supabase
      .from("employee_payrolls")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("month", selectedMonth)
      .maybeSingle();

    if (payrollError) {
      console.error(payrollError);
    }

    if (payrollData) {
      const payroll = payrollData as Payroll;

      setPayrollId(payroll.id);
      setBaseSalary(String(payroll.base_salary || 0));
      setOrdersCount(String(payroll.orders_count || 0));
      setTargetOrders(String(payroll.target_orders || 450));
      setExtraBonus(String(payroll.extra_bonus || 0));
      setDeliveryDeductions(
        String(payroll.delivery_company_deductions || 0)
      );
      setAdvances(String(payroll.advances || 0));
      setPaymentMethod(
        payroll.payment_method === "cash" ? "cash" : "bank"
      );
      setSalaryStatus(
        payroll.salary_status === "paid" ? "paid" : "calculated"
      );
      setReceivedDate(
        payroll.received_date || new Date().toISOString().slice(0, 10)
      );
      setNotes(payroll.notes || "");
      setPenalties(
        payroll.penalties && payroll.penalties.length > 0
          ? payroll.penalties
          : [{ reason: "", amount: 0 }]
      );
    }

    setLoading(false);
  }

  function toNumber(value: string | number | null | undefined) {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
  }

  const calculation = useMemo(() => {
    const base = toNumber(baseSalary);
    const orders = toNumber(ordersCount);
    const target = toNumber(targetOrders);
    const bonusExtra = toNumber(extraBonus);
    const delivery = isCourier ? toNumber(deliveryDeductions) : 0;
    const advanceAmount = toNumber(advances);

    let orderBonus = 0;
    let targetDeduction = 0;

    if (isCourier) {
      if (orders < target) {
        targetDeduction = (target - orders) * 5;
      } else if (orders > target && orders <= 550) {
        orderBonus = (orders - target) * 10;
      } else if (orders > 550) {
        orderBonus = (550 - target) * 10 + (orders - 550) * 12;
      }
    }

    const penaltiesTotal = penalties.reduce(
      (sum, item) => sum + toNumber(item.amount),
      0
    );

    const netSalary =
      base +
      orderBonus +
      bonusExtra -
      targetDeduction -
      penaltiesTotal -
      delivery -
      advanceAmount;

    return {
      base,
      orders,
      target,
      orderBonus,
      targetDeduction,
      bonusExtra,
      penaltiesTotal,
      delivery,
      advanceAmount,
      netSalary,
    };
  }, [
    baseSalary,
    ordersCount,
    targetOrders,
    extraBonus,
    deliveryDeductions,
    advances,
    penalties,
    isCourier,
  ]);
    function formatMoney(value: number) {
    return `${value.toLocaleString("en-US", {
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

  function addPenalty() {
    setPenalties((prev) => [...prev, { reason: "", amount: 0 }]);
  }

  function updatePenalty(index: number, key: keyof Penalty, value: string) {
    setPenalties((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: key === "amount" ? toNumber(value) : value,
            }
          : item
      )
    );
  }

  function removePenalty(index: number) {
    setPenalties((prev) => {
      if (prev.length === 1) {
        return [{ reason: "", amount: 0 }];
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  function clearForm() {
    setOrdersCount("0");
    setTargetOrders("450");
    setExtraBonus("0");
    setDeliveryDeductions("0");
    setAdvances("0");
    setPaymentMethod("bank");
    setSalaryStatus("calculated");
    setReceivedDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setPenalties([{ reason: "", amount: 0 }]);
  }

  async function savePayroll() {
    if (!employee) return;

    setSaving(true);

    const cleanPenalties = penalties
      .filter((item) => item.reason.trim() || toNumber(item.amount) > 0)
      .map((item) => ({
        reason: item.reason.trim() || (isAr ? "عقوبة" : "Penalty"),
        amount: toNumber(item.amount),
      }));

    const payload = {
      employee_id: employee.id,
      month: selectedMonth,
      job_title: employee.job_title,
      base_salary: calculation.base,

      orders_count: isCourier ? calculation.orders : 0,
      target_orders: isCourier ? calculation.target : 0,
      order_bonus: isCourier ? calculation.orderBonus : 0,
      target_deduction: isCourier ? calculation.targetDeduction : 0,

      extra_bonus: calculation.bonusExtra,

      penalties: cleanPenalties,
      penalties_total: calculation.penaltiesTotal,

      delivery_company_deductions: isCourier ? calculation.delivery : 0,
      advances: calculation.advanceAmount,

      payment_method: paymentMethod,
      salary_status: salaryStatus,
      received_date: receivedDate || null,
      net_salary: calculation.netSalary,

      notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (payrollId) {
      const result = await supabase
        .from("employee_payrolls")
        .update(payload)
        .eq("id", payrollId);

      error = result.error;
    } else {
      const result = await supabase.from("employee_payrolls").insert(payload);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error("SAVE PAYROLL ERROR:", error);
      alert(
        isAr
          ? `فشل حفظ الراتب: ${error.message}`
          : `Failed to save payroll: ${error.message}`
      );
      return;
    }

    alert(isAr ? "تم حفظ الراتب بنجاح" : "Payroll saved successfully");
    router.push(`/employees/payroll?month=${selectedMonth}`);
  }

  function normalizeSaudiPhone(phone?: string | null) {
    if (!phone) return "";

    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("966")) return cleaned;
    if (cleaned.startsWith("0")) return `966${cleaned.slice(1)}`;
    if (cleaned.startsWith("5")) return `966${cleaned}`;

    return cleaned;
  }

  function buildWhatsappMessage() {
    if (!employee) return "";

    const penaltiesList =
      penalties.filter((p) => p.reason || toNumber(p.amount) > 0).length > 0
        ? penalties
            .filter((p) => p.reason || toNumber(p.amount) > 0)
            .map((p) => `• ${p.reason || text.penalties}: ${formatMoney(toNumber(p.amount))}`)
            .join("\n")
        : isAr
          ? "لا يوجد"
          : "None";

    if (isAr) {
      return `السلام عليكم

تفاصيل راتب ${formatMonth(selectedMonth)}

الاسم: ${employee.name}
رقم الإقامة: ${employee.iqama || "-"}

الراتب الأساسي: ${formatMoney(calculation.base)}

${
  isCourier
    ? `عدد الطلبات: ${calculation.orders}
التارجت: ${calculation.target}

بونص الطلبات: +${formatMoney(calculation.orderBonus)}
خصم نقص التارجت: -${formatMoney(calculation.targetDeduction)}`
    : ""
}

الحوافز الإضافية: +${formatMoney(calculation.bonusExtra)}

العقوبات:
${penaltiesList}

إجمالي العقوبات: -${formatMoney(calculation.penaltiesTotal)}
${
  isCourier
    ? `خصومات شركة التوصيل: -${formatMoney(calculation.delivery)}`
    : ""
}
السلف: -${formatMoney(calculation.advanceAmount)}

صافي الراتب المستحق:
${formatMoney(calculation.netSalary)}

طريقة الدفع:
${paymentMethod === "bank" ? text.bank : text.cash}

ملاحظات:
${notes?.trim() || "لا توجد ملاحظات"}


نمو التوصيل للخدمات اللوجستية`;
    }

    return `Hello,

Salary Details for ${formatMonth(selectedMonth)}

Employee Name: ${employee.name}
Iqama Number: ${employee.iqama || "-"}

Base Salary: ${formatMoney(calculation.base)}

${
  isCourier
    ? `Total Orders: ${calculation.orders}
Target: ${calculation.target}

Order Bonus: +${formatMoney(calculation.orderBonus)}
Target Deduction: -${formatMoney(calculation.targetDeduction)}`
    : ""
}

Additional Incentives: +${formatMoney(calculation.bonusExtra)}

Penalties:
${penaltiesList}

Total Penalties: -${formatMoney(calculation.penaltiesTotal)}
${
  isCourier
    ? `Delivery Company Deductions: -${formatMoney(calculation.delivery)}`
    : ""
}
Advances: -${formatMoney(calculation.advanceAmount)}

Net Salary:
${formatMoney(calculation.netSalary)}

Payment Method:
${paymentMethod === "bank" ? text.bank : text.cash}

Notes:
${notes?.trim() || "No Notes"}


Nmo Delivery Logistics Services`;
  }

  function openWhatsapp() {
    if (!employee) return;

    const phone = normalizeSaudiPhone(employee.phone);

    if (!phone) {
      alert(isAr ? "رقم جوال الموظف غير موجود" : "Employee phone is missing");
      return;
    }

    const message = buildWhatsappMessage();
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

  function openReceipt() {
    window.open(
      `/employees/payroll/${employeeId}/receipt?month=${selectedMonth}`,
      "_blank"
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg font-black text-slate-500 shadow-sm">
        {isAr ? "جاري تحميل بيانات الراتب..." : "Loading payroll data..."}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-lg font-black text-red-600 shadow-sm">
        {isAr ? "لم يتم العثور على الموظف" : "Employee not found"}
      </div>
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

        <Link
          href={`/employees/payroll?month=${selectedMonth}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#0f2544] shadow-sm hover:bg-slate-50"
        >
          <ArrowRight className="h-5 w-5" />
          {text.back}
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-4">
          <InfoCard
            icon={<User className="h-6 w-6" />}
            label={text.employeeName}
            value={employee.name}
          />
          <InfoCard label={text.iqama} value={employee.iqama || "-"} />
          <InfoCard label={text.phone} value={employee.phone || "-"} />
          <InfoCard label={text.job} value={jobLabel(employee.job_title)} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title={text.basicData} icon={<Wallet className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={text.month}
                value={formatMonth(selectedMonth)}
                disabled
              />

              <Input
                label={text.baseSalary}
                value={baseSalary}
                onChange={setBaseSalary}
                type="number"
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-black text-[#0f2544]">
                  {text.paymentMethod}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentMethod("bank")}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-black ${
                      paymentMethod === "bank"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {text.bank}
                  </button>

                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-black ${
                      paymentMethod === "cash"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {text.cash}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-black text-[#0f2544]">
                  {text.salaryStatus}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSalaryStatus("calculated")}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-black ${
                      salaryStatus === "calculated"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {text.calculated}
                  </button>

                  <button
                    onClick={() => setSalaryStatus("paid")}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-black ${
                      salaryStatus === "paid"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {text.paid}
                  </button>
                </div>
              </div>
            </div>
          </Section>
                    {isCourier && (
            <Section
              title={text.performance}
              icon={<CalendarDays className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={text.ordersCount}
                  value={ordersCount}
                  onChange={setOrdersCount}
                  type="number"
                />

                <Input
                  label={text.target}
                  value={targetOrders}
                  onChange={setTargetOrders}
                  type="number"
                />

                <Input
                  label={text.orderBonus}
                  value={formatMoney(calculation.orderBonus)}
                  disabled
                />

                <Input
                  label={text.targetDeduction}
                  value={formatMoney(calculation.targetDeduction)}
                  disabled
                />
              </div>
            </Section>
          )}

          <Section
            title={text.additions}
            icon={<Plus className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={text.extraBonus}
                value={extraBonus}
                onChange={setExtraBonus}
                type="number"
              />
            </div>

            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-[#0f2544]">
                  {text.penalties}
                </h3>

                <button
                  onClick={addPenalty}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700"
                >
                  {text.addPenalty}
                </button>
              </div>

              <div className="space-y-3">
                {penalties.map((penalty, index) => (
                  <div
                    key={index}
                    className="grid gap-3 md:grid-cols-[1fr_180px_60px]"
                  >
                    <input
                      value={penalty.reason}
                      onChange={(e) =>
                        updatePenalty(index, "reason", e.target.value)
                      }
                      placeholder={text.penaltyReason}
                      className="rounded-xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-blue-500"
                    />

                    <input
                      type="number"
                      value={penalty.amount}
                      onChange={(e) =>
                        updatePenalty(index, "amount", e.target.value)
                      }
                      placeholder={text.penaltyAmount}
                      className="rounded-xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-blue-500"
                    />

                    <button
                      onClick={() => removePenalty(index)}
                      className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-red-50 p-4">
                <span className="font-black text-red-700">
                  {text.totalPenalties}:{" "}
                  {formatMoney(calculation.penaltiesTotal)}
                </span>
              </div>
            </div>
          </Section>

          <Section
            title={text.deductions}
            icon={<CreditCard className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {isCourier && (
                <Input
                  label={text.deliveryDeductions}
                  value={deliveryDeductions}
                  onChange={setDeliveryDeductions}
                  type="number"
                />
              )}

              <Input
                label={text.advances}
                value={advances}
                onChange={setAdvances}
                type="number"
              />

              <Input
                label={text.receivedDate}
                value={receivedDate}
                onChange={setReceivedDate}
                type="date"
              />
            </div>

            <div className="mt-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={text.notes}
                rows={4}
                className="w-full rounded-xl border border-slate-200 p-4 font-bold outline-none focus:border-blue-500"
              />
            </div>
          </Section>
        </div>

        <div>
          <div className="sticky top-6 space-y-4">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
              <p className="text-sm font-black text-green-700">
                {text.netSalary}
              </p>

              <h2 className="mt-3 text-4xl font-black text-green-800">
                {formatMoney(calculation.netSalary)}
              </h2>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-3 text-sm font-bold">
                <SummaryRow
                  label={text.baseSalary}
                  value={formatMoney(calculation.base)}
                />

                {isCourier && (
                  <>
                    <SummaryRow
                      label={text.orderBonus}
                      value={formatMoney(calculation.orderBonus)}
                      positive
                    />

                    <SummaryRow
                      label={text.targetDeduction}
                      value={formatMoney(calculation.targetDeduction)}
                      negative
                    />
                  </>
                )}

                <SummaryRow
                  label={text.extraBonus}
                  value={formatMoney(calculation.bonusExtra)}
                  positive
                />

                <SummaryRow
                  label={text.totalPenalties}
                  value={formatMoney(calculation.penaltiesTotal)}
                  negative
                />

                {isCourier && (
                  <SummaryRow
                    label={text.deliveryDeductions}
                    value={formatMoney(calculation.delivery)}
                    negative
                  />
                )}

                <SummaryRow
                  label={text.advances}
                  value={formatMoney(calculation.advanceAmount)}
                  negative
                />
              </div>
            </div>

            <button
              onClick={savePayroll}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {saving ? "..." : text.save}
            </button>

            <button
              onClick={openReceipt}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-[#0f2544] hover:bg-slate-50"
            >
              <Printer className="h-5 w-5" />
              {text.print}
            </button>

            <button
              onClick={openWhatsapp}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-black text-green-700 hover:bg-green-100"
            >
              <MessageCircle className="h-5 w-5" />
              {text.whatsapp}
            </button>

            <button
              onClick={clearForm}
              className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-600 hover:bg-red-100"
            >
              {text.clear}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
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
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-black text-[#0f2544]">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: any) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#0f2544]">
        {label}
      </label>

      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-blue-500 disabled:bg-slate-100"
      />
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-sm font-black text-slate-500">{label}</span>
      </div>

      <p className="font-black text-[#0f2544]">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span>{label}</span>

      <span
        className={`font-black ${
          positive
            ? "text-green-600"
            : negative
            ? "text-red-600"
            : "text-[#0f2544]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}