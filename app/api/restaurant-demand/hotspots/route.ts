import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CityKey = "Jeddah" | "Riyadh";

type Restaurant = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  amenity: string | null;
  cuisine: string | null;
  opening_hours: string | null;
};

type RuntimeRestaurant = Restaurant & {
  openState: "open" | "closed" | "unknown";
  minutesToClose: number | null;
  peakScore: number;
  famousBrand: string | null;
  famousBrandWeight: number;
};

type MarketSignal = {
  restaurant_rank: number | null;
  is_available: boolean | null;
  latitude: number | null;
  longitude: number | null;
  observed_at: string;
};

type AreaCenter = {
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
};

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

const CITY_CONFIG: Record<
  CityKey,
  {
    center: { latitude: number; longitude: number };
    bounds: {
      south: number;
      west: number;
      north: number;
      east: number;
    };
    areas: AreaCenter[];
  }
> = {
  Jeddah: {
    center: { latitude: 21.5433, longitude: 39.1728 },
    bounds: {
      south: 21.28,
      west: 39.00,
      north: 21.83,
      east: 39.34,
    },
    areas: [
      { nameAr: "الروضة", nameEn: "Al Rawdah", latitude: 21.565, longitude: 39.154 },
      { nameAr: "السلامة", nameEn: "Al Salamah", latitude: 21.598, longitude: 39.159 },
      { nameAr: "الزهراء", nameEn: "Al Zahra", latitude: 21.592, longitude: 39.129 },
      { nameAr: "النهضة", nameEn: "Al Nahdah", latitude: 21.619, longitude: 39.147 },
      { nameAr: "المحمدية", nameEn: "Al Muhammadiyah", latitude: 21.650, longitude: 39.136 },
      { nameAr: "الصفا", nameEn: "Al Safa", latitude: 21.584, longitude: 39.199 },
      { nameAr: "النعيم", nameEn: "Al Naim", latitude: 21.635, longitude: 39.157 },
      { nameAr: "الخالدية", nameEn: "Al Khalidiyah", latitude: 21.563, longitude: 39.142 },
      { nameAr: "الأندلس", nameEn: "Al Andalus", latitude: 21.548, longitude: 39.160 },
      { nameAr: "المروة", nameEn: "Al Marwah", latitude: 21.621, longitude: 39.204 },
      { nameAr: "الحمدانية", nameEn: "Al Hamdaniyah", latitude: 21.722, longitude: 39.203 },
      { nameAr: "الربوة", nameEn: "Al Rabwah", latitude: 21.603, longitude: 39.179 },
      { nameAr: "البوادي", nameEn: "Al Bawadi", latitude: 21.602, longitude: 39.174 },
      { nameAr: "الفيصلية", nameEn: "Al Faisaliyah", latitude: 21.575, longitude: 39.184 },
      { nameAr: "العزيزية", nameEn: "Al Aziziyah", latitude: 21.559, longitude: 39.191 },
      { nameAr: "مشرفة", nameEn: "Mishrifah", latitude: 21.536, longitude: 39.194 },
      { nameAr: "النسيم", nameEn: "Al Naseem", latitude: 21.521, longitude: 39.225 },
      { nameAr: "السامر", nameEn: "Al Samer", latitude: 21.600, longitude: 39.240 },
      { nameAr: "أبحر الجنوبية", nameEn: "South Obhur", latitude: 21.715, longitude: 39.104 },
      { nameAr: "أبحر الشمالية", nameEn: "North Obhur", latitude: 21.755, longitude: 39.115 },
    ],
  },
  Riyadh: {
    center: { latitude: 24.7136, longitude: 46.6753 },
    bounds: {
      south: 24.45,
      west: 46.38,
      north: 25.02,
      east: 47.05,
    },
    areas: [
      { nameAr: "النرجس", nameEn: "Al Narjis", latitude: 24.8266, longitude: 46.6514 },
      { nameAr: "الياسمين", nameEn: "Al Yasmin", latitude: 24.8221, longitude: 46.6335 },
      { nameAr: "الملقا", nameEn: "Al Malqa", latitude: 24.7965, longitude: 46.6152 },
      { nameAr: "الصحافة", nameEn: "Al Sahafah", latitude: 24.7898, longitude: 46.6501 },
      { nameAr: "الربيع", nameEn: "Ar Rabi", latitude: 24.7963, longitude: 46.6820 },
      { nameAr: "الغدير", nameEn: "Al Ghadir", latitude: 24.7726, longitude: 46.6571 },
      { nameAr: "العقيق", nameEn: "Al Aqiq", latitude: 24.7748, longitude: 46.6237 },
      { nameAr: "حطين", nameEn: "Hittin", latitude: 24.7623, longitude: 46.6038 },
      { nameAr: "قرطبة", nameEn: "Qurtubah", latitude: 24.8176, longitude: 46.7346 },
      { nameAr: "غرناطة", nameEn: "Ghirnatah", latitude: 24.7904, longitude: 46.7467 },
      { nameAr: "الروضة", nameEn: "Ar Rawdah", latitude: 24.7334, longitude: 46.7576 },
      { nameAr: "السليمانية", nameEn: "As Sulaymaniyah", latitude: 24.6965, longitude: 46.7049 },
      { nameAr: "العليا", nameEn: "Al Olaya", latitude: 24.6914, longitude: 46.6855 },
      { nameAr: "الملز", nameEn: "Al Malaz", latitude: 24.6679, longitude: 46.7350 },
    ],
  },
};

