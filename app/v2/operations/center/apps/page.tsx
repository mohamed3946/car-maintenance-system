"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  AppWindow,
  CheckCircle2,
  ChevronDown,
  CircleOff,
  FileSpreadsheet,
  Filter,
  MoreVertical,
  PencilLine,
  Plus,
  Search,
  Settings2,
  UploadCloud,
  X,
} from "lucide-react";

import { MainLayout } from "@/shared/layout";
import { useSystem } from "@/providers/SystemProvider";

type Rule = {
  id: string;
  labelAr: string;
  labelEn: string;
  value: string;
};

type DeliveryApplication = {
  id: string;
  name: string;
  code: string;
  accountId: string;
  cities: string[];
  active: boolean;
  rulesUpdatedAt: string;
  rules: Rule[];
  rulesFileName?: string;
};

const initialApplications: DeliveryApplication[] = [
  {
    id: "keeta",
    name: "Keeta",
    code: "KEETA",
    accountId: "KEETA-12345",
    cities: ["الرياض"],
    active: true,
    rulesUpdatedAt: "2026-07-12",
    rules: [
      {
        id: "minimum-orders",
        labelAr: "الحد الأدنى للطلبات",
        labelEn: "Minimum Orders",
        value: "300",
      },
      {
        id: "working-days",
        labelAr: "أيام العمل المطلوبة",
        labelEn: "Required Working Days",
        value: "28",
      },
      {
        id: "minimum-daily-orders",
        labelAr: "الحد الأدنى اليومي",
        labelEn: "Minimum Daily Orders",
        value: "10",
      },
      {
        id: "face-verification",
        labelAr: "التحقق من الوجه",
        labelEn: "Face Verification",
        value: "100%",
      },
    ],
  },
  {
    id: "hungerstation",
    name: "HungerStation",
    code: "HUNGER",
    accountId: "HS-54321",
    cities: ["الرياض"],
    active: true,
    rulesUpdatedAt: "2026-07-10",
    rules: [
      {
        id: "target-orders",
        labelAr: "مستهدف الطلبات",
        labelEn: "Orders Target",
        value: "450",
      },
      {
        id: "working-hours",
        labelAr: "ساعات العمل اليومية",
        labelEn: "Daily Working Hours",
        value: "12",
      },
      {
        id: "weekly-booking",
        labelAr: "حجز الورديات الأسبوعية",
        labelEn: "Weekly Shift Booking",
        value: "مطلوب",
      },
      {
        id: "minimum-daily-orders",
        labelAr: "الحد الأدنى اليومي",
        labelEn: "Minimum Daily Orders",
        value: "10",
      },
    ],
  },
];

const availableApplications = [
  "Keeta",
  "HungerStation",
  "Jahez",
  "Mrsool",
  "ToYou",
  "Ninja",
  "Custom Application",
];

