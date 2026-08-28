"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  ArrowLeft,
  ArrowRight,
  Battery,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  Gauge,
  ImagePlus,
  Lightbulb,
  Loader2,
  Save,
  ShieldAlert,
  Trash2,
  Wrench,
} from "lucide-react";

type StatusValue = "سليم" | "يحتاج متابعة" | "يحتاج إصلاح";
type InspectionType = "weekly" | "monthly";

type Vehicle = {
  id: string;
  plate_number: string | null;
  vehicle_type: string | null;
  vehicle_status: string | null;
};

type ItemKey =
  | "tires"
  | "brakes"
  | "oil"
  | "battery"
  | "lights"
  | "exterior_body";

type ItemState = {
  status: StatusValue | null;
  note: string;
  image: File | null;
  preview: string | null;
};

type InspectionItemsState = Record<ItemKey, ItemState>;

export default function VehicleInspectionPage() {
  return (
    <AppLayout titleKey="maintenance" subtitleKey="maintenanceSubtitle">
      <VehicleInspectionContent />
    </AppLayout>
  );
}

function VehicleInspectionContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const params = useParams();
  const router = useRouter();

  const vehicleId = String(params.vehicleId || "");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [inspectionType, setInspectionType] =
    useState<InspectionType>("weekly");

  const [odometer, setOdometer] = useState("");
  const [odometerImage, setOdometerImage] = useState<File | null>(null);
  const [odometerPreview, setOdometerPreview] = useState<string | null>(null);

  const [generalNotes, setGeneralNotes] = useState("");

  const [items, setItems] = useState<InspectionItemsState>({
    tires: emptyItem(),
    brakes: emptyItem(),
    oil: emptyItem(),
    battery: emptyItem(),
    lights: emptyItem(),
    exterior_body: emptyItem(),
  });

  const today = getLocalDate();

  const text = {
    title: ar ? "فحص المركبة" : "Vehicle Inspection",
    breadcrumb: ar
      ? "الصيانة / الفحص الدوري / فحص المركبة"
      : "Maintenance / Periodic Inspection / Vehicle Inspection",

    back: ar ? "العودة للمركبات" : "Back to Vehicles",

    plate: ar ? "رقم اللوحة" : "Plate Number",
    vehicleType: ar ? "نوع المركبة" : "Vehicle Type",
    vehicleStatus: ar ? "حالة المركبة" : "Vehicle Status",

    inspectionDate: ar ? "تاريخ الفحص" : "Inspection Date",
    inspectionType: ar ? "نوع الفحص" : "Inspection Type",
    weekly: ar ? "فحص أسبوعي" : "Weekly Inspection",
    monthly: ar ? "فحص شهري" : "Monthly Inspection",

    odometer: ar ? "عداد الكيلومترات" : "Odometer",
    odometerPlaceholder: ar
      ? "أدخل قراءة العداد الحالية"
      : "Enter current odometer reading",
    odometerImage: ar ? "صورة عداد المركبة" : "Odometer Photo",

    tires: ar ? "الإطارات" : "Tires",
    brakes: ar ? "الفرامل" : "Brakes",
    oil: ar ? "زيت المحرك" : "Engine Oil",
    battery: ar ? "البطارية" : "Battery",
    lights: ar ? "الأنوار" : "Lights",
    exterior_body: ar ? "الهيكل الخارجي" : "Exterior Body",

    good: ar ? "سليم" : "Good",
    follow: ar ? "يحتاج متابعة" : "Follow-up",
    repair: ar ? "يحتاج إصلاح" : "Needs Repair",

    requiredImage: ar ? "الصورة إلزامية" : "Photo Required",
    takePhoto: ar ? "التقاط / رفع صورة" : "Take / Upload Photo",
    changeImage: ar ? "تغيير الصورة" : "Change Photo",
    deleteImage: ar ? "حذف الصورة" : "Delete Photo",

    itemNote: ar ? "ملاحظات هذا الجزء" : "Item Notes",
    itemNotePlaceholder: ar
      ? "اكتب الملاحظة عند الحاجة..."
      : "Enter notes if needed...",

    generalNotes: ar ? "ملاحظات عامة" : "General Notes",
    generalNotesPlaceholder: ar
      ? "أي ملاحظات إضافية عن المركبة..."
      : "Any additional notes about the vehicle...",

    completion: ar ? "اكتمال الفحص" : "Inspection Completion",
    required: ar ? "مطلوب" : "Required",

    overall: ar ? "النتيجة العامة" : "Overall Result",

    save: ar ? "اعتماد وإنهاء الفحص" : "Submit Inspection",
    saving: ar ? "جاري حفظ الفحص..." : "Saving Inspection...",

    loading: ar ? "جاري تحميل المركبة..." : "Loading vehicle...",

    missingData: ar
      ? "يجب استكمال جميع عناصر الفحص وإرفاق صورة لكل عنصر."
      : "Complete every inspection item and attach a photo to each item.",

    odometerRequired: ar
      ? "أدخل قراءة العداد وأرفق صورة العداد."
      : "Enter the odometer reading and attach its photo.",

    success: ar
      ? "تم اعتماد الفحص بنجاح."
      : "Inspection submitted successfully.",

    alreadyInspected: ar
      ? "تم فحص هذه المركبة اليوم بالفعل."
      : "This vehicle has already been inspected today.",
  };

  const inspectionItems = useMemo(
    () => [
      {
        key: "tires" as ItemKey,
        label: text.tires,
        icon: <span className="text-3xl">🛞</span>,
      },
      {
        key: "brakes" as ItemKey,
        label: text.brakes,
        icon: <span className="text-3xl">🛑</span>,
      },
      {
        key: "oil" as ItemKey,
        label: text.oil,
        icon: <span className="text-3xl">🛢️</span>,
      },
      {
        key: "battery" as ItemKey,
        label: text.battery,
        icon: <Battery className="h-7 w-7 text-blue-700" />,
      },
      {
        key: "lights" as ItemKey,
        label: text.lights,
        icon: <Lightbulb className="h-7 w-7 text-amber-500" />,
      },
      {
        key: "exterior_body" as ItemKey,
        label: text.exterior_body,
        icon: <Car className="h-7 w-7 text-blue-700" />,
      },
    ],
    [ar]
  );

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  async function fetchVehicle() {
    if (!vehicleId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("vehicles")
      .select("id, plate_number, vehicle_type, vehicle_status")
      .eq("id", vehicleId)
      .single();

    if (error) {
      console.error("VEHICLE ERROR:", error);
      alert(
        ar
          ? "حدث خطأ أثناء تحميل بيانات المركبة."
          : "Error loading vehicle."
      );

      setLoading(false);
      return;
    }

    setVehicle(data);
    setLoading(false);
  }

  function updateItemStatus(key: ItemKey, status: StatusValue) {
    setItems((current) => ({
      ...current,
      [key]: {
        ...current[key],
        status,
      },
    }));
  }

  function updateItemNote(key: ItemKey, note: string) {
    setItems((current) => ({
      ...current,
      [key]: {
        ...current[key],
        note,
      },
    }));
  }

  function updateItemImage(key: ItemKey, file: File | null) {
    setItems((current) => {
      const previous = current[key];

      if (previous.preview) {
        URL.revokeObjectURL(previous.preview);
      }

      return {
        ...current,
        [key]: {
          ...previous,
          image: file,
          preview: file ? URL.createObjectURL(file) : null,
        },
      };
    });
  }

  function handleOdometerImage(file: File | null) {
    if (odometerPreview) {
      URL.revokeObjectURL(odometerPreview);
    }

    setOdometerImage(file);
    setOdometerPreview(file ? URL.createObjectURL(file) : null);
  }

  const completedItems = useMemo(() => {
    let count = 0;

    if (odometer && odometerImage) {
      count += 1;
    }

    inspectionItems.forEach(({ key }) => {
      if (items[key].status && items[key].image) {
        count += 1;
      }
    });

    return count;
  }, [odometer, odometerImage, items, inspectionItems]);

  const totalRequired = inspectionItems.length + 1;

  const completionPercent = Math.round(
    (completedItems / totalRequired) * 100
  );

  const isComplete =
    completedItems === totalRequired &&
    Number(odometer) > 0;

  function getOverallStatus(): StatusValue {
    const statuses = inspectionItems
      .map(({ key }) => items[key].status)
      .filter(Boolean) as StatusValue[];

    if (statuses.includes("يحتاج إصلاح")) {
      return "يحتاج إصلاح";
    }

    if (statuses.includes("يحتاج متابعة")) {
      return "يحتاج متابعة";
    }

    return "سليم";
  }

  async function saveInspection() {
    if (!vehicle || saving) return;

    if (!odometer || Number(odometer) <= 0 || !odometerImage) {
      alert(text.odometerRequired);
      return;
    }

    const missingItem = inspectionItems.find(({ key }) => {
      return !items[key].status || !items[key].image;
    });

    if (missingItem) {
      alert(`${text.missingData}\n\n${missingItem.label}`);
      return;
    }

    setSaving(true);

    try {
      /*
       * منع تكرار الفحص لنفس المركبة في نفس اليوم
       * ولنفس نوع الفحص.
       */
      const { data: existingInspection, error: existingError } =
        await supabase
          .from("vehicle_inspections")
          .select("id")
          .eq("vehicle_id", vehicle.id)
          .eq("inspection_date", today)
          .eq("inspection_type", inspectionType)
          .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingInspection) {
        alert(text.alreadyInspected);
        setSaving(false);
        return;
      }

      /*
       * إنشاء سجل الفحص أولاً والحصول على ID الخاص به.
       */
      const payload = {
        vehicle_id: vehicle.id,
        plate_number: vehicle.plate_number || "",
        inspection_type: inspectionType,

        /*
         * التاريخ لا يأتي من Input.
         * تاريخ اليوم فقط.
         */
        inspection_date: today,

        odometer_km: Number(odometer),

        tires: items.tires.status as StatusValue,
        brakes: items.brakes.status as StatusValue,
        oil: items.oil.status as StatusValue,
        battery: items.battery.status as StatusValue,
        lights: items.lights.status as StatusValue,
        exterior_body: items.exterior_body.status as StatusValue,

        tires_note: items.tires.note || null,
        brakes_note: items.brakes.note || null,
        oil_note: items.oil.note || null,
        battery_note: items.battery.note || null,
        lights_note: items.lights.note || null,
        exterior_body_note: items.exterior_body.note || null,

        overall_status: getOverallStatus(),
        notes: generalNotes || "",
      };

      const { data: inspection, error: inspectionError } =
        await supabase
          .from("vehicle_inspections")
          .insert(payload)
          .select("id")
          .single();

      if (inspectionError) {
        throw inspectionError;
      }

      const inspectionId = inspection.id;

      /*
       * الصور المطلوب رفعها.
       */
      const imagesToUpload: {
        key: string;
        file: File;
      }[] = [
        {
          key: "odometer",
          file: odometerImage,
        },
        ...inspectionItems.map(({ key }) => ({
          key,
          file: items[key].image as File,
        })),
      ];

      const imageRows: {
        inspection_id: string;
        vehicle_id: string;
        item_key: string;
        image_url: string;
      }[] = [];

      for (const imageItem of imagesToUpload) {
        const extension = getFileExtension(imageItem.file.name);

        const fileName = `${imageItem.key}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${extension}`;

        const storagePath = `${vehicle.id}/${inspectionId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("vehicle-inspections")
          .upload(storagePath, imageItem.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("vehicle-inspections")
          .getPublicUrl(storagePath);

        imageRows.push({
          inspection_id: inspectionId,
          vehicle_id: vehicle.id,
          item_key: imageItem.key,
          image_url: publicUrlData.publicUrl,
        });
      }

      const { error: imagesInsertError } = await supabase
        .from("vehicle_inspection_images")
        .insert(imageRows);

      if (imagesInsertError) {
        throw imagesInsertError;
      }

      alert(text.success);

      router.push("/maintenance/inspections");
    } catch (error: any) {
      console.error("SAVE INSPECTION ERROR:", error);

      alert(
        ar
          ? `حدث خطأ أثناء حفظ الفحص:\n${error?.message || "Unknown error"}`
          : `Error saving inspection:\n${error?.message || "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
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

  if (!vehicle) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center font-bold text-red-700">
        {ar ? "المركبة غير موجودة." : "Vehicle not found."}
      </div>
    );
  }

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
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
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

      {/* DATE + TYPE */}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          icon={<CalendarDays className="h-6 w-6" />}
          title={text.inspectionDate}
          value={formatDisplayDate(today, ar)}
          note={ar ? "تاريخ اليوم إلزامي وغير قابل للتعديل" : "Today's date is locked"}
        />

        <InfoCard
          icon={<Car className="h-6 w-6" />}
          title={text.vehicleStatus}
          value={vehicle.vehicle_status || "-"}
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-3 block text-sm font-black text-slate-500">
            {text.inspectionType}
          </label>

          <select
            value={inspectionType}
            onChange={(e) =>
              setInspectionType(e.target.value as InspectionType)
            }
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-black text-slate-800 outline-none focus:border-blue-500"
          >
            <option value="weekly">{text.weekly}</option>
            <option value="monthly">{text.monthly}</option>
          </select>
        </div>
      </section>

      {/* ODOMETER */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Gauge className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              {text.odometer}
            </h2>

            <p className="text-sm font-bold text-red-500">
              {text.required}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-600">
              {text.odometer}
            </label>

            <div className="relative">
              <Gauge
                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${
                  ar ? "right-4" : "left-4"
                }`}
              />

              <input
                type="number"
                min="0"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder={text.odometerPlaceholder}
                className={`h-14 w-full rounded-xl border border-slate-200 bg-slate-50 font-black outline-none focus:border-blue-500 focus:bg-white ${
                  ar ? "pr-12 pl-4" : "pl-12 pr-4"
                }`}
              />
            </div>
          </div>

          <ImageUploadBox
            ar={ar}
            title={text.odometerImage}
            requiredText={text.requiredImage}
            preview={odometerPreview}
            onChange={handleOdometerImage}
          />
        </div>
      </section>

      {/* INSPECTION ITEMS */}

      <section>
        <div className="mb-4 flex items-center gap-3">
          <Wrench className="h-6 w-6 text-blue-700" />

          <h2 className="text-2xl font-black text-slate-900">
            {ar ? "عناصر الفحص" : "Inspection Items"}
          </h2>
        </div>

        <div className="space-y-4">
          {inspectionItems.map((item, index) => (
            <InspectionItemCard
              key={item.key}
              number={index + 1}
              label={item.label}
              icon={item.icon}
              status={items[item.key].status}
              note={items[item.key].note}
              preview={items[item.key].preview}
              ar={ar}
              text={text}
              onStatusChange={(status) =>
                updateItemStatus(item.key, status)
              }
              onNoteChange={(note) =>
                updateItemNote(item.key, note)
              }
              onImageChange={(file) =>
                updateItemImage(item.key, file)
              }
            />
          ))}
        </div>
      </section>

      {/* NOTES */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <label className="mb-3 block text-lg font-black text-slate-800">
          {text.generalNotes}
        </label>

        <textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder={text.generalNotesPlaceholder}
          maxLength={1000}
          className="min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-medium outline-none focus:border-blue-500 focus:bg-white"
        />

        <p className="mt-2 text-xs font-bold text-slate-400">
          {generalNotes.length} / 1000
        </p>
      </section>

      {/* SUBMIT */}

      <section className="sticky bottom-3 z-20 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur md:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-slate-800">
                  {text.completion}: {completedItems} / {totalRequired}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  {completionPercent}%
                </p>
              </div>

              <span className={overallBadge(getOverallStatus())}>
                {text.overall}: {displayStatus(getOverallStatus(), ar)}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${completionPercent}%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={saveInspection}
            disabled={!isComplete || saving}
            className="flex min-h-[54px] min-w-[240px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}

            {saving ? text.saving : text.save}
          </button>
        </div>
      </section>
    </div>
  );
}

function InspectionItemCard({
  number,
  label,
  icon,
  status,
  note,
  preview,
  ar,
  text,
  onStatusChange,
  onNoteChange,
  onImageChange,
}: {
  number: number;
  label: string;
  icon: React.ReactNode;
  status: StatusValue | null;
  note: string;
  preview: string | null;
  ar: boolean;
  text: Record<string, string>;
  onStatusChange: (status: StatusValue) => void;
  onNoteChange: (note: string) => void;
  onImageChange: (file: File | null) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
          {icon}
        </div>

        <div>
          <p className="text-xs font-black text-blue-600">
            {ar ? `العنصر ${number}` : `Item ${number}`}
          </p>

          <h3 className="text-xl font-black text-slate-900">
            {label}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatusButton
              active={status === "سليم"}
              tone="green"
              onClick={() => onStatusChange("سليم")}
            >
              <CheckCircle2 className="h-5 w-5" />
              {text.good}
            </StatusButton>

            <StatusButton
              active={status === "يحتاج متابعة"}
              tone="orange"
              onClick={() => onStatusChange("يحتاج متابعة")}
            >
              <ShieldAlert className="h-5 w-5" />
              {text.follow}
            </StatusButton>

            <StatusButton
              active={status === "يحتاج إصلاح"}
              tone="red"
              onClick={() => onStatusChange("يحتاج إصلاح")}
            >
              <Wrench className="h-5 w-5" />
              {text.repair}
            </StatusButton>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-slate-600">
              {text.itemNote}
            </label>

            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder={text.itemNotePlaceholder}
              maxLength={500}
              className="min-h-[100px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <ImageUploadBox
          ar={ar}
          title={label}
          requiredText={text.requiredImage}
          preview={preview}
          onChange={onImageChange}
        />
      </div>
    </div>
  );
}

function ImageUploadBox({
  ar,
  title,
  requiredText,
  preview,
  onChange,
}: {
  ar: boolean;
  title: string;
  requiredText: string;
  preview: string | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-700" />

          <p className="font-black text-slate-700">
            {title}
          </p>
        </div>

        <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black text-red-600">
          {requiredText}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onChange(file);
        }}
      />

      {preview ? (
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img
              src={preview}
              alt={title}
              className="h-52 w-full object-cover"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-black text-blue-700 hover:bg-blue-100"
            >
              <ImagePlus className="h-4 w-4" />
              {ar ? "تغيير الصورة" : "Change"}
            </button>

            <button
              type="button"
              onClick={() => {
                onChange(null);

                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-black text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              {ar ? "حذف" : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        >
          <Camera className="mb-3 h-8 w-8" />

          <span className="font-black">
            {ar ? "التقاط أو رفع صورة" : "Take or Upload Photo"}
          </span>

          <span className="mt-1 text-xs font-bold opacity-60">
            JPG / PNG / WEBP
          </span>
        </button>
      )}
    </div>
  );
}

function StatusButton({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: "green" | "orange" | "red";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const styles = {
    green: active
      ? "border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-100"
      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",

    orange: active
      ? "border-orange-500 bg-orange-100 text-orange-800 ring-2 ring-orange-100"
      : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",

    red: active
      ? "border-red-500 bg-red-100 text-red-800 ring-2 ring-red-100"
      : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[50px] items-center justify-center gap-2 rounded-xl border px-3 font-black transition ${styles[tone]}`}
    >
      {children}
    </button>
  );
}

function InfoCard({
  icon,
  title,
  value,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note?: string;
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

          {note && (
            <p className="mt-1 text-xs font-bold text-slate-400">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
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

function displayStatus(status: StatusValue, ar: boolean) {
  if (ar) return status;

  if (status === "سليم") return "Good";
  if (status === "يحتاج متابعة") return "Follow-up";

  return "Needs Repair";
}

function emptyItem(): ItemState {
  return {
    status: null,
    note: "",
    image: null,
    preview: null,
  };
}

function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string, ar: boolean) {
  const [year, month, day] = dateString.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return new Intl.DateTimeFormat(ar ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  return extension;
}

function formatVehicleType(type: string | null, ar: boolean) {
  const value = String(type || "").toLowerCase();

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