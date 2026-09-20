"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  Activity,
  Bike,
  Clock3,
  Crosshair,
  Gauge,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Search,
  TimerOff,
  UserRound,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import MapView, {
  Marker,
  NavigationControl,
} from "react-map-gl/maplibre";

import AppLayout, {
  useLanguage,
} from "../../../components/AppLayout";

import { supabase } from "../../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type LiveLocationRow = {
  employee_id: string;
  shift_id: string | null;
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
  speed_kmh: number | null;
  heading: number | null;
  is_online: boolean;
  recorded_at: string;
  updated_at: string;

  employees?: {
    name?: string | null;
    iqama?: string | null;
    phone?: string | null;
    hunger_id?: string | null;
    keeta_id?: string | null;
    work_location?: string | null;
  } | null;

};

type DailyTrackingRow = {
  employee_id: string;
  total_distance_m: number | null;
  moving_seconds: number | null;
  stopped_seconds: number | null;
  last_location_at: string | null;
};

type ActiveShiftRow = {
  id: string;
  employee_id: string;
  start_time: string | null;
  end_time: string | null;
  platform: string | null;
  zone: string | null;
  status: string | null;
};

type RiderView = {
  employeeId: string;
  shiftId: string | null;

  name: string;
  iqama: string;
  phone: string;

  hungerId: string;
  keetaId: string;
  workLocation: string;

  latitude: number;
  longitude: number;

  accuracyM: number;
  speedKmh: number;
  heading: number;

  gpsOnlineFlag: boolean;

  recordedAt: string;
  updatedAt: string;

  platform: string;
  zone: string;

  shiftStart: string;
  shiftEnd: string;
  shiftStatus: string;

  distanceKm: number;
  movingSeconds: number;
  stoppedSeconds: number;
};

type FilterMode =
  | "all"
  | "active"
  | "inactive"
  | "moving"
  | "offline";

/* =========================================================
   MAP
========================================================= */

const DEFAULT_VIEW = {
  latitude: 24.2,
  longitude: 44.4,
  zoom: 5.3,
};

const MAP_STYLE = {
  version: 8 as const,

  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },

  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

/* =========================================================
   PAGE
========================================================= */

export default function LiveTrackingPage() {
  return (
    <AppLayout system="employees">
      <LiveTrackingContent />
    </AppLayout>
  );
}

/* =========================================================
   CONTENT
========================================================= */

