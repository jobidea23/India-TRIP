import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const reverse = searchParams.get("reverse") === "1";

  try {
    if (reverse && lat && lon) {
      const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&limit=1`);
      const data = await res.json();
      const f = data?.features?.[0];
      const addr = f ? [f.properties.name, f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(", ") : "Selected location";
      return NextResponse.json({ display_name: addr });
    }
    if (q) {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      const results = (data?.features || []).map((f: any) => ({
        display_name: [f.properties.name, f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(", "),
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
      }));
      return NextResponse.json(results);
    }
    return NextResponse.json([]);
  } catch (e) {
    return NextResponse.json({ error: "Geocode failed" }, { status: 500 });
  }
}
