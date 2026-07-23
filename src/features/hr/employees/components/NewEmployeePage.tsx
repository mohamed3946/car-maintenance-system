"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppWindow,
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  ImagePlus,
  Save,
  UserRound,
  Wallet,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";
import Button from "@/ui/button/Button";
import Tabs, { type TabItem } from "@/ui/tabs";

type EmployeeStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "vacation";

type EmployeeKind = "courier" | "employee";

type PaymentMethod = "cash" | "bank";

type EmployeeForm = {
  nameAr: string;
  nameEn: string;
  iqamaNumber: string;
  nationality: string;
  phone: string;
  email: string;
  birthDate: string;
  employeeNumber: string;
  employeeKind: EmployeeKind;
  jobTitle: string;
  department: string;
  branch: string;
  joiningDate: string;
  status: EmployeeStatus;
  baseSalary: string;
  paymentMethod: PaymentMethod;
  bankName: string;
  iban: string;
  notes: string;
};

type EmployeeApplication = {
  id: string;
  appId: string;
  platformId: string;
  active: boolean;
};

const availableApplications = [
  {
    id: "hungerstation",
    nameAr: "هنجرستيشن",
    nameEn: "HungerStation",
  },
  {
    id: "keeta",
    nameAr: "كيتا",
    nameEn: "Keeta",
  },
  {
    id: "jahez",
    nameAr: "جاهز",
    nameEn: "Jahez",
  },
];