const FAMOUS_BRANDS: Array<{
  canonical: string;
  weight: number;
  aliases: string[];
}> = [
  { canonical: "AlBaik", weight: 100, aliases: ["albaik", "al baik", "البيك"] },
  { canonical: "McDonald's", weight: 100, aliases: ["mcdonald", "ماكدونالد"] },
  { canonical: "KFC", weight: 96, aliases: ["kfc", "kentucky", "كنتاكي"] },
  { canonical: "Starbucks", weight: 92, aliases: ["starbucks", "ستاربكس"] },
  { canonical: "Burger King", weight: 90, aliases: ["burger king", "برجر كنج", "برغر كينغ"] },
  { canonical: "Pizza Hut", weight: 88, aliases: ["pizza hut", "بيتزا هت"] },
  { canonical: "Domino's", weight: 88, aliases: ["domino", "دومينوز"] },
  { canonical: "Maestro Pizza", weight: 88, aliases: ["maestro pizza", "مايسترو بيتزا"] },
  { canonical: "Herfy", weight: 86, aliases: ["herfy", "هرفي"] },
  { canonical: "Al Tazaj", weight: 86, aliases: ["al tazaj", "tazaj", "الطازج"] },
  { canonical: "Shawarmer", weight: 84, aliases: ["shawarmer", "شاورمر"] },
  { canonical: "Kudu", weight: 82, aliases: ["kudu", "كودو"] },
  { canonical: "Barn's", weight: 82, aliases: ["barn's", "barns", "بارنز"] },
  { canonical: "Dunkin", weight: 82, aliases: ["dunkin", "دانكن"] },
  { canonical: "Tim Hortons", weight: 82, aliases: ["tim hortons", "تيم هورتنز"] },
  { canonical: "Hardee's", weight: 82, aliases: ["hardee", "هارديز"] },
  { canonical: "Popeyes", weight: 82, aliases: ["popeyes", "بوبايز"] },
  { canonical: "Raising Cane's", weight: 86, aliases: ["raising cane", "cane's", "كينز"] },
  { canonical: "Five Guys", weight: 86, aliases: ["five guys", "فايف قايز", "فايف جايز"] },
  { canonical: "Shake Shack", weight: 86, aliases: ["shake shack", "شيك شاك"] },
  { canonical: "Subway", weight: 76, aliases: ["subway", "صب واي", "صبواي"] },
];

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

