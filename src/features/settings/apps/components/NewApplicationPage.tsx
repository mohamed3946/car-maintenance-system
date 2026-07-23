"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AppWindow,
  ArrowRight,
  Check,
  ImagePlus,
  ListChecks,
  Plus,
  Save,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";
import Button from "@/ui/button/Button";
import Tabs, { type TabItem } from "@/ui/tabs";

type AppStatus = "active" | "inactive" | "draft";

type BasicForm = {
  nameAr: string;
  nameEn: string;
  shortName: string;
  descriptionAr: string;
  descriptionEn: string;
  primaryColor: string;
  status: AppStatus;
};

type RuleItem = {
  id: string;
  nameAr: string;
  nameEn: string;
  required: boolean;
};

type EvaluationLevel = {
  id: string;
  name: string;
  from: number;
  to: number;
  color: string;
};

const initialWorkRules: RuleItem[] = [
  {
    id: "work-1",
    nameAr: "الالتزام بساعات العمل",
    nameEn: "Working Hours Commitment",
    required: true,
  },
  {
    id: "work-2",
    nameAr: "الالتزام بمنطقة العمل",
    nameEn: "Work Zone Commitment",
    required: true,
  },
];

const initialPerformanceRules: RuleItem[] = [
  {
    id: "performance-1",
    nameAr: "تحقيق الهدف الشهري",
    nameEn: "Monthly Target Achievement",
    required: true,
  },
  {
    id: "performance-2",
    nameAr: "الحد الأدنى اليومي للطلبات",
    nameEn: "Minimum Daily Orders",
    required: true,
  },
];

const initialEvaluationLevels: EvaluationLevel[] = [
  {
    id: "level-a",
    name: "A",
    from: 90,
    to: 100,
    color: "#16a34a",
  },
  {
    id: "level-b",
    name: "B",
    from: 80,
    to: 89,
    color: "#2563eb",
  },
  {
    id: "level-c",
    name: "C",
    from: 70,
    to: 79,
    color: "#f59e0b",
  },
  {
    id: "level-d",
    name: "D",
    from: 60,
    to: 69,
    color: "#f97316",
  },
  {
    id: "level-f",
    name: "F",
    from: 0,
    to: 59,
    color: "#dc2626",
  },
];

