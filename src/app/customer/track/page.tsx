"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, MessageCircle, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { haversineKm } from "@/lib/googleMaps";
import MapView from "@/components/maps/MapView";
import { useDriverLocation } from "@/hooks/useLocationTracking";
import toast from "react-hot-toast";

export default function TrackRide() {
  const router = useRouter();
  const booking = useAppStore((s) => s.activeBooking);
  const [status, setStatus] = useState(booking?.status || "assigned");
  const [driverLoc, setDriverLoc] = useState<{ lat: number; lng: number } | null>(null);
  useDriverLocation(booking?.driverId || null, setDriverLoc);
  const driverDist = driverLoc && booking ? haversineKm(driverLoc, booking.status === "started" ? booking.destination.location : booking.pickup.location) : null;

  useEffect(() => {
    if (!booking) router.replace("/customer");
  }, [booking, router]);

  if (!booking) return null;

  const steps = ["assigned", "arriving", "started", "completed"];
  const idx = steps.indexOf(status);

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-brand-blue">
        <ArrowLeft size={18} /> Back
      </button>
      <Card className="p-4">
        <h2 className="font-bold text-brand-navy">Live Tracking</h2>
        <div className="mt-3 h-48 rounded-xl overflow-hidden">
          <MapView
            markers={[
              { lat: booking.pickup.location.lat, lng: booking.pickup.location.lng, label: "Pickup" },
              { lat: booking.destination.location.lat, lng: booking.destination.location.lng, label: "Drop" },
              ...(driverLoc ? [{ lat: driverLoc.lat, lng: driverLoc.lng, label: "Driver" }] : []),
            ]}
            className="w-full h-full"
            fallback={
              <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto text-brand-green" size={32} />
                  <p className="text-xs text-gray-500 mt-1">Live map (demo mode)</p>
                </div>
              </div>
            }
          />
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span>Pickup</span><span className="font-semibold">{booking.pickup.address}</span></div>
          <div className="flex justify-between"><span>Drop</span><span className="font-semibold">{booking.destination.address}</span></div>
          <div className="flex justify-between"><span>Fare</span><span className="font-bold text-brand-green">₹{booking.fare}</span></div>
          <div className="flex justify-between"><span>Distance</span><span>{booking.distanceKm.toFixed(1)} km</span></div>
          {driverLoc && (
            <div className="flex justify-between"><span>Driver → {booking.status === "started" ? "Drop" : "Pickup"}</span><span className="font-semibold text-brand-blue">{driverDist?.toFixed(1)} km {driverDist !== null ? `(live)` : ""}</span></div>
          )}
          {driverLoc && (
            <div className="text-xs text-gray-500 mt-1">Driver: {driverLoc.lat.toFixed(4)}, {driverLoc.lng.toFixed(4)}</div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">🛵</div>
          <div className="flex-1">
            <div className="font-bold">{(booking as any).driver?.name || "Driver"}</div>
            <div className="text-xs text-gray-500">{(booking as any).driver?.vehicle?.number}</div>
            <div className="text-xs text-gray-500">⭐ {(booking as any).driver?.rating}</div>
          </div>
          <a href={`tel:${(booking as any).driver?.phone}`} className="p-2 bg-green-100 rounded-xl"><Phone size={18} className="text-brand-green" /></a>
          <button className="p-2 bg-blue-100 rounded-xl"><MessageCircle size={18} className="text-brand-blue" /></button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between text-xs mb-2">
          {steps.map((s, i) => (
            <span key={s} className={i <= idx ? "text-brand-green font-bold" : "text-gray-400"}>{s}</span>
          ))}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-green transition-all" style={{ width: `${((idx + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="flex gap-2 mt-4">
          {status === "assigned" && (
            <Button className="flex-1" onClick={() => { setStatus("arriving"); toast("Driver on the way"); }}>Simulate Arriving</Button>
          )}
          {status === "arriving" && (
            <Button className="flex-1" onClick={() => { setStatus("started"); toast("Trip started"); }}>Simulate Start</Button>
          )}
          {status === "started" && (
            <Button className="flex-1" onClick={() => { setStatus("completed"); toast.success("Trip completed"); }}>Complete Trip</Button>
          )}
          {status === "completed" && (
            <Button className="flex-1" onClick={() => { useAppStore.getState().setActiveBooking(null); router.push("/customer"); }}>Done</Button>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-semibold mb-2">Rate your ride</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className="text-2xl" onClick={() => toast.success(`Rated ${n} stars`)}>⭐</button>
          ))}
        </div>
      </Card>
    </div>
  );
}
