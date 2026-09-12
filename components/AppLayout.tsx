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

import { supabase } from "../app/lib/supabase";

import {
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Car,
  ClipboardList,
  Clock3,
  Droplets,
  FileText,
  Home,
  IdCard,
  MapPin,
  CalendarClock,
  Flame,
  LogOut,
  Menu,
  Settings,
  Truck,
  User,
  Users,
  Wallet,
  Wrench,
  X,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Lang = "ar" | "en";

type SystemType =
  | "maintenance"
  | "employees";

type Translation = Record<
  string,
  string
>;

type IqamaNotification = {
  id: string;
  name: string;
  iqama: string;
  expiryDate: string;
  daysRemaining: number;
};

type LanguageContextType = {
  lang: Lang;
  t: Translation;
  dir: "rtl" | "ltr";
};

type MenuChild = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

type MenuItem = {
  name: string;
  href?: string;
  key?: string;
  icon: React.ReactNode;
  children?: MenuChild[];
};

/* =========================================================
   LANGUAGE CONTEXT
========================================================= */

const LanguageContext =
  createContext<LanguageContextType>({
    lang: "ar",
    t: {},
    dir: "rtl",
  });

export function useLanguage() {
  return useContext(
    LanguageContext
  );
}

/* =========================================================
   APP LAYOUT
========================================================= */

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
  const pathname =
    usePathname();

  const [lang, setLang] =
    useState<Lang>("ar");

  const [
    logoutActive,
    setLogoutActive,
  ] = useState(false);

  const [
    iqamaAlertCount,
    setIqamaAlertCount,
  ] = useState(0);

  const [
    iqamaNotifications,
    setIqamaNotifications,
  ] = useState<
    IqamaNotification[]
  >([]);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    operationsOpen,
    setOperationsOpen,
  ] = useState(false);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);

  /* =========================================================
     LOAD LANGUAGE
  ========================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "lang"
      ) as Lang | null;

    if (
      saved === "ar" ||
      saved === "en"
    ) {
      setLang(saved);
    }
  }, []);

  /* =========================================================
     LOAD SIDEBAR STATE
  ========================================================= */

  useEffect(() => {
    const savedSidebar =
      localStorage.getItem(
        "sidebarOpen"
      );

    if (
      savedSidebar ===
      "false"
    ) {
      setSidebarOpen(false);
    }
  }, []);

  function toggleSidebar() {
    setSidebarOpen(
      (current) => {
        const next =
          !current;

        localStorage.setItem(
          "sidebarOpen",
          String(next)
        );

        return next;
      }
    );
  }

  /* =========================================================
     KEEP OPERATIONS OPEN
  ========================================================= */

  useEffect(() => {
    if (
      system !==
      "employees"
    ) {
      return;
    }

    const operationsRoutes = [
      "/employees/performance",
      "/employees/live-tracking",
      "/employees/shifts",
      "/employees/restaurant-demand",
      "/employees/cash-management",
    ];

    const insideOperations =
      operationsRoutes.some(
        (route) =>
          pathname === route ||
          pathname.startsWith(
            route + "/"
          )
      );

    if (insideOperations) {
      setOperationsOpen(true);
    }
  }, [pathname, system]);

  /* =========================================================
     IQAMA NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    if (
      system !==
      "employees"
    ) {
      setIqamaAlertCount(0);

      setIqamaNotifications(
        []
      );

      return;
    }

    async function loadIqamaNotifications() {
      const {
        data,
        error,
      } = await supabase
        .from("employees")
        .select(
          "id,name,iqama,iqama_expiry_date,status"
        )
        .not(
          "iqama_expiry_date",
          "is",
          null
        );

      if (error) {
        console.error(
          "LOAD IQAMA NOTIFICATIONS ERROR:",
          error
        );

        setIqamaAlertCount(
          0
        );

        setIqamaNotifications(
          []
        );

        return;
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const alerts: IqamaNotification[] =
        (data || [])
          .map(
            (
              employee
            ) => {
              /* خارج الخدمة لا يدخل في تنبيهات الإقامة */

              const status =
                String(
                  employee.status ||
                    ""
                )
                  .trim()
                  .toLowerCase();

              if (
                [
                  "outofservice",
                  "out_of_service",
                  "out of service",
                  "خارج الخدمة",
                ].includes(
                  status
                )
              ) {
                return null;
              }

              if (
                !employee.iqama_expiry_date
              ) {
                return null;
              }

              const expiryDate =
                new Date(
                  `${employee.iqama_expiry_date}T00:00:00`
                );

              if (
                Number.isNaN(
                  expiryDate.getTime()
                )
              ) {
                return null;
              }

              const daysRemaining =
                Math.ceil(
                  (expiryDate.getTime() -
                    today.getTime()) /
                    (1000 *
                      60 *
                      60 *
                      24)
                );

              if (
                daysRemaining >
                30
              ) {
                return null;
              }

              return {
                id: String(
                  employee.id
                ),

                name:
                  employee.name ||
                  "-",

                iqama:
                  employee.iqama ||
                  "-",

                expiryDate:
                  employee.iqama_expiry_date,

                daysRemaining,
              };
            }
          )
          .filter(
            Boolean
          ) as IqamaNotification[];

      alerts.sort(
        (a, b) =>
          a.daysRemaining -
          b.daysRemaining
      );

      setIqamaNotifications(
        alerts
      );

      setIqamaAlertCount(
        alerts.length
      );
    }

    loadIqamaNotifications();

    const handleFocus =
      () => {
        loadIqamaNotifications();
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [system, pathname]);

  /* =========================================================
     LANGUAGE
  ========================================================= */

  const t: Translation =
    lang === "ar"
      ? ar
      : en;

  const dir =
    lang === "ar"
      ? "rtl"
      : "ltr";

  function toggleLang() {
    const nextLang =
      lang === "ar"
        ? "en"
        : "ar";

    setLang(nextLang);

    localStorage.setItem(
      "lang",
      nextLang
    );
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function handleLogout() {
    setLogoutActive(
      true
    );

    setTimeout(() => {
      window.location.href =
        "/";
    }, 500);
  }

  /* =========================================================
     PAGE INFORMATION
  ========================================================= */

  const pageTitle =
    titleKey
      ? t[titleKey]
      : title ||
        getDefaultTitle(
          system,
          lang,
          t
        );

  const pageSubtitle =
    subtitleKey
      ? t[
          subtitleKey
        ]
      : subtitle ||
        getDefaultSubtitle(
          system,
          lang,
          t
        );

  const menuItems =
    getMenuItems(
      system,
      lang,
      t
    );

  const sectionName =
    getSectionName(
      system,
      lang,
      t
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t,
        dir,
      }}
    >
      <main
        dir={dir}
        className="min-h-screen bg-[#f6f8fb] text-[#0f2544]"
      >
        <div className="flex min-h-screen flex-row">
          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside
            className={`
              sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden
              bg-gradient-to-b from-[#062b4f] via-[#042644] to-[#02182e]
              text-white shadow-2xl
              transition-all duration-300 ease-in-out
              lg:flex

              ${
                sidebarOpen
                  ? `
                    w-[280px]
                    px-4
                    py-4
                    opacity-100
                    rounded-e-[34px]

                    xl:w-[300px]
                    xl:px-5

                    2xl:w-[330px]
                    2xl:px-6
                    2xl:py-5
                  `
                  : `
                    w-0
                    px-0
                    py-4
                    opacity-0
                    pointer-events-none
                  `
              }
            `}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(45,120,255,0.22),transparent_35%),radial-gradient(circle_at_80%_65%,rgba(0,190,255,0.12),transparent_35%)]" />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              {/* LOGO */}

              <div className="shrink-0 text-center">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={
                    300
                  }
                  height={
                    300
                  }
                  className="mx-auto h-28 w-28 object-contain brightness-0 invert xl:h-36 xl:w-36 2xl:h-44 2xl:w-44"
                  priority
                />

                <h2 className="text-2xl font-extrabold leading-tight tracking-tight xl:text-3xl 2xl:text-4xl">
                  {t.appName ||
                    (lang ===
                    "ar"
                      ? "نمو التوصيل"
                      : "Namou Delivery")}
                </h2>

                <div className="mt-1 flex items-center justify-center gap-2 text-sm font-bold text-slate-200 xl:gap-3 xl:text-base 2xl:gap-4 2xl:text-lg">
                  <span className="h-px w-10 bg-white/30 xl:w-12 2xl:w-16" />

                  {
                    sectionName
                  }

                  <span className="h-px w-10 bg-white/30 xl:w-12 2xl:w-16" />
                </div>
              </div>

              {/* =================================================
                  MENU
              ================================================= */}

              <nav className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pe-1 pb-1 [scrollbar-color:rgba(255,255,255,0.28)_transparent] [scrollbar-width:thin] xl:mt-4 2xl:mt-5">
                {menuItems.map(
                  (item) => {
                    /* =============================================
                       GROUP MENU
                    ============================================= */

                    if (
                      item.children &&
                      item.children
                        .length >
                        0
                    ) {
                      const childActive =
                        item.children.some(
                          (
                            child
                          ) =>
                            pathname ===
                              child.href ||
                            pathname.startsWith(
                              child.href +
                                "/"
                            )
                        );

                      const opened =
                        item.key ===
                          "operations" &&
                        operationsOpen;

                      return (
                        <div
                          key={
                            item.key ||
                            item.name
                          }
                          className="space-y-1"
                        >
                          {/* PARENT */}

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                item.key ===
                                "operations"
                              ) {
                                setOperationsOpen(
                                  (
                                    current
                                  ) =>
                                    !current
                                );
                              }
                            }}
                            className={`group relative flex min-h-[46px] w-full items-center justify-between rounded-xl px-3 text-[15px] font-extrabold transition-all duration-200 xl:min-h-[52px] xl:rounded-2xl xl:px-4 xl:text-[17px] 2xl:min-h-[58px] 2xl:px-5 2xl:text-[18px] ${
                              childActive
                                ? "bg-white/10 text-white"
                                : "text-white/95 hover:bg-white/10"
                            }`}
                          >
                            <span className="flex items-center gap-3 xl:gap-4">
                              <span className="text-white">
                                {
                                  item.icon
                                }
                              </span>

                              {
                                item.name
                              }
                            </span>

                            <ChevronDown
                              className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                                opened
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          {/* CHILDREN */}

                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              opened
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div
                                className={`space-y-1 pb-1 ${
                                  lang ===
                                  "ar"
                                    ? "pr-5"
                                    : "pl-5"
                                }`}
                              >
                                {item.children.map(
                                  (
                                    child
                                  ) => {
                                    const active =
                                      pathname ===
                                        child.href ||
                                      pathname.startsWith(
                                        child.href +
                                          "/"
                                      );

                                    return (
                                      <Link
                                        key={
                                          child.href
                                        }
                                        href={
                                          child.href
                                        }
                                        className={`group relative flex min-h-[42px] w-full items-center justify-between rounded-xl px-3 text-[13px] font-bold transition-all duration-200 xl:min-h-[46px] xl:px-4 xl:text-[15px] 2xl:text-[16px] ${
                                          active
                                            ? "bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-950/20"
                                            : "text-white/75 hover:bg-white/10 hover:text-white"
                                        }`}
                                      >
                                        {active && (
                                          <span className="absolute inset-y-2.5 start-2 w-1 rounded-full bg-cyan-300" />
                                        )}

                                        <span className="flex items-center gap-3">
                                          <span
                                            className={
                                              active
                                                ? "text-white"
                                                : "text-white/75"
                                            }
                                          >
                                            {
                                              child.icon
                                            }
                                          </span>

                                          <span>
                                            {
                                              child.name
                                            }
                                          </span>
                                        </span>
                                      </Link>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    /* =============================================
                       NORMAL ITEM
                    ============================================= */

                    if (
                      !item.href
                    ) {
                      return null;
                    }

                    const active =
                      system ===
                        "employees" &&
                      item.href ===
                        "/employees"
                        ? pathname ===
                          "/employees"
                        : pathname ===
                            item.href ||
                          pathname.startsWith(
                            item.href +
                              "/"
                          );

                    return (
                      <Link
                        href={
                          item.href
                        }
                        key={
                          item.name
                        }
                        className={`group relative flex min-h-[46px] w-full items-center justify-between rounded-xl px-3 text-[15px] font-extrabold transition-all duration-200 xl:min-h-[52px] xl:rounded-2xl xl:px-4 xl:text-[17px] 2xl:min-h-[58px] 2xl:px-5 2xl:text-[18px] ${
                          active
                            ? "bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-950/30"
                            : "text-white/95 hover:bg-white/10"
                        }`}
                      >
                        {active && (
                          <span className="absolute inset-y-3 start-3 w-1.5 rounded-full bg-cyan-300" />
                        )}

                        <span className="flex items-center gap-3 xl:gap-4">
                          <span className="text-white">
                            {
                              item.icon
                            }
                          </span>

                          {
                            item.name
                          }
                        </span>

                        {item.href ===
                          "/employees/iqama-expiry" &&
                          iqamaAlertCount >
                            0 && (
                            <span
                              className={`flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-xs font-black shadow-sm ${
                                active
                                  ? "bg-white text-red-600"
                                  : "bg-red-500 text-white"
                              }`}
                              title={
                                lang ===
                                "ar"
                                  ? "إقامات تحتاج متابعة"
                                  : "Iqamas requiring attention"
                              }
                            >
                              {iqamaAlertCount >
                              99
                                ? "99+"
                                : iqamaAlertCount}
                            </span>
                          )}
                      </Link>
                    );
                  }
                )}
              </nav>
            </div>

            {/* =================================================
                LOGOUT
            ================================================= */}

            <div className="relative z-10 shrink-0 pt-3">
              <button
                onClick={
                  handleLogout
                }
                className={`flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border px-4 text-[17px] font-extrabold transition-all duration-200 xl:min-h-[58px] xl:rounded-2xl xl:text-[19px] 2xl:min-h-[64px] 2xl:gap-4 2xl:px-5 2xl:text-[21px] ${
                  logoutActive
                    ? "border-red-500 bg-red-600 text-white shadow-2xl shadow-red-900/50"
                    : "border-white/25 bg-white/5 text-white hover:border-red-500 hover:bg-red-600 hover:shadow-2xl hover:shadow-red-900/40"
                }`}
              >
                <LogOut className="h-6 w-6 xl:h-7 xl:w-7 2xl:h-8 2xl:w-8" />

                {t.logout ||
                  (lang ===
                  "ar"
                    ? "تسجيل الخروج"
                    : "Logout")}
              </button>
            </div>
          </aside>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section className="min-w-0 flex-1 p-6 transition-all duration-300 lg:p-8">
            {/* =================================================
                TOP HEADER
            ================================================= */}

            <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                {/* SIDEBAR BUTTON */}

                <button
                  type="button"
                  onClick={
                    toggleSidebar
                  }
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                    sidebarOpen
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                  title={
                    lang ===
                    "ar"
                      ? sidebarOpen
                        ? "إغلاق القائمة الجانبية"
                        : "فتح القائمة الجانبية"
                      : sidebarOpen
                        ? "Close Sidebar"
                        : "Open Sidebar"
                  }
                  aria-label={
                    lang ===
                    "ar"
                      ? sidebarOpen
                        ? "إغلاق القائمة الجانبية"
                        : "فتح القائمة الجانبية"
                      : sidebarOpen
                        ? "Close Sidebar"
                        : "Open Sidebar"
                  }
                >
                  {sidebarOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                <div>
                  <h2 className="text-xl font-bold">
                    {
                      pageTitle
                    }
                  </h2>

                  {pageSubtitle && (
                    <p className="mt-1 text-sm text-slate-500">
                      {
                        pageSubtitle
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5">
                {/* LANGUAGE */}

                <button
                  onClick={
                    toggleLang
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-50"
                >
                  {lang ===
                  "ar"
                    ? "EN"
                    : "AR"}
                </button>

                <CalendarDays className="h-6 w-6 text-slate-600" />

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationsOpen(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                      notificationsOpen
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                    aria-label={
                      lang ===
                      "ar"
                        ? "الإشعارات"
                        : "Notifications"
                    }
                  >
                    <Bell className="h-6 w-6" />

                    {iqamaAlertCount >
                      0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-sm">
                        {iqamaAlertCount >
                        99
                          ? "99+"
                          : iqamaAlertCount}
                      </span>
                    )}
                  </button>

                  {/* NOTIFICATION DROPDOWN */}

                  {notificationsOpen && (
                    <div
                      className={`absolute top-12 z-[90] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] ${
                        lang ===
                        "ar"
                          ? "left-0"
                          : "right-0"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                        <div>
                          <h3 className="text-sm font-black text-[#102a4c]">
                            {lang ===
                            "ar"
                              ? "تنبيهات الإقامات"
                              : "Iqama Alerts"}
                          </h3>

                          <p className="mt-0.5 text-[11px] font-bold text-slate-400">
                            {lang ===
                            "ar"
                              ? "الإقامات المنتهية أو التي يتبقى عليها 30 يومًا أو أقل"
                              : "Expired Iqamas or those with 30 days or less remaining"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setNotificationsOpen(
                              false
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {iqamaNotifications.length ===
                      0 ? (
                        <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>

                          <p className="mt-3 text-sm font-black text-[#102a4c]">
                            {lang ===
                            "ar"
                              ? "لا توجد تنبيهات حاليًا"
                              : "No alerts right now"}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {lang ===
                            "ar"
                              ? "كل الإقامات المسجلة خارج نطاق التنبيه."
                              : "All recorded Iqamas are outside the alert range."}
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-[390px] overflow-y-auto">
                          {iqamaNotifications.map(
                            (
                              notification
                            ) => {
                              const urgent =
                                notification.daysRemaining <=
                                7;

                              const expired =
                                notification.daysRemaining <
                                0;

                              const important =
                                notification.daysRemaining >
                                  7 &&
                                notification.daysRemaining <=
                                  15;

                              return (
                                <Link
                                  key={
                                    notification.id
                                  }
                                  href={`/employees/${notification.id}`}
                                  onClick={() =>
                                    setNotificationsOpen(
                                      false
                                    )
                                  }
                                  className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 transition last:border-b-0 hover:bg-slate-50"
                                >
                                  <div
                                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                      expired ||
                                      urgent
                                        ? "bg-red-50 text-red-600"
                                        : important
                                          ? "bg-amber-50 text-amber-600"
                                          : "bg-blue-50 text-blue-600"
                                    }`}
                                  >
                                    {expired ||
                                    urgent ? (
                                      <AlertTriangle className="h-5 w-5" />
                                    ) : (
                                      <Clock3 className="h-5 w-5" />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="truncate text-sm font-black text-[#102a4c]">
                                        {
                                          notification.name
                                        }
                                      </p>

                                      <span
                                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                                          expired ||
                                          urgent
                                            ? "bg-red-50 text-red-700"
                                            : important
                                              ? "bg-amber-50 text-amber-700"
                                              : "bg-blue-50 text-blue-700"
                                        }`}
                                      >
                                        {formatIqamaAlertLabel(
                                          notification.daysRemaining,
                                          lang
                                        )}
                                      </span>
                                    </div>

                                    <p
                                      dir="ltr"
                                      className="mt-1 text-[11px] font-bold text-slate-400"
                                    >
                                      {
                                        notification.iqama
                                      }
                                    </p>

                                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                      {lang ===
                                      "ar"
                                        ? `تاريخ الانتهاء: ${formatIqamaDate(
                                            notification.expiryDate,
                                            lang
                                          )}`
                                        : `Expiry: ${formatIqamaDate(
                                            notification.expiryDate,
                                            lang
                                          )}`}
                                    </p>
                                  </div>
                                </Link>
                              );
                            }
                          )}
                        </div>
                      )}

                      <Link
                        href="/employees/iqama-expiry"
                        onClick={() =>
                          setNotificationsOpen(
                            false
                          )
                        }
                        className="flex h-12 items-center justify-center border-t border-slate-100 bg-slate-50 text-xs font-black text-blue-700 transition hover:bg-blue-50"
                      >
                        {lang ===
                        "ar"
                          ? "عرض جميع الإقامات"
                          : "View All Iqamas"}
                      </Link>
                    </div>
                  )}
                </div>

                {/* USER */}

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="font-bold">
                      {lang ===
                      "ar"
                        ? "المدير العام"
                        : "General Manager"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {lang ===
                      "ar"
                        ? "مدير النظام"
                        : "System Manager"}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* CONTENT */}

            {children}
          </section>
        </div>
      </main>
    </LanguageContext.Provider>
  );
}

/* =========================================================
   IQAMA ALERT LABEL
========================================================= */

function formatIqamaAlertLabel(
  daysRemaining: number,
  lang: Lang
) {
  const isAr =
    lang === "ar";

  if (
    daysRemaining < 0
  ) {
    return isAr
      ? `منتهية منذ ${Math.abs(
          daysRemaining
        )} يوم`
      : `Expired ${Math.abs(
          daysRemaining
        )}d ago`;
  }

  if (
    daysRemaining === 0
  ) {
    return isAr
      ? "تنتهي اليوم"
      : "Expires today";
  }

  return isAr
    ? `متبقي ${daysRemaining} يوم`
    : `${daysRemaining} days left`;
}

/* =========================================================
   IQAMA DATE
========================================================= */

function formatIqamaDate(
  value: string,
  lang: Lang
) {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    lang === "ar"
      ? "ar-SA"
      : "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

/* =========================================================
   DEFAULT TITLE
========================================================= */

function getDefaultTitle(
  system: SystemType,
  lang: Lang,
  t: Translation
) {
  if (
    system === "employees"
  ) {
    return (
      t.employeesSystem ||
      (lang === "ar"
        ? "نظام الموظفين"
        : "Employees System")
    );
  }

  return (
    t.dashboard ||
    (lang === "ar"
      ? "لوحة التحكم"
      : "Dashboard")
  );
}

/* =========================================================
   DEFAULT SUBTITLE
========================================================= */

function getDefaultSubtitle(
  system: SystemType,
  lang: Lang,
  t: Translation
) {
  if (
    system === "employees"
  ) {
    return (
      t.employeesDashboardSubtitle ||
      (lang === "ar"
        ? "لوحة تحكم إدارة الموظفين والمناديب"
        : "Employees and Couriers Management Dashboard")
    );
  }

  return (
    t.overview ||
    (lang === "ar"
      ? "إدارة كاملة على أداء الأسطول اليوم"
      : "Full overview of fleet performance today")
  );
}

/* =========================================================
   SECTION NAME
========================================================= */

function getSectionName(
  system: SystemType,
  lang: Lang,
  t: Translation
) {
  if (
    system === "employees"
  ) {
    return (
      t.employees ||
      (lang === "ar"
        ? "إدارة الموظفين"
        : "Employees")
    );
  }

  return (
    t.appSection ||
    (lang === "ar"
      ? "الصيانة"
      : "Maintenance")
  );
}

/* =========================================================
   MENU ITEMS
========================================================= */

function getMenuItems(
  system: SystemType,
  lang: Lang,
  t: Translation
): MenuItem[] {
  /* =======================================================
     EMPLOYEES SYSTEM
  ======================================================= */

  if (
    system === "employees"
  ) {
    return [
      /* DASHBOARD */

      {
        name:
          t.dashboard ||
          (lang ===
          "ar"
            ? "لوحة التحكم"
            : "Dashboard"),

        href:
          "/employees",

        icon: (
          <Home className="h-7 w-7" />
        ),
      },

      /* EMPLOYEES */

      {
        name:
          t.employees ||
          (lang ===
          "ar"
            ? "الموظفون"
            : "Employees"),

        href:
          "/employees/list",

        icon: (
          <Users className="h-7 w-7" />
        ),
      },

      /* IQAMA */

      {
        name:
          lang === "ar"
            ? "صلاحية الإقامات"
            : "Iqama Expiry",

        href:
          "/employees/iqama-expiry",

        icon: (
          <IdCard className="h-7 w-7" />
        ),
      },

      /* =====================================================
         OPERATIONS
      ===================================================== */

      {
        key:
          "operations",

        name:
          lang === "ar"
            ? "التشغيل"
            : "Operations",

        icon: (
          <BriefcaseBusiness className="h-7 w-7" />
        ),

        children: [
          {
            name:
              lang ===
              "ar"
                ? "متابعة الأداء"
                : "Performance",

            href:
              "/employees/performance",

            icon: (
              <ClipboardList className="h-5 w-5" />
            ),
          },

          {
            name:
              lang ===
              "ar"
                ? "التتبع المباشر"
                : "Live Tracking",

            href:
              "/employees/live-tracking",

            icon: (
              <MapPin className="h-5 w-5" />
            ),
          },

          {
            name:
              lang ===
              "ar"
                ? "شفتات المناديب"
                : "Rider Shifts",

            href:
              "/employees/shifts",

            icon: (
              <CalendarClock className="h-5 w-5" />
            ),
          },

          {
            name:
              lang ===
              "ar"
                ? "رادار نشاط المطاعم"
                : "Restaurant Activity Radar",

            href:
              "/employees/restaurant-demand",

            icon: (
              <Flame className="h-5 w-5" />
            ),
          },
{
  name:
    lang === "ar"
      ? "التواصل مع المناديب"
      : "Rider Communication",

  href:
    "/employees/communication",

  icon: (
    <MessageCircle className="h-5 w-5" />
  ),
},
          {
            name:
              lang ===
              "ar"
                ? "إدارة الكاش"
                : "Cash Management",

            href:
              "/employees/cash-management",

            icon: (
              <Wallet className="h-5 w-5" />
            ),
          },
        ],
      },

      /* NOTICES */

      {
        name:
          t.notifications ||
          (lang ===
          "ar"
            ? "الإشعارات والإنذارات"
            : "Notifications"),

        href:
          "/employees/notices",

        icon: (
          <Bell className="h-7 w-7" />
        ),
      },

      /* PAYROLL */

      {
        name:
          t.salaries ||
          (lang ===
          "ar"
            ? "الرواتب والمستحقات"
            : "Payroll"),

        href:
          "/employees/payroll",

        icon: (
          <Wallet className="h-7 w-7" />
        ),
      },

      /* REPORTS */

      {
        name:
          t.reports ||
          (lang ===
          "ar"
            ? "التقارير"
            : "Reports"),

        href:
          "/employees/reports",

        icon: (
          <FileText className="h-7 w-7" />
        ),
      },

      /* SETTINGS */

      {
        name:
          t.settings ||
          (lang ===
          "ar"
            ? "الإعدادات"
            : "Settings"),

        href:
          "/employees/settings",

        icon: (
          <Settings className="h-7 w-7" />
        ),
      },
    ];
  }

  /* =======================================================
     MAINTENANCE SYSTEM
  ======================================================= */

  return [
    {
      name:
        t.dashboard,

      href:
        "/dashboard",

      icon: (
        <Home className="h-7 w-7" />
      ),
    },

    {
      name:
        t.vehicles,

      href:
        "/cars",

      icon: (
        <Truck className="h-7 w-7" />
      ),
    },

    {
      name:
        t.maintenance,

      href:
        "/maintenance/add",

      icon: (
        <Wrench className="h-7 w-7" />
      ),
    },

    {
      name:
        t.oilChanges,

      href:
        "/oil-changes/add",

      icon: (
        <Droplets className="h-7 w-7" />
      ),
    },

    {
      name:
        t.accidents,

      href:
        "/maintenance/incidents",

      icon: (
        <Car className="h-7 w-7" />
      ),
    },

    {
      name:
        lang ===
        "ar"
          ? "الفحص الدوري"
          : "Periodic Inspection",

      href:
        "/inspections",

      icon: (
        <ClipboardList className="h-7 w-7" />
      ),
    },
  ];
}