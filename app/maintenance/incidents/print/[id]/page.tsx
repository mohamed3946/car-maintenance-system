"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import {
  Car,
  FileText,
  Fingerprint,
  PenLine,
  User,
  Wrench,
} from "lucide-react";

type Incident = {
  id: string;
  vehicle_id: string | null;
  vehicle_plate: string;
  vehicle_type: string;
  driver_name: string;
  driver_iqama: string;
  driver_phone?: string;
  incident_type: string;
  incident_date: string;
  repair_invoice_no: string;
  workshop_name: string;
  description: string;
  repair_amount: number;
  deduction_method: string;
  installment_count: number;
  notes?: string | null;
};

type Vehicle = {
  id: string;
  serial_number: string | null;
};

const incidentTypeText: Record<string, string> = {
  accident: "حادث",
  breakdown: "عطل",
  maintenance_damage: "تلف بسبب سوء استخدام",
  other: "أخرى",
};

const deductionText: Record<string, string> = {
  salary: "خصم من الراتب",
  cash: "سداد نقدي",
  installments: "خصم على أقساط",
};

export default function IncidentPrintPage() {
  const params = useParams();
  const id = params?.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      const { data: incidentData } = await supabase
        .from("vehicle_incidents")
        .select("*")
        .eq("id", id)
        .single();

      if (incidentData) {
        setIncident(incidentData as Incident);

        if (incidentData.vehicle_id) {
          const { data: vehicleData } = await supabase
            .from("vehicles")
            .select("id, serial_number")
            .eq("id", incidentData.vehicle_id)
            .single();

          if (vehicleData) {
            setVehicle(vehicleData as Vehicle);
          }
        }
      }
    }

    loadData();
  }, [id]);

  if (!incident) {
    return (
      <div className="p-10 text-center font-bold">
        جاري تحميل الإقرار...
      </div>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-200 p-3 text-[#082957] print:bg-white print:p-0"
    >
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .print-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-3 flex max-w-[210mm] justify-end">
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-[#082957] px-5 py-2 font-bold text-white"
        >
          طباعة / حفظ PDF
        </button>
      </div>

      <section className="print-page mx-auto h-[297mm] w-[210mm] overflow-hidden border border-[#082957] bg-white px-[6mm] pt-[4mm] shadow-xl">
        <header className="relative h-[40mm] border-b-[3px] border-[#082957]">
          <div className="absolute left-[4mm] top-[1mm] flex h-[30mm] w-[30mm] items-center justify-center rounded-[4mm] border-2 border-[#082957] p-[2mm]">
            <img
              src="/logo.png"
              alt="logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="text-center">
            <h1 className="text-[30px] font-black leading-tight">
              مؤسسة نمو التوصيل
            </h1>

            <p className="mt-[1mm] text-[18px] font-extrabold">
              للخدمات اللوجستية
            </p>

            <p className="mt-[1mm] text-[15px] font-bold">
              Nemo Al Toseil for logistics
            </p>

            <p className="mt-[1mm] text-[15px] font-bold">
              الرقم الموحد : 7037559247
            </p>
          </div>

          <div className="absolute bottom-[-3mm] left-0 right-0 flex items-center justify-center">
            <span className="h-[4mm] w-[4mm] rounded-full bg-[#082957]" />
          </div>
        </header>

        <section className="mt-[5mm] grid grid-cols-[50mm_1fr] gap-[4mm]">
          <AmountBox amount={incident.repair_amount} />

          <div>
            <div className="rounded-[3mm] bg-gradient-to-l from-[#06244a] to-[#0b4a78] px-[5mm] py-[4mm] text-center text-white">
              <div className="flex items-center justify-center gap-[4mm]">
                <FileText className="h-7 w-7" />

                <div>
                  <h2 className="text-[22px] font-extrabold">
                    إقرار تحميل تكلفة إصلاح مركبة
                  </h2>

                  <p className="mt-[1mm] text-[13px]">
                    إقرار وتحميل تكلفة إصلاح مركبة
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-[3mm] rounded-[3mm] border border-slate-300 bg-white px-[4mm] py-[3mm] text-center text-[13px] leading-6 shadow-sm">
              أقر أنا الموقع أدناه بتحملي تكلفة إصلاح المركبة الموضحة
              بياناتها أدناه، وذلك نتيجة حادث أو عطل وقع بتاريخ الموضح
              أدناه، وأتعهد بسداد كافة التكاليف وفق نظام الشركة وسياساتها
              المعمول بها.
            </p>
          </div>
        </section>

        <section className="mt-[4mm] grid grid-cols-2 gap-[4mm]">
          <Box title="بيانات المركبة" icon={<Car className="h-6 w-6" />}>
            <div className="grid grid-cols-[26mm_1fr] gap-[3mm]">
              <div className="flex items-center justify-center rounded-[3mm] border border-slate-200 bg-slate-50">
                <Car className="h-14 w-14 text-blue-300" />
              </div>

              <div className="space-y-[1.5mm]">
                <InfoRow label="نوع المركبة" value={incident.vehicle_type} />
                <InfoRow label="رقم اللوحة" value={incident.vehicle_plate} />
                <InfoRow
                  label="الرقم التسلسلي"
                  value={vehicle?.serial_number || "-"}
                />
              </div>
            </div>
          </Box>

          <Box title="بيانات السائق" icon={<User className="h-6 w-6" />}>
            <div className="space-y-[1.5mm]">
              <InfoRow label="اسم السائق" value={incident.driver_name} />
              <InfoRow label="رقم الإقامة" value={incident.driver_iqama} />
              <InfoRow label="رقم الجوال" value={incident.driver_phone || "-"} />
 
            </div>
          </Box>
        </section>

        <section className="mt-[4mm] rounded-[3mm] border border-slate-300 bg-white p-[3mm] shadow-sm">
          <div className="mb-[2mm] flex items-center justify-end gap-[2mm] text-[20px] font-extrabold">
            <span>تفاصيل الحادث أو العطل</span>
            <Wrench className="h-6 w-6" />
          </div>

          <div className="grid grid-cols-2 gap-[1.5mm]">
            <InfoRow label="تاريخ الحالة" value={incident.incident_date} />
            <InfoRow
              label="نوع الحالة"
              value={incidentTypeText[incident.incident_type] || incident.incident_type}
            />
            <InfoRow label="رقم فاتورة الإصلاح" value={incident.repair_invoice_no || "-"} />
            <InfoRow label="مركز / ورشة الإصلاح" value={incident.workshop_name || "-"} />
            <InfoRow
              label="طريقة الخصم"
              value={deductionText[incident.deduction_method] || incident.deduction_method}
            />
            <InfoRow label="عدد الأقساط" value={String(incident.installment_count || 1)} />
          </div>
        </section>

        <section className="mt-[3mm] rounded-[3mm] border border-slate-300 bg-white p-[3mm] shadow-sm">
          <h3 className="mb-[2mm] text-right text-[18px] font-extrabold">
            تفاصيل إضافية أو ملاحظات
          </h3>

          <p className="min-h-[10mm] text-right text-[13px] leading-6 text-slate-700">
            {incident.description || incident.notes || "لا يوجد"}
          </p>
        </section>

        <section className="mt-[3mm] grid origin-top grid-cols-3 gap-[3mm] scale-[0.94]">
          <SignatureBox title="توقيع السائق" type="driver" />
          <FingerprintBox />
          <SignatureBox title="توقيع المسؤول" type="manager" />
        </section>
      </section>
    </main>
  );
}

function AmountBox({ amount }: { amount: number }) {
  return (
    <div className="flex min-h-[36mm] flex-col items-center justify-center rounded-[3mm] border border-slate-300 bg-white p-[3mm] text-center shadow-sm">
      <p className="text-[13px] font-bold">قيمة الإصلاح الإجمالية</p>
      <p className="mt-[2mm] text-[34px] font-black leading-none">SAR</p>
      <p className="mt-[1mm] text-[38px] font-black leading-none">
        {Number(amount || 0).toLocaleString("en-US")}
      </p>
      <p className="mt-[1mm] text-[12px] font-bold">ريال سعودي</p>
    </div>
  );
}

function Box({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[3mm] border border-slate-300 bg-white p-[3mm] shadow-sm">
      <div className="mb-[3mm] flex items-center justify-end gap-[2mm] text-[20px] font-extrabold">
        <span>{title}</span>
        {icon}
      </div>

      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid grid-cols-[30mm_1fr] overflow-hidden rounded-[2mm] border border-slate-300 bg-white text-[13px]">
      <div className="bg-slate-100 px-[3mm] py-[2mm] text-right font-extrabold">
        {label}
      </div>

      <div className="bg-slate-50 px-[3mm] py-[2mm] text-center font-bold">
        {value || "-"}
      </div>
    </div>
  );
}

function SignatureBox({
  title,
  type,
}: {
  title: string;
  type: "driver" | "manager";
}) {
  const fields =
    type === "manager"
      ? ["الاسم", "الوظيفة", "التوقيع", "التاريخ"]
      : ["الاسم", "التوقيع", "التاريخ"];

  return (
    <div className="rounded-[3mm] border border-slate-300 bg-white p-[3mm] shadow-sm">
      <div className="mb-[2mm] flex items-center justify-center gap-[2mm] text-[17px] font-extrabold">
        {type === "driver" ? (
          <PenLine className="h-5 w-5" />
        ) : (
          <User className="h-5 w-5" />
        )}

        {title}
      </div>

      <div className="space-y-[2mm] text-[13px] font-bold">
        {fields.map((field) => (
          <div key={field} className="flex items-center gap-[2mm]">
            <span className="w-[14mm]">{field}</span>
            <span className="flex-1 border-b-2 border-dotted border-[#082957]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FingerprintBox() {
  return (
    <div className="rounded-[3mm] border border-slate-300 bg-white p-[3mm] text-center shadow-sm">
      <div className="mb-[2mm] flex items-center justify-center gap-[2mm] text-[17px] font-extrabold">
        <Fingerprint className="h-5 w-5" />
        البصمة
      </div>

      <div className="mx-auto flex h-[24mm] items-center justify-center rounded-[3mm] border-2 border-blue-300 bg-white text-[13px] font-bold text-slate-500">
        ضع بصمتك هنا
      </div>
    </div>
  );
}