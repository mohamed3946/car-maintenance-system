"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AppLayout, {
  useLanguage,
} from "../../components/AppLayout";

import { supabase } from "../lib/supabase";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  Flame,
  IdCard,
  MapPin,
  PackageCheck,
  Radio,
  RefreshCw,
  ShieldAlert,
  Target,
  TrendingDown,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Lang = "ar" | "en";

type EmployeeRow = {
  id: string;
  name: string | null;
  iqama: string | null;
  iqama_expiry_date: string | null;
  phone: string | null;
  nationality: string | null;
  job_title: string | null;
  work_location: string | null;
  status: string | null;
  performance: string | null;

  platform_id: string | null;
  hunger_id: string | null;
  keeta_id: string | null;

  created_at: string | null;
};

type PerformanceOrderRow = {
  rider_platform_id: string | null;
  orders: number | null;
  platform: string | null;
  report_month: string | null;
};

type HungerDailyPerformanceRow = {
  rider_platform_id: string | null;
  work_date: string | null;
  completed_deliveries: number | null;
  report_month: string | null;
};

type RankedRider = {
  id: string;
  employeeId: string | null;
  name: string;
  platform: string;
  orders: number;
};

type AlertItem = {
  id: string;
  type:
    | "iqama"
    | "noOrders"
    | "stopped"
    | "vacation";

  title: string;
  subtitle: string;
  href: string;

  tone:
    | "red"
    | "amber"
    | "blue"
    | "slate";
};

/* =========================================================
   PAGE
========================================================= */

export default function EmployeesPage() {
  return (
    <AppLayout system="employees">
      <EmployeesDashboardContent />
    </AppLayout>
  );
}

/* =========================================================
   CONTENT
========================================================= */

