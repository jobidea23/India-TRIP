"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { rtdb } from "@/lib/firebase";
import { ref, set, onValue } from "firebase/database";

export function useLocationTracking(enabled = true) {
  const setLocation = useAppStore((s) => s.setLocation);
  const role = useAppStore((s) => s.role);
  const user = useAppStore((s) => s.user);
  const driver = useAppStore((s) => s.driver);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        // Push to Firebase RTDB when configured and role is driver
        if (rtdb && role === "driver" && driver?.id) {
          try {
            set(ref(rtdb, `driverLocations/${driver.id}`), {
              lat: loc.lat,
              lng: loc.lng,
              updatedAt: Date.now(),
            });
          } catch {}
        }
      },
      (err) => console.warn("geolocation error", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled, role, driver?.id, setLocation]);
}

// Subscribe to a driver's live location from RTDB
export function useDriverLocation(driverId: string | null, cb: (loc: { lat: number; lng: number } | null) => void) {
  useEffect(() => {
    if (!rtdb || !driverId) return;
    const r = ref(rtdb, `driverLocations/${driverId}`);
    const unsub = onValue(r, (snap) => {
      const v = snap.val();
      cb(v ? { lat: v.lat, lng: v.lng } : null);
    });
    return () => unsub();
  }, [driverId, cb]);
}
