"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Flame,
  MapPin,
  RefreshCw,
  Search,
  Smartphone,
  Store,
  Target,
} from "lucide-react";
import MapView, {
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl/maplibre";

import AppLayout, { useLanguage } from "../../../components/AppLayout";

type CityKey = "Jeddah" | "Riyadh";

type Hotspot = {
  id: string;
  city: CityKey;
  area_ar: string;
  area_en: string;
  latitude: number;
  longitude: number;
  activity_score: number;
  restaurant_count: number;
  open_count: number;
  unknown_hours_count: number;
  famous_restaurant_count: number;
  famous_brands: string[];
  density_score: number;
  brand_score: number;
  open_score: number;
  peak_score: number;
  closing_score: number;
  market_signal_score: number | null;
  top_restaurants: Array<{
    name: string;
    famous_brand: string | null;
    open_state: "open" | "closed" | "unknown";
  }>;
};

type RadarResponse = {
  city: CityKey;
  center: {
    latitude: number;
    longitude: number;
  };
  generated_at: string;
  restaurant_count: number;
  hotspot_count: number;
  hotspots: Hotspot[];
  methodology?: {
    rider_locations_used?: boolean;
  };
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

const CITY_CENTER: Record<
  CityKey,
  { latitude: number; longitude: number; zoom: number }
> = {
  Jeddah: {
    latitude: 21.5433,
    longitude: 39.1728,
    zoom: 10.8,
  },
  Riyadh: {
    latitude: 24.7136,
    longitude: 46.6753,
    zoom: 10.7,
  },
};

export default function RestaurantDemandPage() {
  return (
    <AppLayout system="employees">
      <RestaurantDemandContent />
    </AppLayout>
  );
}

function RestaurantDemandContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [city, setCity] = useState<CityKey>("Jeddah");
  const [data, setData] = useState<RadarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [viewState, setViewState] = useState(CITY_CENTER.Jeddah);

  const loadRadar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/restaurant-demand/hotspots?city=${city}&limit=40`,
        { cache: "no-store" }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json?.error || "Radar could not be loaded."
        );
      }

      setData(json as RadarResponse);
    } catch (err: any) {
      console.error("LOAD RESTAURANT RADAR ERROR:", err);
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    const next = CITY_CENTER[city];
    setViewState(next);
    setSelected(null);
    loadRadar();

    const timer = window.setInterval(
      loadRadar,
      5 * 60 * 1000
    );

    return () => window.clearInterval(timer);
  }, [city, loadRadar]);

  const hotspots = data?.hotspots || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return hotspots;

    return hotspots.filter((hotspot) => {
      return (
        hotspot.area_ar.toLowerCase().includes(q) ||
        hotspot.area_en.toLowerCase().includes(q) ||
        hotspot.famous_brands.some((brand) =>
          brand.toLowerCase().includes(q)
        ) ||
        hotspot.top_restaurants.some((restaurant) =>
          restaurant.name.toLowerCase().includes(q)
        )
      );
    });
  }, [hotspots, search]);

  const top = filtered.slice(0, 20);

  const famousTotal = useMemo(
    () =>
      hotspots.reduce(
        (sum, hotspot) =>
          sum + hotspot.famous_restaurant_count,
        0
      ),
    [hotspots]
  );

  const openTotal = useMemo(
    () =>
      hotspots.reduce(
        (sum, hotspot) =>
          sum + hotspot.open_count,
        0
      ),
    [hotspots]
  );

  function focus(hotspot: Hotspot) {
    setSelected(hotspot);
    setViewState({
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
      zoom: 14.7,
    });
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="space-y-5 pb-10">
      <section className="overflow-hidden rounded-[28px] bg-[#0d2c4d] text-white shadow-[0_18px_50px_rgba(13,44,77,0.18)]">
        <div className="flex flex-col gap-5 px-5 py-6 md:px-7 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black text-orange-200">
              <Flame className="h-4 w-4" />
              NEMO RESTAURANT ACTIVITY RADAR
            </div>

            <h1 className="text-2xl font-black md:text-3xl">
              {isAr
                ? "رادار أفضل مناطق المطاعم"
                : "Restaurant Hotspot Radar"}
            </h1>

            <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-slate-300">
              {isAr
                ? "التقييم يعتمد على كثافة المطاعم، وجود البراندات الشهيرة، المطاعم المفتوحة الآن، وقت الذروة وقرب الإغلاق. لا يدخل أي مندوب في التحليل."
                : "Scored from restaurant density, famous brands, open-now status, peak hours and closing strength. Rider data is never used."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={city}
              onChange={(event) =>
                setCity(event.target.value as CityKey)
              }
              className="h-11 rounded-xl border border-white/20 bg-white px-4 text-sm font-black text-[#0d2c4d] outline-none"
            >
              <option value="Jeddah">
                {isAr ? "جدة" : "Jeddah"}
              </option>
              <option value="Riyadh">
                {isAr ? "الرياض" : "Riyadh"}
              </option>
            </select>

            <button
              type="button"
              onClick={loadRadar}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#0d2c4d] hover:bg-slate-100"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              {isAr ? "تحديث" : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          icon={<Store className="h-5 w-5" />}
          label={isAr ? "المطاعم المكتشفة" : "Restaurants"}
          value={data?.restaurant_count || 0}
        />
        <Stat
          icon={<Target className="h-5 w-5" />}
          label={
            isAr
              ? "مطاعم شهيرة داخل التجمعات"
              : "Famous Restaurants"
          }
          value={famousTotal}
        />
        <Stat
          icon={<Clock3 className="h-5 w-5" />}
          label={isAr ? "مفتوح الآن" : "Open Now"}
          value={openTotal}
        />
        <Stat
          icon={<Flame className="h-5 w-5" />}
          label={isAr ? "أعلى تقييم" : "Best Score"}
          value={hotspots[0]?.activity_score || 0}
          suffix="/100"
        />
      </section>

      <section className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

          <div>
            <p className="text-sm font-black text-emerald-900">
              {isAr
                ? "جاهز لتطبيق المندوب"
                : "Rider-app ready"}
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-emerald-700">
              {isAr
                ? "الداشبورد وتطبيق المندوب سيستخدمان نفس API، لذلك أي تعديل في طريقة التقييم سيظهر للطرفين بدون بناء معادلتين مختلفتين."
                : "Dashboard and rider app consume the same API, so scoring changes remain identical everywhere."}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1fr_400px]">
        <div className="relative min-h-[680px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <MapView
            {...viewState}
            onMove={(event) =>
              setViewState(event.viewState)
            }
            mapStyle={MAP_STYLE}
            style={{
              width: "100%",
              height: 680,
            }}
          >
            <NavigationControl
              position={
                isAr ? "top-left" : "top-right"
              }
            />

            {top.map((hotspot, index) => (
              <Marker
                key={hotspot.id}
                longitude={hotspot.longitude}
                latitude={hotspot.latitude}
                anchor="center"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  setSelected(hotspot);
                }}
              >
                <button
                  type="button"
                  className={[
                    "flex h-12 min-w-12 items-center justify-center rounded-full border-4 border-white px-2 text-xs font-black text-white shadow-xl",
                    hotspot.activity_score >= 85
                      ? "bg-red-600"
                      : hotspot.activity_score >= 70
                        ? "bg-orange-500"
                        : hotspot.activity_score >= 55
                          ? "bg-amber-500"
                          : "bg-slate-500",
                  ].join(" ")}
                >
                  {index + 1}
                </button>
              </Marker>
            ))}

            {selected && (
              <Popup
                longitude={selected.longitude}
                latitude={selected.latitude}
                anchor="bottom"
                closeOnClick={false}
                onClose={() => setSelected(null)}
              >
                <div
                  dir={isAr ? "rtl" : "ltr"}
                  className="min-w-[270px] p-1"
                >
                  <p className="text-base font-black text-[#102a4c]">
                    {isAr
                      ? selected.area_ar
                      : selected.area_en}
                  </p>

                  <p className="mt-1 text-xs font-black text-red-600">
                    Activity {selected.activity_score}/100
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
                    <span>
                      {isAr ? "المطاعم" : "Restaurants"}
                    </span>
                    <strong>
                      {selected.restaurant_count}
                    </strong>

                    <span>
                      {isAr
                        ? "المطاعم الشهيرة"
                        : "Famous"}
                    </span>
                    <strong>
                      {selected.famous_restaurant_count}
                    </strong>

                    <span>
                      {isAr ? "مفتوح الآن" : "Open"}
                    </span>
                    <strong>
                      {selected.open_count}
                    </strong>

                    <span>
                      {isAr ? "كثافة" : "Density"}
                    </span>
                    <strong>
                      {selected.density_score}
                    </strong>
                  </div>

                  {selected.famous_brands.length > 0 && (
                    <p className="mt-3 max-w-[260px] text-[10px] font-semibold leading-5 text-slate-500">
                      {selected.famous_brands.join(" • ")}
                    </p>
                  )}
                </div>
              </Popup>
            )}
          </MapView>

          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <div className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-600 shadow-xl">
                {isAr
                  ? "جاري تحليل المطاعم..."
                  : "Analyzing restaurants..."}
              </div>
            </div>
          )}
        </div>

        <aside className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <h2 className="font-black text-[#102a4c]">
              {isAr
                ? `أفضل مناطق ${city === "Jeddah" ? "جدة" : "الرياض"} الآن`
                : `Best ${city} Hotspots Now`}
            </h2>

            <p className="mt-1 text-[10px] font-semibold text-slate-400">
              {isAr
                ? "ترتيب تشغيلي للمطاعم وليس عدد طلبات هنجرستيشن."
                : "Operational restaurant ranking, not live HungerStation order counts."}
            </p>

            <div className="relative mt-3">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                  isAr ? "right-3" : "left-3"
                }`}
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={
                  isAr
                    ? "بحث بمنطقة أو مطعم أو براند..."
                    : "Search area, restaurant or brand..."
                }
                className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none focus:border-orange-300 ${
                  isAr ? "pr-9 pl-3" : "pl-9 pr-3"
                }`}
              />
            </div>
          </div>

          <div className="max-h-[620px] space-y-2 overflow-y-auto p-3">
            {top.map((hotspot, index) => (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => focus(hotspot)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-start transition hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white",
                      hotspot.activity_score >= 85
                        ? "bg-red-600"
                        : hotspot.activity_score >= 70
                          ? "bg-orange-500"
                          : hotspot.activity_score >= 55
                            ? "bg-amber-500"
                            : "bg-slate-500",
                    ].join(" ")}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-[#102a4c]">
                        {isAr
                          ? hotspot.area_ar
                          : hotspot.area_en}
                      </p>

                      <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-black text-red-600 shadow-sm">
                        {hotspot.activity_score}/100
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                      <span>
                        {hotspot.restaurant_count}{" "}
                        {isAr ? "مطعم" : "restaurants"}
                      </span>
                      <span>
                        {hotspot.famous_restaurant_count}{" "}
                        {isAr ? "شهير" : "famous"}
                      </span>
                      <span>
                        {hotspot.open_count}{" "}
                        {isAr ? "مفتوح" : "open"}
                      </span>
                      <span>
                        Brand {hotspot.brand_score}
                      </span>
                    </div>

                    {hotspot.famous_brands.length > 0 && (
                      <p className="mt-2 truncate text-[10px] font-semibold text-orange-700">
                        {hotspot.famous_brands
                          .slice(0, 4)
                          .join(" • ")}
                      </p>
                    )}

                    <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                      {hotspot.top_restaurants
                        .slice(0, 3)
                        .map(
                          (restaurant) =>
                            restaurant.name
                        )
                        .join(" • ")}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {!loading && top.length === 0 && (
              <div className="py-16 text-center text-xs font-black text-slate-400">
                {isAr
                  ? "لا توجد نتائج مطابقة."
                  : "No matching results."}
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black text-[#102a4c]">
          {isAr
            ? "معادلة النسخة الحالية"
            : "Current scoring model"}
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <Factor
            label={isAr ? "كثافة المطاعم" : "Density"}
            weight="35%"
          />
          <Factor
            label={
              isAr
                ? "المطاعم الشهيرة"
                : "Famous Brands"
            }
            weight="30%"
          />
          <Factor
            label={isAr ? "مفتوح الآن" : "Open Now"}
            weight="15%"
          />
          <Factor
            label={isAr ? "وقت الذروة" : "Peak Time"}
            weight="15%"
          />
          <Factor
            label={
              isAr
                ? "قوة وقت الإغلاق"
                : "Closing Strength"
            }
            weight="5%"
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
          {icon}
        </div>

        <p className="text-2xl font-black text-[#102a4c]">
          {value}
          <span className="text-xs text-slate-400">
            {suffix}
          </span>
        </p>
      </div>

      <p className="mt-3 text-[11px] font-black text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Factor({
  label,
  weight,
}: {
  label: string;
  weight: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-black text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-[#102a4c]">
        {weight}
      </p>
    </div>
  );
}