export default function NewApplicationPage() {
  const router = useRouter();
  const { lang } = useSystem();
  const isArabic = lang === "ar";

  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [form, setForm] = useState<BasicForm>({
    nameAr: "",
    nameEn: "",
    shortName: "",
    descriptionAr: "",
    descriptionEn: "",
    primaryColor: "#2563eb",
    status: "active",
  });

  const [workRules, setWorkRules] =
    useState<RuleItem[]>(initialWorkRules);

  const [performanceRules, setPerformanceRules] =
    useState<RuleItem[]>(initialPerformanceRules);

  const [evaluationLevels, setEvaluationLevels] =
    useState<EvaluationLevel[]>(initialEvaluationLevels);

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: "basic",
        label: isArabic ? "البيانات الأساسية" : "Basic Information",
        icon: <AppWindow className="h-4 w-4" />,
      },
      {
        id: "work-rules",
        label: isArabic ? "قواعد العمل" : "Work Rules",
        icon: <ListChecks className="h-4 w-4" />,
        count: workRules.length,
      },
      {
        id: "performance-rules",
        label: isArabic ? "قواعد الأداء" : "Performance Rules",
        icon: <Activity className="h-4 w-4" />,
        count: performanceRules.length,
      },
      {
        id: "evaluation",
        label: isArabic ? "التقييم" : "Evaluation",
        icon: <ShieldCheck className="h-4 w-4" />,
        count: evaluationLevels.length,
      },
    ],
    [
      isArabic,
      workRules.length,
      performanceRules.length,
      evaluationLevels.length,
    ]
  );

  function updateForm<K extends keyof BasicForm>(
    key: K,
    value: BasicForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert(
        isArabic
          ? "الرجاء اختيار ملف صورة فقط."
          : "Please select an image file."
      );
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      window.alert(
        isArabic
          ? "حجم الشعار يجب ألا يتجاوز 3 ميجابايت."
          : "Logo size must not exceed 3 MB."
      );
      return;
    }

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function removeLogo() {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview(null);
  }

  function addRule(
    setter: React.Dispatch<React.SetStateAction<RuleItem[]>>
  ) {
    setter((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        nameAr: "",
        nameEn: "",
        required: true,
      },
    ]);
  }

  function updateRule(
    setter: React.Dispatch<React.SetStateAction<RuleItem[]>>,
    id: string,
    updates: Partial<RuleItem>
  ) {
    setter((current) =>
      current.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              ...updates,
            }
          : rule
      )
    );
  }

  function removeRule(
    setter: React.Dispatch<React.SetStateAction<RuleItem[]>>,
    id: string
  ) {
    setter((current) =>
      current.filter((rule) => rule.id !== id)
    );
  }

  async function handleSave() {
    if (!form.nameAr.trim() || !form.nameEn.trim()) {
      window.alert(
        isArabic
          ? "أدخل اسم التطبيق بالعربية والإنجليزية."
          : "Enter the application name in Arabic and English."
      );

      setActiveTab("basic");
      return;
    }

    setSaving(true);

    try {
      const newApplication = {
        ...form,
        logoFile,
        workRules,
        performanceRules,
        evaluationLevels,
      };

      console.log("New application:", newApplication);

      await new Promise((resolve) =>
        window.setTimeout(resolve, 700)
      );

      window.alert(
        isArabic
          ? "تم تجهيز بيانات التطبيق بنجاح. سيتم ربط الحفظ بقاعدة البيانات في الخطوة التالية."
          : "Application data prepared successfully. Database saving will be connected next."
      );

      router.push("/v2/settings/apps");
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
              aria-label={isArabic ? "رجوع" : "Back"}
            >
              <ArrowRight
                className={`h-5 w-5 ${
                  isArabic ? "" : "rotate-180"
                }`}
              />
            </button>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {isArabic ? "إضافة تطبيق" : "Add Application"}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {isArabic
                  ? "أدخل بيانات التطبيق ثم أضف قواعد العمل والأداء ونظام التقييم."
                  : "Enter application details, then configure work rules, performance rules, and evaluation levels."}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            loading={saving}
            iconStart={<Save className="h-5 w-5" />}
            onClick={handleSave}
          >
            {isArabic ? "حفظ التطبيق" : "Save Application"}
          </Button>
        </div>
      </section>

      <Tabs
        items={tabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "basic" && (
        <BasicInformationSection
          isArabic={isArabic}
          form={form}
          logoPreview={logoPreview}
          updateForm={updateForm}
          onLogoChange={handleLogoChange}
          onRemoveLogo={removeLogo}
        />
      )}

      {activeTab === "work-rules" && (
        <RulesSection
          isArabic={isArabic}
          titleAr="قواعد العمل"
          titleEn="Work Rules"
          descriptionAr="أضف شروط ومتطلبات العمل الخاصة بهذا التطبيق."
          descriptionEn="Add operating requirements and work conditions for this application."
          items={workRules}
          onAdd={() => addRule(setWorkRules)}
          onUpdate={(id, updates) =>
            updateRule(setWorkRules, id, updates)
          }
          onRemove={(id) => removeRule(setWorkRules, id)}
        />
      )}

      {activeTab === "performance-rules" && (
        <RulesSection
          isArabic={isArabic}
          titleAr="قواعد الأداء"
          titleEn="Performance Rules"
          descriptionAr="حدد مؤشرات وشروط قياس أداء المناديب."
          descriptionEn="Define rider performance indicators and requirements."
          items={performanceRules}
          onAdd={() => addRule(setPerformanceRules)}
          onUpdate={(id, updates) =>
            updateRule(setPerformanceRules, id, updates)
          }
          onRemove={(id) =>
            removeRule(setPerformanceRules, id)
          }
        />
      )}

      {activeTab === "evaluation" && (
        <EvaluationSection
          isArabic={isArabic}
          levels={evaluationLevels}
          setLevels={setEvaluationLevels}
        />
      )}
    </div>
  );
}

type BasicInformationSectionProps = {
  isArabic: boolean;
  form: BasicForm;
  logoPreview: string | null;
  updateForm: <K extends keyof BasicForm>(
    key: K,
    value: BasicForm[K]
  ) => void;
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
};