function LiveTrackingContent() {
  const { lang } =
    useLanguage();

  const isAr =
    lang === "ar";

  const [
    locations,
    setLocations,
  ] =
    useState<
      LiveLocationRow[]
    >([]);

  const [
    dailyRows,
    setDailyRows,
  ] =
    useState<
      DailyTrackingRow[]
    >([]);

  const [
    activeShifts,
    setActiveShifts,
  ] =
    useState<
      ActiveShiftRow[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    selectedId,
    setSelectedId,
  ] =
    useState<
      string | null
    >(null);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<FilterMode>(
      "all"
    );

  const [
    viewState,
    setViewState,
  ] =
    useState(
      DEFAULT_VIEW
    );

  const [
    autoCentered,
    setAutoCentered,
  ] =
    useState(false);

  /* =========================================================
     LOAD
  ========================================================= */

  const loadData =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const today =
            getSaudiDateKey();

          const [
            { data: liveData, error: liveError },
            { data: dailyData, error: dailyError },
            { data: shiftData, error: shiftError },
          ] = await Promise.all([
            supabase
              .from("rider_live_locations")
              .select(`
                employee_id,
                shift_id,
                latitude,
                longitude,
                accuracy_m,
                speed_kmh,
                heading,
                is_online,
                recorded_at,
                updated_at,
                employees (
                  name,
                  iqama,
                  phone,
                  hunger_id,
                  keeta_id,
                  work_location
                )
              `)
              .order("updated_at", { ascending: false }),

            supabase
              .from("rider_daily_tracking")
              .select(`
                employee_id,
                total_distance_m,
                moving_seconds,
                stopped_seconds,
                last_location_at
              `)
              .eq("tracking_date", today),

            supabase
              .from("rider_shifts")
              .select("id,employee_id,start_time,end_time,platform,zone,status")
              .eq("shift_date", today)
              .eq("status", "active"),
          ]);

          if (liveError) throw liveError;
          if (dailyError) throw dailyError;
          if (shiftError) throw shiftError;

          setLocations((liveData || []) as LiveLocationRow[]);
          setDailyRows((dailyData || []) as DailyTrackingRow[]);
          setActiveShifts((shiftData || []) as ActiveShiftRow[]);
        } catch (
          error
        ) {
          console.error(
            "LOAD LIVE TRACKING ERROR:",
            error
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadData();

    const channel =
      supabase
        .channel(
          "premium-live-tracking"
        )
        .on(
          "postgres_changes",
          {
            event: "*",

            schema:
              "public",

            table:
              "rider_live_locations",
          },
          () => {
            loadData();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "rider_daily_tracking",
          },
          () => {
            loadData();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "rider_shifts",
          },
          () => {
            loadData();
          }
        )
        .subscribe();

    const timer =
      window.setInterval(
        loadData,
        30000
      );

    return () => {
      window.clearInterval(
        timer
      );

      supabase.removeChannel(
        channel
      );
    };
  }, [loadData]);

  /* =========================================================
     DATA
  ========================================================= */

  const dailyMap =
    useMemo(() => {
      return new Map(
        dailyRows.map(
          (row) => [
            row.employee_id,
            row,
          ]
        )
      );
    }, [dailyRows]);

  const activeShiftMap =
    useMemo(() => {
      return new Map(
        activeShifts.map((shift) => [
          shift.employee_id,
          shift,
        ])
      );
    }, [activeShifts]);

  const riders =
    useMemo<
      RiderView[]
    >(() => {
      return locations
        .map(
          (row) => {
            const daily =
              dailyMap.get(
                row.employee_id
              );

            const activeShift =
              activeShiftMap.get(
                row.employee_id
              );

            return {
              employeeId:
                row.employee_id,

              shiftId:
                activeShift?.id ||
                null,

              name:
                row.employees
                  ?.name ||
                "-",

              iqama:
                row.employees
                  ?.iqama ||
                "-",

              phone:
                row.employees
                  ?.phone ||
                "-",

              hungerId:
                row.employees
                  ?.hunger_id ||
                "-",

              keetaId:
                row.employees
                  ?.keeta_id ||
                "-",

              workLocation:
                row.employees
                  ?.work_location ||
                "-",

              latitude:
                Number(
                  row.latitude ||
                    0
                ),

              longitude:
                Number(
                  row.longitude ||
                    0
                ),

              accuracyM:
                Math.round(
                  Number(
                    row.accuracy_m ||
                      0
                  )
                ),

              speedKmh:
                Math.max(
                  0,
                  Math.round(
                    Number(
                      row.speed_kmh ||
                        0
                    )
                  )
                ),

              heading:
                Math.round(
                  Number(
                    row.heading ||
                      0
                  )
                ),

              gpsOnlineFlag:
                Boolean(
                  row.is_online
                ),

              recordedAt:
                row.recorded_at,

              updatedAt:
                row.updated_at,

              platform:
                activeShift
                  ?.platform ||
                "-",

              zone:
                activeShift
                  ?.zone ||
                "-",

              shiftStart:
                activeShift
                  ?.start_time ||
                "-",

              shiftEnd:
                activeShift
                  ?.end_time ||
                "-",

              shiftStatus:
                activeShift
                  ?.status ||
                "inactive",

              distanceKm:
                Number(
                  daily
                    ?.total_distance_m ||
                    0
                ) /
                1000,

              movingSeconds:
                Number(
                  daily
                    ?.moving_seconds ||
                    0
                ),

              stoppedSeconds:
                Number(
                  daily
                    ?.stopped_seconds ||
                    0
                ),
            };
          }
        )
        .filter(
          (rider) =>
            Number.isFinite(
              rider.latitude
            ) &&
            Number.isFinite(
              rider.longitude
            ) &&
            rider.latitude !==
              0 &&
            rider.longitude !==
              0
        );
    }, [
      locations,
      dailyMap,
      activeShiftMap,
    ]);

  /* =========================================================
     AUTO CENTER
  ========================================================= */

  useEffect(() => {
    if (
      autoCentered ||
      riders.length ===
        0
    ) {
      return;
    }

    const latitude =
      riders.reduce(
        (
          total,
          rider
        ) =>
          total +
          rider.latitude,
        0
      ) /
      riders.length;

    const longitude =
      riders.reduce(
        (
          total,
          rider
        ) =>
          total +
          rider.longitude,
        0
      ) /
      riders.length;

    setViewState({
      latitude,
      longitude,
      zoom:
        riders.length ===
        1
          ? 14
          : 10.5,
    });

    setAutoCentered(
      true
    );
  }, [
    riders,
    autoCentered,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    useMemo(() => {
      const active =
        riders.filter(
          isShiftActive
        );

      const inactive =
        riders.filter(
          (rider) =>
            !isShiftActive(
              rider
            )
        );

      const online =
        riders.filter(
          isGpsOnline
        );

      const offline =
        riders.filter(
          (rider) =>
            !isGpsOnline(
              rider
            )
        );

      const moving =
        riders.filter(
          (rider) =>
            isGpsOnline(
              rider
            ) &&
            rider.speedKmh >=
              5
        );

      const totalDistanceKm =
        dailyRows.reduce(
          (
            total,
            row
          ) =>
            total +
            Number(
              row.total_distance_m ||
                0
            ) /
              1000,
          0
        );

      const totalMovingSeconds =
        dailyRows.reduce(
          (
            total,
            row
          ) =>
            total +
            Number(
              row.moving_seconds ||
                0
            ),
          0
        );

      const totalStoppedSeconds =
        dailyRows.reduce(
          (
            total,
            row
          ) =>
            total +
            Number(
              row.stopped_seconds ||
                0
            ),
          0
        );

      return {
        total:
          riders.length,

        active:
          active.length,

        inactive:
          inactive.length,

        online:
          online.length,

        offline:
          offline.length,

        moving:
          moving.length,

        totalDistanceKm,

        totalMovingSeconds,

        totalStoppedSeconds,
      };
    }, [
      riders,
      dailyRows,
    ]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredRiders =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      return riders
        .filter(
          (rider) => {
            if (
              filter ===
                "active" &&
              !isShiftActive(
                rider
              )
            ) {
              return false;
            }

            if (
              filter ===
                "inactive" &&
              isShiftActive(
                rider
              )
            ) {
              return false;
            }

            if (
              filter ===
                "moving" &&
              !(
                isGpsOnline(
                  rider
                ) &&
                rider.speedKmh >=
                  5
              )
            ) {
              return false;
            }

            if (
              filter ===
                "offline" &&
              isGpsOnline(
                rider
              )
            ) {
              return false;
            }

            if (!q) {
              return true;
            }

            return (
              rider.name
                .toLowerCase()
                .includes(q) ||
              rider.iqama
                .toLowerCase()
                .includes(q) ||
              rider.hungerId
                .toLowerCase()
                .includes(q) ||
              rider.keetaId
                .toLowerCase()
                .includes(q)
            );
          }
        )
        .sort(
          (
            a,
            b
          ) => {
            const activeDiff =
              Number(
                isShiftActive(
                  b
                )
              ) -
              Number(
                isShiftActive(
                  a
                )
              );

            if (
              activeDiff !==
              0
            ) {
              return activeDiff;
            }

            const onlineDiff =
              Number(
                isGpsOnline(
                  b
                )
              ) -
              Number(
                isGpsOnline(
                  a
                )
              );

            if (
              onlineDiff !==
              0
            ) {
              return onlineDiff;
            }

            return (
              new Date(
                b.updatedAt
              ).getTime() -
              new Date(
                a.updatedAt
              ).getTime()
            );
          }
        );
    }, [
      riders,
      search,
      filter,
    ]);

  const selectedRider =
    riders.find(
      (rider) =>
        rider.employeeId ===
        selectedId
    ) ||
    null;

  /* =========================================================
     ACTIONS
  ========================================================= */

  function focusRider(
    rider: RiderView
  ) {
    setSelectedId(
      rider.employeeId
    );

    setViewState(
      (
        current
      ) => ({
        ...current,

        latitude:
          rider.latitude,

        longitude:
          rider.longitude,

        zoom: 15,
      })
    );
  }

  function centerAll() {
    if (
      riders.length ===
      0
    ) {
      return;
    }

    const latitude =
      riders.reduce(
        (
          total,
          rider
        ) =>
          total +
          rider.latitude,
        0
      ) /
      riders.length;

    const longitude =
      riders.reduce(
        (
          total,
          rider
        ) =>
          total +
          rider.longitude,
        0
      ) /
      riders.length;

    setViewState({
      latitude,
      longitude,
      zoom:
        riders.length ===
        1
          ? 14
          : 10.5,
    });

    setSelectedId(
      null
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
      {/* HEADER */}

      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-l from-[#092e55] via-[#0c3a69] to-[#0f4b82] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-24 end-10 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <LocateFixed className="h-6 w-6 text-cyan-200" />
            </div>

            <div>
              <p className="text-xs font-black text-cyan-200">
                LIVE FLEET MAP
              </p>

              <h1 className="mt-1 text-2xl font-black md:text-3xl">
                {isAr
                  ? "مركز التتبع المباشر"
                  : "Live Tracking Center"}
              </h1>

              <p className="mt-1 text-sm font-semibold text-blue-100">
                {isAr
                  ? "كل المناديب يظهرون على الخريطة دائمًا، وحالة الشفت تحدد نشط أو غير نشط."
                  : "All riders remain visible on the map; shift status determines active or inactive."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                centerAll
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/20"
            >
              <Crosshair className="h-4 w-4" />

              {isAr
                ? "عرض الجميع"
                : "Show All"}
            </button>

            <button
              type="button"
              onClick={
                loadData
              }
              disabled={
                loading
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-[#0f3b68] transition hover:bg-blue-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
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
      </section>

      {/* GENERAL STATS */}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-8">
        <TopStat
          title={
            isAr
              ? "المتتبعون"
              : "Tracked"
          }
          value={
            stats.total
          }
          icon={
            <Users className="h-5 w-5" />
          }
          tone="blue"
        />

        <TopStat
          title={
            isAr
              ? "نشط"
              : "Active"
          }
          value={
            stats.active
          }
          icon={
            <Activity className="h-5 w-5" />
          }
          tone="green"
        />

        <TopStat
          title={
            isAr
              ? "غير نشط"
              : "Inactive"
          }
          value={
            stats.inactive
          }
          icon={
            <TimerOff className="h-5 w-5" />
          }
          tone="amber"
        />

        <TopStat
          title={
            isAr
              ? "GPS متصل"
              : "GPS Online"
          }
          value={
            stats.online
          }
          icon={
            <Wifi className="h-5 w-5" />
          }
          tone="cyan"
        />

        <TopStat
          title={
            isAr
              ? "GPS غير متصل"
              : "GPS Offline"
          }
          value={
            stats.offline
          }
          icon={
            <WifiOff className="h-5 w-5" />
          }
          tone="slate"
        />

        <TopStat
          title={
            isAr
              ? "إجمالي KM"
              : "Total KM"
          }
          value={`${stats.totalDistanceKm.toFixed(
            1
          )}`}
          icon={
            <Route className="h-5 w-5" />
          }
          tone="blue"
        />

        <TopStat
          title={
            isAr
              ? "وقت الحركة"
              : "Moving"
          }
          value={
            formatDuration(
              stats.totalMovingSeconds
            )
          }
          icon={
            <Navigation className="h-5 w-5" />
          }
          tone="green"
        />

        <TopStat
          title={
            isAr
              ? "وقت التوقف"
              : "Stopped"
          }
          value={
            formatDuration(
              stats.totalStoppedSeconds
            )
          }
          icon={
            <Clock3 className="h-5 w-5" />
          }
          tone="amber"
        />
      </section>

      {/* MAIN WORKSPACE */}

      <section className="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:grid-cols-[340px_1fr]">
        {/* RIDER PANEL */}

        <aside className="order-2 border-t border-slate-200 bg-white xl:order-1 xl:border-e xl:border-t-0">
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isAr
                    ? "right-3.5"
                    : "left-3.5"
                }`}
              />

              <input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={
                  isAr
                    ? "بحث بالاسم أو الإقامة أو ID..."
                    : "Search name, Iqama or ID..."
                }
                className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
                  isAr
                    ? "pr-10 pl-3"
                    : "pl-10 pr-3"
                }`}
              />
            </div>

            <p className="mt-3 text-[11px] font-bold text-slate-400">
              {isAr
                ? `${filteredRiders.length} مندوب مطابق للفلتر`
                : `${filteredRiders.length} riders match the filter`}
            </p>
          </div>

          <div className="max-h-[690px] overflow-y-auto p-2">
            {filteredRiders.length ===
            0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center">
                <MapPin className="h-7 w-7 text-slate-300" />

                <p className="mt-3 text-sm font-black text-slate-500">
                  {isAr
                    ? "لا توجد مواقع مطابقة"
                    : "No matching locations"}
                </p>
              </div>
            ) : (
              filteredRiders.map(
                (
                  rider
                ) => (
                  <RiderListItem
                    key={
                      rider.employeeId
                    }
                    rider={
                      rider
                    }
                    selected={
                      selectedId ===
                      rider.employeeId
                    }
                    isAr={
                      isAr
                    }
                    onClick={() =>
                      focusRider(
                        rider
                      )
                    }
                  />
                )
              )
            )}
          </div>
        </aside>

        {/* MAP */}

        <div className="order-1 min-w-0 xl:order-2">
          {/* FILTER BAR */}

          <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-black text-[#102a4c]">
                {isAr
                  ? "خريطة المناديب"
                  : "Rider Map"}
              </h2>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                {isAr
                  ? "الأخضر نشط، البرتقالي غير نشط، الرمادي GPS غير متصل."
                  : "Green active, amber inactive, gray GPS offline."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={
                  filter ===
                  "all"
                }
                onClick={() =>
                  setFilter(
                    "all"
                  )
                }
                label={
                  isAr
                    ? "الكل"
                    : "All"
                }
              />

              <FilterButton
                active={
                  filter ===
                  "active"
                }
                onClick={() =>
                  setFilter(
                    "active"
                  )
                }
                label={
                  isAr
                    ? `نشط ${stats.active}`
                    : `Active ${stats.active}`
                }
                tone="green"
              />

              <FilterButton
                active={
                  filter ===
                  "inactive"
                }
                onClick={() =>
                  setFilter(
                    "inactive"
                  )
                }
                label={
                  isAr
                    ? `غير نشط ${stats.inactive}`
                    : `Inactive ${stats.inactive}`
                }
                tone="amber"
              />

              <FilterButton
                active={
                  filter ===
                  "moving"
                }
                onClick={() =>
                  setFilter(
                    "moving"
                  )
                }
                label={
                  isAr
                    ? `يتحرك ${stats.moving}`
                    : `Moving ${stats.moving}`
                }
                tone="blue"
              />

              <FilterButton
                active={
                  filter ===
                  "offline"
                }
                onClick={() =>
                  setFilter(
                    "offline"
                  )
                }
                label={
                  isAr
                    ? `غير متصل ${stats.offline}`
                    : `Offline ${stats.offline}`
                }
                tone="slate"
              />
            </div>
          </div>

          <div className="relative h-[690px] bg-slate-100">
            <MapView
              {...viewState}
              onMove={(
                event
              ) =>
                setViewState(
                  event.viewState
                )
              }
              mapStyle={
                MAP_STYLE
              }
              style={{
                width:
                  "100%",

                height:
                  "100%",
              }}
            >
              <NavigationControl
                position={
                  isAr
                    ? "top-left"
                    : "top-right"
                }
                showCompass={
                  true
                }
              />

              {filteredRiders.map(
                (
                  rider
                ) => (
                  <Marker
                    key={
                      rider.employeeId
                    }
                    longitude={
                      rider.longitude
                    }
                    latitude={
                      rider.latitude
                    }
                    anchor="center"
                    onClick={(
                      event
                    ) => {
                      event.originalEvent.stopPropagation();

                      focusRider(
                        rider
                      );
                    }}
                  >
                    <RiderMarker
                      rider={
                        rider
                      }
                      selected={
                        rider.employeeId ===
                        selectedId
                      }
                    />
                  </Marker>
                )
              )}
            </MapView>

            {/* LEGEND */}

            <div
              className={`pointer-events-none absolute top-4 ${
                isAr
                  ? "right-4"
                  : "left-4"
              } rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur`}
            >
              <LegendRow
                color="bg-emerald-500"
                label={
                  isAr
                    ? "شفت نشط"
                    : "Active shift"
                }
              />

              <LegendRow
                color="bg-amber-500"
                label={
                  isAr
                    ? "غير نشط"
                    : "Inactive"
                }
              />

              <LegendRow
                color="bg-slate-400"
                label={
                  isAr
                    ? "GPS غير متصل"
                    : "GPS offline"
                }
              />
            </div>

            {/* LOADING */}

            {loading && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/35 backdrop-blur-[1px]">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-xl">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />

                  <span className="text-xs font-black text-slate-600">
                    {isAr
                      ? "جاري تحديث المواقع..."
                      : "Updating locations..."}
                  </span>
                </div>
              </div>
            )}

            {/* SELECTED RIDER */}

            {selectedRider && (
              <SelectedRiderCard
                rider={
                  selectedRider
                }
                isAr={
                  isAr
                }
                onClose={() =>
                  setSelectedId(
                    null
                  )
                }
              />
            )}
          </div>
        </div>
      </section>

      {/* TABLE */}

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-black text-[#102a4c]">
              {isAr
                ? "تفاصيل التتبع اليوم"
                : "Today's Tracking Details"}
            </h2>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              {isAr
                ? "المسافة والحركة والتوقف والحالة التشغيلية لكل مندوب."
                : "Distance, moving time, stopped time and operational status for every rider."}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
            {
              filteredRiders.length
            }
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>
                  {isAr
                    ? "المندوب"
                    : "Rider"}
                </Th>

                <Th>
                  {isAr
                    ? "التشغيل"
                    : "Operation"}
                </Th>

                <Th>
                  GPS
                </Th>

                <Th>
                  {isAr
                    ? "المنصة"
                    : "Platform"}
                </Th>

                <Th>
                  {isAr
                    ? "السرعة"
                    : "Speed"}
                </Th>

                <Th>
                  KM
                </Th>

                <Th>
                  {isAr
                    ? "الحركة"
                    : "Moving"}
                </Th>

                <Th>
                  {isAr
                    ? "التوقف"
                    : "Stopped"}
                </Th>

                <Th>
                  {isAr
                    ? "دقة GPS"
                    : "Accuracy"}
                </Th>

                <Th>
                  {isAr
                    ? "آخر تحديث"
                    : "Updated"}
                </Th>
              </tr>
            </thead>

            <tbody>
              {filteredRiders.map(
                (
                  rider
                ) => (
                  <tr
                    key={
                      rider.employeeId
                    }
                    className="border-t border-slate-100 transition hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          focusRider(
                            rider
                          )
                        }
                        className="text-start"
                      >
                        <p className="font-black text-[#102a4c]">
                          {
                            rider.name
                          }
                        </p>

                        <p
                          dir="ltr"
                          className="mt-0.5 text-[10px] font-bold text-slate-400"
                        >
                          {
                            rider.iqama
                          }
                        </p>
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <OperationBadge
                        rider={
                          rider
                        }
                        isAr={
                          isAr
                        }
                      />
                    </td>

                    <td className="px-4 py-3">
                      <GpsBadge
                        rider={
                          rider
                        }
                        isAr={
                          isAr
                        }
                      />
                    </td>

                    <Td>
                      {
                        rider.platform
                      }
                    </Td>

                    <Td strong>
                      {
                        rider.speedKmh
                      }{" "}
                      km/h
                    </Td>

                    <Td strong>
                      {rider.distanceKm.toFixed(
                        1
                      )}
                    </Td>

                    <Td>
                      {formatDuration(
                        rider.movingSeconds
                      )}
                    </Td>

                    <Td>
                      {formatDuration(
                        rider.stoppedSeconds
                      )}
                    </Td>

                    <Td>
                      {
                        rider.accuracyM
                      }{" "}
                      m
                    </Td>

                    <Td>
                      {relativeTime(
                        rider.updatedAt,
                        isAr
                      )}
                    </Td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   MARKER
========================================================= */

function RiderMarker({
  rider,
  selected,
}: {
  rider: RiderView;
  selected: boolean;
}) {
  const gpsOnline =
    isGpsOnline(
      rider
    );

  const active =
    isShiftActive(
      rider
    );

  // Marker color represents SHIFT status.
  // GPS connectivity is shown separately so an active shift never turns gray.
  const tone = active
    ? "bg-emerald-500"
    : "bg-amber-500";

  const initial =
    (
      rider.name
        .trim()[0] ||
      "R"
    ).toUpperCase();

  return (
    <button
      type="button"
      title={
        rider.name
      }
      className={`group relative flex items-center justify-center rounded-full transition ${
        selected
          ? "h-12 w-12 scale-110"
          : "h-10 w-10 hover:scale-110"
      }`}
    >
      {gpsOnline && (
        <span
          className={`absolute inset-0 rounded-full opacity-20 ${
            active
              ? "animate-ping bg-emerald-500"
              : "bg-amber-500"
          }`}
        />
      )}

      <span
        className={`relative flex h-full w-full items-center justify-center rounded-full border-[3px] border-white text-xs font-black text-white shadow-[0_8px_20px_rgba(15,42,76,0.28)] ${tone}`}
      >
        {
          initial
        }
      </span>

      {!gpsOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-500 shadow-sm" />
      )}

      <span className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded-lg bg-[#102a4c] px-2 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block">
        {
          rider.name
        }
      </span>
    </button>
  );
}

/* =========================================================
   SELECTED RIDER
========================================================= */

function SelectedRiderCard({
  rider,
  isAr,
  onClose,
}: {
  rider: RiderView;
  isAr: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`absolute bottom-4 ${
        isAr
          ? "right-4"
          : "left-4"
      } w-[calc(100%-2rem)] max-w-[470px] overflow-hidden rounded-[24px] border border-white/80 bg-white/95 shadow-[0_18px_50px_rgba(15,42,76,0.22)] backdrop-blur`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#102f55] text-white">
            <UserRound className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#102a4c]">
              {
                rider.name
              }
            </p>

            <p
              dir="ltr"
              className="mt-1 text-[10px] font-bold text-slate-400"
            >
              {
                rider.iqama
              }
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        <DetailMetric
          label={
            isAr
              ? "التشغيل"
              : "Operation"
          }
          value={
            isShiftActive(
              rider
            )
              ? isAr
                ? "نشط"
                : "Active"
              : isAr
                ? "غير نشط"
                : "Inactive"
          }
        />

        <DetailMetric
          label="GPS"
          value={
            isGpsOnline(
              rider
            )
              ? isAr
                ? "متصل"
                : "Online"
              : isAr
                ? "غير متصل"
                : "Offline"
          }
        />

        <DetailMetric
          label={
            isAr
              ? "السرعة"
              : "Speed"
          }
          value={`${rider.speedKmh} km/h`}
        />

        <DetailMetric
          label={
            isAr
              ? "المسافة"
              : "Distance"
          }
          value={`${rider.distanceKm.toFixed(
            1
          )} KM`}
        />

        <DetailMetric
          label={
            isAr
              ? "الحركة"
              : "Moving"
          }
          value={
            formatDuration(
              rider.movingSeconds
            )
          }
        />

        <DetailMetric
          label={
            isAr
              ? "التوقف"
              : "Stopped"
          }
          value={
            formatDuration(
              rider.stoppedSeconds
            )
          }
        />

        <DetailMetric
          label={
            isAr
              ? "المنصة"
              : "Platform"
          }
          value={
            rider.platform
          }
        />

        <DetailMetric
          label={
            isAr
              ? "آخر تحديث"
              : "Updated"
          }
          value={
            relativeTime(
              rider.updatedAt,
              isAr
            )
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   RIDER LIST
========================================================= */

function RiderListItem({
  rider,
  selected,
  isAr,
  onClick,
}: {
  rider: RiderView;
  selected: boolean;
  isAr: boolean;
  onClick: () => void;
}) {
  const active =
    isShiftActive(
      rider
    );

  const online =
    isGpsOnline(
      rider
    );

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`mb-2 w-full rounded-2xl border p-3 text-start transition ${
        selected
          ? "border-blue-200 bg-blue-50 shadow-sm"
          : "border-slate-100 bg-slate-50/70 hover:border-slate-200 hover:bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
            !online
              ? "bg-slate-400"
              : active
                ? "bg-emerald-500"
                : "bg-amber-500"
          }`}
        >
          <Bike className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-black text-[#102a4c]">
              {
                rider.name
              }
            </p>

            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                !online
                  ? "bg-slate-400"
                  : active
                    ? "bg-emerald-500"
                    : "bg-amber-500"
              }`}
            />
          </div>

          <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
            {active
              ? rider.platform
              : isAr
                ? "خارج الشفت"
                : "Off shift"}
            {" • "}
            {relativeTime(
              rider.updatedAt,
              isAr
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniBox
          icon={
            <Gauge className="h-3.5 w-3.5" />
          }
          value={`${rider.speedKmh}`}
          label="km/h"
        />

        <MiniBox
          icon={
            <Route className="h-3.5 w-3.5" />
          }
          value={
            rider.distanceKm.toFixed(
              1
            )
          }
          label="KM"
        />

        <MiniBox
          icon={
            <MapPin className="h-3.5 w-3.5" />
          }
          value={`${rider.accuracyM}`}
          label="m"
        />
      </div>
    </button>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function TopStat({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value:
    | number
    | string;
  icon:
    React.ReactNode;
  tone:
    | "blue"
    | "green"
    | "amber"
    | "cyan"
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

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      value:
        "text-amber-700",
    },

    cyan: {
      icon:
        "bg-cyan-50 text-cyan-600",
      value:
        "text-cyan-700",
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
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black text-slate-500">
            {
              title
            }
          </p>

          <p
            className={`mt-2 text-2xl font-black ${current.value}`}
          >
            {
              value
            }
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${current.icon}`}
        >
          {
            icon
          }
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  tone = "blue",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?:
    | "blue"
    | "green"
    | "amber"
    | "slate";
}) {
  const activeTone = {
    blue:
      "border-blue-600 bg-blue-600 text-white",

    green:
      "border-emerald-600 bg-emerald-600 text-white",

    amber:
      "border-amber-500 bg-amber-500 text-white",

    slate:
      "border-slate-700 bg-slate-700 text-white",
  }[tone];

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`h-9 rounded-xl border px-3 text-[11px] font-black transition ${
        active
          ? activeTone
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {
        label
      }
    </button>
  );
}

function LegendRow({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span
        className={`h-2.5 w-2.5 rounded-full ${color}`}
      />

      <span className="text-[10px] font-black text-slate-600">
        {
          label
        }
      </span>
    </div>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <p className="text-[9px] font-black text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-1 truncate text-xs font-black text-[#102a4c]">
        {
          value
        }
      </p>
    </div>
  );
}

function MiniBox({
  icon,
  value,
  label,
}: {
  icon:
    React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white p-2 text-center shadow-sm">
      <div className="flex items-center justify-center gap-1 text-slate-400">
        {
          icon
        }

        <span className="text-[9px] font-bold">
          {
            label
          }
        </span>
      </div>

      <p className="mt-1 text-xs font-black text-[#102a4c]">
        {
          value
        }
      </p>
    </div>
  );
}

function OperationBadge({
  rider,
  isAr,
}: {
  rider: RiderView;
  isAr: boolean;
}) {
  const active =
    isShiftActive(
      rider
    );

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {active
        ? isAr
          ? "نشط"
          : "Active"
        : isAr
          ? "غير نشط"
          : "Inactive"}
    </span>
  );
}

function GpsBadge({
  rider,
  isAr,
}: {
  rider: RiderView;
  isAr: boolean;
}) {
  const online =
    isGpsOnline(
      rider
    );

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${
        online
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {online
        ? isAr
          ? "متصل"
          : "Online"
        : isAr
          ? "غير متصل"
          : "Offline"}
    </span>
  );
}

function Th({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-start text-[10px] font-black uppercase tracking-wide text-slate-500">
      {
        children
      }
    </th>
  );
}

function Td({
  children,
  strong = false,
}: {
  children:
    React.ReactNode;
  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 ${
        strong
          ? "font-black text-[#102a4c]"
          : "font-bold text-slate-600"
      }`}
    >
      {
        children
      }
    </td>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function isShiftActive(
  rider: RiderView
) {
  if (
    !rider.shiftId
  ) {
    return false;
  }

  const status =
    String(
      rider.shiftStatus ||
        ""
    )
      .trim()
      .toLowerCase();

  return (
    !status ||
    status ===
      "-" ||
    status ===
      "active"
  );
}

function isGpsOnline(
  rider: RiderView
) {
  if (
    !rider.gpsOnlineFlag ||
    !rider.updatedAt
  ) {
    return false;
  }

  const updated =
    new Date(
      rider.updatedAt
    ).getTime();

  if (
    !Number.isFinite(
      updated
    )
  ) {
    return false;
  }

  return (
    Date.now() -
      updated <=
    3 *
      60 *
      1000
  );
}

function formatDuration(
  seconds: number
) {
  const safe =
    Math.max(
      0,
      Math.round(
        Number(
          seconds ||
            0
        )
      )
    );

  const hours =
    Math.floor(
      safe /
        3600
    );

  const minutes =
    Math.floor(
      (safe %
        3600) /
        60
    );

  if (
    hours >
    0
  ) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function relativeTime(
  value: string,
  isAr: boolean
) {
  if (!value) {
    return "-";
  }

  const time =
    new Date(
      value
    ).getTime();

  if (
    !Number.isFinite(
      time
    )
  ) {
    return "-";
  }

  const minutes =
    Math.max(
      0,
      Math.floor(
        (Date.now() -
          time) /
          60000
      )
    );

  if (
    minutes <
    1
  ) {
    return isAr
      ? "الآن"
      : "Now";
  }

  if (
    minutes <
    60
  ) {
    return isAr
      ? `منذ ${minutes} د`
      : `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  if (
    hours <
    24
  ) {
    return isAr
      ? `منذ ${hours} س`
      : `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours /
        24
    );

  return isAr
    ? `منذ ${days} يوم`
    : `${days}d ago`;
}

function getSaudiDateKey() {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Riyadh",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      }
    ).formatToParts(
      new Date()
    );

  const year =
    parts.find(
      (part) =>
        part.type ===
        "year"
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month"
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type ===
        "day"
    )?.value;

  return `${year}-${month}-${day}`;
}
