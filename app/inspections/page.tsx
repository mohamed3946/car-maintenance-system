"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  Car,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Search,
  ShieldAlert,
  Wrench,
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

type QuickFilter =
  | "all"
  | "not_inspected"
  | "inspected"
  | "follow"
  | "repair";

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
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [inspectionType, setInspectionType] =
    useState<InspectionType>("weekly");

  const [quickFilter, setQuickFilter] =
    useState<QuickFilter>("all");

  /*
   * مهم:
   * لا نستخدم:
   * new Date().toISOString().slice(0, 10)
   *
   * لأن toISOString يعتمد على UTC وقد ينتج تاريخ يوم مختلف
   * قرب منتصف الليل.
   *
   * هنا نستخدم تاريخ الجهاز المحلي.
   */
  const today = getLocalDate();

  const text = {
    title: ar ? "الفحص الدوري للمركبات" : "Vehicle Periodic Inspection",

    breadcrumb: ar
      ? "الصيانة / الفحص الدوري"
      : "Maintenance / Periodic Inspection",

    weekly: ar ? "الفحص الأسبوعي" : "Weekly Inspection",
    monthly: ar ? "الفحص الشهري" : "Monthly Inspection",

    today: ar ? "اليوم" : "Today",

    total: ar ? "إجمالي المركبات" : "Total Vehicles",

    inspectedToday: ar
      ? "تم فحصها اليوم"
      : "Inspected Today",

    notInspectedToday: ar
      ? "لم تُفحص اليوم"
      : "Not Inspected Today",

    follow: ar
      ? "تحتاج متابعة"
      : "Need Follow-up",

    repair: ar
      ? "تحتاج إصلاح"
      : "Need Repair",

    searchPlaceholder: ar
      ? "ابحث برقم اللوحة..."
      : "Search by plate number...",

    allVehicles: ar ? "كل المركبات" : "All Vehicles",

    inspected: ar ? "تم الفحص" : "Inspected",

    notInspected: ar
      ? "لم يتم الفحص"
      : "Not Inspected",

    available: ar ? "متاحة" : "Available",

    startInspection: ar
      ? "بدء الفحص"
      : "Start Inspection",

    viewInspection: ar
      ? "عرض فحص اليوم"
      : "View Today's Inspection",

    loading: ar
      ? "جاري تحميل المركبات..."
      : "Loading vehicles...",

    empty: ar
      ? "لا توجد مركبات مطابقة للبحث"
      : "No matching vehicles",

    vehicle: ar ? "المركبة" : "Vehicle",

    vehicleType: ar ? "نوع المركبة" : "Vehicle Type",

    inspectionResult: ar
      ? "نتيجة الفحص"
      : "Inspection Result",

    inspectedAt: ar
      ? "تم الفحص بتاريخ"
      : "Inspected on",

    inspectionPending: ar
      ? "في انتظار الفحص"
      : "Waiting for inspection",

    pageHint: ar
      ? "اختر المركبة من الكروت أو استخدم البحث للوصول إليها بسرعة."
      : "Select a vehicle card or use search to find it quickly.",
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: vehiclesData, error: vehiclesError } =
      await supabase
        .from("vehicles")
        .select(
          "id, plate_number, vehicle_type, vehicle_status, created_at"
        )
        .in("vehicle_status", ["متاح", "Available"])
        .order("created_at", { ascending: false });

    const { data: inspectionsData, error: inspectionsError } =
      await supabase
        .from("vehicle_inspections")
        .select("*")
        .order("created_at", { ascending: false });

    if (vehiclesError) {
      console.log("VEHICLES ERROR:", vehiclesError);

      alert(
        ar
          ? "حدث خطأ أثناء تحميل المركبات"
          : "Error loading vehicles"
      );
    }

    if (inspectionsError) {
      console.log("INSPECTIONS ERROR:", inspectionsError);
    }

    setVehicles(
      sortVehiclesCarsFirst(vehiclesData || [])
    );

    setInspections(inspectionsData || []);

    setLoading(false);
  }

  /*
   * آخر فحص للمركبة من نفس نوع الفحص.
   *
   * نحتفظ به لكي نستفيد منه لاحقًا في صفحة التفاصيل.
   */
  const latestInspectionByVehicle = useMemo(() => {
    const map = new Map<string, Inspection>();

    inspections
      .filter(
        (inspection) =>
          inspection.inspection_type === inspectionType
      )
      .forEach((inspection) => {
        if (!map.has(inspection.vehicle_id)) {
          map.set(
            inspection.vehicle_id,
            inspection
          );
        }
      });

    return map;
  }, [inspections, inspectionType]);

  /*
   * فحوصات اليوم فقط.
   *
   * هذا هو الأساس في الإحصائيات والكروت.
   */
  const todayInspectionByVehicle = useMemo(() => {
    const map = new Map<string, Inspection>();

    inspections
      .filter(
        (inspection) =>
          inspection.inspection_type === inspectionType &&
          inspection.inspection_date === today
      )
      .forEach((inspection) => {
        if (!map.has(inspection.vehicle_id)) {
          map.set(
            inspection.vehicle_id,
            inspection
          );
        }
      });

    return map;
  }, [inspections, inspectionType, today]);

  const inspectedTodayCount = useMemo(() => {
    return vehicles.filter((vehicle) =>
      todayInspectionByVehicle.has(vehicle.id)
    ).length;
  }, [vehicles, todayInspectionByVehicle]);

  const notInspectedTodayCount =
    vehicles.length - inspectedTodayCount;

  const needFollowCount = useMemo(() => {
    return vehicles.filter(
      (vehicle) =>
        todayInspectionByVehicle.get(vehicle.id)
          ?.overall_status === "يحتاج متابعة"
    ).length;
  }, [vehicles, todayInspectionByVehicle]);

  const needRepairCount = useMemo(() => {
    return vehicles.filter(
      (vehicle) =>
        todayInspectionByVehicle.get(vehicle.id)
          ?.overall_status === "يحتاج إصلاح"
    ).length;
  }, [vehicles, todayInspectionByVehicle]);

  const filteredVehicles = useMemo(() => {
    const query = normalizeSearch(search);

    return vehicles.filter((vehicle) => {
      const plate = normalizeSearch(
        vehicle.plate_number || ""
      );

      const matchesSearch =
        !query || plate.includes(query);

      if (!matchesSearch) {
        return false;
      }

      const todayInspection =
        todayInspectionByVehicle.get(vehicle.id);

      if (quickFilter === "not_inspected") {
        return !todayInspection;
      }

      if (quickFilter === "inspected") {
        return Boolean(todayInspection);
      }

      if (quickFilter === "follow") {
        return (
          todayInspection?.overall_status ===
          "يحتاج متابعة"
        );
      }

      if (quickFilter === "repair") {
        return (
          todayInspection?.overall_status ===
          "يحتاج إصلاح"
        );
      }

      return true;
    });
  }, [
    vehicles,
    search,
    quickFilter,
    todayInspectionByVehicle,
  ]);

