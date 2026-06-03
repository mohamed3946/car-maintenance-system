"use client";

import { useMemo, useState } from "react";
import AppLayout, { useLanguage } from "../../../components/AppLayout";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileUp,
  Filter,
  Medal,
  Users,
  Wallet,
  MapPinned,
  Route,
} from "lucide-react";

type Platform = "keeta" | "hunger";

const hungerRows = [
  {
    id: 4599496,
    name: "Ahmed Mohamed",
    batchNumber: 1,
    completedDeliveries: 456,
    attendanceRate: 96,
    acceptanceRate: 94,
    contactRate: 98,
    noShowPercent: 2,
    workingHours: 72,
    totalKm: 2420,
    payableKm: 1980,
    avgKm: 5.3,
  },
  {
    id: 4599480,
    name: "Mohamed Ali",
    batchNumber: 2,
    completedDeliveries: 398,
    attendanceRate: 95,
    acceptanceRate: 92,
    contactRate: 97,
    noShowPercent: 3,
    workingHours: 65,
    totalKm: 2100,
    payableKm: 1735,
    avgKm: 5.2,
  },
  {
    id: 4599462,
    name: "Saeed Al-Shahrani",
    batchNumber: 3,
    completedDeliveries: 356,
    attendanceRate: 93,
    acceptanceRate: 88,
    contactRate: 96,
    noShowPercent: 4,
    workingHours: 60,
    totalKm: 1985,
    payableKm: 1550,
    avgKm: 5.6,
  },
  {
    id: 4552582,
    name: "Nasser Al-Mutairi",
    batchNumber: 6,
    completedDeliveries: 58,
    attendanceRate: 70,
    acceptanceRate: 65,
    contactRate: 82,
    noShowPercent: 22,
    workingHours: 35,
    totalKm: 620,
    payableKm: 410,
    avgKm: 10.7,
  },
];

const keetaRows = [
  {
    id: 101,
    name: "Ahmed Mohamed",
    orders: 420,
    validDays: 26,
    onTime: 99,
    acceptance: 96,
    status: "valid",
  },
  {
    id: 102,
    name: "Mohamed Ali",
    orders: 350,
    validDays: 26,
    onTime: 97,
    acceptance: 94,
    status: "valid",
  },
  {
    id: 103,
    name: "Nasser Al-Mutairi",
    orders: 120,
    validDays: 14,
    onTime: 72,
    acceptance: 70,
    status: "invalid",
  },
];

function batchToLevel(batch: number) {
  const map: Record<number, string> = {
    1: "A",
    2: "B",
    3: "C",
    4: "D",
    5: "E",
    6: "F",
  };

  return map[batch] || "-";
}

function qualityBonusByBatch(batch: number) {
  const map: Record<number, number> = {
    1: 2.75,
    2: 2.25,
    3: 1.75,
    4: 1.25,
    5: 0.75,
    6: 0,
  };

  return map[batch] ?? 0;
}

export default function PerformancePage() {
  return (
    <AppLayout system="employees">
      <PerformanceContent />
    </AppLayout>
  );
}

function PerformanceContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [platform, setPlatform] = useState<Platform>("hunger");

  const text = {
    title: isAr ? "متابعة الأداء" : "Performance Tracking",
    subtitle: isAr
      ? "متابعة أداء المناديب وتحليل التقارير والحوافز"
      : "Track courier performance, reports, and incentives",

    export: isAr ? "تصدير التقرير" : "Export Report",
    month: isAr ? "مايو 2026" : "May 2026",
    allCities: isAr ? "كل المدن" : "All Cities",

    choosePlatform: isAr ? "اختر التطبيق" : "Choose Platform",
    keetaDesc: isAr ? "تقرير أداء كيتا" : "Keeta performance report",
    hungerDesc: isAr ? "تقرير أداء هنجرستيشن" : "HungerStation performance report",

    uploadPerformance: isAr ? "رفع تقرير الأداء" : "Upload Performance Report",
    uploadDistance: isAr ? "رفع تقرير الكيلومترات" : "Upload Distance Report",
    uploadHint: isAr ? "ارفع ملف CSV أو Excel" : "Upload CSV or Excel file",
    chooseFile: isAr ? "اختر ملف" : "Choose File",

    totalRiders: isAr ? "إجمالي المناديب" : "Total Riders",
    totalDeliveries: isAr ? "إجمالي الطلبات" : "Total Deliveries",
    avgAttendance: isAr ? "متوسط الحضور" : "Average Attendance",
    avgAcceptance: isAr ? "متوسط القبول" : "Average Acceptance",
    totalHours: isAr ? "إجمالي ساعات العمل" : "Total Working Hours",
    qualityBonus: isAr ? "إجمالي مكافأة الجودة" : "Total Quality Bonus",

    totalKm: isAr ? "إجمالي الكيلومترات" : "Total KM",
    payableKm: isAr ? "الكيلومترات المستحقة" : "Payable KM",
    avgKm: isAr ? "متوسط كم / طلب" : "Avg KM / Order",

    hungerSummary: isAr
      ? "ملخص الأداء العام - هنجرستيشن"
      : "General Performance Summary - HungerStation",

    keetaSummary: isAr
      ? "ملخص الأداء العام - كيتا"
      : "General Performance Summary - Keeta",

    levelDistribution: isAr ? "توزيع المستويات" : "Level Distribution",
    bonusTable: isAr ? "مكافأة الجودة حسب المستوى" : "Quality Bonus By Level",
    topRiders: isAr ? "أفضل المناديب" : "Top Riders",
    weakRiders: isAr ? "أضعف المناديب" : "Weak Riders",
    riderDetails: isAr ? "تفاصيل أداء المناديب" : "Riders Performance Details",

    rider: isAr ? "المندوب" : "Rider",
    batchNumber: "Batch Number",
    level: isAr ? "المستوى" : "Level",
    deliveries: isAr ? "الطلبات" : "Deliveries",
    attendance: isAr ? "الحضور" : "Attendance",
    acceptance: isAr ? "القبول" : "Acceptance",
    contact: isAr ? "التواصل" : "Contact",
    noShow: "No Show",
    hours: isAr ? "الساعات" : "Hours",
    bonus: isAr ? "المكافأة" : "Bonus",

    validDays: isAr ? "الأيام الصالحة" : "Valid Days",
    onTime: isAr ? "التسليم في الوقت" : "On Time",
    status: isAr ? "الحالة" : "Status",
    valid: isAr ? "صالح" : "Valid",
    invalid: isAr ? "غير صالح" : "Invalid",
  };

  const hungerStats = useMemo(() => {
    const totalRiders = hungerRows.length;
    const totalDeliveries = hungerRows.reduce((sum, r) => sum + r.completedDeliveries, 0);
    const avgAttendance = Math.round(hungerRows.reduce((sum, r) => sum + r.attendanceRate, 0) / totalRiders);
    const avgAcceptance = Math.round(hungerRows.reduce((sum, r) => sum + r.acceptanceRate, 0) / totalRiders);
    const totalHours = hungerRows.reduce((sum, r) => sum + r.workingHours, 0);
    const totalKm = hungerRows.reduce((sum, r) => sum + r.totalKm, 0);
    const payableKm = hungerRows.reduce((sum, r) => sum + r.payableKm, 0);
    const avgKm = totalDeliveries > 0 ? totalKm / totalDeliveries : 0;
    const totalBonus = hungerRows.reduce(
      (sum, r) => sum + r.completedDeliveries * qualityBonusByBatch(r.batchNumber),
      0
    );

    return {
      totalRiders,
      totalDeliveries,
      avgAttendance,
      avgAcceptance,
      totalHours,
      totalBonus,
      totalKm,
      payableKm,
      avgKm,
    };
  }, []);

  const keetaStats = useMemo(() => {
    const totalRiders = keetaRows.length;
    const totalOrders = keetaRows.reduce((sum, r) => sum + r.orders, 0);
    const valid = keetaRows.filter((r) => r.status === "valid").length;
    const invalid = totalRiders - valid;
    const avgOnTime = Math.round(keetaRows.reduce((sum, r) => sum + r.onTime, 0) / totalRiders);
    const avgAcceptance = Math.round(keetaRows.reduce((sum, r) => sum + r.acceptance, 0) / totalRiders);

    return { totalRiders, totalOrders, valid, invalid, avgOnTime, avgAcceptance };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f2544]">{text.title}</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">{text.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 shadow-sm">
            <Download className="h-5 w-5" />
            {text.export}
          </button>

          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm">
            <CalendarDays className="h-5 w-5" />
            {text.month}
          </button>

          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm">
            <Filter className="h-5 w-5" />
            {text.allCities}
          </button>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-black text-[#0f2544]">{text.choosePlatform}</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <PlatformCard
            active={platform === "keeta"}
            title="Keeta"
            desc={text.keetaDesc}
            logo="keeta"
            onClick={() => setPlatform("keeta")}
          />

          <PlatformCard
            active={platform === "hunger"}
            title="HungerStation"
            desc={text.hungerDesc}
            logo="hunger"
            onClick={() => setPlatform("hunger")}
          />
        </div>
      </section>

      {platform === "hunger" ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-black text-[#0f2544]">{text.hungerSummary}</h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Kpi title={text.totalRiders} value={String(hungerStats.totalRiders)} icon={<Users />} />
              <Kpi title={text.totalDeliveries} value={hungerStats.totalDeliveries.toLocaleString()} icon={<BarChart3 />} />
              <Kpi title={text.avgAttendance} value={`${hungerStats.avgAttendance}%`} icon={<CheckCircle2 />} />
              <Kpi title={text.avgAcceptance} value={`${hungerStats.avgAcceptance}%`} icon={<Medal />} />
              <Kpi title={text.totalHours} value={String(hungerStats.totalHours)} icon={<Clock />} />
              <Kpi title={text.totalKm} value={hungerStats.totalKm.toLocaleString()} icon={<Route />} />
              <Kpi title={text.payableKm} value={hungerStats.payableKm.toLocaleString()} icon={<MapPinned />} />
              <Kpi title={text.qualityBonus} value={`${hungerStats.totalBonus.toFixed(0)} SAR`} icon={<Wallet />} />
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-4">
            <UploadCard title={text.uploadPerformance} hint={text.uploadHint} button={text.chooseFile} />
            <UploadCard title={text.uploadDistance} hint={text.uploadHint} button={text.chooseFile} />
            <Card title={text.bonusTable}>
              <LevelBonusTable />
            </Card>
            <Card title={text.levelDistribution}>
              <LevelDistribution isAr={isAr} />
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card title={text.topRiders}>
              <HungerMiniTable rows={hungerRows.slice(0, 3)} />
            </Card>

            <Card title={text.weakRiders} danger>
              <HungerMiniTable rows={[...hungerRows].sort((a, b) => b.noShowPercent - a.noShowPercent).slice(0, 3)} />
            </Card>
          </div>

          <Card title={text.riderDetails}>
            <HungerDetailsTable rows={hungerRows} text={text} />
          </Card>
        </>
      ) : (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-black text-[#0f2544]">{text.keetaSummary}</h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <Kpi title={text.totalRiders} value={String(keetaStats.totalRiders)} icon={<Users />} />
              <Kpi title={text.totalDeliveries} value={String(keetaStats.totalOrders)} icon={<BarChart3 />} />
              <Kpi title={text.valid} value={String(keetaStats.valid)} icon={<CheckCircle2 />} />
              <Kpi title={text.invalid} value={String(keetaStats.invalid)} icon={<AlertTriangle />} />
              <Kpi title={text.onTime} value={`${keetaStats.avgOnTime}%`} icon={<Clock />} />
              <Kpi title={text.acceptance} value={`${keetaStats.avgAcceptance}%`} icon={<Medal />} />
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-3">
            <UploadCard title={text.uploadPerformance} hint={text.uploadHint} button={text.chooseFile} />
            <Card title={text.topRiders}>
              <KeetaMiniTable rows={keetaRows.filter((r) => r.status === "valid")} text={text} />
            </Card>
            <Card title={text.weakRiders} danger>
              <KeetaMiniTable rows={keetaRows.filter((r) => r.status === "invalid")} text={text} />
            </Card>
          </div>

          <Card title={text.riderDetails}>
            <KeetaDetailsTable rows={keetaRows} text={text} />
          </Card>
        </>
      )}
    </div>
  );
}

function PlatformCard({ active, title, desc, logo, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-3xl border p-5 text-start transition ${
        active
          ? "border-blue-600 bg-blue-50/50 shadow-sm"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div>
        <h3 className="text-2xl font-black text-[#0f2544]">{title}</h3>
        <p className="mt-2 text-sm font-bold text-slate-500">{desc}</p>
      </div>

      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-black">
        {logo === "keeta" ? "keeta" : "H"}
      </div>
    </button>
  );
}

function Kpi({ title, value, icon }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        {icon}
      </div>
      <p className="text-sm font-extrabold text-slate-500">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-[#0f2544]">{value}</h3>
    </div>
  );
}

function Card({ title, children, danger }: any) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className={`mb-5 text-xl font-black ${danger ? "text-red-600" : "text-[#0f2544]"}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function UploadCard({ title, hint, button }: any) {
  return (
    <section className="rounded-3xl border border-dashed border-blue-300 bg-blue-50/20 p-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
        <FileUp className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-black text-[#0f2544]">{title}</h3>
      <p className="mt-2 text-sm font-bold text-slate-500">{hint}</p>
      <button className="mt-5 rounded-2xl bg-blue-600 px-8 py-3 text-sm font-black text-white">
        {button}
      </button>
    </section>
  );
}

function LevelBonusTable() {
  const rows = [
    ["A", "2.75"],
    ["B", "2.25"],
    ["C", "1.75"],
    ["D", "1.25"],
    ["E", "0.75"],
    ["F", "0.00"],
  ];

  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([level, bonus]) => (
          <tr key={level} className="border-b border-slate-100">
            <td className="p-3 font-black">{level}</td>
            <td className="p-3 font-bold text-green-600">{bonus} SAR</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LevelDistribution({ isAr }: { isAr: boolean }) {
  const rows = [
    ["A", 1],
    ["B", 1],
    ["C", 1],
    ["D", 0],
    ["E", 0],
    ["F", 1],
  ];

  return (
    <div className="space-y-3">
      {rows.map(([level, count]) => (
        <div key={level} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
          <span className="font-black">{level}</span>
          <span className="font-bold text-slate-600">
            {count} {isAr ? "مندوب" : "Rider"}
          </span>
        </div>
      ))}
    </div>
  );
}

function HungerMiniTable({ rows }: any) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r: any) => (
          <tr key={r.id} className="border-b border-slate-100">
            <td className="p-3 font-black">{r.name}</td>
            <td className="p-3 font-bold">{batchToLevel(r.batchNumber)}</td>
            <td className="p-3 font-bold">{r.avgKm} KM</td>
            <td className="p-3 font-bold text-green-600">
              {(r.completedDeliveries * qualityBonusByBatch(r.batchNumber)).toFixed(0)} SAR
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HungerDetailsTable({ rows, text }: any) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[1200px] text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-4 text-start">{text.rider}</th>
            <th className="p-4 text-start">{text.batchNumber}</th>
            <th className="p-4 text-start">{text.level}</th>
            <th className="p-4 text-start">{text.deliveries}</th>
            <th className="p-4 text-start">{text.attendance}</th>
            <th className="p-4 text-start">{text.acceptance}</th>
            <th className="p-4 text-start">{text.contact}</th>
            <th className="p-4 text-start">{text.noShow}</th>
            <th className="p-4 text-start">{text.hours}</th>
            <th className="p-4 text-start">{text.totalKm}</th>
            <th className="p-4 text-start">{text.payableKm}</th>
            <th className="p-4 text-start">{text.avgKm}</th>
            <th className="p-4 text-start">{text.bonus}</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="p-4 font-black">{r.name}</td>
              <td className="p-4 font-bold">{r.batchNumber}</td>
              <td className="p-4 font-bold">{batchToLevel(r.batchNumber)}</td>
              <td className="p-4 font-bold">{r.completedDeliveries}</td>
              <td className="p-4 font-bold">{r.attendanceRate}%</td>
              <td className="p-4 font-bold">{r.acceptanceRate}%</td>
              <td className="p-4 font-bold">{r.contactRate}%</td>
              <td className="p-4 font-bold text-red-600">{r.noShowPercent}%</td>
              <td className="p-4 font-bold">{r.workingHours}</td>
              <td className="p-4 font-bold">{r.totalKm}</td>
              <td className="p-4 font-bold">{r.payableKm}</td>
              <td className="p-4 font-bold">{r.avgKm}</td>
              <td className="p-4 font-bold text-green-600">
                {(r.completedDeliveries * qualityBonusByBatch(r.batchNumber)).toFixed(2)} SAR
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeetaMiniTable({ rows, text }: any) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r: any) => (
          <tr key={r.id} className="border-b border-slate-100">
            <td className="p-3 font-black">{r.name}</td>
            <td className="p-3 font-bold">{r.orders}</td>
            <td className="p-3 font-bold">{r.validDays}</td>
            <td className="p-3 font-bold">{r.status === "valid" ? text.valid : text.invalid}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KeetaDetailsTable({ rows, text }: any) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-4 text-start">{text.rider}</th>
            <th className="p-4 text-start">{text.deliveries}</th>
            <th className="p-4 text-start">{text.validDays}</th>
            <th className="p-4 text-start">{text.onTime}</th>
            <th className="p-4 text-start">{text.acceptance}</th>
            <th className="p-4 text-start">{text.status}</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="p-4 font-black">{r.name}</td>
              <td className="p-4 font-bold">{r.orders}</td>
              <td className="p-4 font-bold">{r.validDays}</td>
              <td className="p-4 font-bold">{r.onTime}%</td>
              <td className="p-4 font-bold">{r.acceptance}%</td>
              <td className="p-4 font-bold">
                {r.status === "valid" ? text.valid : text.invalid}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}