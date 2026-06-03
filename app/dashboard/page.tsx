"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout, { useLanguage } from "../../components/AppLayout";
import { supabase } from "@/app/lib/supabase";
import {
  AlertTriangle,
  Ban,
  Car,
  CheckCircle,
  Droplets,
  FileText,
  Plus,
  Truck,
  Wrench,
} from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#2563eb", "#22c55e", "#f97316", "#8b5cf6"];

type DashboardStats = {
  totalVehicles: number;
  maintenanceThisMonth: number;
  oilChangesThisMonth: number;
  accidentsThisMonth: number;
  openAccidents: number;
  closedAccidents: number;
  stoppedVehicles: number;
};

type VehicleRow = {
  id: string;
  vehicle_type: string | null;
  plate_number: string | null;
  vehicle_status: string | null;
  insurance_expiry: string | null;
};

type IncidentRow = {
  id: string;
  vehicle_plate: string | null;
  repair_amount: number | null;
  status: string | null;
  incident_date: string | null;
  created_at: string | null;
  incident_type: string | null;
};

type MaintenanceRow = {
  id: string;
  vehicle_plate?: string | null;
  maintenance_date?: string | null;
  service_date?: string | null;
  date?: string | null;
  created_at?: string | null;
  maintenance_type?: string | null;
  cost?: number | null;
};

type OilChangeRow = {
  id: string;
  vehicle_plate?: string | null;
  oil_change_date?: string | null;
  change_date?: string | null;
  service_date?: string | null;
  date?: string | null;
  created_at?: string | null;
  cost?: number | null;
};

export default function DashboardPage() {
  return (
    <AppLayout titleKey="dashboard" subtitleKey="overview">
      <DashboardContent />
    </AppLayout>
  );
}

