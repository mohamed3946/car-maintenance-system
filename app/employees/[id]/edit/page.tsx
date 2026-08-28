"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "../../../../components/AppLayout";
import { supabase } from "../../../lib/supabase";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileText,
  IdCard,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  Wallet,
} from "lucide-react";

type FormData = {
  name: string;
  iqama: string;
  iqamaExpiryDate: string;
  phone: string;
  email: string;
  nationality: string;
  jobTitle: string;
  workLocation: string;
  startDate: string;
  baseSalary: string;
  target: string;
  halfTarget: string;
  targetDeductions: string;
  vehicleNumber: string;
  keetaId: string;
  hungerId: string;
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

type SelectOption = {
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
    iqamaExpiryDate: "",
    phone: "",
    email: "",
    nationality: "",
    jobTitle: "deliveryCourier",
    workLocation: "Keeta",
    startDate: "",
    baseSalary: "",
    target: "",
    halfTarget: "",
    targetDeductions: "",
    vehicleNumber: "",
    keetaId: "",
    hungerId: "",
    notes: "",

    photoUrl: "",
    iqamaFileUrl: "",
    licenseFileUrl: "",
    qiwaFileUrl: "",
    custodyFileUrl: "",
    otherDocsUrl: "",
  });

  const jobOptions: SelectOption[] = [
    {
      value: "deliveryCourier",
      label: isAr ? "مندوب توصيل" : "Delivery Courier",
    },
    {
      value: "supervisor",
      label: isAr ? "مشرف" : "Supervisor",
    },
    {
      value: "accountant",
      label: isAr ? "محاسب" : "Accountant",
    },
    {
      value: "mechanic",
      label: isAr ? "ميكانيكي" : "Mechanic",
    },
    {
      value: "maintenanceOfficer",
      label: isAr ? "مسؤول الصيانة" : "Maintenance Officer",
    },
  ];

  const nationalityOptions: SelectOption[] = [
    { value: "", label: isAr ? "اختر الجنسية" : "Select Nationality" },
    { value: "Bangladesh", label: isAr ? "بنجلاديش" : "Bangladesh" },
    { value: "Pakistan", label: isAr ? "باكستان" : "Pakistan" },
    { value: "India", label: isAr ? "الهند" : "India" },
    { value: "Egypt", label: isAr ? "مصر" : "Egypt" },
    { value: "Sudan", label: isAr ? "السودان" : "Sudan" },
    { value: "Yemen", label: isAr ? "اليمن" : "Yemen" },
    { value: "Saudi Arabia", label: isAr ? "السعودية" : "Saudi Arabia" },
  ];

  const workLocationOptions: SelectOption[] =
    form.jobTitle === "deliveryCourier"
      ? [
          { value: "Keeta", label: isAr ? "كيتا" : "Keeta" },
          {
            value: "HungerStation",
            label: isAr ? "هنجرستيشن" : "HungerStation",
          },
          {
            value: "KeetaAndHungerStation",
            label: isAr
              ? "كيتا وهنجرستيشن معًا"
              : "Keeta & HungerStation",
          },
        ]
      : form.jobTitle === "mechanic" ||
          form.jobTitle === "maintenanceOfficer"
        ? [
            {
              value: "maintenance",
              label: isAr ? "الصيانة" : "Maintenance",
            },
          ]
        : [
            {
              value: "management",
              label: isAr ? "الإدارة" : "Management",
            },
          ];

  const isCourier = useMemo(() => {
    return form.jobTitle === "deliveryCourier";
  }, [form.jobTitle]);

  const showKeetaId =
    isCourier &&
    (form.workLocation === "Keeta" ||
      form.workLocation === "KeetaAndHungerStation");

  const showHungerId =
    isCourier &&
    (form.workLocation === "HungerStation" ||
      form.workLocation === "KeetaAndHungerStation");

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
      console.error("LOAD EMPLOYEE ERROR:", error);
      alert(isAr ? "لم يتم العثور على الموظف" : "Employee not found");
      setLoading(false);
      return;
    }

    const normalizedJobTitle =
      data.job_title === "keetaCourier" ||
      data.job_title === "hungerCourier" ||
      data.job_title === "deliveryCourier"
        ? "deliveryCourier"
        : data.job_title || "deliveryCourier";

    const normalizedWorkLocation =
      data.keeta_id && data.hunger_id
        ? "KeetaAndHungerStation"
        : data.hunger_id
          ? "HungerStation"
          : data.keeta_id
            ? "Keeta"
            : data.work_location === "KeetaAndHungerStation"
              ? "KeetaAndHungerStation"
              : data.work_location || "Keeta";

    setForm({
      name: data.name || "",
      iqama: data.iqama || "",
      iqamaExpiryDate: data.iqama_expiry_date || "",
      phone: data.phone || "",
      email: data.email || "",
      nationality: normalizeNationalityValue(data.nationality),
      jobTitle: normalizedJobTitle,
      workLocation: normalizedWorkLocation,
      startDate: data.start_date || "",
      baseSalary: data.base_salary ? String(data.base_salary) : "",
      target: data.target ? String(data.target) : "",
      halfTarget: data.half_target ? String(data.half_target) : "",
      targetDeductions: data.target_deductions
        ? String(data.target_deductions)
        : "",
      vehicleNumber: data.vehicle_number || "",
      keetaId:
        data.keeta_id ||
        (data.job_title === "keetaCourier" ? data.platform_id : "") ||
        "",
      hungerId:
        data.hunger_id ||
        (data.job_title === "hungerCourier" ? data.platform_id : "") ||
        "",
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

      if (value === "deliveryCourier") {
        if (
          !["Keeta", "HungerStation", "KeetaAndHungerStation"].includes(
            nextWorkLocation
          )
        ) {
          nextWorkLocation = "Keeta";
        }
      } else if (
        value === "supervisor" ||
        value === "accountant"
      ) {
        nextWorkLocation = "management";
      } else if (
        value === "mechanic" ||
        value === "maintenanceOfficer"
      ) {
        nextWorkLocation = "maintenance";
      }

      setForm((prev) => ({
        ...prev,
        jobTitle: value,
        workLocation: nextWorkLocation,
        keetaId: value === "deliveryCourier" ? prev.keetaId : "",
        hungerId: value === "deliveryCourier" ? prev.hungerId : "",
      }));

      return;
    }

    if (key === "workLocation") {
      setForm((prev) => ({
        ...prev,
        workLocation: value,
        keetaId: value === "HungerStation" ? "" : prev.keetaId,
        hungerId: value === "Keeta" ? "" : prev.hungerId,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateDoc(key: keyof DocsData, file: File | null) {
    setDocs((prev) => ({
      ...prev,
      [key]: file,
    }));
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

    if (!form.iqamaExpiryDate) {
      alert(
        isAr
          ? "حدد تاريخ انتهاء الإقامة"
          : "Select Iqama expiry date"
      );
      return;
    }

    if (!form.nationality) {
      alert(
        isAr
          ? "اختر جنسية الموظف"
          : "Select employee nationality"
      );
      return;
    }

    if (showKeetaId && !form.keetaId.trim()) {
      alert(isAr ? "اكتب رقم ID كيتا" : "Enter Keeta ID");
      return;
    }

    if (showHungerId && !form.hungerId.trim()) {
      alert(
        isAr
          ? "اكتب رقم ID هنجرستيشن"
          : "Enter HungerStation ID"
      );
      return;
    }

    setSaving(true);

    try {
      const photoUrl = await uploadEmployeeFile(
        docs.employeeImage,
        "employee-photo"
      );

      const iqamaUrl = await uploadEmployeeFile(
        docs.idImage,
        "iqama"
      );

      const licenseUrl = await uploadEmployeeFile(
        docs.licenseImage,
        "license"
      );

      const qiwaUrl = await uploadEmployeeFile(
        docs.qiwaContract,
        "qiwa-contract"
      );

      const custodyUrl = await uploadEmployeeFile(
        docs.vehicleCustody,
        "vehicle-custody"
      );

      const otherDocsUrl = await uploadEmployeeFile(
        docs.otherDocs,
        "other-docs"
      );

      const { error } = await supabase
        .from("employees")
        .update({
          name: form.name.trim(),
          iqama: form.iqama.trim(),
          iqama_expiry_date: form.iqamaExpiryDate || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          nationality: form.nationality || null,

          job_title: form.jobTitle,
          work_location: form.workLocation,

          start_date: form.startDate || null,

          base_salary: form.baseSalary
            ? Number(form.baseSalary)
            : null,

          target: isCourier && form.target
            ? Number(form.target)
            : null,

          half_target: isCourier && form.halfTarget
            ? Number(form.halfTarget)
            : null,

          target_deductions:
            isCourier && form.targetDeductions
              ? Number(form.targetDeductions)
              : null,

          vehicle_number: form.vehicleNumber.trim() || null,

          platform_id:
            (showKeetaId ? form.keetaId.trim() : "") ||
            (showHungerId ? form.hungerId.trim() : "") ||
            null,

          keeta_id: showKeetaId
            ? form.keetaId.trim() || null
            : null,

          hunger_id: showHungerId
            ? form.hungerId.trim() || null
            : null,

          notes: form.notes.trim() || null,

          photo_url: photoUrl || form.photoUrl || null,
          iqama_file_url: iqamaUrl || form.iqamaFileUrl || null,
          license_file_url: licenseUrl || form.licenseFileUrl || null,
          qiwa_file_url: qiwaUrl || form.qiwaFileUrl || null,
          custody_file_url: custodyUrl || form.custodyFileUrl || null,
          other_docs_url: otherDocsUrl || form.otherDocsUrl || null,

          updated_at: new Date().toISOString(),
        })
        .eq("id", employeeId);

      if (error) {
        console.error("SAVE EMPLOYEE ERROR:", error);
        alert(
          isAr
            ? `فشل حفظ التعديلات: ${error.message}`
            : `Failed to save changes: ${error.message}`
        );
        setSaving(false);
        return;
      }

      alert(
        isAr
          ? "تم حفظ التعديلات بنجاح"
          : "Changes saved successfully"
      );

      router.push(`/employees/${employeeId}`);
    } catch (error) {
      console.error("SAVE WITH FILES ERROR:", error);

      alert(
        isAr
          ? "حدث خطأ أثناء رفع المرفقات"
          : "Error uploading documents"
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-bold text-slate-600">
            {isAr
              ? "جاري تحميل بيانات الموظف..."
              : "Loading employee data..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="space-y-5 pb-10"
    >
      {/* HERO */}
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <div className="h-1 bg-gradient-to-l from-blue-600 via-cyan-500 to-indigo-600" />

        <div className="flex flex-col gap-5 px-5 py-5 md:px-7 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#102a4c] text-white shadow-sm md:flex">
              <PencilIcon />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#102a4c] md:text-3xl">
                {isAr
                  ? "تعديل بيانات الموظف"
                  : "Edit Employee"}
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                {isAr
                  ? "عدّل البيانات الشخصية وبيانات العمل والراتب والمستندات بنفس نموذج إضافة الموظف."
                  : "Update personal, work, salary and document details using the same employee form."}
              </p>
            </div>
          </div>

          <Link
            href={`/employees/${employeeId}`}
            className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowRight
              className={`h-4 w-4 ${
                isAr ? "" : "rotate-180"
              }`}
            />

            {isAr
              ? "الرجوع للتفاصيل"
              : "Back To Details"}
          </Link>
        </div>
      </section>

      {/* BASIC INFO */}
      <FormSection
        title={
          isAr
            ? "البيانات الشخصية والإقامة"
            : "Personal & Iqama Information"
        }
        subtitle={
          isAr
            ? "عدّل بيانات الموظف الأساسية وتاريخ انتهاء الإقامة."
            : "Update employee identity and Iqama expiry information."
        }
        icon={<IdCard className="h-5 w-5" />}
        accent="blue"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label={
              isAr
                ? "اسم الموظف"
                : "Employee Name"
            }
            value={form.name}
            onChange={(value) =>
              updateField("name", value)
            }
            required
            icon={<UserRound className="h-4 w-4" />}
          />

          <Input
            label={
              isAr
                ? "رقم الإقامة"
                : "Iqama Number"
            }
            value={form.iqama}
            onChange={(value) =>
              updateField("iqama", value)
            }
            required
            icon={<IdCard className="h-4 w-4" />}
            dir="ltr"
          />

          <Input
            label={
              isAr
                ? "تاريخ انتهاء الإقامة"
                : "Iqama Expiry Date"
            }
            type="date"
            value={form.iqamaExpiryDate}
            onChange={(value) =>
              updateField(
                "iqamaExpiryDate",
                value
              )
            }
            required
            icon={
              <CalendarDays className="h-4 w-4" />
            }
          />

          <Input
            label={
              isAr ? "رقم الجوال" : "Phone"
            }
            value={form.phone}
            onChange={(value) =>
              updateField("phone", value)
            }
            icon={<Phone className="h-4 w-4" />}
            dir="ltr"
          />

          <Input
            label={
              isAr
                ? "البريد الإلكتروني"
                : "Email"
            }
            type="email"
            value={form.email}
            onChange={(value) =>
              updateField("email", value)
            }
            icon={<Mail className="h-4 w-4" />}
            dir="ltr"
          />

          <Select
            label={
              isAr ? "الجنسية" : "Nationality"
            }
            value={form.nationality}
            onChange={(value) =>
              updateField(
                "nationality",
                value
              )
            }
            options={nationalityOptions}
            required
          />

          <Input
            label={
              isAr
                ? "تاريخ بداية العمل"
                : "Start Date"
            }
            type="date"
            value={form.startDate}
            onChange={(value) =>
              updateField(
                "startDate",
                value
              )
            }
            icon={
              <CalendarDays className="h-4 w-4" />
            }
          />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <p className="text-xs font-bold leading-6 text-blue-700">
            {isAr
              ? "تاريخ انتهاء الإقامة مرتبط بنظام التنبيهات. يبدأ التنبيه الخفيف قبل 30 يومًا من تاريخ الانتهاء."
              : "Iqama expiry date is linked to the alert system. The first light alert starts 30 days before expiry."}
          </p>
        </div>
      </FormSection>

      {/* WORK INFO */}
      <FormSection
        title={
          isAr
            ? "بيانات العمل"
            : "Work Information"
        }
        subtitle={
          isAr
            ? "حدّث المسمى الوظيفي وموقع العمل وبيانات المنصات."
            : "Update role, work location and platform information."
        }
        icon={
          <BriefcaseBusiness className="h-5 w-5" />
        }
        accent="indigo"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Select
            label={
              isAr
                ? "المسمى الوظيفي"
                : "Job Title"
            }
            value={form.jobTitle}
            onChange={(value) =>
              updateField("jobTitle", value)
            }
            options={jobOptions}
            required
          />

          <Select
            label={
              isAr
                ? "موقع العمل"
                : "Work Location"
            }
            value={form.workLocation}
            onChange={(value) =>
              updateField(
                "workLocation",
                value
              )
            }
            options={workLocationOptions}
            required
          />

          <Input
            label={
              isAr
                ? "رقم المركبة / الدباب"
                : "Vehicle Number"
            }
            value={form.vehicleNumber}
            onChange={(value) =>
              updateField(
                "vehicleNumber",
                value
              )
            }
            icon={<MapPin className="h-4 w-4" />}
          />

          {showKeetaId && (
            <Input
              label={
                isAr
                  ? "رقم ID كيتا"
                  : "Keeta ID"
              }
              value={form.keetaId}
              onChange={(value) =>
                updateField(
                  "keetaId",
                  value
                )
              }
              required
              dir="ltr"
            />
          )}

          {showHungerId && (
            <Input
              label={
                isAr
                  ? "رقم ID هنجرستيشن"
                  : "HungerStation ID"
              }
              value={form.hungerId}
              onChange={(value) =>
                updateField(
                  "hungerId",
                  value
                )
              }
              required
              dir="ltr"
            />
          )}
        </div>

        {isCourier && (
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs font-extrabold text-slate-500">
              {isAr
                ? "التطبيقات المختارة:"
                : "Selected platforms:"}
            </span>

            {showKeetaId && (
              <span className="rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
                {isAr ? "كيتا" : "Keeta"}
              </span>
            )}

            {showHungerId && (
              <span className="rounded-lg border border-green-100 bg-green-50 px-2.5 py-1 text-[11px] font-black text-green-700">
                {isAr
                  ? "هنجرستيشن"
                  : "HungerStation"}
              </span>
            )}
          </div>
        )}
      </FormSection>

      {/* SALARY */}
      <FormSection
        title={
          isAr
            ? "بيانات الراتب والتارجت"
            : "Salary & Target"
        }
        subtitle={
          isAr
            ? "حدّث الراتب الأساسي وبيانات التارجت للمندوب."
            : "Update base salary and courier target details."
        }
        icon={<Wallet className="h-5 w-5" />}
        accent="emerald"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label={
              isAr
                ? "الراتب الأساسي"
                : "Base Salary"
            }
            value={form.baseSalary}
            onChange={(value) =>
              updateField(
                "baseSalary",
                value
              )
            }
            type="number"
            dir="ltr"
          />

          {isCourier && (
            <>
              <Input
                label={
                  isAr ? "التارجت" : "Target"
                }
                value={form.target}
                onChange={(value) =>
                  updateField(
                    "target",
                    value
                  )
                }
                type="number"
                dir="ltr"
              />

              <Input
                label={
                  isAr
                    ? "إضافي التارجت"
                    : "Additional Target"
                }
                value={form.halfTarget}
                onChange={(value) =>
                  updateField(
                    "halfTarget",
                    value
                  )
                }
                type="number"
                dir="ltr"
              />

              <Input
                label={
                  isAr
                    ? "استقطاعات التارجت"
                    : "Target Deductions"
                }
                value={
                  form.targetDeductions
                }
                onChange={(value) =>
                  updateField(
                    "targetDeductions",
                    value
                  )
                }
                type="number"
                dir="ltr"
              />
            </>
          )}
        </div>
      </FormSection>

      {/* DOCUMENTS */}
      <FormSection
        title={
          isAr
            ? "المستندات والمرفقات"
            : "Documents & Attachments"
        }
        subtitle={
          isAr
            ? "اعرض الملفات الحالية أو استبدل أي ملف عند الحاجة."
            : "View current files or replace any attachment when needed."
        }
        icon={
          <CloudUpload className="h-5 w-5" />
        }
        accent="cyan"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <UploadBox
            label={
              isAr
                ? "صورة الموظف"
                : "Employee Photo"
            }
            currentUrl={form.photoUrl}
            file={docs.employeeImage}
            onChange={(file) =>
              updateDoc(
                "employeeImage",
                file
              )
            }
            icon={
              <ImageIcon className="h-6 w-6" />
            }
            isAr={isAr}
          />

          <UploadBox
            label={
              isAr
                ? "صورة الهوية / الإقامة"
                : "ID / Iqama Image"
            }
            currentUrl={form.iqamaFileUrl}
            file={docs.idImage}
            onChange={(file) =>
              updateDoc("idImage", file)
            }
            icon={
              <IdCard className="h-6 w-6" />
            }
            isAr={isAr}
          />

          <UploadBox
            label={
              isAr
                ? "صورة رخصة القيادة"
                : "Driving License Image"
            }
            currentUrl={form.licenseFileUrl}
            file={docs.licenseImage}
            onChange={(file) =>
              updateDoc(
                "licenseImage",
                file
              )
            }
            icon={
              <FileText className="h-6 w-6" />
            }
            isAr={isAr}
          />

          <UploadBox
            label={
              isAr
                ? "عقد قوى"
                : "Qiwa Contract"
            }
            currentUrl={form.qiwaFileUrl}
            file={docs.qiwaContract}
            onChange={(file) =>
              updateDoc(
                "qiwaContract",
                file
              )
            }
            icon={
              <FileText className="h-6 w-6" />
            }
            isAr={isAr}
          />

          <UploadBox
            label={
              isAr
                ? "عهدة استلام مركبة"
                : "Vehicle Custody Form"
            }
            currentUrl={form.custodyFileUrl}
            file={docs.vehicleCustody}
            onChange={(file) =>
              updateDoc(
                "vehicleCustody",
                file
              )
            }
            icon={
              <FileText className="h-6 w-6" />
            }
            isAr={isAr}
          />

          <UploadBox
            label={
              isAr
                ? "مستندات أخرى"
                : "Other Documents"
            }
            currentUrl={form.otherDocsUrl}
            file={docs.otherDocs}
            onChange={(file) =>
              updateDoc("otherDocs", file)
            }
            icon={
              <Upload className="h-6 w-6" />
            }
            isAr={isAr}
          />
        </div>
      </FormSection>

      {/* NOTES */}
      <FormSection
        title={isAr ? "ملاحظات" : "Notes"}
        subtitle={
          isAr
            ? "حدّث أي معلومات إضافية تخص الموظف."
            : "Update any additional employee information."
        }
        icon={<FileText className="h-5 w-5" />}
        accent="slate"
      >
        <textarea
          value={form.notes}
          onChange={(event) =>
            updateField(
              "notes",
              event.target.value
            )
          }
          className="min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          placeholder={
            isAr
              ? "اكتب أي ملاحظات إضافية عن الموظف..."
              : "Write any additional notes about the employee..."
          }
        />
      </FormSection>

      {/* ACTION BAR */}
      <div className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {isAr
              ? "راجع التعديلات ثم اضغط حفظ."
              : "Review your changes, then save."}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/employees/${employeeId}`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Link>

            <button
              type="button"
              onClick={saveEmployee}
              disabled={saving}
              className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? isAr
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isAr
                  ? "حفظ التعديلات"
                  : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  subtitle,
  icon,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent:
    | "blue"
    | "indigo"
    | "emerald"
    | "cyan"
    | "slate";
  children: ReactNode;
}) {
  const accents = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo:
      "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    slate:
      "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_5px_18px_rgba(15,23,42,0.035)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
        <div>
          <h2 className="text-lg font-black text-[#102a4c]">
            {title}
          </h2>

          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accents[accent]}`}
        >
          {icon}
        </div>
      </div>

      <div className="p-5 md:p-6">
        {children}
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  icon,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  icon?: ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600">
        {label}

        {required && (
          <span className="text-red-500">*</span>
        )}
      </span>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          dir={dir}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
            icon ? "ps-10" : ""
          }`}
        />
      </div>
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600">
        {label}

        {required && (
          <span className="text-red-500">*</span>
        )}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pe-10 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
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
  icon: ReactNode;
  isAr: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 transition hover:border-blue-300 hover:bg-blue-50/40">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-700 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-[#102a4c]">
            {label}
          </p>

          <p className="mt-1 truncate text-[11px] font-bold text-slate-400">
            {file
              ? file.name
              : currentUrl
                ? isAr
                  ? "يوجد ملف حالي"
                  : "Current file attached"
                : "PNG, JPG, PDF"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100"
          >
            {isAr
              ? "عرض الملف الحالي"
              : "View Current"}
          </a>
        )}

        <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-extrabold text-white transition hover:bg-blue-700">
          {isAr
            ? "اختيار ملف جديد"
            : "Choose New File"}

          <input
            type="file"
            className="hidden"
            onChange={(event) =>
              onChange(
                event.target.files?.[0] ||
                  null
              )
            }
          />
        </label>

        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-extrabold text-red-700 transition hover:bg-red-100"
          >
            {isAr
              ? "إلغاء الملف الجديد"
              : "Remove Selection"}
          </button>
        )}
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function normalizeNationalityValue(value: string | null | undefined) {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "bangladesh" ||
    normalized === "bangladeshi"
  ) {
    return "Bangladesh";
  }

  if (
    normalized === "pakistan" ||
    normalized === "pakistani"
  ) {
    return "Pakistan";
  }

  if (
    normalized === "india" ||
    normalized === "indian"
  ) {
    return "India";
  }

  if (
    normalized === "egypt" ||
    normalized === "egyptian"
  ) {
    return "Egypt";
  }

  if (
    normalized === "sudan" ||
    normalized === "sudanese"
  ) {
    return "Sudan";
  }

  if (
    normalized === "yemen" ||
    normalized === "yemeni"
  ) {
    return "Yemen";
  }

  if (
    normalized === "saudi arabia" ||
    normalized === "saudi"
  ) {
    return "Saudi Arabia";
  }

  return value;
}
