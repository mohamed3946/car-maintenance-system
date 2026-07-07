"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "../../../../components/AppLayout";
import { supabase } from "../../../lib/supabase";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  Save,
  ShieldAlert,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  iqama: string | null;
  phone: string | null;
  email?: string | null;
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
  case_summary: string | null;
  management_notes: string | null;
  created_by: string | null;
  created_at: string;
  closed_at: string | null;
  is_closed: boolean;
  closed_reason: string | null;
  deduction_amount: number | null;
};

type CaseAction = {
  id: string;
  case_id: string;
  action_type: string;
  notes: string | null;
  amount: number | null;
  created_by: string | null;
  created_at: string;
};

export default function CaseDetailsPage() {
  return (
    <AppLayout system="employees">
      <CaseDetailsContent />
    </AppLayout>
  );
}

function CaseDetailsContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const params = useParams();
  const router = useRouter();
  const caseId = String(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [caseItem, setCaseItem] = useState<EmployeeCase | null>(null);
  const [actions, setActions] = useState<CaseAction[]>([]);

  const [newActionNotes, setNewActionNotes] = useState("");
  const [deductionAmount, setDeductionAmount] = useState("0");
  const [closeReason, setCloseReason] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showActionForm, setShowActionForm] = useState(false);

  const text = {
    title: isAr ? "تفاصيل المخالفة" : "Case Details",
    breadcrumb: isAr
      ? "الرئيسية / الإشعارات والإنذارات / تفاصيل المخالفة"
      : "Home / Notifications & Warnings / Case Details",
    back: isAr ? "العودة للقائمة" : "Back To List",

    employeeData: isAr ? "بيانات الموظف" : "Employee Details",
    caseData: isAr ? "بيانات المخالفة" : "Case Details",
    actionTimeline: isAr ? "سجل الإجراءات" : "Action Timeline",
    generatedNotice: isAr ? "نموذج الإنذار الجاهز" : "Generated Warning Notice",
    internalNotes: isAr ? "ملاحظات الإدارة الداخلية" : "Internal Management Notes",

    employeeName: isAr ? "اسم الموظف" : "Employee Name",
    iqama: isAr ? "رقم الإقامة" : "Iqama",
    phone: isAr ? "رقم الجوال" : "Phone",
    email: isAr ? "البريد الإلكتروني" : "Email",
    job: isAr ? "المهنة" : "Job Title",
    location: isAr ? "موقع العمل" : "Work Location",

    caseNumber: isAr ? "رقم المخالفة" : "Case Number",
    violation: isAr ? "نوع المخالفة" : "Violation Type",
    severity: isAr ? "درجة الخطورة" : "Severity",
    status: isAr ? "حالة المخالفة" : "Case Status",
    currentAction: isAr ? "الإجراء الحالي" : "Current Action",
    createdAt: isAr ? "تاريخ الإنشاء" : "Created At",
    createdBy: isAr ? "أنشئت بواسطة" : "Created By",
    deduction: isAr ? "قيمة الخصم" : "Deduction Amount",
    summary: isAr ? "ملخص الواقعة" : "Case Summary",
    description: isAr ? "الوصف" : "Description",
    notes: isAr ? "الملاحظات" : "Notes",

    open: isAr ? "مفتوحة" : "Open",
    followUp: isAr ? "قيد المتابعة" : "Follow Up",
    closed: isAr ? "مغلقة" : "Closed",

    low: isAr ? "منخفضة" : "Low",
    medium: isAr ? "متوسطة" : "Medium",
    high: isAr ? "عالية" : "High",
    critical: isAr ? "جسيمة" : "Critical",

    first_warning: isAr ? "إنذار أول" : "First Warning",
    second_warning: isAr ? "إنذار ثاني" : "Second Warning",
    deduction_action: isAr ? "تسجيل خصم" : "Add Deduction",
    final_warning: isAr ? "إنذار نهائي" : "Final Warning",
    investigation: isAr ? "تحقيق" : "Investigation",
    close_case: isAr ? "إغلاق المخالفة" : "Close Case",

    addFirstWarning: isAr ? "إضافة إنذار أول" : "Add First Warning",
    addSecondWarning: isAr ? "إضافة إنذار ثاني" : "Add Second Warning",
    addDeduction: isAr ? "تسجيل خصم" : "Add Deduction",
    addFinalWarning: isAr ? "إضافة إنذار نهائي" : "Add Final Warning",
    addInvestigation: isAr ? "تحويل للتحقيق" : "Send To Investigation",
    closeCase: isAr ? "إغلاق المخالفة" : "Close Case",

    actionNotes: isAr ? "ملاحظات الإجراء" : "Action Notes",
    closeReason: isAr ? "سبب الإغلاق" : "Close Reason",

    save: isAr ? "حفظ الإجراء" : "Save Action",
    print: isAr ? "طباعة" : "Print",
    whatsapp: isAr ? "واتساب" : "WhatsApp",
    sms: isAr ? "رسالة نصية" : "SMS",
    emailSend: isAr ? "إيميل" : "Email",

    sar: isAr ? "ر.س" : "SAR",
    noData: isAr ? "لا توجد بيانات" : "No data",
    loading: isAr ? "جاري التحميل..." : "Loading...",
  };

  useEffect(() => {
    loadCaseDetails();
  }, [caseId]);

  async function loadCaseDetails() {
    setLoading(true);

    const { data: caseData, error: caseError } = await supabase
      .from("employee_cases")
      .select("*")
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      console.error("CASE ERROR:", caseError);
      alert(isAr ? "لم يتم العثور على المخالفة" : "Case not found");
      setLoading(false);
      return;
    }

    setCaseItem(caseData as EmployeeCase);
    setDeductionAmount(String(caseData.deduction_amount || 0));
    setCloseReason(caseData.closed_reason || "");

    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .select("id,name,iqama,phone,job_title,work_location,photo_url")
      .eq("id", caseData.employee_id)
      .single();

    if (employeeError) {
      console.error("EMPLOYEE ERROR:", employeeError);
      setEmployee(null);
    } else {
      setEmployee(employeeData as Employee);
    }

    const { data: actionsData, error: actionsError } = await supabase
      .from("case_actions")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: true });

    if (actionsError) {
      console.error("ACTIONS ERROR:", actionsError);
      setActions([]);
    } else {
      setActions((actionsData || []) as CaseAction[]);
    }

    setLoading(false);
  }

  function formatDate(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString(isAr ? "ar-SA" : "en-US");
  }

  function formatDateTime(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleString(isAr ? "ar-SA" : "en-US");
  }

  function formatMoney(value?: number | null) {
    const amount = Number(value || 0);
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${text.sar}`;
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
      work_absence_notice: "إنذار انقطاع عن العمل",
      first_warning: text.first_warning,
      second_warning: text.second_warning,
      deduction: text.deduction_action,
      final_warning: text.final_warning,
      investigation: text.investigation,
      close_case: text.close_case,
      closed: text.close_case,
    };

    return map[value || ""] || value || "-";
  }
const [noticeText, setNoticeText] = useState("");

const generatedNotice = useMemo(() => {
  if (!employee || !caseItem) return "";

  const summary = caseItem.case_summary || caseItem.description || "";
  const employeeName = employee.name;
  const iqama = employee.iqama || "-";

  const footer = `
إدارة الموارد البشرية
مؤسسة نمو التوصيل للخدمات اللوجستية`;

  switch (caseItem.current_action) {
case "work_absence_notice":
  return `
السيد / ${employeeName}
رقم الإقامة: ${iqama}

الموضوع : إشعار انقطاع عن العمل

نفيدكم بأنه تم تسجيل انقطاعكم عن العمل دون إشعار مسبق.

تفاصيل الواقعة:

${summary}

وعليه نطلب منكم العودة للعمل فوراً والتواصل مع إدارة المؤسسة خلال مدة أقصاها 7 أيام من تاريخ هذا الإشعار.

وفي حال عدم العودة سيتم اتخاذ الإجراءات النظامية اللازمة.

إدارة الموارد البشرية
مؤسسة نمو التوصيل للخدمات اللوجستية`;

    case "first_warning":
      return `
السيد / ${employeeName}
رقم الإقامة: ${iqama}

الموضوع : إنذار أول

تم تسجيل مخالفة (${caseItem.violation_type}) عليكم.

تفاصيل الواقعة:

${summary}

وعليه يتم توجيه إنذار أول لكم بضرورة الالتزام بأنظمة العمل المتفق عليها ولوائح المؤسسة وعدم تكرار المخالفة.

${footer}`;

    case "second_warning":
      return `
السيد / ${employeeName}
رقم الإقامة: ${iqama}

الموضوع : إنذار ثاني

سبق وأن تم تنبيهكم بشأن مخالفة (${caseItem.violation_type}) إلا أن المخالفة تكررت مرة أخرى.

تفاصيل الواقعة:

${summary}

وعليه يتم توجيه إنذار ثاني لكم مع ضرورة تصحيح الوضع فوراً.

${footer}`;

case "deduction":
  return `
السيد / ${employeeName}
رقم الإقامة: ${iqama}

الموضوع : إشعار خصم إداري

نفيدكم بأنه بناءً على المخالفة المسجلة عليكم وهي:
${caseItem.violation_type}

تفاصيل الواقعة:

${summary}

فقد تقرر تسجيل خصم إداري بقيمة:
${formatMoney(caseItem.deduction_amount)}

وذلك حسب لوائح وأنظمة المؤسسة المعتمدة.

إدارة الموارد البشرية
مؤسسة نمو التوصيل للخدمات اللوجستية`;

    case "final_warning":
      return `
السيد / ${employeeName}
رقم الإقامة: ${iqama}

الموضوع : إنذار نهائي

تم تسجيل استمرار المخالفة التالية:
${caseItem.violation_type}

تفاصيل الواقعة:

${summary}

 ويعتبر هذا إنذاراً نهائياً قبل اتخاذ الإجراءات الإدارية المناسبة وفق لوائح المؤسسة وقانون العمل.

${footer}`;

    case "investigation":
      return `
السيد / ${employeeName}
رقم الإقامة: ${iqama}

الموضوع : إشعار تحقيق

تم تحويل الواقعة التالية للتحقيق الإداري:
${caseItem.violation_type}

تفاصيل الواقعة:

${summary}

وسيتم إشعاركم بنتيجة التحقيق بعد الانتهاء من الإجراءات.

${footer}`;

    default:
      return `
السيد / ${employeeName}
رقم الإقامة: ${iqama}

الموضوع : إشعار إداري

${summary}

${footer}`;
  }
}, [employee, caseItem]);

useEffect(() => {
  setNoticeText(generatedNotice);
}, [generatedNotice]);
async function addCaseAction(actionType: string) {
  if (!caseItem) return;

  setSaving(true);

  const amount =
    actionType === "deduction" ? Number(deductionAmount || 0) : 0;

  const actionNotes =
    newActionNotes ||
    (isAr ? "تم إضافة إجراء جديد على المخالفة" : "New case action added");

  const { error: actionError } = await supabase.from("case_actions").insert({
    case_id: caseItem.id,
    action_type: actionType,
    notes: actionNotes,
    amount,
    created_by: isAr ? "المدير العام" : "General Manager",
  });

  if (actionError) {
    console.error(actionError);
    alert(isAr ? "فشل حفظ الإجراء" : "Failed to save action");
    setSaving(false);
    return;
  }

  const updates: any = {
    current_action: actionType,
    status: actionType === "close_case" ? "closed" : "follow_up",
    deduction_amount:
      actionType === "deduction" ? amount : caseItem.deduction_amount || 0,
    is_closed: actionType === "close_case",
    closed_at: actionType === "close_case" ? new Date().toISOString() : null,
    closed_reason:
      actionType === "close_case"
        ? closeReason || (isAr ? "تم إغلاق المخالفة" : "Case closed")
        : caseItem.closed_reason,
  };

  const { error: caseError } = await supabase
    .from("employee_cases")
    .update(updates)
    .eq("id", caseItem.id);

  if (caseError) {
    console.error(caseError);
    alert(isAr ? "فشل تحديث المخالفة" : "Failed to update case");
    setSaving(false);
    return;
  }

  setNewActionNotes("");
  await loadCaseDetails();
  setSaving(false);

  alert(isAr ? "تم حفظ الإجراء بنجاح" : "Action saved successfully");
}

async function deleteCase() {
  if (!caseItem) return;

  const ok = window.confirm(
    isAr ? "هل تريد حذف هذه المخالفة بالكامل؟" : "Delete this case completely?"
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

  router.push("/employees/notices");
}

function normalizeSaudiPhone(phone?: string | null) {
  if (!phone) return "";

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("966")) return cleaned;
  if (cleaned.startsWith("0")) return `966${cleaned.slice(1)}`;
  if (cleaned.startsWith("5")) return `966${cleaned}`;

  return cleaned;
}

function openWhatsAppFixed() {
    
  if (!employee?.phone) {
    alert(isAr ? "رقم الجوال غير موجود" : "Employee phone is missing");
    return;
  }

  const phone = normalizeSaudiPhone(employee.phone);
  const message = encodeURIComponent(noticeText);

  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
}
function printNotice() {
  const win = window.open("", "_blank");

  if (!win) return;

  win.document.write(`
    <html>
      <body>
        <pre>${noticeText}</pre>
      </body>
    </html>
  `);

  win.document.close();
  win.print();
}

function sendSMS() {
  if (!employee?.phone) return;

  const body = encodeURIComponent(noticeText);

  window.open(
    `sms:${employee.phone}?body=${body}`
  );
}

function sendEmail() {
  if (!employee?.email) return;

  const body = encodeURIComponent(noticeText);

  window.open(
    `mailto:${employee.email}?subject=Warning Notice&body=${body}`
  );
}
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg font-black text-slate-500 shadow-sm">
        {text.loading}
      </div>
    );
  }

  if (!caseItem || !employee) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-lg font-black text-red-600 shadow-sm">
        {isAr ? "لم يتم العثور على بيانات المخالفة" : "Case data not found"}
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f2544]">{text.title}</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">
            {text.breadcrumb}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/employees/notices"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#0f2544] shadow-sm hover:bg-slate-50"
          >
            <ArrowRight className="h-5 w-5" />
            {text.back}
          </Link>

          <button
            onClick={deleteCase}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-600 shadow-sm hover:bg-red-100"
          >
            <Trash2 className="h-5 w-5" />
            {isAr ? "حذف المخالفة" : "Delete Case"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title={text.employeeData} icon={<User className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label={text.employeeName} value={employee.name} />
              <InfoRow label={text.iqama} value={employee.iqama || "-"} />
              <InfoRow label={text.phone} value={employee.phone || "-"} />
              <InfoRow label={text.email} value={employee.email || "-"} />
              <InfoRow label={text.job} value={jobLabel(employee.job_title)} />
              <InfoRow label={text.location} value={employee.work_location || "-"} />
            </div>
          </Section>

          <Section title={text.caseData} icon={<AlertTriangle className="h-5 w-5" />}>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label={text.caseNumber} value={caseItem.case_number} />
              <InfoRow label={text.violation} value={caseItem.violation_type} />
              <InfoRow label={text.severity} value={severityLabel(caseItem.severity)} />
              <InfoRow label={text.status} value={statusLabel(caseItem.status)} />
              <InfoRow label={text.currentAction} value={actionLabel(caseItem.current_action)} />
              <InfoRow label={text.createdAt} value={formatDate(caseItem.created_at)} />
              <InfoRow label={text.createdBy} value={caseItem.created_by || "-"} />
              <InfoRow label={text.deduction} value={formatMoney(caseItem.deduction_amount)} />
            </div>

            <div className="mt-5 grid gap-4">
              <TextBox label={text.summary} value={caseItem.case_summary || caseItem.description || "-"} />
              <TextBox label={text.description} value={caseItem.description || "-"} />
              <TextBox label={text.internalNotes} value={caseItem.management_notes || caseItem.notes || "-"} />
            </div>
          </Section>

          <Section title={text.actionTimeline} icon={<ClockIcon />}>
            <div className="space-y-4">
              {actions.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-center font-bold text-slate-400">
                  {text.noData}
                </div>
              ) : (
                actions.map((action) => (
                  <div
                    key={action.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-black text-[#0f2544]">
                          {actionLabel(action.action_type)}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-500">
                          {formatDateTime(action.created_at)}
                        </p>
                      </div>

                      {Number(action.amount || 0) > 0 && (
                        <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-600">
                          {formatMoney(action.amount)}
                        </span>
                      )}
                    </div>

                    {action.notes && (
                      <p className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-slate-600">
                        {action.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Section>

          <Section title={text.generatedNotice} icon={<FileText className="h-5 w-5" />}>
            <textarea
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              rows={12}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-8 outline-none"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={printNotice}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
              >
                <Printer className="h-5 w-5" />
                {text.print}
              </button>

              <button
                onClick={openWhatsAppFixed}
                className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-black text-white hover:bg-green-700"
              >
                <MessageCircle className="h-5 w-5" />
                {text.whatsapp}
              </button>

              <button
                onClick={sendSMS}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#0f2544] hover:bg-slate-50"
              >
                <Phone className="h-5 w-5" />
                {text.sms}
              </button>

              <button
                onClick={sendEmail}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#0f2544] hover:bg-slate-50"
              >
                <Mail className="h-5 w-5" />
                {text.emailSend}
              </button>
            </div>
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-blue-700 shadow-sm">
            <p className="text-sm font-black opacity-80">{text.currentAction}</p>
            <h2 className="mt-3 text-3xl font-black">
              {actionLabel(caseItem.current_action)}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-black text-[#0f2544]">
              {text.actionNotes}
            </label>
            <textarea
              value={newActionNotes}
              onChange={(e) => setNewActionNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-blue-500"
            />

            <label className="mb-2 mt-4 block text-sm font-black text-[#0f2544]">
              {text.deduction}
            </label>
            <input
              type="number"
              value={deductionAmount}
              onChange={(e) => setDeductionAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-blue-500"
            />

            <label className="mb-2 mt-4 block text-sm font-black text-[#0f2544]">
              {text.closeReason}
            </label>
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid gap-3">
            <ActionButton
              label={text.addFirstWarning}
              icon={<ShieldAlert className="h-5 w-5" />}
              onClick={() => addCaseAction("first_warning")}
              disabled={saving || caseItem.is_closed}
              color="blue"
            />

            <ActionButton
              label={text.addSecondWarning}
              icon={<AlertTriangle className="h-5 w-5" />}
              onClick={() => {
               setSelectedAction("second_warning");
               setShowActionForm(true);
               }}
              disabled={saving || caseItem.is_closed}
              color="orange"
            />

            <ActionButton
              label={text.addDeduction}
              icon={<Save className="h-5 w-5" />}
             onClick={() => {
             setSelectedAction("deduction");
             setShowActionForm(true);
              }}
              disabled={saving || caseItem.is_closed}
              color="red"
            />

            <ActionButton
              label={text.addFinalWarning}
              icon={<XCircle className="h-5 w-5" />}
              onClick={() => {
             setSelectedAction("final_warning");
             setShowActionForm(true);
              }}
              disabled={saving || caseItem.is_closed}
              color="red"
            />

            <ActionButton
              label={text.addInvestigation}
              icon={<FileText className="h-5 w-5" />}
              onClick={() => {
             setSelectedAction("investigation");
             setShowActionForm(true);
              }}
              disabled={saving || caseItem.is_closed}
              color="black"
            />

            <ActionButton
              label={text.closeCase}
              icon={<CheckCircle className="h-5 w-5" />}
              onClick={() => addCaseAction("close_case")}
              disabled={saving || caseItem.is_closed}
              color="green"
            />
          </div>
        </aside>
      </div>

      {showActionForm && selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-[#0f2544]">
              {actionLabel(selectedAction)}
            </h2>

            <p className="mt-2 text-sm font-bold text-slate-500">
              {new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US")}
            </p>

            <label className="mt-5 block text-sm font-black text-[#0f2544]">
              {text.actionNotes}
            </label>

            <textarea
              value={newActionNotes}
              onChange={(e) => setNewActionNotes(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none"
            />

            {selectedAction === "deduction" && (
              <>
                <label className="mt-4 block text-sm font-black text-[#0f2544]">
                  {text.deduction}
                </label>

                <input
                  type="number"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none"
                />
              </>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={async () => {
                  await addCaseAction(selectedAction);
                  setShowActionForm(false);
                  setSelectedAction(null);
                }}
                className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white"
              >
                {text.save}
              </button>

              <button
                onClick={() => {
                  setShowActionForm(false);
                  setSelectedAction(null);
                }}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black text-slate-500">{label}</p>
      <p className="mt-2 font-black text-[#0f2544]">{value}</p>
    </div>
  );
}

function TextBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-[#0f2544]">{label}</p>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-600">
        {value}
      </div>
    </div>
    
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color: "blue" | "orange" | "red" | "green" | "black";
}) {
  const styles = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    black: "bg-slate-900 hover:bg-black text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 ${styles[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ClockIcon() {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
      <div className="h-2 w-2 rounded-full bg-blue-600" />
    </div>
  );
}