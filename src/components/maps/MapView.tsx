"use client";
import { useEffect, useRef } from "react";
import { isMapsConfigured, loadGoogleMaps } from "@/lib/googleMaps";

interface Props {
  center?: { lat: number; lng: number };
  markers?: { lat: number; lng: number; label?: string; color?: string }[];
  zoom?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export default function MapView({ center, markers = [], zoom = 13, className = "", fallback }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isMapsConfigured()) return;
      const ok = await loadGoogleMaps();
      if (!ok || cancelled || !ref.current) return;
      const g = (window as any).google;
      const c = center || (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 28.6139, lng: 77.209 });
      const map = new g.maps.Map(ref.current, { center: c, zoom });
      mapRef.current = map;
      markers.forEach((m) => {
        new g.maps.Marker({ position: { lat: m.lat, lng: m.lng }, map, title: m.label });
      });
    })();
    return () => { cancelled = true; };
  }, [center, markers, zoom]);

  if (!isMapsConfigured()) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center ${className}`}>
        {fallback || <span className="text-gray-500 text-sm">Map (demo mode — configure Google Maps API key)</span>}
      </div>
    );
  }
  return <div ref={ref} className={className} />;
}