function handleVehicleClick(
  vehicle: Vehicle,
  todayInspection?: Inspection
) {
  if (todayInspection?.id) {
    router.push(
      `/inspections/${vehicle.id}/view/${todayInspection.id}`
    );
    return;
  }

  router.push(`/inspections/${vehicle.id}`);
}
  return (
    <div
      className="space-y-6"
      dir={ar ? "rtl" : "ltr"}
    >
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div
            className={
              ar ? "text-right" : "text-left"
            }
          >
            <p className="text-sm font-bold text-blue-600">
              {text.breadcrumb}
            </p>

            <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
              {text.title}
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              {text.pageHint}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3">
              <p className="text-xs font-bold text-blue-500">
                {text.today}
              </p>

              <p className="mt-1 font-black text-blue-900">
                {formatDisplayDate(today, ar)}
              </p>
            </div>

            <select
              value={inspectionType}
              onChange={(e) => {
                setInspectionType(
                  e.target.value as InspectionType
                );

                setQuickFilter("all");
              }}
              className="min-w-[190px] rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 outline-none transition focus:border-blue-500"
            >
              <option value="weekly">
                {text.weekly}
              </option>

              <option value="monthly">
                {text.monthly}
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title={text.total}
          value={vehicles.length}
          icon={<Car className="h-6 w-6" />}
          tone="blue"
          active={quickFilter === "all"}
          onClick={() => setQuickFilter("all")}
        />

        <StatCard
          title={text.inspectedToday}
          value={inspectedTodayCount}
          icon={
            <CheckCircle2 className="h-6 w-6" />
          }
          tone="green"
          active={quickFilter === "inspected"}
          onClick={() =>
            setQuickFilter("inspected")
          }
        />

        <StatCard
          title={text.notInspectedToday}
          value={notInspectedTodayCount}
          icon={<Clock3 className="h-6 w-6" />}
          tone="slate"
          active={
            quickFilter === "not_inspected"
          }
          onClick={() =>
            setQuickFilter("not_inspected")
          }
        />

        <StatCard
          title={text.follow}
          value={needFollowCount}
          icon={
            <ShieldAlert className="h-6 w-6" />
          }
          tone="orange"
          active={quickFilter === "follow"}
          onClick={() => setQuickFilter("follow")}
        />

        <StatCard
          title={text.repair}
          value={needRepairCount}
          icon={<Wrench className="h-6 w-6" />}
          tone="red"
          active={quickFilter === "repair"}
          onClick={() => setQuickFilter("repair")}
        />
      </section>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="relative">
          <Search
            className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 ${
              ar ? "right-5" : "left-5"
            }`}
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            autoComplete="off"
            placeholder={text.searchPlaceholder}
            className={`h-16 w-full rounded-2xl border border-slate-200 bg-slate-50 text-lg font-bold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
              ar
                ? "pr-14 pl-5 text-right"
                : "pl-14 pr-5 text-left"
            }`}
          />
        </div>

        {/* Quick Filters */}

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterButton
            active={quickFilter === "all"}
            onClick={() =>
              setQuickFilter("all")
            }
          >
            {text.allVehicles}
            <CountBadge>
              {vehicles.length}
            </CountBadge>
          </FilterButton>

          <FilterButton
            active={
              quickFilter === "not_inspected"
            }
            onClick={() =>
              setQuickFilter("not_inspected")
            }
          >
            {text.notInspectedToday}
            <CountBadge>
              {notInspectedTodayCount}
            </CountBadge>
          </FilterButton>

          <FilterButton
            active={
              quickFilter === "inspected"
            }
            onClick={() =>
              setQuickFilter("inspected")
            }
          >
            {text.inspectedToday}
            <CountBadge>
              {inspectedTodayCount}
            </CountBadge>
          </FilterButton>

          <FilterButton
            active={quickFilter === "follow"}
            onClick={() =>
              setQuickFilter("follow")
            }
          >
            {text.follow}
            <CountBadge>
              {needFollowCount}
            </CountBadge>
          </FilterButton>

          <FilterButton
            active={quickFilter === "repair"}
            onClick={() =>
              setQuickFilter("repair")
            }
          >
            {text.repair}
            <CountBadge>
              {needRepairCount}
            </CountBadge>
          </FilterButton>
        </div>
      </section>

      {/* ======================================================
          VEHICLES
      ====================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {text.allVehicles}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {filteredVehicles.length}{" "}
              {ar ? "مركبة" : "Vehicles"}
            </p>
          </div>

          {(search ||
            quickFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setQuickFilter("all");
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              {ar
                ? "إلغاء البحث والفلاتر"
                : "Clear Search & Filters"}
            </button>
          )}
        </div>

        {loading ? (
          <LoadingVehicles ar={ar} />
        ) : filteredVehicles.length === 0 ? (
          <EmptyState
            ar={ar}
            search={search}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredVehicles.map((vehicle) => {
              const todayInspection =
                todayInspectionByVehicle.get(
                  vehicle.id
                );

              const previousInspection =
                latestInspectionByVehicle.get(
                  vehicle.id
                );

              return (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  todayInspection={
                    todayInspection
                  }
                  previousInspection={
                    previousInspection
                  }
                  ar={ar}
                  text={text}
                  onClick={() =>
                   handleVehicleClick(vehicle, todayInspection)
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   VEHICLE CARD
============================================================ */

function VehicleCard({
  vehicle,
  todayInspection,
  previousInspection,
  ar,
  text,
  onClick,
}: {
  vehicle: Vehicle;
  todayInspection?: Inspection;
  previousInspection?: Inspection;
  ar: boolean;
  text: Record<string, string>;
  onClick: () => void;
}) {
  const inspectedToday =
    Boolean(todayInspection);

  const status =
    todayInspection?.overall_status;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[220px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-start shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
    >
      {/* Card Header */}

      <div className="flex w-full items-start justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Car className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400">
              {text.vehicle}
            </p>

            <h3 className="mt-1 text-xl font-black text-slate-900">
              {vehicle.plate_number || "-"}
            </h3>
          </div>
        </div>

        {inspectedToday ? (
          <StatusDot
            status={
              status || "سليم"
            }
            ar={ar}
          />
        ) : (
          <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
            {text.notInspected}
          </span>
        )}
      </div>

      {/* Card Body */}

      <div className="flex flex-1 flex-col p-4">
        <div className="grid grid-cols-2 gap-3">
          <InfoBox
            label={text.vehicleType}
            value={formatVehicleType(
              vehicle.vehicle_type,
              ar
            )}
          />

          <InfoBox
            label={ar ? "حالة المركبة" : "Vehicle Status"}
            value={
              vehicle.vehicle_status ||
              text.available
            }
          />
        </div>

        <div className="mt-4 flex-1">
          {todayInspection ? (
            <div
              className={`rounded-2xl border p-3 ${inspectionBoxClass(
                todayInspection.overall_status
              )}`}
            >
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 shrink-0" />

                <p className="text-sm font-black">
                  {text.inspectionResult}:{" "}
                  {displayStatus(
                    todayInspection.overall_status,
                    ar
                  )}
                </p>
              </div>

              <p className="mt-1 text-xs font-bold opacity-70">
                {text.inspectedAt}:{" "}
                {formatDisplayDate(
                  todayInspection.inspection_date,
                  ar
                )}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock3 className="h-4 w-4" />

                <p className="text-sm font-bold">
                  {text.inspectionPending}
                </p>
              </div>

              {previousInspection &&
                previousInspection.inspection_date !==
                  getLocalDate() && (
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {ar
                      ? "آخر فحص: "
                      : "Last inspection: "}

                    {formatDisplayDate(
                      previousInspection.inspection_date,
                      ar
                    )}
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Action */}

        <div
          className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl font-black transition ${
            inspectedToday
              ? "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
              : "bg-blue-600 text-white group-hover:bg-blue-700"
          }`}
        >
          {inspectedToday ? (
            <>
              <ClipboardCheck className="h-5 w-5" />
              {text.viewInspection}
            </>
          ) : (
            <>
              <ClipboardCheck className="h-5 w-5" />
              {text.startInspection}
            </>
          )}
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  icon,
  tone,
  active,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone:
    | "blue"
    | "green"
    | "orange"
    | "red"
    | "slate";
  active: boolean;
  onClick: () => void;
}) {
  const toneClasses = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      ring: "border-blue-300 ring-blue-100",
    },

    green: {
      icon: "bg-emerald-50 text-emerald-700",
      ring:
        "border-emerald-300 ring-emerald-100",
    },

    orange: {
      icon: "bg-orange-50 text-orange-700",
      ring:
        "border-orange-300 ring-orange-100",
    },

    red: {
      icon: "bg-red-50 text-red-700",
      ring: "border-red-300 ring-red-100",
    },

    slate: {
      icon: "bg-slate-100 text-slate-700",
      ring:
        "border-slate-300 ring-slate-100",
    },
  };

  const style = toneClasses[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border bg-white p-5 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? `${style.ring} ring-4`
          : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-4xl font-black text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}
        >
          {icon}
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {children}
    </button>
  );
}

function CountBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black/10 px-1.5 text-xs font-black">
      {children}
    </span>
  );
}

/* ============================================================
   INFO BOX
============================================================ */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-bold text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

function StatusDot({
  status,
  ar,
}: {
  status: StatusValue;
  ar: boolean;
}) {
  if (status === "سليم") {
    return (
      <span className="whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
        ● {ar ? "سليم" : "Good"}
      </span>
    );
  }

  if (status === "يحتاج متابعة") {
    return (
      <span className="whitespace-nowrap rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
        ● {ar ? "متابعة" : "Follow-up"}
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
      ● {ar ? "يحتاج إصلاح" : "Repair"}
    </span>
  );
}

function inspectionBoxClass(
  status: StatusValue
) {
  if (status === "سليم") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (status === "يحتاج متابعة") {
    return "border-orange-100 bg-orange-50 text-orange-700";
  }

  return "border-red-100 bg-red-50 text-red-700";
}

function displayStatus(
  status: StatusValue,
  ar: boolean
) {
  if (ar) return status;

  if (status === "سليم") return "Good";

  if (status === "يحتاج متابعة") {
    return "Need Follow-up";
  }

  return "Need Repair";
}

/* ============================================================
   LOADING / EMPTY
============================================================ */

function LoadingVehicles({
  ar,
}: {
  ar: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(
        (item) => (
          <div
            key={item}
            className="h-[245px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50"
          />
        )
      )}

      <p className="sr-only">
        {ar
          ? "جاري تحميل المركبات"
          : "Loading vehicles"}
      </p>
    </div>
  );
}

