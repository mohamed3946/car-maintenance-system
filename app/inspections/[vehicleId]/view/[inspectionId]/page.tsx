"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  ArrowLeft,
  ArrowRight,
  Battery,
  CalendarDays,
  Car,
  CheckCircle2,
  Eye,
  Gauge,
  ImageIcon,
  Lightbulb,
  Loader2,
  ShieldAlert,
  Wrench,
} from "lucide-react";

type StatusValue = "سليم" | "يحتاج متابعة" | "يحتاج إصلاح";

type Vehicle = {
  id: string;
  plate_number: string | null;
  vehicle_type: string | null;
  vehicle_status: string | null;
};

type Inspection = {
  id: string;
  vehicle_id: string;
  plate_number: string | null;
  inspection_type: "weekly" | "monthly";
  inspection_date: string;

  odometer_km: number | null;

  tires: StatusValue;
  brakes: StatusValue;
  oil: StatusValue;
  battery: StatusValue;
  lights: StatusValue;
  exterior_body: StatusValue;

  tires_note: string | null;
  brakes_note: string | null;
  oil_note: string | null;
  battery_note: string | null;
  lights_note: string | null;
  exterior_body_note: string | null;

  overall_status: StatusValue;
  notes: string | null;
  created_at?: string;
};

type InspectionImage = {
  id: string;
  inspection_id: string;
  vehicle_id: string;
  item_key: string;
  image_url: string;
};

export default function InspectionViewPage() {
  return (
    <AppLayout titleKey="maintenance" subtitleKey="maintenanceSubtitle">
      <InspectionViewContent />
    </AppLayout>
  );
}

function InspectionViewContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const params = useParams();
  const router = useRouter();

  const vehicleId = String(params.vehicleId || "");
  const inspectionId = String(params.inspectionId || "");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [images, setImages] = useState<InspectionImage[]>([]);
  const [loading, setLoading] = useState(true);

  const text = {
    title: ar ? "عرض الفحص" : "Inspection Details",

    breadcrumb: ar
      ? "الصيانة / الفحص الدوري / عرض الفحص"
      : "Maintenance / Periodic Inspection / Inspection Details",

    back: ar ? "العودة للمركبات" : "Back to Vehicles",

    plate: ar ? "رقم اللوحة" : "Plate Number",
    vehicleType: ar ? "نوع المركبة" : "Vehicle Type",
    vehicleStatus: ar ? "حالة المركبة" : "Vehicle Status",

    inspectionDate: ar ? "تاريخ الفحص" : "Inspection Date",
    inspectionType: ar ? "نوع الفحص" : "Inspection Type",

    weekly: ar ? "فحص أسبوعي" : "Weekly Inspection",
    monthly: ar ? "فحص شهري" : "Monthly Inspection",

    odometer: ar ? "عداد الكيلومترات" : "Odometer",

    tires: ar ? "الإطارات" : "Tires",
    brakes: ar ? "الفرامل" : "Brakes",
    oil: ar ? "زيت المحرك" : "Engine Oil",
    battery: ar ? "البطارية" : "Battery",
    lights: ar ? "الأنوار" : "Lights",
    exterior_body: ar ? "الهيكل الخارجي" : "Exterior Body",

    notes: ar ? "الملاحظات" : "Notes",
    noNotes: ar ? "لا توجد ملاحظات" : "No notes",

    overall: ar ? "النتيجة العامة" : "Overall Result",

    image: ar ? "الصورة" : "Photo",
    noImage: ar ? "لا توجد صورة" : "No photo",

    loading: ar ? "جاري تحميل الفحص..." : "Loading inspection...",
    notFound: ar ? "الفحص غير موجود." : "Inspection not found.",
  };

  useEffect(() => {
    fetchInspection();
  }, [vehicleId, inspectionId]);

  async function fetchInspection() {
    setLoading(true);

    const [
      vehicleResult,
      inspectionResult,
      imagesResult,
    ] = await Promise.all([
      supabase
        .from("vehicles")
        .select("id, plate_number, vehicle_type, vehicle_status")
        .eq("id", vehicleId)
        .single(),

      supabase
        .from("vehicle_inspections")
        .select("*")
        .eq("id", inspectionId)
        .eq("vehicle_id", vehicleId)
        .single(),

      supabase
        .from("vehicle_inspection_images")
        .select("*")
        .eq("inspection_id", inspectionId),
    ]);

    if (vehicleResult.error) {
      console.error("VEHICLE ERROR:", vehicleResult.error);
    }

    if (inspectionResult.error) {
      console.error("INSPECTION ERROR:", inspectionResult.error);
    }

    if (imagesResult.error) {
      console.error("IMAGES ERROR:", imagesResult.error);
    }

    setVehicle(vehicleResult.data || null);
    setInspection(inspectionResult.data || null);
    setImages(imagesResult.data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />

          <p className="mt-4 font-bold text-slate-500">
            {text.loading}
          </p>
        </div>
      </div>
    );
  }

  if (!inspection || !vehicle) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center font-bold text-red-700">
        {text.notFound}
      </div>
    );
  }

  const items = [
    {
      key: "tires",
      label: text.tires,
      status: inspection.tires,
      note: inspection.tires_note,
      icon: <span className="text-3xl">🛞</span>,
    },
    {
      key: "brakes",
      label: text.brakes,
      status: inspection.brakes,
      note: inspection.brakes_note,
      icon: <span className="text-3xl">🛑</span>,
    },
    {
      key: "oil",
      label: text.oil,
      status: inspection.oil,
      note: inspection.oil_note,
      icon: <span className="text-3xl">🛢️</span>,
    },
    {
      key: "battery",
      label: text.battery,
      status: inspection.battery,
      note: inspection.battery_note,
      icon: <Battery className="h-7 w-7 text-blue-700" />,
    },
    {
      key: "lights",
      label: text.lights,
      status: inspection.lights,
      note: inspection.lights_note,
      icon: <Lightbulb className="h-7 w-7 text-amber-500" />,
    },
    {
      key: "exterior_body",
      label: text.exterior_body,
      status: inspection.exterior_body,
      note: inspection.exterior_body_note,
      icon: <Car className="h-7 w-7 text-blue-700" />,
    },
  ];

  return (
    <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
      {/* HEADER */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">
              {text.breadcrumb}
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              {text.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-xl bg-blue-50 px-4 py-2 text-lg font-black text-blue-800">
                {text.plate}: {vehicle.plate_number || "-"}
              </span>

              <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                {formatVehicleType(vehicle.vehicle_type, ar)}
              </span>

              <span className={overallBadge(inspection.overall_status)}>
                {text.overall}:{" "}
                {displayStatus(inspection.overall_status, ar)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/inspections")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            {ar ? (
              <ArrowRight className="h-5 w-5" />
            ) : (
              <ArrowLeft className="h-5 w-5" />
            )}

            {text.back}
          </button>
        </div>
      </section>

      {/* INFO */}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <InfoCard
          icon={<CalendarDays className="h-6 w-6" />}
          title={text.inspectionDate}
          value={formatDisplayDate(inspection.inspection_date, ar)}
        />

        <InfoCard
          icon={<Eye className="h-6 w-6" />}
          title={text.inspectionType}
          value={
            inspection.inspection_type === "weekly"
              ? text.weekly
              : text.monthly
          }
        />

        <InfoCard
          icon={<Gauge className="h-6 w-6" />}
          title={text.odometer}
          value={
            inspection.odometer_km
              ? `${inspection.odometer_km.toLocaleString()} KM`
              : "-"
          }
        />

        <InfoCard
          icon={<Car className="h-6 w-6" />}
          title={text.vehicleStatus}
          value={vehicle.vehicle_status || "-"}
        />
      </section>

      {/* ODOMETER IMAGE */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <Gauge className="h-6 w-6 text-blue-700" />

          <h2 className="text-xl font-black text-slate-900">
            {text.odometer}
          </h2>
        </div>

        <InspectionPhoto
          image={getImage(images, "odometer")}
          alt={text.odometer}
          noImage={text.noImage}
        />
      </section>

      {/* INSPECTION ITEMS */}

      <section>
        <div className="mb-4 flex items-center gap-3">
          <Wrench className="h-6 w-6 text-blue-700" />

          <h2 className="text-2xl font-black text-slate-900">
            {ar ? "عناصر الفحص" : "Inspection Items"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <InspectionItemView
              key={item.key}
              label={item.label}
              icon={item.icon}
              status={item.status}
              note={item.note}
              image={getImage(images, item.key)}
              ar={ar}
              noNotes={text.noNotes}
              noImage={text.noImage}
            />
          ))}
        </div>
      </section>

      {/* GENERAL NOTES */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-3 text-xl font-black text-slate-900">
          {text.notes}
        </h2>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-7 text-slate-700">
          {inspection.notes || text.noNotes}
        </div>
      </section>
    </div>
  );
}

