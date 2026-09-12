"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Crosshair,
  Flame,
  MapPin,
  RefreshCw,
  Search,
  Store,
  Target,
  Users,
} from "lucide-react";
import MapView, {
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl/maplibre";

import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";

type Restaurant = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  cuisine: string | null;
};

type LiveRider = {
  employee_id: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  updated_at: string;
  employees?: {
    name?: string | null;
    hunger_id?: string | null;
    keeta_id?: string | null;
  } | null;
};

type Hotspot = {
  id: string;
  latitude: number;
  longitude: number;
  restaurantCount: number;
  nearbyRiders: number;
  score: number;
  restaurants: Restaurant[];
};

const DEFAULT_VIEW = {
  latitude: 24.7136,
  longitude: 46.6753,
  zoom: 10.7,
};

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
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

export default function PositionIntelligencePage() {
  return (
    <AppLayout system="employees">
      <PositionIntelligenceContent />
    </AppLayout>
  );
}

function PositionIntelligenceContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [riders, setRiders] = useState<LiveRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [search, setSearch] = useState("");
  const [viewState, setViewState] = useState(DEFAULT_VIEW);

  const loadData = useCallback(async () => {
    setLoading(true);
    setRestaurantError(null);

    try {
      const [restaurantsResponse, ridersResponse] = await Promise.all([
        fetch("/api/position-intelligence/restaurants", {
          cache: "no-store",
        }),
        supabase
          .from("rider_live_locations")
          .select(
            `
            employee_id,
            latitude,
            longitude,
            is_online,
            updated_at,
            employees (
              name,
              hunger_id,
              keeta_id
            )
          `
          )
          .order("updated_at", { ascending: false }),
      ]);

      if (!restaurantsResponse.ok) {
        const result = await restaurantsResponse.json().catch(() => ({}));
        throw new Error(
          result?.error || "Restaurant map could not be loaded."
        );
      }

      const restaurantResult = await restaurantsResponse.json();

      if (ridersResponse.error) {
        console.error("RIDER LIVE LOCATION ERROR:", ridersResponse.error);
      }

      setRestaurants((restaurantResult?.restaurants || []) as Restaurant[]);
      setRiders((ridersResponse.data || []) as LiveRider[]);
    } catch (error: any) {
      console.error("POSITION INTELLIGENCE LOAD ERROR:", error);
      setRestaurantError(error?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const timer = window.setInterval(() => {
      loadData();
    }, 120000);

    return () => window.clearInterval(timer);
  }, [loadData]);

  const onlineRiders = useMemo(() => {
    return riders.filter((rider) => isRiderOnline(rider));
  }, [riders]);

  const hotspots = useMemo(() => {
    return buildHotspots(restaurants, onlineRiders);
  }, [restaurants, onlineRiders]);

  const filteredHotspots = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return hotspots;

    return hotspots.filter((hotspot) =>
      hotspot.restaurants.some((restaurant) =>
        restaurant.name.toLowerCase().includes(q)
      )
    );
  }, [hotspots, search]);

  const topHotspots = filteredHotspots.slice(0, 12);

  function focusHotspot(hotspot: Hotspot) {
    setSelectedHotspot(hotspot);
    setViewState({
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
      zoom: 14.8,
    });
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-5 pb-10">
      <section className="overflow-hidden rounded-[28px] bg-[#0d2c4d] text-white shadow-[0_18px_50px_rgba(13,44,77,0.18)]">
        <div className="flex flex-col gap-5 px-5 py-6 md:px-7 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black text-blue-200">
              <Target className="h-4 w-4" />
              NEMO POSITION OPTIMIZER
            </div>

            <h1 className="text-2xl font-black md:text-3xl">
              {isAr ? "أفضل نقاط انتظار المناديب" : "Best Rider Waiting Positions"}
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-300">
              {isAr
                ? "يحلل تجمعات المطاعم مع توزيع مناديبك الحالي، ثم يرتب أفضل نقاط الانتظار. هذه ليست بيانات طلبات هنجرستيشن المباشرة."
                : "Ranks restaurant clusters against your current rider distribution. This is not direct HungerStation demand data."}
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#0d2c4d] hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {isAr ? "تحديث التحليل" : "Refresh Analysis"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<Store className="h-5 w-5" />}
          label={isAr ? "المطاعم المكتشفة" : "Restaurants"}
          value={restaurants.length}
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label={isAr ? "نقاط قوية" : "Strong Hotspots"}
          value={hotspots.filter((item) => item.score >= 75).length}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label={isAr ? "مناديب Online" : "Online Riders"}
          value={onlineRiders.length}
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label={isAr ? "أفضل Score" : "Best Score"}
          value={hotspots[0]?.score || 0}
          suffix="/100"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="relative min-h-[640px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          {restaurantError && (
            <div className="absolute left-4 top-4 z-30 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 shadow">
              {restaurantError}
            </div>
          )}

          <MapView
            {...viewState}
            onMove={(event) => setViewState(event.viewState)}
            mapStyle={MAP_STYLE}
            style={{ width: "100%", height: 640 }}
          >
            <NavigationControl position={isAr ? "top-left" : "top-right"} />

            {topHotspots.map((hotspot, index) => (
              <Marker
                key={hotspot.id}
                longitude={hotspot.longitude}
                latitude={hotspot.latitude}
                anchor="center"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  setSelectedHotspot(hotspot);
                }}
              >
                <button
                  type="button"
                  title={`Score ${hotspot.score}`}
                  className={[
                    "flex h-12 min-w-12 items-center justify-center rounded-full border-4 border-white px-2 text-xs font-black text-white shadow-xl",
                    hotspot.score >= 80
                      ? "bg-red-600"
                      : hotspot.score >= 65
                        ? "bg-orange-500"
                        : "bg-amber-500",
                  ].join(" ")}
                >
                  {index + 1}
                </button>
              </Marker>
            ))}

            {onlineRiders.map((rider) => (
              <Marker
                key={rider.employee_id}
                longitude={Number(rider.longitude)}
                latitude={Number(rider.latitude)}
                anchor="center"
              >
                <div
                  title={rider.employees?.name || "Rider"}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#123B67] shadow-lg"
                >
                  <Users className="h-3.5 w-3.5 text-white" />
                </div>
              </Marker>
            ))}

            {selectedHotspot && (
              <Popup
                longitude={selectedHotspot.longitude}
                latitude={selectedHotspot.latitude}
                anchor="bottom"
                closeOnClick={false}
                onClose={() => setSelectedHotspot(null)}
              >
                <div dir={isAr ? "rtl" : "ltr"} className="min-w-[230px] p-1">
                  <p className="text-sm font-black text-slate-900">
                    {isAr ? "نقطة انتظار مقترحة" : "Suggested Waiting Point"}
                  </p>
                  <div className="mt-2 space-y-1 text-xs font-bold text-slate-600">
                    <p>
                      {isAr ? "التقييم:" : "Score:"}{" "}
                      <span className="font-black text-red-600">
                        {selectedHotspot.score}/100
                      </span>
                    </p>
                    <p>
                      {isAr ? "المطاعم:" : "Restaurants:"}{" "}
                      {selectedHotspot.restaurantCount}
                    </p>
                    <p>
                      {isAr ? "مناديبنا قريبًا:" : "Nearby riders:"}{" "}
                      {selectedHotspot.nearbyRiders}
                    </p>
                  </div>
                </div>
              </Popup>
            )}
          </MapView>

          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
              <div className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-600 shadow-xl">
                {isAr ? "جاري تحليل نقاط الانتظار..." : "Analyzing waiting positions..."}
              </div>
            </div>
          )}
        </div>

        <aside className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <h2 className="font-black text-[#102a4c]">
              {isAr ? "أفضل النقاط الآن" : "Best Positions Now"}
            </h2>

            <div className="relative mt-3">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isAr ? "right-3" : "left-3"
                }`}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isAr ? "بحث باسم مطعم..." : "Search restaurant..."}
                className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none focus:border-blue-300 ${
                  isAr ? "pr-9 pl-3" : "pl-9 pr-3"
                }`}
              />
            </div>
          </div>

          <div className="max-h-[580px] space-y-2 overflow-y-auto p-3">
            {topHotspots.length === 0 && !loading ? (
              <div className="py-16 text-center text-xs font-black text-slate-400">
                {isAr ? "لا توجد نقاط متاحة." : "No positions available."}
              </div>
            ) : (
              topHotspots.map((hotspot, index) => (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => focusHotspot(hotspot)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-start transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white",
                        hotspot.score >= 80
                          ? "bg-red-600"
                          : hotspot.score >= 65
                            ? "bg-orange-500"
                            : "bg-amber-500",
                      ].join(" ")}
                    >
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-[#102a4c]">
                          {isAr ? "نقطة انتظار" : "Waiting Position"} #{index + 1}
                        </p>
                        <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-black text-red-600 shadow-sm">
                          {hotspot.score}/100
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Store className="h-3.5 w-3.5" />
                          {hotspot.restaurantCount} {isAr ? "مطعم" : "restaurants"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {hotspot.nearbyRiders} {isAr ? "مندوب قريب" : "riders"}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-[10px] font-semibold text-slate-400">
                        {hotspot.restaurants
                          .slice(0, 3)
                          .map((restaurant) => restaurant.name)
                          .join(" • ")}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black text-[#102a4c]">
          {isAr ? "طريقة الحساب في النسخة الأولى" : "How V1 calculates the score"}
        </h2>
        <p className="mt-2 max-w-5xl text-sm font-medium leading-7 text-slate-500">
          {isAr
            ? "النظام يعطي أولوية لتجمعات المطاعم الكبيرة، ثم يقلل التقييم إذا كان عدد كبير من مناديب شركتك موجودًا حول نفس النقطة. بعد جمع بيانات تشغيل فعلية سنضيف متوسط وقت الانتظار وفعالية كل نقطة حسب الساعة واليوم."
            : "The system prioritizes dense restaurant clusters and lowers the score when many of your own riders are already around the same point. Historical wait-time effectiveness can be added after real operating data accumulates."}
        </p>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </div>
        <p className="text-2xl font-black text-[#102a4c]">
          {value}
          <span className="text-xs text-slate-400">{suffix}</span>
        </p>
      </div>
      <p className="mt-3 text-[11px] font-black text-slate-400">{label}</p>
    </div>
  );
}

function buildHotspots(
  restaurants: Restaurant[],
  riders: LiveRider[]
): Hotspot[] {
  if (!restaurants.length) return [];

  // Roughly 450-550m cells around Riyadh latitude.
  const latStep = 0.0045;
  const lngStep = 0.005;

  const buckets = new globalThis.Map<string, Restaurant[]>();

  for (const restaurant of restaurants) {
    const latBucket = Math.floor(restaurant.latitude / latStep);
    const lngBucket = Math.floor(restaurant.longitude / lngStep);
    const key = `${latBucket}:${lngBucket}`;

    const current = buckets.get(key) || [];
    current.push(restaurant);
    buckets.set(key, current);
  }

  const maxRestaurants = Math.max(
    1,
    ...Array.from(buckets.values()).map((items) => items.length)
  );

  const hotspots: Hotspot[] = [];

  for (const [id, items] of buckets.entries()) {
    if (items.length < 4) continue;

    const latitude =
      items.reduce((sum, item) => sum + item.latitude, 0) / items.length;

    const longitude =
      items.reduce((sum, item) => sum + item.longitude, 0) / items.length;

    const nearbyRiders = riders.filter(
      (rider) =>
        distanceMeters(
          latitude,
          longitude,
          Number(rider.latitude),
          Number(rider.longitude)
        ) <= 850
    ).length;

    const densityScore = Math.min(
      100,
      (items.length / maxRestaurants) * 100
    );

    const saturationPenalty = Math.min(35, nearbyRiders * 5);

    const baseScore =
      densityScore * 0.82 +
      Math.max(0, 18 - nearbyRiders * 2);

    const score = Math.max(
      1,
      Math.min(
        100,
        Math.round(baseScore - saturationPenalty * 0.35)
      )
    );

    hotspots.push({
      id,
      latitude,
      longitude,
      restaurantCount: items.length,
      nearbyRiders,
      score,
      restaurants: items.sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    });
  }

  return hotspots.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.restaurantCount - a.restaurantCount;
  });
}

function isRiderOnline(rider: LiveRider) {
  if (!rider.is_online) return false;

  const updatedAt = new Date(rider.updated_at).getTime();

  if (Number.isNaN(updatedAt)) return false;

  return Date.now() - updatedAt <= 3 * 60 * 1000;
}

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const earthRadius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}
