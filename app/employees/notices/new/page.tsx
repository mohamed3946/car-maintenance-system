"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "../../../../components/AppLayout";
import { supabase } from "../../../lib/supabase";
import {
  ArrowRight,
  AlertTriangle,
  FileText,
  Save,
  User,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  iqama: string | null;
  phone: string | null;
  job_title: string | null;
  work_location: string | null;
};

type ViolationRule = {
  value: string;
  labelAr: string;
  labelEn: string;
  severity: "low" | "medium" | "high" | "critical";
  action: string;
};

const violationRules: ViolationRule[] = [
  { value: "late_attendance", labelAr: "التأخير عن الدوام", labelEn: "Late Attendance", severity: "low", action: "first_warning" },
  { value: "absence_without_permission", labelAr: "الغياب بدون إذن", labelEn: "Absence Without Permission", severity: "medium", action: "first_warning" },
  { value: "work_interruption", labelAr: "انقطاع عن العمل", labelEn: "Work Interruption", severity: "critical", action: "work_absence_notice" },
  { value: "uniform_violation", labelAr: "عدم الالتزام بالزي", labelEn: "Uniform Violation", severity: "low", action: "first_warning" },
  { value: "refusing_orders", labelAr: "رفض الطلبات", labelEn: "Refusing Orders", severity: "medium", action: "first_warning" },
  { value: "cancelling_orders", labelAr: "إلغاء الطلبات", labelEn: "Cancelling Orders", severity: "medium", action: "first_warning" },
  { value: "shift_violation", labelAr: "عدم الالتزام بالشفت", labelEn: "Shift Violation", severity: "medium", action: "first_warning" },
  { value: "low_performance", labelAr: "انخفاض الأداء", labelEn: "Low Performance", severity: "medium", action: "first_warning" },
  { value: "cash_deposit_delay", labelAr: "تأخير إيداع الكاش", labelEn: "Cash Deposit Delay", severity: "medium", action: "first_warning" },
  { value: "cash_not_deposited", labelAr: "عدم إيداع الكاش", labelEn: "Cash Not Deposited", severity: "high", action: "second_warning" },
  { value: "custody_loss", labelAr: "فقدان عهدة", labelEn: "Custody Loss", severity: "high", action: "investigation" },
  { value: "vehicle_misuse", labelAr: "استخدام المركبة لأغراض شخصية", labelEn: "Vehicle Misuse", severity: "high", action: "final_warning" },
  { value: "accident_negligence", labelAr: "حادث بسبب الإهمال", labelEn: "Accident Due To Negligence", severity: "high", action: "investigation" },
  { value: "customer_complaint", labelAr: "شكوى عميل", labelEn: "Customer Complaint", severity: "medium", action: "first_warning" },
  { value: "document_forgery", labelAr: "تزوير مستندات", labelEn: "Document Forgery", severity: "critical", action: "investigation" },
];

export default function NewNoticePage() {
  return (
    <AppLayout system="employees">
      <NewNoticeContent />
    </AppLayout>
  );
}

function NewNoticeContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [violationType, setViolationType] = useState("late_attendance");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [deductionAmount, setDeductionAmount] = useState("0");
  const [saving, setSaving] = useState(false);

  const selectedEmployee = employees.find((e) => e.id === employeeId) || null;
  const selectedRule = violationRules.find((r) => r.value === violationType)!;
  useEffect(() => {
  if (!employeeId || !violationType) return;

  checkExistingOpenCase();
}, [employeeId, violationType]);