export async function GET(request: NextRequest) {
  try {
    const requestedCity = request.nextUrl.searchParams.get("city");
    const city: CityKey =
      requestedCity === "Riyadh" ? "Riyadh" : "Jeddah";

    const requestedLimit = Number(
      request.nextUrl.searchParams.get("limit") || 30
    );
    const limit = Math.max(1, Math.min(50, requestedLimit));

    const config = CITY_CONFIG[city];
    const restaurants = await fetchRestaurants(city, config.bounds);
    const marketSignals = await fetchRecentMarketSignals(city);

    const hotspots = buildHotspots(
      city,
      restaurants,
      marketSignals,
      config.areas
    ).slice(0, limit);

    return NextResponse.json(
      {
        city,
        center: config.center,
        generated_at: new Date().toISOString(),
        source: {
          restaurants: "OpenStreetMap",
          market_signals:
            marketSignals.length > 0
              ? "restaurant_market_signals"
              : null,
        },
        methodology: {
          rider_locations_used: false,
          weights: {
            restaurant_density: 35,
            famous_restaurants: 30,
            open_now: 15,
            peak_time: 15,
            closing_strength: 5,
          },
          note:
            "Activity score is an operational restaurant-area signal, not a live HungerStation order count.",
        },
        restaurant_count: restaurants.length,
        hotspot_count: hotspots.length,
        hotspots,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=900",
        },
      }
    );
  } catch (error: any) {
    console.error("RESTAURANT HOTSPOTS API ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Restaurant hotspots could not be calculated.",
      },
      { status: 500 }
    );
  }
}

async function fetchRestaurants(
  city: CityKey,
  bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  }
): Promise<Restaurant[]> {
  const query = `
    [out:json][timeout:40];
    (
      nwr["amenity"~"^(restaurant|fast_food|cafe)$"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
    );
    out center tags;
  `;

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": `Nemo-Restaurant-Radar-${city}/3.0`,
    },
    body: new URLSearchParams({ data: query }).toString(),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `OpenStreetMap restaurant service returned ${response.status}`
    );
  }

  const result = await response.json();

  return (result?.elements || [])
    .map((element: any) => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;

      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number"
      ) {
        return null;
      }

      const tags = element.tags || {};

      return {
        id: `${element.type}-${element.id}`,
        name:
          tags["name:ar"] ||
          tags.name ||
          tags.brand ||
          "Restaurant",
        latitude,
        longitude,
        amenity: tags.amenity || null,
        cuisine: tags.cuisine || null,
        opening_hours: tags.opening_hours || null,
      } as Restaurant;
    })
    .filter(Boolean) as Restaurant[];
}

async function fetchRecentMarketSignals(
  city: CityKey
): Promise<MarketSignal[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRole) {
      return [];
    }

    const supabase = createClient(url, serviceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const since = new Date(
      Date.now() - 90 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from("restaurant_market_signals")
      .select(
        "restaurant_rank,is_available,latitude,longitude,observed_at"
      )
      .eq("city", city)
      .gte("observed_at", since)
      .order("observed_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.warn(
        "MARKET SIGNAL READ WARNING:",
        error.message
      );
      return [];
    }

    return (data || []) as MarketSignal[];
  } catch (error) {
    console.warn("MARKET SIGNALS DISABLED:", error);
    return [];
  }
}

