"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle,
  CloudUpload,
  Download,
  FileText,
  Filter,
  Gauge,
  Save,
  Search,
  User,
  Wrench,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";

type Vehicle = {
  id: string;
  vehicle_model: string | null;
  serial_number: string | null;
  plate_number: string | null;
  odometer: string | null;
  main_driver_name: string | null;
  second_driver_name: string | null;
};

type MaintenanceRecord = {
  id: string;
  car_id: string | null;
  vehicle_id: string | null;
  type: string | null;
  maintenance_type: string | null;
  service_date: string | null;
  maintenance_date: string | null;
  odometer_km: number | null;
  odometer: string | null;
  status: string | null;
  description: string | null;
  driver_selection: string | null;
  cost: number | null;
  workshop_name: string | null;
  technician_name: string | null;
  invoice_number: string | null;
  notes: string | null;
  created_at?: string | null;
};

const maintenanceTypesAr = [
  "تغيير فلتر الهواء",
  "تغيير فلتر المكيف",
  "تغيير البواجي",
  "تغيير الفحمات الأمامية",
  "تغيير الفحمات الخلفية",
  "تغيير الهوبات",
  "تغيير الكفرات",
  "ترصيص كفرات",
  "ميزان أذرعة",
  "تغيير بطارية",
  "صيانة مكيف",
  "تغيير سير المكينة",
  "تغيير سير الدينمو",
  "تغيير ماء الرديتر",
  "فحص شامل",
  "برمجة كمبيوتر",
  "إصلاح كهرباء",
  "إصلاح ميكانيكا",
  "إصلاح ناقل الحركة",
  "إصلاح نظام الفرامل",
  "إصلاح نظام التعليق",
  "إصلاح حادث / سمكرة",
  "دهان",
  "أخرى",
];

const maintenanceTypesEn = [
  "Air Filter Replacement",
  "Cabin Filter Replacement",
  "Spark Plugs Replacement",
  "Front Brake Pads Replacement",
  "Rear Brake Pads Replacement",
  "Brake Disc Replacement",
  "Tire Replacement",
  "Tire Balancing",
  "Wheel Alignment",
  "Battery Replacement",
  "AC Maintenance",
  "Engine Belt Replacement",
  "Alternator Belt Replacement",
  "Radiator Coolant Replacement",
  "Full Inspection",
  "Computer Programming",
  "Electrical Repair",
  "Mechanical Repair",
  "Transmission Repair",
  "Brake System Repair",
  "Suspension System Repair",
  "Accident Repair / Body Work",
  "Painting",
  "Other",
];

export default function AddMaintenancePage() {
  return (
    <AppLayout title="تسجيل صيانة" subtitle="إضافة عملية صيانة جديدة للمركبة">
      <Suspense fallback={<div className="p-10 text-center font-bold">Loading...</div>}>
        <AddMaintenanceContent />
      </Suspense>
    </AppLayout>
  );
}

function AddMaintenanceContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const searchParams = useSearchParams();

  const vehicleId = searchParams.get("vehicle");
  const openedFromVehicle = Boolean(vehicleId);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId || "");

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [historyVehicleFilter, setHistoryVehicleFilter] = useState(vehicleId || "");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [maintenanceType, setMaintenanceType] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  const [selectedDriver, setSelectedDriver] = useState("main");

  const [cost, setCost] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle(vehicleId);
    } else {
      fetchVehicles();
    }

    fetchMaintenanceRecords();
  }, [vehicleId]);

  async function fetchVehicle(id: string) {
    setLoading(true);

    const { data, error } = await supabase
      .from("vehicles")
      .select(
        "id, vehicle_model, serial_number, plate_number, odometer, main_driver_name, second_driver_name"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      setVehicle(null);
      setLoading(false);
      return;
    }

    setVehicle(data);
    setSelectedVehicleId(data.id);
    setHistoryVehicleFilter(data.id);
    setOdometer(data.odometer || "");
    setLoading(false);
  }

  async function fetchVehicles() {
    setLoading(true);

    const { data, error } = await supabase
      .from("vehicles")
      .select(
        "id, vehicle_model, serial_number, plate_number, odometer, main_driver_name, second_driver_name"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setVehicles([]);
      setLoading(false);
      return;
    }

    setVehicles(data || []);
    setLoading(false);
  }

  async function fetchMaintenanceRecords() {
    setRecordsLoading(true);

    const { data, error } = await supabase
      .from("maintenance_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Maintenance records error:", error);
      setRecords([]);
      setRecordsLoading(false);
      return;
    }

    setRecords((data || []) as MaintenanceRecord[]);
    setRecordsLoading(false);
  }

  async function handleVehicleChange(id: string) {
    setSelectedVehicleId(id);

    const selected = vehicles.find((v) => v.id === id) || null;
    setVehicle(selected);
    setOdometer(selected?.odometer || "");
  }

  function resetForm() {
    setMaintenanceType("");
    setMaintenanceDate("");
    setStatus("");
    setDescription("");
    setSelectedDriver("main");
    setCost("");
    setWorkshopName("");
    setTechnicianName("");
    setInvoiceNumber("");
    setNotes("");

    if (vehicle?.odometer) {
      setOdometer(vehicle.odometer);
    } else {
      setOdometer("");
    }
  }

async function handleSave() {
  if (!selectedVehicleId || !maintenanceType || !maintenanceDate || !odometer || !status || !description) {
    alert(ar ? "من فضلك أكمل البيانات المطلوبة" : "Please complete required fields");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      car_id: selectedVehicleId,
      vehicle_id: selectedVehicleId,
      type: maintenanceType,
      maintenance_type: maintenanceType,
      service_date: maintenanceDate,
      maintenance_date: maintenanceDate,
      odometer_km: odometer ? Number(odometer) : 0,
      odometer,
      status,
      description,
      driver_selection: selectedDriver,
      cost: cost ? Number(cost) : 0,
      workshop_name: workshopName,
      technician_name: technicianName,
      invoice_number: invoiceNumber,
      notes,
    };

    let error = null;

    if (editingId) {
      const response = await supabase
        .from("maintenance_records")
        .update(payload)
        .eq("id", editingId);

      error = response.error;
    } else {
      const response = await supabase
        .from("maintenance_records")
        .insert([payload]);

      error = response.error;
    }

    if (error) {
      alert(
        ar
          ? `حدث خطأ أثناء الحفظ:\n${error.message}`
          : `Error saving maintenance:\n${error.message}`
      );
      return;
    }

    alert(
      editingId
        ? ar
          ? "تم تعديل الصيانة بنجاح"
          : "Maintenance updated successfully"
        : ar
        ? "تم حفظ الصيانة بنجاح"
        : "Maintenance saved successfully"
    );

    setEditingId(null);

    resetForm();

    await fetchMaintenanceRecords();
  } finally {
    setSaving(false);
  }
}