async function checkExistingOpenCase() {
  const violationLabel = labelRule(selectedRule);

  const { data, error } = await supabase
    .from("employee_cases")
    .select("id,case_number,violation_type,status,is_closed")
    .eq("employee_id", employeeId)
    .eq("violation_type", violationLabel)
    .in("status", ["open", "follow_up"])
    .limit(1);

  if (error) {
    alert(error.message);
    return;
  }

  const existingCase = data?.[0];

  if (existingCase) {
    const openOldCase = window.confirm(
      isAr
        ? `هذا الموظف لديه مخالفة مفتوحة من نفس النوع:\n\nرقم المخالفة: ${existingCase.case_number}\nنوع المخالفة: ${existingCase.violation_type}\n\nهل تريد فتح المخالفة القديمة؟`
        : `This employee already has an open case of the same type:\n\nCase No: ${existingCase.case_number}\nViolation: ${existingCase.violation_type}\n\nDo you want to open the existing case?`
    );

    if (openOldCase) {
      router.push(`/employees/notices/${existingCase.id}`);
    }
  }
}

  const text = {
    title: isAr ? "إنشاء مخالفة جديدة" : "Create New Case",
    subtitle: isAr ? "اختيار الموظف وتسجيل المخالفة والإجراء المقترح" : "Select employee and create a new warning case",
    back: isAr ? "العودة" : "Back",
    employee: isAr ? "الموظف" : "Employee",
    selectEmployee: isAr ? "اختر الموظف" : "Select Employee",
    employeeData: isAr ? "بيانات الموظف" : "Employee Details",
    iqama: isAr ? "رقم الإقامة" : "Iqama",
    phone: isAr ? "الجوال" : "Phone",
    job: isAr ? "المهنة" : "Job",
    location: isAr ? "موقع العمل" : "Work Location",
    violation: isAr ? "نوع المخالفة" : "Violation Type",
    severity: isAr ? "درجة الخطورة" : "Severity",
    action: isAr ? "الإجراء المقترح" : "Suggested Action",
    description: isAr ? "وصف المخالفة" : "Description",
    notes: isAr ? "ملاحظات إضافية" : "Notes",
    deduction: isAr ? "قيمة الخصم المقترح" : "Suggested Deduction",
    save: isAr ? "حفظ المخالفة" : "Save Case",
    low: isAr ? "منخفضة" : "Low",
    medium: isAr ? "متوسطة" : "Medium",
    high: isAr ? "عالية" : "High",
    critical: isAr ? "جسيمة" : "Critical",
    first_warning: isAr ? "إنذار أول" : "First Warning",
    second_warning: isAr ? "إنذار ثاني" : "Second Warning",
    final_warning: isAr ? "إنذار نهائي" : "Final Warning",
    investigation: isAr ? "تحقيق" : "Investigation",
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const { data, error } = await supabase
      .from("employees")
      .select("id,name,iqama,phone,job_title,work_location")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setEmployees((data || []) as Employee[]);
  }

  function labelRule(rule: ViolationRule) {
    return isAr ? rule.labelAr : rule.labelEn;
  }

  function severityLabel(value: string) {
    return (text as any)[value] || value;
  }

  function actionLabel(value: string) {
    return (text as any)[value] || value;
  }

  function jobLabel(job?: string | null) {
    const map: Record<string, string> = {
      keetaCourier: isAr ? "مندوب كيتا" : "Keeta Courier",
      hungerCourier: isAr ? "مندوب هنجرستيشن" : "HungerStation Courier",
      supervisor: isAr ? "مشرف" : "Supervisor",
      mechanic: isAr ? "ميكانيكي" : "Mechanic",
      maintenanceOfficer: isAr ? "مسؤول صيانة" : "Maintenance Officer",
    };
    return map[job || ""] || job || "-";
  }

  async function generateCaseNumber() {
    const year = new Date().getFullYear();

    const { count } = await supabase
      .from("employee_cases")
      .select("*", { count: "exact", head: true });

    const next = String((count || 0) + 1).padStart(4, "0");
    return `WR-${year}-${next}`;
  }

  async function saveCase() {
    if (!employeeId) {
      alert(isAr ? "اختر الموظف أولاً" : "Select employee first");
      return;
    }

    if (!description.trim()) {
      alert(isAr ? "اكتب وصف المخالفة" : "Enter case description");
      return;
    }

    setSaving(true);

    const caseNumber = await generateCaseNumber();

    const { data, error } = await supabase
      .from("employee_cases")
      .insert({
        case_number: caseNumber,
        employee_id: employeeId,
        violation_type: labelRule(selectedRule),
        severity: selectedRule.severity,
        status: "open",
        current_action: selectedRule.action,
        description: description.trim(),
        notes: notes || null,
        deduction_amount: Number(deductionAmount || 0),
        created_by: isAr ? "المدير العام" : "General Manager",
        is_closed: false,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(isAr ? `فشل الحفظ: ${error.message}` : `Save failed: ${error.message}`);
      setSaving(false);
      return;
    }

    await supabase.from("case_actions").insert({
      case_id: data.id,
      action_type: selectedRule.action,
      notes: description.trim(),
      amount: Number(deductionAmount || 0),
      created_by: isAr ? "المدير العام" : "General Manager",
    });

    setSaving(false);
    alert(isAr ? "تم حفظ المخالفة بنجاح" : "Case saved successfully");
    router.push("/employees/notices");
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f2544]">{text.title}</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">{text.subtitle}</p>
        </div>

        <Link
          href="/employees/notices"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#0f2544] shadow-sm hover:bg-slate-50"
        >
          <ArrowRight className="h-5 w-5" />
          {text.back}
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="space-y-6 xl:col-span-2">
          <Card title={text.employeeData} icon={<User className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={text.employee}
                value={employeeId}
                onChange={setEmployeeId}
                options={[
                  { value: "", label: text.selectEmployee },
                  ...employees.map((e) => ({ value: e.id, label: e.name })),
                ]}
              />

              <ReadOnly label={text.iqama} value={selectedEmployee?.iqama || "-"} />
              <ReadOnly label={text.phone} value={selectedEmployee?.phone || "-"} />
              <ReadOnly label={text.job} value={jobLabel(selectedEmployee?.job_title)} />
              <ReadOnly label={text.location} value={selectedEmployee?.work_location || "-"} />
            </div>
          </Card>

          <Card title={isAr ? "تفاصيل المخالفة" : "Case Details"} icon={<AlertTriangle className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={text.violation}
                value={violationType}
                onChange={setViolationType}
                options={violationRules.map((r) => ({
                  value: r.value,
                  label: labelRule(r),
                }))}
              />

              <ReadOnly label={text.severity} value={severityLabel(selectedRule.severity)} />
              <ReadOnly label={text.action} value={actionLabel(selectedRule.action)} />

              <Input
                label={text.deduction}
                value={deductionAmount}
                onChange={setDeductionAmount}
                type="number"
              />
            </div>

            <div className="mt-4 space-y-4">
              <Textarea
                label={text.description}
                value={description}
                onChange={setDescription}
              />
              <Textarea
                label={text.notes}
                value={notes}
                onChange={setNotes}
              />
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-blue-700 shadow-sm">
            <p className="text-sm font-black opacity-80">
              {isAr ? "الإجراء المقترح" : "Suggested Action"}
            </p>
            <h2 className="mt-3 text-3xl font-black">
              {actionLabel(selectedRule.action)}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-3 text-sm font-bold">
              <SummaryRow label={text.violation} value={labelRule(selectedRule)} />
              <SummaryRow label={text.severity} value={severityLabel(selectedRule.severity)} />
              <SummaryRow label={text.deduction} value={`${deductionAmount || 0} ر.س`} />
            </div>
          </div>

          <button
            onClick={saveCase}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? "..." : text.save}
          </button>
        </aside>
      </div>
    </div>
  );
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
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-black text-[#0f2544]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-black text-[#0f2544]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-black text-[#0f2544]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-black text-[#0f2544]">{label}</span>
      <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600">
        {value}
      </div>
    </div>
  );
}

function Textarea({ label, value, onChange }: any) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-black text-[#0f2544]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-black text-[#0f2544]">{value}</span>
    </div>
  );
}