function EmptyState({
  ar,
  search,
}: {
  ar: boolean;
  search: string;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Search className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-lg font-black text-slate-700">
        {ar
          ? "لا توجد مركبات"
          : "No vehicles found"}
      </h3>

      <p className="mt-2 max-w-md text-sm font-medium text-slate-400">
        {search
          ? ar
            ? `لا توجد مركبة مطابقة للبحث "${search}"`
            : `No vehicle matches "${search}"`
          : ar
          ? "لا توجد مركبات مطابقة للفلاتر الحالية."
          : "No vehicles match the current filters."}
      </p>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(
  dateString: string,
  ar: boolean
) {
  if (!dateString) return "-";

  const [year, month, day] =
    dateString.split("-");

  if (!year || !month || !day) {
    return dateString;
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return new Intl.DateTimeFormat(
    ar ? "ar-SA" : "en-GB",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

function normalizeSearch(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "");
}

function formatVehicleType(
  type: string | null,
  ar: boolean
) {
  const normalized =
    normalizeVehicleType(type);

  if (normalized === "car") {
    return ar ? "سيارة" : "Car";
  }

  if (normalized === "bike") {
    return ar ? "دراجة" : "Motorcycle";
  }

  return type || (ar ? "غير محدد" : "Unknown");
}

function sortVehiclesCarsFirst(
  vehicles: Vehicle[]
) {
  return [...vehicles].sort((a, b) => {
    const aType = normalizeVehicleType(
      a.vehicle_type
    );

    const bType = normalizeVehicleType(
      b.vehicle_type
    );

    if (aType !== bType) {
      if (aType === "car") return -1;

      if (bType === "car") return 1;
    }

    return String(
      a.plate_number || ""
    ).localeCompare(
      String(b.plate_number || ""),
      "ar",
      {
        numeric: true,
      }
    );
  });
}

function normalizeVehicleType(
  type: string | null
) {
  const value = String(type || "")
    .toLowerCase()
    .trim();

  if (
    value === "car" ||
    value === "سيارة" ||
    value === "سياره" ||
    value.includes("car") ||
    value.includes("سياره") ||
    value.includes("سيارة")
  ) {
    return "car";
  }

  if (
    value === "bike" ||
    value === "motorcycle" ||
    value === "دراجة" ||
    value === "دراجه" ||
    value.includes("bike") ||
    value.includes("motor")
  ) {
    return "bike";
  }

  return "other";
}