function BasicInformationSection({
  isArabic,
  form,
  logoPreview,
  updateForm,
  onLogoChange,
  onRemoveLogo,
}: BasicInformationSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-slate-900">
          {isArabic
            ? "البيانات الأساسية"
            : "Basic Information"}
        </h2>

        <p className="mt-1 text-sm font-medium text-slate-500">
          {isArabic
            ? "المعلومات التي ستظهر في صفحات التشغيل والإعدادات."
            : "Information displayed across operations and settings pages."}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <p className="mb-3 text-sm font-black text-slate-700">
            {isArabic ? "شعار التطبيق" : "Application Logo"}
          </p>

          <div className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            {logoPreview ? (
              <>
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                  <img
                    src={logoPreview}
                    alt="Application logo preview"
                    className="h-full w-full object-contain"
                  />
                </div>

                <button
                  type="button"
                  onClick={onRemoveLogo}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-black text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  {isArabic ? "حذف الشعار" : "Remove Logo"}
                </button>
              </>
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-slate-400" />

                <p className="mt-3 text-center text-sm font-bold text-slate-600">
                  {isArabic
                    ? "ارفع شعار التطبيق"
                    : "Upload application logo"}
                </p>
              </>
            )}

            <label className="mt-4 cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700">
              {isArabic ? "اختيار صورة" : "Choose Image"}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={onLogoChange}
                className="hidden"
              />
            </label>

            <p className="mt-3 text-center text-xs font-semibold text-slate-400">
              PNG, JPG, WEBP, SVG — Max 3 MB
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label={isArabic ? "اسم التطبيق بالعربية" : "Arabic Name"}
            required
          >
            <input
              value={form.nameAr}
              onChange={(event) =>
                updateForm("nameAr", event.target.value)
              }
              className={inputClassName}
              placeholder="هنجرستيشن"
            />
          </FormField>

          <FormField
            label={isArabic ? "اسم التطبيق بالإنجليزية" : "English Name"}
            required
          >
            <input
              value={form.nameEn}
              onChange={(event) =>
                updateForm("nameEn", event.target.value)
              }
              className={inputClassName}
              placeholder="HungerStation"
              dir="ltr"
            />
          </FormField>

          <FormField
            label={isArabic ? "الاسم المختصر" : "Short Name"}
          >
            <input
              value={form.shortName}
              onChange={(event) =>
                updateForm(
                  "shortName",
                  event.target.value
                    .slice(0, 4)
                    .toUpperCase()
                )
              }
              className={inputClassName}
              placeholder="HS"
              dir="ltr"
            />
          </FormField>

          <FormField
            label={isArabic ? "حالة التطبيق" : "Application Status"}
          >
            <select
              value={form.status}
              onChange={(event) =>
                updateForm(
                  "status",
                  event.target.value as AppStatus
                )
              }
              className={inputClassName}
            >
              <option value="active">
                {isArabic ? "نشط" : "Active"}
              </option>
              <option value="inactive">
                {isArabic ? "متوقف" : "Inactive"}
              </option>
              <option value="draft">
                {isArabic ? "مسودة" : "Draft"}
              </option>
            </select>
          </FormField>

          <FormField
            label={isArabic ? "اللون الرئيسي" : "Primary Color"}
          >
            <div className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(event) =>
                  updateForm("primaryColor", event.target.value)
                }
                className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent"
              />

              <input
                value={form.primaryColor}
                onChange={(event) =>
                  updateForm("primaryColor", event.target.value)
                }
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none"
                dir="ltr"
              />
            </div>
          </FormField>

          <div className="hidden md:block" />

          <FormField
            label={isArabic ? "الوصف بالعربية" : "Arabic Description"}
            className="md:col-span-2"
          >
            <textarea
              value={form.descriptionAr}
              onChange={(event) =>
                updateForm(
                  "descriptionAr",
                  event.target.value
                )
              }
              className={`${inputClassName} min-h-24 resize-y py-3`}
              placeholder={
                isArabic
                  ? "وصف مختصر عن التطبيق..."
                  : "Short Arabic application description..."
              }
            />
          </FormField>

          <FormField
            label={isArabic ? "الوصف بالإنجليزية" : "English Description"}
            className="md:col-span-2"
          >
            <textarea
              value={form.descriptionEn}
              onChange={(event) =>
                updateForm(
                  "descriptionEn",
                  event.target.value
                )
              }
              className={`${inputClassName} min-h-24 resize-y py-3`}
              placeholder="Short application description..."
              dir="ltr"
            />
          </FormField>
        </div>
      </div>
    </section>
  );
}

type RulesSectionProps = {
  isArabic: boolean;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  items: RuleItem[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<RuleItem>) => void;
  onRemove: (id: string) => void;
};

