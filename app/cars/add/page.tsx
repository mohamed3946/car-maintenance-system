"use client";

export const dynamic = "force-dynamic";
import * as XLSX from "xlsx";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  ArrowRight,
  Bike,
  Car,
  Check,
  CloudUpload,
  Fuel,
  IdCard,
  MapPin,
  Phone,
  Plus,
  Save,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";

type VehicleType = "car" | "bike";

export default function AddCarPage() {
  return (
    <AppLayout titleKey="addVehicleTitle" subtitleKey="addVehicleSubtitle">
      <AddVehicleContent />
    </AppLayout>
  );
}

function AddVehicleContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [loading, setLoading] = useState(false);

  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [fuelSimEnabled, setFuelSimEnabled] = useState(true);
  const [mainAuthorized, setMainAuthorized] = useState(true);
  const [secondAuthorized, setSecondAuthorized] = useState(false);
  const [showSecondDriver, setShowSecondDriver] = useState(false);

  const [serialNumber, setSerialNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [city, setCity] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [manufacturingYear, setManufacturingYear] = useState("");
  const [odometer, setOdometer] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState("");
  const [color, setColor] = useState("");

  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [notes, setNotes] = useState("");

  const [mainDriverName, setMainDriverName] = useState("");
  const [mainDriverIdentity, setMainDriverIdentity] = useState("");
  const [mainDriverPhone, setMainDriverPhone] = useState("");

  const [secondDriverName, setSecondDriverName] = useState("");
  const [secondDriverIdentity, setSecondDriverIdentity] = useState("");
  const [secondDriverPhone, setSecondDriverPhone] = useState("");

  const vehicleImage = vehicleType === "car" ? "/car.png" : "/bike.png";

  const cities = ar
    ? ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران", "الطائف", "بريدة", "تبوك", "أبها", "خميس مشيط", "جازان", "نجران", "ينبع", "الجبيل", "الأحساء", "الخرج"]
    : ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Dhahran", "Taif", "Buraidah", "Tabuk", "Abha", "Khamis Mushait", "Jazan", "Najran", "Yanbu", "Jubail", "Al Ahsa", "Al Kharj"];

  const colors = ar
    ? ["أبيض", "أسود", "رصاصي", "فضي", "أحمر", "أزرق", "أخضر", "بني", "ذهبي", "بيج"]
    : ["White", "Black", "Gray", "Silver", "Red", "Blue", "Green", "Brown", "Gold", "Beige"];

  const statuses = ar
    ? ["متاح", "بالصيانة", "متوقف", "حادث", "خارج الخدمة"]
    : ["Available", "Under Maintenance", "Stopped", "Accident", "Out of Service"];

  const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

  const insuranceCompanies = ar
    ? ["التعاونية", "ميدغلف", "تكافل الراجحي", "ولاء", "سلامة", "ملاذ", "الدرع العربي", "أخرى"]
    : ["Tawuniya", "MedGulf", "Al Rajhi Takaful", "Walaa", "Salama", "Malath", "Arabian Shield", "Other"];
  async function handleExcelImport(e: React.ChangeEvent<HTMLInputElement>) {
  try {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    const vehiclesToInsert = rows
      .filter((row) => row["رقم اللوحة"] || row["الرقم التسلسلي"])
      .map((row) => ({
        vehicle_type:
          String(row["نوع المركبة"]).includes("دراجة") ? "bike" : "car",

        plate_number: String(row["رقم اللوحة"] || "").trim(),
        vehicle_model: String(row["الطراز"] || "").trim(),
        manufacturing_year: String(row["سنة الصنع"] || "").trim(),
        serial_number: String(row["الرقم التسلسلي"] || "").trim(),
        city: String(row["المدينة"] || "").trim(),
        color: String(row["اللون "] || row["اللون"] || "").trim(),

        odometer: "0",
        vehicle_status: ar ? "متاح" : "Available",

        insurance_company: "",
        insurance_expiry: null,

        gps_enabled: true,
        fuel_sim_enabled: true,

        notes: "تم الاستيراد من ملف Excel",

        main_driver_name: String(row["الاسم"] || "").trim(),
        main_driver_identity: String(row["رقم الهوية"] || "").trim(),
        main_driver_phone: String(row["رقم الجوال"] || "").trim(),

        second_driver_name: "",
        second_driver_identity: "",
        second_driver_phone: "",
      }));

    if (vehiclesToInsert.length === 0) {
      alert(ar ? "لا توجد بيانات صالحة في ملف Excel" : "No valid data found");
      return;
    }

    const { error } = await supabase.from("vehicles").insert(vehiclesToInsert);

    if (error) {
      console.log(error);
      alert(ar ? "حدث خطأ أثناء استيراد البيانات" : "Import failed");
      return;
    }

    alert(
      ar
        ? `تم استيراد ${vehiclesToInsert.length} مركبة بنجاح`
        : `${vehiclesToInsert.length} vehicles imported successfully`
    );

    window.location.href = "/cars";
  } finally {
    setLoading(false);
    e.target.value = "";
  }
}
  async function handleSave() {
    try {
      setLoading(true);

      const { error } = await supabase.from("vehicles").insert([
        {
          vehicle_type: vehicleType,
          serial_number: serialNumber,
          plate_number: plateNumber,
          city,
          vehicle_model: vehicleModel,
          manufacturing_year: manufacturingYear,
          odometer,
          vehicle_status: vehicleStatus,
          color,

          insurance_company: insuranceCompany,
          insurance_expiry: insuranceExpiry || null,

          gps_enabled: gpsEnabled,
          fuel_sim_enabled: fuelSimEnabled,

          notes,

          main_driver_name: mainDriverName,
          main_driver_identity: mainDriverIdentity,
          main_driver_phone: mainDriverPhone,

          second_driver_name: showSecondDriver ? secondDriverName : "",
          second_driver_identity: showSecondDriver ? secondDriverIdentity : "",
          second_driver_phone: showSecondDriver ? secondDriverPhone : "",
        },
      ]);

      if (error) {
        console.log(error);
        alert(ar ? "حدث خطأ أثناء حفظ المركبة" : "Error while saving vehicle");
        return;
      }

      alert(ar ? "تم حفظ المركبة بنجاح" : "Vehicle saved successfully");
      window.location.href = "/cars";
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          <span className="text-blue-600">{ar ? "لوحة التحكم" : "Dashboard"}</span>
          <span className="mx-2">/</span>
          <span className="text-blue-600">{ar ? "المركبات" : "Vehicles"}</span>
          <span className="mx-2">/</span>
          <span>{ar ? "إضافة مركبة" : "Add Vehicle"}</span>
        </div>

       <div className="flex items-center gap-3">
  <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-green-700">
    <CloudUpload className="h-5 w-5" />
    {ar ? "استيراد Excel" : "Import Excel"}
    <input
      type="file"
      accept=".xlsx,.xls"
      onChange={handleExcelImport}
      className="hidden"
      disabled={loading}
    />
  </label>

  <Link
    href="/cars"
    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-600 shadow-sm hover:bg-slate-50"
  >
    <ArrowRight className="h-5 w-5" />
    {ar ? "العودة للمركبات" : "Back to Vehicles"}
  </Link>
</div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-extrabold">
              {ar ? "معاينة المركبة" : "Vehicle Preview"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {ar ? "تتغير الصورة حسب نوع المركبة" : "Image changes based on vehicle type"}
            </p>

            <div className="mt-5">
              <label className="mb-2 block font-bold">
                {ar ? "نوع المركبة" : "Vehicle Type"} <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVehicleType("car")}
                  className={`relative flex items-center justify-center gap-3 rounded-xl border px-4 py-4 font-bold transition ${
                    vehicleType === "car"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {vehicleType === "car" && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <Car className="h-7 w-7" />
                  {ar ? "سيارة" : "Car"}
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleType("bike")}
                  className={`relative flex items-center justify-center gap-3 rounded-xl border px-4 py-4 font-bold transition ${
                    vehicleType === "bike"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {vehicleType === "bike" && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <Bike className="h-7 w-7" />
                  {ar ? "دراجة نارية" : "Motorcycle"}
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50">
              <div className="flex h-64 items-center justify-center p-4">
                <Image
                  src={vehicleImage}
                  alt="vehicle"
                  width={360}
                  height={240}
                  className="max-h-56 w-full object-contain"
                  priority
                />
              </div>

              <div className="border-t border-slate-200 bg-white p-4 text-center">
                <h3 className="text-2xl font-extrabold">
                  {vehicleType === "car"
                    ? ar ? "هيونداي i10" : "Hyundai i10"
                    : ar ? "دراجة نارية" : "Motorcycle"}
                </h3>

                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-4 py-1 text-sm font-bold text-slate-600">
                  {vehicleType === "car" ? (ar ? "سيارة" : "Car") : (ar ? "دراجة نارية" : "Motorcycle")}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-extrabold">
              {ar ? "صور المركبة (اختياري)" : "Vehicle Images (Optional)"}
            </h2>

            <div className="mt-5 flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-blue-400 bg-blue-50/30 text-center">
              <CloudUpload className="h-10 w-10 text-blue-600" />
              <p className="mt-2 font-bold text-blue-700">
                {ar ? "اضغط هنا لرفع الصور" : "Click here to upload"}
              </p>
              <p className="mt-1 text-sm text-slate-500">PNG, JPG</p>
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <FormCard title={ar ? "البيانات الأساسية" : "Basic Information"} icon={<Settings className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={ar ? "الرقم التسلسلي" : "Serial Number"} required value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
              <Field label={ar ? "رقم اللوحة" : "Plate Number"} required value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
              <SelectField label={ar ? "المدينة" : "City"} required value={city} onChange={(e) => setCity(e.target.value)} placeholder={ar ? "اختر المدينة" : "Choose city"} options={cities} />

              <Field label={ar ? "موديل المركبة" : "Vehicle Model"} required value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
              <SelectField label={ar ? "سنة الصنع" : "Manufacturing Year"} required value={manufacturingYear} onChange={(e) => setManufacturingYear(e.target.value)} placeholder={ar ? "اختر سنة الصنع" : "Choose year"} options={years} />
              <Field label={ar ? "العداد الحالي (كم)" : "Current Odometer (KM)"} required value={odometer} onChange={(e) => setOdometer(e.target.value)} />

              <SelectField label={ar ? "حالة المركبة" : "Vehicle Status"} required value={vehicleStatus} onChange={(e) => setVehicleStatus(e.target.value)} placeholder={ar ? "اختر الحالة" : "Choose status"} options={statuses} />
              <SelectField label={ar ? "اللون" : "Color"} required value={color} onChange={(e) => setColor(e.target.value)} placeholder={ar ? "اختر اللون" : "Choose color"} options={colors} />
            </div>
          </FormCard>

          <FormCard title={ar ? "قائد المركبة" : "Vehicle Driver"} icon={<User className="h-5 w-5" />}>
            <DriverFields
              title={ar ? "القائد الأساسي" : "Main Driver"}
              ar={ar}
              authorized={mainAuthorized}
              onToggleAuthorized={() => setMainAuthorized(!mainAuthorized)}
              name={mainDriverName}
              identity={mainDriverIdentity}
              phone={mainDriverPhone}
              setName={setMainDriverName}
              setIdentity={setMainDriverIdentity}
              setPhone={setMainDriverPhone}
            />

            {showSecondDriver && (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <DriverFields
                  title={ar ? "سائق إضافي" : "Extra Driver"}
                  ar={ar}
                  authorized={secondAuthorized}
                  onToggleAuthorized={() => setSecondAuthorized(!secondAuthorized)}
                  name={secondDriverName}
                  identity={secondDriverIdentity}
                  phone={secondDriverPhone}
                  setName={setSecondDriverName}
                  setIdentity={setSecondDriverIdentity}
                  setPhone={setSecondDriverPhone}
                />
              </div>
            )}

            {!showSecondDriver && (
              <button
                type="button"
                onClick={() => setShowSecondDriver(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-500 py-3 font-bold text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-5 w-5" />
                {ar ? "إضافة سائق إضافي" : "Add Extra Driver"}
              </button>
            )}
          </FormCard>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <FormCard title={ar ? "التأمين (اختياري)" : "Insurance (Optional)"} icon={<Shield className="h-5 w-5" />}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField label={ar ? "شركة التأمين" : "Insurance Company"} value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} placeholder={ar ? "اختر شركة التأمين" : "Choose company"} options={insuranceCompanies} />
                <Field label={ar ? "تاريخ انتهاء التأمين" : "Insurance Expiry Date"} type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} />
              </div>
            </FormCard>

            <FormCard title={ar ? "التجهيزات" : "Equipment"} icon={<Settings className="h-5 w-5" />}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ToggleCard title="GPS" subtitle={ar ? "متوفر على المركبة" : "Available on vehicle"} icon={<MapPin className="h-6 w-6" />} enabled={gpsEnabled} onClick={() => setGpsEnabled(!gpsEnabled)} />
                <ToggleCard title={ar ? "شريحة البنزين" : "Fuel SIM"} subtitle={ar ? "متوفرة على المركبة" : "Available on vehicle"} icon={<Fuel className="h-6 w-6" />} enabled={fuelSimEnabled} onClick={() => setFuelSimEnabled(!fuelSimEnabled)} />
              </div>
            </FormCard>
          </div>

          <FormCard title={ar ? "ملاحظات (اختياري)" : "Notes (Optional)"}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              placeholder={ar ? "أدخل أي ملاحظات إضافية حول المركبة..." : "Enter any additional notes..."}
            />
          </FormCard>
        </section>
      </div>

      <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-4 border-t border-slate-200 bg-[#f6f8fb]/90 py-4 backdrop-blur">
        <Link href="/cars" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 font-bold text-slate-700 hover:bg-slate-50">
          <X className="h-5 w-5" />
          {ar ? "إلغاء" : "Cancel"}
        </Link>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-3 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {loading ? (ar ? "جاري الحفظ..." : "Saving...") : ar ? "حفظ المركبة" : "Save Vehicle"}
        </button>
      </div>
    </>
  );
}

function DriverFields({
  title,
  ar,
  authorized,
  onToggleAuthorized,
  name,
  identity,
  phone,
  setName,
  setIdentity,
  setPhone,
}: {
  title: string;
  ar: boolean;
  authorized: boolean;
  onToggleAuthorized: () => void;
  name: string;
  identity: string;
  phone: string;
  setName: (value: string) => void;
  setIdentity: (value: string) => void;
  setPhone: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <MiniToggle label={ar ? "مفوض على المركبة" : "Authorized"} enabled={authorized} onClick={onToggleAuthorized} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label={ar ? "الاسم" : "Name"} required value={name} onChange={(e) => setName(e.target.value)} icon={<User className="h-5 w-5" />} />
        <Field label={ar ? "رقم الهوية / الإقامة" : "ID / Iqama Number"} required value={identity} onChange={(e) => setIdentity(e.target.value)} icon={<IdCard className="h-5 w-5" />} />
        <Field label={ar ? "رقم الجوال" : "Phone Number"} required value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone className="h-5 w-5" />} />
      </div>
    </div>
  );
}

function FormCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">{title}</h2>
        {icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{icon}</div>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  placeholder,
  required,
  type = "text",
  icon,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  icon?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-bold">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 right-4 flex items-center text-slate-400">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 ${icon ? "pr-12" : ""}`}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  placeholder,
  required,
  options = [],
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-bold">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
      >
        <option value="">{placeholder || "اختر"}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleCard({ title, subtitle, icon, enabled, onClick }: { title: string; subtitle: string; icon: React.ReactNode; enabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-right hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="text-[#0f2544]">{icon}</div>
        <div>
          <p className="font-extrabold">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <Switch enabled={enabled} />
    </button>
  );
}

function MiniToggle({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
      <span className="text-sm font-bold">{label}</span>
      <Switch enabled={enabled} />
    </button>
  );
}

function Switch({ enabled }: { enabled: boolean }) {
  return (
    <span className={`relative h-7 w-14 rounded-full transition ${enabled ? "bg-green-500" : "bg-black"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? "right-8" : "right-1"}`} />
    </span>
  );
}