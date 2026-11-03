"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { IndianRupee, MapPin, Navigation, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useHydrated";
import { listBookings } from "@/lib/firestore";

export default function DriverTrips() {
  const hydrated = useHydrated();
  const driver = useAppStore((s) => s.driver);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await listBookings();
        const mine = all.filter((b: any) => b.driverId === driver?.id);
        setTrips(mine.reverse());
      } catch {}
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [driver?.id]);

  const total = trips.reduce((s, t) => s + (t.fare || 0), 0);
  const earned = Math.round(total * 0.85);

  if (!hydrated) return <div className="p-4 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-brand-navy">My Trips & Earnings</h2>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-green">₹{earned}</div>
          <div className="text-xs text-gray-500">Total Earned (85%)</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-brand-blue">{trips.length}</div>
          <div className="text-xs text-gray-500">Trips</div>
        </Card>
      </div>
      {trips.length === 0 && (
        <Card className="p-6 text-center text-gray-500">No trips yet. Accept rides to see history here.</Card>
      )}
      {trips.map((t) => (
        <Card key={t.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-brand-green" />
                <span className="truncate">{t.pickup?.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <Navigation size={14} className="text-brand-blue" />
                <span className="truncate">{t.destination?.address}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <Clock size={12} /> {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString() : ""}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t.distanceKm?.toFixed?.(1) ?? t.distanceKm} km · {t.durationMin} min · {t.paymentMethod} · {t.paymentStatus}
              </div>
            </div>
            <div className="text-right ml-2">
              <div className="font-bold text-brand-green">₹{t.fare}</div>
              <Badge color={t.status === "completed" ? "green" : "blue"}>{t.status}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
