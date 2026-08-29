"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type Employee = {
  id: string;
  name: string;
  iqama: string | null;
  phone: string | null;
};

type Deduction = {
  reason: string;
  amount: number;
};

type Payroll = {
  id: string;
  employee_id: string;
  month: string;
  base_salary: number;
  orders_count: number;
  target_orders: number;
  order_bonus: number;
  target_deduction: number;
  extra_bonus: number;
  penalties: Deduction[];
  penalties_total: number;
  delivery_company_deductions: number;
  advances: number;
  payment_method: string;
  received_date: string | null;
  net_salary: number;
};

export default function SalaryReceiptPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const employeeId = String(params.employeeId);
  const month = searchParams.get("month") || "2026-06";

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, [employeeId, month]);

  async function loadReceipt() {
    setLoading(true);

    const { data: employeeData } = await supabase
      .from("employees")
      .select("id,name,iqama,phone")
      .eq("id", employeeId)
      .single();

    const { data: payrollData } = await supabase
      .from("employee_payrolls")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("month", month)
      .single();

    setEmployee(employeeData as Employee);
    setPayroll(payrollData as Payroll);
    setLoading(false);
  }

  function formatMoney(value: number | null | undefined) {
    return Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatMonth(value: string) {
    const [year, m] = value.split("-");
    const months = [
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
    return `${months[Number(m) - 1]} ${year}`;
  }

  const totals = useMemo(() => {
    if (!payroll) return { earnings: 0, deductions: 0 };

    const earnings =
      Number(payroll.base_salary || 0) +
      Number(payroll.order_bonus || 0) +
      Number(payroll.extra_bonus || 0);

    const deductions =
      Number(payroll.target_deduction || 0) +
      Number(payroll.penalties_total || 0) +
      Number(payroll.delivery_company_deductions || 0) +
      Number(payroll.advances || 0);

    return { earnings, deductions };
  }, [payroll]);

  if (loading) {
    return <div className="p-10 text-center font-bold">جاري تحميل السند...</div>;
  }

  if (!employee || !payroll) {
    return (
      <div className="p-10 text-center font-bold text-red-600">
        لم يتم العثور على بيانات الراتب
      </div>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
      <style jsx global>{`
        @media print {
          @page {
  size: A4 portrait;
  margin: 5mm;
}

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[790px] rounded-2xl border-2 border-[#0f2544] bg-white p-5 text-[#0f2544] shadow-xl print:max-w-none print:rounded-none print:border print:p-3 print:shadow-none">
        <header className="mb-3 border-b-4 border-[#0f2544] pb-3">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-right">
              <h2 className="text-2xl font-black">نمو التوصيل للخدمات اللوجستية</h2>
              <div className="mt-2 h-1 w-58 rounded-full bg-yellow-400" />
              <p className="mt-3 text-l font-black tracking-wide">
                NEMO AL TOSEIL For logistics
              </p>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-black">سند استلام راتب</h1>
              <div className="mx-auto my-3 h-1 w-64 rounded-full bg-[#0f2544]" />
              <p className="text-xl font-black tracking-[0.25em]">SALARY RECEIPT</p>
            </div>

            <div className="flex justify-start -ml-400">
           <div className="relative h-32 w-64 overflow-hidden">
  <Image
    src="/logo.png"
    alt="logo"
    width={700}
    height={350}
    className="absolute left-[25%] top-1/2 h-64 w-500 -translate-x-1/2 -translate-y-[42%] object-contain"
    priority
  />
</div>
            </div>
          </div>
        </header>

        <section className="mb-3 grid grid-cols-2 gap-3 rounded-xl border border-[#0f2544] p-3">
          <div>
            <SectionTitle title="بيانات الموظف" />
            <InfoRow label="اسم الموظف" value={employee.name} />
            <InfoRow label="رقم الإقامة" value={employee.iqama || "-"} />
            <InfoRow label="رقم الجوال" value={employee.phone || "-"} />
          </div>

          <div>
            <SectionTitle title="بيانات الراتب" />
            <InfoRow label="شهر الراتب" value={formatMonth(month)} />
            <InfoRow label="تاريخ الاستلام" value={payroll.received_date || "-"} />
            <InfoRow
              label="طريقة الدفع"
              value={payroll.payment_method === "cash" ? "كاش" : "تحويل بنكي"}
            />
            <InfoRow
              label="رقم السند"
              value={`SAL-${month}-${payroll.id.slice(0, 5).toUpperCase()}`}
            />
          </div>
        </section>

        <section className="mb-3 space-y-3">
          <TableBox title="الاستحقاقات">
            <SalaryRow label="الراتب الأساسي" value={payroll.base_salary} />
            <SalaryRow label="بونص الطلبات" value={payroll.order_bonus} />
            <SalaryRow label="الحوافز الإضافية" value={payroll.extra_bonus} />
            <SalaryRow label="إجمالي الاستحقاقات" value={totals.earnings} strong positive />
          </TableBox>

          <TableBox title="الاستقطاعات">
            <SalaryRow label="خصم نقص التارجت" value={payroll.target_deduction} negative />

            {payroll.penalties && payroll.penalties.length > 0 ? (
              payroll.penalties.map((item, index) => (
                <SalaryRow
                  key={index}
                  label={item.reason || "استقطاع"}
                  value={item.amount}
                  negative
                />
              ))
            ) : (
              <SalaryRow label="استقطاعات أخرى" value={0} negative />
            )}

            <SalaryRow
              label="خصومات شركة التوصيل"
              value={payroll.delivery_company_deductions}
              negative
            />
            <SalaryRow label="السلف" value={payroll.advances} negative />
            <SalaryRow label="إجمالي الاستقطاعات" value={totals.deductions} strong negative />
          </TableBox>
        </section>

        <section className="mb-3 grid grid-cols-[1fr_2fr] overflow-hidden rounded-xl border-2 border-[#0f2544]">
          <div className="bg-[#0f2544] p-3 text-center text-2xl font-black text-white">
            صافي الراتب المستحق
          </div>
          <div className="flex items-center justify-center gap-4 p-3 text-3xl font-black">
            <span>{formatMoney(payroll.net_salary)}</span>
            <span className="text-3xl">ريال</span>
          </div>
        </section>

        <section className="mb-3 rounded-xl border border-[#0f2544] p-3 text-center text-lg font-bold leading-8">
          أقر أنا الموقع أدناه باستلام راتبي الموضح أعلاه كاملاً عن شهر{" "}
          <strong>{formatMonth(month)}</strong>، وأقر بأن جميع البيانات المذكورة
          صحيحة، ولا يوجد لي أي مستحقات مالية أخرى لدى الشركة عن نفس الفترة.
        </section>

        <section className="mb-3 grid grid-cols-4 overflow-hidden rounded-xl border border-[#0f2544] text-center">
          <SignatureBox title="اسم الموظف" value={employee.name} />
          <SignatureBox title="التوقيع" value="........................" />
          <SignatureBox title="البصمة" value="........................" />
          <SignatureBox title="التاريخ" value={payroll.received_date || "........................"} />
        </section>

        <footer className="rounded-xl bg-[#0f2544] px-5 py-2 text-center text-lg font-black text-white">
          هذا السند صادر من نظام نمو التوصيل للخدمات اللوجستية
        </footer>

        <div className="mt-4 flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="rounded-2xl bg-blue-600 px-8 py-3 font-black text-white hover:bg-blue-700"
          >
            طباعة سند الاستلام
          </button>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mx-auto mb-2 w-56 rounded-b-xl bg-[#0f2544] py-1 text-center text-lg font-black text-white">
      {title}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_20px_1fr] border-b border-slate-200 py-1 text-lg font-bold">
      <span>{label}</span>
      <span>:</span>
      <span>{value}</span>
    </div>
  );
}

function TableBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#0f2544]">
      <h3 className="bg-[#0f2544] py-2 text-center text-xl font-black text-white">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SalaryRow({
  label,
  value,
  strong,
  positive,
  negative,
}: {
  label: string;
  value: number;
  strong?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_160px] border-b border-slate-200 text-lg font-bold ${
        strong ? "bg-slate-50 text-xl font-black" : ""
      }`}
    >
      <span className="p-2">{label}</span>
      <span
        className={`border-r border-slate-200 p-2 text-center ${
          positive ? "text-green-700" : negative ? "text-red-600" : ""
        }`}
      >
        {Number(value || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}

function SignatureBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-l border-[#0f2544] p-3 last:border-l-0">
      <p className="mb-4 text-xl font-black">{title}</p>
      <p className="min-h-8 text-lg font-bold">{value}</p>
    </div>
  );
}