function buildHotspots(
  city: CityKey,
  restaurants: Restaurant[],
  signals: MarketSignal[],
  areas: AreaCenter[]
): Hotspot[] {
  if (!restaurants.length) return [];

  const now = getSaudiParts(new Date());

  // Approx. 450-550 meter operating cells.
  const latStep = city === "Jeddah" ? 0.0045 : 0.0045;
  const lngStep = city === "Jeddah" ? 0.0048 : 0.005;

  const runtime: RuntimeRestaurant[] = restaurants.map(
    (restaurant) => {
      const opening = getOpeningState(
        restaurant.opening_hours,
        now
      );
      const famous = detectFamousBrand(restaurant.name);

      return {
        ...restaurant,
        ...opening,
        peakScore: getPeakScore(
          restaurant,
          now.hour,
          now.weekday
        ),
        famousBrand: famous?.canonical || null,
        famousBrandWeight: famous?.weight || 0,
      };
    }
  );

  const buckets = new globalThis.Map<
    string,
    RuntimeRestaurant[]
  >();

  for (const restaurant of runtime) {
    const a = Math.floor(restaurant.latitude / latStep);
    const b = Math.floor(restaurant.longitude / lngStep);
    const key = `${a}:${b}`;

    const current = buckets.get(key) || [];
    current.push(restaurant);
    buckets.set(key, current);
  }

  const eligible = Array.from(buckets.values()).filter(
    (items) => items.length >= 4
  );

  const maxRestaurants = Math.max(
    1,
    ...eligible.map((items) => items.length)
  );

  const maxFamous = Math.max(
    1,
    ...eligible.map(
      (items) =>
        items.filter((item) => item.famousBrand).length
    )
  );

  const results: Hotspot[] = [];

  for (const [id, items] of buckets.entries()) {
    if (items.length < 4) continue;

    const latitude =
      items.reduce((sum, item) => sum + item.latitude, 0) /
      items.length;
    const longitude =
      items.reduce((sum, item) => sum + item.longitude, 0) /
      items.length;

    const nearestArea = findNearestArea(
      latitude,
      longitude,
      areas
    );

    const openCount = items.filter(
      (item) => item.openState === "open"
    ).length;

    const closedCount = items.filter(
      (item) => item.openState === "closed"
    ).length;

    const unknownHoursCount = items.filter(
      (item) => item.openState === "unknown"
    ).length;

    const knownCount = openCount + closedCount;
    const openScore =
      knownCount > 0
        ? Math.round((openCount / knownCount) * 100)
        : 65;

    const densityScore = Math.min(
      100,
      Math.round(
        (items.length / maxRestaurants) * 100
      )
    );

    const famousItems = items.filter(
      (item) => item.famousBrand
    );

    const uniqueBrands = Array.from(
      new Set(
        famousItems
          .map((item) => item.famousBrand)
          .filter(Boolean) as string[]
      )
    );

    const famousCountScore = Math.min(
      100,
      Math.round(
        (famousItems.length / maxFamous) * 100
      )
    );

    const famousWeightAvg =
      famousItems.length > 0
        ? famousItems.reduce(
            (sum, item) => sum + item.famousBrandWeight,
            0
          ) / famousItems.length
        : 0;

    const brandScore = Math.round(
      famousCountScore * 0.65 +
        famousWeightAvg * 0.35
    );

    const peakScore = Math.round(
      items.reduce(
        (sum, item) => sum + item.peakScore,
        0
      ) / items.length
    );

    const closingItems = items.filter(
      (item) =>
        item.openState === "open" &&
        item.minutesToClose !== null
    );

    const closingScore =
      closingItems.length === 0
        ? 70
        : Math.round(
            closingItems.reduce((sum, item) => {
              const minutes = item.minutesToClose || 0;

              if (minutes >= 180) return sum + 100;
              if (minutes >= 120) return sum + 90;
              if (minutes >= 60) return sum + 75;
              if (minutes >= 30) return sum + 50;
              return sum + 20;
            }, 0) / closingItems.length
          );

    const baseScore =
      densityScore * 0.35 +
      brandScore * 0.30 +
      openScore * 0.15 +
      peakScore * 0.15 +
      closingScore * 0.05;

    const nearbySignals = signals.filter(
      (signal) =>
        signal.latitude !== null &&
        signal.longitude !== null &&
        distanceMeters(
          latitude,
          longitude,
          Number(signal.latitude),
          Number(signal.longitude)
        ) <= 1200
    );

    const marketSignalScore =
      nearbySignals.length > 0
        ? calculateMarketSignalScore(nearbySignals)
        : null;

    const activityScore = Math.max(
      1,
      Math.min(
        100,
        Math.round(
          marketSignalScore === null
            ? baseScore
            : baseScore * 0.8 +
                marketSignalScore * 0.2
        )
      )
    );

    results.push({
      id,
      city,
      area_ar: nearestArea.nameAr,
      area_en: nearestArea.nameEn,
      latitude,
      longitude,
      activity_score: activityScore,
      restaurant_count: items.length,
      open_count: openCount,
      unknown_hours_count: unknownHoursCount,
      famous_restaurant_count: famousItems.length,
      famous_brands: uniqueBrands.slice(0, 8),
      density_score: densityScore,
      brand_score: brandScore,
      open_score: openScore,
      peak_score: peakScore,
      closing_score: closingScore,
      market_signal_score: marketSignalScore,
      top_restaurants: items
        .sort((a, b) => {
          if (b.famousBrandWeight !== a.famousBrandWeight) {
            return b.famousBrandWeight - a.famousBrandWeight;
          }
          if (a.openState !== b.openState) {
            return a.openState === "open" ? -1 : 1;
          }
          return b.peakScore - a.peakScore;
        })
        .slice(0, 8)
        .map((item) => ({
          name: item.name,
          famous_brand: item.famousBrand,
          open_state: item.openState,
        })),
    });
  }

  return results.sort((a, b) => {
    if (b.activity_score !== a.activity_score) {
      return b.activity_score - a.activity_score;
    }
    if (
      b.famous_restaurant_count !==
      a.famous_restaurant_count
    ) {
      return (
        b.famous_restaurant_count -
        a.famous_restaurant_count
      );
    }
    return b.restaurant_count - a.restaurant_count;
  });
}

