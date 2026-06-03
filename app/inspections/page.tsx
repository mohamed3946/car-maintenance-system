"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  Battery,
  CalendarDays,
  Camera,
  Car,
  CheckCircle,
  Eye,
  Filter,
  Lightbulb,
  Plus,
  Save,
  Search,
  ShieldAlert,
  Wrench,
  X,
  XCircle,
} from "lucide-react";

type Vehicle = {
  id: string;
  plate_number: string | null;
  vehicle_type: string | null;
  vehicle_status: string | null;
  created_at?: string;
};

type StatusValue = "سليم" | "يحتاج متابعة" | "يحتاج إصلاح";
type InspectionType = "weekly" | "monthly";

type Inspection = {
  id?: string;
  vehicle_id: string;
  plate_number: string;
  inspection_type?: InspectionType;
  inspection_date: string;
  tires: StatusValue;
  brakes: StatusValue;
  oil: StatusValue;
  battery: StatusValue;
  lights: StatusValue;
  exterior_body: StatusValue;
  overall_status: StatusValue;
  notes: string;
  created_at?: string;
};

export default function InspectionsPage() {
  return (
    <AppLayout titleKey="maintenance" subtitleKey="maintenanceSubtitle">
      <InspectionsContent />
    </AppLayout>
  );
}

function InspectionsContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [inspectionType, setInspectionType] = useState<InspectionType>("weekly");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    inspection_date: today,
    tires: "سليم" as StatusValue,
    brakes: "سليم" as StatusValue,
    oil: "سليم" as StatusValue,
    battery: "سليم" as StatusValue,
    lights: "سليم" as StatusValue,
    exterior_body: "سليم" as StatusValue,
    notes: "",
  });

  const text = {
    title: ar ? "الفحص الدوري للمركبات" : "Vehicle Periodic Inspection",
    breadcrumb: ar ? "الصيانة / الفحص الدوري" : "Maintenance / Periodic Inspection",

    weekly: ar ? "الفحص الأسبوعي" : "Weekly Inspection",
    monthly: ar ? "الفحص الشهري" : "Monthly Inspection",

    search: ar ? "ابحث برقم اللوحة..." : "Search by plate...",
    filters: ar ? "إلغاء الفلاتر" : "Reset Filters",
    allStatus: ar ? "كل الحالات" : "All Status",

    total: ar ? "المركبات المتاحة" : "Available Vehicles",
    inspected: ar ? "تم فحصها" : "Inspected",
    needFollow: ar ? "تحتاج متابعة" : "Need Follow-up",
    needRepair: ar ? "تحتاج إصلاح" : "Need Repair",

    plate: ar ? "رقم اللوحة" : "Plate Number",
    tires: ar ? "الإطارات" : "Tires",
    brakes: ar ? "الفرامل" : "Brakes",
    oil: ar ? "الزيت" : "Oil",
    battery: ar ? "البطارية" : "Battery",
    lights: ar ? "الأنوار" : "Lights",
    body: ar ? "الهيكل الخارجي" : "Exterior Body",
    status: ar ? "الحالة" : "Status",
    date: ar ? "تاريخ الفحص" : "Inspection Date",
    actions: ar ? "الإجراء" : "Action",

    startInspection: ar ? "فحص" : "Inspect",
    formTitle: ar ? "فحص مركبة" : "Vehicle Inspection",
    notes: ar ? "ملاحظات المشرف اختياري" : "Supervisor notes optional",
    save: ar ? "حفظ الفحص" : "Save Inspection",
    cancel: ar ? "إلغاء" : "Cancel",
    createMaintenance: ar ? "إنشاء طلب صيانة" : "Create Maintenance Request",

    loading: ar ? "جاري تحميل المركبات..." : "Loading vehicles...",
    empty: ar ? "لا توجد مركبات متاحة للعمل" : "No available vehicles",
    notInspected: ar ? "لم يتم الفحص" : "Not Inspected",

    good: ar ? "سليم" : "Good",
    follow: ar ? "يحتاج متابعة" : "Follow-up",
    repair: ar ? "يحتاج إصلاح" : "Repair",
    saving: ar ? "جاري الحفظ..." : "Saving...",
    images: ar ? "رفع صور اختياري" : "Optional Images",
    addImage: ar ? "إضافة صورة" : "Add Image",
    overall: ar ? "الحالة العامة" : "Overall Status",
  };

  const inspectionItems = [
    {
      key: "tires" as const,
      label: text.tires,
      icon: "🛞",
    },
    {
      key: "brakes" as const,
      label: text.brakes,
      icon: "🛑",
    },
    {
      key: "oil" as const,
      label: text.oil,
      icon: "🛢️",
    },
    {
      key: "battery" as const,
      label: text.battery,
      icon: <Battery className="h-10 w-10 text-blue-700" />,
    },
    {
      key: "lights" as const,
      label: text.lights,
      icon: <Lightbulb className="h-10 w-10 text-yellow-500" />,
    },
    {
      key: "exterior_body" as const,
      label: text.body,
      icon: <Car className="h-10 w-10 text-blue-700" />,
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("id, plate_number, vehicle_type, vehicle_status, created_at")
      .in("vehicle_status", ["متاح", "Available"])
      .order("created_at", { ascending: false });

    const { data: inspectionsData, error: inspectionsError } = await supabase
      .from("vehicle_inspections")
      .select("*")
      .order("created_at", { ascending: false });

    if (vehiclesError) {
      console.log(vehiclesError);
      alert(ar ? "حدث خطأ أثناء تحميل المركبات" : "Error loading vehicles");
    }

    if (inspectionsError) {
      console.log(inspectionsError);
    }

    setVehicles(sortVehiclesCarsFirst(vehiclesData || []));
    setInspections(inspectionsData || []);
    setLoading(false);
  }

  const latestInspectionByVehicle = useMemo(() => {
    const map = new Map<string, Inspection>();

    inspections
      .filter((item) => item.inspection_type === inspectionType)
      .forEach((item) => {
        if (!map.has(item.vehicle_id)) {
          map.set(item.vehicle_id, item);
        }
      });

    return map;
  }, [inspections, inspectionType]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = search.trim().toLowerCase();
      const latest = latestInspectionByVehicle.get(v.id);

      const matchesSearch =
        !q || String(v.plate_number || "").toLowerCase().includes(q);

      const matchesStatus =
        !statusFilter || latest?.overall_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter, latestInspectionByVehicle]);

  const inspectedCount = vehicles.filter((v) =>
    latestInspectionByVehicle.has(v.id)
  ).length;

  const needFollowCount = vehicles.filter(
    (v) => latestInspectionByVehicle.get(v.id)?.overall_status === "يحتاج متابعة"
  ).length;

  const needRepairCount = vehicles.filter(
    (v) => latestInspectionByVehicle.get(v.id)?.overall_status === "يحتاج إصلاح"
  ).length;

  function openInspection(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);

    setForm({
      inspection_date: today,
      tires: "سليم",
      brakes: "سليم",
      oil: "سليم",
      battery: "سليم",
      lights: "سليم",
      exterior_body: "سليم",
      notes: "",
    });

    setTimeout(() => {
      document
        .getElementById("inspection-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function getOverallStatus(): StatusValue {
    const values = [
      form.tires,
      form.brakes,
      form.oil,
      form.battery,
      form.lights,
      form.exterior_body,
    ];

    if (values.includes("يحتاج إصلاح")) return "يحتاج إصلاح";
    if (values.includes("يحتاج متابعة")) return "يحتاج متابعة";
    return "سليم";
  }

  function setItemStatus(
    key: "tires" | "brakes" | "oil" | "battery" | "lights" | "exterior_body",
    value: StatusValue
  ) {
    setForm({ ...form, [key]: value });
  }

  async function saveInspection() {
    if (!selectedVehicle) return;

    setSaving(true);

    const payload = {
      vehicle_id: selectedVehicle.id,
      plate_number: selectedVehicle.plate_number || "",
      inspection_type: inspectionType,
      inspection_date: form.inspection_date,
      tires: form.tires,
      brakes: form.brakes,
      oil: form.oil,
      battery: form.battery,
      lights: form.lights,
      exterior_body: form.exterior_body,
      overall_status: getOverallStatus(),
      notes: form.notes,
    };

    const { error } = await supabase
      .from("vehicle_inspections")
      .insert(payload);

    setSaving(false);

   if (error) {
  console.log("SAVE INSPECTION ERROR:", error);

  alert(
    ar
      ? `حدث خطأ أثناء حفظ الفحص: ${error.message}`
      : `Error saving inspection: ${error.message}`
  );

  return;
}
    alert(ar ? "تم حفظ الفحص بنجاح" : "Inspection saved successfully");

    setSelectedVehicle(null);
    await fetchData();
  }

  return (
    <>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className={ar ? "text-right" : "text-left"}>
            <p className="text-sm text-blue-600">{text.breadcrumb}</p>
            <h2 className="mt-1 text-3xl font-bold">
              {text.title} - {inspectionType === "weekly" ? text.weekly : text.monthly}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold hover:bg-slate-50"
          >
            <Filter className="h-5 w-5" />
            {text.filters}
          </button>

          <select
            value={inspectionType}
            onChange={(e) => {
              setInspectionType(e.target.value as InspectionType);
              setSelectedVehicle(null);
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="weekly">{text.weekly}</option>
            <option value="monthly">{text.monthly}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="">{text.allStatus}</option>
            <option value="سليم">{text.good}</option>
            <option value="يحتاج متابعة">{text.follow}</option>
            <option value="يحتاج إصلاح">{text.repair}</option>
          </select>

          <div className="relative">
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pr-12 pl-4 outline-none focus:border-blue-500"
              placeholder={text.search}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card title={text.total} value={String(vehicles.length)} icon={<Plus />} />
        <Card title={text.inspected} value={String(inspectedCount)} icon={<CheckCircle />} />
        <Card title={text.needFollow} value={String(needFollowCount)} icon={<ShieldAlert />} />
        <Card title={text.needRepair} value={String(needRepairCount)} icon={<XCircle />} />
      </div>

      {selectedVehicle && (
        <div
          id="inspection-form"
          className="mb-6 rounded-3xl border border-blue-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-600">
                {text.breadcrumb} / {inspectionType === "weekly" ? text.weekly : text.monthly}
              </p>

              <h3 className="mt-1 text-3xl font-extrabold">
                {text.formTitle}
              </h3>

              <p className="mt-2 text-xl font-bold">
                {text.plate}: {selectedVehicle.plate_number || "-"}
              </p>
            </div>

            <button
              onClick={() => setSelectedVehicle(null)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-bold hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
              {text.cancel}
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-bold text-slate-700">
                {text.date}
              </label>
              <div className="relative">
                <CalendarDays className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={form.inspection_date}
                  onChange={(e) =>
                    setForm({ ...form, inspection_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                {ar ? "نوع الفحص" : "Inspection Type"}
              </label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value as InspectionType)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold outline-none"
              >
                <option value="weekly">{text.weekly}</option>
                <option value="monthly">{text.monthly}</option>
              </select>
            </div>
          </div>

          <div className="mb-6 rounded-3xl border border-slate-200 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h4 className="text-2xl font-extrabold text-blue-700">
                {ar ? "عناصر الفحص" : "Inspection Items"}
              </h4>
              <Wrench className="h-7 w-7 text-blue-700" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {inspectionItems.map((item) => (
                <InspectionCard
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  value={form[item.key]}
                  good={text.good}
                  follow={text.follow}
                  repair={text.repair}
                  onChange={(value) => setItemStatus(item.key, value)}
                />
              ))}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-5">
              <div className="mb-4 flex items-center gap-2 font-extrabold text-blue-700">
                <Camera className="h-6 w-6" />
                {text.images}
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600"
                  >
                    <Plus className="mb-1 h-5 w-5" />
                    <span className="text-xs font-bold">{text.addImage}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 p-5">
              <label className="mb-4 block font-extrabold text-slate-700">
                {text.notes}
              </label>

              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={ar ? "اكتب أي ملاحظات حول حالة المركبة..." : "Write notes about vehicle condition..."}
                className="h-32 w-full resize-none rounded-xl border border-slate-200 p-4 outline-none focus:border-blue-500"
                maxLength={500}
              />

              <p className="mt-2 text-left text-xs text-slate-400">
                {form.notes.length} / 500
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-600">{text.overall}:</span>
              <span className={badge(getOverallStatus())}>
                {getOverallStatus()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold hover:bg-slate-50"
              >
                <Wrench className="h-5 w-5" />
                {text.createMaintenance}
              </button>

              <button
                onClick={saveInspection}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Save className="h-5 w-5" />
                {saving ? text.saving : text.save}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="rounded-2xl border border-slate-100 p-10 text-center font-bold text-slate-500">
            {text.loading}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 p-10 text-center font-bold text-slate-500">
            {text.empty}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <TH>{text.plate}</TH>
                  <TH>{text.tires}</TH>
                  <TH>{text.brakes}</TH>
                  <TH>{text.oil}</TH>
                  <TH>{text.battery}</TH>
                  <TH>{text.lights}</TH>
                  <TH>{text.body}</TH>
                  <TH>{text.status}</TH>
                  <TH>{text.date}</TH>
                  <TH>{text.actions}</TH>
                </tr>
              </thead>

              <tbody>
                {filteredVehicles.map((v) => {
                  const latest = latestInspectionByVehicle.get(v.id);

                  return (
                    <tr
                      key={v.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-bold">
                        {v.plate_number || "-"}
                      </td>

                      <td className="px-4 py-3">{statusIcon(latest?.tires)}</td>
                      <td className="px-4 py-3">{statusIcon(latest?.brakes)}</td>
                      <td className="px-4 py-3">{statusIcon(latest?.oil)}</td>
                      <td className="px-4 py-3">{statusIcon(latest?.battery)}</td>
                      <td className="px-4 py-3">{statusIcon(latest?.lights)}</td>
                      <td className="px-4 py-3">{statusIcon(latest?.exterior_body)}</td>

                      <td className="px-4 py-3">
                        <span className={badge(latest?.overall_status || "")}>
                          {latest?.overall_status || text.notInspected}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold">
                        {latest?.inspection_date || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => openInspection(v)}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-bold hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                          {text.startInspection}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-right font-bold">{children}</th>;
}

function InspectionCard({
  label,
  icon,
  value,
  good,
  follow,
  repair,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: StatusValue;
  good: string;
  follow: string;
  repair: string;
  onChange: (value: StatusValue) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-center gap-3">
        <div className="text-4xl">{icon}</div>
        <h5 className="text-2xl font-extrabold">{label}</h5>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => onChange("سليم")}
          className={`rounded-xl border px-3 py-3 font-bold transition ${
            value === "سليم"
              ? "border-green-500 bg-green-100 text-green-800"
              : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          ✅ {good}
        </button>

        <button
          type="button"
          onClick={() => onChange("يحتاج متابعة")}
          className={`rounded-xl border px-3 py-3 font-bold transition ${
            value === "يحتاج متابعة"
              ? "border-orange-500 bg-orange-100 text-orange-800"
              : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
          }`}
        >
          ⚠️ {follow}
        </button>

        <button
          type="button"
          onClick={() => onChange("يحتاج إصلاح")}
          className={`rounded-xl border px-3 py-3 font-bold transition ${
            value === "يحتاج إصلاح"
              ? "border-red-500 bg-red-100 text-red-800"
              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          🛠️ {repair}
        </button>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-700">{title}</p>
          <h3 className="mt-3 text-4xl font-bold">{value}</h3>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <div className="h-8 w-8">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function statusIcon(value?: string) {
  if (value === "سليم") return <span className="text-xl text-green-600">●</span>;
  if (value === "يحتاج متابعة") return <span className="text-xl text-orange-500">●</span>;
  if (value === "يحتاج إصلاح") return <span className="text-xl text-red-600">●</span>;

  return <span className="text-xl text-slate-300">●</span>;
}

function badge(value: string) {
  if (value === "سليم") {
    return "rounded-full bg-green-100 px-4 py-1 text-xs font-bold text-green-700";
  }

  if (value === "يحتاج متابعة") {
    return "rounded-full bg-orange-100 px-4 py-1 text-xs font-bold text-orange-700";
  }

  if (value === "يحتاج إصلاح") {
    return "rounded-full bg-red-100 px-4 py-1 text-xs font-bold text-red-700";
  }

  return "rounded-full bg-slate-100 px-4 py-1 text-xs font-bold text-slate-700";
}

function sortVehiclesCarsFirst(vehicles: Vehicle[]) {
  return [...vehicles].sort((a, b) => {
    const aType = normalizeVehicleType(a.vehicle_type);
    const bType = normalizeVehicleType(b.vehicle_type);

    if (aType !== bType) {
      if (aType === "car") return -1;
      if (bType === "car") return 1;
    }

    return 0;
  });
}

function normalizeVehicleType(type: string | null) {
  const value = String(type || "").toLowerCase();

  if (
    value === "car" ||
    value === "سيارة" ||
    value.includes("car") ||
    value.includes("سياره")
  ) {
    return "car";
  }

  if (
    value === "bike" ||
    value === "motorcycle" ||
    value === "دراجة" ||
    value.includes("bike") ||
    value.includes("motor")
  ) {
    return "bike";
  }

  return "other";
}