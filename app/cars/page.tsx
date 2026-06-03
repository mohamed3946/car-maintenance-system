"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";

import {
  CheckCircle,
  Download,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Truck,
  User,
} from "lucide-react";

type Vehicle = {
  id: string;
  vehicle_type: string | null;
  serial_number: string | null;
  plate_number: string | null;
  city: string | null;
  vehicle_model: string | null;
  manufacturing_year: string | null;
  odometer: string | null;
  vehicle_status: string | null;
  color: string | null;
  insurance_company: string | null;
  insurance_expiry: string | null;
  main_driver_name: string | null;
  created_at?: string;
};

export default function CarsPage() {
  return (
    <AppLayout titleKey="vehicles" subtitleKey="vehiclesSubtitle">
      <CarsContent />
    </AppLayout>
  );
}

function CarsContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    setLoading(true);

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      alert(ar ? "حدث خطأ أثناء تحميل المركبات" : "Error loading vehicles");
      setLoading(false);
      return;
    }

    setVehicles(data || []);
    setLoading(false);
  }

  function exportCsv() {
    const headers = ar
      ? ["المركبة", "اللوحة", "قائد المركبة", "عداد الكيلومترات", "الحالة", "التأمين"]
      : ["Vehicle", "Plate", "Driver", "Kilometers", "Status", "Insurance"];

    const rows = filteredVehicles.map((v) => [
      v.vehicle_model || "",
      v.plate_number || "",
      v.main_driver_name || "",
      v.odometer || "",
      v.vehicle_status || "",
      v.insurance_expiry || "",
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    link.download = ar
      ? `المركبات-${new Date().toISOString().slice(0, 10)}.csv`
      : `vehicles-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const text = {
    title: ar ? "المركبات" : "Vehicles",
    addVehicle: ar ? "إضافة مركبة" : "Add Vehicle",
    export: ar ? "تصدير" : "Export",
    filters: ar ? "المزيد من الفلاتر" : "More Filters",
    allStatus: ar ? "كل الحالات" : "All Status",
    allTypes: ar ? "كل الأنواع" : "All Types",

    search: ar
      ? "ابحث برقم المركبة أو اللوحة أو اسم السائق..."
      : "Search by vehicle, plate or driver...",

    totalVehicles: ar ? "إجمالي المركبات" : "Total Vehicles",
    available: ar ? "متاح للعمل" : "Available",
    maintenance: ar ? "بالصيانة" : "Maintenance",
    insuranceExpired: ar ? "التأمين المنتهي" : "Insurance Expired",

    vehicleList: ar ? "قائمة المركبات" : "Vehicle List",

    vehicle: ar ? "المركبة" : "Vehicle",
    plate: ar ? "اللوحة" : "Plate",
    driver: ar ? "قائد المركبة" : "Driver",
    km: ar ? "عداد الكيلومترات" : "KM",
    insurance: ar ? "التأمين" : "Insurance",
    status: ar ? "الحالة" : "Status",
    actions: ar ? "الإجراءات" : "Actions",

    loading: ar ? "جاري تحميل المركبات..." : "Loading vehicles...",

    empty: ar
      ? "لا توجد مركبات محفوظة حتى الآن"
      : "No vehicles saved yet",

    details: ar ? "عرض التفاصيل" : "View Details",
    edit: ar ? "تعديل" : "Edit",
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        `${v.vehicle_model || ""} ${v.plate_number || ""} ${v.serial_number || ""} ${v.main_driver_name || ""}`
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        !statusFilter || v.vehicle_status === statusFilter;

      const matchesType =
        !typeFilter || v.vehicle_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, search, statusFilter, typeFilter]);

  const total = vehicles.length;

  const availableCount = vehicles.filter(
    (v) =>
      v.vehicle_status === "متاح" ||
      v.vehicle_status === "Available"
  ).length;

  const maintenanceCount = vehicles.filter(
    (v) =>
      v.vehicle_status === "بالصيانة" ||
      v.vehicle_status === "Under Maintenance"
  ).length;

  return (
    <>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/cars/add"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              {text.addVehicle}
            </Link>

            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-5 w-5" />
              {text.export}
            </button>
          </div>

          <div
            className={`w-full ${
              ar ? "order-1 text-right" : "order-2 text-left"
            }`}
          >
            <p className="text-sm text-blue-600">
              {ar
                ? "لوحة التحكم / المركبات"
                : "Dashboard / Vehicles"}
            </p>

            <h2
              className={`mt-1 text-3xl font-bold ${
                ar ? "text-right" : "text-left"
              }`}
            >
              {text.title}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setTypeFilter("");
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold hover:bg-slate-50"
          >
            <Filter className="h-5 w-5" />
            {text.filters}
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="">{text.allStatus}</option>

            <option value="متاح">
              {ar ? "متاح" : "Available"}
            </option>

            <option value="بالصيانة">
              {ar ? "بالصيانة" : "Under Maintenance"}
            </option>

            <option value="متوقف">
              {ar ? "متوقف" : "Stopped"}
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="">{text.allTypes}</option>

            <option value="car">
              {ar ? "سيارة" : "Car"}
            </option>

            <option value="bike">
              {ar ? "دراجة نارية" : "Motorcycle"}
            </option>
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
        <Card
          title={text.totalVehicles}
          value={String(total)}
          note={ar ? "كل المركبات" : "All Vehicles"}
          icon={<Truck />}
        />

        <Card
          title={text.available}
          value={String(availableCount)}
          note={ar ? "جاهزة للعمل" : "Ready"}
          icon={<CheckCircle />}
        />

        <Card
          title={text.maintenance}
          value={String(maintenanceCount)}
          note={ar ? "تحت الصيانة" : "Under Maintenance"}
          icon={<ShieldAlert />}
        />

        <Card
          title={text.insuranceExpired}
          value="0"
          note={ar ? "منتهي" : "Expired"}
          icon={<ShieldAlert />}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {text.vehicleList}
          </h2>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-100 p-10 text-center font-bold text-slate-500">
            {text.loading}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 p-10 text-center font-bold text-slate-500">
            {text.empty}
          </div>
        ) : (
          <div className="overflow-visible rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <TH>{text.vehicle}</TH>
                  <TH>{text.plate}</TH>
                  <TH>{text.driver}</TH>
                  <TH>{text.km}</TH>
                  <TH>{text.insurance}</TH>
                  <TH>{text.status}</TH>
                  <TH>{text.actions}</TH>
                </tr>
              </thead>

              <tbody>
                {filteredVehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/cars/${v.id}`}
                        className="flex items-center gap-3 transition hover:opacity-80"
                      >
                        <div className="flex h-16 w-24 items-center justify-center rounded-2xl bg-slate-100">
                          <Image
                            src={
                              v.vehicle_type === "bike"
                                ? "/bike.png"
                                : "/car.png"
                            }
                            alt={v.vehicle_model || "vehicle"}
                            width={100}
                            height={70}
                            className="object-contain"
                          />
                        </div>

                        <div>
                          <p className="font-bold">
                            {v.vehicle_model ||
                              (ar
                                ? "مركبة بدون اسم"
                                : "Unnamed Vehicle")}
                          </p>

                          <p className="text-xs text-slate-500">
                            {v.serial_number || "-"} •{" "}
                            {v.city || "-"}
                          </p>
                        </div>
                      </Link>
                    </td>

                    <td className="px-4 py-3 font-bold">
                      {v.plate_number || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        {v.main_driver_name || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold">
                      {v.odometer || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {v.insurance_expiry || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span className={badge(v.vehicle_status || "")}>
                        {v.vehicle_status || "-"}
                      </span>
                    </td>

                    <td className="relative px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/cars/${v.id}`}
                          className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100"
                          title={text.details}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/cars/${v.id}/edit`}
                          className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100"
                          title={text.edit}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-right font-bold">
      {children}
    </th>
  );
}

function Card({
  title,
  value,
  note,
  icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-700">{title}</p>

          <h3 className="mt-3 text-4xl font-bold">
            {value}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {note}
          </p>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <div className="h-8 w-8">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function badge(value: string) {
  if (value === "متاح" || value === "Available") {
    return "rounded-full bg-green-100 px-4 py-1 text-xs font-bold text-green-700";
  }

  if (
    value === "بالصيانة" ||
    value === "Under Maintenance"
  ) {
    return "rounded-full bg-orange-100 px-4 py-1 text-xs font-bold text-orange-700";
  }

  if (value === "متوقف" || value === "Stopped") {
    return "rounded-full bg-red-100 px-4 py-1 text-xs font-bold text-red-700";
  }

  return "rounded-full bg-slate-100 px-4 py-1 text-xs font-bold text-slate-700";
}