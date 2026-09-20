"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  Wrench,
  Bike,
  Crown,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";

type Role =
  | "rider"
  | "supervisor"
  | "mechanic"
  | "maintenance_manager"
  | "super_admin";

type Employee = {
  id: string;
  name: string | null;
  iqama: string | null;
  phone: string | null;
  job_title: string | null;
  status: string | null;
  work_location: string | null;
};

type AppAccount = {
  id: string;
  auth_user_id: string;
  employee_id: string;
  role: Role;
  is_active: boolean;
  preferred_language: "ar" | "en" | "ur" | null;
  created_at: string | null;
  updated_at: string | null;
};

type Row = {
  employee: Employee;
  account: AppAccount | null;
};

const ROLE_CONFIG: Record<
  Role,
  {
    ar: string;
    en: string;
    descriptionAr: string;
    descriptionEn: string;
    permissionsAr: string[];
    permissionsEn: string[];
  }
> = {
  rider: {
    ar: "مندوب",
    en: "Rider",
    descriptionAr: "واجهة المندوب والتشغيل الميداني",
    descriptionEn: "Rider mobile operations",
    permissionsAr: ["الشفتات", "الأداء", "المالية", "الإشعارات", "الدعم"],
    permissionsEn: ["Shifts", "Performance", "Finance", "Notifications", "Support"],
  },
  supervisor: {
    ar: "مشرف",
    en: "Supervisor",
    descriptionAr: "متابعة المناديب والتشغيل والتتبع",
    descriptionEn: "Rider supervision and live operations",
    permissionsAr: ["المناديب", "التتبع المباشر", "الشفتات", "الأداء", "التقارير"],
    permissionsEn: ["Riders", "Live Tracking", "Shifts", "Performance", "Reports"],
  },
  mechanic: {
    ar: "ميكانيكي",
    en: "Mechanic",
    descriptionAr: "أعمال الصيانة والمركبات والبلاغات",
    descriptionEn: "Maintenance and vehicle tasks",
    permissionsAr: ["المهام", "المركبات", "الصيانة", "الحوادث", "الفحوصات"],
    permissionsEn: ["Tasks", "Vehicles", "Maintenance", "Incidents", "Inspections"],
  },
  maintenance_manager: {
    ar: "مدير الصيانة",
    en: "Maintenance Manager",
    descriptionAr: "إدارة كاملة لقسم الأسطول والصيانة",
    descriptionEn: "Full fleet and maintenance management",
    permissionsAr: ["المركبات", "الصيانة", "الحوادث", "الفحوصات", "تقارير الصيانة"],
    permissionsEn: ["Vehicles", "Maintenance", "Incidents", "Inspections", "Maintenance Reports"],
  },
  super_admin: {
    ar: "مدير النظام",
    en: "Super Admin",
    descriptionAr: "صلاحية كاملة على التطبيق والأنظمة",
    descriptionEn: "Full application and system access",
    permissionsAr: ["كامل النظام", "المستخدمون", "الأدوار", "التشغيل", "الموارد البشرية", "الصيانة"],
    permissionsEn: ["Full System", "Users", "Roles", "Operations", "HR", "Maintenance"],
  },
};

const ROLES = Object.keys(ROLE_CONFIG) as Role[];

export default function EmployeesUsersPage() {
  return (
    <AppLayout system="employees">
      <UsersContent />
    </AppLayout>
  );
}

function UsersContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [accounts, setAccounts] = useState<AppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role | "without_account">("all");
  const [selected, setSelected] = useState<Row | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formRole, setFormRole] = useState<Role>("rider");
  const [formPassword, setFormPassword] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const t = {
    title: isAr ? "المستخدمون والأدوار" : "Users & Roles",
    subtitle: isAr
      ? "إنشاء حسابات التطبيق للموظفين وتحديد الدور وحالة الوصول."
      : "Create employee app accounts and manage roles and access status.",
    refresh: isAr ? "تحديث" : "Refresh",
    totalEmployees: isAr ? "إجمالي الموظفين" : "Total Employees",
    appUsers: isAr ? "مستخدمو التطبيق" : "App Users",
    activeUsers: isAr ? "حسابات نشطة" : "Active Accounts",
    noAccount: isAr ? "بدون حساب" : "Without Account",
    search: isAr ? "بحث بالاسم أو الإقامة أو الجوال..." : "Search name, Iqama or phone...",
    all: isAr ? "الكل" : "All",
    withoutAccount: isAr ? "بدون حساب" : "Without Account",
    employee: isAr ? "الموظف" : "Employee",
    job: isAr ? "المسمى" : "Job Title",
    role: isAr ? "الدور" : "Role",
    accountStatus: isAr ? "حالة الحساب" : "Account Status",
    action: isAr ? "الإجراء" : "Action",
    active: isAr ? "نشط" : "Active",
    inactive: isAr ? "موقوف" : "Inactive",
    create: isAr ? "إنشاء حساب" : "Create Account",
    manage: isAr ? "إدارة الحساب" : "Manage Account",
    noResults: isAr ? "لا توجد نتائج مطابقة" : "No matching results",
    password: isAr ? "كلمة المرور" : "Password",
    passwordHint: isAr ? "6 أحرف على الأقل" : "At least 6 characters",
    save: isAr ? "حفظ" : "Save",
    cancel: isAr ? "إلغاء" : "Cancel",
    permissions: isAr ? "صلاحيات الدور" : "Role Permissions",
    createHint: isAr
      ? "سيتم إنشاء حساب دخول باستخدام رقم الإقامة وكلمة المرور المحددة."
      : "A login account will be created using the employee Iqama and selected password.",
    updateHint: isAr
      ? "يمكن تغيير الدور أو تفعيل/إيقاف الحساب. اترك كلمة المرور فارغة إذا لم ترد تغييرها."
      : "Change role or account status. Leave password blank if you do not want to change it.",
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setMessage("");

    try {
      const [employeesResult, accountsResult] = await Promise.all([
        supabase
          .from("employees")
          .select("id,name,iqama,phone,job_title,status,work_location")
          .order("name", { ascending: true }),
        supabase
          .from("app_accounts")
          .select("id,auth_user_id,employee_id,role,is_active,preferred_language,created_at,updated_at")
          .order("created_at", { ascending: false }),
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (accountsResult.error) throw accountsResult.error;

      setEmployees((employeesResult.data || []) as Employee[]);
      setAccounts((accountsResult.data || []) as AppAccount[]);
    } catch (error: any) {
      console.error("LOAD USERS ERROR:", error);
      setMessage(error?.message || (isAr ? "تعذر تحميل البيانات." : "Could not load data."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const rows = useMemo<Row[]>(() => {
    const accountMap = new Map(accounts.map((account) => [account.employee_id, account]));
    return employees.map((employee) => ({
      employee,
      account: accountMap.get(employee.id) || null,
    }));
  }, [employees, accounts]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !q ||
        String(row.employee.name || "").toLowerCase().includes(q) ||
        String(row.employee.iqama || "").includes(q) ||
        String(row.employee.phone || "").includes(q);

      const matchesRole =
        roleFilter === "all"
          ? true
          : roleFilter === "without_account"
            ? !row.account
            : row.account?.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [rows, search, roleFilter]);

  const stats = useMemo(() => {
    return {
      employees: employees.length,
      users: accounts.length,
      active: accounts.filter((x) => x.is_active).length,
      without: Math.max(employees.length - accounts.length, 0),
    };
  }, [employees, accounts]);

  function openAccount(row: Row) {
    setSelected(row);
    setFormRole(row.account?.role || suggestRole(row.employee.job_title));
    setFormPassword("");
    setFormActive(row.account?.is_active ?? true);
    setShowPassword(false);
    setMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setSelected(null);
    setFormPassword("");
    setMessage("");
  }

  async function saveAccount() {
    if (!selected) return;

    if (!selected.account && formPassword.length < 6) {
      setMessage(isAr ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل." : "Password must be at least 6 characters.");
      return;
    }

    if (selected.account && formPassword && formPassword.length < 6) {
      setMessage(isAr ? "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل." : "New password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("manage-app-user", {
        body: {
          employee_id: selected.employee.id,
          role: formRole,
          is_active: formActive,
          password: formPassword || null,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || "Operation failed");

      await loadData();
      setModalOpen(false);
      setSelected(null);
    } catch (error: any) {
      console.error("SAVE APP ACCOUNT ERROR:", error);
      setMessage(error?.message || (isAr ? "تعذر حفظ الحساب." : "Could not save account."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-bold text-slate-600">{isAr ? "جاري تحميل المستخدمين..." : "Loading users..."}</span>
        </div>
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-5 pb-10">
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-l from-[#092e55] via-[#0c3a69] to-[#0f4b82] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -start-20 -top-28 h-72 w-72 rounded-full bg-blue-400/10" />
        <div className="pointer-events-none absolute -bottom-36 end-12 h-64 w-64 rounded-full bg-cyan-300/10" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
              </div>
              <span className="text-xs font-black text-cyan-200">ACCESS CONTROL</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-100">{t.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#0f3b68] shadow-sm transition hover:bg-blue-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {t.refresh}
          </button>
        </div>
      </section>

      {message && !modalOpen ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title={t.totalEmployees} value={stats.employees} icon={<Users className="h-5 w-5" />} tone="blue" />
        <StatCard title={t.appUsers} value={stats.users} icon={<UserCog className="h-5 w-5" />} tone="violet" />
        <StatCard title={t.activeUsers} value={stats.active} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatCard title={t.noAccount} value={stats.without} icon={<UserPlus className="h-5 w-5" />} tone="amber" />
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton active={roleFilter === "all"} onClick={() => setRoleFilter("all")} label={t.all} />
            {ROLES.map((role) => (
              <FilterButton
                key={role}
                active={roleFilter === role}
                onClick={() => setRoleFilter(role)}
                label={isAr ? ROLE_CONFIG[role].ar : ROLE_CONFIG[role].en}
              />
            ))}
            <FilterButton active={roleFilter === "without_account"} onClick={() => setRoleFilter("without_account")} label={t.withoutAccount} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4 text-start text-xs font-black">{t.employee}</th>
                <th className="p-4 text-start text-xs font-black">{t.job}</th>
                <th className="p-4 text-start text-xs font-black">{t.role}</th>
                <th className="p-4 text-start text-xs font-black">{t.accountStatus}</th>
                <th className="p-4 text-start text-xs font-black">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sm font-bold text-slate-400">{t.noResults}</td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.employee.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                    <td className="p-4">
                      <div className="font-black text-[#102a4c]">{row.employee.name || "-"}</div>
                      <div className="mt-1 text-xs font-bold text-slate-400">{row.employee.iqama || "-"} · {row.employee.phone || "-"}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-600">{row.employee.job_title || "-"}</td>
                    <td className="p-4">
                      {row.account ? (
                        <RoleBadge role={row.account.role} isAr={isAr} />
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{t.noAccount}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {row.account ? (
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${row.account.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {row.account.is_active ? t.active : t.inactive}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => openAccount(row)}
                        className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${row.account ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-[#123B67] text-white hover:bg-[#0d2d4e]"}`}
                      >
                        {row.account ? <UserCog className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        {row.account ? t.manage : t.create}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && selected ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/50 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-black text-[#102a4c]">{selected.employee.name || "-"}</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">{selected.employee.iqama || "-"}</p>
              </div>
              <button type="button" onClick={closeModal} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-2xl bg-blue-50 p-4 text-xs font-bold leading-6 text-blue-700">
                {selected.account ? t.updateHint : t.createHint}
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">{t.role}</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ROLES.map((role) => {
                    const config = ROLE_CONFIG[role];
                    const active = formRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormRole(role)}
                        className={`rounded-2xl border p-4 text-start transition ${active ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <RoleIcon role={role} />
                          <div>
                            <div className="text-sm font-black text-[#102a4c]">{isAr ? config.ar : config.en}</div>
                            <div className="mt-1 text-[10px] font-bold text-slate-400">{isAr ? config.descriptionAr : config.descriptionEn}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-sm font-black text-[#102a4c]">{t.permissions}</div>
                <div className="flex flex-wrap gap-2">
                  {(isAr ? ROLE_CONFIG[formRole].permissionsAr : ROLE_CONFIG[formRole].permissionsEn).map((permission) => (
                    <span key={permission} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">{permission}</span>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">{t.password}</label>
                <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-3">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                  <input
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder={selected.account ? (isAr ? "اتركها فارغة بدون تغيير" : "Leave blank to keep current") : t.passwordHint}
                    className="h-full flex-1 bg-transparent px-3 text-sm font-bold text-slate-700 outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="p-2 text-slate-400">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <div className="text-sm font-black text-[#102a4c]">{t.accountStatus}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">{formActive ? t.active : t.inactive}</div>
                </div>
                <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="h-5 w-5 accent-blue-600" />
              </label>

              {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</div> : null}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 p-5">
              <button type="button" onClick={closeModal} disabled={saving} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                {t.cancel}
              </button>
              <button type="button" onClick={saveAccount} disabled={saving} className="inline-flex h-11 min-w-[130px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <ShieldCheck className="h-4 w-4" />}
                {t.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function suggestRole(jobTitle: string | null): Role {
  const value = String(jobTitle || "").trim().toLowerCase();
  if (value.includes("مشرف") || value.includes("supervisor")) return "supervisor";
  if (value.includes("ميكاني") || value.includes("mechanic")) return "mechanic";
  if (value.includes("مدير") && (value.includes("صيانة") || value.includes("fleet") || value.includes("maintenance"))) return "maintenance_manager";
  return "rider";
}

function RoleBadge({ role, isAr }: { role: Role; isAr: boolean }) {
  const config = ROLE_CONFIG[role];
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
      <RoleIcon role={role} small />
      {isAr ? config.ar : config.en}
    </span>
  );
}

function RoleIcon({ role, small = false }: { role: Role; small?: boolean }) {
  const size = small ? "h-3.5 w-3.5" : "h-5 w-5";
  if (role === "super_admin") return <Crown className={`${size} text-violet-600`} />;
  if (role === "maintenance_manager") return <ShieldCheck className={`${size} text-blue-600`} />;
  if (role === "mechanic") return <Wrench className={`${size} text-amber-600`} />;
  if (role === "supervisor") return <UserCog className={`${size} text-emerald-600`} />;
  return <Bike className={`${size} text-slate-600`} />;
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-xl px-3 text-xs font-black transition ${active ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
    >
      {label}
    </button>
  );
}

function StatCard({ title, value, icon, tone }: { title: string; value: number; icon: React.ReactNode; tone: "blue" | "violet" | "green" | "amber" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-[#102a4c]">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}
