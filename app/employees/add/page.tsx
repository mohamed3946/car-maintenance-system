"use client";

import { supabase } from "../../lib/supabase";
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import * as XLSX from "xlsx";
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
  email: string;
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
  keetaId: string;
  hungerId: string;
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

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "",
    iqama: "",
    phone: "",
    email: "",
    nationality: "",
    jobTitle: "deliveryCourier",
    workLocation: "Keeta",
    status: "active",
    performance: "good",
    startDate: "",
    baseSalary: "",
    target: "",
    halfTarget: "",
    targetDeductions: "",
    vehicleNumber: "",
    keetaId: "",
    hungerId: "",
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
    {
      value: "deliveryCourier",
      label: isAr ? "مندوب توصيل" : "Delivery Courier",
    },
    { value: "supervisor", label: isAr ? "مشرف" : "Supervisor" },
    { value: "mechanic", label: isAr ? "ميكانيكي" : "Mechanic" },
    {
      value: "maintenanceOfficer",
      label: isAr ? "مسؤول الصيانة" : "Maintenance Officer",
    },
  ];

  const workLocationOptions: SelectOption[] =
    form.jobTitle === "deliveryCourier"
      ? [
          { value: "Keeta", label: "Keeta" },
          { value: "HungerStation", label: "HungerStation" },
          {
            value: "KeetaAndHungerStation",
            label: isAr ? "كيتا وهنجرستيشن معًا" : "Keeta & HungerStation",
          },
        ]
      : form.jobTitle === "supervisor"
        ? [{ value: "management", label: isAr ? "الإدارة" : "Management" }]
        : [
            {
              value: "maintenance",
              label: isAr ? "الصيانة" : "Maintenance",
            },
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
    return form.jobTitle === "deliveryCourier";
  }, [form.jobTitle]);

  const showKeetaId =
    form.jobTitle === "deliveryCourier" &&
    (form.workLocation === "Keeta" ||
      form.workLocation === "KeetaAndHungerStation");

  const showHungerId =
    form.jobTitle === "deliveryCourier" &&
    (form.workLocation === "HungerStation" ||
      form.workLocation === "KeetaAndHungerStation");

  function updateField(key: keyof FormData, value: string) {
    if (key === "jobTitle") {
      let nextWorkLocation = form.workLocation;

      if (value === "deliveryCourier") {
        nextWorkLocation = "Keeta";
      } else if (value === "supervisor") {
        nextWorkLocation = "management";
      } else if (value === "mechanic" || value === "maintenanceOfficer") {
        nextWorkLocation = "maintenance";
      }

      setForm((prev) => ({
        ...prev,
        jobTitle: value,
        workLocation: nextWorkLocation,
      }));

      return;
    }

    if (key === "workLocation") {
      setForm((prev) => ({
        ...prev,
        workLocation: value,
        keetaId:
          value === "HungerStation" ? "" : prev.keetaId,
        hungerId:
          value === "Keeta" ? "" : prev.hungerId,
      }));

      return;
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDoc(key: DocumentKey, file: File | null) {
    setDocs((prev) => ({ ...prev, [key]: file }));
  }

  async function importEmployeesFromExcel(file: File) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    const employees = rows.map((row) => {
      const jobTitleRaw = String(row["Job Title"] || "").toLowerCase();

      let jobTitle = "deliveryCourier";
      let workLocation = "Keeta";

      if (jobTitleRaw.includes("supervisor")) {
        jobTitle = "supervisor";
        workLocation = "management";
      } else if (jobTitleRaw.includes("mechanic")) {
        jobTitle = "mechanic";
        workLocation = "maintenance";
      }

      const keetaId = row["Keeta ID"] ? String(row["Keeta ID"]).trim() : null;
      const hungerId = row["HungerStation ID"]
        ? String(row["HungerStation ID"]).trim()
        : null;

      if (jobTitle === "deliveryCourier") {
        if (keetaId && hungerId) {
          workLocation = "KeetaAndHungerStation";
        } else if (hungerId) {
          workLocation = "HungerStation";
        } else {
          workLocation = "Keeta";
        }
      }

      return {
        name: String(row["Employee Name"] || "").trim(),
        iqama: String(row["Iqama Number"] || "").trim(),
        phone: row["Phone"] ? String(row["Phone"]).trim() : null,
        email: row["Email"] ? String(row["Email"]).trim() : null,
        nationality: row["Nationality"] ? String(row["Nationality"]).trim() : null,
        job_title: jobTitle,
        work_location: workLocation,
        status: row["Status"] ? String(row["Status"]).trim() : "active",
        performance: "good",
        base_salary: row["Base Salary"] ? Number(row["Base Salary"]) : null,
        platform_id: keetaId || hungerId || null,
        keeta_id: keetaId,
        hunger_id: hungerId,
      };
    });

    const validEmployees = employees.filter((e) => e.name && e.iqama);

    if (validEmployees.length === 0) {
      alert(isAr ? "لا توجد بيانات صالحة في الملف" : "No valid employees found");
      return;
    }

    const { error } = await supabase.from("employees").insert(validEmployees);

    if (error) {
      console.error("IMPORT EMPLOYEES ERROR:", error);
      alert(isAr ? `فشل رفع الملف: ${error.message}` : `Import failed: ${error.message}`);
      return;
    }

    alert(
      isAr
        ? `تم إضافة ${validEmployees.length} موظف بنجاح`
        : `${validEmployees.length} employees imported successfully`
    );

    window.location.href = "/employees/list";
  }

  async function uploadEmployeeFile(
    file: File | null,
    employeeId: string,
    folder: string
  ) {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${employeeId}/${folder}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("employee-documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("UPLOAD FILE ERROR:", error);
      throw error;
    }

    const { data } = supabase.storage
      .from("employee-documents")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function saveEmployee() {
    if (!form.name.trim()) {
      alert(isAr ? "اكتب اسم الموظف" : "Enter employee name");
      return;
    }

    if (!form.iqama.trim()) {
      alert(isAr ? "اكتب رقم الإقامة" : "Enter iqama number");
      return;
    }

    if (form.jobTitle === "deliveryCourier") {
      if (showKeetaId && !form.keetaId.trim()) {
        alert(isAr ? "اكتب رقم ID كيتا" : "Enter Keeta ID");
        return;
      }

      if (showHungerId && !form.hungerId.trim()) {
        alert(isAr ? "اكتب رقم ID هنجرستيشن" : "Enter HungerStation ID");
        return;
      }
    }

    setSaving(true);

    const employeeData = {
      name: form.name.trim(),
      iqama: form.iqama.trim(),
      phone: form.phone || null,
      email: form.email.trim() || null,
      nationality: form.nationality || null,
      job_title: form.jobTitle,
      work_location: form.workLocation,
      status: form.status,
      performance: form.performance,
      start_date: form.startDate || null,
      base_salary: form.baseSalary ? Number(form.baseSalary) : null,
      target: form.target ? Number(form.target) : null,
      half_target: form.halfTarget ? Number(form.halfTarget) : null,
      target_deductions: form.targetDeductions ? Number(form.targetDeductions) : null,
      vehicle_number: form.vehicleNumber || null,
      platform_id:
        (showKeetaId ? form.keetaId.trim() : "") ||
        (showHungerId ? form.hungerId.trim() : "") ||
        null,
      keeta_id: showKeetaId ? form.keetaId.trim() || null : null,
      hunger_id: showHungerId ? form.hungerId.trim() || null : null,
      notes: form.notes || null,
    };

    const { data, error } = await supabase
      .from("employees")
      .insert(employeeData)
      .select()
      .single();

    if (error) {
      console.error("SAVE EMPLOYEE ERROR:", error);
      alert(
        isAr
          ? `فشل حفظ الموظف: ${error.message}`
          : `Failed to save employee: ${error.message}`
      );
      setSaving(false);
      return;
    }

    try {
      const employeeId = data.id;

      const photoUrl = await uploadEmployeeFile(
        docs.employeeImage,
        employeeId,
        "employee-photo"
      );

      const iqamaUrl = await uploadEmployeeFile(
        docs.idImage,
        employeeId,
        "iqama"
      );

      const licenseUrl = await uploadEmployeeFile(
        docs.licenseImage,
        employeeId,
        "license"
      );

      const qiwaUrl = await uploadEmployeeFile(
        docs.qiwaContract,
        employeeId,
        "qiwa-contract"
      );

      const custodyUrl = await uploadEmployeeFile(
        docs.vehicleCustody,
        employeeId,
        "vehicle-custody"
      );

      const otherDocsUrl = await uploadEmployeeFile(
        docs.otherDocs,
        employeeId,
        "other-docs"
      );

      await supabase
        .from("employees")
        .update({
          photo_url: photoUrl,
          iqama_file_url: iqamaUrl,
          license_file_url: licenseUrl,
          qiwa_file_url: qiwaUrl,
          custody_file_url: custodyUrl,
          other_docs_url: otherDocsUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", employeeId);
    } catch (uploadError) {
      console.error("DOCUMENT UPLOAD ERROR:", uploadError);
      alert(
        isAr
          ? "تم حفظ الموظف، لكن حدث خطأ أثناء رفع بعض المستندات"
          : "Employee saved, but some documents failed to upload"
      );
    }

    alert(isAr ? "تم حفظ الموظف بنجاح" : "Employee saved successfully");
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

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-green-700">
            {isAr ? "رفع Excel" : "Import Excel"}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importEmployeesFromExcel(file);
              }}
            />
          </label>

          <Link
            href="/employees/list"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowRight className="h-5 w-5" />
            {isAr ? "الرجوع للقائمة" : "Back To List"}
          </Link>
        </div>
      </div>

      <FormSection
        title={isAr ? "البيانات الأساسية" : "Basic Information"}
        icon={<IdCard className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Input label={isAr ? "اسم الموظف" : "Employee Name"} value={form.name} onChange={(v) => updateField("name", v)} required />
          <Input label={isAr ? "رقم الإقامة" : "Iqama Number"} value={form.iqama} onChange={(v) => updateField("iqama", v)} required />
          <Input label={isAr ? "رقم الجوال" : "Phone"} value={form.phone} onChange={(v) => updateField("phone", v)} />
          <Input label={isAr ? "البريد الإلكتروني" : "Email"} type="email" value={form.email} onChange={(v) => updateField("email", v)} />
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

          {showKeetaId && (
            <Input
              label={isAr ? "رقم ID كيتا" : "Keeta ID"}
              value={form.keetaId}
              onChange={(v) => updateField("keetaId", v)}
              required
            />
          )}

          {showHungerId && (
            <Input
              label={isAr ? "رقم ID هنجرستيشن" : "HungerStation ID"}
              value={form.hungerId}
              onChange={(v) => updateField("hungerId", v)}
              required
            />
          )}
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
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {saving
            ? isAr
              ? "جاري الحفظ..."
              : "Saving..."
            : isAr
              ? "حفظ الموظف"
              : "Save Employee"}
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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