export default function ApplicationsPage() {
  const { lang } = useSystem();
  const isArabic = lang === "ar";

  const [applications, setApplications] =
    useState<DeliveryApplication[]>(initialApplications);

  const [selectedApplicationId, setSelectedApplicationId] =
    useState<string>(initialApplications[0]?.id ?? "");

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [showAddApplication, setShowAddApplication] = useState(false);
  const [ruleMode, setRuleMode] = useState<"manual" | "file">("manual");

  const [newApplicationName, setNewApplicationName] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [newCities, setNewCities] = useState("");

  const selectedApplication =
    applications.find(
      (application) => application.id === selectedApplicationId
    ) ?? null;

  const filteredApplications = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.name.toLowerCase().includes(query) ||
        application.accountId.toLowerCase().includes(query) ||
        application.cities.join(" ").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && application.active) ||
        (statusFilter === "inactive" && !application.active);

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchValue, statusFilter]);

  const activeCount = applications.filter(
    (application) => application.active
  ).length;

  const inactiveCount = applications.length - activeCount;

  const totalRules = applications.reduce(
    (total, application) => total + application.rules.length,
    0
  );

  function toggleApplication(applicationId: string) {
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              active: !application.active,
            }
          : application
      )
    );
  }

  function updateRule(ruleId: string, value: string) {
    if (!selectedApplication) return;

    setApplications((current) =>
      current.map((application) =>
        application.id === selectedApplication.id
          ? {
              ...application,
              rulesUpdatedAt: new Date().toISOString().slice(0, 10),
              rules: application.rules.map((rule) =>
                rule.id === ruleId ? { ...rule, value } : rule
              ),
            }
          : application
      )
    );
  }

  function addManualRule() {
    if (!selectedApplication) return;

    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      labelAr: "قاعدة جديدة",
      labelEn: "New Rule",
      value: "",
    };

    setApplications((current) =>
      current.map((application) =>
        application.id === selectedApplication.id
          ? {
              ...application,
              rules: [...application.rules, newRule],
            }
          : application
      )
    );
  }

  function removeRule(ruleId: string) {
    if (!selectedApplication) return;

    setApplications((current) =>
      current.map((application) =>
        application.id === selectedApplication.id
          ? {
              ...application,
              rules: application.rules.filter(
                (rule) => rule.id !== ruleId
              ),
            }
          : application
      )
    );
  }

  function handleRulesFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !selectedApplication) return;

    setApplications((current) =>
      current.map((application) =>
        application.id === selectedApplication.id
          ? {
              ...application,
              rulesFileName: file.name,
              rulesUpdatedAt: new Date().toISOString().slice(0, 10),
            }
          : application
      )
    );
  }

  function addApplication() {
    if (!newApplicationName.trim()) return;

    const id = `${newApplicationName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}`;

    const application: DeliveryApplication = {
      id,
      name: newApplicationName.trim(),
      code: newApplicationName
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_"),
      accountId: newAccountId.trim() || "-",
      cities: newCities
        .split(",")
        .map((city) => city.trim())
        .filter(Boolean),
      active: true,
      rulesUpdatedAt: new Date().toISOString().slice(0, 10),
      rules: [],
    };

    setApplications((current) => [...current, application]);
    setSelectedApplicationId(application.id);

    setNewApplicationName("");
    setNewAccountId("");
    setNewCities("");
    setShowAddApplication(false);
  }

  return (
    <MainLayout
      title={isArabic ? "التطبيقات" : "Applications"}
      subtitle={
        isArabic
          ? "إدارة تطبيقات التوصيل المتعاقد معها وقواعد الأداء الخاصة بها"
          : "Manage contracted delivery applications and performance rules"
      }
    >
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-black text-slate-950">
              {isArabic ? "تطبيقات الشركة" : "Company Applications"}
            </h2>

            <p className="mt-1 text-[15px] font-medium text-slate-500">
              {isArabic
                ? "حدد التطبيقات التي تعمل معها الشركة ثم أضف قواعد الأداء"
                : "Select the applications used by the company and define their performance rules"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddApplication(true)}
            className="flex min-h-[48px] items-center gap-2 rounded-2xl bg-blue-600 px-5 text-[15px] font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>
              {isArabic ? "إضافة تطبيق" : "Add Application"}
            </span>
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={isArabic ? "إجمالي التطبيقات" : "Total Applications"}
            value={String(applications.length)}
            icon={AppWindow}
            iconClassName="bg-blue-50 text-blue-700"
          />

          <StatCard
            title={isArabic ? "التطبيقات النشطة" : "Active Applications"}
            value={String(activeCount)}
            icon={CheckCircle2}
            iconClassName="bg-green-50 text-green-700"
          />

          <StatCard
            title={isArabic ? "التطبيقات المتوقفة" : "Inactive Applications"}
            value={String(inactiveCount)}
            icon={CircleOff}
            iconClassName="bg-red-50 text-red-600"
          />

          <StatCard
            title={isArabic ? "إجمالي قواعد الأداء" : "Performance Rules"}
            value={String(totalRules)}
            icon={FileSpreadsheet}
            iconClassName="bg-violet-50 text-violet-700"
          />
        </section>

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div className="relative min-w-[260px] flex-1 md:max-w-[440px]">
              <Search
                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${
                  isArabic ? "right-4" : "left-4"
                }`}
              />

              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={
                  isArabic
                    ? "ابحث عن تطبيق أو حساب..."
                    : "Search application or account..."
                }
                className={`h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 text-[15px] font-semibold outline-none transition focus:border-blue-500 focus:bg-white ${
                  isArabic ? "pr-12 pl-4" : "pl-12 pr-4"
                }`}
              />
            </div>

            <div className="relative">
              <Filter
                className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 ${
                  isArabic ? "right-4" : "left-4"
                }`}
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "all" | "active" | "inactive"
                  )
                }
                className={`h-12 min-w-[180px] appearance-none rounded-2xl border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none ${
                  isArabic ? "pr-12 pl-10" : "pl-12 pr-10"
                }`}
              >
                <option value="all">
                  {isArabic ? "جميع الحالات" : "All Statuses"}
                </option>
                <option value="active">
                  {isArabic ? "نشط" : "Active"}
                </option>
                <option value="inactive">
                  {isArabic ? "غير نشط" : "Inactive"}
                </option>
              </select>

              <ChevronDown
                className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isArabic ? "left-4" : "right-4"
                }`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-[14px]">
              <thead className="bg-[#082a52] text-white">
                <tr>
                  <th className="px-5 py-4 text-start font-black">
                    {isArabic ? "التطبيق" : "Application"}
                  </th>
                  <th className="px-5 py-4 text-start font-black">
                    {isArabic ? "الحساب / المعرف" : "Account / ID"}
                  </th>
                  <th className="px-5 py-4 text-start font-black">
                    {isArabic ? "المدن" : "Cities"}
                  </th>
                  <th className="px-5 py-4 text-start font-black">
                    {isArabic ? "الحالة" : "Status"}
                  </th>
                  <th className="px-5 py-4 text-start font-black">
                    {isArabic ? "آخر تحديث للقواعد" : "Rules Updated"}
                  </th>
                  <th className="px-5 py-4 text-start font-black">
                    {isArabic ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((application) => {
                  const selected =
                    selectedApplicationId === application.id;

                  return (
                    <tr
                      key={application.id}
                      onClick={() =>
                        setSelectedApplicationId(application.id)
                      }
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-blue-50/50 ${
                        selected ? "bg-blue-50/70" : "bg-white"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-700">
                            {application.name.slice(0, 1)}
                          </div>

                          <div>
                            <p className="text-[15px] font-black text-slate-950">
                              {application.name}
                            </p>
                            <p className="mt-1 text-[12px] font-semibold text-slate-400">
                              {application.code}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-700">
                        {application.accountId}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {application.cities.length
                          ? application.cities.join("، ")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleApplication(application.id);
                          }}
                          className={`rounded-full px-3 py-1.5 text-[12px] font-black ${
                            application.active
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {application.active
                            ? isArabic
                              ? "نشط"
                              : "Active"
                            : isArabic
                              ? "غير نشط"
                              : "Inactive"}
                        </button>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {application.rulesUpdatedAt}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedApplicationId(application.id);
                            }}
                            className="flex h-10 items-center gap-2 rounded-xl border border-blue-200 px-3 text-[13px] font-black text-blue-700 transition hover:bg-blue-50"
                          >
                            <Settings2 className="h-4 w-4" />
                            {isArabic ? "إدارة" : "Manage"}
                          </button>

                          <button
                            type="button"
                            onClick={(event) => event.stopPropagation()}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredApplications.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-[15px] font-bold text-slate-400"
                    >
                      {isArabic
                        ? "لا توجد تطبيقات مطابقة للبحث"
                        : "No matching applications found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedApplication && (
          <section className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold text-slate-400">
                    {isArabic ? "قواعد أداء التطبيق" : "Application Rules"}
                  </p>

                  <h2 className="mt-1 text-[22px] font-black text-slate-950">
                    {selectedApplication.name}
                  </h2>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-black text-blue-700">
                  {selectedApplication.rules.length}{" "}
                  {isArabic ? "قواعد" : "Rules"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {selectedApplication.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="grid grid-cols-[1fr_130px_36px] items-center gap-3 rounded-2xl border border-slate-200 p-3"
                  >
                    <span className="text-[14px] font-bold text-slate-700">
                      {isArabic ? rule.labelAr : rule.labelEn}
                    </span>

                    <input
                      value={rule.value}
                      onChange={(event) =>
                        updateRule(rule.id, event.target.value)
                      }
                      className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-center text-[14px] font-black text-slate-900 outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeRule(rule.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {selectedApplication.rules.length === 0 && (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-[14px] font-bold text-slate-400">
                    {isArabic
                      ? "لم تتم إضافة قواعد أداء بعد"
                      : "No performance rules added yet"}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={addManualRule}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 text-[14px] font-black text-blue-700 transition hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                {isArabic ? "إضافة قاعدة جديدة" : "Add New Rule"}
              </button>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-[21px] font-black text-slate-950">
                {isArabic
                  ? "طريقة إدخال قواعد الأداء"
                  : "Performance Rules Input"}
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-1.5">
                <button
                  type="button"
                  onClick={() => setRuleMode("manual")}
                  className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl text-[14px] font-black transition ${
                    ruleMode === "manual"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <PencilLine className="h-5 w-5" />
                  {isArabic ? "إدخال يدوي" : "Manual Entry"}
                </button>

                <button
                  type="button"
                  onClick={() => setRuleMode("file")}
                  className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl text-[14px] font-black transition ${
                    ruleMode === "file"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <UploadCloud className="h-5 w-5" />
                  {isArabic ? "رفع ملف" : "Upload File"}
                </button>
              </div>

              {ruleMode === "manual" ? (
                <div className="mt-5 rounded-[20px] border border-blue-100 bg-blue-50/50 p-6">
                  <PencilLine className="h-9 w-9 text-blue-600" />

                  <h3 className="mt-4 text-[18px] font-black text-slate-950">
                    {isArabic
                      ? "تعديل القواعد يدويًا"
                      : "Edit Rules Manually"}
                  </h3>

                  <p className="mt-2 text-[14px] font-medium leading-7 text-slate-500">
                    {isArabic
                      ? "عدّل القواعد الموجودة أو أضف قاعدة جديدة، وسيتم استخدام هذه القواعد عند تحليل ملفات الأداء."
                      : "Edit existing rules or add a new rule. These rules will be used when analyzing performance files."}
                  </p>

                  <button
                    type="button"
                    onClick={addManualRule}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-[14px] font-black text-white transition hover:bg-blue-700"
                  >
                    {isArabic ? "إضافة قاعدة" : "Add Rule"}
                  </button>
                </div>
              ) : (
                <label className="mt-5 flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-green-300 bg-green-50/50 p-6 text-center transition hover:bg-green-50">
                  <UploadCloud className="h-12 w-12 text-green-600" />

                  <h3 className="mt-4 text-[18px] font-black text-slate-950">
                    {isArabic
                      ? "رفع ملف قواعد الأداء"
                      : "Upload Performance Rules"}
                  </h3>

                  <p className="mt-2 max-w-md text-[14px] font-medium leading-7 text-slate-500">
                    {isArabic
                      ? "ارفع ملف Excel أو CSV يحتوي على قواعد ومستهدفات الأداء الخاصة بالتطبيق."
                      : "Upload an Excel or CSV file containing the application performance rules and targets."}
                  </p>

                  {selectedApplication.rulesFileName && (
                    <span className="mt-4 rounded-full bg-white px-4 py-2 text-[13px] font-black text-green-700 shadow-sm">
                      {selectedApplication.rulesFileName}
                    </span>
                  )}

                  <span className="mt-5 rounded-xl border border-green-300 bg-white px-5 py-3 text-[14px] font-black text-green-700">
                    {isArabic ? "اختيار ملف" : "Choose File"}
                  </span>

                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleRulesFile}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>
        )}
      </div>

      {showAddApplication && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[580px] rounded-[26px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[23px] font-black text-slate-950">
                  {isArabic ? "إضافة تطبيق" : "Add Application"}
                </h2>

                <p className="mt-1 text-[14px] font-medium text-slate-500">
                  {isArabic
                    ? "أضف تطبيق التوصيل المتعاقد معه"
                    : "Add a contracted delivery application"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddApplication(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <Field label={isArabic ? "اسم التطبيق" : "Application Name"}>
                <select
                  value={newApplicationName}
                  onChange={(event) =>
                    setNewApplicationName(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] font-bold outline-none focus:border-blue-500"
                >
                  <option value="">
                    {isArabic ? "اختر التطبيق" : "Select Application"}
                  </option>

                  {availableApplications.map((application) => (
                    <option key={application} value={application}>
                      {application}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label={
                  isArabic
                    ? "رقم الحساب أو المعرف"
                    : "Account Number or ID"
                }
              >
                <input
                  value={newAccountId}
                  onChange={(event) =>
                    setNewAccountId(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[15px] font-bold outline-none focus:border-blue-500"
                />
              </Field>

              <Field
                label={
                  isArabic
                    ? "المدن — افصل بينها بفاصلة"
                    : "Cities — separated by commas"
                }
              >
                <input
                  value={newCities}
                  onChange={(event) =>
                    setNewCities(event.target.value)
                  }
                  placeholder={
                    isArabic ? "الرياض، جدة" : "Riyadh, Jeddah"
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[15px] font-bold outline-none focus:border-blue-500"
                />
              </Field>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddApplication(false)}
                className="h-12 rounded-xl border border-slate-200 px-5 text-[14px] font-black text-slate-600 hover:bg-slate-50"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={addApplication}
                disabled={!newApplicationName}
                className="h-12 rounded-xl bg-blue-600 px-6 text-[14px] font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isArabic ? "إضافة التطبيق" : "Add Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

type IconType = React.ComponentType<{
  className?: string;
}>;

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string;
  icon: IconType;
  iconClassName: string;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <strong className="text-[30px] font-black text-slate-950">
          {value}
        </strong>
      </div>

      <p className="mt-4 text-[15px] font-bold text-slate-500">
        {title}
      </p>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-black text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}