function detectFamousBrand(name: string) {
  const normalized = normalizeText(name);

  return (
    FAMOUS_BRANDS.find((brand) =>
      brand.aliases.some((alias) =>
        normalized.includes(normalizeText(alias))
      )
    ) || null
  );
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .trim();
}

function findNearestArea(
  latitude: number,
  longitude: number,
  areas: AreaCenter[]
) {
  let best = areas[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const area of areas) {
    const distance = distanceMeters(
      latitude,
      longitude,
      area.latitude,
      area.longitude
    );

    if (distance < bestDistance) {
      best = area;
      bestDistance = distance;
    }
  }

  return best;
}

function calculateMarketSignalScore(
  signals: MarketSignal[]
) {
  const now = Date.now();

  const weighted = signals
    .map((signal) => {
      const observed = new Date(
        signal.observed_at
      ).getTime();

      const ageMinutes =
        (now - observed) / 60000;

      if (
        !Number.isFinite(ageMinutes) ||
        ageMinutes > 90
      ) {
        return null;
      }

      const freshness = Math.max(
        0.25,
        1 - ageMinutes / 120
      );

      let rankScore = 50;
      const rank = signal.restaurant_rank;

      if (rank !== null) {
        if (rank <= 5) rankScore = 100;
        else if (rank <= 10) rankScore = 90;
        else if (rank <= 20) rankScore = 75;
        else if (rank <= 35) rankScore = 55;
        else if (rank <= 60) rankScore = 35;
        else rankScore = 20;
      }

      if (signal.is_available === false) {
        rankScore *= 0.25;
      }

      return {
        score: rankScore,
        weight: freshness,
      };
    })
    .filter(Boolean) as Array<{
    score: number;
    weight: number;
  }>;

  if (!weighted.length) return 50;

  const totalWeight = weighted.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  return Math.round(
    weighted.reduce(
      (sum, item) =>
        sum + item.score * item.weight,
      0
    ) / totalWeight
  );
}

function getPeakScore(
  restaurant: Restaurant,
  hour: number,
  weekday: number
) {
  const text = [
    restaurant.amenity || "",
    restaurant.cuisine || "",
    restaurant.name || "",
  ]
    .join(" ")
    .toLowerCase();

  const weekend =
    weekday === 4 || weekday === 5 || weekday === 6;

  if (
    containsAny(text, [
      "cafe",
      "coffee",
      "bakery",
      "breakfast",
      "قهوة",
      "مخبوز",
      "فطور",
    ])
  ) {
    if (hour >= 6 && hour < 11) return 95;
    if (hour >= 16 && hour < 22) return 82;
    return 45;
  }

  if (
    containsAny(text, [
      "dessert",
      "ice_cream",
      "juice",
      "حل",
      "ايس",
      "عصير",
    ])
  ) {
    if (hour >= 19 || hour < 2) return 95;
    if (hour >= 15 && hour < 19) return 75;
    return 35;
  }

  if (
    containsAny(text, [
      "fast_food",
      "burger",
      "pizza",
      "chicken",
      "shawarma",
      "sandwich",
      "برجر",
      "بيتزا",
      "شاورما",
      "دجاج",
    ])
  ) {
    if (hour >= 18 || hour < 2)
      return weekend ? 100 : 95;
    if (hour >= 12 && hour < 16) return 88;
    return 52;
  }

  if (hour >= 18 || hour < 1)
    return weekend ? 96 : 90;
  if (hour >= 12 && hour < 16) return 86;
  if (hour >= 7 && hour < 11) return 55;

  return 42;
}

