"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { ar } from "../locales/ar";
import { en } from "../locales/en";

import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  ClipboardList,
  Droplets,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Truck,
  User,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

type Lang = "ar" | "en";
type SystemType = "maintenance" | "employees";
type Translation = Record<string, string>;

type LanguageContextType = {
  lang: Lang;
  t: Translation;
  dir: "rtl" | "ltr";
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  t: {},
  dir: "rtl",
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function AppLayout({
  children,
  title,
  subtitle,
  titleKey,
  subtitleKey,
  system = "maintenance",
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  titleKey?: string;
  subtitleKey?: string;
  system?: SystemType;
}) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("ar");
  const [logoutActive, setLogoutActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "ar" || saved === "en") {
      setLang(saved);
    }
  }, []);

  const t: Translation = lang === "ar" ? ar : en;
  const dir = lang === "ar" ? "rtl" : "ltr";

  function toggleLang() {
    const nextLang = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
    localStorage.setItem("lang", nextLang);
  }

  function handleLogout() {
    setLogoutActive(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  }

  const pageTitle = titleKey
    ? t[titleKey]
    : title || getDefaultTitle(system, lang, t);

  const pageSubtitle = subtitleKey
    ? t[subtitleKey]
    : subtitle || getDefaultSubtitle(system, lang, t);

  const menuItems = getMenuItems(system, lang, t);
  const sectionName = getSectionName(system, lang, t);

  return (
    <LanguageContext.Provider value={{ lang, t, dir }}>
      <main dir={dir} className="min-h-screen bg-[#f6f8fb] text-[#0f2544]">
        <div className="flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-[330px] flex-col justify-between overflow-hidden rounded-e-[34px] bg-gradient-to-b from-[#062b4f] via-[#042644] to-[#02182e] px-6 py-5 text-white shadow-2xl lg:flex">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(45,120,255,0.22),transparent_35%),radial-gradient(circle_at_80%_65%,rgba(0,190,255,0.12),transparent_35%)]" />

            <div className="relative z-10">
              <div className="mb-2 text-center">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={300}
                  height={300}
                  className="mx-auto h-52 w-52 object-contain brightness-0 invert"
                  priority
                />

                <h2 className="mt-0 text-4xl font-extrabold tracking-tight">
                  {t.appName || (lang === "ar" ? "نمو التوصيل" : "Namou Delivery")}
                </h2>

                <div className="mt-1 flex items-center justify-center gap-4 text-lg font-bold text-slate-200">
                  <span className="h-px w-16 bg-white/30" />
                  {sectionName}
                  <span className="h-px w-16 bg-white/30" />
                </div>
              </div>

              <nav className="mt-5 space-y-1">
                {menuItems.map((item) => {
                  const active =
                    system === "employees" && item.href === "/employees"
                      ? pathname === "/employees"
                      : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      href={item.href}
                      key={item.name}
                      className={`group relative flex min-h-[60px] w-full items-center justify-between rounded-2xl px-5 text-[19px] font-extrabold transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-950/30"
                          : "text-white/95 hover:bg-white/10"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-3 start-3 w-1.5 rounded-full bg-cyan-300" />
                      )}

                      <span className="flex items-center gap-4">
                        <span className="text-white">{item.icon}</span>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="relative z-10">
              <button
                onClick={handleLogout}
                className={`flex min-h-[70px] w-full items-center justify-center gap-4 rounded-2xl border px-5 text-[24px] font-extrabold transition-all duration-200 ${
                  logoutActive
                    ? "border-red-500 bg-red-600 text-white shadow-2xl shadow-red-900/50"
                    : "border-white/25 bg-white/5 text-white hover:border-red-500 hover:bg-red-600 hover:shadow-2xl hover:shadow-red-900/40"
                }`}
              >
                <LogOut className="h-9 w-9" />
                {t.logout || (lang === "ar" ? "تسجيل الخروج" : "Logout")}
              </button>
            </div>
          </aside>

          <section className="flex-1 p-6 lg:p-8">
            <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Menu className="h-6 w-6" />

                <div>
                  <h2 className="text-xl font-bold">{pageTitle}</h2>
                  {pageSubtitle && (
                    <p className="mt-1 text-sm text-slate-500">{pageSubtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5">
                <button
                  onClick={toggleLang}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-50"
                >
                  {lang === "ar" ? "EN" : "AR"}
                </button>

                <CalendarDays className="h-6 w-6 text-slate-600" />

                <div className="relative">
                  <Bell className="h-6 w-6 text-slate-600" />
                  <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs text-white">
                    12
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="font-bold">
                      {lang === "ar" ? "المدير العام" : "General Manager"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {lang === "ar" ? "مدير النظام" : "System Manager"}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {children}
          </section>
        </div>
      </main>
    </LanguageContext.Provider>
  );
}

function getDefaultTitle(system: SystemType, lang: Lang, t: Translation) {
  if (system === "employees") {
    return t.employeesSystem || (lang === "ar" ? "نظام الموظفين" : "Employees System");
  }

  return t.dashboard || (lang === "ar" ? "لوحة التحكم" : "Dashboard");
}

function getDefaultSubtitle(system: SystemType, lang: Lang, t: Translation) {
  if (system === "employees") {
    return (
      t.employeesDashboardSubtitle ||
      (lang === "ar"
        ? "لوحة تحكم إدارة الموظفين والمناديب"
        : "Employees and Couriers Management Dashboard")
    );
  }

  return t.overview || (lang === "ar" ? "إدارة كاملة على أداء الأسطول اليوم" : "Full overview of fleet performance today");
}

function getSectionName(system: SystemType, lang: Lang, t: Translation) {
  if (system === "employees") {
    return t.employees || (lang === "ar" ? "إدارة الموظفين" : "Employees");
  }

  return t.appSection || (lang === "ar" ? "الصيانة" : "Maintenance");
}

function getMenuItems(system: SystemType, lang: Lang, t: Translation) {
  if (system === "employees") {
    return [
      {
        name: t.dashboard || (lang === "ar" ? "لوحة التحكم" : "Dashboard"),
        href: "/employees",
        icon: <Home className="h-7 w-7" />,
      },
      {
        name: t.employees || (lang === "ar" ? "الموظفون" : "Employees"),
        href: "/employees/list",
        icon: <Users className="h-7 w-7" />,
      },
      {
        name: lang === "ar" ? "متابعة الأداء" : "Rules & Performance",
        href: "/employees/performance",
        icon: <ClipboardList className="h-7 w-7" />,
      },
      {
        name: t.notifications || (lang === "ar" ? "الإشعارات والإنذارات" : "Notifications"),
        href: "/employees/notices",
        icon: <Bell className="h-7 w-7" />,
      },
      {
        name: t.salaries || (lang === "ar" ? "الرواتب والمستحقات" : "Payroll"),
        href: "/employees/payroll",
        icon: <Wallet className="h-7 w-7" />,
      },
      {
        name: t.reports || (lang === "ar" ? "التقارير" : "Reports"),
        href: "/employees/reports",
        icon: <FileText className="h-7 w-7" />,
      },
      {
        name: t.settings || (lang === "ar" ? "الإعدادات" : "Settings"),
        href: "/employees/settings",
        icon: <Settings className="h-7 w-7" />,
      },
    ];
  }

  return [
    {
      name: t.dashboard,
      href: "/dashboard",
      icon: <Home className="h-7 w-7" />,
    },
    {
      name: t.vehicles,
      href: "/cars",
      icon: <Truck className="h-7 w-7" />,
    },
    {
      name: t.maintenance,
      href: "/maintenance/add",
      icon: <Wrench className="h-7 w-7" />,
    },
    {
      name: t.oilChanges,
      href: "/oil-changes/add",
      icon: <Droplets className="h-7 w-7" />,
    },
    {
      name: t.accidents,
      href: "/maintenance/incidents",
      icon: <Car className="h-7 w-7" />,
    },
    {
  name: lang === "ar" ? "الفحص الدوري" : "Periodic Inspection",
  href: "/inspections",
  icon: <ClipboardList className="h-7 w-7" />,
},
  ];
}
