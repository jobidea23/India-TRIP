import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const reverse = searchParams.get("reverse") === "1";

  try {
    if (reverse && lat && lon) {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
        headers: { "User-Agent": "IndiaTrip/1.0", "Accept-Language": "en" },
      });
      const data = await res.json();
      return NextResponse.json({ display_name: data.display_name || "Selected location" });
    }
    if (q) {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&addressdetails=1`, {
        headers: { "User-Agent": "IndiaTrip/1.0", "Accept-Language": "en" },
      });
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (e) {
    return NextResponse.json({ error: "Geocode failed" }, { status: 500 });
  }
}
