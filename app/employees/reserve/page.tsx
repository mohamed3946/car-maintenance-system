"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { supabase } from "@/app/lib/supabase";
import AppLayout, { useLanguage } from "@/components/AppLayout";

type ReserveEmployee = {
  id: string;
  name: string;
  iqama: string;
  phone: string | null;
  nationality: string | null;
  job_title: string | null;
  work_location: string | null;
  status: string | null;
  created_at: string | null;
  notes: string | null;
};

export default function ReserveEmployeesPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [employees, setEmployees] = useState<ReserveEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);

  const loadEmployees = useCallback(async () => {
    const { data, error } = await supabase
      .from("employees")
      .select(
        "id,name,iqama,phone,nationality,job_title,work_location,status,created_at,notes"
      )
      .eq("employment_stage", "reserve")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD RESERVE EMPLOYEES ERROR:", error);
      alert(ar ? "تعذر تحميل الموظفين الاحتياطيين." : "Unable to load reserve employees.");
      return;
    }

    setEmployees((data || []) as ReserveEmployee[]);
  }, [ar]);

  useEffect(() => {
    async function start() {
      setLoading(true);
      await loadEmployees();
      setLoading(false);
    }

    start();

    const channel = supabase
      .channel("reserve-employees-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employees",
        },
        () => loadEmployees()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadEmployees]);

  async function refresh() {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.name,
        employee.iqama,
        employee.phone,
        employee.nationality,
        employee.work_location,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [employees, search]);

  async function moveToEmployees(employee: ReserveEmployee) {
    const confirmed = window.confirm(
      ar
        ? `هل تريد نقل ${employee.name} إلى قائمة الموظفين الفعلية؟`
        : `Move ${employee.name} to the active employees list?`
    );

    if (!confirmed) return;

    setMovingId(employee.id);

    try {
      const { error } = await supabase
        .from("employees")
        .update({
          employment_stage: "employee",
          status: "active",
          start_date: new Date().toISOString().slice(0, 10),
          updated_at: new Date().toISOString(),
        })
        .eq("id", employee.id)
        .eq("employment_stage", "reserve");

      if (error) throw error;

      setEmployees((current) => current.filter((item) => item.id !== employee.id));
      alert(ar ? "تم نقل الموظف إلى قائمة الموظفين." : "Employee moved to Employees List.");
    } catch (error) {
      console.error("MOVE RESERVE EMPLOYEE ERROR:", error);
      alert(ar ? "تعذر نقل الموظف." : "Unable to move employee.");
    } finally {
      setMovingId(null);
    }
  }

  return (
    <AppLayout system="employees">
      <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-[#f5f7fb] p-4 md:p-6 xl:p-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <UserCheck size={17} />
              {ar ? "طلبات الانضمام" : "Rider Applications"}
            </div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
              {ar ? "الموظفون الاحتياطيون" : "Reserve Employees"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {ar
                ? "المناديب المقبولون مبدئيًا قبل نقلهم إلى قائمة الموظفين الفعلية."
                : "Approved riders waiting to be moved to the active employees list."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/employees/applications"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              {ar ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}
              {ar ? "طلبات الانضمام" : "Applications"}
            </Link>

            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
              {ar ? "تحديث" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[220px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UsersRound size={19} />
              </div>
              <div className="text-2xl font-black text-slate-900">{employees.length}</div>
            </div>
            <div className="mt-3 text-xs font-bold text-slate-500">
              {ar ? "إجمالي الاحتياطيين" : "Total Reserve"}
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Search
              size={18}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${ar ? "right-8" : "left-8"}`}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={ar ? "بحث بالاسم أو الإقامة أو الجوال..." : "Search by name, Iqama or phone..."}
              className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-400 ${ar ? "pr-11 pl-4" : "pl-11 pr-4"}`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <UserCheck className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <div className="font-bold text-slate-700">
              {ar ? "لا يوجد موظفون احتياطيون" : "No reserve employees"}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((employee) => (
              <div key={employee.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <UserRound size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-black text-slate-900">{employee.name}</div>
                      <div className="mt-1 text-xs font-bold text-slate-400">{employee.iqama}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black text-amber-700">
                    {ar ? "احتياطي" : "Reserve"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-bold text-slate-600">
                  <div className="rounded-xl bg-slate-50 px-3 py-3">{employee.phone || "-"}</div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">{employee.nationality || "-"}</div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">{employee.work_location || "-"}</div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">{employee.job_title || "-"}</div>
                </div>

                <button
                  onClick={() => moveToEmployees(employee)}
                  disabled={movingId === employee.id}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {movingId === employee.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {ar ? "تحويل إلى قائمة الموظفين" : "Move to Employees List"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
