"use client";
import { useEffect, useRef } from "react";

interface Props {
  center: { lat: number; lng: number };
  markers?: { lat: number; lng: number; label?: string }[];
  onCenterChange?: (loc: { lat: number; lng: number }) => void;
  zoom?: number;
  className?: string;
}

export default function LeafletMap({ center, markers = [], onCenterChange, zoom = 15, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Load Leaflet CSS
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector('link[href*="leaflet.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current).setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      map.on("moveend", () => {
        const c = map.getCenter();
        onCenterChange?.({ lat: c.lat, lng: c.lng });
      });

      // Initial markers
      markers.forEach((m) => {
        const marker = L.marker([m.lat, m.lng]).addTo(map);
        if (m.label) marker.bindPopup(m.label);
        markersRef.current.push(marker);
      });
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!mapRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      // remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      markers.forEach((m) => {
        const marker = L.marker([m.lat, m.lng]).addTo(mapRef.current);
        if (m.label) marker.bindPopup(m.label);
        markersRef.current.push(marker);
      });
    })();
  }, [markers]);

  // Update view when center changes externally
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  return <div ref={containerRef} className={className} style={{ height: "100%", width: "100%" }} />;
}
