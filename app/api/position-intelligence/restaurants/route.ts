import { NextResponse } from "next/server";

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string>;
};

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

export async function GET() {
  try {
    // Riyadh urban operating area.
    // This is intentionally a bounding box for a fast V1.
    const south = 24.45;
    const west = 46.38;
    const north = 25.02;
    const east = 47.05;

    const query = `
      [out:json][timeout:30];
      (
        node["amenity"="restaurant"](${south},${west},${north},${east});
        node["amenity"="fast_food"](${south},${west},${north},${east});
        node["amenity"="cafe"](${south},${west},${north},${east});
        way["amenity"="restaurant"](${south},${west},${north},${east});
        way["amenity"="fast_food"](${south},${west},${north},${east});
        way["amenity"="cafe"](${south},${west},${north},${east});
      );
      out center tags;
    `;

    const response = await fetch(OVERPASS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": "Nemo-Position-Optimizer/1.0",
      },
      body: new URLSearchParams({
        data: query,
      }).toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `OpenStreetMap restaurant service returned ${response.status}`
      );
    }

    const result = await response.json();
    const elements = (result?.elements || []) as OverpassElement[];

    const restaurants = elements
      .map((element) => {
        const latitude = element.lat ?? element.center?.lat;
        const longitude = element.lon ?? element.center?.lon;

        if (
          typeof latitude !== "number" ||
          typeof longitude !== "number"
        ) {
          return null;
        }

        const name =
          element.tags?.name ||
          element.tags?.["name:ar"] ||
          element.tags?.brand ||
          "Restaurant";

        return {
          id: `${element.type}-${element.id}`,
          name,
          latitude,
          longitude,
          cuisine: element.tags?.cuisine || null,
        };
      })
      .filter(Boolean);

    return NextResponse.json(
      {
        count: restaurants.length,
        restaurants,
        source: "OpenStreetMap",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    console.error("POSITION RESTAURANTS API ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Restaurant data could not be loaded.",
      },
      {
        status: 500,
      }
    );
  }
}