export default function NewEmployeePage() {
  const router = useRouter();
  const { lang } = useSystem();

  const isArabic = lang === "ar";

  const [activeTab, setActiveTab] = useState("personal");
  const [saving, setSaving] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    null
  );

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState<EmployeeForm>({
    nameAr: "",
    nameEn: "",
    iqamaNumber: "",
    nationality: "",
    phone: "",
    email: "",
    birthDate: "",
    employeeNumber: "",
    employeeKind: "employee",
    jobTitle: "",
    department: "",
    branch: "",
    joiningDate: "",
    status: "active",
    baseSalary: "",
    paymentMethod: "bank",
    bankName: "",
    iban: "",
    notes: "",
  });

  const [applications, setApplications] = useState<
    EmployeeApplication[]
  >([]);

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: "personal",
        label: isArabic
          ? "البيانات الشخصية"
          : "Personal Information",
        icon: <UserRound className="h-4 w-4" />,
      },
      {
        id: "work",
        label: isArabic ? "بيانات العمل" : "Work Information",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
      },
      {
        id: "applications",
        label: isArabic ? "التطبيقات" : "Applications",
        icon: <AppWindow className="h-4 w-4" />,
        count: applications.length,
      },
      {
        id: "salary",
        label: isArabic ? "الراتب" : "Salary",
        icon: <Wallet className="h-4 w-4" />,
      },
      {
        id: "documents",
        label: isArabic ? "المستندات" : "Documents",
        icon: <FileText className="h-4 w-4" />,
      },
    ],
    [isArabic, applications.length]
  );

  function updateForm<K extends keyof EmployeeForm>(
    key: K,
    value: EmployeeForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert(
        isArabic
          ? "الرجاء اختيار ملف صورة."
          : "Please select an image file."
      );
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function toggleApplication(appId: string) {
    setApplications((current) => {
      const exists = current.find(
        (application) => application.appId === appId
      );

      if (exists) {
        return current.filter(
          (application) => application.appId !== appId
        );
      }

      return [
        ...current,
        {
          id: crypto.randomUUID(),
          appId,
          platformId: "",
          active: true,
        },
      ];
    });
  }

  function updatePlatformId(
    appId: string,
    platformId: string
  ) {
    setApplications((current) =>
      current.map((application) =>
        application.appId === appId
          ? {
              ...application,
              platformId,
            }
          : application
      )
    );
  }

  async function handleSave() {
    if (
      !form.nameAr.trim() ||
      !form.nameEn.trim() ||
      !form.iqamaNumber.trim()
    ) {
      window.alert(
        isArabic
          ? "أدخل الاسم بالعربية والإنجليزية ورقم الإقامة."
          : "Enter Arabic name, English name, and ID number."
      );

      setActiveTab("personal");
      return;
    }

    if (
      form.employeeKind === "courier" &&
      applications.length === 0
    ) {
      window.alert(
        isArabic
          ? "اختر تطبيقًا واحدًا على الأقل لمندوب التوصيل."
          : "Select at least one application for the courier."
      );

      setActiveTab("applications");
      return;
    }

    setSaving(true);

    try {
      const employeeData = {
        ...form,
        photoFile,
        applications,
      };

      console.log("Employee data:", employeeData);

      await new Promise((resolve) =>
        window.setTimeout(resolve, 700)
      );

      window.alert(
        isArabic
          ? "تم تجهيز بيانات الموظف. سيتم ربط الحفظ بقاعدة البيانات لاحقًا."
          : "Employee data prepared. Database saving will be connected later."
      );

      router.push("/v2/hr/employees");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowRight
                className={`h-5 w-5 ${
                  isArabic ? "" : "rotate-180"
                }`}
              />
            </button>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {isArabic ? "إضافة موظف" : "Add Employee"}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {isArabic
                  ? "أدخل البيانات الأساسية وبيانات العمل والتطبيقات والراتب."
                  : "Enter personal, work, application, and salary information."}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            loading={saving}
            iconStart={<Save className="h-5 w-5" />}
            onClick={handleSave}
          >
            {isArabic ? "حفظ الموظف" : "Save Employee"}
          </Button>
        </div>
      </section>

      <Tabs
        items={tabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "personal" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              <p className="mb-3 text-sm font-black text-slate-700">
                {isArabic ? "صورة الموظف" : "Employee Photo"}
              </p>

              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Employee preview"
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <ImagePlus className="h-12 w-12 text-slate-400" />
                )}

                <label className="mt-4 cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700">
                  {isArabic ? "اختيار صورة" : "Choose Photo"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                label={isArabic ? "الاسم بالعربية" : "Arabic Name"}
                required
              >
                <input
                  value={form.nameAr}
                  onChange={(event) =>
                    updateForm("nameAr", event.target.value)
                  }
                  className={inputClassName}
                />
              </FormField>

              <FormField
                label={isArabic ? "الاسم بالإنجليزية" : "English Name"}
                required
              >
                <input
                  value={form.nameEn}
                  onChange={(event) =>
                    updateForm("nameEn", event.target.value)
                  }
                  className={inputClassName}
                  dir="ltr"
                />
              </FormField>

              <FormField
                label={isArabic ? "رقم الإقامة" : "ID Number"}
                required
              >
                <input
                  value={form.iqamaNumber}
                  onChange={(event) =>
                    updateForm(
                      "iqamaNumber",
                      event.target.value
                    )
                  }
                  className={inputClassName}
                  dir="ltr"
                />
              </FormField>

              <FormField
                label={isArabic ? "الجنسية" : "Nationality"}
              >
                <input
                  value={form.nationality}
                  onChange={(event) =>
                    updateForm(
                      "nationality",
                      event.target.value
                    )
                  }
                  className={inputClassName}
                />
              </FormField>

              <FormField
                label={isArabic ? "رقم الجوال" : "Phone Number"}
              >
                <input
                  value={form.phone}
                  onChange={(event) =>
                    updateForm("phone", event.target.value)
                  }
                  className={inputClassName}
                  dir="ltr"
                />
              </FormField>

              <FormField
                label={isArabic ? "البريد الإلكتروني" : "Email"}
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateForm("email", event.target.value)
                  }
                  className={inputClassName}
                  dir="ltr"
                />
              </FormField>

              <FormField
                label={isArabic ? "تاريخ الميلاد" : "Birth Date"}
              >
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(event) =>
                    updateForm(
                      "birthDate",
                      event.target.value
                    )
                  }
                  className={inputClassName}
                />
              </FormField>
            </div>
          </div>
        </section>
      )}

      {activeTab === "work" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={isArabic ? "الرقم الوظيفي" : "Employee Number"}
            >
              <input
                value={form.employeeNumber}
                onChange={(event) =>
                  updateForm(
                    "employeeNumber",
                    event.target.value
                  )
                }
                className={inputClassName}
                dir="ltr"
              />
            </FormField>

            <FormField
              label={isArabic ? "نوع الموظف" : "Employee Type"}
            >
              <select
                value={form.employeeKind}
                onChange={(event) =>
                  updateForm(
                    "employeeKind",
                    event.target.value as EmployeeKind
                  )
                }
                className={inputClassName}
              >
                <option value="employee">
                  {isArabic ? "موظف إداري" : "Employee"}
                </option>

                <option value="courier">
                  {isArabic ? "مندوب توصيل" : "Courier"}
                </option>
              </select>
            </FormField>

            <FormField
              label={isArabic ? "المسمى الوظيفي" : "Job Title"}
            >
              <input
                value={form.jobTitle}
                onChange={(event) =>
                  updateForm("jobTitle", event.target.value)
                }
                className={inputClassName}
              />
            </FormField>

            <FormField
              label={isArabic ? "القسم" : "Department"}
            >
              <input
                value={form.department}
                onChange={(event) =>
                  updateForm("department", event.target.value)
                }
                className={inputClassName}
              />
            </FormField>

            <FormField
              label={isArabic ? "الفرع" : "Branch"}
            >
              <input
                value={form.branch}
                onChange={(event) =>
                  updateForm("branch", event.target.value)
                }
                className={inputClassName}
              />
            </FormField>

            <FormField
              label={isArabic ? "تاريخ المباشرة" : "Joining Date"}
            >
              <input
                type="date"
                value={form.joiningDate}
                onChange={(event) =>
                  updateForm(
                    "joiningDate",
                    event.target.value
                  )
                }
                className={inputClassName}
              />
            </FormField>

            <FormField
              label={isArabic ? "حالة الموظف" : "Status"}
            >
              <select
                value={form.status}
                onChange={(event) =>
                  updateForm(
                    "status",
                    event.target.value as EmployeeStatus
                  )
                }
                className={inputClassName}
              >
                <option value="active">
                  {isArabic ? "نشط" : "Active"}
                </option>

                <option value="inactive">
                  {isArabic ? "غير نشط" : "Inactive"}
                </option>

                <option value="suspended">
                  {isArabic ? "موقوف" : "Suspended"}
                </option>

                <option value="vacation">
                  {isArabic ? "إجازة" : "Vacation"}
                </option>
              </select>
            </FormField>
          </div>
        </section>
      )}

      {activeTab === "applications" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {form.employeeKind !== "courier" ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
              <AppWindow className="mx-auto h-12 w-12 text-slate-400" />

              <p className="mt-4 text-sm font-black text-slate-700">
                {isArabic
                  ? "قسم التطبيقات يظهر فقط عند اختيار نوع الموظف: مندوب توصيل."
                  : "Applications are available only when employee type is Courier."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {availableApplications.map((application) => {
                const selected = applications.find(
                  (item) => item.appId === application.id
                );

                return (
                  <article
                    key={application.id}
                    className={[
                      "rounded-2xl border p-5 transition",
                      selected
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <label className="flex cursor-pointer items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {isArabic
                            ? application.nameAr
                            : application.nameEn}
                        </h3>

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {isArabic
                            ? application.nameEn
                            : application.nameAr}
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={Boolean(selected)}
                        onChange={() =>
                          toggleApplication(application.id)
                        }
                        className="h-5 w-5 accent-blue-600"
                      />
                    </label>

                    {selected && (
                      <div className="mt-5">
                        <FormField
                          label={
                            isArabic
                              ? "معرف المندوب في التطبيق"
                              : "Platform Rider ID"
                          }
                          required
                        >
                          <input
                            value={selected.platformId}
                            onChange={(event) =>
                              updatePlatformId(
                                application.id,
                                event.target.value
                              )
                            }
                            className={inputClassName}
                            dir="ltr"
                          />
                        </FormField>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "salary" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label={isArabic ? "الراتب الأساسي" : "Base Salary"}
            >
              <input
                type="number"
                value={form.baseSalary}
                onChange={(event) =>
                  updateForm(
                    "baseSalary",
                    event.target.value
                  )
                }
                className={inputClassName}
              />
            </FormField>

            <FormField
              label={isArabic ? "طريقة الدفع" : "Payment Method"}
            >
              <select
                value={form.paymentMethod}
                onChange={(event) =>
                  updateForm(
                    "paymentMethod",
                    event.target.value as PaymentMethod
                  )
                }
                className={inputClassName}
              >
                <option value="bank">
                  {isArabic ? "تحويل بنكي" : "Bank Transfer"}
                </option>

                <option value="cash">
                  {isArabic ? "نقدي" : "Cash"}
                </option>
              </select>
            </FormField>

            {form.paymentMethod === "bank" && (
              <>
                <FormField
                  label={isArabic ? "اسم البنك" : "Bank Name"}
                >
                  <input
                    value={form.bankName}
                    onChange={(event) =>
                      updateForm(
                        "bankName",
                        event.target.value
                      )
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField label={isArabic ? "الآيبان" : "IBAN"}>
                  <input
                    value={form.iban}
                    onChange={(event) =>
                      updateForm("iban", event.target.value)
                    }
                    className={inputClassName}
                    dir="ltr"
                  />
                </FormField>
              </>
            )}
          </div>
        </section>
      )}

      {activeTab === "documents" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />

            <h2 className="mt-4 text-lg font-black text-slate-900">
              {isArabic
                ? "رفع مستندات الموظف"
                : "Employee Documents"}
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-500">
              {isArabic
                ? "سيتم إضافة رفع الإقامة والرخصة والعقد والجواز في الخطوة التالية."
                : "ID, license, contract, and passport uploads will be added next."}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
};

function FormField({
  label,
  children,
  required = false,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
        {required && (
          <span className="ms-1 text-red-600">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

const inputClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";