"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import {
  ArrowRight,
  CloudUpload,
  FileText,
  IdCard,
  Image as ImageIcon,
  Save,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react";

type FormData = {
  name: string;
  iqama: string;
  phone: string;
  nationality: string;
  jobTitle: string;
  workLocation: string;
  status: string;
  performance: string;
  startDate: string;
  baseSalary: string;
  target: string;
  halfTarget: string;
  targetDeductions: string;
  vehicleNumber: string;
  platformId: string;
  notes: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type DocumentKey =
  | "idImage"
  | "licenseImage"
  | "employeeImage"
  | "qiwaContract"
  | "vehicleCustody"
  | "otherDocs";

type UploadedDocs = Record<DocumentKey, File | null>;

export default function AddEmployeePage() {
  return (
    <AppLayout
      system="employees"
      titleKey="addEmployeeTitle"
      subtitleKey="addEmployeeSubtitle"
    >
      <AddEmployeeContent />
    </AppLayout>
  );
}

function AddEmployeeContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [form, setForm] = useState<FormData>({
    name: "",
    iqama: "",
    phone: "",
    nationality: "",
    jobTitle: "keetaCourier",
    workLocation: "Keeta",
    status: "active",
    performance: "good",
    startDate: "",
    baseSalary: "",
    target: "",
    halfTarget: "",
    targetDeductions: "",
    vehicleNumber: "",
    platformId: "",
    notes: "",
  });

  const [docs, setDocs] = useState<UploadedDocs>({
    idImage: null,
    licenseImage: null,
    employeeImage: null,
    qiwaContract: null,
    vehicleCustody: null,
    otherDocs: null,
  });

  const jobOptions: SelectOption[] = [
    { value: "keetaCourier", label: isAr ? "مندوب كيتا" : "Keeta Courier" },
    {
      value: "hungerCourier",
      label: isAr ? "مندوب هنجرستيشن" : "HungerStation Courier",
    },
    { value: "supervisor", label: isAr ? "مشرف" : "Supervisor" },
    { value: "mechanic", label: isAr ? "ميكانيكي" : "Mechanic" },
    {
      value: "maintenanceOfficer",
      label: isAr ? "مسؤول الصيانة" : "Maintenance Officer",
    },
  ];

  const workLocationOptions: SelectOption[] = [
    { value: "Keeta", label: "Keeta" },
    { value: "HungerStation", label: "HungerStation" },
    { value: "management", label: isAr ? "الإدارة" : "Management" },
    { value: "maintenance", label: isAr ? "الصيانة" : "Maintenance" },
  ];

  const statusOptions: SelectOption[] = [
    { value: "active", label: isAr ? "نشط" : "Active" },
    { value: "stopped", label: isAr ? "متوقف" : "Stopped" },
    { value: "vacation", label: isAr ? "إجازة" : "Vacation" },
    { value: "outOfService", label: isAr ? "خارج الخدمة" : "Out Of Service" },
  ];

  const performanceOptions: SelectOption[] = [
    { value: "excellent", label: isAr ? "ممتاز" : "Excellent" },
    { value: "good", label: isAr ? "جيد" : "Good" },
    { value: "average", label: isAr ? "متوسط" : "Average" },
    { value: "weak", label: isAr ? "ضعيف" : "Poor" },
  ];

  const isCourier = useMemo(() => {
    return form.jobTitle === "keetaCourier" || form.jobTitle === "hungerCourier";
  }, [form.jobTitle]);

  function updateField(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDoc(key: DocumentKey, file: File | null) {
    setDocs((prev) => ({ ...prev, [key]: file }));
  }

  function saveEmployee() {
    if (!form.name.trim()) {
      alert(isAr ? "اكتب اسم الموظف" : "Enter employee name");
      return;
    }

    if (!form.iqama.trim()) {
      alert(isAr ? "اكتب رقم الإقامة" : "Enter iqama number");
      return;
    }

    alert(isAr ? "تم حفظ بيانات الموظف مؤقتًا" : "Employee saved temporarily");
    window.location.href = "/employees/list";
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f2544]">
            {isAr ? "إضافة موظف" : "Add Employee"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAr
              ? "أدخل بيانات الموظف الأساسية وبيانات العمل والراتب والمستندات."
              : "Enter employee basic, work, salary, and document details."}
          </p>
        </div>

        <Link
          href="/employees/list"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowRight className="h-5 w-5" />
          {isAr ? "الرجوع للقائمة" : "Back To List"}
        </Link>
      </div>

      <FormSection
        title={isAr ? "البيانات الأساسية" : "Basic Information"}
        icon={<IdCard className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Input label={isAr ? "اسم الموظف" : "Employee Name"} value={form.name} onChange={(v) => updateField("name", v)} required />
          <Input label={isAr ? "رقم الإقامة" : "Iqama Number"} value={form.iqama} onChange={(v) => updateField("iqama", v)} required />
          <Input label={isAr ? "رقم الجوال" : "Phone"} value={form.phone} onChange={(v) => updateField("phone", v)} />
          <Input label={isAr ? "الجنسية" : "Nationality"} value={form.nationality} onChange={(v) => updateField("nationality", v)} />
          <Input label={isAr ? "تاريخ بداية العمل - اختياري" : "Start Date - Optional"} type="date" value={form.startDate} onChange={(v) => updateField("startDate", v)} />
        </div>
      </FormSection>

      <FormSection
        title={isAr ? "بيانات العمل" : "Work Information"}
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Select label={isAr ? "المسمى الوظيفي" : "Job Title"} value={form.jobTitle} onChange={(v) => updateField("jobTitle", v)} options={jobOptions} />
          <Select label={isAr ? "موقع العمل" : "Work Location"} value={form.workLocation} onChange={(v) => updateField("workLocation", v)} options={workLocationOptions} />
          <Select label={isAr ? "الحالة" : "Status"} value={form.status} onChange={(v) => updateField("status", v)} options={statusOptions} />
          <Select label={isAr ? "الأداء" : "Performance"} value={form.performance} onChange={(v) => updateField("performance", v)} options={performanceOptions} />
          <Input label={isAr ? "رقم المركبة / الدباب" : "Vehicle Number"} value={form.vehicleNumber} onChange={(v) => updateField("vehicleNumber", v)} />
          <Input label={isAr ? "رقم هوية كيتا / هنقر" : "Keeta / Hunger ID"} value={form.platformId} onChange={(v) => updateField("platformId", v)} />
        </div>
      </FormSection>

      <FormSection
        title={isAr ? "بيانات الراتب" : "Salary Details"}
        icon={<Wallet className="h-5 w-5" />}
      >
        <div className="mb-4 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">
          {isCourier
            ? isAr
              ? "تم تحديد الموظف كمندوب، لذلك تظهر بيانات التارجت والاستقطاعات."
              : "Courier selected, target and deductions fields are shown."
            : isAr
              ? "هذا المسمى ليس مندوبًا، يمكن تسجيل الراتب الأساسي فقط."
              : "This job title is not courier, base salary only is enough."}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Input label={isAr ? "الراتب الأساسي" : "Base Salary"} value={form.baseSalary} onChange={(v) => updateField("baseSalary", v)} />

          {isCourier && (
            <>
              <Input label={isAr ? "التارجت" : "Target"} value={form.target} onChange={(v) => updateField("target", v)} />
              <Input label={isAr ? "نصف التارجت" : "Half Target"} value={form.halfTarget} onChange={(v) => updateField("halfTarget", v)} />
              <Input label={isAr ? "استقطاعات التارجت" : "Target Deductions"} value={form.targetDeductions} onChange={(v) => updateField("targetDeductions", v)} />
            </>
          )}
        </div>
      </FormSection>

      <FormSection
        title={isAr ? "إرفاق المستندات" : "Upload Documents"}
        icon={<CloudUpload className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <UploadBox label={isAr ? "صورة الهوية / الإقامة" : "ID / Iqama Image"} file={docs.idImage} onChange={(file) => updateDoc("idImage", file)} icon={<IdCard className="h-7 w-7" />} />
          <UploadBox label={isAr ? "صورة رخصة القيادة" : "Driving License Image"} file={docs.licenseImage} onChange={(file) => updateDoc("licenseImage", file)} icon={<FileText className="h-7 w-7" />} />
          <UploadBox label={isAr ? "صورة المندوب" : "Employee Photo"} file={docs.employeeImage} onChange={(file) => updateDoc("employeeImage", file)} icon={<ImageIcon className="h-7 w-7" />} />
          <UploadBox label={isAr ? "عقد قوى" : "Qiwa Contract"} file={docs.qiwaContract} onChange={(file) => updateDoc("qiwaContract", file)} icon={<FileText className="h-7 w-7" />} />
          <UploadBox label={isAr ? "عهدة استلام مركبة" : "Vehicle Custody Form"} file={docs.vehicleCustody} onChange={(file) => updateDoc("vehicleCustody", file)} icon={<FileText className="h-7 w-7" />} />
          <UploadBox label={isAr ? "مستندات أخرى" : "Other Documents"} file={docs.otherDocs} onChange={(file) => updateDoc("otherDocs", file)} icon={<Upload className="h-7 w-7" />} />
        </div>
      </FormSection>

      <FormSection title={isAr ? "ملاحظات" : "Notes"} icon={<FileText className="h-5 w-5" />}>
        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
          placeholder={isAr ? "اكتب أي ملاحظات إضافية..." : "Write any additional notes..."}
        />
      </FormSection>

      <div className="mt-6 flex justify-end gap-3">
        <Link
          href="/employees/list"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
        >
          {isAr ? "إلغاء" : "Cancel"}
        </Link>

        <button
          onClick={saveEmployee}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700"
        >
          <Save className="h-5 w-5" />
          {isAr ? "حفظ الموظف" : "Save Employee"}
        </button>
      </div>
    </>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-[#0f2544]">{title}</h2>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          {icon}
        </div>
      </div>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
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

function UploadBox({
  label,
  file,
  onChange,
  icon,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  icon: ReactNode;
}) {
  return (
    <label className="cursor-pointer rounded-3xl border border-dashed border-blue-300 bg-blue-50/30 p-5 transition hover:bg-blue-50">
      <input
        type="file"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-extrabold text-[#0f2544]">{label}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {file ? file.name : "PNG, JPG, PDF"}
          </p>
        </div>
      </div>
    </label>
  );
}