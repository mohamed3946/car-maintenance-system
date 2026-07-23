"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";
import {
  AlertTriangle,
  Ban,
  Car,
  CheckCircle,
  CircleDollarSign,
  Download,
  FileText,
  Printer,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

type Lang = "ar" | "en";
type IncidentType = "accident" | "breakdown" | "maintenance_damage" | "other";
type IncidentStatus =
  | "draft"
  | "pending_signature"
  | "signed"
  | "deducted"
  | "cancelled";
type DeductionMethod = "salary" | "cash" | "installments";

type Vehicle = {
  id: string;
  plate_number: string | null;
  brand?: string | null;
  model?: string | null;
  vehicle_name?: string | null;
  vehicle_type?: string | null;
  type?: string | null;
  category?: string | null;
  driver_name?: string | null;
  driver_iqama?: string | null;
  assigned_driver_name?: string | null;
  assigned_driver_iqama?: string | null;
};

type Incident = {
  id: string;
  acknowledgment_no?: string | null;
  vehicle_id: string | null;
  vehicle_plate: string;
  vehicle_type: string;
  driver_name: string;
  driver_iqama: string;
  driver_phone?: string | null;
  incident_type: IncidentType;
  incident_date: string;
  repair_invoice_no: string;
  workshop_name: string;
  description: string;
  repair_amount: number;
  deduction_method: DeductionMethod;
  installment_count: number;
  monthly_deduction: number;
  status: IncidentStatus;
  attachment_url: string | null;
  notes: string | null;
  created_at?: string;
};

const pageText = {
  ar: {
    title: "الحوادث والأعطال",
    subtitle: "إدارة إقرارات تحميل تكلفة إصلاح المركبات",
    newRecord: "إقرار جديد",
    save: "حفظ الإقرار",
    update: "تحديث الإقرار",
    clear: "تفريغ النموذج",
    print: "طباعة الإقرار",
    edit: "تعديل",
    delete: "حذف",
    export: "تصدير",
    clearFilters: "مسح الفلاتر",
    actions: "إجراءات",
    search: "بحث باسم السائق / اللوحة / رقم الإقامة / رقم الإقرار",
    all: "الكل",
    vehicleType: "نوع المركبة",
    chooseVehicleType: "اختر نوع المركبة",
    vehicle: "رقم اللوحة / المركبة",
    chooseVehicle: "اختر رقم اللوحة",
    plate: "رقم اللوحة",
    driverName: "اسم السائق",
    driverIqama: "رقم الإقامة",
    driverPhone: "رقم الجوال",
    incidentType: "نوع الحالة",
    incidentDate: "تاريخ الحالة",
    invoiceNo: "رقم فاتورة الإصلاح",
    workshop: "مركز / ورشة الإصلاح",
    description: "تفاصيل الحادث أو العطل",
    amount: "قيمة الإصلاح",
    deductionMethod: "طريقة الخصم",
    installments: "عدد الأقساط",
    monthlyDeduction: "قيمة القسط الشهري",
    status: "الحالة",
    notes: "ملاحظات",
    attachment: "إرفاق الفاتورة",
    noRecords: "لا توجد سجلات حتى الآن",
    totalAmount: "إجمالي تكلفة الإصلاحات",
    totalRecords: "عدد الحالات",
    openCases: "الحالات المفتوحة",
    closedCases: "الحالات المغلقة",
    stoppedVehicles: "مركبات متوقفة",
    pending: "بانتظار توقيع",
    signed: "موقّع",
    deducted: "تم الخصم",
    draft: "مسودة",
    cancelled: "ملغي",
    salary: "خصم من الراتب",
    cash: "سداد نقدي",
    installmentsMethod: "خصم على أقساط",
    accident: "حادث",
    breakdown: "عطل",
    maintenance_damage: "تلف بسبب سوء استخدام",
    other: "أخرى",
    declarationTitle: "إقرار تحميل تكلفة إصلاح مركبة",
    declarationText:
      "أقر أنا السائق الموضح بياناته أدناه بأنني اطلعت على تفاصيل إصلاح المركبة وقيمة الفاتورة، وأوافق على تحميلي مبلغ الإصلاح وفق طريقة الخصم الموضحة، وذلك حسب سياسة الشركة والأنظمة المعمول بها.",
    employeeSignature: "توقيع السائق",
    fingerprint: "البصمة",
    managerSignature: "توقيع المسؤول",
    successSaved: "تم حفظ الإقرار بنجاح",
    successDeleted: "تم حذف السجل",
    error: "حدث خطأ، تأكد من الاتصال وبيانات Supabase",
    confirmDelete: "هل تريد حذف هذا السجل؟",
    invoice: "الفاتورة",
    acknowledgmentNo: "رقم الإقرار",
    generatedAfterSave: "سيتم إنشاؤه عند الحفظ",
    company: "نمو التوصيل",
    section: "الصيانة",
  },
  en: {
    title: "Accidents & Breakdowns",
    subtitle: "Manage vehicle repair cost acknowledgments",
    newRecord: "New Record",
    save: "Save Acknowledgment",
    update: "Update Acknowledgment",
    clear: "Clear Form",
    print: "Print Acknowledgment",
    edit: "Edit",
    delete: "Delete",
    export: "Export",
    clearFilters: "Clear Filters",
    actions: "Actions",
    search: "Search by driver / plate / iqama / acknowledgment no.",
    all: "All",
    vehicleType: "Vehicle Type",
    chooseVehicleType: "Choose Vehicle Type",
    vehicle: "Plate / Vehicle",
    chooseVehicle: "Choose Plate Number",
    plate: "Plate Number",
    driverName: "Driver Name",
    driverIqama: "Iqama Number",
    driverPhone: "Phone Number",
    incidentType: "Incident Type",
    incidentDate: "Incident Date",
    invoiceNo: "Repair Invoice No.",
    workshop: "Workshop",
    description: "Accident or breakdown details",
    amount: "Repair Amount",
    deductionMethod: "Deduction Method",
    installments: "Installments",
    monthlyDeduction: "Monthly Deduction",
    status: "Status",
    notes: "Notes",
    attachment: "Attach Invoice",
    noRecords: "No records yet",
    totalAmount: "Total Repair Cost",
    totalRecords: "Total Cases",
    openCases: "Open Cases",
    closedCases: "Closed Cases",
    stoppedVehicles: "Stopped Vehicles",
    pending: "Pending Signature",
    signed: "Signed",
    deducted: "Deducted",
    draft: "Draft",
    cancelled: "Cancelled",
    salary: "Salary Deduction",
    cash: "Cash Payment",
    installmentsMethod: "Installments",
    accident: "Accident",
    breakdown: "Breakdown",
    maintenance_damage: "Misuse Damage",
    other: "Other",
    declarationTitle: "Vehicle Repair Cost Acknowledgment",
    declarationText:
      "I, the driver whose details are shown below, acknowledge that I have reviewed the vehicle repair details and invoice amount, and I agree to bear the repair cost according to the stated deduction method and company policy.",
    employeeSignature: "Driver Signature",
    fingerprint: "Fingerprint",
    managerSignature: "Manager Signature",
    successSaved: "Acknowledgment saved successfully",
    successDeleted: "Record deleted",
    error: "Something went wrong. Check Supabase connection and data.",
    confirmDelete: "Delete this record?",
    invoice: "Invoice",
    acknowledgmentNo: "Acknowledgment No.",
    generatedAfterSave: "Will be generated after saving",
    company: "Numo Delivery",
    section: "Maintenance",
  },
} as const;

const emptyForm: Incident = {
  id: "",
  acknowledgment_no: null,
  vehicle_id: null,
  vehicle_plate: "",
  vehicle_type: "",
  driver_name: "",
  driver_iqama: "",
  driver_phone: "",
  incident_type: "accident",
  incident_date: new Date().toISOString().slice(0, 10),
  repair_invoice_no: "",
  workshop_name: "",
  description: "",
  repair_amount: 0,
  deduction_method: "salary",
  installment_count: 1,
  monthly_deduction: 0,
  status: "pending_signature",
  attachment_url: null,
  notes: "",
};

export default function IncidentsPage() {
  return (
    <AppLayout titleKey="accidents" subtitleKey="overview">
      <Suspense fallback={<div className="p-10 text-center font-bold">Loading...</div>}>
        <IncidentContent />
      </Suspense>
    </AppLayout>
  );
}

function IncidentContent() {
  const { lang } = useLanguage() as { lang: Lang; t: any };
  const tx = pageText[lang || "ar"];
  const searchParams = useSearchParams();
  const vehicleIdFromUrl = searchParams.get("vehicle_id");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<Incident[]>([]);
  const [form, setForm] = useState<Incident>(emptyForm);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<IncidentType | "all">("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!vehicleIdFromUrl || vehicles.length === 0) return;

    const selected = vehicles.find((v) => v.id === vehicleIdFromUrl);
    if (!selected) return;

    const selectedType = getVehicleType(selected);

    setVehicleTypeFilter(selectedType);
    setForm((prev) => ({
      ...prev,
      vehicle_id: selected.id,
      vehicle_plate: selected.plate_number || "",
      vehicle_type: selectedType,
      driver_name: getVehicleDriverName(selected) || prev.driver_name,
      driver_iqama: getVehicleDriverIqama(selected) || prev.driver_iqama,
    }));
  }, [vehicleIdFromUrl, vehicles]);

  useEffect(() => {
    const count = Number(form.installment_count || 1);
    const amount = Number(form.repair_amount || 0);
    const monthly = count > 0 ? Number((amount / count).toFixed(2)) : amount;

    if (monthly !== form.monthly_deduction) {
      setForm((prev) => ({ ...prev, monthly_deduction: monthly }));
    }
  }, [form.repair_amount, form.installment_count, form.monthly_deduction]);

  async function loadData() {
    setLoading(true);

    const [vehiclesRes, incidentsRes] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicle_incidents").select("*").order("created_at", { ascending: false }),
    ]);

    if (!vehiclesRes.error) setVehicles((vehiclesRes.data || []) as Vehicle[]);
    if (!incidentsRes.error) setRecords((incidentsRes.data || []) as Incident[]);
    if (vehiclesRes.error || incidentsRes.error) showMsg(tx.error);

    setLoading(false);
  }

  function showMsg(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  }

  function generateAcknowledgmentNo() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ACC-${yy}${mm}${dd}-${random}`;
  }

  function onVehicleTypeChange(type: string) {
    setVehicleTypeFilter(type);
    setForm((prev) => ({
      ...prev,
      vehicle_id: null,
      vehicle_plate: "",
      vehicle_type: type,
      driver_name: "",
      driver_iqama: "",
      driver_phone: "",
    }));
  }

  function onVehicleChange(vehicleId: string) {
    const selected = vehicles.find((v) => v.id === vehicleId);
    const selectedType = selected ? getVehicleType(selected) : vehicleTypeFilter;

    setForm((prev) => ({
      ...prev,
      vehicle_id: vehicleId || null,
      vehicle_plate: selected?.plate_number || "",
      vehicle_type: selectedType || prev.vehicle_type,
      driver_name: selected ? getVehicleDriverName(selected) : "",
      driver_iqama: selected ? getVehicleDriverIqama(selected) : "",
    }));
  }

  async function uploadInvoice(file?: File) {
    if (!file) return null;

    const ext = file.name.split(".").pop();
    const fileName = `repair-invoices/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("maintenance").upload(fileName, file);

    if (error) {
      showMsg(tx.error);
      return null;
    }

    const { data } = supabase.storage.from("maintenance").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fileInput = e.currentTarget.elements.namedItem("invoice_file") as HTMLInputElement;
    const uploadedUrl = await uploadInvoice(fileInput?.files?.[0]);
    const acknowledgmentNo =
      form.id && form.acknowledgment_no ? form.acknowledgment_no : generateAcknowledgmentNo();

    const payload = {
      acknowledgment_no: acknowledgmentNo,
      vehicle_id: form.vehicle_id || null,
      vehicle_plate: form.vehicle_plate,
      vehicle_type: form.vehicle_type,
      driver_name: form.driver_name,
      driver_iqama: form.driver_iqama,
      driver_phone: form.driver_phone,
      incident_type: form.incident_type,
      incident_date: form.incident_date,
      repair_invoice_no: form.repair_invoice_no,
      workshop_name: form.workshop_name,
      description: form.description,
      repair_amount: Number(form.repair_amount || 0),
      deduction_method: form.deduction_method,
      installment_count: Number(form.installment_count || 1),
      monthly_deduction: Number(form.monthly_deduction || 0),
      status: form.status,
      attachment_url: uploadedUrl || form.attachment_url,
      notes: form.notes,
    };

    const res = form.id
      ? await supabase.from("vehicle_incidents").update(payload).eq("id", form.id)
      : await supabase.from("vehicle_incidents").insert(payload);

    setLoading(false);

    if (res.error) {
      console.log(res.error);
      return showMsg(tx.error);
    }

    showMsg(tx.successSaved);
    setForm(emptyForm);
    setVehicleTypeFilter("");
    await loadData();
  }

  async function handleDelete(id: string) {
    const ok = window.confirm(tx.confirmDelete);
    if (!ok) return;

    const { error } = await supabase.from("vehicle_incidents").delete().eq("id", id);
    if (error) return showMsg(tx.error);

    showMsg(tx.successDeleted);
    await loadData();
  }

  function handlePrint() {
    window.print();
  }

  function handleEdit(record: Incident) {
    setForm(record);
    setVehicleTypeFilter(record.vehicle_type || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exportCsv() {
    const headers =
      lang === "ar"
        ? [
            "رقم الإقرار",
            "نوع المركبة",
            "رقم اللوحة",
            "اسم السائق",
            "رقم الإقامة",
            "رقم الجوال",
            "نوع الحالة",
            "التاريخ",
            "قيمة الإصلاح",
            "الحالة",
          ]
        : [
            "Acknowledgment No.",
            "Vehicle Type",
            "Plate",
            "Driver Name",
            "Iqama",
            "Phone",
            "Incident Type",
            "Date",
            "Amount",
            "Status",
          ];

    const rows = filteredRecords.map((r) => [
      r.acknowledgment_no || "",
      r.vehicle_type || "",
      r.vehicle_plate || "",
      r.driver_name || "",
      r.driver_iqama || "",
      r.driver_phone || "",
      tx[r.incident_type] || r.incident_type,
      r.incident_date || "",
      Number(r.repair_amount || 0),
      getStatusLabel(r.status, tx),
    ]);

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
    link.download =
      lang === "ar"
        ? `سجل-الحوادث-${new Date().toISOString().slice(0, 10)}.csv`
        : `incidents-records-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const vehicleTypes = useMemo(() => {
    return Array.from(new Set(vehicles.map((v) => getVehicleType(v)).filter(Boolean)));
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (!vehicleTypeFilter) return vehicles;
    return vehicles.filter((v) => getVehicleType(v) === vehicleTypeFilter);
  }, [vehicles, vehicleTypeFilter]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

    return records.filter((r) => {
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const matchType = typeFilter === "all" || r.incident_type === typeFilter;

      const matchSearch =
        !q ||
        r.acknowledgment_no?.toLowerCase().includes(q) ||
        r.driver_name?.toLowerCase().includes(q) ||
        r.driver_iqama?.toLowerCase().includes(q) ||
        r.driver_phone?.toLowerCase().includes(q) ||
        r.vehicle_plate?.toLowerCase().includes(q) ||
        r.vehicle_type?.toLowerCase().includes(q);

      return matchStatus && matchType && matchSearch;
    });
  }, [records, search, statusFilter, typeFilter]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => {
        acc.count += 1;
        acc.amount += Number(r.repair_amount || 0);
        if (r.status === "pending_signature" || r.status === "draft") acc.open += 1;
        if (r.status === "signed" || r.status === "deducted") acc.closed += 1;
        return acc;
      },
      { count: 0, amount: 0, open: 0, closed: 0 }
    );
  }, [filteredRecords]);

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f2544]">{tx.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{tx.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setForm(emptyForm);
            setVehicleTypeFilter("");
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-blue-700"
        >
          <FileText className="h-5 w-5" />
          {tx.newRecord}
        </button>
      </div>

      {message && (
        <div className="no-print mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-700">
          {message}
        </div>
      )}

      <div className="no-print grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={<Car />} title={tx.totalRecords} value={String(totals.count)} note={tx.title} color="blue" />
        <StatCard icon={<AlertTriangle />} title={tx.openCases} value={String(totals.open)} note={tx.pending} color="orange" />
        <StatCard icon={<CheckCircle />} title={tx.closedCases} value={String(totals.closed)} note={tx.signed} color="green" />
        <StatCard icon={<CircleDollarSign />} title={tx.totalAmount} value={totals.amount.toLocaleString("en-US")} note="SAR" color="purple" />
        <StatCard icon={<Ban />} title={tx.stoppedVehicles} value="0" note={lang === "ar" ? "مركبة" : "Vehicle"} color="red" />
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 2xl:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#0f2544]">{tx.declarationTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{tx.subtitle}</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Supabase
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label={tx.vehicleType}>
              <select
                className={inputClass}
                value={vehicleTypeFilter}
                onChange={(e) => onVehicleTypeChange(e.target.value)}
              >
                <option value="">{tx.chooseVehicleType}</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={tx.vehicle}>
              <select
                value={form.vehicle_id || ""}
                onChange={(e) => onVehicleChange(e.target.value)}
                className={inputClass}
              >
                <option value="">{tx.chooseVehicle}</option>
                {filteredVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number || "-"} {getVehicleType(v) ? `- ${getVehicleType(v)}` : ""}{" "}
                    {v.brand ? `- ${v.brand}` : ""} {v.model || ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={tx.plate}>
              <input className={`${inputClass} bg-slate-50`} value={form.vehicle_plate} readOnly />
            </Field>

            <Field label={tx.driverName}>
              <input
                className={inputClass}
                value={form.driver_name}
                onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
                required
              />
            </Field>

            <Field label={tx.driverIqama}>
              <input
                className={inputClass}
                value={form.driver_iqama}
                onChange={(e) => setForm({ ...form, driver_iqama: e.target.value })}
              />
            </Field>

            <Field label={tx.driverPhone}>
              <input
                className={inputClass}
                value={form.driver_phone || ""}
                onChange={(e) => setForm({ ...form, driver_phone: e.target.value })}
              />
            </Field>

            <Field label={tx.incidentType}>
              <select
                className={inputClass}
                value={form.incident_type}
                onChange={(e) => setForm({ ...form, incident_type: e.target.value as IncidentType })}
              >
                <option value="accident">{tx.accident}</option>
                <option value="breakdown">{tx.breakdown}</option>
                <option value="maintenance_damage">{tx.maintenance_damage}</option>
                <option value="other">{tx.other}</option>
              </select>
            </Field>

            <Field label={tx.incidentDate}>
              <input
                type="date"
                className={inputClass}
                value={form.incident_date}
                onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                required
              />
            </Field>

            <Field label={tx.invoiceNo}>
              <input
                className={inputClass}
                value={form.repair_invoice_no}
                onChange={(e) => setForm({ ...form, repair_invoice_no: e.target.value })}
              />
            </Field>

            <Field label={tx.workshop}>
              <input
                className={inputClass}
                value={form.workshop_name}
                onChange={(e) => setForm({ ...form, workshop_name: e.target.value })}
              />
            </Field>

            <Field label={tx.amount}>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.repair_amount}
                onChange={(e) => setForm({ ...form, repair_amount: Number(e.target.value) })}
                required
              />
            </Field>

            <Field label={tx.deductionMethod}>
              <select
                className={inputClass}
                value={form.deduction_method}
                onChange={(e) => setForm({ ...form, deduction_method: e.target.value as DeductionMethod })}
              >
                <option value="salary">{tx.salary}</option>
                <option value="cash">{tx.cash}</option>
                <option value="installments">{tx.installmentsMethod}</option>
              </select>
            </Field>

            <Field label={tx.installments}>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={form.installment_count}
                onChange={(e) => setForm({ ...form, installment_count: Number(e.target.value) })}
              />
            </Field>

            <Field label={tx.monthlyDeduction}>
              <input
                type="number"
                className={`${inputClass} bg-slate-50`}
                value={form.monthly_deduction}
                readOnly
              />
            </Field>

            <Field label={tx.status}>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as IncidentStatus })}
              >
                <option value="draft">{tx.draft}</option>
                <option value="pending_signature">{tx.pending}</option>
                <option value="signed">{tx.signed}</option>
                <option value="deducted">{tx.deducted}</option>
                <option value="cancelled">{tx.cancelled}</option>
              </select>
            </Field>

            <Field label={tx.attachment}>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                <Upload className="h-5 w-5 text-blue-600" />
                {tx.attachment}
                <input name="invoice_file" type="file" accept="image/*,.pdf" className="hidden" />
              </label>
            </Field>
          </div>

          <Field label={tx.description} className="mt-4">
            <textarea
              className={`${inputClass} min-h-24`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </Field>

          <Field label={tx.notes} className="mt-4">
            <textarea
              className={`${inputClass} min-h-20`}
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {form.id ? tx.update : tx.save}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setVehicleTypeFilter("");
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              {tx.clear}
            </button>

            
          </div>
        </form>

        <div ref={printRef} id="print-area" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:p-0">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white print:rounded-none print:border-0">
            <div className="bg-[#0f2544] px-6 py-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-[#0f2544]">
                    ND
                  </div>
                  <div>
                    <p className="text-xl font-extrabold">{tx.company}</p>
                    <p className="text-sm text-blue-100">{tx.section}</p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-xs text-blue-100">{tx.acknowledgmentNo}</p>
                  <p className="text-lg font-extrabold">
                    {form.acknowledgment_no || tx.generatedAfterSave}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <h2 className="text-2xl font-extrabold text-[#0f2544]">{tx.declarationTitle}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                </p>
              </div>

              <p className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-slate-700">
                {tx.declarationText}
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <PrintItem label={tx.acknowledgmentNo} value={form.acknowledgment_no || tx.generatedAfterSave} />
                <PrintItem label={tx.vehicleType} value={form.vehicle_type} />
                <PrintItem label={tx.plate} value={form.vehicle_plate} />
                <PrintItem label={tx.driverName} value={form.driver_name} />
                <PrintItem label={tx.driverIqama} value={form.driver_iqama} />
                <PrintItem label={tx.driverPhone} value={form.driver_phone || "-"} />
                <PrintItem label={tx.incidentDate} value={form.incident_date} />
                <PrintItem label={tx.incidentType} value={tx[form.incident_type]} />
                <PrintItem label={tx.invoiceNo} value={form.repair_invoice_no} />
                <PrintItem label={tx.workshop} value={form.workshop_name} />
                <PrintItem
                  label={tx.deductionMethod}
                  value={
                    form.deduction_method === "salary"
                      ? tx.salary
                      : form.deduction_method === "cash"
                        ? tx.cash
                        : tx.installmentsMethod
                  }
                />
                <PrintItem label={tx.installments} value={String(form.installment_count || 1)} />
                <PrintItem
                  label={tx.monthlyDeduction}
                  value={`SAR ${Number(form.monthly_deduction || 0).toLocaleString("en-US")}`}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500">{tx.description}</p>
                <p className="mt-2 min-h-16 text-sm leading-7 text-[#0f2544]">
                  {form.description || "-"}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border-2 border-[#0f2544] bg-slate-50 p-4 text-center">
                <p className="text-sm font-bold text-slate-500">{tx.amount}</p>
                <p className="mt-1 text-3xl font-extrabold text-[#0f2544]">
                  SAR {Number(form.repair_amount || 0).toLocaleString("en-US")}
                </p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 text-center text-sm font-bold text-[#0f2544]">
                <div className="rounded-2xl border border-slate-300 p-6">{tx.employeeSignature}</div>
                <div className="rounded-2xl border border-slate-300 p-6">{tx.fingerprint}</div>
                <div className="rounded-2xl border border-slate-300 p-6">{tx.managerSignature}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="no-print mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-[#0f2544]">
              <FileText className="h-6 w-6 text-blue-700" />
              {tx.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {lang === "ar"
                ? "عرض وتصفية وتصدير جميع إقرارات الحوادث والأعطال"
                : "View, filter and export all incident acknowledgments"}
            </p>
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-5 w-5" />
            {tx.export}
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              className={`${inputClass} pr-12`}
              placeholder={tx.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className={inputClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | "all")}
          >
            <option value="all">{tx.all}</option>
            <option value="pending_signature">{tx.pending}</option>
            <option value="signed">{tx.signed}</option>
            <option value="deducted">{tx.deducted}</option>
            <option value="draft">{tx.draft}</option>
            <option value="cancelled">{tx.cancelled}</option>
          </select>

          <select
            className={inputClass}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as IncidentType | "all")}
          >
            <option value="all">{lang === "ar" ? "كل الأنواع" : "All Types"}</option>
            <option value="accident">{tx.accident}</option>
            <option value="breakdown">{tx.breakdown}</option>
            <option value="maintenance_damage">{tx.maintenance_damage}</option>
            <option value="other">{tx.other}</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setTypeFilter("all");
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold hover:bg-slate-50"
          >
            {tx.clearFilters}
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1500px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 text-right">{tx.acknowledgmentNo}</th>
                <th className="p-4 text-right">{tx.vehicleType}</th>
                <th className="p-4 text-right">{tx.plate}</th>
                <th className="p-4 text-right">{tx.driverName}</th>
                <th className="p-4 text-right">{tx.driverPhone}</th>
                <th className="p-4 text-right">{tx.incidentType}</th>
                <th className="p-4 text-right">{tx.incidentDate}</th>
                <th className="p-4 text-right">{tx.amount}</th>
                <th className="p-4 text-right">{tx.status}</th>
                <th className="p-4 text-right">{tx.invoice}</th>
                <th className="p-4 text-right">{tx.actions}</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-extrabold text-[#0f2544]">
                    {r.acknowledgment_no || "-"}
                  </td>
                  <td className="p-4">{r.vehicle_type || "-"}</td>
                  <td className="p-4 font-extrabold text-[#0f2544]">{r.vehicle_plate}</td>
                  <td className="p-4 font-bold">{r.driver_name}</td>
                  <td className="p-4">{r.driver_phone || "-"}</td>
                  <td className="p-4">{tx[r.incident_type]}</td>
                  <td className="p-4">{r.incident_date}</td>
                  <td className="p-4 font-extrabold text-[#0f2544]">
                    {Number(r.repair_amount || 0).toLocaleString("en-US")} SAR
                  </td>
                  <td className="p-4">
                    <StatusBadge status={r.status} tx={tx} />
                  </td>
                  <td className="p-4">
                    {r.attachment_url ? (
                      <a
                        href={r.attachment_url}
                        target="_blank"
                        className="font-bold text-blue-600 underline"
                      >
                        {tx.invoice}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/maintenance/incidents/print/${r.id}`}
                        target="_blank"
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                      >
                        <Printer className="h-4 w-4" />
                        {tx.print}
                      </Link>

                      <button
                        onClick={() => handleEdit(r)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                      >
                        {tx.edit}
                      </button>

                      <button
                        onClick={() => handleDelete(r.id)}
                        className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        {tx.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filteredRecords.length && (
                <tr>
                  <td colSpan={11} className="p-10 text-center text-slate-500">
                    {tx.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function getVehicleType(vehicle: Vehicle) {
  return vehicle.vehicle_type || vehicle.type || vehicle.category || "";
}

function getVehicleDriverName(vehicle: Vehicle) {
  return vehicle.driver_name || vehicle.assigned_driver_name || "";
}

function getVehicleDriverIqama(vehicle: Vehicle) {
  return vehicle.driver_iqama || vehicle.assigned_driver_iqama || "";
}

function getStatusLabel(status: IncidentStatus, tx: any) {
  const label: Record<IncidentStatus, string> = {
    draft: tx.draft,
    pending_signature: tx.pending,
    signed: tx.signed,
    deducted: tx.deducted,
    cancelled: tx.cancelled,
  };

  return label[status] || status;
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold text-[#0f2544]">{label}</span>
      {children}
    </label>
  );
}

function PrintItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 min-h-6 font-extrabold text-[#0f2544]">{value || "-"}</p>
    </div>
  );
}

function StatCard({ icon, title, value, note, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}>
          <div className="h-7 w-7">{icon}</div>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-2 text-4xl font-extrabold text-[#0f2544]">{value}</h3>
          <p className="mt-1 text-sm text-slate-500">{note}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, tx }: { status: IncidentStatus; tx: any }) {
  const cls: Record<IncidentStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    pending_signature: "bg-orange-50 text-orange-600",
    signed: "bg-blue-50 text-blue-700",
    deducted: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-600",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls[status]}`}>
      {getStatusLabel(status, tx)}
    </span>
  );
}

