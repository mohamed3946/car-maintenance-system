"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";

type Employee = {
  id: string;
  name: string;
  iqama: string | null;
  hunger_id: string | null;
  keeta_id: string | null;
  work_location: string | null;
  job_title: string | null;
};

type RiderShift = {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  platform: string | null;
  zone: string | null;
  notes: string | null;
  status: "scheduled" | "active" | "completed" | "cancelled";
  actual_start_at: string | null;
  actual_end_at: string | null;
  created_at: string;
  employees?: Employee | null;
};

const PLATFORM_OPTIONS = [
  { value: "HungerStation", ar: "هنجرستيشن", en: "HungerStation" },
  { value: "Keeta", ar: "كيتا", en: "Keeta" },
];

const ZONE_OPTIONS = [
  "شمال الرياض",
  "وسط الرياض",
  "شرق الرياض",
  "غرب الرياض",
  "جنوب الرياض",
  "جدة",
  "مكة",
  "الدمام",
  "الخبر",
];

export default function RiderShiftsPage() {
  return (
    <AppLayout system="employees">
      <RiderShiftsContent />
    </AppLayout>
  );
}

function RiderShiftsContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<RiderShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(getSaudiDateKey());

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [shiftDate, setShiftDate] = useState(getSaudiDateKey());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("22:00");
  const [platform, setPlatform] = useState("HungerStation");
  const [zone, setZone] = useState("شمال الرياض");
  const [notes, setNotes] = useState("");

  async function loadData() {
    setLoading(true);

    try {
      const [{ data: employeeData, error: employeeError }, { data: shiftData, error: shiftError }] =
        await Promise.all([
          supabase
            .from("employees")
            .select("id,name,iqama,hunger_id,keeta_id,work_location,job_title")
            .eq("job_title", "deliveryCourier")
            .order("name", { ascending: true }),

          supabase
            .from("rider_shifts")
            .select(
              `
              id,
              employee_id,
              shift_date,
              start_time,
              end_time,
              platform,
              zone,
              notes,
              status,
              actual_start_at,
              actual_end_at,
              created_at,
              employees (
                id,
                name,
                iqama,
                hunger_id,
                keeta_id,
                work_location,
                job_title
              )
            `
            )
            .gte("shift_date", getMonthStart())
            .order("shift_date", { ascending: false })
            .order("start_time", { ascending: true }),
        ]);

      if (employeeError) throw employeeError;
      if (shiftError) throw shiftError;

      setEmployees((employeeData || []) as Employee[]);

      // Supabase can infer the joined "employees" relation as an array
      // even though each rider_shift belongs to one employee.
      // Normalize it here so the UI always receives one Employee object.
      const normalizedShifts: RiderShift[] = (shiftData || []).map(
        (row: any) => ({
          ...row,
          employees: Array.isArray(row.employees)
            ? row.employees[0] ?? null
            : row.employees ?? null,
        })
      );

      setShifts(normalizedShifts);
    } catch (error) {
      console.error("LOAD SHIFTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredShifts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return shifts.filter((shift) => {
      if (dateFilter && shift.shift_date !== dateFilter) return false;
      if (statusFilter !== "all" && shift.status !== statusFilter) return false;

      if (!q) return true;

      const employee = shift.employees;

      return (
        String(employee?.name || "").toLowerCase().includes(q) ||
        String(employee?.iqama || "").toLowerCase().includes(q) ||
        String(employee?.hunger_id || "").toLowerCase().includes(q) ||
        String(employee?.keeta_id || "").toLowerCase().includes(q)
      );
    });
  }, [shifts, search, statusFilter, dateFilter]);

  const todayShifts = shifts.filter((shift) => shift.shift_date === getSaudiDateKey());
  const scheduledCount = todayShifts.filter((shift) => shift.status === "scheduled").length;
  const activeCount = todayShifts.filter((shift) => shift.status === "active").length;
  const completedCount = todayShifts.filter((shift) => shift.status === "completed").length;
  const cancelledCount = todayShifts.filter((shift) => shift.status === "cancelled").length;

  async function createShift() {
    if (!selectedEmployeeId || !shiftDate || !startTime || !endTime) {
      alert(isAr ? "أكمل بيانات الشفت أولًا." : "Complete shift details first.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("rider_shifts")
        .upsert(
          {
            employee_id: selectedEmployeeId,
            shift_date: shiftDate,
            start_time: startTime,
            end_time: endTime,
            platform,
            zone,
            notes: notes.trim() || null,
            status: "scheduled",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "employee_id,shift_date",
          }
        );

      if (error) throw error;

      setModalOpen(false);
      setSelectedEmployeeId("");
      setNotes("");
      await loadData();
    } catch (error: any) {
      console.error("CREATE SHIFT ERROR:", error);
      alert(
        isAr
          ? `تعذر حفظ الشفت: ${error?.message || "خطأ غير معروف"}`
          : `Could not save shift: ${error?.message || "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  }

  async function cancelShift(id: string) {
    const ok = confirm(
      isAr
        ? "هل تريد إلغاء هذا الشفت؟"
        : "Do you want to cancel this shift?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("rider_shifts")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await loadData();
  }

  async function deleteShift(id: string) {
    const ok = confirm(
      isAr
        ? "حذف الشفت نهائيًا؟"
        : "Delete this shift permanently?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("rider_shifts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await loadData();
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-5 pb-10">
      <section className="overflow-hidden rounded-[28px] bg-[#0d2c4d] text-white shadow-[0_18px_50px_rgba(13,44,77,0.18)]">
        <div className="flex flex-col gap-5 px-5 py-6 md:px-7 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <CalendarDays className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-black md:text-3xl">
                {isAr ? "إدارة شفتات المناديب" : "Rider Shift Management"}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-300">
                {isAr
                  ? "إنشاء ومتابعة شفتات المناديب وربطها مباشرة بتطبيق المندوب."
                  : "Create and manage rider shifts directly from the operations dashboard."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShiftDate(dateFilter || getSaudiDateKey());
              setModalOpen(true);
            }}
            className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#0d2c4d] transition hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            {isAr ? "إضافة شفت" : "Add Shift"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label={isAr ? "شفتات اليوم" : "Today's Shifts"}
          value={todayShifts.length}
          tone="blue"
        />
        <StatCard
          label={isAr ? "مجدولة" : "Scheduled"}
          value={scheduledCount}
          tone="slate"
        />
        <StatCard
          label={isAr ? "شغالة الآن" : "Active"}
          value={activeCount}
          tone="green"
        />
        <StatCard
          label={isAr ? "مكتملة" : "Completed"}
          value={completedCount}
          tone="indigo"
        />
        <StatCard
          label={isAr ? "ملغاة" : "Cancelled"}
          value={cancelledCount}
          tone="red"
        />
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-base font-black text-[#102a4c]">
              {isAr ? "جدول الشفتات" : "Shift Schedule"}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {isAr
                ? "الشفت يظهر للمندوب في التطبيق فور حفظه."
                : "Saved shifts appear in the rider app immediately."}
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative min-w-[250px]">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isAr ? "right-3.5" : "left-3.5"
                }`}
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  isAr
                    ? "بحث بالاسم أو الإقامة أو ID..."
                    : "Search name, Iqama or ID..."
                }
                className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
                  isAr ? "pr-10 pl-3" : "pl-10 pr-3"
                }`}
              />
            </div>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700 outline-none"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700 outline-none"
            >
              <option value="all">{isAr ? "كل الحالات" : "All Statuses"}</option>
              <option value="scheduled">{isAr ? "مجدول" : "Scheduled"}</option>
              <option value="active">{isAr ? "شغال" : "Active"}</option>
              <option value="completed">{isAr ? "مكتمل" : "Completed"}</option>
              <option value="cancelled">{isAr ? "ملغي" : "Cancelled"}</option>
            </select>

            <button
              type="button"
              onClick={loadData}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {isAr ? "تحديث" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <Th>{isAr ? "المندوب" : "Rider"}</Th>
                <Th>{isAr ? "التاريخ" : "Date"}</Th>
                <Th>{isAr ? "بداية الشفت" : "Start"}</Th>
                <Th>{isAr ? "نهاية الشفت" : "End"}</Th>
                <Th>{isAr ? "التطبيق" : "Platform"}</Th>
                <Th>{isAr ? "الزون" : "Zone"}</Th>
                <Th>{isAr ? "الحالة" : "Status"}</Th>
                <Th>{isAr ? "البداية الفعلية" : "Actual Start"}</Th>
                <Th>{isAr ? "النهاية الفعلية" : "Actual End"}</Th>
                <Th>{isAr ? "إجراءات" : "Actions"}</Th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center text-sm font-black text-slate-400">
                    {isAr ? "جاري تحميل الشفتات..." : "Loading shifts..."}
                  </td>
                </tr>
              ) : filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center text-sm font-black text-slate-400">
                    {isAr ? "لا توجد شفتات مطابقة." : "No matching shifts."}
                  </td>
                </tr>
              ) : (
                filteredShifts.map((shift) => (
                  <tr key={shift.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="font-black text-[#102a4c]">
                            {shift.employees?.name || "-"}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                            {shift.employees?.hunger_id
                              ? `HS ${shift.employees.hunger_id}`
                              : shift.employees?.keeta_id
                                ? `Keeta ${shift.employees.keeta_id}`
                                : shift.employees?.iqama || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <Td strong>{formatDate(shift.shift_date, isAr)}</Td>
                    <Td>{formatClock(shift.start_time)}</Td>
                    <Td>{formatClock(shift.end_time)}</Td>
                    <Td>{translatePlatform(shift.platform, isAr)}</Td>
                    <Td>{shift.zone || "-"}</Td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={shift.status} isAr={isAr} />
                    </td>

                    <Td>{formatDateTime(shift.actual_start_at, isAr)}</Td>
                    <Td>{formatDateTime(shift.actual_end_at, isAr)}</Td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {shift.status === "scheduled" && (
                          <button
                            type="button"
                            onClick={() => cancelShift(shift.id)}
                            className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-black text-amber-700 hover:bg-amber-100"
                          >
                            {isAr ? "إلغاء" : "Cancel"}
                          </button>
                        )}

                        {shift.status !== "active" && (
                          <button
                            type="button"
                            onClick={() => deleteShift(shift.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[26px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-[#102a4c]">
                  {isAr ? "إضافة شفت جديد" : "Add New Shift"}
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {isAr
                    ? "حدد المندوب ووقت الشفت والتطبيق والزون."
                    : "Choose rider, shift time, platform and zone."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field label={isAr ? "المندوب" : "Rider"} full>
                <select
                  value={selectedEmployeeId}
                  onChange={(event) => setSelectedEmployeeId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-300"
                >
                  <option value="">
                    {isAr ? "اختر المندوب" : "Select rider"}
                  </option>

                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={isAr ? "التاريخ" : "Date"}>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(event) => setShiftDate(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-300"
                />
              </Field>

              <Field label={isAr ? "التطبيق" : "Platform"}>
                <select
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-300"
                >
                  {PLATFORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {isAr ? option.ar : option.en}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={isAr ? "بداية الشفت" : "Shift Start"}>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-300"
                />
              </Field>

              <Field label={isAr ? "نهاية الشفت" : "Shift End"}>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-300"
                />
              </Field>

              <Field label={isAr ? "الزون" : "Zone"} full>
                <input
                  list="rider-zone-list"
                  value={zone}
                  onChange={(event) => setZone(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-300"
                />

                <datalist id="rider-zone-list">
                  {ZONE_OPTIONS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </Field>

              <Field label={isAr ? "ملاحظات" : "Notes"} full>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-blue-300"
                  placeholder={
                    isAr
                      ? "تعليمات أو ملاحظات للمندوب..."
                      : "Instructions or notes for the rider..."
                  }
                />
              </Field>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={createShift}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#123B67] px-4 text-xs font-black text-white disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {saving
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                    ? "حفظ الشفت"
                    : "Save Shift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={full ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-xs font-black text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "indigo" | "red" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-3xl font-black text-[#102a4c]">{value}</p>
        <div className={`h-3 w-3 rounded-full ${tones[tone].split(" ")[0]}`} />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  isAr,
}: {
  status: RiderShift["status"];
  isAr: boolean;
}) {
  const config = {
    scheduled: {
      label: isAr ? "مجدول" : "Scheduled",
      cls: "bg-blue-50 text-blue-700",
    },
    active: {
      label: isAr ? "شغال" : "Active",
      cls: "bg-emerald-50 text-emerald-700",
    },
    completed: {
      label: isAr ? "مكتمل" : "Completed",
      cls: "bg-slate-100 text-slate-700",
    },
    cancelled: {
      label: isAr ? "ملغي" : "Cancelled",
      cls: "bg-red-50 text-red-700",
    },
  }[status];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${config.cls}`}>
      {config.label}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-start text-[11px] font-black text-slate-500">
      {children}
    </th>
  );
}

function Td({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3.5 text-sm ${
        strong ? "font-black text-[#102a4c]" : "font-bold text-slate-600"
      }`}
    >
      {children}
    </td>
  );
}

function formatClock(value: string) {
  if (!value) return "-";
  return value.slice(0, 5);
}

function formatDate(value: string, isAr: boolean) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(isAr ? "ar-SA" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null, isAr: boolean) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(isAr ? "ar-SA" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function translatePlatform(value: string | null, isAr: boolean) {
  if (value === "HungerStation") return isAr ? "هنجرستيشن" : "HungerStation";
  if (value === "Keeta") return isAr ? "كيتا" : "Keeta";
  return value || "-";
}

function getSaudiDateKey() {
  const now = new Date();
  const saudiTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return saudiTime.toISOString().slice(0, 10);
}

function getMonthStart() {
  const now = new Date();
  const saudiTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  return `${saudiTime.getUTCFullYear()}-${String(
    saudiTime.getUTCMonth() + 1
  ).padStart(2, "0")}-01`;
}