function DashboardContent() {
  const { lang, t } = useLanguage();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    maintenanceThisMonth: 0,
    oilChangesThisMonth: 0,
    accidentsThisMonth: 0,
    openAccidents: 0,
    closedAccidents: 0,
    stoppedVehicles: 0,
  });

  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [maintenanceRows, setMaintenanceRows] = useState<MaintenanceRow[]>([]);
  const [oilRows, setOilRows] = useState<OilChangeRow[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const [vehiclesRes, incidentsRes, maintenanceRes, oilRes] = await Promise.all([
      supabase
        .from("vehicles")
        .select("id, vehicle_type, plate_number, vehicle_status, insurance_expiry"),

      supabase
        .from("vehicle_incidents")
        .select("id, vehicle_plate, repair_amount, status, incident_date, created_at, incident_type"),

      supabase
        .from("maintenance_records")
        .select("*"),

      supabase
        .from("oil_changes")
        .select("*"),
    ]);

    const vehiclesData = !vehiclesRes.error ? vehiclesRes.data || [] : [];
    const incidentsData = !incidentsRes.error ? incidentsRes.data || [] : [];
    const maintenanceData = !maintenanceRes.error ? maintenanceRes.data || [] : [];
    const oilData = !oilRes.error ? oilRes.data || [] : [];

    if (vehiclesRes.error) console.warn("vehicles table error:", vehiclesRes.error.message);
    if (incidentsRes.error) console.warn("vehicle_incidents table error:", incidentsRes.error.message);
    if (maintenanceRes.error) console.warn("maintenance_records table error:", maintenanceRes.error.message);
    if (oilRes.error) console.warn("oil_changes table error:", oilRes.error.message);

    setVehicles(vehiclesData as VehicleRow[]);
    setIncidents(incidentsData as IncidentRow[]);
    setMaintenanceRows(maintenanceData as MaintenanceRow[]);
    setOilRows(oilData as OilChangeRow[]);

    const incidentsThisMonth = incidentsData.filter((row: IncidentRow) => {
      const date = row.incident_date || row.created_at;
      return isDateBetween(date, monthStart, monthEnd);
    });

    const maintenanceThisMonth = maintenanceData.filter((row: any) => {
      const date =
        row.maintenance_date ||
        row.service_date ||
        row.date ||
        row.created_at;

      return isDateBetween(date, monthStart, monthEnd);
    });

    const oilThisMonth = oilData.filter((row: any) => {
      const date =
        row.oil_change_date ||
        row.change_date ||
        row.service_date ||
        row.date ||
        row.created_at;

      return isDateBetween(date, monthStart, monthEnd);
    });

    const openIncidents = incidentsData.filter((row: IncidentRow) => {
      const status = String(row.status || "").toLowerCase();
      return !["signed", "deducted", "cancelled", "canceled", "closed", "مغلق", "ملغي"].includes(status);
    });

    const closedIncidents = incidentsData.filter((row: IncidentRow) => {
      const status = String(row.status || "").toLowerCase();
      return ["signed", "deducted", "closed", "مغلق"].includes(status);
    });

    const stopped = vehiclesData.filter((row: VehicleRow) => {
      return row.vehicle_status === "متوقف" || row.vehicle_status === "Stopped";
    });

    setStats({
      totalVehicles: vehiclesData.length,
      maintenanceThisMonth: maintenanceThisMonth.length,
      oilChangesThisMonth: oilThisMonth.length,
      accidentsThisMonth: incidentsThisMonth.length,
      openAccidents: openIncidents.length,
      closedAccidents: closedIncidents.length,
      stoppedVehicles: stopped.length,
    });

    setLoading(false);
  }

  const maintenanceChartData = useMemo(() => {
    return getLastSixMonths(lang).map((month) => {
      const count = maintenanceRows.filter((row) => {
        const date =
          row.maintenance_date ||
          row.service_date ||
          row.date ||
          row.created_at;

        return isSameMonth(date, month.year, month.monthIndex);
      }).length;

      return { name: month.name, value: count };
    });
  }, [maintenanceRows, lang]);

  const expenseData = useMemo(() => {
    const maintenanceCost = maintenanceRows.reduce((sum, row) => sum + Number(row.cost || 0), 0);
    const oilCost = oilRows.reduce((sum, row) => sum + Number(row.cost || 0), 0);

    return lang === "ar"
      ? [
          { name: "الصيانات", value: maintenanceCost },
          { name: "تغييرات الزيت", value: oilCost },
          { name: "أخرى", value: 0 },
        ]
      : [
          { name: "Maintenance", value: maintenanceCost },
          { name: "Oil Changes", value: oilCost },
          { name: "Other", value: 0 },
        ];
  }, [maintenanceRows, oilRows, lang]);

  const vehicleData = useMemo(() => {
    const cars = vehicles.filter((v) => v.vehicle_type === "car").length;
    const bikes = vehicles.filter((v) => v.vehicle_type === "bike").length;
    const others = Math.max(vehicles.length - cars - bikes, 0);

    return lang === "ar"
      ? [
          { name: "سيارات", value: cars },
          { name: "دراجات نارية", value: bikes },
          { name: "أخرى", value: others },
        ]
      : [
          { name: "Cars", value: cars },
          { name: "Motorcycles", value: bikes },
          { name: "Other", value: others },
        ];
  }, [vehicles, lang]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-3">
  <Link
    href="/systems"
    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
  >
    ← {lang === "ar" ? "الرجوع لاختيار الأنظمة" : "Back To Systems"}
  </Link>

  <div>
    <h1 className="text-3xl font-extrabold">👋 {t.welcome}</h1>
    <p className="mt-1 text-sm text-slate-500">{t.overview}</p>
  </div>
</div>

        {loading && (
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {lang === "ar" ? "جاري تحديث البيانات..." : "Updating data..."}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={<Truck />} title={t.totalVehicles} value={stats.totalVehicles} note={lang === "ar" ? "كل المركبات" : "All Vehicles"} color="blue" />
        <StatCard icon={<Wrench />} title={t.maintenanceThisMonth} value={stats.maintenanceThisMonth} note={lang === "ar" ? "من جدول الصيانات" : "From Maintenance Records"} color="green" />
        <StatCard icon={<Droplets />} title={t.oilChangesThisMonth} value={stats.oilChangesThisMonth} note={lang === "ar" ? "من جدول تغيير الزيت" : "From Oil Changes"} color="orange" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Car />} title={t.accidentsThisMonth} value={stats.accidentsThisMonth} note={lang === "ar" ? "حادث" : "Accident"} color="red" />
        <StatCard icon={<AlertTriangle />} title={t.openAccidents} value={stats.openAccidents} note={lang === "ar" ? "بانتظار توقيع" : "Open"} color="orange" />
        <StatCard icon={<CheckCircle />} title={t.closedAccidents} value={stats.closedAccidents} note={lang === "ar" ? "مغلق" : "Closed"} color="green" />
        <StatCard icon={<Ban />} title={t.stoppedVehicles} value={stats.stoppedVehicles} note={lang === "ar" ? "مركبة" : "Vehicle"} color="orange" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <MaintenanceChart title={lang === "ar" ? "الصيانات خلال آخر 6 أشهر" : "Maintenance During Last 6 Months"} data={maintenanceChartData} />
        <UpcomingMaintenance lang={lang} rows={maintenanceRows} oilRows={oilRows} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <QuickActions />
        <PieBox title={t.vehiclesDistribution} data={vehicleData} />
        <ExpenseBox title={t.monthlyExpenses} data={expenseData} lang={lang} />
      </div>

      <footer className="mt-8 text-center text-sm text-slate-400">
        {t.appName} - {t.appSection}، {lang === "ar" ? "جميع الحقوق محفوظة" : "All Rights Reserved"}
      </footer>
    </>
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

function MaintenanceChart({ title, data }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function UpcomingMaintenance({
  lang,
  rows,
  oilRows,
}: {
  lang: "ar" | "en";
  rows: MaintenanceRow[];
  oilRows: OilChangeRow[];
}) {
  const maintenanceRows = rows.slice(0, 2).map((row) => [
    row.vehicle_plate || "-",
    row.maintenance_type || (lang === "ar" ? "صيانة" : "Maintenance"),
    row.maintenance_date || row.service_date || row.date || row.created_at?.slice(0, 10) || "-",
    lang === "ar" ? "مسجلة" : "Saved",
  ]);

  const oilChangeRows = oilRows.slice(0, 2).map((row) => [
    row.vehicle_plate || "-",
    lang === "ar" ? "تغيير زيت" : "Oil Change",
    row.oil_change_date || row.change_date || row.service_date || row.date || row.created_at?.slice(0, 10) || "-",
    lang === "ar" ? "مسجلة" : "Saved",
  ]);

  const displayRows = [...maintenanceRows, ...oilChangeRows];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold">
        {lang === "ar" ? "آخر سجلات الصيانة وتغيير الزيت" : "Latest Maintenance & Oil Records"}
      </h3>

      {displayRows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 p-10 text-center font-bold text-slate-400">
          {lang === "ar" ? "لا توجد بيانات صيانة بعد" : "No maintenance data yet"}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-3 text-right">{lang === "ar" ? "المركبة" : "Vehicle"}</th>
              <th className="py-3 text-right">{lang === "ar" ? "النوع" : "Type"}</th>
              <th className="py-3 text-right">{lang === "ar" ? "التاريخ" : "Date"}</th>
              <th className="py-3 text-right">{lang === "ar" ? "الحالة" : "Status"}</th>
            </tr>
          </thead>

          <tbody>
            {displayRows.map((row) => (
              <tr key={row.join("-")} className="border-b last:border-0">
                {row.map((cell, index) => (
                  <td key={index} className="py-3">
                    {index === 3 ? (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function QuickActions() {
  const { lang, t } = useLanguage();

  const actions = [
    {
      title: t.addVehicle,
      icon: <Truck key="car" />,
      href: "/cars/add",
      color: "from-blue-50 to-blue-100 text-blue-700",
    },

    {
      title: t.addMaintenance,
      icon: <Wrench key="wrench" />,
      href: "/maintenance/add",
      color: "from-green-50 to-green-100 text-green-700",
    },

    {
      title: t.addOilChange,
      icon: <Droplets key="oil" />,
      href: "/oil-changes/add",
      color: "from-orange-50 to-orange-100 text-orange-700",
    },

    {
      title: t.recordAccident,
      icon: <Car key="accident" />,
      href: "/maintenance/incidents",
      color: "from-red-50 to-red-100 text-red-700",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-xl font-extrabold text-[#0f2544]">
        {lang === "ar" ? "أزرار سريعة" : "Quick Actions"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <a
            key={String(action.title)}
            href={action.href}
            className={`group flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-br ${action.color} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <span className="h-5 w-5">{action.icon}</span>
              </span>

              <span className="text-sm font-extrabold">
                {action.title}
              </span>
            </div>

            <span className="text-2xl opacity-30 transition-all duration-300 group-hover:translate-x-[-4px] group-hover:opacity-100">
              ←
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
function PieBox({ title, data }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
              {data.map((_: any, index: number) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ExpenseBox({ title, data, lang }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>

      <div className="flex items-center gap-5">
        <div className="h-56 w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                {data.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3 text-sm">
          {data.map((item: any) => (
            <div key={item.name} className="flex justify-between">
              <span>{item.name}</span>
              <span className="font-bold">
                {Number(item.value || 0).toLocaleString("en-US")} {lang === "ar" ? "ريال" : "SAR"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function isDateBetween(dateValue: string | null | undefined, start: string, end: string) {
  if (!dateValue) return false;

  const date = new Date(dateValue).getTime();
  return date >= new Date(start).getTime() && date < new Date(end).getTime();
}

function isSameMonth(dateValue: string | null | undefined, year: number, monthIndex: number) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  return date.getFullYear() === year && date.getMonth() === monthIndex;
}

function getLastSixMonths(lang: "ar" | "en") {
  const arMonths = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    months.push({
      name: lang === "ar" ? arMonths[date.getMonth()] : enMonths[date.getMonth()],
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
    });
  }

  return months;
}