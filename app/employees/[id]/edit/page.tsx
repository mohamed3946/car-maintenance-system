"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "../../../../components/AppLayout";
import { supabase } from "../../../lib/supabase";
import {
  ArrowRight,
  CloudUpload,
  FileText,
  IdCard,
  Image as ImageIcon,
  Save,
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
  photoUrl: string;
  iqamaFileUrl: string;
  licenseFileUrl: string;
  qiwaFileUrl: string;
  custodyFileUrl: string;
  otherDocsUrl: string;
};

type DocsData = {
  employeeImage: File | null;
  idImage: File | null;
  licenseImage: File | null;
  qiwaContract: File | null;
  vehicleCustody: File | null;
  otherDocs: File | null;
};

type Option = {
  value: string;
  label: string;
};

export default function EditEmployeePage() {
  return (
    <AppLayout system="employees">
      <EditEmployeeContent />
    </AppLayout>
  );
}

function EditEmployeeContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const params = useParams();
  const router = useRouter();
  const employeeId = String(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [docs, setDocs] = useState<DocsData>({
    employeeImage: null,
    idImage: null,
    licenseImage: null,
    qiwaContract: null,
    vehicleCustody: null,
    otherDocs: null,
  });

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
    photoUrl: "",
    iqamaFileUrl: "",
    licenseFileUrl: "",
    qiwaFileUrl: "",
    custodyFileUrl: "",
    otherDocsUrl: "",
  });

  const showPlatformId =
    form.jobTitle === "keetaCourier" || form.jobTitle === "hungerCourier";

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  async function loadEmployee() {
    setLoading(true);

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employeeId)
      .single();

    if (error) {
      console.error(error);
      alert(isAr ? "لم يتم العثور على الموظف" : "Employee not found");
      setLoading(false);
      return;
    }

    setForm({
      name: data.name || "",
      iqama: data.iqama || "",
      phone: data.phone || "",
      nationality: data.nationality || "",
      jobTitle: data.job_title || "keetaCourier",
      workLocation: data.work_location || "Keeta",
      status: data.status || "active",
      performance: data.performance || "good",
      startDate: data.start_date || "",
      baseSalary: data.base_salary ? String(data.base_salary) : "",
      target: data.target ? String(data.target) : "",
      halfTarget: data.half_target ? String(data.half_target) : "",
      targetDeductions: data.target_deductions ? String(data.target_deductions) : "",
      vehicleNumber: data.vehicle_number || "",
      platformId: data.platform_id || data.keeta_id || data.hunger_id || "",
      notes: data.notes || "",
      photoUrl: data.photo_url || "",
      iqamaFileUrl: data.iqama_file_url || "",
      licenseFileUrl: data.license_file_url || "",
      qiwaFileUrl: data.qiwa_file_url || "",
      custodyFileUrl: data.custody_file_url || "",
      otherDocsUrl: data.other_docs_url || "",
    });

    setLoading(false);
  }

  function updateField(key: keyof FormData, value: string) {
    if (key === "jobTitle") {
      let nextWorkLocation = form.workLocation;
      let nextPlatformId = form.platformId;

      if (value === "keetaCourier") {
        nextWorkLocation = "Keeta";
      } else if (value === "hungerCourier") {
        nextWorkLocation = "HungerStation";
      } else if (value === "supervisor") {
        nextWorkLocation = "management";
        nextPlatformId = "";
      } else if (value === "mechanic" || value === "maintenanceOfficer") {
        nextWorkLocation = "maintenance";
        nextPlatformId = "";
      }

      setForm((prev) => ({
        ...prev,
        jobTitle: value,
        workLocation: nextWorkLocation,
        platformId: nextPlatformId,
      }));

      return;
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDoc(key: keyof DocsData, file: File | null) {
    setDocs((prev) => ({ ...prev, [key]: file }));
  }

  async function uploadEmployeeFile(file: File | null, folder: string) {
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

    if (showPlatformId && !form.platformId.trim()) {
      alert(isAr ? "اكتب رقم ID المنصة" : "Enter platform ID");
      return;
    }

    setSaving(true);

    try {
      const photoUrl = await uploadEmployeeFile(docs.employeeImage, "employee-photo");
      const iqamaUrl = await uploadEmployeeFile(docs.idImage, "iqama");
      const licenseUrl = await uploadEmployeeFile(docs.licenseImage, "license");
      const qiwaUrl = await uploadEmployeeFile(docs.qiwaContract, "qiwa-contract");
      const custodyUrl = await uploadEmployeeFile(docs.vehicleCustody, "vehicle-custody");
      const otherDocsUrl = await uploadEmployeeFile(docs.otherDocs, "other-docs");

      const platformId =
        form.jobTitle === "keetaCourier" || form.jobTitle === "hungerCourier"
          ? form.platformId.trim()
          : null;

      const { error } = await supabase
        .from("employees")
        .update({
          name: form.name.trim(),
          iqama: form.iqama.trim(),
          phone: form.phone || null,
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

          platform_id: platformId,
          keeta_id: form.jobTitle === "keetaCourier" ? form.platformId.trim() : null,
          hunger_id: form.jobTitle === "hungerCourier" ? form.platformId.trim() : null,

          notes: form.notes || null,
          photo_url: photoUrl || form.photoUrl || null,
          iqama_file_url: iqamaUrl || form.iqamaFileUrl || null,
          license_file_url: licenseUrl || form.licenseFileUrl || null,
          qiwa_file_url: qiwaUrl || form.qiwaFileUrl || null,
          custody_file_url: custodyUrl || form.custodyFileUrl || null,
          other_docs_url: otherDocsUrl || form.otherDocsUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", employeeId);

      setSaving(false);

      if (error) {
        console.error(error);
        alert(isAr ? "فشل حفظ التعديلات" : "Failed to save changes");
        return;
      }

      alert(isAr ? "تم حفظ التعديلات بنجاح" : "Changes saved successfully");
      router.push(`/employees/${employeeId}`);
    } catch (error) {
      console.error("SAVE WITH FILES ERROR:", error);
      alert(isAr ? "حدث خطأ أثناء رفع المرفقات" : "Error uploading documents");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center font-bold text-slate-500 shadow-sm">
        {isAr ? "جاري تحميل بيانات الموظف..." : "Loading employee data..."}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f2544]">
            {isAr ? "تعديل بيانات الموظف" : "Edit Employee"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAr
              ? "تعديل البيانات الأساسية وبيانات العمل والراتب والمرفقات."
              : "Edit basic, work, salary, and document information."}
          </p>
        </div>

        <Link
          href={`/employees/${employeeId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowRight className="h-5 w-5" />
          {isAr ? "الرجوع للتفاصيل" : "Back To Details"}
        </Link>
      </div>

      <Section title={isAr ? "البيانات الأساسية" : "Basic Information"} icon={<IdCard />}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Input label={isAr ? "اسم الموظف" : "Employee Name"} value={form.name} onChange={(v) => updateField("name", v)} />
          <Input label={isAr ? "رقم الإقامة" : "Iqama Number"} value={form.iqama} onChange={(v) => updateField("iqama", v)} />
          <Input label={isAr ? "رقم الجوال" : "Phone Number"} value={form.phone} onChange={(v) => updateField("phone", v)} />
          <Input label={isAr ? "الجنسية" : "Nationality"} value={form.nationality} onChange={(v) => updateField("nationality", v)} />
          <Input label={isAr ? "تاريخ بداية العمل" : "Start Date"} type="date" value={form.startDate} onChange={(v) => updateField("startDate", v)} />
        </div>
      </Section>

      <Section title={isAr ? "بيانات العمل" : "Work Information"} icon={<FileText />}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Select label={isAr ? "المسمى الوظيفي" : "Job Title"} value={form.jobTitle} onChange={(v) => updateField("jobTitle", v)} options={jobOptions(isAr)} />
          <Select label={isAr ? "موقع العمل" : "Work Location"} value={form.workLocation} onChange={(v) => updateField("workLocation", v)} options={locationOptions(isAr)} disabled />
          <Select label={isAr ? "الحالة" : "Status"} value={form.status} onChange={(v) => updateField("status", v)} options={statusOptions(isAr)} />
          <Select label={isAr ? "الأداء" : "Performance"} value={form.performance} onChange={(v) => updateField("performance", v)} options={performanceOptions(isAr)} />

          <Input label={isAr ? "رقم المركبة / الدباب" : "Vehicle Number"} value={form.vehicleNumber} onChange={(v) => updateField("vehicleNumber", v)} />

          {showPlatformId && (
            <Input
              label={
                form.jobTitle === "keetaCourier"
                  ? isAr
                    ? "رقم ID كيتا"
                    : "Keeta ID"
                  : isAr
                    ? "رقم ID هنجرستيشن"
                    : "HungerStation ID"
              }
              value={form.platformId}
              onChange={(v) => updateField("platformId", v)}
            />
          )}
        </div>
      </Section>

      <Section title={isAr ? "بيانات الراتب" : "Salary Details"} icon={<Wallet />}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Input label={isAr ? "الراتب الأساسي" : "Base Salary"} value={form.baseSalary} onChange={(v) => updateField("baseSalary", v)} />
          <Input label={isAr ? "التارجت" : "Target"} value={form.target} onChange={(v) => updateField("target", v)} />
          <Input label={isAr ? "نصف التارجت" : "Half Target"} value={form.halfTarget} onChange={(v) => updateField("halfTarget", v)} />
          <Input label={isAr ? "استقطاعات التارجت" : "Target Deductions"} value={form.targetDeductions} onChange={(v) => updateField("targetDeductions", v)} />
        </div>
      </Section>

      <Section title={isAr ? "تعديل المرفقات" : "Edit Documents"} icon={<CloudUpload />}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <UploadBox label={isAr ? "صورة الموظف" : "Employee Photo"} currentUrl={form.photoUrl} file={docs.employeeImage} onChange={(file) => updateDoc("employeeImage", file)} icon={<ImageIcon />} isAr={isAr} />
          <UploadBox label={isAr ? "صورة الهوية / الإقامة" : "ID / Iqama Image"} currentUrl={form.iqamaFileUrl} file={docs.idImage} onChange={(file) => updateDoc("idImage", file)} icon={<IdCard />} isAr={isAr} />
          <UploadBox label={isAr ? "صورة رخصة القيادة" : "Driving License Image"} currentUrl={form.licenseFileUrl} file={docs.licenseImage} onChange={(file) => updateDoc("licenseImage", file)} icon={<FileText />} isAr={isAr} />
          <UploadBox label={isAr ? "عقد قوى" : "Qiwa Contract"} currentUrl={form.qiwaFileUrl} file={docs.qiwaContract} onChange={(file) => updateDoc("qiwaContract", file)} icon={<FileText />} isAr={isAr} />
          <UploadBox label={isAr ? "عهدة استلام مركبة" : "Vehicle Custody Form"} currentUrl={form.custodyFileUrl} file={docs.vehicleCustody} onChange={(file) => updateDoc("vehicleCustody", file)} icon={<FileText />} isAr={isAr} />
          <UploadBox label={isAr ? "مستندات أخرى" : "Other Documents"} currentUrl={form.otherDocsUrl} file={docs.otherDocs} onChange={(file) => updateDoc("otherDocs", file)} icon={<Upload />} isAr={isAr} />
        </div>
      </Section>

      <Section title={isAr ? "ملاحظات" : "Notes"} icon={<FileText />}>
        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
          placeholder={isAr ? "اكتب الملاحظات..." : "Write notes..."}
        />
      </Section>

      <div className="mt-6 flex justify-end gap-3">
        <Link
          href={`/employees/${employeeId}`}
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
          {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ التعديلات" : "Save Changes"}
        </button>
      </div>
    </>
  );
}

function jobOptions(isAr: boolean): Option[] {
  return [
    { value: "keetaCourier", label: isAr ? "مندوب كيتا" : "Keeta Courier" },
    { value: "hungerCourier", label: isAr ? "مندوب هنجرستيشن" : "HungerStation Courier" },
    { value: "supervisor", label: isAr ? "مشرف" : "Supervisor" },
    { value: "mechanic", label: isAr ? "ميكانيكي" : "Mechanic" },
    { value: "maintenanceOfficer", label: isAr ? "مسؤول الصيانة" : "Maintenance Officer" },
  ];
}

function locationOptions(isAr: boolean): Option[] {
  return [
    { value: "Keeta", label: "Keeta" },
    { value: "HungerStation", label: "HungerStation" },
    { value: "management", label: isAr ? "الإدارة" : "Management" },
    { value: "maintenance", label: isAr ? "الصيانة" : "Maintenance" },
  ];
}

function statusOptions(isAr: boolean): Option[] {
  return [
    { value: "active", label: isAr ? "نشط" : "Active" },
    { value: "stopped", label: isAr ? "متوقف" : "Stopped" },
    { value: "vacation", label: isAr ? "إجازة" : "Vacation" },
    { value: "outOfService", label: isAr ? "خارج الخدمة" : "Out Of Service" },
  ];
}

function performanceOptions(isAr: boolean): Option[] {
  return [
    { value: "excellent", label: isAr ? "ممتاز" : "Excellent" },
    { value: "good", label: isAr ? "جيد" : "Good" },
    { value: "average", label: isAr ? "متوسط" : "Average" },
    { value: "weak", label: isAr ? "ضعيف" : "Poor" },
  ];
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
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
  options: Option[];
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
  currentUrl,
  file,
  onChange,
  icon,
  isAr,
}: {
  label: string;
  currentUrl: string;
  file: File | null;
  onChange: (file: File | null) => void;
  icon: React.ReactNode;
  isAr: boolean;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-blue-300 bg-blue-50/30 p-5">
      <div className="mb-4 flex items-center gap-4">
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

      <div className="flex flex-wrap gap-2">
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-extrabold text-green-700 hover:bg-green-100"
          >
            {isAr ? "عرض الحالي" : "View Current"}
          </a>
        )}

        <label className="cursor-pointer rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-blue-700">
          {isAr ? "تغيير الملف" : "Change File"}
          <input
            type="file"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />
        </label>

        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100"
          >
            {isAr ? "إلغاء الاختيار" : "Remove Selection"}
          </button>
        )}
      </div>
    </div>
  );
}