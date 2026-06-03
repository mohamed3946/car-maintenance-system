"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle,
  Fuel,
  Gauge,
  MapPin,
  Save,
  Shield,
  User,
} from "lucide-react";

type VehicleForm = {
  vehicle_type: string;
  serial_number: string;
  plate_number: string;
  city: string;
  vehicle_model: string;
  manufacturing_year: string;
  odometer: string;
  vehicle_status: string;
  color: string;
  insurance_company: string;
  insurance_expiry: string;
  gps_enabled: boolean;
  fuel_sim_enabled: boolean;
  notes: string;
  main_driver_name: string;
  main_driver_identity: string;
  main_driver_phone: string;
  second_driver_name: string;
  second_driver_identity: string;
  second_driver_phone: string;
};

const emptyForm: VehicleForm = {
  vehicle_type: "car",
  serial_number: "",
  plate_number: "",
  city: "",
  vehicle_model: "",
  manufacturing_year: "",
  odometer: "",
  vehicle_status: "متاح",
  color: "",
  insurance_company: "",
  insurance_expiry: "",
  gps_enabled: false,
  fuel_sim_enabled: false,
  notes: "",
  main_driver_name: "",
  main_driver_identity: "",
  main_driver_phone: "",
  second_driver_name: "",
  second_driver_identity: "",
  second_driver_phone: "",
};

export default function EditVehiclePage() {
  return (
    <AppLayout titleKey="vehicles" subtitleKey="vehiclesSubtitle">
      <EditVehicleContent />
    </AppLayout>
  );
}

function EditVehicleContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const params = useParams();
  const router = useRouter();
  const vehicleId = String(params.id);

  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const text = {
    title: ar ? "تعديل المركبة" : "Edit Vehicle",
    subtitle: ar ? "تعديل بيانات المركبة والسائقين والتأمين" : "Edit vehicle, drivers and insurance details",
    back: ar ? "العودة للتفاصيل" : "Back to Details",
    save: ar ? "حفظ التعديلات" : "Save Changes",
    saving: ar ? "جاري الحفظ..." : "Saving...",
    loading: ar ? "جاري تحميل بيانات المركبة..." : "Loading vehicle details...",
    saved: ar ? "تم حفظ التعديلات بنجاح" : "Changes saved successfully",
    errorLoad: ar ? "حدث خطأ أثناء تحميل بيانات المركبة" : "Error loading vehicle",
    errorSave: ar ? "حدث خطأ أثناء حفظ التعديلات" : "Error saving changes",
    vehicleData: ar ? "بيانات المركبة" : "Vehicle Data",
    driverData: ar ? "بيانات السائقين" : "Drivers Data",
    insuranceData: ar ? "التأمين والأنظمة" : "Insurance & Systems",
    notes: ar ? "ملاحظات" : "Notes",
    vehicleType: ar ? "نوع المركبة" : "Vehicle Type",
    car: ar ? "سيارة" : "Car",
    bike: ar ? "دراجة نارية" : "Motorcycle",
    serialNumber: ar ? "الرقم التسلسلي" : "Serial Number",
    plateNumber: ar ? "رقم اللوحة" : "Plate Number",
    city: ar ? "المدينة" : "City",
    vehicleModel: ar ? "موديل المركبة" : "Vehicle Model",
    year: ar ? "سنة الصنع" : "Manufacturing Year",
    odometer: ar ? "عداد الكيلومترات" : "Odometer",
    status: ar ? "حالة المركبة" : "Vehicle Status",
    color: ar ? "اللون" : "Color",
    insuranceCompany: ar ? "شركة التأمين" : "Insurance Company",
    insuranceExpiry: ar ? "انتهاء التأمين" : "Insurance Expiry",
    gps: ar ? "GPS" : "GPS",
    fuelSim: ar ? "شريحة البنزين" : "Fuel SIM",
    mainDriver: ar ? "السائق الرئيسي" : "Main Driver",
    mainDriverName: ar ? "اسم السائق الرئيسي" : "Main Driver Name",
    mainDriverIdentity: ar ? "هوية / إقامة السائق الرئيسي" : "Main Driver ID / Iqama",
    mainDriverPhone: ar ? "جوال السائق الرئيسي" : "Main Driver Phone",
    secondDriver: ar ? "السائق الإضافي" : "Extra Driver",
    secondDriverName: ar ? "اسم السائق الإضافي" : "Extra Driver Name",
    secondDriverIdentity: ar ? "هوية / إقامة السائق الإضافي" : "Extra Driver ID / Iqama",
    secondDriverPhone: ar ? "جوال السائق الإضافي" : "Extra Driver Phone",
    available: ar ? "متاح" : "Available",
    maintenance: ar ? "بالصيانة" : "Under Maintenance",
    stopped: ar ? "متوقف" : "Stopped",
  };

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

    if (error || !data) {
      console.log(error);
      alert(text.errorLoad);
      setLoading(false);
      return;
    }

    setForm({
      vehicle_type: data.vehicle_type || "car",
      serial_number: data.serial_number || "",
      plate_number: data.plate_number || "",
      city: data.city || "",
      vehicle_model: data.vehicle_model || "",
      manufacturing_year: data.manufacturing_year || "",
      odometer: data.odometer || "",
      vehicle_status: data.vehicle_status || (ar ? "متاح" : "Available"),
      color: data.color || "",
      insurance_company: data.insurance_company || "",
      insurance_expiry: data.insurance_expiry || "",
      gps_enabled: Boolean(data.gps_enabled),
      fuel_sim_enabled: Boolean(data.fuel_sim_enabled),
      notes: data.notes || "",
      main_driver_name: data.main_driver_name || "",
      main_driver_identity: data.main_driver_identity || "",
      main_driver_phone: data.main_driver_phone || "",
      second_driver_name: data.second_driver_name || "",
      second_driver_identity: data.second_driver_identity || "",
      second_driver_phone: data.second_driver_phone || "",
    });

    setLoading(false);
  }

  function updateField<K extends keyof VehicleForm>(key: K, value: VehicleForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      vehicle_type: form.vehicle_type || null,
      serial_number: form.serial_number || null,
      plate_number: form.plate_number || null,
      city: form.city || null,
      vehicle_model: form.vehicle_model || null,
      manufacturing_year: form.manufacturing_year || null,
      odometer: form.odometer || null,
      vehicle_status: form.vehicle_status || null,
      color: form.color || null,
      insurance_company: form.insurance_company || null,
      insurance_expiry: form.insurance_expiry || null,
      gps_enabled: form.gps_enabled,
      fuel_sim_enabled: form.fuel_sim_enabled,
      notes: form.notes || null,
      main_driver_name: form.main_driver_name || null,
      main_driver_identity: form.main_driver_identity || null,
      main_driver_phone: form.main_driver_phone || null,
      second_driver_name: form.second_driver_name || null,
      second_driver_identity: form.second_driver_identity || null,
      second_driver_phone: form.second_driver_phone || null,
    };

    const { error } = await supabase
      .from("vehicles")
      .update(payload)
      .eq("id", vehicleId)
      .select("id")
      .single();

    setSaving(false);

    if (error) {
      console.log(error);
      alert(`${text.errorSave}\n${error.message}`);
      return;
    }

    setMessage(text.saved);
    setTimeout(() => router.push(`/cars/${vehicleId}`), 800);
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500 shadow-sm">
        {text.loading}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-600">
            {ar ? "لوحة التحكم / المركبات / تعديل المركبة" : "Dashboard / Vehicles / Edit Vehicle"}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">{text.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{text.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/cars/${vehicleId}`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold hover:bg-slate-50"
          >
            <ArrowRight className="h-5 w-5" />
            {text.back}
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving ? text.saving : text.save}
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 font-bold text-green-700">
          {message}
        </div>
      )}

      <Section title={text.vehicleData} icon={<Car />}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label={text.vehicleType} icon={<Car />}>
            <select
              value={form.vehicle_type}
              onChange={(e) => updateField("vehicle_type", e.target.value)}
              className={inputClass}
            >
              <option value="car">{text.car}</option>
              <option value="bike">{text.bike}</option>
            </select>
          </Field>

          <Field label={text.vehicleModel} icon={<Car />}>
            <input
              value={form.vehicle_model}
              onChange={(e) => updateField("vehicle_model", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.plateNumber} icon={<Save />}>
            <input
              value={form.plate_number}
              onChange={(e) => updateField("plate_number", e.target.value)}
              className={inputClass}
              required
            />
          </Field>

          <Field label={text.serialNumber} icon={<Save />}>
            <input
              value={form.serial_number}
              onChange={(e) => updateField("serial_number", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.city} icon={<MapPin />}>
            <input
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.year} icon={<CalendarDays />}>
            <input
              value={form.manufacturing_year}
              onChange={(e) => updateField("manufacturing_year", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.odometer} icon={<Gauge />}>
            <input
              value={form.odometer}
              onChange={(e) => updateField("odometer", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.color} icon={<Car />}>
            <input
              value={form.color}
              onChange={(e) => updateField("color", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.status} icon={<CheckCircle />}>
            <select
              value={form.vehicle_status}
              onChange={(e) => updateField("vehicle_status", e.target.value)}
              className={inputClass}
            >
              <option value="متاح">{text.available}</option>
              <option value="بالصيانة">{text.maintenance}</option>
              <option value="متوقف">{text.stopped}</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title={text.driverData} icon={<User />}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label={text.mainDriverName} icon={<User />}>
            <input
              value={form.main_driver_name}
              onChange={(e) => updateField("main_driver_name", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.mainDriverIdentity} icon={<User />}>
            <input
              value={form.main_driver_identity}
              onChange={(e) => updateField("main_driver_identity", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.mainDriverPhone} icon={<User />}>
            <input
              value={form.main_driver_phone}
              onChange={(e) => updateField("main_driver_phone", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.secondDriverName} icon={<User />}>
            <input
              value={form.second_driver_name}
              onChange={(e) => updateField("second_driver_name", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.secondDriverIdentity} icon={<User />}>
            <input
              value={form.second_driver_identity}
              onChange={(e) => updateField("second_driver_identity", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.secondDriverPhone} icon={<User />}>
            <input
              value={form.second_driver_phone}
              onChange={(e) => updateField("second_driver_phone", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title={text.insuranceData} icon={<Shield />}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label={text.insuranceCompany} icon={<Shield />}>
            <input
              value={form.insurance_company}
              onChange={(e) => updateField("insurance_company", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label={text.insuranceExpiry} icon={<CalendarDays />}>
            <input
              type="date"
              value={form.insurance_expiry}
              onChange={(e) => updateField("insurance_expiry", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Toggle
            label={text.gps}
            icon={<MapPin />}
            checked={form.gps_enabled}
            onChange={(value) => updateField("gps_enabled", value)}
          />

          <Toggle
            label={text.fuelSim}
            icon={<Fuel />}
            checked={form.fuel_sim_enabled}
            onChange={(value) => updateField("fuel_sim_enabled", value)}
          />
        </div>
      </Section>

      <Section title={text.notes} icon={<Save />}>
        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          className={`${inputClass} min-h-28`}
        />
      </Section>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <div className="text-blue-700">{icon}</div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600">
        <span className="text-blue-700">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 font-bold transition ${
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        className={`h-6 w-11 rounded-full p-1 transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${
            checked ? "translate-x-[-20px]" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