async function handleDelete(id: string) {
  const confirmDelete = confirm(
    ar ? "هل أنت متأكد من حذف سجل الصيانة؟" : "Are you sure you want to delete this record?"
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("maintenance_records")
    .delete()
    .eq("id", id);

  if (error) {
    alert(ar ? "حدث خطأ أثناء الحذف" : "Delete failed");
    return;
  }

  await fetchMaintenanceRecords();

  alert(ar ? "تم حذف السجل بنجاح" : "Record deleted successfully");
}

function handleEdit(record: MaintenanceRecord) {
  setEditingId(record.id);

  setSelectedVehicleId(record.vehicle_id || record.car_id || "");
  setMaintenanceType(record.maintenance_type || record.type || "");
  setMaintenanceDate(record.maintenance_date || record.service_date || "");
  setOdometer(record.odometer || String(record.odometer_km || ""));
  setStatus(record.status || "");
  setDescription(record.description || "");
  setSelectedDriver(record.driver_selection || "main");
  setCost(String(record.cost || ""));
  setWorkshopName(record.workshop_name || "");
  setTechnicianName(record.technician_name || "");
  setInvoiceNumber(record.invoice_number || "");
  setNotes(record.notes || "");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

  function getRecordVehicle(record: MaintenanceRecord) {
    const id = record.vehicle_id || record.car_id;

    if (vehicle?.id && vehicle.id === id) return vehicle;

    return vehicles.find((v) => v.id === id) || null;
  }

  const filteredRecords = useMemo(() => {
    const q = historySearch.trim().toLowerCase();

    return records.filter((record) => {
      const recordVehicleId = record.vehicle_id || record.car_id || "";
      const recordVehicle = getRecordVehicle(record);
      const type = record.maintenance_type || record.type || "";
      const recordStatus = record.status || "";

      const matchesVehicle = !historyVehicleFilter || recordVehicleId === historyVehicleFilter;
      const matchesType = !historyTypeFilter || type === historyTypeFilter;
      const matchesStatus = !historyStatusFilter || recordStatus === historyStatusFilter;

      const searchText = `${
        recordVehicle?.vehicle_model || ""
      } ${recordVehicle?.plate_number || ""} ${recordVehicle?.serial_number || ""} ${type} ${recordStatus} ${
        record.description || ""
      } ${record.workshop_name || ""} ${record.invoice_number || ""}`.toLowerCase();

      const matchesSearch = !q || searchText.includes(q);

      return matchesVehicle && matchesType && matchesStatus && matchesSearch;
    });
  }, [records, vehicles, vehicle, historySearch, historyVehicleFilter, historyTypeFilter, historyStatusFilter]);

  function exportCsv() {
    const headers = ar
      ? [
          "المركبة",
          "اللوحة",
          "نوع الصيانة",
          "تاريخ الصيانة",
          "العداد",
          "الحالة",
          "التكلفة",
          "الورشة",
          "الفني",
          "رقم الفاتورة",
          "الوصف",
          "ملاحظات",
        ]
      : [
          "Vehicle",
          "Plate",
          "Maintenance Type",
          "Maintenance Date",
          "Odometer",
          "Status",
          "Cost",
          "Workshop",
          "Technician",
          "Invoice Number",
          "Description",
          "Notes",
        ];

    const rows = filteredRecords.map((record) => {
      const recordVehicle = getRecordVehicle(record);

      return [
        recordVehicle?.vehicle_model || "",
        recordVehicle?.plate_number || "",
        record.maintenance_type || record.type || "",
        record.maintenance_date || record.service_date || "",
        record.odometer || record.odometer_km || "",
        record.status || "",
        record.cost || 0,
        record.workshop_name || "",
        record.technician_name || "",
        record.invoice_number || "",
        record.description || "",
        record.notes || "",
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = ar
      ? `سجل-الصيانة-${new Date().toISOString().slice(0, 10)}.csv`
      : `maintenance-history-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const text = {
    breadcrumb: ar
      ? "لوحة التحكم / الصيانة / تسجيل صيانة"
      : "Dashboard / Maintenance / Add Maintenance",
    title: ar ? "تسجيل صيانة جديدة" : "Add New Maintenance",
    subtitle: ar
      ? "سجّل عملية الصيانة واربطها بالمركبة وقائد المركبة"
      : "Record maintenance and link it to vehicle and driver",
    back: ar ? "العودة" : "Back",
    vehicleInfo: ar ? "بيانات المركبة" : "Vehicle Information",
    chooseVehicle: ar ? "اختيار المركبة" : "Choose Vehicle",
    driver: ar ? "قائد المركبة" : "Vehicle Driver",
    maintenanceDetails: ar ? "تفاصيل الصيانة" : "Maintenance Details",
    maintenanceType: ar ? "نوع الصيانة" : "Maintenance Type",
    maintenanceDate: ar ? "تاريخ الصيانة" : "Maintenance Date",
    odometer: ar ? "عداد الكيلومترات وقت الصيانة" : "Odometer At Maintenance",
    status: ar ? "حالة الصيانة" : "Maintenance Status",
    description: ar ? "وصف الصيانة" : "Maintenance Description",
    costWorkshop: ar ? "التكلفة وبيانات الورشة (اختياري)" : "Cost & Workshop Info (Optional)",
    cost: ar ? "التكلفة" : "Cost",
    workshopName: ar ? "اسم الورشة" : "Workshop Name",
    technician: ar ? "اسم الفني" : "Technician Name",
    invoiceNumber: ar ? "رقم الفاتورة" : "Invoice Number",
    attachments: ar ? "المرفقات" : "Attachments",
    save: ar ? "حفظ الصيانة" : "Save Maintenance",
    cancel: ar ? "إلغاء" : "Cancel",
    history: ar ? "سجل الصيانة" : "Maintenance History",
    export: ar ? "تصدير" : "Export",
    filters: ar ? "مسح الفلاتر" : "Clear Filters",
    search: ar ? "ابحث بالمركبة أو اللوحة أو الوصف أو الورشة..." : "Search by vehicle, plate, description or workshop...",
    allVehicles: ar ? "كل المركبات" : "All Vehicles",
    allTypes: ar ? "كل أنواع الصيانة" : "All Types",
    allStatus: ar ? "كل الحالات" : "All Status",
    vehicle: ar ? "المركبة" : "Vehicle",
    plate: ar ? "اللوحة" : "Plate",
    tableType: ar ? "نوع الصيانة" : "Type",
    tableDate: ar ? "التاريخ" : "Date",
    tableOdometer: ar ? "العداد" : "Odometer",
    tableStatus: ar ? "الحالة" : "Status",
    tableCost: ar ? "التكلفة" : "Cost",
    tableDescription: ar ? "الوصف" : "Description",
    loadingHistory: ar ? "جاري تحميل سجل الصيانة..." : "Loading maintenance history...",
    emptyHistory: ar ? "لا يوجد سجل صيانة مطابق للفلاتر" : "No maintenance records match filters",
  };

  const statusOptions = ar
    ? [
        { label: "مكتملة", value: "مكتملة" },
        { label: "تحت التنفيذ", value: "تحت التنفيذ" },
        { label: "معلقة", value: "معلقة" },
      ]
    : [
        { label: "Completed", value: "Completed" },
        { label: "In Progress", value: "In Progress" },
        { label: "Pending", value: "Pending" },
      ];

  const vehicleFilterOptions = openedFromVehicle && vehicle
    ? [{ label: `${vehicle.vehicle_model || "-"} - ${vehicle.plate_number || "-"}`, value: vehicle.id }]
    : vehicles.map((v) => ({
        label: `${v.vehicle_model || "-"} - ${v.plate_number || "-"}`,
        value: v.id,
      }));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-600">{text.breadcrumb}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{text.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{text.subtitle}</p>
        </div>

        <Link
          href={selectedVehicleId ? `/cars/${selectedVehicleId}` : "/cars"}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowRight className="h-5 w-5" />
          {text.back}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{text.vehicleInfo}</h2>
              <Car className="h-6 w-6 text-blue-700" />
            </div>

            {loading ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-center font-bold text-slate-500">
                {ar ? "جاري تحميل البيانات..." : "Loading..."}
              </div>
            ) : openedFromVehicle ? (
              <div className="space-y-4">
                <Info label={ar ? "المركبة" : "Vehicle"} value={vehicle?.vehicle_model || "-"} />
                <Info label={ar ? "الرقم التسلسلي" : "Serial Number"} value={vehicle?.serial_number || "-"} />
                <Info label={ar ? "رقم اللوحة" : "Plate Number"} value={vehicle?.plate_number || "-"} />
                <Info label={ar ? "العداد الحالي" : "Current Odometer"} value={`${vehicle?.odometer || "-"} KM`} />
              </div>
            ) : (
              <SelectField
                label={text.chooseVehicle}
                required
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                placeholder={ar ? "اختر المركبة" : "Choose vehicle"}
                options={vehicles.map((v) => ({
                  label: `${v.vehicle_model || "-"} - ${v.plate_number || "-"}`,
                  value: v.id,
                }))}
              />
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{text.driver}</h2>
              <User className="h-6 w-6 text-blue-700" />
            </div>

            <div className="space-y-3">
              <DriverOption
                label={vehicle?.main_driver_name || (ar ? "قائد المركبة" : "Main Driver")}
                value="main"
                selected={selectedDriver}
                onClick={() => setSelectedDriver("main")}
              />

              {vehicle?.second_driver_name && (
                <DriverOption
                  label={vehicle.second_driver_name}
                  value="second"
                  selected={selectedDriver}
                  onClick={() => setSelectedDriver("second")}
                />
              )}

              {vehicle?.second_driver_name && (
                <DriverOption
                  label={ar ? "الاثنين معًا" : "Both Drivers"}
                  value="both"
                  selected={selectedDriver}
                  onClick={() => setSelectedDriver("both")}
                />
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">{text.attachments}</h2>
              <FileText className="h-6 w-6 text-blue-700" />
            </div>

            <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-blue-400 bg-blue-50/30 text-center">
              <CloudUpload className="h-10 w-10 text-blue-600" />
              <p className="mt-2 font-bold text-blue-700">
                {ar ? "رفع فاتورة أو صور الصيانة" : "Upload invoice or photos"}
              </p>
              <p className="mt-1 text-sm text-slate-500">PNG, JPG, PDF</p>
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <FormCard title={text.maintenanceDetails} icon={<Wrench className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label={text.maintenanceType}
                required
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
                placeholder={ar ? "اختر نوع الصيانة" : "Choose maintenance type"}
                options={(ar ? maintenanceTypesAr : maintenanceTypesEn).map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Field
                label={text.maintenanceDate}
                required
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
              />

              <Field
                label={text.odometer}
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />

              <SelectField
                label={text.status}
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder={ar ? "اختر الحالة" : "Choose status"}
                options={statusOptions}
              />
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="mb-2 block font-bold">
                  {text.description} <span className="text-red-500">*</span>
                </span>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-28 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder={ar ? "اكتب وصف مختصر لعملية الصيانة..." : "Write description..."}
                />
              </label>
            </div>
          </FormCard>

          <FormCard title={text.costWorkshop} icon={<Gauge className="h-5 w-5" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label={text.cost} value={cost} onChange={(e) => setCost(e.target.value)} placeholder={ar ? "مثال: 250" : "Example: 250"} />
              <Field label={text.workshopName} value={workshopName} onChange={(e) => setWorkshopName(e.target.value)} />
              <Field label={text.technician} value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} />
              <Field label={text.invoiceNumber} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
          </FormCard>

          <FormCard title={ar ? "ملاحظات إضافية" : "Additional Notes"} icon={<FileText className="h-5 w-5" />}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              placeholder={ar ? "اكتب أي ملاحظات إضافية..." : "Write additional notes..."}
            />
          </FormCard>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-end gap-4">
              <Link
                href={selectedVehicleId ? `/cars/${selectedVehicleId}` : "/cars"}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
                {text.cancel}
              </Link>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-3 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
              >
                <Save className="h-5 w-5" />
                {saving ? (ar ? "جاري الحفظ..." : "Saving...") : text.save}
              </button>
            </div>
          </section>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">{text.history}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {ar ? "عرض وتصفية وتصدير جميع عمليات الصيانة" : "View, filter and export maintenance records"}
            </p>
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-5 w-5" />
            {text.export}
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-5">
          <button
            onClick={() => {
              setHistorySearch("");
              setHistoryVehicleFilter(openedFromVehicle && vehicleId ? vehicleId : "");
              setHistoryTypeFilter("");
              setHistoryStatusFilter("");
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold hover:bg-slate-50"
          >
            <Filter className="h-5 w-5" />
            {text.filters}
          </button>

          <select
            value={historyVehicleFilter}
            onChange={(e) => setHistoryVehicleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            {!openedFromVehicle && <option value="">{text.allVehicles}</option>}
            {vehicleFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={historyTypeFilter}
            onChange={(e) => setHistoryTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="">{text.allTypes}</option>
            {(ar ? maintenanceTypesAr : maintenanceTypesEn).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={historyStatusFilter}
            onChange={(e) => setHistoryStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="">{text.allStatus}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pr-12 pl-4 outline-none focus:border-blue-500"
              placeholder={text.search}
            />
          </div>
        </div>

        {recordsLoading ? (
          <div className="rounded-2xl border border-slate-100 p-10 text-center font-bold text-slate-500">
            {text.loadingHistory}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 p-10 text-center font-bold text-slate-500">
            {text.emptyHistory}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <TH>{text.vehicle}</TH>
                  <TH>{text.plate}</TH>
                  <TH>{text.tableType}</TH>
                  <TH>{text.tableDate}</TH>
                  <TH>{text.tableOdometer}</TH>
                  <TH>{text.tableStatus}</TH>
                  <TH>{text.tableCost}</TH>
                  <TH>{text.tableDescription}</TH>
                  <TH>{ar ? "الإجراءات" : "Actions"}</TH>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const recordVehicle = getRecordVehicle(record);

                  return (
                    <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold">{recordVehicle?.vehicle_model || "-"}</td>
                      <td className="px-4 py-3 font-bold">{recordVehicle?.plate_number || "-"}</td>
                      <td className="px-4 py-3">{record.maintenance_type || record.type || "-"}</td>
                      <td className="px-4 py-3">{record.maintenance_date || record.service_date || "-"}</td>
                      <td className="px-4 py-3 font-bold">{record.odometer || record.odometer_km || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={maintenanceBadge(record.status || "")}>{record.status || "-"}</span>
                      </td>
                      <td className="px-4 py-3 font-bold">{Number(record.cost || 0).toLocaleString("en-US")} SAR</td>
                      <td className="px-4 py-3">{record.description || "-"}</td>

                      <td className="px-4 py-3">
  <div className="flex items-center gap-2">
    <button
      onClick={() => handleEdit(record)}
      className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-200"
    >
      <Pencil className="h-4 w-4" />
      {ar ? "تعديل" : "Edit"}
    </button>

    <button
      onClick={() => handleDelete(record.id)}
      className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200"
    >
      <Trash2 className="h-4 w-4" />
      {ar ? "حذف" : "Delete"}
    </button>
  </div>
</td> 
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 break-words font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

function DriverOption({
  label,
  value,
  selected,
  onClick,
}: {
  label: string;
  value: string;
  selected: string;
  onClick: () => void;
}) {
  const active = selected === value;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-right font-bold transition ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span>{label}</span>
      {active && <CheckCircle className="h-5 w-5" />}
    </button>
  );
}

function FormCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">{title}</h2>

        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            {icon}
          </div>
        )}
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
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-bold">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
      />
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
  options?: { label: string; value: string }[];
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
        <option value="">{placeholder || "Choose"}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-right font-bold">{children}</th>;
}

function maintenanceBadge(value: string) {
  if (value === "مكتملة" || value === "Completed") {
    return "rounded-full bg-green-100 px-4 py-1 text-xs font-bold text-green-700";
  }

  if (value === "تحت التنفيذ" || value === "In Progress") {
    return "rounded-full bg-orange-100 px-4 py-1 text-xs font-bold text-orange-700";
  }

  if (value === "معلقة" || value === "Pending") {
    return "rounded-full bg-red-100 px-4 py-1 text-xs font-bold text-red-700";
  }

  return "rounded-full bg-slate-100 px-4 py-1 text-xs font-bold text-slate-700";
}
