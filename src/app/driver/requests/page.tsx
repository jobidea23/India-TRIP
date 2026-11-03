"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, Check, X, Clock, Phone, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useHydrated";
import { listenSearchingBookings, acceptBooking } from "@/lib/firestore";
import toast from "react-hot-toast";

export default function RideRequests() {
  const router = useRouter();
  const hydrated = useHydrated();
  const driver = useAppStore((s) => s.driver);
  const setActiveBooking = useAppStore((s) => s.setActiveBooking);
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !driver) router.replace("/driver/auth");
  }, [hydrated, driver, router]);

  useEffect(() => {
    if (!hydrated || !driver) return;
    const category = driver?.vehicle?.category || "";
    const unsub = listenSearchingBookings(category, (list) => {
      setRequests(list);
      setError(null);
    });
    return () => unsub();
  }, [hydrated, driver?.vehicle?.category, driver?.id]);

  const accept = async (r: any) => {
    try {
      await acceptBooking(r.id, driver!.id);
      const updated = { ...r, status: "assigned", driverId: driver!.id };
      setActiveBooking(updated);
      toast.success("Ride accepted! Navigate to pickup.");
      router.push("/driver/ride");
    } catch (e: any) {
      console.error("Accept error:", e);
      toast.error(e?.message || "Could not accept ride");
    }
  };

  const reject = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast("Request declined");
  };

  if (!hydrated) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (!driver) return null;

  if (driver.status !== "approved") {
    return (
      <div className="p-4">
        <Card className="p-6 text-center text-gray-500">
          Your account is <span className="font-semibold text-amber-600">{driver.status}</span>. You can accept rides once an admin approves your profile.
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-navy">Ride Requests</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${driver.online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {driver.online ? "Online" : "Offline"}
        </span>
      </div>

      {!driver.online && (
        <Card className="p-4 text-center text-gray-500 bg-amber-50 border-amber-200">
          You are offline. Go to Home and toggle Online to receive requests.
        </Card>
      )}

      {driver.online && requests.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">No ride requests right now</p>
          <p className="text-xs text-gray-400 mt-2">Waiting for new bookings... (real-time)</p>
          <p className="text-xs text-gray-400 mt-1">Make sure customer booked a {driver.vehicle?.category || ""} ride.</p>
        </Card>
      )}

      {requests.map((r) => (
        <Card key={r.id} className="p-5 space-y-4 border-2 border-brand-blue/20 hover:border-brand-blue/40 transition">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={20} className="text-brand-blue" />
              </div>
              <div>
                <div className="font-bold text-brand-navy">{r.customerName || "Customer"}</div>
                {r.customerPhone && (
                  <a href={`tel:${r.customerPhone}`} className="text-xs text-brand-blue flex items-center gap-1">
                    <Phone size={10} /> {r.customerPhone}
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-brand-green">₹{r.fare}</div>
              <div className="text-xs text-gray-500">{r.distanceKm?.toFixed?.(1) ?? r.distanceKm} km · {r.durationMin} min</div>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-brand-green" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">PICKUP</div>
                <div className="font-medium">{r.pickup?.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Navigation size={14} className="text-brand-blue" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">DROP</div>
                <div className="font-medium">{r.destination?.address}</div>
              </div>
            </div>
          </div>

          {/* Category + Payment */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge color="blue">{r.category}</Badge>
            <span>·</span>
            <span>{r.paymentMethod} ({r.paymentStatus})</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => accept(r)}>
              <Check size={16} className="inline mr-1" /> Accept
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => reject(r.id)}>
              <X size={16} className="inline mr-1" /> Reject
            </Button>
          </div>
        </Card>
      ))}

      {error && (
        <Card className="p-4 text-center text-red-600 bg-red-50">
          Error: {error}
        </Card>
      )}
    </div>
  );
}