function InspectionItemView({
  label,
  icon,
  status,
  note,
  image,
  ar,
  noNotes,
  noImage,
}: {
  label: string;
  icon: React.ReactNode;
  status: StatusValue;
  note: string | null;
  image?: string;
  ar: boolean;
  noNotes: string;
  noImage: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            {icon}
          </div>

          <h3 className="text-xl font-black text-slate-900">
            {label}
          </h3>
        </div>

        <span className={overallBadge(status)}>
          {displayStatus(status, ar)}
        </span>
      </div>

      <InspectionPhoto
        image={image}
        alt={label}
        noImage={noImage}
      />

      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-black text-slate-400">
          {ar ? "الملاحظات" : "Notes"}
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
          {note || noNotes}
        </p>
      </div>
    </div>
  );
}

function InspectionPhoto({
  image,
  alt,
  noImage,
}: {
  image?: string;
  alt: string;
  noImage: string;
}) {
  if (!image) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
        <div className="text-center text-slate-400">
          <ImageIcon className="mx-auto h-8 w-8" />
          <p className="mt-2 text-sm font-bold">
            {noImage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={image}
      target="_blank"
      rel="noreferrer"
      className="block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
    >
      <img
        src={image}
        alt={alt}
        className="h-64 w-full object-cover transition hover:scale-[1.01]"
      />
    </a>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          {icon}
        </div>

        <div>
          <p className="text-sm font-bold text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-lg font-black text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function getImage(
  images: InspectionImage[],
  itemKey: string
) {
  return images.find(
    (image) => image.item_key === itemKey
  )?.image_url;
}

function overallBadge(status: StatusValue) {
  if (status === "سليم") {
    return "rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700";
  }

  if (status === "يحتاج متابعة") {
    return "rounded-full bg-orange-100 px-4 py-2 text-xs font-black text-orange-700";
  }

  return "rounded-full bg-red-100 px-4 py-2 text-xs font-black text-red-700";
}

function displayStatus(
  status: StatusValue,
  ar: boolean
) {
  if (ar) return status;

  if (status === "سليم") return "Good";
  if (status === "يحتاج متابعة") return "Follow-up";

  return "Needs Repair";
}

function formatDisplayDate(
  dateString: string,
  ar: boolean
) {
  const [year, month, day] =
    dateString.split("-");

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

function formatVehicleType(
  type: string | null,
  ar: boolean
) {
  const value = String(type || "")
    .toLowerCase()
    .trim();

  if (
    value === "car" ||
    value === "سيارة" ||
    value === "سياره" ||
    value.includes("car")
  ) {
    return ar ? "سيارة" : "Car";
  }

  if (
    value === "bike" ||
    value === "motorcycle" ||
    value === "دراجة" ||
    value.includes("bike") ||
    value.includes("motor")
  ) {
    return ar ? "دراجة" : "Motorcycle";
  }

  return type || (ar ? "غير محدد" : "Unknown");
}