function RulesSection({
  isArabic,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
  items,
  onAdd,
  onUpdate,
  onRemove,
}: RulesSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">
            {isArabic ? titleAr : titleEn}
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {isArabic ? descriptionAr : descriptionEn}
          </p>
        </div>

        <Button
          variant="outline"
          iconStart={<Plus className="h-4 w-4" />}
          onClick={onAdd}
        >
          {isArabic ? "إضافة قاعدة" : "Add Rule"}
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((rule, index) => (
          <div
            key={rule.id}
            className="grid grid-cols-1 items-end gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)_150px_44px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-600 shadow-sm">
              {index + 1}
            </div>

            <FormField
              label={isArabic ? "اسم القاعدة بالعربية" : "Arabic Rule Name"}
            >
              <input
                value={rule.nameAr}
                onChange={(event) =>
                  onUpdate(rule.id, {
                    nameAr: event.target.value,
                  })
                }
                className={inputClassName}
              />
            </FormField>

            <FormField
              label={isArabic ? "اسم القاعدة بالإنجليزية" : "English Rule Name"}
            >
              <input
                value={rule.nameEn}
                onChange={(event) =>
                  onUpdate(rule.id, {
                    nameEn: event.target.value,
                  })
                }
                className={inputClassName}
                dir="ltr"
              />
            </FormField>

            <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4">
              <span className="text-sm font-black text-slate-700">
                {isArabic ? "إلزامية" : "Required"}
              </span>

              <input
                type="checkbox"
                checked={rule.required}
                onChange={(event) =>
                  onUpdate(rule.id, {
                    required: event.target.checked,
                  })
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            <button
              type="button"
              onClick={() => onRemove(rule.id)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
              aria-label={isArabic ? "حذف القاعدة" : "Remove rule"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <ListChecks className="mx-auto h-10 w-10 text-slate-400" />

            <p className="mt-3 text-sm font-black text-slate-700">
              {isArabic
                ? "لم تتم إضافة قواعد بعد."
                : "No rules have been added yet."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

type EvaluationSectionProps = {
  isArabic: boolean;
  levels: EvaluationLevel[];
  setLevels: React.Dispatch<
    React.SetStateAction<EvaluationLevel[]>
  >;
};

function EvaluationSection({
  isArabic,
  levels,
  setLevels,
}: EvaluationSectionProps) {
  function updateLevel(
    id: string,
    updates: Partial<EvaluationLevel>
  ) {
    setLevels((current) =>
      current.map((level) =>
        level.id === id
          ? {
              ...level,
              ...updates,
            }
          : level
      )
    );
  }

  function addLevel() {
    setLevels((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        from: 0,
        to: 0,
        color: "#64748b",
      },
    ]);
  }

  function removeLevel(id: string) {
    setLevels((current) =>
      current.filter((level) => level.id !== id)
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">
            {isArabic ? "مستويات التقييم" : "Evaluation Levels"}
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {isArabic
              ? "حدد درجات ومستويات تقييم أداء المناديب."
              : "Define rider performance scores and evaluation levels."}
          </p>
        </div>

        <Button
          variant="outline"
          iconStart={<Plus className="h-4 w-4" />}
          onClick={addLevel}
        >
          {isArabic ? "إضافة مستوى" : "Add Level"}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {levels.map((level) => (
          <div
            key={level.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-base font-black text-white"
                style={{
                  backgroundColor: level.color,
                }}
              >
                {level.name || "—"}
              </div>

              <button
                type="button"
                onClick={() => removeLevel(level.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField
                label={isArabic ? "اسم المستوى" : "Level Name"}
                className="col-span-2"
              >
                <input
                  value={level.name}
                  onChange={(event) =>
                    updateLevel(level.id, {
                      name: event.target.value
                        .slice(0, 4)
                        .toUpperCase(),
                    })
                  }
                  className={inputClassName}
                  dir="ltr"
                />
              </FormField>

              <FormField label={isArabic ? "من" : "From"}>
                <input
                  type="number"
                  value={level.from}
                  onChange={(event) =>
                    updateLevel(level.id, {
                      from: Number(event.target.value),
                    })
                  }
                  className={inputClassName}
                />
              </FormField>

              <FormField label={isArabic ? "إلى" : "To"}>
                <input
                  type="number"
                  value={level.to}
                  onChange={(event) =>
                    updateLevel(level.id, {
                      to: Number(event.target.value),
                    })
                  }
                  className={inputClassName}
                />
              </FormField>

              <FormField
                label={isArabic ? "لون المستوى" : "Level Color"}
                className="col-span-2"
              >
                <div className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
                  <input
                    type="color"
                    value={level.color}
                    onChange={(event) =>
                      updateLevel(level.id, {
                        color: event.target.value,
                      })
                    }
                    className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent"
                  />

                  <span
                    className="text-sm font-bold text-slate-600"
                    dir="ltr"
                  >
                    {level.color}
                  </span>
                </div>
              </FormField>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-blue-800">
        <Star className="h-5 w-5 shrink-0" />

        <p className="text-sm font-bold">
          {isArabic
            ? "لاحقًا سنربط كل مستوى بالراتب والحوافز والخصومات والإجراءات الإدارية."
            : "Each level will later be connected to salary, incentives, deductions, and administrative actions."}
        </p>
      </div>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

function FormField({
  label,
  children,
  required = false,
  className = "",
}: FormFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
        {required && <span className="ms-1 text-red-600">*</span>}
      </span>

      {children}
    </label>
  );
}

const inputClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";