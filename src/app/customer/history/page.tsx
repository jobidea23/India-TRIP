"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function RideHistory() {
  const [rides, setRides] = useState<any[]>([]);
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { demoGet } = require("@/lib/demo");
      setRides(demoGet("bookings"));
    } catch {}
  }, []);

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold text-brand-navy">Ride History</h2>
      {rides.length === 0 && (
        <Card className="p-6 text-center text-gray-500">No rides yet. Book your first ride!</Card>
      )}
      {rides.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-brand-navy capitalize">{r.category}</div>
              <div className="text-xs text-gray-500 mt-1">{r.pickup?.address} → {r.destination?.address}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString()} · {r.distanceKm?.toFixed?.(1) ?? r.distanceKm} km · {r.durationMin} min</div>
              <div className="text-xs text-gray-400">Payment: {r.paymentMethod} ({r.paymentStatus})</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-brand-green">₹{r.fare}</div>
              <Badge color={r.status === "completed" ? "green" : r.status === "cancelled" ? "red" : "blue"}>{r.status}</Badge>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => toast.success("Booking " + r.id)}>View details</Button>
            <Button size="sm" variant="ghost" onClick={() => toast.success("Receipt downloaded (demo)")}>Receipt</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
