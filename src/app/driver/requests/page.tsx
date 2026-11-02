"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, Check, X, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { listenSearchingBookings, acceptBooking } from "@/lib/firestore";
import toast from "react-hot-toast";

export default function RideRequests() {
  const router = useRouter();
  const driver = useAppStore((s) => s.driver);
  const setActiveBooking = useAppStore((s) => s.setActiveBooking);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!driver?.vehicle?.category) return;
    const unsub = listenSearchingBookings(driver.vehicle.category, (list) => {
      setRequests(list);
    });
    return () => unsub();
  }, [driver?.vehicle?.category]);

  const accept = async (r: any) => {
    try {
      await acceptBooking(r.id, driver!.id);
      const updated = { ...r, status: "assigned", driverId: driver!.id };
      setActiveBooking(updated);
      toast.success("Ride accepted");
      router.push("/driver/ride");
    } catch (e: any) {
      toast.error(e?.message || "Could not accept");
    }
  };

  const reject = (id: string) => {
    // Rejection just removes from view; another driver can accept
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast("Request declined");
  };

  if (!driver) return null;
  if (driver.status !== "approved") {
    return (
      <div className="p-4">
        <Card className="p-6 text-center text-gray-500">
          Your account is <span className="font-semibold">{driver.status}</span>. You can accept rides once an admin approves your profile.
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold text-brand-navy">Ride Requests</h2>
      {!driver.online && (
        <Card className="p-4 text-center text-gray-500">You are offline. Go online to receive requests.</Card>
      )}
      {driver.online && requests.length === 0 && (
        <Card className="p-6 text-center text-gray-500">No requests right now. Waiting for new bookings...</Card>
      )}
      {requests.map((r) => (
        <Card key={r.id} className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <Badge color="blue">{r.category}</Badge>
              <div className="font-bold text-brand-navy mt-1">{r.customerName || r.customerId}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-brand-green">₹{r.fare}</div>
              <div className="text-xs text-gray-500">{r.distanceKm?.toFixed?.(1) ?? r.distanceKm} km</div>
            </div>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2"><MapPin size={14} className="text-brand-green" /> {r.pickup?.address}</div>
            <div className="flex items-center gap-2"><Navigation size={14} className="text-brand-blue" /> {r.destination?.address}</div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => accept(r)}><Check size={16} className="inline mr-1" />Accept</Button>
            <Button variant="danger" className="flex-1" onClick={() => reject(r.id)}><X size={16} className="inline mr-1" />Reject</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