function containsAny(
  text: string,
  words: string[]
) {
  return words.some((word) => text.includes(word));
}

type SaudiParts = {
  weekday: number;
  hour: number;
  minute: number;
  totalMinutes: number;
};

function getSaudiParts(date: Date): SaudiParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ||
    "";

  const weekdays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const hour = Number(get("hour")) || 0;
  const minute = Number(get("minute")) || 0;

  return {
    weekday: weekdays[get("weekday")] ?? 0,
    hour,
    minute,
    totalMinutes: hour * 60 + minute,
  };
}

function getOpeningState(
  openingHours: string | null,
  now: SaudiParts
): {
  openState: "open" | "closed" | "unknown";
  minutesToClose: number | null;
} {
  if (!openingHours || !openingHours.trim()) {
    return {
      openState: "unknown",
      minutesToClose: null,
    };
  }

  const text = openingHours.trim();

  if (text === "24/7") {
    return {
      openState: "open",
      minutesToClose: 24 * 60,
    };
  }

  const rules = text
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean);

  const currentDayCode = [
    "Su",
    "Mo",
    "Tu",
    "We",
    "Th",
    "Fr",
    "Sa",
  ][now.weekday];

  let matchedDay = false;

  for (const rule of rules) {
    const match = rule.match(
      /^([A-Za-z,-]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/
    );

    if (match) {
      if (!dayMatches(match[1], currentDayCode)) {
        continue;
      }

      matchedDay = true;

      const state = evaluateTimeRange(
        now.totalMinutes,
        match[2],
        match[3]
      );

      if (state.openState === "open") {
        return state;
      }

      continue;
    }

    const daily = rule.match(
      /^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/
    );

    if (daily) {
      return evaluateTimeRange(
        now.totalMinutes,
        daily[1],
        daily[2]
      );
    }
  }

  if (matchedDay) {
    return {
      openState: "closed",
      minutesToClose: null,
    };
  }

  return {
    openState: "unknown",
    minutesToClose: null,
  };
}

function evaluateTimeRange(
  nowMinutes: number,
  startText: string,
  endText: string
): {
  openState: "open" | "closed";
  minutesToClose: number | null;
} {
  const start = parseTime(startText);
  const end = parseTime(endText);

  if (start === null || end === null) {
    return {
      openState: "closed",
      minutesToClose: null,
    };
  }

  if (end > start) {
    if (
      nowMinutes >= start &&
      nowMinutes < end
    ) {
      return {
        openState: "open",
        minutesToClose: end - nowMinutes,
      };
    }

    return {
      openState: "closed",
      minutesToClose: null,
    };
  }

  if (nowMinutes >= start) {
    return {
      openState: "open",
      minutesToClose:
        24 * 60 - nowMinutes + end,
    };
  }

  if (nowMinutes < end) {
    return {
      openState: "open",
      minutesToClose: end - nowMinutes,
    };
  }

  return {
    openState: "closed",
    minutesToClose: null,
  };
}

function parseTime(value: string) {
  const match = value.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 24 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function dayMatches(
  daySpec: string,
  currentDay: string
) {
  const codes = [
    "Mo",
    "Tu",
    "We",
    "Th",
    "Fr",
    "Sa",
    "Su",
  ];

  return daySpec.split(",").some((part) => {
    const trimmed = part.trim();

    if (trimmed === currentDay) return true;

    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-");
      const startIndex = codes.indexOf(start);
      const endIndex = codes.indexOf(end);
      const currentIndex =
        codes.indexOf(currentDay);

      if (
        startIndex < 0 ||
        endIndex < 0 ||
        currentIndex < 0
      ) {
        return false;
      }

      if (startIndex <= endIndex) {
        return (
          currentIndex >= startIndex &&
          currentIndex <= endIndex
        );
      }

      return (
        currentIndex >= startIndex ||
        currentIndex <= endIndex
      );
    }

    return false;
  });
}

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const radius = 6371000;
  const toRad = (value: number) =>
    (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return (
    2 *
    radius *
    Math.asin(Math.sqrt(a))
  );
}