function EmployeesDashboardContent() {
  const { lang } =
    useLanguage();

  const isAr =
    lang === "ar";

  const [employees, setEmployees] =
    useState<EmployeeRow[]>([]);

  const [
    performanceOrders,
    setPerformanceOrders,
  ] =
    useState<
      PerformanceOrderRow[]
    >([]);

  const [
    dailyPerformance,
    setDailyPerformance,
  ] =
    useState<
      HungerDailyPerformanceRow[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* =========================================================
     TEXT
  ========================================================= */

  const text = {
    title: isAr
      ? "مركز تشغيل الموظفين"
      : "Employees Operations Center",

    subtitle: isAr
      ? "ملخص حي لحالة الموظفين والمناديب والأداء والتنبيهات التشغيلية."
      : "Live overview of employees, riders, performance and operational alerts.",

    quickActions: isAr
      ? "إجراءات سريعة"
      : "Quick Actions",

    employees: isAr
      ? "الموظفون"
      : "Employees",

    performance: isAr
      ? "متابعة الأداء"
      : "Performance",

    tracking: isAr
      ? "التتبع المباشر"
      : "Live Tracking",

    shifts: isAr
      ? "شفتات المناديب"
      : "Rider Shifts",

    cash: isAr
      ? "إدارة الكاش"
      : "Cash Management",

    totalEmployees: isAr
      ? "إجمالي الموظفين"
      : "Total Employees",

    activeCouriers: isAr
      ? "المناديب النشطون"
      : "Active Riders",

    workingLatestDay: isAr
      ? "عملوا بآخر يوم"
      : "Worked Latest Day",

    noOrdersLatestDay: isAr
      ? "بدون طلبات بآخر يوم"
      : "No Orders Latest Day",

    iqamaAlerts: isAr
      ? "إقامات تحتاج إجراء"
      : "Iqama Alerts",

    outOfService: isAr
      ? "خارج الخدمة"
      : "Out of Service",

    operationToday: isAr
      ? "ملخص التشغيل"
      : "Operations Summary",

    monthlyPerformance: isAr
      ? "أداء الشهر"
      : "Monthly Performance",

    platformDistribution: isAr
      ? "توزيع المناديب"
      : "Rider Distribution",

    totalOrders: isAr
      ? "إجمالي الطلبات"
      : "Total Orders",

    avgOrders: isAr
      ? "متوسط الطلبات"
      : "Average Orders",

    countedRiders: isAr
      ? "المناديب المحتسبون"
      : "Counted Riders",

    targetAchievement: isAr
      ? "نسبة تحقيق التارجت"
      : "Target Achievement",

    latestReport: isAr
      ? "آخر تقرير"
      : "Latest Report",

    hunger: "HungerStation",

    keeta: "Keeta",

    both: isAr
      ? "المنصتان"
      : "Both Platforms",

    management: isAr
      ? "الإدارة"
      : "Management",

    maintenance: isAr
      ? "الصيانة"
      : "Maintenance",

    alertsTitle: isAr
      ? "يحتاج تدخل"
      : "Needs Attention",

    alertsSubtitle: isAr
      ? "أهم الحالات التي تحتاج متابعة الآن."
      : "Important items requiring attention now.",

    noAlerts: isAr
      ? "لا توجد تنبيهات تشغيلية مهمة حاليًا"
      : "No important operational alerts right now",

    topRiders: isAr
      ? "أفضل المناديب"
      : "Top Riders",

    bottomRiders: isAr
      ? "أقل المناديب"
      : "Lowest Riders",

    orders: isAr
      ? "طلب"
      : "orders",

    latestEmployees: isAr
      ? "أحدث الموظفين"
      : "Recently Added",

    employee: isAr
      ? "الموظف"
      : "Employee",

    job: isAr
      ? "المسمى"
      : "Job Title",

    location: isAr
      ? "موقع العمل"
      : "Work Location",

    status: isAr
      ? "الحالة"
      : "Status",

    added: isAr
      ? "تاريخ الإضافة"
      : "Added",

    viewAll: isAr
      ? "عرض الكل"
      : "View All",

    loading: isAr
      ? "جاري تحديث لوحة التشغيل..."
      : "Updating operations dashboard...",

    retry: isAr
      ? "إعادة المحاولة"
      : "Retry",
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setErrorMessage("");

    await Promise.all([
      loadEmployees(),
      loadPerformanceOrders(),
      loadDailyPerformance(),
    ]);

    setLoading(false);
  }

  async function refreshAll() {
    setRefreshing(true);

    await Promise.all([
      loadEmployees(),
      loadPerformanceOrders(),
      loadDailyPerformance(),
    ]);

    setRefreshing(false);
  }

  /* =========================================================
     LOAD EMPLOYEES
  ========================================================= */

  async function loadEmployees() {
    const { data, error } =
      await supabase
        .from("employees")
        .select(`
          id,
          name,
          iqama,
          iqama_expiry_date,
          phone,
          nationality,
          job_title,
          work_location,
          status,
          performance,
          platform_id,
          hunger_id,
          keeta_id,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "EMPLOYEES DASHBOARD ERROR:",
        error
      );

      setEmployees([]);

      setErrorMessage(
        isAr
          ? "تعذر تحميل بيانات الموظفين."
          : "Could not load employee data."
      );

      return;
    }

    setEmployees(
      (data || []) as EmployeeRow[]
    );
  }

  /* =========================================================
     LOAD MONTHLY PERFORMANCE
     آخر شهر متاح بدل إجبار الشهر الحالي
  ========================================================= */

  async function loadPerformanceOrders() {
    const { data, error } =
      await supabase
        .from(
          "performance_records"
        )
        .select(
          "rider_platform_id,orders,platform,report_month"
        )
        .order("report_month", {
          ascending: false,
        })
        .limit(5000);

    if (error) {
      console.error(
        "PERFORMANCE ERROR:",
        error
      );

      setPerformanceOrders([]);

      return;
    }

    const rows =
      (data ||
        []) as PerformanceOrderRow[];

    const latestMonth =
      rows
        .map(
          (row) =>
            row.report_month
        )
        .filter(
          Boolean
        )
        .sort()
        .reverse()[0] ||
      null;

    if (!latestMonth) {
      setPerformanceOrders([]);
      return;
    }

    setPerformanceOrders(
      rows.filter(
        (row) =>
          row.report_month ===
          latestMonth
      )
    );
  }

  /* =========================================================
     LOAD DAILY PERFORMANCE
  ========================================================= */

  async function loadDailyPerformance() {
    const { data, error } =
      await supabase
        .from(
          "hunger_daily_performance"
        )
        .select(`
          rider_platform_id,
          work_date,
          completed_deliveries,
          report_month
        `)
        .order("work_date", {
          ascending: false,
        })
        .limit(5000);

    if (error) {
      console.error(
        "DAILY PERFORMANCE ERROR:",
        error
      );

      setDailyPerformance([]);

      return;
    }

    const rows =
      (data ||
        []) as HungerDailyPerformanceRow[];

    const latestMonth =
      rows
        .map(
          (row) =>
            row.report_month
        )
        .filter(Boolean)
        .sort()
        .reverse()[0] ||
      null;

    if (!latestMonth) {
      setDailyPerformance([]);
      return;
    }

    setDailyPerformance(
      rows.filter(
        (row) =>
          row.report_month ===
          latestMonth
      )
    );
  }

  /* =========================================================
     NORMALIZED EMPLOYEES
  ========================================================= */

  const normalizedEmployees =
    useMemo(
      () =>
        employees.map(
          (employee) => ({
            ...employee,

            normalizedStatus:
              normalizeStatus(
                employee.status
              ),
          })
        ),
      [employees]
    );

  /* =========================================================
     EMPLOYEE ID MAP
     platform id -> employee
  ========================================================= */

  const employeeByPlatformId =
    useMemo(() => {
      const map =
        new Map<
          string,
          EmployeeRow
        >();

      employees.forEach(
        (employee) => {
          const ids = [
            employee.platform_id,
            employee.hunger_id,
            employee.keeta_id,
          ]
            .map((id) =>
              String(
                id || ""
              ).trim()
            )
            .filter(Boolean);

          ids.forEach((id) => {
            map.set(
              id,
              employee
            );
          });
        }
      );

      return map;
    }, [employees]);

  /* =========================================================
     ACTIVE DELIVERY RIDERS
  ========================================================= */

  const activeRiders =
    useMemo(
      () =>
        normalizedEmployees.filter(
          (employee) =>
            employee.normalizedStatus ===
              "active" &&
            isDeliveryCourier(
              employee.job_title
            )
        ),
      [normalizedEmployees]
    );

  /* =========================================================
     BASIC STATS
  ========================================================= */

  const stats = useMemo(() => {
    const outOfService =
      normalizedEmployees.filter(
        (employee) =>
          employee.normalizedStatus ===
          "outOfService"
      ).length;

    const iqamaAlerts =
      normalizedEmployees.filter(
        (employee) => {
          if (
            employee.normalizedStatus ===
            "outOfService"
          ) {
            return false;
          }

          const days =
            getDaysRemaining(
              employee.iqama_expiry_date
            );

          return (
            days !== null &&
            days <= 30
          );
        }
      ).length;

    return {
      total:
        normalizedEmployees.length,

      activeRiders:
        activeRiders.length,

      outOfService,

      iqamaAlerts,
    };
  }, [
    normalizedEmployees,
    activeRiders,
  ]);

  /* =========================================================
     LATEST DAILY REPORT
  ========================================================= */

  const latestDailyDate =
    useMemo(() => {
      return (
        dailyPerformance
          .map(
            (row) =>
              row.work_date
          )
          .filter(Boolean)
          .sort()
          .reverse()[0] ||
        null
      );
    }, [dailyPerformance]);

  const latestDailyRows =
    useMemo(() => {
      if (!latestDailyDate) {
        return [];
      }

      return dailyPerformance.filter(
        (row) =>
          row.work_date ===
          latestDailyDate
      );
    }, [
      dailyPerformance,
      latestDailyDate,
    ]);

  /* =========================================================
     ACTIVE HUNGER IDS
  ========================================================= */

  const activeHungerIds =
    useMemo(() => {
      return new Set(
        activeRiders
          .filter(
            (employee) =>
              hasHunger(
                employee.work_location
              )
          )
          .map(
            (employee) =>
              String(
                employee.hunger_id ||
                  employee.platform_id ||
                  ""
              ).trim()
          )
          .filter(Boolean)
      );
    }, [activeRiders]);

  /* =========================================================
     DAILY SUMMARY
  ========================================================= */

  const dailySummary =
    useMemo(() => {
      if (
        latestDailyRows.length ===
        0
      ) {
        return {
          workingRiders: 0,
          noOrders: 0,
          totalOrders: 0,
          average: 0,
        };
      }

      const ordersByRider =
        new Map<
          string,
          number
        >();

      latestDailyRows.forEach(
        (row) => {
          const id =
            String(
              row.rider_platform_id ||
                ""
            ).trim();

          if (!id) return;

          const current =
            ordersByRider.get(id) ||
            0;

          ordersByRider.set(
            id,
            current +
              Number(
                row.completed_deliveries ||
                  0
              )
          );
        }
      );

      const idsToUse =
        activeHungerIds.size >
        0
          ? Array.from(
              activeHungerIds
            )
          : Array.from(
              ordersByRider.keys()
            );

      const workingRiders =
        idsToUse.filter(
          (id) =>
            (ordersByRider.get(
              id
            ) || 0) > 0
        ).length;

      const noOrders =
        idsToUse.filter(
          (id) =>
            (ordersByRider.get(
              id
            ) || 0) === 0
        ).length;

      const totalOrders =
        idsToUse.reduce(
          (sum, id) =>
            sum +
            (ordersByRider.get(
              id
            ) || 0),
          0
        );

      const average =
        workingRiders > 0
          ? totalOrders /
            workingRiders
          : 0;

      return {
        workingRiders,
        noOrders,
        totalOrders,
        average,
      };
    }, [
      latestDailyRows,
      activeHungerIds,
    ]);

  /* =========================================================
     MONTHLY TARGET SUMMARY
  ========================================================= */

  const performanceSummary =
    useMemo(() => {
      const MONTHLY_TARGET =
        450;

      const validRows =
        dailyPerformance.filter(
          (row) =>
            row.work_date &&
            row.rider_platform_id
        );

      if (
        validRows.length === 0
      ) {
        return {
          percentage: 0,
          riderCount: 0,
          totalOrders: 0,
          expectedTarget: 0,
          latestDate:
            null as string | null,
        };
      }

      const latestDate =
        validRows
          .map(
            (row) =>
              String(
                row.work_date
              )
          )
          .sort()
          .reverse()[0];

      const date =
        new Date(
          `${latestDate}T00:00:00`
        );

      const coveredDays =
        Number.isNaN(
          date.getTime()
        )
          ? 0
          : date.getDate();

      const daysInMonth =
        Number.isNaN(
          date.getTime()
        )
          ? 30
          : new Date(
              date.getFullYear(),
              date.getMonth() +
                1,
              0
            ).getDate();

      const reportIds =
        new Set(
          validRows
            .map(
              (row) =>
                String(
                  row.rider_platform_id ||
                    ""
                ).trim()
            )
            .filter(Boolean)
        );

      const riderIds =
        activeHungerIds.size >
        0
          ? activeHungerIds
          : reportIds;

      const totalOrders =
        validRows.reduce(
          (sum, row) => {
            const riderId =
              String(
                row.rider_platform_id ||
                  ""
              ).trim();

            if (
              !riderIds.has(
                riderId
              )
            ) {
              return sum;
            }

            return (
              sum +
              Number(
                row.completed_deliveries ||
                  0
              )
            );
          },
          0
        );

      const riderCount =
        riderIds.size;

      const targetPerRider =
        daysInMonth > 0
          ? (MONTHLY_TARGET /
              daysInMonth) *
            coveredDays
          : 0;

      const expectedTarget =
        targetPerRider *
        riderCount;

      const percentage =
        expectedTarget > 0
          ? Math.round(
              (totalOrders /
                expectedTarget) *
                100
            )
          : 0;

      return {
        percentage:
          Math.max(
            0,
            percentage
          ),

        riderCount,

        totalOrders,

        expectedTarget,

        latestDate,
      };
    }, [
      dailyPerformance,
      activeHungerIds,
    ]);

  /* =========================================================
     PLATFORM DISTRIBUTION
  ========================================================= */

  const platformStats =
    useMemo(() => {
      let hunger = 0;
      let keeta = 0;
      let both = 0;

      activeRiders.forEach(
        (employee) => {
          const location =
            normalizeLocation(
              employee.work_location
            );

          if (
            location ===
            "both"
          ) {
            both++;
          } else if (
            location ===
            "hunger"
          ) {
            hunger++;
          } else if (
            location ===
            "keeta"
          ) {
            keeta++;
          }
        }
      );

      const management =
        normalizedEmployees.filter(
          (employee) =>
            isManagement(
              employee.work_location
            )
        ).length;

      const maintenance =
        normalizedEmployees.filter(
          (employee) =>
            isMaintenance(
              employee.work_location
            )
        ).length;

      return {
        hunger,
        keeta,
        both,
        management,
        maintenance,
      };
    }, [
      activeRiders,
      normalizedEmployees,
    ]);

  /* =========================================================
     MONTHLY RIDER RANKING
  ========================================================= */

  const rankedRiders =
    useMemo(() => {
      const map =
        new Map<
          string,
          {
            orders: number;
            platform: string;
          }
        >();

      performanceOrders.forEach(
        (row) => {
          const id =
            String(
              row.rider_platform_id ||
                ""
            ).trim();

          if (!id) return;

          const current =
            map.get(id) || {
              orders: 0,
              platform:
                row.platform ||
                "-",
            };

          current.orders +=
            Number(
              row.orders || 0
            );

          if (row.platform) {
            current.platform =
              row.platform;
          }

          map.set(
            id,
            current
          );
        }
      );

      return Array.from(
        map.entries()
      )
        .map(
          ([
            platformId,
            data,
          ]) => {
            const employee =
              employeeByPlatformId.get(
                platformId
              );

            return {
              id: platformId,

              employeeId:
                employee?.id ||
                null,

              name:
                employee?.name ||
                platformId,

              platform:
                platformDisplay(
                  data.platform
                ),

              orders:
                data.orders,
            } satisfies RankedRider;
          }
        )
        .sort(
          (a, b) =>
            b.orders -
            a.orders
        );
    }, [
      performanceOrders,
      employeeByPlatformId,
    ]);

  const topRiders =
    rankedRiders.slice(0, 5);

  const bottomRiders =
    [...rankedRiders]
      .filter(
        (rider) =>
          rider.orders >= 0
      )
      .sort(
        (a, b) =>
          a.orders -
          b.orders
      )
      .slice(0, 5);

  /* =========================================================
     ALERTS
  ========================================================= */

  const alerts =
    useMemo(() => {
      const items: AlertItem[] =
        [];

      /* IQAMA ALERTS */

      normalizedEmployees.forEach(
        (employee) => {
          if (
            employee.normalizedStatus ===
            "outOfService"
          ) {
            return;
          }

          const days =
            getDaysRemaining(
              employee.iqama_expiry_date
            );

          if (
            days === null ||
            days > 30
          ) {
            return;
          }

          const name =
            employee.name ||
            "-";

          items.push({
            id:
              "iqama-" +
              employee.id,

            type:
              "iqama",

            title:
              days < 0
                ? isAr
                  ? `إقامة ${name} منتهية`
                  : `${name}'s Iqama expired`
                : isAr
                  ? `إقامة ${name} تحتاج متابعة`
                  : `${name}'s Iqama needs attention`,

            subtitle:
              days < 0
                ? isAr
                  ? `منتهية منذ ${Math.abs(
                      days
                    )} يوم`
                  : `Expired ${Math.abs(
                      days
                    )} days ago`
                : isAr
                  ? `متبقي ${days} يوم`
                  : `${days} days remaining`,

            href:
              "/employees/iqama-expiry",

            tone:
              days <= 7
                ? "red"
                : "amber",
          });
        }
      );

      /* NO ORDERS */

      if (
        latestDailyDate
      ) {
        const ordersMap =
          new Map<
            string,
            number
          >();

        latestDailyRows.forEach(
          (row) => {
            const id =
              String(
                row.rider_platform_id ||
                  ""
              ).trim();

            if (!id) return;

            ordersMap.set(
              id,
              (ordersMap.get(
                id
              ) || 0) +
                Number(
                  row.completed_deliveries ||
                    0
                )
            );
          }
        );

        activeRiders
          .filter((employee) =>
            hasHunger(
              employee.work_location
            )
          )
          .forEach(
            (employee) => {
              const id =
                String(
                  employee.hunger_id ||
                    employee.platform_id ||
                    ""
                ).trim();

              if (!id) return;

              if (
                (ordersMap.get(
                  id
                ) || 0) > 0
              ) {
                return;
              }

              items.push({
                id:
                  "no-orders-" +
                  employee.id,

                type:
                  "noOrders",

                title:
                  employee.name ||
                  id,

                subtitle:
                  isAr
                    ? "لم يسجل طلبات في آخر يوم بالتقرير"
                    : "No orders on latest report day",

                href:
                  "/employees/performance",

                tone:
                  "blue",
              });
            }
          );
      }

      return items
        .sort(
          (a, b) => {
            const weight = {
              red: 1,
              amber: 2,
              blue: 3,
              slate: 4,
            };

            return (
              weight[a.tone] -
              weight[b.tone]
            );
          }
        )
        .slice(0, 8);
    }, [
      normalizedEmployees,
      activeRiders,
      latestDailyDate,
      latestDailyRows,
      isAr,
    ]);

  /* =========================================================
     LATEST EMPLOYEES
  ========================================================= */

  const latestEmployees =
    employees.slice(0, 6);

  const ArrowIcon =
    isAr
      ? ArrowLeft
      : ArrowRight;

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    errorMessage &&
    employees.length === 0
  ) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-8">
        <p className="font-black text-red-700">
          {errorMessage}
        </p>

        <button
          onClick={
            loadAll
          }
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white"
        >
          {text.retry}
        </button>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      dir={
        isAr
          ? "rtl"
          : "ltr"
      }
      className="space-y-5 pb-10"
    >
      {/* =====================================================
          HERO HEADER
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-l from-[#092e55] via-[#0c3a69] to-[#0f4b82] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -start-20 -top-28 h-72 w-72 rounded-full bg-blue-400/10" />

        <div className="pointer-events-none absolute -bottom-36 end-12 h-64 w-64 rounded-full bg-cyan-300/10" />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>

              <span className="text-xs font-black text-cyan-200">
                {isAr
                  ? "LIVE OPERATIONS"
                  : "LIVE OPERATIONS"}
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              {text.title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
              {text.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {loading ||
            refreshing ? (
              <span className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white">
                {text.loading}
              </span>
            ) : null}

            <button
              type="button"
              onClick={
                refreshAll
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#0f3b68] shadow-sm transition hover:bg-blue-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {isAr
                ? "تحديث"
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="relative z-10 mt-7">
          <p className="mb-3 text-xs font-black text-blue-200">
            {text.quickActions}
          </p>

          <div className="flex flex-wrap gap-2">
            <QuickAction
              href="/employees/list"
              label={
                text.employees
              }
              icon={
                <Users className="h-4 w-4" />
              }
            />

            <QuickAction
              href="/employees/performance"
              label={
                text.performance
              }
              icon={
                <Target className="h-4 w-4" />
              }
            />

            <QuickAction
              href="/employees/live-tracking"
              label={
                text.tracking
              }
              icon={
                <Radio className="h-4 w-4" />
              }
            />

            <QuickAction
              href="/employees/shifts"
              label={
                text.shifts
              }
              icon={
                <CalendarClock className="h-4 w-4" />
              }
            />

            <QuickAction
              href="/employees/cash-management"
              label={text.cash}
              icon={
                <WalletCards className="h-4 w-4" />
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        <KpiCard
          title={
            text.totalEmployees
          }
          value={stats.total}
          subtitle={
            isAr
              ? "المسجلون بالنظام"
              : "Registered"
          }
          icon={
            <Users className="h-5 w-5" />
          }
          tone="blue"
        />

        <KpiCard
          title={
            text.activeCouriers
          }
          value={
            stats.activeRiders
          }
          subtitle={
            isAr
              ? "مناديب توصيل فقط"
              : "Delivery riders only"
          }
          icon={
            <UserCheck className="h-5 w-5" />
          }
          tone="green"
        />

        <KpiCard
          title={
            text.workingLatestDay
          }
          value={
            dailySummary.workingRiders
          }
          subtitle={
            latestDailyDate
              ? formatSimpleDate(
                  latestDailyDate,
                  lang
                )
              : "-"
          }
          icon={
            <PackageCheck className="h-5 w-5" />
          }
          tone="cyan"
        />

        <KpiCard
          title={
            text.noOrdersLatestDay
          }
          value={
            dailySummary.noOrders
          }
          subtitle={
            isAr
              ? "يحتاج متابعة"
              : "Needs follow-up"
          }
          icon={
            <CircleAlert className="h-5 w-5" />
          }
          tone="amber"
        />

        <KpiCard
          title={
            text.iqamaAlerts
          }
          value={
            stats.iqamaAlerts
          }
          subtitle={
            isAr
              ? "30 يوم أو أقل"
              : "30 days or less"
          }
          icon={
            <IdCard className="h-5 w-5" />
          }
          tone="red"
        />

        <KpiCard
          title={
            text.outOfService
          }
          value={
            stats.outOfService
          }
          subtitle={
            isAr
              ? "لا يدخلون بالتشغيل"
              : "Excluded from operations"
          }
          icon={
            <ShieldAlert className="h-5 w-5" />
          }
          tone="slate"
        />
      </section>

      {/* =====================================================
          OPERATIONS ROW
      ===================================================== */}

      <section className="grid gap-4 xl:grid-cols-3">
        {/* TODAY */}

        <DashboardCard>
          <CardHeader
            title={
              text.operationToday
            }
            subtitle={
              latestDailyDate
                ? `${text.latestReport}: ${formatSimpleDate(
                    latestDailyDate,
                    lang
                  )}`
                : isAr
                  ? "لا يوجد تقرير يومي"
                  : "No daily report"
            }
            icon={
              <Activity className="h-5 w-5 text-emerald-600" />
            }
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniMetric
              title={
                text.totalOrders
              }
              value={Math.round(
                dailySummary.totalOrders
              ).toLocaleString(
                "en-US"
              )}
            />

            <MiniMetric
              title={
                text.avgOrders
              }
              value={dailySummary.average.toFixed(
                1
              )}
            />

            <MiniMetric
              title={
                isAr
                  ? "مناديب عملوا"
                  : "Riders Worked"
              }
              value={
                dailySummary.workingRiders
              }
            />

            <MiniMetric
              title={
                isAr
                  ? "بدون طلبات"
                  : "No Orders"
              }
              value={
                dailySummary.noOrders
              }
              danger={
                dailySummary.noOrders >
                0
              }
            />
          </div>

          <Link
            href="/employees/performance"
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
          >
            {text.performance}

            <ArrowIcon className="h-4 w-4" />
          </Link>
        </DashboardCard>

        {/* MONTH */}

        <DashboardCard>
          <CardHeader
            title={
              text.monthlyPerformance
            }
            subtitle={
              performanceSummary.latestDate
                ? `${text.latestReport}: ${formatSimpleDate(
                    performanceSummary.latestDate,
                    lang
                  )}`
                : "-"
            }
            icon={
              <Target className="h-5 w-5 text-blue-600" />
            }
          />

          <div className="mt-5 flex items-center gap-5">
            <ProgressRing
              percentage={
                performanceSummary.percentage
              }
            />

            <div className="min-w-0 flex-1 space-y-3">
              <SmallRow
                label={
                  text.totalOrders
                }
                value={Math.round(
                  performanceSummary.totalOrders
                ).toLocaleString(
                  "en-US"
                )}
              />

              <SmallRow
                label={
                  isAr
                    ? "التارجت حتى الآن"
                    : "Target To Date"
                }
                value={Math.round(
                  performanceSummary.expectedTarget
                ).toLocaleString(
                  "en-US"
                )}
              />

              <SmallRow
                label={
                  text.countedRiders
                }
                value={
                  performanceSummary.riderCount
                }
              />
            </div>
          </div>
        </DashboardCard>

        {/* DISTRIBUTION */}

        <DashboardCard>
          <CardHeader
            title={
              text.platformDistribution
            }
            subtitle={
              isAr
                ? "المناديب النشطون حسب المنصة"
                : "Active riders by platform"
            }
            icon={
              <BriefcaseBusiness className="h-5 w-5 text-violet-600" />
            }
          />

          <div className="mt-5 space-y-2">
            <DistributionRow
              label={
                text.hunger
              }
              value={
                platformStats.hunger
              }
              tone="green"
            />

            <DistributionRow
              label={text.keeta}
              value={
                platformStats.keeta
              }
              tone="purple"
            />

            <DistributionRow
              label={text.both}
              value={
                platformStats.both
              }
              tone="blue"
            />

            <DistributionRow
              label={
                text.management
              }
              value={
                platformStats.management
              }
              tone="slate"
            />

            <DistributionRow
              label={
                text.maintenance
              }
              value={
                platformStats.maintenance
              }
              tone="amber"
            />
          </div>
        </DashboardCard>
      </section>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <BellRing className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-[#102a4c]">
                  {
                    text.alertsTitle
                  }
                </h2>

                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  {
                    text.alertsSubtitle
                  }
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
            {alerts.length}
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-6 text-center text-sm font-bold text-emerald-700">
            {text.noAlerts}
          </div>
        ) : (
          <div className="mt-5 grid gap-2 lg:grid-cols-2">
            {alerts.map(
              (alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  isAr={isAr}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          TOP / BOTTOM RIDERS
      ===================================================== */}

      <section className="grid gap-4 xl:grid-cols-2">
        <RiderRankingCard
          title={
            text.topRiders
          }
          subtitle={
            isAr
              ? "حسب إجمالي الطلبات في آخر تقرير شهري"
              : "By orders in latest monthly report"
          }
          riders={topRiders}
          icon={
            <Trophy className="h-5 w-5 text-amber-500" />
          }
          emptyText={
            isAr
              ? "لا توجد بيانات أداء"
              : "No performance data"
          }
          isAr={isAr}
        />

        <RiderRankingCard
          title={
            text.bottomRiders
          }
          subtitle={
            isAr
              ? "الأقل في عدد الطلبات ويحتاجون متابعة"
              : "Lowest order counts requiring follow-up"
          }
          riders={
            bottomRiders
          }
          icon={
            <TrendingDown className="h-5 w-5 text-red-500" />
          }
          emptyText={
            isAr
              ? "لا توجد بيانات أداء"
              : "No performance data"
          }
          isAr={isAr}
        />
      </section>

      {/* =====================================================
          EMPLOYEE STATUS + LATEST EMPLOYEES
      ===================================================== */}

      <section className="grid gap-4 xl:grid-cols-3">
        <DashboardCard>
          <CardHeader
            title={
              isAr
                ? "حالة الموظفين"
                : "Employees Status"
            }
            subtitle={
              isAr
                ? "التوزيع الحالي لكل الحالات"
                : "Current status distribution"
            }
            icon={
              <Users className="h-5 w-5 text-blue-600" />
            }
          />

          <div className="mt-5 space-y-4">
            <StatusBar
              title={
                isAr
                  ? "نشط"
                  : "Active"
              }
              value={
                normalizedEmployees.filter(
                  (e) =>
                    e.normalizedStatus ===
                    "active"
                ).length
              }
              total={
                stats.total
              }
              color="bg-emerald-500"
            />

            <StatusBar
              title={
                isAr
                  ? "موقوف"
                  : "Stopped"
              }
              value={
                normalizedEmployees.filter(
                  (e) =>
                    e.normalizedStatus ===
                    "stopped"
                ).length
              }
              total={
                stats.total
              }
              color="bg-red-500"
            />

            <StatusBar
              title={
                isAr
                  ? "إجازة"
                  : "Vacation"
              }
              value={
                normalizedEmployees.filter(
                  (e) =>
                    e.normalizedStatus ===
                    "vacation"
                ).length
              }
              total={
                stats.total
              }
              color="bg-amber-500"
            />

            <StatusBar
              title={
                text.outOfService
              }
              value={
                stats.outOfService
              }
              total={
                stats.total
              }
              color="bg-slate-500"
            />
          </div>
        </DashboardCard>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#102a4c]">
                {
                  text.latestEmployees
                }
              </h2>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                {isAr
                  ? "آخر الموظفين الذين تمت إضافتهم للنظام"
                  : "Most recently added employees"}
              </p>
            </div>

            <Link
              href="/employees/list"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
            >
              {text.viewAll}

              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3 text-start text-xs font-black">
                    {text.employee}
                  </th>

                  <th className="p-3 text-start text-xs font-black">
                    {text.job}
                  </th>

                  <th className="p-3 text-start text-xs font-black">
                    {text.location}
                  </th>

                  <th className="p-3 text-start text-xs font-black">
                    {text.status}
                  </th>

                  <th className="p-3 text-start text-xs font-black">
                    {text.added}
                  </th>
                </tr>
              </thead>

              <tbody>
                {latestEmployees.map(
                  (employee) => (
                    <tr
                      key={
                        employee.id
                      }
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="p-3">
                        <Link
                          href={`/employees/${employee.id}`}
                          className="font-black text-[#102a4c] hover:text-blue-700"
                        >
                          {employee.name ||
                            "-"}
                        </Link>
                      </td>

                      <td className="p-3 font-bold text-slate-600">
                        {jobTitleText(
                          employee.job_title ||
                            "",
                          lang
                        )}
                      </td>

                      <td className="p-3 font-bold text-slate-600">
                        {workLocationText(
                          employee.work_location ||
                            "",
                          lang
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(
                            employee.status ||
                              ""
                          )}`}
                        >
                          {statusText(
                            employee.status ||
                              "",
                            lang
                          )}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-slate-500">
                        {formatDate(
                          employee.created_at,
                          lang
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-black text-white backdrop-blur-sm transition hover:bg-white/20"
    >
      {icon}

      {label}
    </Link>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value:
    | number
    | string;
  subtitle: string;
  icon: React.ReactNode;

  tone:
    | "blue"
    | "green"
    | "cyan"
    | "amber"
    | "red"
    | "slate";
}) {
  const tones = {
    blue: {
      icon:
        "bg-blue-50 text-blue-600",
      value:
        "text-blue-700",
    },

    green: {
      icon:
        "bg-emerald-50 text-emerald-600",
      value:
        "text-emerald-700",
    },

    cyan: {
      icon:
        "bg-cyan-50 text-cyan-600",
      value:
        "text-cyan-700",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      value:
        "text-amber-700",
    },

    red: {
      icon:
        "bg-red-50 text-red-600",
      value:
        "text-red-700",
    },

    slate: {
      icon:
        "bg-slate-100 text-slate-600",
      value:
        "text-slate-700",
    },
  };

  const current =
    tones[tone];

  return (
    <div className="group rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-black ${current.value}`}
          >
            {value}
          </p>

          <p className="mt-1 text-[10px] font-bold text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${current.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function DashboardCard({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-black text-[#102a4c]">
          {title}
        </h3>

        <p className="mt-1 text-xs font-semibold text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
        {icon}
      </div>
    </div>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({
  title,
  value,
  danger = false,
}: {
  title: string;
  value:
    | number
    | string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        danger
          ? "border-red-100 bg-red-50"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <p className="text-[10px] font-black text-slate-500">
        {title}
      </p>

      <p
        className={`mt-1 text-xl font-black ${
          danger
            ? "text-red-700"
            : "text-[#102a4c]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PROGRESS RING
========================================================= */

function ProgressRing({
  percentage,
}: {
  percentage: number;
}) {
  const visual =
    Math.min(
      percentage,
      100
    );

  return (
    <div
      className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#2563eb ${visual}%, #e7edf5 ${visual}% 100%)`,
      }}
    >
      <div className="flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full bg-white">
        <span className="text-2xl font-black text-[#102a4c]">
          {percentage}%
        </span>

        <span className="mt-1 text-[9px] font-bold text-slate-400">
          Target
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL ROW
========================================================= */

function SmallRow({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-bold text-slate-500">
        {label}
      </span>

      <span className="text-sm font-black text-[#102a4c]">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   DISTRIBUTION
========================================================= */

function DistributionRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;

  tone:
    | "green"
    | "purple"
    | "blue"
    | "slate"
    | "amber";
}) {
  const colors = {
    green:
      "bg-emerald-500",

    purple:
      "bg-violet-500",

    blue:
      "bg-blue-500",

    slate:
      "bg-slate-500",

    amber:
      "bg-amber-500",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${colors[tone]}`}
        />

        <span className="text-sm font-extrabold text-slate-700">
          {label}
        </span>
      </div>

      <span className="rounded-xl bg-white px-3 py-1 text-sm font-black text-[#102a4c] shadow-sm">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   ALERT ROW
========================================================= */

function AlertRow({
  alert,
  isAr,
}: {
  alert: AlertItem;
  isAr: boolean;
}) {
  const styles = {
    red: {
      wrap:
        "border-red-100 bg-red-50",
      icon:
        "bg-red-100 text-red-600",
    },

    amber: {
      wrap:
        "border-amber-100 bg-amber-50",
      icon:
        "bg-amber-100 text-amber-600",
    },

    blue: {
      wrap:
        "border-blue-100 bg-blue-50",
      icon:
        "bg-blue-100 text-blue-600",
    },

    slate: {
      wrap:
        "border-slate-200 bg-slate-50",
      icon:
        "bg-slate-200 text-slate-600",
    },
  };

  const current =
    styles[alert.tone];

  return (
    <Link
      href={alert.href}
      className={`flex items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${current.wrap}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
      >
        {alert.type ===
        "iqama" ? (
          <IdCard className="h-5 w-5" />
        ) : (
          <CircleAlert className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-[#102a4c]">
          {alert.title}
        </p>

        <p className="mt-0.5 text-[10px] font-bold text-slate-500">
          {
            alert.subtitle
          }
        </p>
      </div>

      <ChevronRight
        className={`h-4 w-4 shrink-0 text-slate-400 ${
          isAr
            ? "rotate-180"
            : ""
        }`}
      />
    </Link>
  );
}

/* =========================================================
   RIDER RANKING
========================================================= */

function RiderRankingCard({
  title,
  subtitle,
  riders,
  icon,
  emptyText,
  isAr,
}: {
  title: string;
  subtitle: string;
  riders: RankedRider[];
  icon: React.ReactNode;
  emptyText: string;
  isAr: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-[#102a4c]">
            {title}
          </h3>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {riders.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-400">
            {emptyText}
          </div>
        ) : (
          riders.map(
            (
              rider,
              index
            ) => (
              <div
                key={
                  rider.id +
                  index
                }
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-blue-700 shadow-sm">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  {rider.employeeId ? (
                    <Link
                      href={`/employees/${rider.employeeId}`}
                      className="block truncate text-sm font-black text-[#102a4c] hover:text-blue-700"
                    >
                      {rider.name}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-black text-[#102a4c]">
                      {rider.name}
                    </p>
                  )}

                  <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                    {
                      rider.platform
                    }
                  </p>
                </div>

                <div
                  className={
                    isAr
                      ? "text-left"
                      : "text-right"
                  }
                >
                  <p className="text-lg font-black text-[#102a4c]">
                    {
                      rider.orders
                    }
                  </p>

                  <p className="text-[9px] font-bold text-slate-400">
                    {isAr
                      ? "طلب"
                      : "orders"}
                  </p>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BAR
========================================================= */

function StatusBar({
  title,
  value,
  total,
  color,
}: {
  title: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) *
            100
        )
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-black">
        <span className="text-slate-600">
          {title}
        </span>

        <span className="text-[#102a4c]">
          {value}{" "}
          <span className="text-slate-400">
            ({percentage}%)
          </span>
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(
  status: string | null
) {
  const value =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    [
      "active",
      "نشط",
    ].includes(value)
  ) {
    return "active";
  }

  if (
    [
      "stopped",
      "متوقف",
      "موقوف",
      "غير نشط",
    ].includes(value)
  ) {
    return "stopped";
  }

  if (
    [
      "vacation",
      "إجازة",
      "اجازة",
    ].includes(value)
  ) {
    return "vacation";
  }

  if (
    [
      "outofservice",
      "out_of_service",
      "out of service",
      "خارج الخدمة",
    ].includes(value)
  ) {
    return "outOfService";
  }

  return (
    value ||
    "unknown"
  );
}

function isDeliveryCourier(
  jobTitle: string | null
) {
  const value =
    String(jobTitle || "")
      .trim()
      .toLowerCase();

  return [
    "deliverycourier",
    "keetacourier",
    "hungercourier",
    "مندوب توصيل",
    "مندوب كيتا",
    "مندوب هنجرستيشن",
    "مندوب هنقرستيشن",
  ].includes(value);
}

function normalizeLocation(
  value: string | null
) {
  const location =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    location ===
      "keetaandhungerstation" ||
    location.includes(
      "both"
    ) ||
    location.includes(
      "كيتا وهنجر"
    )
  ) {
    return "both";
  }

  if (
    location.includes(
      "hunger"
    ) ||
    location.includes(
      "هنجر"
    ) ||
    location.includes(
      "هنقر"
    )
  ) {
    return "hunger";
  }

  if (
    location.includes(
      "keeta"
    ) ||
    location.includes(
      "كيتا"
    )
  ) {
    return "keeta";
  }

  return location;
}

function hasHunger(
  location: string | null
) {
  const value =
    normalizeLocation(
      location
    );

  return (
    value === "hunger" ||
    value === "both"
  );
}

function isManagement(
  location: string | null
) {
  const value =
    String(location || "")
      .trim()
      .toLowerCase();

  return (
    value ===
      "management" ||
    value ===
      "الإدارة"
  );
}

function isMaintenance(
  location: string | null
) {
  const value =
    String(location || "")
      .trim()
      .toLowerCase();

  return (
    value ===
      "maintenance" ||
    value ===
      "الصيانة"
  );
}

function getDaysRemaining(
  value: string | null
) {
  if (!value) {
    return null;
  }

  const expiry =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      expiry.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return Math.ceil(
    (expiry.getTime() -
      today.getTime()) /
      (1000 *
        60 *
        60 *
        24)
  );
}

function platformDisplay(
  value: string
) {
  const platform =
    String(value || "")
      .toLowerCase();

  if (
    platform.includes(
      "hunger"
    )
  ) {
    return "HungerStation";
  }

  if (
    platform.includes(
      "keeta"
    )
  ) {
    return "Keeta";
  }

  return (
    value || "-"
  );
}

function formatSimpleDate(
  dateValue: string,
  lang: Lang
) {
  const date =
    new Date(
      `${dateValue}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(
    lang === "ar"
      ? "ar-SA"
      : "en-GB",
    {
      day: "numeric",
      month: "short",
    }
  ).format(date);
}

function formatDate(
  dateValue:
    | string
    | null,
  lang: Lang
) {
  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    lang === "ar"
      ? "ar-SA"
      : "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function statusText(
  status: string,
  lang: Lang
) {
  const normalized =
    normalizeStatus(
      status
    );

  const map: Record<
    string,
    {
      ar: string;
      en: string;
    }
  > = {
    active: {
      ar: "نشط",
      en: "Active",
    },

    stopped: {
      ar: "موقوف",
      en: "Stopped",
    },

    vacation: {
      ar: "إجازة",
      en: "Vacation",
    },

    outOfService: {
      ar:
        "خارج الخدمة",

      en:
        "Out of Service",
    },

    unknown: {
      ar:
        "غير محدد",

      en:
        "Not Specified",
    },
  };

  return (
    map[normalized]?.[
      lang
    ] ||
    status ||
    map.unknown[lang]
  );
}

function statusClass(
  status: string
) {
  const normalized =
    normalizeStatus(
      status
    );

  if (
    normalized ===
    "active"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    normalized ===
    "stopped"
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    normalized ===
    "vacation"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    normalized ===
    "outOfService"
  ) {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-slate-100 text-slate-600";
}

function workLocationText(
  location: string,
  lang: Lang
) {
  const map: Record<
    string,
    {
      ar: string;
      en: string;
    }
  > = {
    Keeta: {
      ar: "كيتا",
      en: "Keeta",
    },

    keeta: {
      ar: "كيتا",
      en: "Keeta",
    },

    HungerStation: {
      ar:
        "هنجرستيشن",

      en:
        "HungerStation",
    },

    hungerstation: {
      ar:
        "هنجرستيشن",

      en:
        "HungerStation",
    },

    KeetaAndHungerStation:
      {
        ar:
          "كيتا وهنجرستيشن",

        en:
          "Keeta & HungerStation",
      },

    management: {
      ar: "الإدارة",
      en: "Management",
    },

    maintenance: {
      ar: "الصيانة",
      en: "Maintenance",
    },

    الإدارة: {
      ar: "الإدارة",
      en: "Management",
    },

    الصيانة: {
      ar: "الصيانة",
      en: "Maintenance",
    },
  };

  return (
    map[location]?.[
      lang
    ] ||
    location ||
    "-"
  );
}

function jobTitleText(
  jobTitle: string,
  lang: Lang
) {
  const map: Record<
    string,
    {
      ar: string;
      en: string;
    }
  > = {
    deliveryCourier: {
      ar:
        "مندوب توصيل",

      en:
        "Delivery Courier",
    },

    keetaCourier: {
      ar:
        "مندوب توصيل",

      en:
        "Delivery Courier",
    },

    hungerCourier: {
      ar:
        "مندوب توصيل",

      en:
        "Delivery Courier",
    },

    supervisor: {
      ar: "مشرف",
      en: "Supervisor",
    },

    mechanic: {
      ar:
        "ميكانيكي",

      en:
        "Mechanic",
    },

    maintenanceOfficer: {
      ar:
        "مسؤول الصيانة",

      en:
        "Maintenance Officer",
    },

    fleetManager: {
      ar:
        "مدير الأسطول",

      en:
        "Fleet Manager",
    },

    admin: {
      ar: "إداري",
      en:
        "Administrator",
    },

    "مندوب توصيل": {
      ar:
        "مندوب توصيل",

      en:
        "Delivery Courier",
    },

    "مندوب كيتا": {
      ar:
        "مندوب توصيل",

      en:
        "Delivery Courier",
    },

    "مندوب هنقرستيشن":
      {
        ar:
          "مندوب توصيل",

        en:
          "Delivery Courier",
      },

    "مندوب هنجرستيشن":
      {
        ar:
          "مندوب توصيل",

        en:
          "Delivery Courier",
      },

    مشرف: {
      ar: "مشرف",
      en:
        "Supervisor",
    },

    ميكانيكي: {
      ar:
        "ميكانيكي",

      en:
        "Mechanic",
    },
  };

  return (
    map[jobTitle]?.[
      lang
    ] ||
    jobTitle ||
    "-"
  );
}