"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppLayout, { useLanguage } from "@/components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  ArrowRight,
  Bell,
  Car,
  Download,
  Droplets,
  Edit,
  Filter,
  History,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Vehicle = {
  id: string;
  vehicle_model: string | null;
  serial_number: string | null;
  plate_number: string | null;
  odometer: string | null;
};

type OilRecord = {
  id: string;
  vehicle_id: string | null;
  oil_date: string | null;
  odometer: string | null;
  oil_quantity: string | null;
  oil_type: string | null;
  filter_changed?: string | null;
  filter_type: string | null;
  distance_since: string | null;
  notes?: string | null;
  created_at?: string | null;
};

const oilTypes = ["10W-30"];
const oilQuantities = ["3", "3.5"];

export default function AddOilChangePage() {
  return (
    <AppLayout title="تغيير الزيت" subtitle="إضافة تغيير زيت جديد للمركبة">
      <Suspense fallback={<div className="p-10 text-center font-bold">Loading...</div>}>
        <AddOilChangeContent />
      </Suspense>
    </AppLayout>
  );
}

function AddOilChangeContent() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const searchParams = useSearchParams();

  const vehicleId = searchParams.get("vehicle");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId || "");

  const [records, setRecords] = useState<OilRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [historySearch, setHistorySearch] = useState("");

  const [oilDate, setOilDate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [oilQuantity, setOilQuantity] = useState("3.5");
  const [oilType, setOilType] = useState("10W-30");
  const [filterChanged, setFilterChanged] = useState(ar ? "نعم" : "Yes");
  const [filterType, setFilterType] = useState(ar ? "أصلي" : "Original");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchVehicles();
    fetchAllRecords();

    if (vehicleId) {
      fetchVehicle(vehicleId);
    }
  }, [vehicleId]);

  async function fetchVehicles() {
    const { data } = await supabase
      .from("vehicles")
      .select("id, vehicle_model, serial_number, plate_number, odometer");

    setVehicles(data || []);
  }

  async function fetchVehicle(id: string) {
    const { data } = await supabase
      .from("vehicles")
      .select("id, vehicle_model, serial_number, plate_number, odometer")
      .eq("id", id)
      .single();

    if (data) {
      setVehicle(data);
      setSelectedVehicleId(data.id);
      setOdometer(data.odometer || "");
    }
  }

  async function fetchAllRecords() {
    const { data } = await supabase
      .from("oil_changes")
      .select("*")
      .order("created_at", { ascending: false });

    setRecords(data || []);
  }

  async function handleVehicleChange(id: string) {
    setSelectedVehicleId(id);

    const selected = vehicles.find((v) => v.id === id) || null;

    setVehicle(selected);
    setOdometer(selected?.odometer || "");
  }

  function resetForm() {
    setEditingId(null);
    setOilDate("");
    setOilQuantity("3.5");
    setOilType("10W-30");
    setFilterChanged(ar ? "نعم" : "Yes");
    setFilterType(ar ? "أصلي" : "Original");
    setNotes("");
  }

  function getRecordVehicle(record: OilRecord) {
    return vehicles.find((v) => v.id === record.vehicle_id) || null;
  }

  async function handleSave() {
    if (!selectedVehicleId || !oilDate || !odometer) {
      alert(ar ? "أكمل البيانات المطلوبة" : "Complete required fields");
      return;
    }

    setSaving(true);

    const payload = {
      vehicle_id: selectedVehicleId,
      oil_date: oilDate,
      odometer,
      oil_quantity: oilQuantity,
      oil_type: oilType,
      filter_changed: filterChanged,
      filter_type:
  filterChanged === "نعم" || filterChanged === "Yes"
    ? filterType
    : null,
      notes,
    };

    const { error } = editingId
      ? await supabase.from("oil_changes").update(payload).eq("id", editingId)
      : await supabase.from("oil_changes").insert([payload]);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    await supabase
      .from("vehicles")
      .update({ odometer })
      .eq("id", selectedVehicleId);

    await fetchAllRecords();

    resetForm();

    alert(ar ? "تم الحفظ بنجاح" : "Saved successfully");

    setSaving(false);
  }
  function getDistanceSincePrevious(record: OilRecord) {
  if (!record.vehicle_id || !record.odometer) return null;

  const vehicleRecords = records
    .filter(
      (item) =>
        item.vehicle_id === record.vehicle_id &&
        item.odometer &&
        item.oil_date
    )
    .sort((a, b) => {
      const dateA = new Date(
        `${a.oil_date}T00:00:00`
      ).getTime();

      const dateB = new Date(
        `${b.oil_date}T00:00:00`
      ).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      return new Date(a.created_at || 0).getTime() -
        new Date(b.created_at || 0).getTime();
    });

  const currentIndex = vehicleRecords.findIndex(
    (item) => item.id === record.id
  );

  if (currentIndex <= 0) return null;

  const previousRecord = vehicleRecords[currentIndex - 1];

  const currentOdometer = Number(record.odometer);
  const previousOdometer = Number(previousRecord.odometer);

  if (
    Number.isNaN(currentOdometer) ||
    Number.isNaN(previousOdometer)
  ) {
    return null;
  }

  const distance = currentOdometer - previousOdometer;

  return distance >= 0 ? distance : null;
}

  function handleEdit(record: OilRecord) {
    setEditingId(record.id);

    setSelectedVehicleId(record.vehicle_id || "");
    setOilDate(record.oil_date || "");
    setOdometer(record.odometer || "");
    setOilQuantity(record.oil_quantity || "3.5");
    setOilType(record.oil_type || "10W-30");
    setFilterChanged(record.filter_changed || "yes");
    setFilterType(record.filter_type || "");
    setNotes(record.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const ok = confirm(ar ? "حذف السجل؟" : "Delete record?");

    if (!ok) return;

    await supabase.from("oil_changes").delete().eq("id", id);

    fetchAllRecords();
  }

  const filteredRecords = useMemo(() => {
    const q = historySearch.toLowerCase();

    return records.filter((record) => {
      const vehicle = getRecordVehicle(record);

      return `
        ${vehicle?.vehicle_model || ""}
        ${vehicle?.plate_number || ""}
        ${record.oil_type || ""}
      `
        .toLowerCase()
        .includes(q);
    });
  }, [records, historySearch]);

  function exportCsv() {
    const rows = filteredRecords.map((record) => {
      const vehicle = getRecordVehicle(record);

      return [
        vehicle?.vehicle_model || "",
        vehicle?.plate_number || "",
        record.oil_date || "",
        record.odometer || "",
        record.oil_quantity || "",
        record.oil_type || "",
        record.filter_type || "",
      ].join(",");
    });

    const csv = [
      "Vehicle,Plate,Date,Odometer,Quantity,Oil Type,Filter Type",
      ...rows,
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "oil-changes.csv";

    link.click();
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold">
            <Droplets className="h-8 w-8 text-blue-600" />
            {ar ? "تغيير الزيت" : "Oil Change"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {ar
              ? "إضافة وتعديل سجل تغييرات الزيت"
              : "Manage oil changes"}
          </p>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold hover:bg-slate-50"
        >
          <ArrowRight className="h-5 w-5" />
          {ar ? "العودة" : "Back"}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[350px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">
                {ar ? "اختيار السيارة" : "Choose Vehicle"}
              </h2>

              <Car className="h-6 w-6 text-blue-700" />
            </div>

            <select
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="">
                {ar ? "اختر السيارة" : "Choose Vehicle"}
              </option>

              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_model} - {v.plate_number}
                </option>
              ))}
            </select>

            <div className="space-y-4">
              <Info
                label={ar ? "المركبة" : "Vehicle"}
                value={vehicle?.vehicle_model || "-"}
              />

              <Info
                label={ar ? "رقم اللوحة" : "Plate"}
                value={vehicle?.plate_number || "-"}
              />

              <Info
                label={ar ? "العداد الحالي" : "Current Odometer"}
                value={`${vehicle?.odometer || "-"} KM`}
              />
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <FormCard
            title={ar ? "تفاصيل تغيير الزيت" : "Oil Change Details"}
            icon={<Droplets className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label={ar ? "تاريخ تغيير الزيت" : "Oil Date"}
                type="date"
                value={oilDate}
                onChange={(e: any) => setOilDate(e.target.value)}
              />

              <Field
                label={ar ? "عداد الكيلومترات" : "Odometer"}
                value={odometer}
                onChange={(e: any) => setOdometer(e.target.value)}
              />

              <SelectField
                label={ar ? "كمية الزيت" : "Oil Quantity"}
                value={oilQuantity}
                onChange={(e: any) => setOilQuantity(e.target.value)}
                options={oilQuantities}
              />

              <SelectField
                label={ar ? "نوع الزيت" : "Oil Type"}
                value={oilType}
                onChange={(e: any) => setOilType(e.target.value)}
                options={oilTypes}
              />

              <SelectField
  label={ar ? "تم تغيير فلتر الزيت" : "Oil Filter Changed"}
  value={filterChanged}
  onChange={(e: any) => setFilterChanged(e.target.value)}
  options={ar ? ["نعم", "لا"] : ["Yes", "No"]}
/>

{(filterChanged === "نعم" || filterChanged === "Yes") && (
  <SelectField
    label={ar ? "نوع الفلتر" : "Filter Type"}
    value={filterType}
    onChange={(e: any) => setFilterType(e.target.value)}
    options={ar ? ["أصلي", "تجاري"] : ["Original", "Commercial"]}
  />
)}
            </div>

            <div className="mt-4">
              <textarea
                value={notes}
                onChange={(e: any) => setNotes(e.target.value)}
                className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder={ar ? "ملاحظات..." : "Notes"}
              />
            </div>
          </FormCard>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-8 py-3 font-bold"
              >
                <X className="h-5 w-5" />
                {ar ? "إلغاء" : "Cancel"}
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-3 font-bold text-white"
              >
                <Save className="h-5 w-5" />
                {saving
                  ? ar
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : editingId
                  ? ar
                    ? "تعديل"
                    : "Update"
                  : ar
                  ? "حفظ"
                  : "Save"}
              </button>
            </div>
          </section>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold">
            <History className="h-6 w-6 text-blue-700" />
            {ar ? "سجل تغييرات الزيت" : "Oil Changes"}
          </h2>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-bold"
          >
            <Download className="h-5 w-5" />
            {ar ? "تصدير" : "Export"}
          </button>
        </div>

        <div className="mb-5 relative">
          <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />

          <input
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-3 pr-12 pl-4"
            placeholder={ar ? "بحث..." : "Search"}
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <TH>{ar ? "المركبة" : "Vehicle"}</TH>
                <TH>{ar ? "اللوحة" : "Plate"}</TH>
                <TH>{ar ? "التاريخ" : "Date"}</TH>
                <TH>{ar ? "العداد" : "Odometer"}</TH>
                <TH>{ar ? "المسافة على الزيت" : "Distance on Oil"}</TH>
                <TH>{ar ? "كمية الزيت" : "Quantity"}</TH>
                <TH>{ar ? "نوع الزيت" : "Oil Type"}</TH>
                <TH>{ar ? "تم تغيير الفلتر" : "Filter Changed"}</TH>
                <TH>{ar ? "نوع الفلتر" : "Filter Type"}</TH>
                <TH>{ar ? "إجراءات" : "Actions"}</TH>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => {
                const vehicle = getRecordVehicle(record);
                const distanceOnOil = getDistanceSincePrevious(record);
                return (
                  <tr key={record.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-bold">
                      {vehicle?.vehicle_model || "-"}
                    </td>

                    <td className="px-4 py-3 font-bold">
                      {vehicle?.plate_number || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {record.oil_date || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {record.odometer || "-"}
                    </td>
                    <td className="px-4 py-3 font-bold">
  {distanceOnOil !== null
    ? `${distanceOnOil.toLocaleString()} KM`
    : ar
      ? "أول تغيير"
      : "First Change"}
</td>

                    <td className="px-4 py-3">
                      {record.oil_quantity || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {record.oil_type || "-"}
                    </td>
                    <td className="px-4 py-3">
  {record.filter_changed === "نعم" ||
  record.filter_changed === "Yes" ||
  record.filter_changed === "yes"
    ? ar
      ? "نعم"
      : "Yes"
    : ar
      ? "لا"
      : "No"}
</td>

<td className="px-4 py-3">
  {record.filter_changed === "نعم" ||
  record.filter_changed === "Yes" ||
  record.filter_changed === "yes"
    ? record.filter_type || "-"
    : "-"}
</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                          {ar ? "تعديل" : "Edit"}
                        </button>

                        <button
                          onClick={() => handleDelete(record.id)}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
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
      </section>

      <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">
            {ar ? "تنبيهات مهمة" : "Important Alerts"}
          </h2>

          <Bell className="h-6 w-6 text-blue-600" />
        </div>

        <ul className="list-inside list-disc space-y-2 text-sm font-bold text-slate-700">
          <li>
            {ar
              ? "يوصى بتغيير الزيت قبل 5000 كم."
              : "Recommended before 5000 KM."}
          </li>

          <li>
            {ar
              ? "تأكد من مستوى الزيت بشكل دوري."
              : "Check oil level periodically."}
          </li>
        </ul>
      </section>
    </>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 font-extrabold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function FormCard({ title, icon, children }: any) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">{title}</h2>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <label className="block">
      <span className="mb-2 block font-bold">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <label className="block">
      <span className="mb-2 block font-bold">
        {label}
      </span>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
      >
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TH({ children }: any) {
  return (
    <th className="px-4 py-3 text-right font-bold">
      {children}
    </th>
  );
}