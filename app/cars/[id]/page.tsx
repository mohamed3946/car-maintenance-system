"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  ArrowRight,
  Ban,
  CalendarDays,
  Car,
  Droplets,
  Fuel,
  Gauge,
  MapPin,
  Pencil,
  Phone,
  Save,
  Shield,
  Trash2,
  User,
  Wrench,
  AlertTriangle,
  CheckCircle,
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
  gps_enabled: boolean | null;
  fuel_sim_enabled: boolean | null;
  notes: string | null;
  main_driver_name: string | null;
  main_driver_identity: string | null;
  main_driver_phone: string | null;
  second_driver_name: string | null;
  second_driver_identity: string | null;
  second_driver_phone: string | null;
};

export default function VehicleDetailsPage() {
  return (
    <AppLayout titleKey="vehicles" subtitleKey="vehiclesSubtitle">
      <VehicleDetailsContent />
    </AppLayout>
  );
}

function VehicleDetailsContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const params = useParams();
  const router = useRouter();

  const vehicleId = String(params.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  async function fetchVehicle() {
    setLoading(true);

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .single();

    if (error) {
      console.log(error);
      setVehicle(null);
      setLoading(false);
      return;
    }

    setVehicle(data);
    setLoading(false);
  }

  async function stopVehicle() {
    const ok = confirm(ar ? "هل تريد إيقاف المركبة؟" : "Stop this vehicle?");
    if (!ok) return;

    setActionLoading(true);

    const { error } = await supabase
      .from("vehicles")
      .update({ vehicle_status: ar ? "متوقف" : "Stopped" })
      .eq("id", vehicleId);

    setActionLoading(false);

    if (error) {
      console.log(error);
      alert(ar ? "حدث خطأ أثناء إيقاف المركبة" : "Error stopping vehicle");
      return;
    }

    await fetchVehicle();
  }
  async function activateVehicle() {
  const ok = confirm(ar ? "هل تريد إعادة تشغيل المركبة؟" : "Activate this vehicle?");
  if (!ok) return;

  setActionLoading(true);

  const { error } = await supabase
    .from("vehicles")
    .update({
      vehicle_status: ar ? "متاح" : "Available",
    })
    .eq("id", vehicleId);

  setActionLoading(false);

  if (error) {
    console.log(error);
    alert(ar ? "حدث خطأ أثناء تشغيل المركبة" : "Error activating vehicle");
    return;
  }

  await fetchVehicle();
}

  async function deleteVehicle() {
    const ok = confirm(
      ar ? "هل تريد حذف المركبة نهائيًا؟" : "Delete this vehicle permanently?"
    );
    if (!ok) return;

    setActionLoading(true);

    const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);

    setActionLoading(false);

    if (error) {
      console.log(error);
      alert(ar ? "حدث خطأ أثناء حذف المركبة" : "Error deleting vehicle");
      return;
    }

    router.push("/cars");
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500 shadow-sm">
        {ar ? "جاري تحميل بيانات المركبة..." : "Loading vehicle details..."}
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-extrabold">
          {ar ? "لم يتم العثور على المركبة" : "Vehicle not found"}
        </h2>

        <Link
          href="/cars"
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
        >
          {ar ? "العودة للمركبات" : "Back to Vehicles"}
        </Link>
      </div>
    );
  }

  const isBike = vehicle.vehicle_type === "bike";
  const vehicleImage = isBike ? "/bike.png" : "/car.png";

  const vehicleTypeText = isBike
    ? ar
      ? "دراجة نارية"
      : "Motorcycle"
    : ar
    ? "سيارة"
    : "Car";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-600">
            {ar
              ? "لوحة التحكم / المركبات / تفاصيل المركبة"
              : "Dashboard / Vehicles / Vehicle Details"}
          </p>

          <h1 className="mt-2 text-3xl font-extrabold">
            {ar ? "تفاصيل المركبة" : "Vehicle Details"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {ar
              ? "عرض وإدارة بيانات المركبة وسجلها"
              : "View and manage vehicle information"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/cars"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold hover:bg-slate-50"
          >
            <ArrowRight className="h-5 w-5" />
            {ar ? "العودة للمركبات" : "Back"}
          </Link>

          <Link
            href={`/cars/${vehicle.id}/edit`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold hover:bg-slate-50"
          >
            <Pencil className="h-5 w-5" />
            {ar ? "تعديل" : "Edit"}
          </Link>

          {vehicle.vehicle_status === "متوقف" || vehicle.vehicle_status === "Stopped" ? (
  <button
    onClick={activateVehicle}
    disabled={actionLoading}
    className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-5 py-3 font-bold text-green-700 disabled:opacity-60"
  >
    <CheckCircle className="h-5 w-5" />
    {ar ? "تشغيل المركبة" : "Activate Vehicle"}
  </button>
) : (
  <button
    onClick={stopVehicle}
    disabled={actionLoading}
    className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-5 py-3 font-bold text-orange-700 disabled:opacity-60"
  >
    <Ban className="h-5 w-5" />
    {ar ? "إيقاف المركبة" : "Stop Vehicle"}
  </button>
)}

          <button
            onClick={deleteVehicle}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-5 py-3 font-bold text-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-5 w-5" />
            {ar ? "حذف المركبة" : "Delete"}
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[330px_1fr_390px]">
        <div className="space-y-5">
          <Card title={ar ? "قائد المركبة الحالي" : "Current Driver"} icon={<User />}>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <User className="h-8 w-8" />
              </div>

              <h3 className="mt-3 text-lg font-extrabold">
                {vehicle.main_driver_name || "-"}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {vehicle.main_driver_phone || "-"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {vehicle.main_driver_identity || ""}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <Link
                  href={`/cars/${vehicle.id}/edit`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white py-3 font-bold text-blue-700 hover:bg-blue-50"
                >
                  <ArrowRight className="h-5 w-5" />
                  {ar ? "تغيير قائد المركبة" : "Change Driver"}
                </Link>

                <Link
                  href={`/cars/${vehicle.id}/edit`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                >
                  <User className="h-5 w-5" />
                  {ar ? "إضافة قائد إضافي" : "Add Extra Driver"}
                </Link>
              </div>
            </div>
          </Card>

          {vehicle.second_driver_name && (
            <Card title={ar ? "السائق الإضافي" : "Extra Driver"} icon={<User />}>
              <InfoRow label={ar ? "الاسم" : "Name"} value={vehicle.second_driver_name} />
              <InfoRow
                label={ar ? "الهوية / الإقامة" : "ID / Iqama"}
                value={vehicle.second_driver_identity || "-"}
              />
              <InfoRow label={ar ? "الجوال" : "Phone"} value={vehicle.second_driver_phone || "-"} />
            </Card>
          )}

          <Card title={ar ? "حالة المركبة" : "Vehicle Status"} icon={<CheckCircle />}>
            <InfoRow
              label={ar ? "الحالة الحالية" : "Current Status"}
              value={vehicle.vehicle_status || "-"}
              green
            />
            <InfoRow label={ar ? "المدينة" : "City"} value={vehicle.city || "-"} />
            <InfoRow label={ar ? "اللون" : "Color"} value={vehicle.color || "-"} />
          </Card>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold">
                {vehicle.vehicle_model || (ar ? "مركبة بدون اسم" : "Unnamed Vehicle")}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {vehicle.serial_number || "-"} • {vehicle.manufacturing_year || "-"}
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-bold text-blue-700">
              {vehicle.manufacturing_year || "-"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Info icon={<Car />} label={ar ? "نوع المركبة" : "Vehicle Type"} value={vehicleTypeText} />
            <Info icon={<Save />} label={ar ? "الرقم التسلسلي" : "Serial Number"} value={vehicle.serial_number || "-"} />
            <Info icon={<Save />} label={ar ? "رقم اللوحة" : "Plate Number"} value={vehicle.plate_number || "-"} />
            <Info icon={<MapPin />} label={ar ? "المدينة" : "City"} value={vehicle.city || "-"} />
            <Info icon={<Gauge />} label={ar ? "العداد الحالي" : "Current Odometer"} value={`${vehicle.odometer || "-"} KM`} />
            <Info icon={<CalendarDays />} label={ar ? "سنة الصنع" : "Manufacturing Year"} value={vehicle.manufacturing_year || "-"} />
            <Info icon={<Shield />} label={ar ? "شركة التأمين" : "Insurance Company"} value={vehicle.insurance_company || "-"} />
            <Info icon={<CalendarDays />} label={ar ? "انتهاء التأمين" : "Insurance Expiry"} value={vehicle.insurance_expiry || "-"} />
            <Info
              icon={<MapPin />}
              label="GPS"
              value={
                vehicle.gps_enabled
                  ? ar
                    ? "متوفر"
                    : "Available"
                  : ar
                  ? "غير متوفر"
                  : "Not Available"
              }
            />
            <Info
              icon={<Fuel />}
              label={ar ? "شريحة البنزين" : "Fuel SIM"}
              value={
                vehicle.fuel_sim_enabled
                  ? ar
                    ? "متوفرة"
                    : "Available"
                  : ar
                  ? "غير متوفرة"
                  : "Not Available"
              }
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-4 inline-flex rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-700">
            {vehicle.vehicle_status || "-"}
          </span>

          <div className="flex h-72 items-center justify-center">
            <Image
              src={vehicleImage}
              alt="vehicle"
              width={360}
              height={260}
              className="max-h-72 w-full object-contain"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-slate-800">
            {ar ? "إجراءات المركبة" : "Vehicle Actions"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {ar
              ? "إدارة الصيانة والزيوت والحوادث الخاصة بالمركبة"
              : "Manage maintenance, oil changes and accidents"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href={`/maintenance/add?vehicle=${vehicle.id}`}
            className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 transition-all hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-100"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Wrench className="h-8 w-8" />
              </div>

              <div className="text-right">
                <h3 className="text-lg font-extrabold text-blue-700">
                  {ar ? "تسجيل صيانة" : "Add Maintenance"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {ar ? "إضافة عملية صيانة جديدة" : "Add new maintenance"}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href={`/oil-changes/add?vehicle=${vehicle.id}`}
            className="group rounded-2xl border border-orange-100 bg-orange-50 p-5 transition-all hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-100"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                <Droplets className="h-8 w-8" />
              </div>

              <div className="text-right">
                <h3 className="text-lg font-extrabold text-orange-600">
                  {ar ? "تغيير زيت" : "Oil Change"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {ar ? "إضافة تغيير زيت جديد" : "Add oil change"}
                </p>
              </div>
            </div>
          </Link>

          <Link
          href={`/maintenance/incidents?vehicle_id=${vehicle.id}`}
            className="group rounded-2xl border border-red-100 bg-red-50 p-5 transition-all hover:-translate-y-1 hover:border-red-200 hover:bg-red-100"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                <AlertTriangle className="h-8 w-8" />
              </div>

              <div className="text-right">
                <h3 className="text-lg font-extrabold text-red-600">
                  {ar ? "تسجيل حادث / عطل" : "Record Accident"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {ar ? "إضافة حادث أو عطل جديد" : "Add accident or issue"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <MiniStat title={ar ? "عداد الكيلومترات" : "Odometer"} value={`${vehicle.odometer || "-"} KM`} icon={<Gauge />} />
        <MiniStat title={ar ? "التأمين" : "Insurance"} value={vehicle.insurance_expiry || "-"} icon={<Shield />} />
        <MiniStat
          title="GPS"
          value={
            vehicle.gps_enabled
              ? ar
                ? "متوفر"
                : "Available"
              : ar
              ? "غير متوفر"
              : "Not Available"
          }
          icon={<MapPin />}
        />
        <MiniStat
          title={ar ? "شريحة البنزين" : "Fuel SIM"}
          value={
            vehicle.fuel_sim_enabled
              ? ar
                ? "متوفرة"
                : "Available"
              : ar
              ? "غير متوفرة"
              : "Not Available"
          }
          icon={<Fuel />}
        />
        <MiniStat title={ar ? "الحالة" : "Status"} value={vehicle.vehicle_status || "-"} icon={<CheckCircle />} />
      </section>
    </>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">{title}</h2>
        {icon && <div className="text-blue-700">{icon}</div>}
      </div>
      {children}
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="text-slate-500">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  green,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={green ? "font-bold text-green-700" : "font-bold"}>{value}</span>
    </div>
  );
}

function MiniStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-600">{title}</p>
          <h3 className="mt-3 text-xl font-extrabold">{value}</h3>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
}
