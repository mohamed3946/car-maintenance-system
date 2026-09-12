"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Activity,
  BatteryMedium,
  Clock3,
  Crosshair,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Search,
  Signal,
  UserRound,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import MapView, {
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl/maplibre";

import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";

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

  rider_shifts?: {
    start_time?: string | null;
    end_time?: string | null;
    platform?: string | null;
    zone?: string | null;
    status?: string | null;
  } | null;
};

type DailyTrackingRow = {
  employee_id: string;
  total_distance_m: number | null;
  moving_seconds: number | null;
  stopped_seconds: number | null;
  last_location_at: string | null;
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
  online: boolean;
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

const RIYADH = {
  latitude: 24.7136,
  longitude: 46.6753,
  zoom: 10.5,
};

const LIVE_MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        "© OpenStreetMap contributors",
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
export default function LiveTrackingPage() {
  return (
    <AppLayout system="employees">
      <LiveTrackingContent />
    </AppLayout>
  );
}

function LiveTrackingContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [locations, setLocations] = useState<LiveLocationRow[]>([]);
  const [dailyRows, setDailyRows] = useState<DailyTrackingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [viewState, setViewState] = useState(RIYADH);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const today = getSaudiDateKey();

      const [{ data: liveData, error: liveError }, { data: dailyData, error: dailyError }] =
        await Promise.all([
          supabase
            .from("rider_live_locations")
            .select(
              `
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
              ),
              rider_shifts (
                start_time,
                end_time,
                platform,
                zone,
                status
              )
            `
            )
            .order("updated_at", { ascending: false }),

          supabase
            .from("rider_daily_tracking")
            .select(
              `
              employee_id,
              total_distance_m,
              moving_seconds,
              stopped_seconds,
              last_location_at
            `
            )
            .eq("tracking_date", today),
        ]);

      if (liveError) throw liveError;
      if (dailyError) throw dailyError;

      setLocations((liveData || []) as LiveLocationRow[]);
      setDailyRows((dailyData || []) as DailyTrackingRow[]);
    } catch (error) {
      console.error("LOAD LIVE TRACKING ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("dashboard-rider-live-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rider_live_locations",
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
      .subscribe();

    const timer = window.setInterval(loadData, 30000);

    return () => {
      window.clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const dailyMap = useMemo<Map<string, DailyTrackingRow>>(() => {
    return new globalThis.Map<string, DailyTrackingRow>(
      dailyRows.map((row) => [
        row.employee_id,
        row,
      ])
    );
  }, [dailyRows]);

  const riders = useMemo<RiderView[]>(() => {
    return locations
      .map((row) => {
        const daily = dailyMap.get(row.employee_id);

        return {
          employeeId: row.employee_id,
          shiftId: row.shift_id,
          name: row.employees?.name || "-",
          iqama: row.employees?.iqama || "-",
          phone: row.employees?.phone || "-",
          hungerId: row.employees?.hunger_id || "-",
          keetaId: row.employees?.keeta_id || "-",
          workLocation: row.employees?.work_location || "-",
          latitude: Number(row.latitude || 0),
          longitude: Number(row.longitude || 0),
          accuracyM: Math.round(Number(row.accuracy_m || 0)),
          speedKmh: Math.round(Number(row.speed_kmh || 0)),
          heading: Math.round(Number(row.heading || 0)),
          online: Boolean(row.is_online),
          recordedAt: row.recorded_at,
          updatedAt: row.updated_at,
          platform: row.rider_shifts?.platform || "-",
          zone: row.rider_shifts?.zone || "-",
          shiftStart: row.rider_shifts?.start_time || "-",
          shiftEnd: row.rider_shifts?.end_time || "-",
          shiftStatus: row.rider_shifts?.status || "-",
          distanceKm: Number(daily?.total_distance_m || 0) / 1000,
          movingSeconds: Number(daily?.moving_seconds || 0),
          stoppedSeconds: Number(daily?.stopped_seconds || 0),
        };
      })
      .filter(
        (rider) =>
          Number.isFinite(rider.latitude) &&
          Number.isFinite(rider.longitude) &&
          rider.latitude !== 0 &&
          rider.longitude !== 0
      );
  }, [locations, dailyMap]);

  const filteredRiders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return riders.filter((rider) => {
      if (onlyOnline && !isActuallyOnline(rider)) return false;

      if (!q) return true;

      return (
        rider.name.toLowerCase().includes(q) ||
        rider.iqama.toLowerCase().includes(q) ||
        rider.hungerId.toLowerCase().includes(q) ||
        rider.keetaId.toLowerCase().includes(q)
      );
    });
  }, [riders, search, onlyOnline]);

  const selectedRider =
    filteredRiders.find((rider) => rider.employeeId === selectedId) ||
    riders.find((rider) => rider.employeeId === selectedId) ||
    null;

  const onlineCount = riders.filter(isActuallyOnline).length;
  const movingCount = riders.filter(
    (rider) => isActuallyOnline(rider) && rider.speedKmh >= 5
  ).length;
  const stoppedCount = riders.filter(
    (rider) => isActuallyOnline(rider) && rider.speedKmh < 5
  ).length;
  const offlineCount = Math.max(0, riders.length - onlineCount);
  const totalKm = Math.round(
    riders.reduce((sum, rider) => sum + rider.distanceKm, 0)
  );

  function focusRider(rider: RiderView) {
    setSelectedId(rider.employeeId);

    setViewState((current) => ({
      ...current,
      latitude: rider.latitude,
      longitude: rider.longitude,
      zoom: 15,
      transitionDuration: 500,
    }));
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-5 pb-10">
      <section className="overflow-hidden rounded-[28px] bg-[#0d2c4d] text-white shadow-[0_18px_50px_rgba(13,44,77,0.18)]">
        <div className="relative px-5 py-6 md:px-7">
          <div className="absolute -top-20 end-10 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Navigation className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-black md:text-3xl">
                    {isAr ? "التتبع المباشر للمناديب" : "Live Rider Tracking"}
                  </h1>

                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {isAr
                      ? "الموقع الحالي، السرعة، المسافة اليومية وحالة كل مندوب في شاشة واحدة."
                      : "Current location, speed, daily distance and rider status in one screen."}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {isAr ? "تحديث المواقع" : "Refresh Locations"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={isAr ? "إجمالي المتتبعين" : "Tracked Riders"}
          value={riders.length}
          icon={<Users className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          label={isAr ? "متصل الآن" : "Online Now"}
          value={onlineCount}
          icon={<Wifi className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label={isAr ? "يتحرك" : "Moving"}
          value={movingCount}
          icon={<Navigation className="h-5 w-5" />}
          tone="indigo"
        />
        <StatCard
          label={isAr ? "متوقف" : "Stopped"}
          value={stoppedCount}
          icon={<MapPin className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label={isAr ? "غير متصل" : "Offline"}
          value={offlineCount}
          icon={<WifiOff className="h-5 w-5" />}
          tone="red"
        />
        <StatCard
          label={isAr ? "إجمالي KM اليوم" : "Total KM Today"}
          value={totalKm}
          icon={<Route className="h-5 w-5" />}
          tone="slate"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-black text-[#102a4c]">
                {isAr ? "الخريطة المباشرة" : "Live Map"}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {isAr
                  ? "يتم تحديث المواقع تلقائيًا من التطبيق."
                  : "Locations update automatically from the rider app."}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-[260px]">
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
                  className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 ${
                    isAr ? "pr-10 pl-3" : "pl-10 pr-3"
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={() => setOnlyOnline((value) => !value)}
                className={`h-10 rounded-xl border px-4 text-xs font-black transition ${
                  onlyOnline
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {isAr ? "المتصلون فقط" : "Online Only"}
              </button>
            </div>
          </div>

          <div className="relative h-[610px]">
            <MapView
              {...viewState}
              onMove={(event) => setViewState(event.viewState)}
              onLoad={() => {
                setMapReady(true);
                setMapError(null);
              }}
              onError={(event) => {
                console.error("MAPLIBRE ERROR:", event.error);
                setMapError(
                  event.error?.message ||
                    (isAr
                      ? "تعذر تحميل الخريطة"
                      : "Could not load map")
                );
              }}
              mapStyle={LIVE_MAP_STYLE}
              style={{ width: "100%", height: "100%" }}
            >
              <NavigationControl position={isAr ? "top-left" : "top-right"} />

              {filteredRiders.map((rider) => {
                const online = isActuallyOnline(rider);
                const moving = online && rider.speedKmh >= 5;

                return (
                  <Marker
                    key={rider.employeeId}
                    longitude={rider.longitude}
                    latitude={rider.latitude}
                    anchor="center"
                    onClick={(event) => {
                      event.originalEvent.stopPropagation();
                      focusRider(rider);
                    }}
                  >
                    <button
                      type="button"
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-lg transition hover:scale-110 ${
                        moving
                          ? "bg-blue-600"
                          : online
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                      }`}
                      title={rider.name}
                    >
                      <Navigation className="h-4 w-4 text-white" />

                      {moving && (
                        <span className="absolute -inset-2 -z-10 animate-ping rounded-full bg-blue-500/30" />
                      )}
                    </button>
                  </Marker>
                );
              })}

              {selectedRider && (
                <Popup
                  longitude={selectedRider.longitude}
                  latitude={selectedRider.latitude}
                  closeButton={false}
                  closeOnClick={false}
                  anchor="bottom"
                  offset={24}
                >
                  <div
                    dir={isAr ? "rtl" : "ltr"}
                    className="min-w-[240px] p-1 text-slate-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-[#102a4c]">
                          {selectedRider.name}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          {selectedRider.hungerId !== "-"
                            ? `HS ${selectedRider.hungerId}`
                            : selectedRider.keetaId !== "-"
                              ? `Keeta ${selectedRider.keetaId}`
                              : selectedRider.iqama}
                        </p>
                      </div>

                      <StatusPill rider={selectedRider} isAr={isAr} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <PopupMetric
                        label={isAr ? "السرعة" : "Speed"}
                        value={`${selectedRider.speedKmh} km/h`}
                      />
                      <PopupMetric
                        label={isAr ? "المسافة" : "Distance"}
                        value={`${selectedRider.distanceKm.toFixed(1)} km`}
                      />
                      <PopupMetric
                        label={isAr ? "الزون" : "Zone"}
                        value={selectedRider.zone}
                      />
                      <PopupMetric
                        label={isAr ? "آخر تحديث" : "Updated"}
                        value={relativeTime(selectedRider.updatedAt, isAr)}
                      />
                    </div>
                  </div>
                </Popup>
              )}
            </MapView>

            {!mapReady && !mapError && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-lg">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-xs font-black text-slate-600">
                    {isAr ? "جاري تحميل الخريطة..." : "Loading map..."}
                  </span>
                </div>
              </div>
            )}

            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-6 text-center">
                <div>
                  <MapPin className="mx-auto h-8 w-8 text-red-500" />
                  <p className="mt-3 text-sm font-black text-red-700">
                    {isAr ? "تعذر تحميل الخريطة" : "Map failed to load"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-red-500">
                    {mapError}
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[1px]">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-lg">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-xs font-black text-slate-600">
                    {isAr ? "جاري تحديث المواقع..." : "Updating locations..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4">
            <h2 className="text-base font-black text-[#102a4c]">
              {isAr ? "المناديب" : "Riders"}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {isAr
                ? `${filteredRiders.length} مندوب ظاهر على الخريطة`
                : `${filteredRiders.length} riders on map`}
            </p>
          </div>

          <div className="max-h-[610px] overflow-y-auto p-2">
            {filteredRiders.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
                <Crosshair className="h-7 w-7 text-slate-300" />
                <p className="mt-3 text-sm font-black text-slate-500">
                  {isAr ? "لا توجد مواقع مطابقة" : "No matching locations"}
                </p>
              </div>
            ) : (
              filteredRiders.map((rider) => (
                <button
                  key={rider.employeeId}
                  type="button"
                  onClick={() => focusRider(rider)}
                  className={`mb-2 w-full rounded-2xl border p-3 text-start transition ${
                    selectedId === rider.employeeId
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-100 bg-slate-50/70 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#102a4c]">
                        {rider.name}
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-slate-400">
                        {rider.platform} • {rider.zone}
                      </p>
                    </div>

                    <StatusDot rider={rider} />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <SmallMetric
                      icon={<Navigation className="h-3.5 w-3.5" />}
                      value={`${rider.speedKmh}`}
                      label={isAr ? "كم/س" : "km/h"}
                    />
                    <SmallMetric
                      icon={<Route className="h-3.5 w-3.5" />}
                      value={rider.distanceKm.toFixed(1)}
                      label="KM"
                    />
                    <SmallMetric
                      icon={<Clock3 className="h-3.5 w-3.5" />}
                      value={relativeTime(rider.updatedAt, isAr)}
                      label={isAr ? "تحديث" : "Update"}
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-black text-[#102a4c]">
            {isAr ? "حالة التتبع الحالية" : "Current Tracking Status"}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <Th>{isAr ? "المندوب" : "Rider"}</Th>
                <Th>{isAr ? "التطبيق" : "Platform"}</Th>
                <Th>{isAr ? "الزون" : "Zone"}</Th>
                <Th>{isAr ? "الحالة" : "Status"}</Th>
                <Th>{isAr ? "السرعة" : "Speed"}</Th>
                <Th>{isAr ? "KM اليوم" : "KM Today"}</Th>
                <Th>{isAr ? "وقت الحركة" : "Moving"}</Th>
                <Th>{isAr ? "وقت التوقف" : "Stopped"}</Th>
                <Th>{isAr ? "دقة GPS" : "GPS Accuracy"}</Th>
                <Th>{isAr ? "آخر تحديث" : "Last Update"}</Th>
              </tr>
            </thead>

            <tbody>
              {filteredRiders.map((rider) => (
                <tr
                  key={rider.employeeId}
                  className="border-t border-slate-100 hover:bg-slate-50/70"
                >
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => focusRider(rider)}
                      className="text-start"
                    >
                      <p className="font-black text-[#102a4c]">{rider.name}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                        {rider.iqama}
                      </p>
                    </button>
                  </td>
                  <Td>{rider.platform}</Td>
                  <Td>{rider.zone}</Td>
                  <td className="px-4 py-3.5">
                    <StatusPill rider={rider} isAr={isAr} />
                  </td>
                  <Td strong>{rider.speedKmh} km/h</Td>
                  <Td strong>{rider.distanceKm.toFixed(1)}</Td>
                  <Td>{formatDuration(rider.movingSeconds)}</Td>
                  <Td>{formatDuration(rider.stoppedSeconds)}</Td>
                  <Td>{rider.accuracyM} m</Td>
                  <Td>{relativeTime(rider.updatedAt, isAr)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "blue" | "green" | "indigo" | "amber" | "red" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-[#102a4c]">{value}</p>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function PopupMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <p className="text-[9px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-[11px] font-black text-[#102a4c]">{value}</p>
    </div>
  );
}

function SmallMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white px-2 py-2 text-center shadow-sm">
      <div className="flex items-center justify-center gap-1 text-slate-400">
        {icon}
        <span className="text-[9px] font-bold">{label}</span>
      </div>
      <p className="mt-1 truncate text-xs font-black text-[#102a4c]">{value}</p>
    </div>
  );
}

function StatusDot({ rider }: { rider: RiderView }) {
  const online = isActuallyOnline(rider);
  const moving = online && rider.speedKmh >= 5;

  return (
    <span
      className={`h-3 w-3 shrink-0 rounded-full ${
        moving ? "bg-blue-500" : online ? "bg-emerald-500" : "bg-slate-400"
      }`}
    />
  );
}

function StatusPill({
  rider,
  isAr,
}: {
  rider: RiderView;
  isAr: boolean;
}) {
  const online = isActuallyOnline(rider);
  const moving = online && rider.speedKmh >= 5;

  const label = moving
    ? isAr
      ? "يتحرك"
      : "Moving"
    : online
      ? isAr
        ? "متصل"
        : "Online"
      : isAr
        ? "غير متصل"
        : "Offline";

  const cls = moving
    ? "bg-blue-50 text-blue-700"
    : online
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${cls}`}>
      {label}
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

function isActuallyOnline(rider: RiderView) {
  if (!rider.online) return false;

  const updated = new Date(rider.updatedAt).getTime();
  if (Number.isNaN(updated)) return false;

  // Rider is considered offline if no GPS update for 2 minutes.
  return Date.now() - updated <= 2 * 60 * 1000;
}

function relativeTime(value: string, isAr: boolean) {
  const time = new Date(value).getTime();

  if (Number.isNaN(time)) return "-";

  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));

  if (seconds < 20) return isAr ? "الآن" : "Now";

  if (seconds < 60) {
    return isAr ? `منذ ${seconds} ث` : `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return isAr ? `منذ ${minutes} د` : `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  return isAr ? `منذ ${hours} س` : `${hours}h ago`;
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getSaudiDateKey() {
  const now = new Date();
  const saudiTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return saudiTime.toISOString().slice(0, 10);
}
